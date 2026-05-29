// Server-only quota helpers for the monitoring SaaS.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type PlanRow = {
  id: string;
  name: string;
  monthly_scan_quota: number;
  max_sites: number;
  scan_interval: string;
};

function periodKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getUserPlan(userId: string): Promise<PlanRow> {
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("plan_id,status")
    .eq("user_id", userId)
    .maybeSingle();

  const planId =
    sub && sub.status === "active" ? sub.plan_id : "free";

  const { data: plan, error } = await supabaseAdmin
    .from("subscription_plans")
    .select("id,name,monthly_scan_quota,max_sites,scan_interval")
    .eq("id", planId)
    .single();
  if (error || !plan) throw new Error(`plan ${planId} missing`);
  return plan as PlanRow;
}

export async function getUsage(userId: string): Promise<{ used: number; period: string }> {
  const period = periodKey();
  const { data } = await supabaseAdmin
    .from("scan_quota_usage")
    .select("scans_used")
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();
  return { used: (data as { scans_used?: number } | null)?.scans_used ?? 0, period };
}

/** Atomically increment usage and return remaining. Throws if quota exceeded. */
export async function consumeQuota(userId: string): Promise<{
  plan: PlanRow;
  used: number;
  remaining: number;
}> {
  const plan = await getUserPlan(userId);
  const period = periodKey();

  const { data: existing } = await supabaseAdmin
    .from("scan_quota_usage")
    .select("scans_used")
    .eq("user_id", userId)
    .eq("period", period)
    .maybeSingle();

  const used = (existing as { scans_used?: number } | null)?.scans_used ?? 0;
  if (used >= plan.monthly_scan_quota) {
    throw new Error(`quota_exceeded:${plan.id}:${used}/${plan.monthly_scan_quota}`);
  }

  if (existing) {
    await supabaseAdmin
      .from("scan_quota_usage")
      .update({ scans_used: used + 1 })
      .eq("user_id", userId)
      .eq("period", period);
  } else {
    await supabaseAdmin
      .from("scan_quota_usage")
      .insert({ user_id: userId, period, scans_used: 1 });
  }
  return { plan, used: used + 1, remaining: plan.monthly_scan_quota - (used + 1) };
}
