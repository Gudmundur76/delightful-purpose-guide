import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Connectivity sanity check for the OAuth-protected /mcp endpoint.
export default defineTool({
  name: "ping",
  title: "Ping",
  description: "Echo text back. Use to verify MCP connectivity and authentication.",
  inputSchema: { text: z.string().min(1).describe("Text to echo back.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ text }, ctx) => ({
    content: [
      {
        type: "text",
        text: ctx.isAuthenticated()
          ? `Authenticated as ${ctx.getUserId() ?? "unknown"}: ${text}`
          : `Unauthenticated: ${text}`,
      },
    ],
  }),
});
