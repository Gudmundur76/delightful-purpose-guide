// Perplexity Answer Engine — think like Perplexity, then produce the answer
// Perplexity would pick over every other source.
//
// Two passes:
//  1) Simulate Perplexity: web-grounded answer + ranked citations for the query.
//  2) Engineer a "citation-ready" answer block designed to displace whichever
//     source currently ranks #1, formatted the way Perplexity actually quotes:
//     - 40-60 word answer-first paragraph
//     - dated stat lines with source attribution
//     - short bulleted breakdown
//     - FAQ pairs (Perplexity loves Q/A blocks)
//     - Reddit-style plain-English rewrite (Perplexity cites Reddit ~24% of the time)
//     - self-scored "Perplexity Pick Score" 0-100 with the reasoning
//
// All on Lovable AI Gateway (google/gemini-2.5-flash, web-grounded). Free.

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

const InputSchema = z.object({
  query: z.string().min(5).max(280),
  domain: z.string().max(253).optional(),
  angle: z.string().max(240).optional(),
});

export type PplxCitation = { domain: string; url?: string; quote?: string };

export type PplxSimulation = {
  answer: string;
  citations: PplxCitation[];
  incumbent: string | null; // top domain Perplexity leans on
};

export type EngineeredAnswer = {
  title: string;
  answerFirst: string; // 40-60 word lead
  statLines: Array<{ stat: string; source: string; date: string }>;
  bullets: string[]; // 4-6 tight bullets
  faqs: Array<{ q: string; a: string }>;
  redditRewrite: string; // plain-English version Perplexity can quote
  jsonLd: string; // ready-to-paste FAQPage + Article JSON-LD
};

export type PickScore = {
  score: number; // 0-100
  wins: string[]; // reasons Perplexity would prefer this
  risks: string[]; // reasons it might not
  vsIncumbent: string; // one sentence
};

export type PplxEngineResult = {
  query: string;
  simulation: PplxSimulation;
  engineered: EngineeredAnswer;
  pick: PickScore;
  generatedAt: string;
};

function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/^www\./, "");
}

