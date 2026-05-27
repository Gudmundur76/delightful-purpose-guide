// Agent-protocol surfaces for grow.contact.
//
// Implements the four isitagentready.com Track-1 adaptations:
//   1. /.well-known/mcp.json   — MCP server card
//   2. /.well-known/oauth-protected-resource — RFC 9728 OAuth metadata
//   3. /auth.md                 — human-readable auth pointer
//   4. Link discovery header    — rel="llms" / api-catalog / mcp / oauth-protected-resource
//   5. Markdown content negotiation — serve a .md twin when Accept asks for it
//
// All of these are stateless and safe to compute per-request in the Worker.

import { createHash } from "node:crypto";
import { serverCard } from "./agent-protocol/mcp-server-card";

const SITE_ORIGIN = "https://grow.contact";

// Skill manifest body — kept here so the hash in the agent-skills index is
// computed from the exact bytes we serve at /.well-known/agent-skills/grow-geo-scan.md.
const GROW_GEO_SCAN_SKILL = `# grow-geo-scan

Score any URL against the Grow GEO Standard (6 signals, 0–100) — semantic HTML, JSON-LD, llms.txt, citability, speed, and protocol discovery.

## Endpoint
POST https://grow.contact/api/public/v1/analyze
Header: x-api-key: <key>
Body: { "url": "https://example.com" }

## Output
JSON with overall score, per-signal sub-scores, and remediation findings.
`;

// ---------- Discovery Link header ----------

export function buildLinkHeader(): string {
  return [
    `<${SITE_ORIGIN}/llms.txt>; rel="llms"; type="text/markdown"`,
    `<${SITE_ORIGIN}/api/public/v1/openapi.json>; rel="api-catalog"; type="application/json"`,
    `<${SITE_ORIGIN}/api/public/mcp>; rel="mcp"`,
    `<${SITE_ORIGIN}/.well-known/oauth-protected-resource>; rel="oauth-protected-resource"`,
  ].join(", ");
}

// ---------- Accept negotiation ----------

export function acceptsMarkdown(request: Request): boolean {
  const accept = request.headers.get("accept") ?? "";
  // Match only when the client explicitly prefers markdown — avoid hijacking
  // generic `*/*` requests from browsers.
  return /text\/markdown(?:[\s;,]|$)/i.test(accept);
}

// ---------- /.well-known/* + /auth.md ----------

export function handleWellKnownRequest(url: URL): Response | null {
  switch (url.pathname) {
    case "/.well-known/mcp.json":
    case "/.well-known/mcp/server-card.json":
      return jsonResponse(serverCard);
    case "/.well-known/api-catalog":
      return linksetResponse(apiCatalog());
    case "/.well-known/agent-skills/index.json":
      return jsonResponse(agentSkillsIndex());
    case "/.well-known/agent-skills/grow-geo-scan.md":
      return markdownResponse(GROW_GEO_SCAN_SKILL);
    case "/.well-known/oauth-protected-resource":
      return jsonResponse(oauthProtectedResourceMetadata());
    case "/auth.md":
      return markdownResponse(authMarkdown());
    default:
      return null;
  }
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      link: buildLinkHeader(),
    },
  });
}

function linksetResponse(body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/linkset+json",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      link: buildLinkHeader(),
    },
  });
}

function markdownResponse(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      link: buildLinkHeader(),
    },
  });
}

// RFC 9727 — API Catalog (application/linkset+json).
function apiCatalog() {
  return {
    linkset: [
      {
        anchor: `${SITE_ORIGIN}/api/public/v1/`,
        "service-desc": [
          {
            href: `${SITE_ORIGIN}/api/public/v1/openapi.json`,
            type: "application/openapi+json",
          },
        ],
        "service-doc": [
          { href: `${SITE_ORIGIN}/api-docs`, type: "text/html" },
        ],
        "service-meta": [
          { href: `${SITE_ORIGIN}/api/public/v1/`, type: "application/json" },
        ],
        status: [
          {
            href: `${SITE_ORIGIN}/api/public/v1/readiness`,
            type: "application/json",
          },
        ],
      },
      {
        anchor: `${SITE_ORIGIN}/api/public/mcp`,
        "service-desc": [
          {
            href: `${SITE_ORIGIN}/.well-known/mcp/server-card.json`,
            type: "application/json",
          },
        ],
        "service-doc": [
          { href: `${SITE_ORIGIN}/api-docs`, type: "text/html" },
        ],
      },
    ],
  };
}

// Agent Skills v0.2.0 index. sha256 must match the served manifest body bytes.
function agentSkillsIndex() {
  const sha256 = createHash("sha256")
    .update(GROW_GEO_SCAN_SKILL, "utf8")
    .digest("hex");
  return {
    $schema: "https://agentskills.io/schemas/v0.2.0/index.json",
    version: "0.2.0",
    publisher: { name: "grow.contact", url: SITE_ORIGIN },
    skills: [
      {
        name: "grow-geo-scan",
        type: "remote",
        description:
          "Score any URL against the Grow GEO Standard (6 signals, 0–100) for AI-agent readability.",
        url: `${SITE_ORIGIN}/.well-known/agent-skills/grow-geo-scan.md`,
        sha256,
      },
    ],
  };
}

// RFC 9728 — OAuth 2.0 Protected Resource Metadata.
// grow.contact's user-facing auth runs on Supabase; this document tells an
// agent where to discover the authorization server and what scopes apply.
function oauthProtectedResourceMetadata() {
  const supabaseUrl =
    (typeof process !== "undefined" && process.env?.SUPABASE_URL) ||
    "https://uyvxsrkikipyrmgcuiph.supabase.co";
  return {
    resource: SITE_ORIGIN,
    authorization_servers: [supabaseUrl],
    bearer_methods_supported: ["header"],
    resource_documentation: `${SITE_ORIGIN}/auth.md`,
    scopes_supported: ["openid", "email", "profile"],
    resource_signing_alg_values_supported: ["RS256"],
  };
}

