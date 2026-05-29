// Citation capture — queries 2 AI engines with 2 prompts per domain,
// parses cited URLs/domains from the responses, and stores raw events
// in `citation_events`. Round-robins through `companies` via a cursor
// so each cron invocation processes a small batch.
//
// Auth: shared secret in `x-cron-secret` (set by pg_cron caller).
import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

const BATCH_SIZE = 3;
const CALL_TIMEOUT_MS = 20_000;
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const ENGINES = [
  { engine: "chatgpt", model: "openai/gpt-5-mini" },
  { engine: "gemini", model: "google/gemini-3-flash-preview" },
] as const;

const PROMPTS = [
  {
    id: "what_does_v1",
    build: (d: string) =>
      `What does ${d} do? Briefly describe the company, its product, and link to any relevant sources you reference.`,
  },
  {
    id: "alternatives_v1",
    build: (d: string) =>
      `What are the best alternatives to ${d}? List the top options with links to their websites.`,
  },
] as const;

const URL_RE = /https?:\/\/[^\s)\]>"']+/gi;

function extractCitations(text: string, target: string) {
  const urls = Array.from(new Set((text.match(URL_RE) ?? []).map((u) => u.replace(/[.,;:!?]+$/, ""))));
  const domains = Array.from(
    new Set(
      urls
        .map((u) => {
          try {
            return new URL(u).hostname.replace(/^www\./, "").toLowerCase();
          } catch {
            return null;
          }
        })
        .filter((d): d is string => !!d),
    ),
  );
  const targetClean = target.replace(/^www\./, "").toLowerCase();
  const matched = domains.findIndex((d) => d === targetClean || d.endsWith(`.${targetClean}`));
  return {
    cited_urls: urls,
    cited_domains: domains,
    domain_was_cited: matched !== -1,
    cited_position: matched === -1 ? null : (matched + 1),
  };
}

async function callEngine(model: string, prompt: string) {
  const started = Date.now();
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const latency = Date.now() - started;
  if (!res.ok) {
    return { ok: false as const, latency, status: res.status, error: await res.text() };
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  return {
    ok: true as const,
    latency,
    text: data.choices?.[0]?.message?.content ?? "",
    tokens_in: data.usage?.prompt_tokens ?? null,
    tokens_out: data.usage?.completion_tokens ?? null,
  };
}

export const Route = createFileRoute("/api/public/hooks/capture-citations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.CRON_SECRET;
        if (!expected) return new Response("Server misconfigured", { status: 500 });
        const provided = request.headers.get("x-cron-secret");
        if (provided !== expected) return new Response("Forbidden", { status: 403 });
        if (!process.env.LOVABLE_API_KEY) {
          return new Response("LOVABLE_API_KEY missing", { status: 500 });
        }

        // Round-robin: pick next BATCH_SIZE domains alphabetically after the cursor.
        const { data: cursorRow } = await supabaseAdmin
          .from("citation_capture_cursor")
          .select("last_domain")
          .eq("id", 1)
          .maybeSingle();
        const lastDomain = cursorRow?.last_domain ?? "";

        let { data: domains } = await supabaseAdmin
          .from("companies")
          .select("domain")
          .gt("domain", lastDomain)
          .order("domain", { ascending: true })
          .limit(BATCH_SIZE);

        if (!domains || domains.length === 0) {
          // Wrap around
          const { data: wrap } = await supabaseAdmin
            .from("companies")
            .select("domain")
            .order("domain", { ascending: true })
            .limit(BATCH_SIZE);
          domains = wrap ?? [];
        }
        if (domains.length === 0) {
          return Response.json({ ok: true, processed: 0, message: "no domains" });
        }

        type CitationEventInsert = Database["public"]["Tables"]["citation_events"]["Insert"];

        // Fan out all (domain × engine × prompt) calls in parallel.
        // Workers handle 40+ concurrent subrequests fine; sequential blew the wall-time budget.
        const tasks: Array<{ domain: string; engine: string; model: string; promptId: string; promptText: string }> = [];
        for (const { domain } of domains) {
          for (const { engine, model } of ENGINES) {
            for (const prompt of PROMPTS) {
              tasks.push({ domain, engine, model, promptId: prompt.id, promptText: prompt.build(domain) });
            }
          }
        }

        const results = await Promise.all(tasks.map((t) => callEngine(t.model, t.promptText)));

        const events: CitationEventInsert[] = [];
        let okCount = 0;
        let errCount = 0;
        results.forEach((result, i) => {
          const t = tasks[i];
          const base = {
            domain_queried: t.domain,
            engine: t.engine,
            model_version: t.model,
            prompt_template_id: t.promptId,
            prompt_text: t.promptText,
            latency_ms: result.latency,
          };
          if (!result.ok) {
            errCount++;
            events.push({ ...base, error: `HTTP ${result.status}: ${String(result.error).slice(0, 500)}` });
            return;
          }
          const parsed = extractCitations(result.text, t.domain);
          okCount++;
          events.push({
            ...base,
            response_text: result.text,
            response_hash: createHash("sha256").update(result.text).digest("hex"),
            cited_domains: parsed.cited_domains,
            cited_urls: parsed.cited_urls,
            domain_was_cited: parsed.domain_was_cited,
            cited_position: parsed.cited_position,
            tokens_in: result.tokens_in,
            tokens_out: result.tokens_out,
          });
        });

        if (events.length > 0) {
          const { error } = await supabaseAdmin.from("citation_events").insert(events);
          if (error) {
            console.error("[capture-citations] insert error", error);
            return new Response(`DB error: ${error.message}`, { status: 500 });
          }
        }

        const lastProcessed = domains[domains.length - 1].domain;
        await supabaseAdmin
          .from("citation_capture_cursor")
          .update({ last_domain: lastProcessed, last_run_at: new Date().toISOString() })
          .eq("id", 1);

        return Response.json({
          ok: true,
          domains_processed: domains.length,
          events_written: events.length,
          succeeded: okCount,
          failed: errCount,
          cursor: lastProcessed,
        });
      },
    },
  },
});
