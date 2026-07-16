import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { LEADERBOARD, CATEGORY_LABELS, type LeaderboardCategory, type LeaderboardEntry } from "@/lib/leaderboard/entries";

export const leaderboardTool = defineTool({
  name: "get_leaderboard",
  description:
    "Get the citation.is Agent Readability leaderboard. AI companies across infra / models / agents / devtools with GEO scores.",
  parameters: z.object({
    category: z.enum(["infra", "models", "agents", "devtools"]).optional(),
    limit: z.number().int().min(1).max(100).default(25),
    min_score: z.number().int().min(0).max(100).optional(),
  }),
  execute: async ({ category, limit, min_score }) => {
    let rows: LeaderboardEntry[] = LEADERBOARD.slice();
    if (category) rows = rows.filter((r) => r.category === category);
    if (typeof min_score === "number") rows = rows.filter((r) => ((r as { overall?: number }).overall ?? 0) >= min_score);
    rows.sort((a, b) => (((b as { overall?: number }).overall ?? 0) - ((a as { overall?: number }).overall ?? 0)));
    const ranked = rows.slice(0, limit).map((r, i) => ({ rank: i + 1, ...r }));
    return JSON.stringify(
      { ok: true, category_label: category ? CATEGORY_LABELS[category as LeaderboardCategory] : "All", count: ranked.length, entries: ranked },
      null,
      2,
    );
  },
});
