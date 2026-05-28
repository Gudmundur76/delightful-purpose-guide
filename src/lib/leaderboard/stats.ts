// Headline stats over the leaderboard dataset.
// These are the quotable figures designed for AI citation —
// kept as pure functions over LEADERBOARD so they recompute as the
// dataset grows and stay consistent across the page, API, and JSON-LD.

import { LEADERBOARD, type LeaderboardEntry, type LeaderboardCategory, CATEGORY_LABELS } from "./entries";

// Thresholds derived from the geo-standard@2026.05 sub-score weights.
// A site "passes" a signal when it clears ~75% of that signal's max.
const PASS = {
  semantic: 19, // /25
  jsonLd: 15, // /20
  llmsTxt: 11, // /15
  citability: 15, // /20
  speed: 15, // /20
} as const;

export type SignalKey = "semantic" | "jsonLd" | "llmsTxt" | "citability" | "speed";

export interface HeadlineStats {
  total: number;
  avg_score: number;
  median_score: number;
  agent_native_pct: number; // share >= 85
  opaque_pct: number; // share < 55
  missing_llms_txt_pct: number;
  weak_jsonld_pct: number;
  weak_semantic_pct: number;
  slow_pct: number;
  category_averages: { category: LeaderboardCategory; label: string; avg: number; count: number }[];
  top5: { name: string; domain: string; score: number }[];
  bottom5: { name: string; domain: string; score: number }[];
  /** "X% of AI companies are missing llms.txt" — pre-formatted, citable headlines. */
  citable_headlines: string[];
}

function pct(n: number, total: number) {
  return total === 0 ? 0 : Math.round((n / total) * 100);
}

function median(nums: number[]): number {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

export function failsSignal(entry: LeaderboardEntry, signal: SignalKey): boolean {
  switch (signal) {
    case "semantic":
      return entry.semantic < PASS.semantic;
    case "jsonLd":
      return entry.jsonLd < PASS.jsonLd;
    case "llmsTxt":
      return entry.llmsTxt < PASS.llmsTxt;
    case "citability":
      return entry.citability < PASS.citability;
    case "speed":
      return entry.speed < PASS.speed;
  }
}

export function filterByFailure(signal: SignalKey): LeaderboardEntry[] {
  return LEADERBOARD.filter((e) => failsSignal(e, signal));
}

export function computeHeadlineStats(): HeadlineStats {
  const total = LEADERBOARD.length;
  const scores = LEADERBOARD.map((e) => e.score);
  const avg = Math.round(scores.reduce((s, n) => s + n, 0) / Math.max(1, total));
  const med = median(scores);

  const agentNative = LEADERBOARD.filter((e) => e.score >= 85).length;
  const opaque = LEADERBOARD.filter((e) => e.score < 55).length;
  const missingLlms = filterByFailure("llmsTxt").length;
  const weakJsonld = filterByFailure("jsonLd").length;
  const weakSemantic = filterByFailure("semantic").length;
  const slow = filterByFailure("speed").length;

  const cats: LeaderboardCategory[] = ["infra", "models", "agents", "devtools"];
  const category_averages = cats.map((c) => {
    const rows = LEADERBOARD.filter((e) => e.category === c);
    const a = rows.length
      ? Math.round(rows.reduce((s, e) => s + e.score, 0) / rows.length)
      : 0;
    return { category: c, label: CATEGORY_LABELS[c], avg: a, count: rows.length };
  });

  const sorted = [...LEADERBOARD].sort((a, b) => b.score - a.score);
  const top5 = sorted.slice(0, 5).map((e) => ({ name: e.name, domain: e.domain, score: e.score }));
  const bottom5 = sorted
    .slice(-5)
    .reverse()
    .map((e) => ({ name: e.name, domain: e.domain, score: e.score }));

  const worstCat = [...category_averages].sort((a, b) => a.avg - b.avg)[0];
  const bestCat = [...category_averages].sort((a, b) => b.avg - a.avg)[0];

  const citable_headlines = [
    `${pct(missingLlms, total)}% of ${total} AI companies are missing or under-serving llms.txt.`,
    `${pct(weakJsonld, total)}% ship insufficient JSON-LD for reliable AI citation.`,
    `${pct(agentNative, total)}% clear the agent-native bar (score ≥ 85).`,
    `${pct(opaque, total)}% score below 55 — effectively opaque to ChatGPT, Perplexity, and Claude.`,
    `${pct(slow, total)}% fail the first-byte speed threshold AI crawlers timeout against.`,
    `${bestCat.label} leads at ${bestCat.avg}/100 average; ${worstCat.label} trails at ${worstCat.avg}/100.`,
  ];

  return {
    total,
    avg_score: avg,
    median_score: med,
    agent_native_pct: pct(agentNative, total),
    opaque_pct: pct(opaque, total),
    missing_llms_txt_pct: pct(missingLlms, total),
    weak_jsonld_pct: pct(weakJsonld, total),
    weak_semantic_pct: pct(weakSemantic, total),
    slow_pct: pct(slow, total),
    category_averages,
    top5,
    bottom5,
    citable_headlines,
  };
}

export const SIGNAL_LABEL: Record<SignalKey, string> = {
  semantic: "Weak semantic HTML",
  jsonLd: "Weak JSON-LD",
  llmsTxt: "Missing llms.txt",
  citability: "Low citability",
  speed: "Slow first byte",
};
