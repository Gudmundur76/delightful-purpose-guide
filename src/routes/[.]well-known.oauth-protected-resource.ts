// RFC 9728 — OAuth 2.0 Protected Resource Metadata (PRM)
// Advertises the authorization server, scopes, and bearer-token usage for
// grow.contact's protected resources (public REST API + MCP endpoint).
import { createFileRoute } from "@tanstack/react-router";

const ISSUER = "https://grow.contact";

const prm = {
  resource: ISSUER,
  authorization_servers: [ISSUER],
  scopes_supported: ["mcp:read", "mcp:write", "api:read"],
  bearer_methods_supported: ["header"],
  resource_documentation: `${ISSUER}/auth.md`,
  resource_signing_alg_values_supported: [] as string[],
  // Non-standard but useful for agents discovering the protected endpoints
  protected_resources: [
    `${ISSUER}/api/public/mcp`,
    `${ISSUER}/api/public/v1/`,
  ],
};

export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(prm, null, 2), {
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
