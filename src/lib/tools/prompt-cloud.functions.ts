// Prompt Cloud — a better AnswerThePublic for the AI-cited web.
//
// AnswerThePublic expands a seed into Google autocomplete permutations
// (questions, prepositions, comparisons, A–Z). It optimizes for search-box
// completions — a world that's shrinking.
//
// Prompt Cloud expands a seed into the prompts real buyers type into
// ChatGPT / Perplexity / Claude / Gemini, then annotates each with:
//   - intent (informational | commercial | comparison | navigational | transactional)
//   - format (question | comparison | preposition | "vs" | listicle | how-to)
//   - citation difficulty 0-100 (how entrenched the incumbent citation graph is)
//   - dominant incumbent domain that AI engines currently quote
//
// One LLM call. Grounded via Lovable AI Gateway (google/gemini-2.5-flash).

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const InputSchema = z.object({
  seed: z.string().min(2).max(120),
  audience: z.string().max(120).optional(),
});

export type PromptFormat =
  | "question"
  | "comparison"
  | "preposition"
  | "vs"
  | "listicle"
  | "how-to"
  | "definition";

export type PromptIntent =
  | "informational"
  | "commercial"
  | "comparison"
  | "navigational"
  | "transactional";

export type CloudPrompt = {
  prompt: string;
  format: PromptFormat;
  intent: PromptIntent;
  difficulty: number; // 0-100
  incumbent: string; // dominant cited domain, e.g. "wikipedia.org" or "reddit.com"
  angle: string; // one sentence: how to earn the citation
};

export type PromptCloud = {
  seed: string;
  audience: string;
  prompts: CloudPrompt[];
  buckets: Record<PromptFormat, CloudPrompt[]>;
  incumbentShare: Array<{ domain: string; hits: number }>;
  quickWins: CloudPrompt[]; // difficulty <= 40, sorted by intent value
  summary: string; // 40-60 word answer-first analysis
};

function extractJson<T>(text: string): T | null {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const first = cleaned.search(/[[{]/);
  if (first === -1) return null;
  const opener = cleaned[first];
  const closer = opener === "{" ? "}" : "]";
  const last = cleaned.lastIndexOf(closer);
  if (last <= first) return null;
  try {
    return JSON.parse(cleaned.slice(first, last + 1)) as T;
  } catch {
    return null;
  }
}

async function callLLM(system: string, user: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error("Rate limited by the AI gateway. Try again in a minute.");
    if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 240)}`);
  }
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? "";
}

const ALL_FORMATS: PromptFormat[] = [
  "question",
  "comparison",
  "preposition",
  "vs",
  "listicle",
  "how-to",
  "definition",
];

const ALL_INTENTS: PromptIntent[] = [
  "informational",
  "commercial",
  "comparison",
  "navigational",
  "transactional",
];

function normDomain(raw: string): string {
  return String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

export const runPromptCloud = createServerFn({ method: "POST" })
  .inputValidator((raw) => InputSchema.parse(raw))
  .handler(async ({ data }): Promise<PromptCloud> => {
    const seed = data.seed.trim();
    const audience = (data.audience ?? "").trim() || "any buyer";

    const system = `You are a Generative Engine Optimization researcher.

For a seed topic, you produce the 40 prompts a real buyer would type into ChatGPT, Perplexity, Claude, or Gemini around that topic. This is the AI-native replacement for Google autocomplete.

For each prompt you supply:
- "format": one of ${ALL_FORMATS.map((f) => `"${f}"`).join(", ")}.
- "intent": one of ${ALL_INTENTS.map((i) => `"${i}"`).join(", ")}.
- "difficulty": 0-100. 100 = Wikipedia or a major publisher owns the AI answer today (extremely hard to displace). 0 = weak or missing incumbent (easy to earn the citation).
- "incumbent": the single domain (bare host, no scheme) most likely to be quoted by AI today. Use "reddit.com" when Perplexity-style community answers dominate, "wikipedia.org" for encyclopedic queries, a brand domain when a vendor owns the answer, or "none" when there is no clear incumbent.
- "angle": one short sentence describing the specific content angle that would displace the incumbent (data, format, freshness, entity).

Coverage rules:
- Cover all 7 formats. At least 3 "question", 3 "comparison", 3 "preposition", 3 "vs", 3 "listicle", 3 "how-to", 3 "definition".
- Mix intents. At least 6 commercial-or-transactional prompts.
- Prompts are phrased exactly as a person would type them into ChatGPT — full sentences, no keyword-stuffing.

Finish with a 40-60 word "summary" that answers, in one paragraph, where this topic's biggest AI-citation opportunity is right now.

Reply with pure JSON:
{
  "summary": "...",
  "prompts": [ { "prompt": "...", "format": "...", "intent": "...", "difficulty": 0-100, "incumbent": "...", "angle": "..." } ]
}`;

    const user = `Seed topic: "${seed}"
Audience: ${audience}
Return exactly 40 prompts.`;

    const raw = await callLLM(system, user);
    const parsed = extractJson<{ summary?: string; prompts?: CloudPrompt[] }>(raw);
    const rawPrompts = Array.isArray(parsed?.prompts) ? parsed!.prompts! : [];

    const prompts: CloudPrompt[] = rawPrompts.slice(0, 60).map((p) => {
      const fmt = ALL_FORMATS.includes(p.format as PromptFormat) ? (p.format as PromptFormat) : "question";
      const intent = ALL_INTENTS.includes(p.intent as PromptIntent)
        ? (p.intent as PromptIntent)
        : "informational";
      return {
        prompt: String(p.prompt ?? "").slice(0, 240),
        format: fmt,
        intent,
        difficulty: Math.max(0, Math.min(100, Math.round(Number(p.difficulty) || 50))),
        incumbent: normDomain(p.incumbent ?? "none") || "none",
        angle: String(p.angle ?? "").slice(0, 240),
      };
    }).filter((p) => p.prompt.length > 0);

    if (prompts.length === 0) {
      throw new Error("The AI returned no prompts. Try a broader seed.");
    }

    const buckets = ALL_FORMATS.reduce((acc, f) => {
      acc[f] = prompts.filter((p) => p.format === f);
      return acc;
    }, {} as Record<PromptFormat, CloudPrompt[]>);

    const incumbentCount = new Map<string, number>();
    for (const p of prompts) {
      if (p.incumbent && p.incumbent !== "none") {
        incumbentCount.set(p.incumbent, (incumbentCount.get(p.incumbent) ?? 0) + 1);
      }
    }
    const incumbentShare = Array.from(incumbentCount.entries())
      .map(([domain, hits]) => ({ domain, hits }))
      .sort((a, b) => b.hits - a.hits)
      .slice(0, 8);

    const intentRank: Record<PromptIntent, number> = {
      transactional: 5,
      commercial: 4,
      comparison: 3,
      navigational: 2,
      informational: 1,
    };
    const quickWins = prompts
      .filter((p) => p.difficulty <= 40)
      .sort((a, b) => intentRank[b.intent] - intentRank[a.intent] || a.difficulty - b.difficulty)
      .slice(0, 8);

    return {
      seed,
      audience,
      prompts,
      buckets,
      incumbentShare,
      quickWins,
      summary: String(parsed?.summary ?? "").slice(0, 800),
    };
  });
