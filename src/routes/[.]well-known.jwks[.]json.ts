// RFC 7517 — JSON Web Key Set
// citation.is uses opaque bearer tokens (not JWTs) for the MCP endpoint, so the
// key set is intentionally empty. Published so OAuth discovery (RFC 8414) resolves.
import { createFileRoute } from "@tanstack/react-router";

const jwks = { keys: [] as const };

export const Route = createFileRoute("/.well-known/jwks.json")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(jwks), {
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
