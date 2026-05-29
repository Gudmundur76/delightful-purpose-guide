// Live Agent Readability leaderboard mirror under /api/public/data/leaderboard.json.
// Same shape as /api/public/leaderboard.json; this is the canonical Verifiability
// Layer endpoint referenced by claims and dataset JSON-LD.
import { createFileRoute } from "@tanstack/react-router";
import {
  CATEGORY_LABELS,
  LEADERBOARD,
  type LeaderboardCategory,
  getLeaderboard,
} from "@/lib/leaderboard/entries";
import { computeHeadlineStats } from "@/lib/leaderboard/stats";

const VALID: LeaderboardCategory[] = ["infra", "models", "agents", "devtools"];

export const Route = createFileRoute("/api/public/data/leaderboard.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const catParam = url.searchParams.get("category");
        const category = VALID.includes(catParam as LeaderboardCategory)
          ? (catParam as LeaderboardCategory)
          : undefined;
        const limit = Math.min(
          1000,
          Math.max(1, parseInt(url.searchParams.get("limit") ?? "1000", 10) || 1000),
        );
        const rows = getLeaderboard(category).slice(0, limit);

        const body = {
          generated_at: new Date().toISOString(),
          date_modified: new Date().toISOString().slice(0, 10),
          standard: "geo-standard@2026.07",
          license: "https://creativecommons.org/licenses/by/4.0/",
          attribution: "grow.contact Agent Readability Leaderboard (CC BY 4.0)",
          methodology_url: "https://grow.contact/leaderboard/methodology",
          archive_q2_2026: "https://grow.contact/data/q2-2026/leaderboard.json",
          headline_stats: computeHeadlineStats(),
          categories: CATEGORY_LABELS,
          counts: {
            total: LEADERBOARD.length,
            returned: rows.length,
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
            verify_url: `https://grow.contact/verify/${r.domain}`,
            badge_url: `https://grow.contact/badge/${r.domain}.svg`,
          })),
        };

        return new Response(JSON.stringify(body, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=86400",
            "x-content-type-options": "nosniff",
          },
        });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
    },
  },
});