function authMarkdown(): string {
  return `# Authentication — grow.contact

> Human-readable companion to \`/.well-known/oauth-protected-resource\` (RFC 9728).

grow.contact uses Supabase Auth (OAuth 2.0 / OIDC) for its dashboard,
admin tools, and authenticated MCP / API endpoints.

## For agents

- **Protected-resource metadata:** \`${SITE_ORIGIN}/.well-known/oauth-protected-resource\`
- **Authorization server:** the \`authorization_servers\` URL listed in the
  metadata document. Follow standard OIDC discovery from there
  (\`/.well-known/openid-configuration\`).
- **Bearer token:** send \`Authorization: Bearer <access_token>\` on every
  request to an authenticated endpoint.
- **Public, unauthenticated surfaces** (no token required):
  - \`GET /\`, \`GET /llms.txt\`, \`GET /sitemap.xml\`
  - \`GET /api/public/v1/openapi.json\`
  - \`GET /api/public/v1/readiness\`, \`GET /api/public/ping\`
  - \`POST /api/public/v1/analyze\` (rate-limited)
  - \`POST /api/public/v1/leads\` (rate-limited)
- **MCP endpoint:** \`POST /api/public/mcp\`. Bearer token validated against
  the \`MCP_SECRET\` server-side env var when configured.

## For humans

- Sign in at [/login](${SITE_ORIGIN}/login).
- Account settings live on the dashboard at [/dashboard](${SITE_ORIGIN}/dashboard).
- API keys for the public REST API are issued on request — email
  hello@grow.contact.

## Standards we implement

- [RFC 9728 — OAuth 2.0 Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728)
- [Model Context Protocol (MCP) — Streamable HTTP](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports)
- [llms.txt](https://llmstxt.org/)
- Cloudflare Content Signals (declared in \`/robots.txt\`)
`;
}

// ---------- Markdown twins for HTML routes ----------

// Curated per-route summaries. Keep these short, factual, agent-friendly.
// Unknown routes fall back to /llms.txt content so agents always get something.
const MARKDOWN_TWINS: Record<string, () => string> = {
  "/": () => `# grow.contact

> Agent-native website agency. Fixed-price, 48-hour delivery. Scored, not promised.

We design and ship marketing sites engineered to be cited by ChatGPT,
Perplexity, Claude, and Google AI Overviews from day one.

## Services
- **Launch Page** — $2,400 — single agent-readable page, 48 hours
- **Marketing Site** — $4,800 — up to 5 pages, 5 days

## Proof
- Free public scanner at [${SITE_ORIGIN}/check](${SITE_ORIGIN}/check)
- Live leaderboard of AI company sites at [${SITE_ORIGIN}/leaderboard](${SITE_ORIGIN}/leaderboard)
- GEO Standard documented and machine-readable via the [MCP endpoint](${SITE_ORIGIN}/api/public/mcp)

## Contact
- Email: hello@grow.contact
- Brief intake: ${SITE_ORIGIN}/contact
`,
  "/pricing": () => `# Pricing — grow.contact

> Fixed price. Written delivery date. No retainers, no scope creep.

| Tier | Price (USD) | Delivery | Pages |
|---|---|---|---|
| Launch Page | $2,400 | 48 hours | 1 |
| Marketing Site | $4,800 | 5 days | up to 5 |

Both tiers ship with semantic HTML, JSON-LD, llms.txt, robots.txt
configured for AI crawlers, sitemap, and an MCP-readable site card.

Start a brief: ${SITE_ORIGIN}/contact
`,
  "/check": () => `# Agent Readability Check — grow.contact

> Free URL scanner. Scores any site across 6 signals.

Signals: Semantic HTML · JSON-LD · llms.txt · Citability · Speed · Protocol Discovery (new).

No signup required. Run it at [${SITE_ORIGIN}/check](${SITE_ORIGIN}/check).
`,
  "/services": () => `# Services — grow.contact

- Agent-Native Website Build — fixed-price marketing site, AI-citable from day one
- Agent Readability Audit — graded /check report with a written fix plan
- Schema Optimization — JSON-LD, llms.txt, MCP, OpenAPI for existing sites

Pricing at ${SITE_ORIGIN}/pricing.
`,
};

export function buildMarkdownTwin(pathname: string): { body: string } | null {
  // Strip trailing slash for matching.
  const key = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  const twin = MARKDOWN_TWINS[key];
  if (twin) return { body: twin() };

  // Fallback: only respond with markdown when the path looks like a real
  // page (no extension, no API prefix). For everything else, return null
  // and let the SSR handler answer.
  if (key.startsWith("/api/") || key.startsWith("/.well-known/") || /\.[a-z0-9]+$/i.test(key)) {
    return null;
  }
  return {
    body: `# grow.contact — ${key}

> No curated markdown twin for this route yet. See the full site summary at
> [/llms.txt](${SITE_ORIGIN}/llms.txt) or fetch the HTML version of this URL.

- Site summary: ${SITE_ORIGIN}/llms.txt
- API catalog: ${SITE_ORIGIN}/api/public/v1/openapi.json
- MCP endpoint: ${SITE_ORIGIN}/api/public/mcp
- Auth metadata: ${SITE_ORIGIN}/.well-known/oauth-protected-resource
`,
  };
}
