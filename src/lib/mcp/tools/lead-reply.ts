import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const saveLeadReplyTool = defineTool({
  name: "save_lead_reply",
  description:
    "Attach a drafted auto-reply (subject + body) to a lead. Does not send the email — admin sends from /admin/leads. Use after generate_outreach_email to stage a personalized reply.",
  parameters: z.object({
    lead_id: z.string().uuid(),
    subject: z.string().min(1).max(300),
    body: z.string().min(1).max(8000),
  }),
  execute: async ({ lead_id, subject, body }) => {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .update({ auto_reply_subject: subject, auto_reply_body: body })
      .eq("id", lead_id)
      .select("id, email, auto_reply_subject")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, lead: data }, null, 2);
  },
});

export const requalifyLeadTool = defineTool({
  name: "requalify_lead",
  description:
    "Manually override a lead's qualification (tier, score 0-100, reasoning, suggested_tier). Useful when the AI scorer mis-tiers a hot lead.",
  parameters: z.object({
    lead_id: z.string().uuid(),
    qualification_tier: z.enum(["hot", "warm", "cold", "spam"]),
    qualification_score: z.number().int().min(0).max(100),
    qualification_reasoning: z.string().max(2000),
    qualification_suggested_tier: z.string().max(40).optional(),
  }),
  execute: async ({ lead_id, ...patch }) => {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .update(patch)
      .eq("id", lead_id)
      .select("id, qualification_tier, qualification_score")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, lead: data }, null, 2);
  },
});
