import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  domain: z.string().min(3).max(253),
  query: z.string().min(3).max(280),
});

export type EngineResult = {
  engine: string;
  cited: boolean;
  mentions: number;
  answer: string;
  citations: string[];
  error?: string;
};

const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";

function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}

async function askEngine(engineLabel: string, model: string, systemHint: string, query: string): Promise<Omit<EngineResult, "engine" | "cited" | "mentions">> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return { answer: "", citations: [], error: "LOVABLE_API_KEY not configured" };

  try {
    const res = await fetch(AI_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemHint },
          { role: "user", content: query },
        ],
      }),
    });
    if (!res.ok) {
      const txt = await res.text();
      return { answer: "", citations: [], error: `${res.status}: ${txt.slice(0, 200)}` };
    }
    const json = await res.json();
    const answer: string = json?.choices?.[0]?.message?.content ?? "";
    const urlRe = /https?:\/\/[^\s)\]}"']+/gi;
    const citations = Array.from(new Set((answer.match(urlRe) ?? []).map((u) => u.replace(/[.,;)]+$/, ""))));
    return { answer, citations };
  } catch (e) {
    return { answer: "", citations: [], error: e instanceof Error ? e.message : "fetch failed" };
  }
}

export const checkAiVisibility = createServerFn({ method: "POST" })
  .inputValidator((raw) => InputSchema.parse(raw))
  .handler(async ({ data }) => {
    const domain = normalizeDomain(data.domain);
    const q = data.query.trim();

    const engines: Array<{ label: string; model: string; hint: string }> = [
      {
        label: "Gemini (web-grounded)",
        model: "google/gemini-2.5-flash",
        hint: "You are an AI search assistant. Answer the user's question using current web information. Cite sources with full URLs when possible.",
      },
      {
        label: "GPT-5 mini",
        model: "openai/gpt-5-mini",
        hint: "You are an AI search assistant. Answer factually and cite specific sources with URLs where possible.",
      },
    ];

    const results: EngineResult[] = [];
    for (const e of engines) {
      const r = await askEngine(e.label, e.model, e.hint, q);
      const answerLc = (r.answer || "").toLowerCase();
      const mentions = domain ? (answerLc.match(new RegExp(domain.replace(/\./g, "\\."), "g")) ?? []).length : 0;
      const citedInLinks = r.citations.some((u) => u.toLowerCase().includes(domain));
      results.push({
        engine: e.label,
        cited: citedInLinks || mentions > 0,
        mentions,
        answer: r.answer,
        citations: r.citations,
        error: r.error,
      });
    }

    const score = Math.round(
      (results.filter((r) => r.cited).length / Math.max(1, results.length)) * 100
    );

    return { domain, query: q, score, results, checkedAt: new Date().toISOString() };
  });
