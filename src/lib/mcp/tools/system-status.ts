import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { getSystemStatus } from "@/lib/status/status.functions";

export const systemStatusTool = defineTool({
  name: "get_system_status",
  description:
    "Live status of citation.is public surfaces (website, blog, /check, /leaderboard, Public API, OpenAPI, llms.txt, sitemap) plus 24h scan throughput and 7d totals. Probes run server-side at call time.",
  parameters: z.object({}),
  execute: async () => {
    const s = await getSystemStatus();
    return JSON.stringify(s, null, 2);
  },
});
