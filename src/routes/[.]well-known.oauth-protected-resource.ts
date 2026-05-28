// RFC 9728 — OAuth 2.0 Protected Resource Metadata (PRM)
// Advertises the authorization server, scopes, and bearer-token usage for
// grow.contact's protected resources (public REST API + MCP endpoint).
import { createFileRoute } from "@tanstack/react-router";
import { buildLinkHeader, oauthProtectedResourceMetadata } from "../lib/agent-protocol";

const prm = oauthProtectedResourceMetadata();

export const Route = createFileRoute("/.well-known/oauth-protected-resource")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(prm, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
            Link: buildLinkHeader(),
          },
        }),
    },
  },
});
