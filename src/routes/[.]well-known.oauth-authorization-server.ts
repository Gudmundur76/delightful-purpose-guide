// RFC 8414 — OAuth 2.0 Authorization Server Metadata
// Discovery document so AI agents can programmatically authenticate to grow.contact APIs.
import { createFileRoute } from "@tanstack/react-router";
import { buildLinkHeader, oauthAuthorizationServerMetadata } from "../lib/agent-protocol";

const metadata = oauthAuthorizationServerMetadata();

export const Route = createFileRoute("/.well-known/oauth-authorization-server")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(metadata, null, 2), {
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
