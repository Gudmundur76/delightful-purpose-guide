import { createFileRoute } from "@tanstack/react-router";

const body = `# grow-geo-scan

Score any URL against the Grow GEO Standard (6 signals, 0–100) — semantic HTML, JSON-LD, llms.txt, citability, speed, and protocol discovery.

## Endpoint
POST https://grow.contact/api/public/v1/analyze
Header: x-api-key: <key>
Body: { "url": "https://example.com" }

## Output
JSON with overall score, per-signal sub-scores, and remediation findings.
`;

export const Route = createFileRoute("/.well-known/agent-skills/grow-geo-scan.md")({
  server: {
    handlers: {
      GET: async () =>
        new Response(body, {
          status: 200,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
          },
        }),
    },
  },
});
