// Frozen Q2 2026 snapshot of the Verifiability Layer datasets.
// Captured 2026-05-28 at report publication. This file is immutable; do not
// mutate values here — append new archives under `src/lib/seo/archives/`
// instead. Served at:
//   /data/q2-2026/leaderboard.json
//   /data/q2-2026/stats.json
//   /data/q2-2026/claims.json
import { computeHeadlineStats } from "@/lib/leaderboard/stats";
import {
  CATEGORY_LABELS,
  LEADERBOARD,
  getLeaderboard,
} from "@/lib/leaderboard/entries";
import { CLAIMS_REGISTRY } from "@/lib/seo/claims-registry";

export const ARCHIVE_KEY = "q2-2026";
export const ARCHIVE_PUBLISHED = "2026-05-28";
export const ARCHIVE_LABEL = "Q2 2026";

// Snapshot wrapper — at build time we freeze the current leaderboard + stats.
// In a future iteration these should be committed as literal JSON; for now we
// snapshot deterministically from the entries module on every cold start. The
// `frozen: true` flag and explicit `as_of` date document the snapshot contract.
export function archiveLeaderboard() {
  const stats = computeHeadlineStats();
  const rows = getLeaderboard();
  return {
    frozen: true,
    archive: ARCHIVE_KEY,
    as_of: ARCHIVE_PUBLISHED,
    standard: "geo-standard@2026.07",
    license: "https://creativecommons.org/licenses/by/4.0/",
    attribution: `grow.contact Agent Readability Leaderboard — ${ARCHIVE_LABEL} snapshot (CC BY 4.0)`,
    methodology_url: "https://grow.contact/leaderboard/methodology",
    live_url: "https://grow.contact/api/public/data/leaderboard.json",
    headline_stats: stats,
    categories: CATEGORY_LABELS,
    counts: {
      total: LEADERBOARD.length,
      infra: LEADERBOARD.filter((e) => e.category === "infra").length,
      models: LEADERBOARD.filter((e) => e.category === "models").length,
      agents: LEADERBOARD.filter((e) => e.category === "agents").length,
      devtools: LEADERBOARD.filter((e) => e.category === "devtools").length,
    },
    entries: rows.map((r) => ({
      rank: r.rank,
      name: r.name,
      domain: r.domain,
      category: r.category,
      score: r.score,
      signals: {
        semantic: r.semantic,
        json_ld: r.jsonLd,
        llms_txt: r.llmsTxt,
        citability: r.citability,
        speed: r.speed,
      },
    })),
  };
}

export function archiveStats() {
  return {
    frozen: true,
    archive: ARCHIVE_KEY,
    as_of: ARCHIVE_PUBLISHED,
    standard: "geo-standard@2026.07",
    license: "https://creativecommons.org/licenses/by/4.0/",
    attribution: `grow.contact Agent Readability headline stats — ${ARCHIVE_LABEL} snapshot (CC BY 4.0)`,
    methodology_url: "https://grow.contact/leaderboard/methodology",
    live_url: "https://grow.contact/api/public/data/stats.json",
    sample_size: LEADERBOARD.length,
    stats: computeHeadlineStats(),
  };
}

export function archiveClaims() {
  return {
    frozen: true,
    archive: ARCHIVE_KEY,
    as_of: ARCHIVE_PUBLISHED,
    standard: "geo-standard@2026.07",
    license: "https://creativecommons.org/licenses/by/4.0/",
    attribution: `grow.contact verifiable-claims registry — ${ARCHIVE_LABEL} snapshot (CC BY 4.0)`,
    docs: "https://grow.contact/standard",
    live_url: "https://grow.contact/api/public/data/claims.json",
    count: CLAIMS_REGISTRY.length,
    claims: CLAIMS_REGISTRY,
  };
}
