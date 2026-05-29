import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  cancelBillingSubscription,
  createBillingSubscription,
  getBillingSubscription,
} from "@/lib/paypal/subscriptions.server";

const SITE_URL = process.env.PUBLIC_SITE_URL || "https://grow.contact";

export const listPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("subscription_plans")
    .select("*")
    .order("price_cents", { ascending: true });
  return { plans: data ?? [] };
});

export const getMySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("subscriptions")
      .select("*, plan:subscription_plans(*)")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { subscription: data ?? null };
  });

export const startSubscriptionCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ planId: z.enum(["pro", "team"]) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: plan, error } = await supabaseAdmin
      .from("subscription_plans")
      .select("paypal_plan_id")
      .eq("id", data.planId)
      .single();
    if (error || !plan?.paypal_plan_id) throw new Error("plan_not_configured");
    const sub = await createBillingSubscription({
      planId: plan.paypal_plan_id,
      userId: context.userId,
      returnUrl: `${SITE_URL}/app/billing?paypal=success`,
      cancelUrl: `${SITE_URL}/app/billing?paypal=cancel`,
    });
    return sub;
  });

export const confirmSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ subscriptionId: z.string().min(5).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const remote = await getBillingSubscription(data.subscriptionId);
    // Map PayPal plan id back to our internal plan row.
    const { data: planRow } = await supabaseAdmin
      .from("subscription_plans")
      .select("id")
      .eq("paypal_plan_id", remote.plan_id)
      .maybeSingle();
    if (!planRow) throw new Error("unknown_plan");
    const periodEnd = remote.billing_info?.next_billing_time ?? null;
    const status = remote.status === "ACTIVE" ? "active" : remote.status.toLowerCase();

    await supabaseAdmin
      .from("subscriptions")
      .upsert(
        {
          user_id: context.userId,
          plan_id: planRow.id,
          status,
          paypal_subscription_id: data.subscriptionId,
          current_period_end: periodEnd,
          cancelled_at: null,
        },
        { onConflict: "user_id" },
      );
    return { ok: true, status, planId: planRow.id };
  });

export const cancelMySubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: sub } = await supabaseAdmin
      .from("subscriptions")
      .select("paypal_subscription_id")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (sub?.paypal_subscription_id) {
      try { await cancelBillingSubscription(sub.paypal_subscription_id); } catch (e) {
        console.error("[billing] paypal cancel failed", (e as Error).message);
      }
    }
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("user_id", context.userId);
    return { ok: true };
  });
