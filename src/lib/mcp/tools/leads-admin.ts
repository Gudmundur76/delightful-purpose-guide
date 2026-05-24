import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listLeadsTool = defineTool({
  name: "list_leads",
  description:
    "Admin: list recent leads with qualification scoring. Returns id, name, email, budget_tier, message, qualification_score/tier/reasoning, created_at.",
  parameters: z.object({
    tier: z.enum(["hot", "warm", "cold", "unqualified"]).optional(),
    min_score: z.number().int().min(0).max(100).optional(),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  execute: async ({ tier, min_score, limit }) => {
    let q = supabaseAdmin
      .from("leads")
      .select(
        "id, created_at, name, email, budget_tier, message, source, qualification_score, qualification_tier, qualification_reasoning, qualification_suggested_tier, auto_replied_at",
      )
      .order("created_at", { ascending: false })
      .limit(limit);
    if (tier) q = q.eq("qualification_tier", tier);
    if (typeof min_score === "number") q = q.gte("qualification_score", min_score);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, leads: data }, null, 2);
  },
});

export const getLeadTool = defineTool({
  name: "get_lead",
  description: "Admin: fetch a single lead by id with all qualification + auto-reply fields.",
  parameters: z.object({ id: z.string().uuid() }),
  execute: async ({ id }) => {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    if (!data) return JSON.stringify({ ok: false, error: "not_found" });
    return JSON.stringify({ ok: true, lead: data }, null, 2);
  },
});
