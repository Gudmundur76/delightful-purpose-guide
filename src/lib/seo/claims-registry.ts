// Central registry of verifiable claims exposed via /api/public/data/claims.json
// Every visible <VerifiabilityBadge id="..."> on the site should resolve to a
// claim in this registry. New claims are appended; existing ids are stable.
//
// Trust Handshake (v2.1): each claim may carry `source_files` pointing at the
// exact paths in the public repo that produce or back the value. These are
// rendered as GitHub blob URLs in the JSON-LD `sameAs` array and surfaced in
// the claims JSON so agents can verify Web → JSON-LD → Source in one hop.

import { sourceUrl } from "@/lib/seo/trust-handshake";

export type ClaimSourceFile = {
  path: string;
  lines?: string;
  description?: string;
};

export type ClaimRecord = {
  id: string;
  value: string;
  label: string;
  source: string;
  source_url?: string;
  context?: string;
  date_observed: string;
  unit?: string;
  page_anchors: string[]; // permalinks where this claim is rendered
  source_files?: ClaimSourceFile[]; // repo paths backing this claim
  same_as?: string[]; // resolved GitHub blob URLs (computed at serialize time)
};

export const CLAIMS_DATE_MODIFIED = "2026-05-29";

/** Resolve `source_files` into absolute GitHub blob URLs for the current build ref. */
export function withSameAs(claim: ClaimRecord): ClaimRecord {
  if (!claim.source_files || claim.source_files.length === 0) return claim;
  return {
    ...claim,
    same_as: claim.source_files.map((f) => sourceUrl(f.path, f.lines)),
  };
}



