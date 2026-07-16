// Domain-only brand visibility audit — inspired by leapd.ai's checker.
// Enter a domain. We derive the industry + 8 real buyer prompts, then
// query 2 engines (Gemini + GPT) in parallel and score visibility.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  domain: z.string().min(3).max(253),
});

const AI_ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";

function normalizeDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
}

async function callModel(model: string, system: string, user: string, jsonMode = false): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(AI_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  return json?.choices?.[0]?.message?.content ?? "";
}

async function derivePromptsAndTopic(domain: string): Promise<{ topic: string; prompts: string[] }> {
  const raw = await callModel(
    "google/gemini-2.5-flash",
    "You classify a website and generate the real questions buyers ask AI assistants when researching this category. Reply ONLY with JSON.",
    `Domain: ${domain}
Return JSON: { "topic": "<3-6 word category label>", "prompts": ["<8 short buyer questions people actually ask ChatGPT/Perplexity in this category — no brand names>"] }`,
    true,
  );
  try {
    const parsed = JSON.parse(raw);
    const prompts: string[] = Array.isArray(parsed.prompts) ? parsed.prompts.slice(0, 8).filter((s: unknown) => typeof s === "string") : [];
    return { topic: String(parsed.topic ?? "general"), prompts };
  } catch {
    return { topic: "general", prompts: [] };
  }
}

type PromptResult = {
  prompt: string;
  engine: string;
  cited: boolean;
  rank: number | null; // 1-based position in a numbered list; null if not found or not ranked
  mentions: number;
  competitors: string[]; // other domains mentioned
  answer: string;
  error?: string;
};

const DOMAIN_RE = /\b([a-z0-9-]+\.(?:com|io|ai|co|net|org|dev|app|so|xyz|tech|de|uk|fr|es|nl|se|us|ca|au|in|jp))\b/gi;

function extractDomains(text: string): string[] {
  const found = new Set<string>();
  for (const m of text.matchAll(DOMAIN_RE)) found.add(m[1].toLowerCase());
  return [...found];
}

function findRank(answer: string, domain: string): number | null {
  const lines = answer.split(/\r?\n/);
  let idx = 0;
  for (const line of lines) {
    const m = line.match(/^\s*(?:(\d+)[.)]|[-*•])\s+/);
    if (m) {
      idx = m[1] ? parseInt(m[1], 10) : idx + 1;
      if (line.toLowerCase().includes(domain)) return idx;
    }
  }
  return null;
}

async function runPrompt(engine: string, model: string, prompt: string, domain: string): Promise<PromptResult> {
  try {
    const answer = await callModel(
      model,
      "You are an AI search assistant. Answer with a short intro then a numbered list of the best options. For each option, name the brand and cite the URL. Be current and factual.",
      prompt,
    );
    const lower = answer.toLowerCase();
    const mentions = (lower.match(new RegExp(domain.replace(/\./g, "\\."), "g")) ?? []).length;
    const rank = mentions > 0 ? findRank(answer, domain) : null;
    const competitors = extractDomains(answer).filter((d) => d !== domain).slice(0, 12);
    return { prompt, engine, cited: mentions > 0, rank, mentions, competitors, answer };
  } catch (e) {
    return { prompt, engine, cited: false, rank: null, mentions: 0, competitors: [], answer: "", error: e instanceof Error ? e.message : "failed" };
  }
}

export type BrandVisibilityReport = {
  domain: string;
  topic: string;
  visibility: number; // % of prompts where cited on at least one engine
  totalRuns: number;
  citedRuns: number;
  avgRank: number | null;
  topCompetitors: Array<{ domain: string; count: number }>;
  engines: string[];
  perPrompt: Array<{
    prompt: string;
    cited: boolean;
    bestRank: number | null;
    engines: PromptResult[];
  }>;
  checkedAt: string;
};

export const auditBrandVisibility = createServerFn({ method: "POST" })
  .inputValidator((raw) => InputSchema.parse(raw))
  .handler(async ({ data }): Promise<BrandVisibilityReport> => {
    const domain = normalizeDomain(data.domain);
    const { topic, prompts } = await derivePromptsAndTopic(domain);

    const engines = [
      { label: "Gemini", model: "google/gemini-2.5-flash" },
      { label: "GPT-5 mini", model: "openai/gpt-5-mini" },
    ];

    const jobs: Array<Promise<PromptResult>> = [];
    for (const p of prompts) for (const e of engines) jobs.push(runPrompt(e.label, e.model, p, domain));
    const all = await Promise.all(jobs);

    // Group by prompt
    const byPrompt = new Map<string, PromptResult[]>();
    for (const r of all) {
      const arr = byPrompt.get(r.prompt) ?? [];
      arr.push(r);
      byPrompt.set(r.prompt, arr);
    }

    const perPrompt = prompts.map((prompt) => {
      const runs = byPrompt.get(prompt) ?? [];
      const cited = runs.some((r) => r.cited);
      const ranks = runs.map((r) => r.rank).filter((n): n is number => typeof n === "number");
      const bestRank = ranks.length ? Math.min(...ranks) : null;
      return { prompt, cited, bestRank, engines: runs };
    });

    const totalRuns = all.length;
    const citedRuns = all.filter((r) => r.cited).length;
    const visibility = perPrompt.length ? Math.round((perPrompt.filter((p) => p.cited).length / perPrompt.length) * 100) : 0;
    const allRanks = all.map((r) => r.rank).filter((n): n is number => typeof n === "number");
    const avgRank = allRanks.length ? Math.round((allRanks.reduce((a, b) => a + b, 0) / allRanks.length) * 10) / 10 : null;

    // Competitor tally
    const compCount = new Map<string, number>();
    for (const r of all) for (const c of r.competitors) compCount.set(c, (compCount.get(c) ?? 0) + 1);
    const topCompetitors = [...compCount.entries()]
      .map(([d, count]) => ({ domain: d, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      domain,
      topic,
      visibility,
      totalRuns,
      citedRuns,
      avgRank,
      topCompetitors,
      engines: engines.map((e) => e.label),
      perPrompt,
      checkedAt: new Date().toISOString(),
    };
  });
