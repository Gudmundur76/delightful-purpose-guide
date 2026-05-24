import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { LEADERBOARD as LEADERBOARD_ENTRIES } from "@/lib/leaderboard/entries";

export const getCompetitorScoreTool = defineTool({
  name: "get_competitor_score",
  description:
    "Look up a single company/domain on the curated 390-row Agent Readability leaderboard. Returns rank within category, all sub-scores, and the gap to the category leader.",
  parameters: z.object({
    query: z.string().min(2).max(200).describe("Domain or company name (case-insensitive substring match)"),
  }),
  execute: async ({ query }) => {
    const q = query.toLowerCase();
    const match = LEADERBOARD_ENTRIES.find(
      (e) => e.domain.toLowerCase().includes(q) || e.name.toLowerCase().includes(q),
    );
    if (!match) return JSON.stringify({ ok: false, error: `No leaderboard entry matches "${query}"` });
    const peers = LEADERBOARD_ENTRIES.filter((e) => e.category === match.category).sort((a, b) => b.score - a.score);
    const rank = peers.findIndex((e) => e.domain === match.domain) + 1;
    const leader = peers[0];
    return JSON.stringify(
      {
        ok: true,
        entry: match,
        category_rank: rank,
        category_size: peers.length,
        category_leader: { name: leader.name, domain: leader.domain, score: leader.score },
        gap_to_leader: leader.score - match.score,
      },
      null,
      2,
    );
  },
});
