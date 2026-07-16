// GEO Explorer — the Ubersuggest-equivalent for Generative Engine Optimization.
// Four modes, one server function. All powered by Lovable AI Gateway
// (google/gemini-2.5-flash) with web search grounding. Free.
//
// - "domain"  → citation snapshot for a domain across category prompts
// - "prompts" → AI-prompt ideas around a seed keyword, with intent + difficulty
// - "serp"    → which domains an AI engine cites for a specific prompt (the "AI SERP")
// - "brief"   → answer-first content brief targeting a prompt

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const InputSchema = z.discriminatedUnion("mode", [
  z.object({ mode: z.literal("domain"), domain: z.string().min(3).max(253), category: z.string().max(120).optional() }),
  z.object({ mode: z.literal("prompts"), seed: z.string().min(2).max(120) }),
  z.object({ mode: z.literal("serp"), prompt: z.string().min(3).max(280) }),
  z.object({ mode: z.literal("brief"), prompt: z.string().min(3).max(280), domain: z.string().max(253).optional() }),
]);

export type PromptIdea = {
  prompt: string;
  intent: "informational" | "commercial" | "comparison" | "navigational";
  difficulty: number; // 0-100
  why: string;
};

export type SerpCitation = {
  domain: string;
  url?: string;
  quote?: string;
};

export type DomainSnapshot = {
  domain: string;
  category: string;
  scannedPrompts: string[];
  citedOn: Array<{ prompt: string; cited: boolean; competitors: string[] }>;
  citationShare: number; // 0-100
  topCompetitors: Array<{ domain: string; hits: number }>;
  fixes: string[]; // 3-5 concrete fixes
};

export type ContentBrief = {
  title: string;
  answerFirstParagraph: string; // 40-60 words
  headings: Array<{ h: 2 | 3; text: string; note: string }>;
  faqs: Array<{ q: string; a: string }>;
  citableClaims: string[];
  jsonLdTypes: string[];
};

export type ExplorerResult =
  | { mode: "domain"; data: DomainSnapshot }
  | { mode: "prompts"; seed: string; data: PromptIdea[] }
  | { mode: "serp"; prompt: string; engineAnswer: string; citations: SerpCitation[] }
  | { mode: "brief"; prompt: string; data: ContentBrief };

function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

