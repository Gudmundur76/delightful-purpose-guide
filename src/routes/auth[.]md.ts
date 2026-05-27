// /auth.md — describes how AI agents authenticate to the grow.contact public API.
// Required by the agent-readiness "Auth.md" check; must include an `Auth.md` heading.
import { createFileRoute } from "@tanstack/react-router";

const body = `# Auth.md

grow.contact uses simple API key authentication for its public REST API and bearer-token authentication for its MCP endpoint.

## REST API — \`x-api-key\`

- Auth scheme: API key in the \`x-api-key\` request header.
- Issuance: free, self-service at https://grow.contact/api-docs
- Base URL: https://grow.contact/api/public/v1/
- OpenAPI spec: https://grow.contact/api/public/v1/openapi.json
- Catalog: https://grow.contact/.well-known/api-catalog
- Rate limits: documented in the OpenAPI spec; 429 responses include \`Retry-After\`.

Example:

\`\`\`
GET https://grow.contact/api/public/v1/readiness
x-api-key: <YOUR_KEY>
\`\`\`

## MCP server — \`Authorization: Bearer\`

- Endpoint: https://grow.contact/api/public/mcp
- Transport: MCP Streamable HTTP (POST). \`GET\` and \`DELETE\` return 405.
- Auth scheme: bearer token in the \`Authorization\` header.
- Server card: https://grow.contact/.well-known/mcp/server-card.json
- Token issuance: by request via https://grow.contact/contact

Example:

\`\`\`
POST https://grow.contact/api/public/mcp
Authorization: Bearer <MCP_TOKEN>
Content-Type: application/json
Accept: application/json, text/event-stream
\`\`\`

## OAuth / OpenID Connect

Not used. grow.contact does not expose end-user delegated flows; the public surfaces above are key/bearer authenticated only. Agents that require OAuth should integrate against a downstream provider, not against grow.contact.

## Agent registration

There is no programmatic agent-registration endpoint. To request an API key or MCP token, contact https://grow.contact/contact.

## Security contact

Report vulnerabilities or misuse at https://grow.contact/contact. See also https://grow.contact/privacy and https://grow.contact/terms.
`;

export const Route = createFileRoute("/auth.md")({
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
