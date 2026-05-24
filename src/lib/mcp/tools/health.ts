import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const healthCheckTool = defineTool({
  name: "health_check",
  description:
    "Self-test: verifies DB connectivity, env vars, and returns build timestamp. Use to confirm the MCP server is fully operational.",
  parameters: z.object({}),
  execute: async () => {
    const checks: Record<string, { ok: boolean; detail?: string }> = {};
    try {
      const { error } = await supabaseAdmin.from("products").select("id", { head: true, count: "exact" });
      checks.database = { ok: !error, detail: error?.message };
    } catch (e) {
      checks.database = { ok: false, detail: (e as Error).message };
    }
    checks.mcp_secret = { ok: !!process.env.MCP_SECRET };
    checks.lovable_ai = { ok: !!process.env.LOVABLE_API_KEY };
    checks.supabase_service = { ok: !!process.env.SUPABASE_SERVICE_ROLE_KEY };
    const allOk = Object.values(checks).every((c) => c.ok);
    return JSON.stringify(
      { ok: allOk, timestamp: new Date().toISOString(), checks },
      null,
      2,
    );
  },
});
