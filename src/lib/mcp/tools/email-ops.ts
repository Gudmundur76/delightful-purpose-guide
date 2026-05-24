import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listEmailLogTool = defineTool({
  name: "list_email_log",
  description:
    "Recent transactional/auth email send log entries (template, recipient, status, error, created_at). Filter by status or template.",
  parameters: z.object({
    status: z.enum(["sent", "failed", "queued", "skipped"]).optional(),
    template: z.string().max(120).optional(),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  execute: async ({ status, template, limit }) => {
    let q = supabaseAdmin
      .from("email_send_log")
      .select("id, template_name, recipient_email, status, error_message, message_id, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    if (template) q = q.eq("template_name", template);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, entries: data }, null, 2);
  },
});

export const emailDeliveryStatsTool = defineTool({
  name: "get_email_delivery_stats",
  description:
    "Aggregated email outcomes grouped by status and template over last N days. Useful for spotting deliverability issues.",
  parameters: z.object({
    days: z.number().int().min(1).max(90).default(7),
  }),
  execute: async ({ days }) => {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("email_send_log")
      .select("template_name, status")
      .gte("created_at", since)
      .limit(5000);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const rows = data ?? [];
    const byStatus: Record<string, number> = {};
    const byTemplate: Record<string, Record<string, number>> = {};
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      const t = (byTemplate[r.template_name] ??= {});
      t[r.status] = (t[r.status] ?? 0) + 1;
    }
    return JSON.stringify({ ok: true, days, total: rows.length, by_status: byStatus, by_template: byTemplate }, null, 2);
  },
});

export const isEmailSuppressedTool = defineTool({
  name: "is_email_suppressed",
  description: "Check whether a given email address is on the suppression list, and why.",
  parameters: z.object({ email: z.string().email() }),
  execute: async ({ email }) => {
    const { data, error } = await supabaseAdmin
      .from("suppressed_emails")
      .select("email, reason, metadata, created_at")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, suppressed: !!data, entry: data ?? null }, null, 2);
  },
});
