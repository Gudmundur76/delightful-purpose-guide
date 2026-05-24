import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailInternal } from "@/lib/email/send-internal";

export const sendReportEmailTool = defineTool({
  name: "send_report_email",
  description:
    "Send (enqueue) a report email to a lead using a registered transactional template. Closes the loop: report generated → email queued → sent.",
  parameters: z.object({
    lead_id: z.string().uuid(),
    template: z.string().min(1).max(80).default("report_followup"),
    template_data: z.record(z.string(), z.any()).default({}),
  }),
  execute: async ({ lead_id, template, template_data }) => {
    const { data: lead, error } = await supabaseAdmin
      .from("leads")
      .select("id, email, name")
      .eq("id", lead_id)
      .maybeSingle();
    if (error || !lead) return JSON.stringify({ ok: false, error: error?.message ?? "lead not found" });
    const result = await sendTransactionalEmailInternal({
      templateName: template,
      recipientEmail: (lead as { email: string }).email,
      templateData: { name: (lead as { name: string }).name, ...template_data },
    });
    return JSON.stringify({ ok: result.ok, lead_id, ...result }, null, 2);
  },
});

export const triggerClientAlertTool = defineTool({
  name: "trigger_client_alert",
  description:
    "Email a client an alert (score drop, competitor gain, citation won). Uses a transactional template — pass subject/body via template_data when the template supports it.",
  parameters: z.object({
    email: z.string().email(),
    subject: z.string().min(1).max(200),
    message: z.string().min(1).max(4000),
    template: z.string().min(1).max(80).default("lead_notification"),
  }),
  execute: async ({ email, subject, message, template }) => {
    const result = await sendTransactionalEmailInternal({
      templateName: template,
      recipientEmail: email,
      templateData: { subject, message, body: message },
    });
    return JSON.stringify({ ok: result.ok, ...result }, null, 2);
  },
});
