// Server-only: scan all monitored_sites due for re-scan, persist, and fire
// drop alerts to email/webhook when score drops by alert_threshold or more.
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { scanUrl } from "@/lib/check/scan.functions";
import { sendTransactionalEmailInternal } from "@/lib/email/send-internal";

function intervalMs(interval: string): number {
  switch (interval) {
    case "hourly": return 60 * 60 * 1000;
    case "daily": return 24 * 60 * 60 * 1000;
    case "weekly": return 7 * 24 * 60 * 60 * 1000;
    default: return 7 * 24 * 60 * 60 * 1000;
  }
}

async function fireAlert(site: {
  url: string;
  alert_email: string | null;
  alert_webhook_url: string | null;
}, prev: number, next: number) {
  const payload = {
    event: "score_drop",
    url: site.url,
    previous_score: prev,
    new_score: next,
    delta: prev - next,
    at: new Date().toISOString(),
  };
  if (site.alert_webhook_url) {
    try {
      await fetch(site.alert_webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error("[monitor] webhook alert failed", (e as Error).message);
    }
  }
  if (site.alert_email) {
    try {
      await sendTransactionalEmailInternal({
        templateName: "monitor-alert",
        recipientEmail: site.alert_email,
        templateData: {
          url: site.url,
          previousScore: prev,
          newScore: next,
          delta: prev - next,
        },
        idempotencyKey: `monitor-${site.url}-${prev}-${next}-${Math.floor(Date.now() / 60000)}`,
      });
    } catch (e) {
      console.error("[monitor] email alert failed", (e as Error).message);
    }
  }
}

export async function runDueMonitoredSites(limit = 25) {
  // Fetch active sites + their owner's plan interval.
  const { data: sites, error } = await supabaseAdmin
    .from("monitored_sites")
    .select("id,user_id,url,last_score,last_scanned_at,alert_threshold,alert_email,alert_webhook_url")
    .eq("paused", false)
    .order("last_scanned_at", { ascending: true, nullsFirst: true })
    .limit(limit);
  if (error) throw new Error(error.message);

  const now = Date.now();
  const results: Array<Record<string, unknown>> = [];

  for (const site of sites ?? []) {
    // Look up the user's plan interval (cheap; small N per cron tick).
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("plan_id,status")
      .eq("user_id", site.user_id)
      .maybeSingle();
    const planId = sub?.status === "active" ? sub.plan_id : "free";
    const { data: plan } = await supabaseAdmin
      .from("subscription_plans")
      .select("scan_interval")
      .eq("id", planId)
      .single();
    const minMs = intervalMs(plan?.scan_interval ?? "weekly");
    const last = site.last_scanned_at ? new Date(site.last_scanned_at).getTime() : 0;
    if (now - last < minMs) continue;

    try {
      const scan = await scanUrl({ data: { url: site.url, source: "monitor" } });
      const overall = (scan as { overall?: number } | null)?.overall ?? null;
      await supabaseAdmin
        .from("monitored_sites")
        .update({ last_score: overall, last_scanned_at: new Date().toISOString() })
        .eq("id", site.id);
      if (
        overall != null &&
        site.last_score != null &&
        site.last_score - overall >= site.alert_threshold
      ) {
        await fireAlert(site, site.last_score, overall);
      }
      results.push({ id: site.id, url: site.url, ok: true, score: overall });
    } catch (e) {
      results.push({ id: site.id, url: site.url, ok: false, error: (e as Error).message });
    }
  }
  return { processed: results.length, results };
}
