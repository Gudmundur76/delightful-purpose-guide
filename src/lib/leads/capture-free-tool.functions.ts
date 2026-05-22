import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { rateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";
import { qualifyLeadAndSendReplies } from "@/lib/leads/qualify.server";

const Schema = z.object({
  email: z.string().trim().email().max(254),
  source: z.enum(["check_report", "badge", "leaderboard"]),
  context: z.string().trim().max(500).optional(),
});

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "there";
  return local.replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 60);
}

function messageFor(source: string, context?: string): string {
  const base =
    source === "check_report"
      ? "Requested PDF report from /check"
      : source === "badge"
        ? "Generated agent-readability badge embed"
        : source === "leaderboard"
          ? "Subscribed to leaderboard updates"
          : "Free tool capture";
  return context ? `${base} — ${context}` : base;
}

/**
 * Capture an email from a free tool into the leads table and trigger
 * AI qualification + auto-reply, same pipeline as the contact form.
 * Failures are swallowed; UX must not depend on this.
 */
export const captureFreeToolLead = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    try {
      const req = getRequest();
      const ip = clientIpFromRequest(req);
      if (rateLimit(`free-tool-lead:${ip}`, 8, 10 * 60_000)) {
        return { ok: false, error: "rate_limited" as const };
      }
    } catch {
      // non-request context — continue.
    }

    const name = nameFromEmail(data.email);
    const message = messageFor(data.source, data.context);

    const { data: inserted, error } = await supabaseAdmin
      .from("leads")
      .insert({
        name,
        email: data.email,
        budget_tier: "unknown",
        message,
        source: data.source,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      console.error("[captureFreeToolLead] insert failed", error);
      return { ok: false, error: "insert_failed" as const };
    }

    // Qualify + auto-reply in the same request — Workers may suspend the
    // context once we return, so do not fire-and-forget.
    await qualifyLeadAndSendReplies({
      id: inserted.id,
      name,
      email: data.email,
      budget_tier: "unknown",
      message,
    }).catch((e) => console.error("[captureFreeToolLead] qualify failed", e));

    return { ok: true as const, id: inserted.id };
  });
