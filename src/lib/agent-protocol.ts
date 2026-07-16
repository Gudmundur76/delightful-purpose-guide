// Agent-protocol surfaces for citation.is.
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

const SITE_ORIGIN = "https://citation.is";
const AUTH_MD_URL = `${SITE_ORIGIN}/auth.md`;
const AGENT_REGISTRATION_URL = `${SITE_ORIGIN}/contact`;
const AGENT_CREDENTIAL_TYPES = ["api_key", "access_token"];

// Skill manifest body — kept here so the hash in the agent-skills index is
// computed from the exact bytes we serve at /.well-known/agent-skills/grow-geo-scan.md.
const GROW_GEO_SCAN_SKILL = `# grow-geo-scan

Score any URL against the Grow GEO Standard (6 signals, 0–100) — semantic HTML, JSON-LD, llms.txt, citability, speed, and protocol discovery.

## Endpoint
POST https://citation.is/api/public/v1/analyze
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
    `<${SITE_ORIGIN}/.well-known/oauth-authorization-server>; rel="oauth-authorization-server"`,
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
    case "/.well-known/oauth-authorization-server":
      return jsonResponse(oauthAuthorizationServerMetadata());
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
    publisher: { name: "citation.is", url: SITE_ORIGIN },
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
// Advertise citation.is as the authorization server so agents discover the
// matching RFC 8414 document with our agent_auth registration metadata.
function agentAuthMetadata() {
  return {
    skill: AUTH_MD_URL,
    register_uri: AGENT_REGISTRATION_URL,
    claim_uri: AGENT_REGISTRATION_URL,
    revocation_uri: AGENT_REGISTRATION_URL,
    identity_types_supported: ["anonymous"],
    credential_types_supported: AGENT_CREDENTIAL_TYPES,
    anonymous: {
      credential_types_supported: AGENT_CREDENTIAL_TYPES,
      claim_uri: AGENT_REGISTRATION_URL,
      revocation_uri: AGENT_REGISTRATION_URL,
    },
    registration_methods: [
      {
        type: "anonymous",
        register_uri: AGENT_REGISTRATION_URL,
        claim_uri: AGENT_REGISTRATION_URL,
        revocation_uri: AGENT_REGISTRATION_URL,
        credential_types_supported: AGENT_CREDENTIAL_TYPES,
        description:
          "Request an API key or MCP access token via the contact form. Credentials are issued (and revoked) out-of-band after review.",
      },
    ],
  };
}

export function oauthProtectedResourceMetadata() {
  return {
    resource: SITE_ORIGIN,
    resource_name: "citation.is",
    authorization_servers: [SITE_ORIGIN],
    bearer_methods_supported: ["header"],
    resource_documentation: AUTH_MD_URL,
    scopes_supported: ["mcp:read", "mcp:write", "api:read"],
    resource_signing_alg_values_supported: ["RS256"],
    agent_auth: agentAuthMetadata(),
  };
}

export function oauthAuthorizationServerMetadata() {
  return {
    issuer: SITE_ORIGIN,
    resource: SITE_ORIGIN,
    authorization_servers: [SITE_ORIGIN],
    authorization_endpoint: `${SITE_ORIGIN}/api/public/oauth/authorize`,
    token_endpoint: `${SITE_ORIGIN}/api/public/oauth/token`,
    jwks_uri: `${SITE_ORIGIN}/.well-known/jwks.json`,
    registration_endpoint: AGENT_REGISTRATION_URL,
    scopes_supported: ["mcp:read", "mcp:write", "api:read"],
    bearer_methods_supported: ["header"],
    response_types_supported: ["token"],
    grant_types_supported: ["client_credentials"],
    token_endpoint_auth_methods_supported: [
      "client_secret_basic",
      "client_secret_post",
    ],
    service_documentation: AUTH_MD_URL,
    resource_documentation: `${SITE_ORIGIN}/.well-known/api-catalog`,
    mcp_server_metadata: `${SITE_ORIGIN}/.well-known/mcp.json`,
    agent_auth: agentAuthMetadata(),
  };
}

export function authMarkdown(): string {
  return `# auth.md

