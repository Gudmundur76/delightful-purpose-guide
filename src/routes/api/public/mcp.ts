import { createFileRoute } from "@tanstack/react-router";
import { createMcpServer, withMcpAuth } from "mcp-tanstack-start";
import { pingTool } from "@/lib/mcp/tools/ping";
import { siteInfoTool } from "@/lib/mcp/tools/site-info";
import { brandKitTool } from "@/lib/mcp/tools/brand-kit";
import { copyTool } from "@/lib/mcp/tools/copy";
import { submitForReviewTool } from "@/lib/mcp/tools/submit-for-review";

const mcp = createMcpServer({
  name: "grow-contact-mcp",
  version: "1.1.0",
  instructions:
    "Tools for building with the grow.contact standards. Pull get_brand_kit + get_copy before generating UI, then call submit_for_review with the preview URL so a human approves before launch.",
  tools: [pingTool, siteInfoTool, brandKitTool, copyTool, submitForReviewTool],
});

const methodNotAllowed = () =>
  new Response(
    JSON.stringify({
      jsonrpc: "2.0",
      error: { code: -32000, message: "Method not allowed." },
      id: null,
    }),
    {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        Allow: "POST, OPTIONS",
      },
    },
  );

const authenticatedHandler = withMcpAuth(
  async (request, auth) => {
    return mcp.handleRequest(request, { auth });
  },
  async (request) => {
    const expected = process.env.MCP_SECRET;
    if (!expected) return null;
    const token = request.headers
      .get("Authorization")
      ?.replace(/^Bearer\s+/i, "");
    if (!token || token !== expected) return null;
    return { token };
  },
);

export const Route = createFileRoute("/api/public/mcp")({
  server: {
    handlers: {
      POST: async ({ request }) => authenticatedHandler(request),
      GET: async () => methodNotAllowed(),
      DELETE: async () => methodNotAllowed(),
    },
  },
});
