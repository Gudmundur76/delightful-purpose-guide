import { createFileRoute } from "@tanstack/react-router";

const CONTENT = `# /data/ — Raw Data Directory

> Machine-readable endpoints behind every quotable claim on grow.contact. Live (always fresh) and snapshotted (frozen for citations). CC BY 4.0.

## Live endpoints (computed from current dataset)

- [/data/leaderboard.json](https://grow.contact/data/leaderboard.json) — Full agent-readability dataset (390+ companies)
- [/data/stats.json](https://grow.contact/data/stats.json) — Headline statistics with timestamps
- [/data/claims.json](https://grow.contact/data/claims.json) — Every quotable claim with verifiableClaim JSON-LD, observation date, and source URL

All live endpoints:
- Return application/json with CORS open (Access-Control-Allow-Origin: *)
- Include a Dataset + DataDownload JSON-LD wrapper
- Carry a Last-Modified header and a "dateModified" field at the document root
- Are cached at the edge (max-age=0, s-maxage=300, stale-while-revalidate=600)

## Q2 2026 archive (frozen)

- [/data/q2-2026/leaderboard.json](https://grow.contact/data/q2-2026/leaderboard.json) — Snapshot as of report publish date
- [/data/q2-2026/stats.json](https://grow.contact/data/q2-2026/stats.json) — Headline stats locked to Q2 2026 report
- [/data/q2-2026/claims.json](https://grow.contact/data/q2-2026/claims.json) — Citable claims, snapshot

Use the archive when citing the Q2 2026 report — figures must match the PDF.
Use the live endpoints when citing current state ("as of <date>").

## How to cite

APA: grow.contact. (2026). Agent-Readability Leaderboard [Data set]. https://grow.contact/data/leaderboard.json

BibTeX:
\`\`\`
@dataset{growcontact_leaderboard_2026,
  author = {{grow.contact}},
  title  = {Agent-Readability Leaderboard},
  year   = {2026},
  url    = {https://grow.contact/data/leaderboard.json},
  note   = {CC BY 4.0}
}
\`\`\`

## Licensing

CC BY 4.0. Attribution: grow.contact.
`;

export const Route = createFileRoute("/data/llms.txt")({
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