export const CLAIMS_REGISTRY: ClaimRecord[] = [
  {
    id: "home-stat-83",
    value: "83%",
    label: "Share of AI Overview citations from pages outside the organic top 10",
    source: "BrightEdge AI Overview tracking study, 2025",
    source_url: "https://www.brightedge.com/resources/research-reports/ai-overviews",
    date_observed: "2025-12-01",
    unit: "PERCENT",
    page_anchors: [
      "https://citation.is/#home-stat-83",
      "https://citation.is/#home-stat-83-prose",
    ],
    source_files: [
      { path: "src/lib/seo/claims-registry.ts", description: "Authoritative claim record" },
      { path: "src/routes/index.tsx", description: "Visible rendering site" },
    ],
  },
  {
    id: "home-stat-73",
    value: "73%",
    label: "Sites silently excluded from AI citations due to fixable technical issues",
    source: "citation.is Agent Readability Leaderboard (Q2 2026)",
    source_url: "https://citation.is/leaderboard",
    date_observed: "2026-05-28",
    unit: "PERCENT",
    page_anchors: ["https://citation.is/#home-stat-73"],
    source_files: [
      { path: "src/lib/leaderboard/entries.ts", description: "Underlying dataset" },
      { path: "src/lib/leaderboard/stats.ts", description: "Aggregation logic" },
    ],
  },
  {
    id: "home-stat-527",
    value: "527%",
    label: "Year-over-year growth in AI-referred sessions, early 2025",
    source: "Similarweb AI referral traffic analysis, Q1 2025",
    source_url: "https://www.similarweb.com/blog/insights/ai-news/genai-traffic-2025/",
    date_observed: "2025-03-31",
    unit: "PERCENT",
    page_anchors: [
      "https://citation.is/#home-stat-527",
      "https://citation.is/#home-stat-527-prose",
    ],
    source_files: [
      { path: "src/lib/seo/claims-registry.ts", description: "Authoritative claim record" },
    ],
  },
  {
    id: "home-stat-48",
    value: "48%",
    label: "Share of all queries that trigger a Google AI Overview",
    source: "SE Ranking AI Overview prevalence study, late 2025",
    source_url: "https://seranking.com/blog/ai-overviews-research/",
    date_observed: "2025-11-15",
    unit: "PERCENT",
    page_anchors: ["https://citation.is/#home-stat-48"],
    source_files: [
      { path: "src/lib/seo/claims-registry.ts", description: "Authoritative claim record" },
    ],
  },
  {
    id: "home-stat-4x",
    value: "4.3×",
    label: "AI-citation lift for pages over 20,000 characters vs thin pages",
    source: "citation.is citation density analysis, Q2 2026",
    source_url: "https://citation.is/leaderboard",
    date_observed: "2026-05-28",
    unit: "RATIO",
    page_anchors: ["https://citation.is/#home-stat-4x"],
    source_files: [
      { path: "src/lib/leaderboard/entries.ts", description: "Underlying dataset" },
    ],
  },
  // /stats page — derived live from the leaderboard. The value here is a
  // pointer; the live `/api/public/data/stats.json` carries the actual figures.
  {
    id: "missing-llms-txt",
    value: "see /api/public/data/stats.json#missing_llms_txt_pct",
    label: "Share of top AI companies missing or under-serving llms.txt",
    source: "citation.is Agent Readability Leaderboard",
    source_url: "https://citation.is/leaderboard",
    date_observed: CLAIMS_DATE_MODIFIED,
    unit: "PERCENT",
    page_anchors: ["https://citation.is/stats#missing-llms-txt"],
    source_files: [
      { path: "src/lib/leaderboard/stats.ts", description: "computeHeadlineStats()" },
      { path: "src/lib/leaderboard/entries.ts", description: "Underlying dataset" },
    ],
  },
  {
    id: "weak-jsonld",
    value: "see /api/public/data/stats.json#weak_jsonld_pct",
    label: "Share of top AI companies shipping insufficient JSON-LD",
    source: "citation.is Agent Readability Leaderboard",
    source_url: "https://citation.is/leaderboard",
    date_observed: CLAIMS_DATE_MODIFIED,
    unit: "PERCENT",
    page_anchors: ["https://citation.is/stats#weak-jsonld"],
    source_files: [
      { path: "src/lib/leaderboard/stats.ts", description: "computeHeadlineStats()" },
      { path: "src/lib/leaderboard/entries.ts", description: "Underlying dataset" },
    ],
  },
  {
    id: "opaque",
    value: "see /api/public/data/stats.json#opaque_pct",
    label: "Share of top AI companies scoring below 55/100 (effectively opaque)",
    source: "citation.is Agent Readability Leaderboard",
    source_url: "https://citation.is/leaderboard",
    date_observed: CLAIMS_DATE_MODIFIED,
    unit: "PERCENT",
    page_anchors: ["https://citation.is/stats#opaque"],
    source_files: [
      { path: "src/lib/leaderboard/stats.ts", description: "computeHeadlineStats()" },
      { path: "src/lib/leaderboard/entries.ts", description: "Underlying dataset" },
    ],
  },
  {
    id: "agent-native",
    value: "see /api/public/data/stats.json#agent_native_pct",
    label: "Share of top AI companies clearing the agent-native bar (≥85/100)",
    source: "citation.is Agent Readability Leaderboard",
    source_url: "https://citation.is/leaderboard",
    date_observed: CLAIMS_DATE_MODIFIED,
    unit: "PERCENT",
    page_anchors: ["https://citation.is/stats#agent-native"],
    source_files: [
      { path: "src/lib/leaderboard/stats.ts", description: "computeHeadlineStats()" },
      { path: "src/lib/leaderboard/entries.ts", description: "Underlying dataset" },
    ],
  },
  {
    id: "slow-ttfb",
    value: "see /api/public/data/stats.json#slow_pct",
    label: "Share of top AI companies failing the first-byte speed threshold",
    source: "citation.is Agent Readability Leaderboard",
    source_url: "https://citation.is/leaderboard",
    date_observed: CLAIMS_DATE_MODIFIED,
    unit: "PERCENT",
    page_anchors: ["https://citation.is/stats#slow-ttfb"],
    source_files: [
      { path: "src/lib/leaderboard/stats.ts", description: "computeHeadlineStats()" },
      { path: "src/lib/leaderboard/entries.ts", description: "Underlying dataset" },
    ],
  },
  {
    id: "weak-semantic",
    value: "see /api/public/data/stats.json#weak_semantic_pct",
    label: "Share of top AI companies missing core semantic-HTML landmarks",
    source: "citation.is Agent Readability Leaderboard",
    source_url: "https://citation.is/leaderboard",
    date_observed: CLAIMS_DATE_MODIFIED,
    unit: "PERCENT",
    page_anchors: ["https://citation.is/stats#weak-semantic"],
    source_files: [
      { path: "src/lib/leaderboard/stats.ts", description: "computeHeadlineStats()" },
      { path: "src/lib/leaderboard/entries.ts", description: "Underlying dataset" },
    ],
  },
];

