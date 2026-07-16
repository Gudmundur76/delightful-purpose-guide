import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Connectivity sanity check for the OAuth-protected /mcp endpoint.
export default defineTool({
  name: "ping",
  title: "Ping the grow.contact MCP",
  description:
    "When to use: first call after connecting, or when a later tool fails and you need to isolate auth vs. tool errors. Echoes your input and reports whether the caller is authenticated. Input: `text` (any short string). Returns: `Authenticated as <sub>: <text>` or `Unauthenticated: <text>`. Zero side effects. If this returns Unauthenticated, stop — every other tool will behave as anonymous.",
  inputSchema: { text: z.string().min(1).describe("Any short string to echo back — used only to confirm the round-trip.") },
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
