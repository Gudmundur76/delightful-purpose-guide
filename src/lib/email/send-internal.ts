// Server-only helper to enqueue a transactional email from trusted server code
// (e.g. public form handlers) without requiring a Supabase user JWT.
import * as React from "react";
import { render } from "@react-email/components";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { TEMPLATES } from "@/lib/email-templates/registry";

const SITE_NAME = "Grow";
const SENDER_DOMAIN = "notify.citation.is";
const FROM_DOMAIN = "notify.citation.is";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export interface SendInternalParams {
  templateName: string;
  recipientEmail?: string;
  templateData?: Record<string, any>;
  idempotencyKey?: string;
}

export async function sendTransactionalEmailInternal(params: SendInternalParams) {
  const { templateName, templateData = {} } = params;
  const template = TEMPLATES[templateName];
  if (!template) {
    console.error("Email template not found", { templateName });
    return { ok: false, reason: "template_not_found" as const };
  }

  const effectiveRecipient = template.to || params.recipientEmail;
  if (!effectiveRecipient) {
    return { ok: false, reason: "no_recipient" as const };
  }

  const messageId = crypto.randomUUID();
  const idempotencyKey = params.idempotencyKey || messageId;
  const normalizedEmail = effectiveRecipient.toLowerCase();

  // Suppression check
  const { data: suppressed } = await supabaseAdmin
    .from("suppressed_emails")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (suppressed) {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "suppressed",
    });
    return { ok: false, reason: "suppressed" as const };
  }

  // Get-or-create unsubscribe token
  let unsubscribeToken: string;
  const { data: existingToken } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existingToken && !existingToken.used_at) {
    unsubscribeToken = existingToken.token;
  } else if (!existingToken) {
    unsubscribeToken = generateToken();
    await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .upsert(
        { token: unsubscribeToken, email: normalizedEmail },
        { onConflict: "email", ignoreDuplicates: true },
      );
    const { data: stored } = await supabaseAdmin
      .from("email_unsubscribe_tokens")
      .select("token")
      .eq("email", normalizedEmail)
      .maybeSingle();
    unsubscribeToken = stored?.token ?? unsubscribeToken;
  } else {
    return { ok: false, reason: "token_used" as const };
  }

  // Render
  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: effectiveRecipient,
    status: "pending",
  });

  const { error } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: effectiveRecipient,
      from: `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      sender_domain: SENDER_DOMAIN,
      subject,
      html,
      text,
      purpose: "transactional",
      label: templateName,
      idempotency_key: idempotencyKey,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (error) {
    console.error("enqueue_email failed", { error, templateName });
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: effectiveRecipient,
      status: "failed",
      error_message: "Failed to enqueue email",
    });
    return { ok: false, reason: "enqueue_failed" as const };
  }

  return { ok: true, messageId };
}