function extractJson<T>(text: string): T | null {
  if (!text) return null;
  // Strip markdown fences
  const cleaned = text
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
  // Grab from first { or [ to matching last brace
  const firstBrace = cleaned.search(/[[{]/);
  if (firstBrace === -1) return null;
  const opener = cleaned[firstBrace];
  const closer = opener === "{" ? "}" : "]";
  const lastCloser = cleaned.lastIndexOf(closer);
  if (lastCloser <= firstBrace) return null;
  const slice = cleaned.slice(firstBrace, lastCloser + 1);
  try {
    return JSON.parse(slice) as T;
  } catch {
    return null;
  }
}

async function callLLM(system: string, user: string, opts: { json?: boolean } = {}): Promise<string> {
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
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
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

// -------- Prompts ------------------------------------------------------------

async function runPrompts(seed: string): Promise<PromptIdea[]> {
  const system = `You are a Generative Engine Optimization researcher. When given a seed topic, you list the 12 real questions and prompts a buyer would ask an AI assistant (ChatGPT, Perplexity, Claude, Gemini) around that topic. You classify each by intent and rate citation difficulty 0-100, where 100 = dominated by Wikipedia/major publishers (very hard to earn a new citation) and 0 = weak incumbents (easy). Reply with pure JSON only.`;
  const user = `Seed topic: "${seed}"

Return JSON with this exact shape:
{
  "prompts": [
    { "prompt": "…", "intent": "informational|commercial|comparison|navigational", "difficulty": 0-100, "why": "one short sentence explaining the difficulty score" }
  ]
}

Rules:
- 12 prompts.
- Mix informational, commercial, comparison, and navigational intents.
- Prompts are phrased as a person would type them into ChatGPT.
- "why" must reference the incumbent citation graph (e.g. "Wikipedia dominates", "no strong incumbent, listicle terrain", "Reddit-heavy on Perplexity").`;

  const raw = await callLLM(system, user, { json: true });
  const parsed = extractJson<{ prompts: PromptIdea[] }>(raw);
  const list = parsed?.prompts ?? [];
  return list.slice(0, 12).map((p) => ({
    prompt: String(p.prompt ?? "").slice(0, 240),
    intent: (["informational", "commercial", "comparison", "navigational"] as const).includes(p.intent as never)
      ? p.intent
      : "informational",
    difficulty: Math.max(0, Math.min(100, Math.round(Number(p.difficulty) || 50))),
    why: String(p.why ?? "").slice(0, 240),
  }));
}

// -------- SERP ---------------------------------------------------------------

async function runSerp(prompt: string): Promise<{ engineAnswer: string; citations: SerpCitation[] }> {
  const system = `You are an AI search engine like Perplexity. Answer the user's question using current web information. Cite each factual claim with a URL. After the answer, list ALL sources you used as a JSON array in a fenced code block labelled "citations", with objects { "domain": "example.com", "url": "https://…", "quote": "the specific claim you took from this source" }.`;
  const raw = await callLLM(system, prompt);
  const answerOnly = raw.replace(/```citations[\s\S]*?```/i, "").trim();

  // Try structured citations first
  const citationsBlock = raw.match(/```citations\s*([\s\S]*?)```/i)?.[1] ?? "";
  const parsed = extractJson<SerpCitation[]>(citationsBlock) ?? [];
  let citations: SerpCitation[] = Array.isArray(parsed)
    ? parsed.map((c) => ({
        domain: normalizeDomain(String(c.domain ?? c.url ?? "")),
        url: c.url ? String(c.url) : undefined,
        quote: c.quote ? String(c.quote).slice(0, 240) : undefined,
      })).filter((c) => c.domain)
    : [];

  // Fallback: sniff URLs from the whole response
  if (citations.length === 0) {
    const urlRe = /https?:\/\/[^\s)\]}"']+/gi;
    const urls = Array.from(new Set((raw.match(urlRe) ?? []).map((u) => u.replace(/[.,;)]+$/, ""))));
    citations = urls.slice(0, 12).map((u) => ({ domain: normalizeDomain(u), url: u }));
  }

  // Dedupe by domain, keep first occurrence
  const seen = new Set<string>();
  citations = citations.filter((c) => {
    if (seen.has(c.domain)) return false;
    seen.add(c.domain);
    return true;
  }).slice(0, 12);

  return { engineAnswer: answerOnly.slice(0, 2400), citations };
}

// -------- Domain snapshot ----------------------------------------------------

