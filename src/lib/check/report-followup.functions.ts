import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { sendTransactionalEmailInternal } from "@/lib/email/send-internal";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { rateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";

const Schema = z.object({
  email: z.string().email().max(254),
  url: z.string().min(1).max(2048),
  score: z.number().min(0).max(100),
});

function normalizeHost(input: string): string | null {
  try {
    const u = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    return new URL(u).hostname.toLowerCase();
  } catch {
    return null;
  }
}

export const sendReportFollowup = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => Schema.parse(input))
  .handler(async ({ data }) => {
    // Per-IP rate limit — 5 follow-ups per 10 minutes per IP.
    try {
      const req = getRequest();
      const ip = clientIpFromRequest(req);
      if (rateLimit(`report-followup:${ip}`, 5, 10 * 60_000)) {
        return { ok: false, error: "rate_limited" as const };
      }
    } catch {
      // getRequest can fail in non-request contexts; fall through.
    }

    // Lock url/score to a real scan we performed server-side. This stops
    // attackers from using this endpoint as an open relay that embeds
    // arbitrary URLs in grow.contact-branded emails.
    const host = normalizeHost(data.url);
    if (!host) {
      return { ok: false, error: "invalid_url" as const };
    }
    const { data: scan } = await supabaseAdmin
      .from("scans")
      .select("url, overall, scanned_at")
      .eq("host", host)
      .order("scanned_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!scan) {
      return { ok: false, error: "no_scan_for_host" as const };
    }
    const verifiedUrl = scan.url;
    const verifiedScore = scan.overall;

    // Record the request for follow-up tracking.
    await supabaseAdmin.from("report_requests").insert({
      email: data.email,
      url: verifiedUrl,
      score: verifiedScore,
      source: "check",
    });

    const [followup, notify] = await Promise.allSettled([
      sendTransactionalEmailInternal({
        templateName: "report-followup",
        recipientEmail: data.email,
        templateData: { url: verifiedUrl, score: verifiedScore },
        idempotencyKey: `report-followup:${data.email}:${verifiedUrl}`,
      }),
      sendTransactionalEmailInternal({
        templateName: "scan-lead-notification",
        templateData: { email: data.email, url: verifiedUrl, score: verifiedScore },
        idempotencyKey: `scan-lead-notify:${data.email}:${verifiedUrl}`,
      }),
    ]);
    return {
      ok: true as const,
      followup: followup.status === "fulfilled" ? followup.value : { ok: false },
      notify: notify.status === "fulfilled" ? notify.value : { ok: false },
    };
  });
