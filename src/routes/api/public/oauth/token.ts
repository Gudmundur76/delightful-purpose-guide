// RFC 6749 §4.4 — OAuth 2.0 Client Credentials Grant
// Exchanges a client_id + client_secret for the MCP bearer token.
// Supports both client_secret_basic (HTTP Basic) and client_secret_post.
import { createFileRoute } from "@tanstack/react-router";
import { timingSafeEqual } from "node:crypto";

function jsonError(error: string, description: string, status = 400) {
  return new Response(
    JSON.stringify({ error, error_description: description }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        Pragma: "no-cache",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

function safeEq(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export const Route = createFileRoute("/api/public/oauth/token")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
          },
        }),
      POST: async ({ request }) => {
        const expectedClientId = process.env.OAUTH_CLIENT_ID;
        const expectedClientSecret = process.env.OAUTH_CLIENT_SECRET;
        const mcpSecret = process.env.MCP_SECRET;

        if (!expectedClientId || !expectedClientSecret || !mcpSecret) {
          return jsonError(
            "server_error",
            "OAuth token endpoint is not configured.",
            503,
          );
        }

        // Parse form-urlencoded body (RFC 6749 §3.2)
        const ct = request.headers.get("content-type") ?? "";
        if (!ct.includes("application/x-www-form-urlencoded")) {
          return jsonError(
            "invalid_request",
            "Content-Type must be application/x-www-form-urlencoded.",
          );
        }
        const form = new URLSearchParams(await request.text());

        const grantType = form.get("grant_type");
        if (grantType !== "client_credentials") {
          return jsonError(
            "unsupported_grant_type",
            "Only client_credentials is supported.",
          );
        }

        // Extract credentials: HTTP Basic first, then body params
        let clientId: string | null = null;
        let clientSecret: string | null = null;
        const authz = request.headers.get("authorization");
        if (authz?.toLowerCase().startsWith("basic ")) {
          try {
            const decoded = Buffer.from(authz.slice(6).trim(), "base64").toString("utf8");
            const idx = decoded.indexOf(":");
            if (idx > 0) {
              clientId = decoded.slice(0, idx);
              clientSecret = decoded.slice(idx + 1);
            }
          } catch {
            return jsonError("invalid_client", "Malformed Basic credentials.", 401);
          }
        }
        if (!clientId) clientId = form.get("client_id");
        if (!clientSecret) clientSecret = form.get("client_secret");

        if (!clientId || !clientSecret) {
          return jsonError("invalid_client", "Missing client credentials.", 401);
        }
        if (!safeEq(clientId, expectedClientId) || !safeEq(clientSecret, expectedClientSecret)) {
          return jsonError("invalid_client", "Invalid client credentials.", 401);
        }

        const body = {
          access_token: mcpSecret,
          token_type: "Bearer",
          expires_in: 3600,
          scope: "mcp:read mcp:write",
        };

        return new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
            Pragma: "no-cache",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