async function inferCategory(domain: string): Promise<string> {
  const system = `You infer the primary product category of a website in 3-6 words based on the domain name and any prior knowledge. Reply with just the category, no punctuation.`;
  const raw = await callLLM(system, `Domain: ${domain}\nCategory:`);
  return raw.trim().replace(/["'.]/g, "").slice(0, 60) || "product or service";
}

async function generateCategoryPrompts(domain: string, category: string): Promise<string[]> {
  const system = `You generate the 6 highest-intent prompts a buyer would type into ChatGPT or Perplexity when researching this category. Prefer commercial and comparison intent. Reply with pure JSON: {"prompts":["…", …]}.`;
  const raw = await callLLM(
    system,
    `Category: ${category}\nA representative domain in this category: ${domain}\nReturn 6 buyer prompts.`,
    { json: true }
  );
  const parsed = extractJson<{ prompts: string[] }>(raw);
  return (parsed?.prompts ?? []).slice(0, 6).map((p) => String(p).slice(0, 240)).filter(Boolean);
}

async function runDomain(rawDomain: string, categoryHint?: string): Promise<DomainSnapshot> {
  const domain = normalizeDomain(rawDomain);
  const category = (categoryHint?.trim() || (await inferCategory(domain))).slice(0, 80);
  const prompts = await generateCategoryPrompts(domain, category);

  const citedOn: DomainSnapshot["citedOn"] = [];
  const competitorCount = new Map<string, number>();

  for (const prompt of prompts) {
    const { citations } = await runSerp(prompt);
    const cited = citations.some((c) => c.domain === domain);
    const competitors = citations
      .map((c) => c.domain)
      .filter((d) => d && d !== domain);
    for (const c of competitors) competitorCount.set(c, (competitorCount.get(c) ?? 0) + 1);
    citedOn.push({ prompt, cited, competitors: Array.from(new Set(competitors)).slice(0, 5) });
  }

  const citationShare = Math.round((citedOn.filter((c) => c.cited).length / Math.max(1, citedOn.length)) * 100);
  const topCompetitors = Array.from(competitorCount.entries())
    .map(([d, hits]) => ({ domain: d, hits }))
    .sort((a, b) => b.hits - a.hits)
    .slice(0, 5);

  // Generate 3-5 concrete fixes based on the gap
  const fixesSystem = `You are a GEO strategist. Given a domain, its category, its current citation share on 6 buyer prompts, and the top competing domains that ARE cited, list 4 concrete on-page fixes the domain should ship this week to close the gap. Each fix is one sentence, actionable, technical where relevant. Reply with pure JSON: {"fixes":["…", …]}.`;
  const fixesUser = `Domain: ${domain}
Category: ${category}
Citation share: ${citationShare}%
Cited on: ${citedOn.filter((c) => c.cited).map((c) => c.prompt).join(" | ") || "(none)"}
Missed on: ${citedOn.filter((c) => !c.cited).map((c) => c.prompt).join(" | ") || "(none)"}
Top cited competitors: ${topCompetitors.map((c) => `${c.domain} (${c.hits})`).join(", ") || "(none observed)"}`;
  const fixesRaw = await callLLM(fixesSystem, fixesUser, { json: true });
  const fixes = extractJson<{ fixes: string[] }>(fixesRaw)?.fixes?.slice(0, 5).map((f) => String(f).slice(0, 280)) ?? [];

  return {
    domain,
    category,
    scannedPrompts: prompts,
    citedOn,
    citationShare,
    topCompetitors,
    fixes,
  };
}

// -------- Content brief ------------------------------------------------------

async function runBrief(prompt: string, domain?: string): Promise<ContentBrief> {
  const system = `You produce an answer-first content brief engineered for AI citation. The page must:
- Answer the query in the first 40-60 words (front-loaded — LLMs cite the first 30% of the page 44% of the time).
- Use 5-7 H2 sections, each a natural-language question with a 40-60 word direct answer under it.
- Include 3 FAQ entries suitable for FAQPage JSON-LD.
- List 4-6 citable, verifiable claims (with a stat, date, or named entity) so the page becomes quote-worthy.
- Recommend the JSON-LD types to ship.
Reply with pure JSON only.`;
  const user = `Target AI prompt: "${prompt}"
${domain ? `Publishing domain (for voice): ${domain}` : ""}

Return JSON:
{
  "title": "…",
  "answerFirstParagraph": "40-60 words",
  "headings": [ { "h": 2, "text": "question phrasing", "note": "what to cover in 40-60 words" } ],
  "faqs": [ { "q": "…", "a": "40-60 words" } ],
  "citableClaims": [ "each with a stat or named entity" ],
  "jsonLdTypes": [ "Article", "FAQPage", "…" ]
}`;

  const raw = await callLLM(system, user, { json: true });
  const parsed = extractJson<ContentBrief>(raw);
  if (!parsed) throw new Error("The AI returned an unparseable brief. Try again.");
  return {
    title: String(parsed.title ?? "").slice(0, 200),
    answerFirstParagraph: String(parsed.answerFirstParagraph ?? "").slice(0, 800),
    headings: (parsed.headings ?? []).slice(0, 8).map((h) => ({
      h: h.h === 3 ? 3 : 2,
      text: String(h.text ?? "").slice(0, 200),
      note: String(h.note ?? "").slice(0, 400),
    })),
    faqs: (parsed.faqs ?? []).slice(0, 5).map((f) => ({
      q: String(f.q ?? "").slice(0, 200),
      a: String(f.a ?? "").slice(0, 600),
    })),
    citableClaims: (parsed.citableClaims ?? []).slice(0, 8).map((c) => String(c).slice(0, 240)),
    jsonLdTypes: (parsed.jsonLdTypes ?? []).slice(0, 6).map((t) => String(t).slice(0, 40)),
  };
}

// -------- Public entry point -------------------------------------------------

export const runGeoExplorer = createServerFn({ method: "POST" })
  .inputValidator((raw) => InputSchema.parse(raw))
  .handler(async ({ data }): Promise<ExplorerResult> => {
    if (data.mode === "prompts") {
      const list = await runPrompts(data.seed);
      return { mode: "prompts", seed: data.seed, data: list };
    }
    if (data.mode === "serp") {
      const r = await runSerp(data.prompt);
      return { mode: "serp", prompt: data.prompt, ...r };
    }
    if (data.mode === "brief") {
      const brief = await runBrief(data.prompt, data.domain);
      return { mode: "brief", prompt: data.prompt, data: brief };
    }
    const snap = await runDomain(data.domain, data.category);
    return { mode: "domain", data: snap };
  });
