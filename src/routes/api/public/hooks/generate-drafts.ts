// Nightly cron — picks open content briefs, generates AI drafts via Lovable
// AI Gateway, stores them as content_drafts (status=draft), bumps brief to
// "in_progress". Quality gate runs in the human-review UI; this hook only
// produces the draft.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MODEL = "google/gemini-2.5-pro";
const SYSTEM =
  "You write for citation.is, a GEO (Generative Engine Optimization) consultancy. Voice: direct, technical, opinionated, no marketing fluff. Output STRICT JSON only — no markdown fence, no preface — with keys: title (string, <=70 chars), body_html (string, 700-1200 words, semantic HTML with <h2>, <h3>, <p>, <ul>, <li> — no <html>/<body>/<head>), excerpt (string, <=160 chars).";

type Brief = {
  id: string;
  title: string;
  topic: string | null;
  intent: string | null;
  audience: string | null;
  keywords: string[] | null;
  content_type: string | null;
  target_word_count: number | null;
};

async function generateDraft(brief: Brief, apiKey: string) {
  const user = [
    `Title seed: ${brief.title}`,
    brief.topic ? `Topic: ${brief.topic}` : null,
    brief.intent ? `Intent: ${brief.intent}` : null,
    brief.audience ? `Audience: ${brief.audience}` : null,
    brief.content_type ? `Format: ${brief.content_type}` : null,
    brief.keywords?.length ? `Keywords: ${brief.keywords.join(", ")}` : null,
    brief.target_word_count ? `Target length: ~${brief.target_word_count} words` : null,
    "Return JSON only.",
  ]
    .filter(Boolean)
    .join("\n");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 3500,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(`AI gateway ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = (data.choices?.[0]?.message?.content ?? "").trim();
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned) as { title?: string; body_html?: string; excerpt?: string };
  if (!parsed.title || !parsed.body_html) throw new Error("AI returned invalid shape");
  return parsed;
}

export const Route = createFileRoute("/api/public/hooks/generate-drafts")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.CRON_SECRET;
        if (!expected) return new Response("Server misconfigured", { status: 500 });
        const provided = request.headers.get("x-cron-secret");
        if (provided !== expected) return new Response("Forbidden", { status: 403 });

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) return new Response("LOVABLE_API_KEY missing", { status: 500 });

        // Pick the next 2 open briefs (FIFO).
        const { data: briefs, error } = await supabaseAdmin
          .from("content_briefs")
          .select("id, title, topic, intent, audience, keywords, content_type, target_word_count, status")
          .eq("status", "open")
          .order("created_at", { ascending: true })
          .limit(2);

        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const results: Array<{ brief_id: string; ok: boolean; draft_id?: string; error?: string }> = [];

        for (const brief of (briefs ?? []) as Brief[]) {
          try {
            const draft = await generateDraft(brief, apiKey);
            const { data: inserted, error: insErr } = await supabaseAdmin
              .from("content_drafts")
              .insert({
                brief_id: brief.id,
                title: draft.title!.slice(0, 300),
                body_html: draft.body_html!,
                status: "draft",
              })
              .select("id")
              .single();
            if (insErr || !inserted) throw new Error(insErr?.message ?? "insert failed");

            await supabaseAdmin
              .from("content_briefs")
              .update({ status: "in_progress" })
              .eq("id", brief.id);

            results.push({ brief_id: brief.id, ok: true, draft_id: inserted.id });
          } catch (err) {
            results.push({
              brief_id: brief.id,
              ok: false,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        return new Response(
          JSON.stringify({
            ok: true,
            picked: results.length,
            succeeded: results.filter((r) => r.ok).length,
            results,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
