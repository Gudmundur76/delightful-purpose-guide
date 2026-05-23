import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const pingTool = defineTool({
  name: "ping",
  description: "Health check. Returns 'pong' with an optional echo message.",
  parameters: z.object({
    message: z.string().optional().describe("Optional message to echo back"),
  }),
  execute: async ({ message }) => {
    return `pong${message ? `: ${message}` : ""}`;
  },
});
