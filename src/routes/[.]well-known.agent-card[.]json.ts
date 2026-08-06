// Vendor-neutral Agent Card (A2A-compatible + rtrvr agent-card shape).
// Discovery signal for API-calling agents (MCP clients, A2A agents,
// custom function-calling LLMs). Served at /.well-known/agent-card.json
// per the emerging A2A convention (Google, Apr 2025) and the discovery
// matrix documented at /blog/agent-web-discovery-matrix.
import { createFileRoute } from "@tanstack/react-router";

const card = {
  $schema: "https://a2aproject.github.io/A2A/schemas/agent-card.json",
  schemaVersion: "1.0",
  name: "grow.contact",
  displayName: "grow.contact — GEO Standard",
  description:
    "Free infrastructure for AI search visibility. Score any URL against the Grow GEO Standard, resolve verifiable claims to source, and read the canonical GEO/AEO knowledge base.",
  version: "2.1.0",
  vendor: { name: "grow.contact", url: "https://grow.contact" },
  documentationUrl: "https://grow.contact/api-docs",
  provider: {
    organization: "grow.contact",
    url: "https://grow.contact",
  },
  // A2A-style capability declaration.
  capabilities: {
    streaming: false,
    pushNotifications: false,
    stateTransitionHistory: false,
    tools: true,
    resources: true,
  },
  // Where an agent can act.
  endpoints: [
    {
      protocol: "mcp-streamable-http",
      url: "https://grow.contact/api/public/mcp",
    },
    {
      protocol: "openapi",
      url: "https://grow.contact/openapi.json",
    },
    {
      protocol: "tool-catalog",
      url: "https://grow.contact/api/public/tools.json",
    },
  ],
  // High-level skills (A2A "skills" convention). Agents pick by skill,
  // then invoke via the endpoint that fits their transport.
  skills: [
    {
      id: "scan_url",
      name: "Score a URL against the GEO Standard",
      description:
        "Return a 0–100 agent-readiness score with metric breakdown (semantic HTML, JSON-LD, llms.txt, citability, speed, protocol discovery) for any public URL.",
      inputModes: ["text"],
      outputModes: ["text", "json"],
      examples: [
        "Score https://example.com against the GEO Standard",
        "Is my landing page cited-ready?",
      ],
    },
    {
      id: "get_geo_standard",
      name: "Fetch the canonical GEO Standard",
      description:
        "Return the current GEO Standard specification (thresholds, robots.txt matrix, JSON-LD picker, discovery signals).",
      inputModes: ["text"],
      outputModes: ["text", "markdown"],
    },
    {
      id: "leaderboard",
      name: "Read the AI-readiness leaderboard",
      description:
        "Ranked list of tracked hosts by agent-readiness score, with delta over time.",
      inputModes: ["text"],
      outputModes: ["json"],
    },
  ],
  // Vendor-neutral discovery signals this site exposes. Mirrors the
  // 5-signal discovery matrix (one per agent architecture).
  discovery: {
    signals: [
      { type: "agent-card", url: "https://grow.contact/.well-known/agent-card.json", serves: "api-calling agents (MCP/A2A)" },
      { type: "mcp-server-card", url: "https://grow.contact/.well-known/mcp/server-card.json", serves: "MCP clients" },
      { type: "llms.txt", url: "https://grow.contact/llms.txt", serves: "text agents (Claude, ChatGPT, Gemini chat)" },
      { type: "in-page-marker", selector: "script[type=\"application/agent+json\"]", serves: "DOM agents (Codex, Playwright bots)" },
      { type: "visible-badge", url: "https://grow.contact/badge", serves: "CUA / screenshot agents (Operator, Claude CUA)" },
      { type: "openapi", url: "https://grow.contact/openapi.json", serves: "function-calling agents" },
    ],
  },
  verifiableData: {
    claims: "https://grow.contact/api/public/data/claims.json",
    stats: "https://grow.contact/api/public/data/stats.json",
    leaderboard: "https://grow.contact/api/public/data/leaderboard.json",
    standard: "https://grow.contact/standard.md",
  },
  contact: { url: "https://grow.contact/contact" },
  license: "https://grow.contact/terms",
} as const;

export const Route = createFileRoute("/.well-known/agent-card.json")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(card, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
          },
        }),
    },
  },
});
