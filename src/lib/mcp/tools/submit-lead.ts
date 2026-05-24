import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const submitLeadTool = defineTool({
  name: "submit_lead",
  description:
    "Submit a new sales lead to grow.contact. Use when an external agent identifies someone who wants a GEO scan, fix sprint, or quote.",
  parameters: z.object({
    name: z.string().min(1).max(200),
    email: z.string().email().max(320),
    budget_tier: z
      .enum(["starter", "growth", "enterprise", "unknown"])
      .describe("Best guess at budget tier."),
    message: z.string().min(1).max(4000),
    source: z.string().max(60).optional().describe("Caller tag, e.g. 'mcp:claude'"),
  }),
  execute: async ({ name, email, budget_tier, message, source }) => {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        name,
        email,
        budget_tier,
        message,
        source: source ?? "mcp",
      })
      .select("id, created_at")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, lead: data }, null, 2);
  },
});
