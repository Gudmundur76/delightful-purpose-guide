import { createFileRoute } from "@tanstack/react-router";

const CONTENT = `# Agent-Readability Leaderboard

> Open dataset — agent-readability scores for 390+ AI companies across infrastructure, models, agents, and developer tools. Updated continuously. CC BY 4.0.

## Pages

- [Leaderboard](https://grow.contact/leaderboard) — Filterable by category and failing signal
- [Methodology](https://grow.contact/leaderboard/methodology) — Scoring weights, pass thresholds, refresh cadence
- [State of the Agent-Readable Web](https://grow.contact/stats) — Permanent citable-stats page

## Data endpoints

- [Live JSON](https://grow.contact/api/public/leaderboard.json) — Full current dataset, CORS-open
- [Live leaderboard.json](https://grow.contact/data/leaderboard.json) — Same data, /data/ namespace
- [Live stats.json](https://grow.contact/data/stats.json) — Headline statistics, computed from current dataset
- [Live claims.json](https://grow.contact/data/claims.json) — Every quotable claim with verifiableClaim JSON-LD
- [Q2 2026 archive](https://grow.contact/data/q2-2026/) — Frozen snapshot for citations that must not drift

## Quotable headline stats (Q2 2026)

- 73% of AI companies fail at least one citation-blocking signal
- 41% have no llms.txt
- 28% silently block OAI-SearchBot (ChatGPT citation crawler) via WAF or robots.txt
- Median agent-readability score across the dataset: 62/100
- Top-quartile cutoff: 84/100

Each stat above has a stable anchor on /stats and a verifiableClaim entry in /data/claims.json.

## Research

- [Q2 2026 Report](https://grow.contact/report/q2-2026) — Quarterly flagship
- [Data Drops](https://grow.contact/data-drops) — Monthly single-stat findings between reports
- [Press Kit](https://grow.contact/report/press) — Pull quotes, headline stats, media contact

## Licensing

Dataset: CC BY 4.0. Cite as: "grow.contact Agent-Readability Leaderboard, accessed YYYY-MM-DD, https://grow.contact/leaderboard".
`;

export const Route = createFileRoute("/leaderboard/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(CONTENT, {
          status: 200,
          headers: {
            "content-type": "text/markdown; charset=utf-8",
            "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
