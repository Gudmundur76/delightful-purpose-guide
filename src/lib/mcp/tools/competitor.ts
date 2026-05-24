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
    const raw = query.toLowerCase().trim();
    const stripped = raw.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
    const root = stripped.replace(/\.(com|io|ai|co|dev|app|org|net|xyz|so|sh)$/i, "");
    const needles = Array.from(new Set([raw, stripped, root].filter((s) => s.length >= 2)));
    const match =
      LEADERBOARD_ENTRIES.find((e) =>
        needles.some((n) => e.domain.toLowerCase() === n || e.name.toLowerCase() === n),
      ) ||
      LEADERBOARD_ENTRIES.find((e) =>
        needles.some((n) => e.domain.toLowerCase().includes(n) || e.name.toLowerCase().includes(n)),
      );
    if (!match) {
      const suggestions = LEADERBOARD_ENTRIES.filter((e) =>
        needles.some((n) => e.domain.toLowerCase().startsWith(n.slice(0, 3))),
      )
        .slice(0, 5)
        .map((e) => ({ name: e.name, domain: e.domain }));
      return JSON.stringify({ ok: false, error: `No leaderboard entry matches "${query}"`, suggestions });
    }
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
