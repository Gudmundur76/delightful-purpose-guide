// MCP Server Card (SEP-1849) — agent-discovery metadata for the grow.contact MCP server.
// Served at both /.well-known/mcp.json and /.well-known/mcp/server-card.json
// (the second route imports this body).
import { createFileRoute } from "@tanstack/react-router";
import { serverCard } from "@/lib/agent-protocol/mcp-server-card";

export const Route = createFileRoute("/.well-known/mcp.json")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(serverCard, null, 2), {
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