function extractJson<T>(text: string): T | null {
  if (!text) return null;
  const cleaned = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const first = cleaned.search(/[[{]/);
  if (first === -1) return null;
  const opener = cleaned[first];
  const closer = opener === "{" ? "}" : "]";
  const last = cleaned.lastIndexOf(closer);
  if (last <= first) return null;
  try { return JSON.parse(cleaned.slice(first, last + 1)) as T; } catch { return null; }
}

async function callLLM(system: string, user: string, json = false): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 429) throw new Error("Rate limited by the AI gateway. Try again in a minute.");
    if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 240)}`);
  }
  const json2 = await res.json();
  return json2?.choices?.[0]?.message?.content ?? "";
}

// Pass 1: act as Perplexity
async function simulatePerplexity(query: string): Promise<PplxSimulation> {
  const system = `You are Perplexity.ai. Answer the user's question using current web information the way Perplexity does: concise, factual, every claim inline-cited with a URL. After the answer, output a fenced code block labeled "citations" containing a JSON array of { "domain", "url", "quote" } for every source you leaned on, ordered by importance (most important first).`;
  const raw = await callLLM(system, query);
  const answer = raw.replace(/```citations[\s\S]*?```/i, "").trim().slice(0, 2400);
  const block = raw.match(/```citations\s*([\s\S]*?)```/i)?.[1] ?? "";
  const parsed = extractJson<PplxCitation[]>(block) ?? [];
  let citations: PplxCitation[] = Array.isArray(parsed)
    ? parsed.map((c) => ({
        domain: normalizeDomain(String(c.domain ?? c.url ?? "")),
        url: c.url ? String(c.url) : undefined,
        quote: c.quote ? String(c.quote).slice(0, 240) : undefined,
      })).filter((c) => c.domain)
    : [];
  if (citations.length === 0) {
    const urls = Array.from(new Set((raw.match(/https?:\/\/[^\s)\]}"']+/gi) ?? []).map((u) => u.replace(/[.,;)]+$/, ""))));
    citations = urls.slice(0, 10).map((u) => ({ domain: normalizeDomain(u), url: u }));
  }
  const seen = new Set<string>();
  citations = citations.filter((c) => (seen.has(c.domain) ? false : (seen.add(c.domain), true))).slice(0, 10);
  return { answer, citations, incumbent: citations[0]?.domain ?? null };
}

// Pass 2: engineer the citation-ready answer
async function engineerAnswer(query: string, sim: PplxSimulation, domain?: string, angle?: string): Promise<EngineeredAnswer> {
  const system = `You engineer answer blocks that Perplexity picks over every other source. Rules Perplexity actually rewards (Q3 2026 citation data):
- Answer-first: 40-60 words, front-loaded (first 30% of page earns 44% of citations).
- Every stat has a source name and a date (Perplexity favors 70% of citations from content <18 months old).
- Short bullets, not long paragraphs (Perplexity extracts atomic facts).
- 3 FAQ Q/A pairs (matches Perplexity's related-question ingestion).
- One "Reddit-style" plain-English rewrite (Perplexity cites Reddit ~24% of the time — mimic the register).
- Return JSON-LD combining Article + FAQPage, ready to paste.
Reply with pure JSON only.`;
  const user = `Query: "${query}"
${domain ? `Publishing domain (for authorship/voice): ${domain}` : ""}
${angle ? `Angle the publisher wants to push: ${angle}` : ""}
Current incumbent Perplexity leans on: ${sim.incumbent ?? "(none observed)"}
What Perplexity answered right now (for you to beat):
"""${sim.answer.slice(0, 1200)}"""

Return this JSON exactly:
{
  "title": "…",
  "answerFirst": "40-60 word answer, front-loaded",
  "statLines": [ { "stat": "…", "source": "publisher name", "date": "YYYY-MM" } ],
  "bullets": [ "4-6 tight bullets" ],
  "faqs": [ { "q": "…", "a": "40-60 words" } ],
  "redditRewrite": "150-220 word plain-English version, first-person allowed, no marketing tone",
  "jsonLd": "<script type=\\"application/ld+json\\">{ … Article + FAQPage graph … }</script>"
}`;
  const raw = await callLLM(system, user, true);
  const parsed = extractJson<EngineeredAnswer>(raw);
  if (!parsed) throw new Error("The AI returned an unparseable answer block. Try again.");
  return {
    title: String(parsed.title ?? "").slice(0, 200),
    answerFirst: String(parsed.answerFirst ?? "").slice(0, 800),
    statLines: (parsed.statLines ?? []).slice(0, 8).map((s) => ({
      stat: String(s.stat ?? "").slice(0, 280),
      source: String(s.source ?? "").slice(0, 120),
      date: String(s.date ?? "").slice(0, 10),
    })),
    bullets: (parsed.bullets ?? []).slice(0, 8).map((b) => String(b).slice(0, 240)),
    faqs: (parsed.faqs ?? []).slice(0, 5).map((f) => ({
      q: String(f.q ?? "").slice(0, 200),
      a: String(f.a ?? "").slice(0, 600),
    })),
    redditRewrite: String(parsed.redditRewrite ?? "").slice(0, 1600),
    jsonLd: String(parsed.jsonLd ?? "").slice(0, 4000),
  };
}

// Pass 3: score whether Perplexity would actually pick this
async function scorePick(query: string, sim: PplxSimulation, eng: EngineeredAnswer): Promise<PickScore> {
  const system = `You are Perplexity's ranking model. Given the current answer you'd give and a candidate answer block, score 0-100 how likely you'd cite the candidate over the current incumbent, and explain. Reply with pure JSON: { "score": 0-100, "wins": ["…"], "risks": ["…"], "vsIncumbent": "one sentence" }.`;
  const user = `Query: "${query}"
Incumbent Perplexity leans on: ${sim.incumbent ?? "(none)"}
Incumbent answer: """${sim.answer.slice(0, 800)}"""

Candidate answer block:
Title: ${eng.title}
Lead: ${eng.answerFirst}
Stats: ${eng.statLines.map((s) => `${s.stat} — ${s.source} (${s.date})`).join(" | ")}
Bullets: ${eng.bullets.join(" | ")}
FAQs: ${eng.faqs.map((f) => `${f.q} → ${f.a.slice(0, 120)}`).join(" | ")}`;
  const raw = await callLLM(system, user, true);
  const parsed = extractJson<PickScore>(raw) ?? { score: 50, wins: [], risks: [], vsIncumbent: "" };
  return {
    score: Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 50))),
    wins: (parsed.wins ?? []).slice(0, 6).map((w) => String(w).slice(0, 240)),
    risks: (parsed.risks ?? []).slice(0, 6).map((r) => String(r).slice(0, 240)),
    vsIncumbent: String(parsed.vsIncumbent ?? "").slice(0, 320),
  };
}

export const runPerplexityEngine = createServerFn({ method: "POST" })
  .inputValidator((raw) => InputSchema.parse(raw))
  .handler(async ({ data }): Promise<PplxEngineResult> => {
    const simulation = await simulatePerplexity(data.query);
    const engineered = await engineerAnswer(data.query, simulation, data.domain, data.angle);
    const pick = await scorePick(data.query, simulation, engineered);
    return {
      query: data.query,
      simulation,
      engineered,
      pick,
      generatedAt: new Date().toISOString(),
    };
  });