Agent registration and authentication metadata for citation.is.

## OAuth metadata

- Protected-resource metadata: ${SITE_ORIGIN}/.well-known/oauth-protected-resource
- Authorization-server metadata: ${SITE_ORIGIN}/.well-known/oauth-authorization-server
- Token endpoint: ${SITE_ORIGIN}/api/public/oauth/token
- JWKS: ${SITE_ORIGIN}/.well-known/jwks.json

## Agent registration

citation.is supports anonymous agent registration by human request. Request an
API key for the public REST API or an MCP access token via ${AGENT_REGISTRATION_URL}.

- Identity type: anonymous
- Credential types: api_key, access_token
- Claim URI: ${AGENT_REGISTRATION_URL}
- Register URI: ${AGENT_REGISTRATION_URL}

## For agents

- Public REST API keys use the \`x-api-key\` request header.
- MCP access tokens use \`Authorization: Bearer <token>\`.
- Public, unauthenticated surfaces (no token required):
  - \`GET /\`, \`GET /llms.txt\`, \`GET /sitemap.xml\`
  - \`GET /api/public/v1/openapi.json\`
  - \`GET /api/public/v1/readiness\`, \`GET /api/public/ping\`
  - \`POST /api/public/v1/analyze\` (rate-limited)
  - \`POST /api/public/v1/leads\` (rate-limited)
- MCP endpoint: \`POST /api/public/mcp\`

## For humans

- Sign in at [/login](${SITE_ORIGIN}/login).
- Account settings live on the dashboard at [/dashboard](${SITE_ORIGIN}/dashboard).
- API keys and MCP bearer tokens are issued on request via ${SITE_ORIGIN}/contact.

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
  "/": () => `# citation.is

> Free, open infrastructure for AI search visibility. No paywall, no account, no upsell.

citation.is is an open scanner, an open standard, an open MCP server, and an
open WordPress plugin — all free forever. Point any of them at your site to
make it citable by ChatGPT, Perplexity, Claude, and Google AI Overviews.

## Tools (all free)
- **Scanner** — score any URL against the Agent-Native Web Standard: [${SITE_ORIGIN}/check](${SITE_ORIGIN}/check)
- **Playground** — try every tool live in the browser: [${SITE_ORIGIN}/playground](${SITE_ORIGIN}/playground)
- **MCP server** — connect Claude/ChatGPT/Cursor: [${SITE_ORIGIN}/mcp-server](${SITE_ORIGIN}/mcp-server)
- **Browser extension** — inline scores as you browse: [${SITE_ORIGIN}/extension](${SITE_ORIGIN}/extension)
- **CLI** — fail builds below your threshold: [${SITE_ORIGIN}/cli](${SITE_ORIGIN}/cli)

## Proof
- Live leaderboard of audited sites: [${SITE_ORIGIN}/leaderboard](${SITE_ORIGIN}/leaderboard)
- The Standard (CC-BY, forkable): [${SITE_ORIGIN}/standard](${SITE_ORIGIN}/standard)
- Machine-readable via the [MCP endpoint](${SITE_ORIGIN}/api/public/mcp)

## Contact
- Email: hello@citation.is
`,
  "/check": () => `# Agent Readability Check — citation.is

> Free URL scanner. Scores any site across 6 signals.

Signals: Semantic HTML · JSON-LD · llms.txt · Citability · Speed · Protocol Discovery.

No signup required. Run it at [${SITE_ORIGIN}/check](${SITE_ORIGIN}/check).
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
    body: `# citation.is — ${key}

> No curated markdown twin for this route yet. See the full site summary at
> [/llms.txt](${SITE_ORIGIN}/llms.txt) or fetch the HTML version of this URL.

- Site summary: ${SITE_ORIGIN}/llms.txt
- API catalog: ${SITE_ORIGIN}/api/public/v1/openapi.json
- MCP endpoint: ${SITE_ORIGIN}/api/public/mcp
- Auth metadata: ${SITE_ORIGIN}/.well-known/oauth-protected-resource
`,
  };
}
