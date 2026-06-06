import { createFileRoute } from "@tanstack/react-router";

// Convention alias: many agents probe /api/mcp.
// Forward POST to the real MCP endpoint; GET returns the server card.
export const Route = createFileRoute("/api/mcp")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return Response.redirect(`${url.origin}/.well-known/mcp.json`, 308);
      },
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const target = `${url.origin}/api/public/mcp${url.search}`;
        const body = await request.arrayBuffer();
        const headers = new Headers(request.headers);
        headers.delete("host");
        headers.delete("content-length");
        return fetch(target, { method: "POST", headers, body });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            Allow: "GET, POST, OPTIONS",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept",
          },
        }),
    },
  },
});
