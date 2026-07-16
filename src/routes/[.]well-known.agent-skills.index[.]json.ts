import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "node:crypto";

// Skill manifest contents — also served at /.well-known/agent-skills/grow-geo-scan.md
const geoScanSkill = `# grow-geo-scan

Score any URL against the Grow GEO Standard (6 signals, 0–100) — semantic HTML, JSON-LD, llms.txt, citability, speed, and protocol discovery.

## Endpoint
POST https://citation.is/api/public/v1/analyze
Header: x-api-key: <key>
Body: { "url": "https://example.com" }

## Output
JSON with overall score, per-signal sub-scores, and remediation findings.
`;

const sha = (s: string) =>
  createHash("sha256").update(s, "utf8").digest("hex");

const index = {
  $schema: "https://agentskills.io/schemas/v0.2.0/index.json",
  version: "0.2.0",
  publisher: { name: "citation.is", url: "https://citation.is" },
  skills: [
    {
      name: "grow-geo-scan",
      type: "remote",
      description:
        "Score any URL against the Grow GEO Standard (6 signals, 0–100) for AI-agent readability.",
      url: "https://citation.is/.well-known/agent-skills/grow-geo-scan.md",
      sha256: sha(geoScanSkill),
    },
  ],
};

export const Route = createFileRoute("/.well-known/agent-skills/index.json")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(index, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
          },
        }),
    },
  },
});

export const __skillBody = geoScanSkill;
