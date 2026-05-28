// RFC 8414 — OAuth 2.0 Authorization Server Metadata
// Discovery document so AI agents can programmatically authenticate to grow.contact APIs.
import { createFileRoute } from "@tanstack/react-router";

const ISSUER = "https://grow.contact";

const metadata = {
  issuer: ISSUER,
  authorization_endpoint: `${ISSUER}/api/public/oauth/authorize`,
  token_endpoint: `${ISSUER}/api/public/oauth/token`,
  jwks_uri: `${ISSUER}/.well-known/jwks.json`,
  registration_endpoint: `${ISSUER}/contact`,
  scopes_supported: ["mcp:read", "mcp:write", "api:read"],
  response_types_supported: ["token"],
  grant_types_supported: ["client_credentials"],
  token_endpoint_auth_methods_supported: [
    "client_secret_basic",
    "client_secret_post",
  ],
  service_documentation: `${ISSUER}/auth.md`,
  ui_locales_supported: ["en-US"],
  // Non-standard but useful for agents
  resource_documentation: `${ISSUER}/.well-known/api-catalog`,
  mcp_server_metadata: `${ISSUER}/.well-known/mcp.json`,
};

export const Route = createFileRoute("/.well-known/oauth-authorization-server")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(metadata, null, 2), {
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
