// Live headline statistics — derived from the leaderboard on every request.
import { createFileRoute } from "@tanstack/react-router";
import { computeHeadlineStats } from "@/lib/leaderboard/stats";
import { LEADERBOARD } from "@/lib/leaderboard/entries";
import { STATS_SCHEMA_URL } from "@/lib/seo/dataset-schemas";

export const Route = createFileRoute("/api/public/data/stats.json")({
  server: {
    handlers: {
      GET: async () => {
        const stats = computeHeadlineStats();
        const body = {
          $schema: STATS_SCHEMA_URL,
          generated_at: new Date().toISOString(),
          date_modified: new Date().toISOString().slice(0, 10),
          standard: "geo-standard@2026.07",
          license: "https://creativecommons.org/licenses/by/4.0/",
          attribution: "citation.is Agent Readability Leaderboard (CC BY 4.0)",
          methodology_url: "https://citation.is/leaderboard/methodology",
          archive_q2_2026: "https://citation.is/data/q2-2026/stats.json",
          sample_size: LEADERBOARD.length,
          stats,
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
