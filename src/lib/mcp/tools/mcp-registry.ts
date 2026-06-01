import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listRegisteredMcpSitesTool = defineTool({
  name: "list_registered_mcp_sites",
  description:
    "List WordPress sites that have installed grow-mcp and registered their MCP endpoint with grow.contact. Returns domain, mcp_endpoint, tools_count, registered_at. Use this as the agent-native directory.",
  parameters: z.object({
    limit: z.number().int().min(1).max(200).default(50),
  }),
  execute: async ({ limit }) => {
    const { data, error } = await supabaseAdmin
      .from("intervention_sites")
      .select("domain, mcp_endpoint, mcp_tools_count, mcp_registered_at, mcp_last_seen_at, ccs_score")
      .not("mcp_endpoint", "is", null)
      .order("mcp_registered_at", { ascending: false })
      .limit(limit);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, sites: data ?? [] }, null, 2);
  },
});
