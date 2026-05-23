// Public dataset endpoint — the Agent Readability leaderboard as JSON.
// Stable, CORS-open, citable by journalists and tooling.
import { createFileRoute } from "@tanstack/react-router";
import {
  CATEGORY_LABELS,
  LEADERBOARD,
  type LeaderboardCategory,
  getLeaderboard,
} from "@/lib/leaderboard/entries";

const VALID: LeaderboardCategory[] = ["infra", "models", "agents", "devtools"];

export const Route = createFileRoute("/api/public/leaderboard.json")({
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
          standard: "geo-standard@2026.05",
          methodology: {
            weights: { semantic: 25, jsonLd: 20, llmsTxt: 15, citability: 20, speed: 20 },
            scale: "0-100",
            notes:
              "Flagship rows are hand-scored; long-tail rows are deterministic estimates re-scored weekly by /api/public/hooks/rescan-leaderboard. Re-score any domain live at /check?u=<domain>.",
          },
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
            "Cache-Control": "public, max-age=300, s-maxage=900",
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
