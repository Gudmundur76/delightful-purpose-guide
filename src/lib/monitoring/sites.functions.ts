import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserPlan, getUsage } from "./quota.server";

export const listMonitoredSites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const [{ data: sites }, plan, usage] = await Promise.all([
      supabaseAdmin
        .from("monitored_sites")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      getUserPlan(userId),
      getUsage(userId),
    ]);
    return {
      sites: sites ?? [],
      plan,
      usage: { used: usage.used, period: usage.period, limit: plan.monthly_scan_quota },
    };
  });

export const addMonitoredSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      url: z.string().url().max(2048),
      label: z.string().min(1).max(120).optional(),
      alert_threshold: z.number().int().min(1).max(100).default(5),
      alert_email: z.string().email().optional(),
      alert_webhook_url: z.string().url().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const plan = await getUserPlan(userId);
    const { count } = await supabaseAdmin
      .from("monitored_sites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);
    if ((count ?? 0) >= plan.max_sites) {
      throw new Error(`site_limit_reached:${plan.id}:${plan.max_sites}`);
    }
    const { data: row, error } = await supabaseAdmin
      .from("monitored_sites")
      .insert({
        user_id: userId,
        url: data.url,
        label: data.label ?? null,
        alert_threshold: data.alert_threshold,
        alert_email: data.alert_email ?? null,
        alert_webhook_url: data.alert_webhook_url ?? null,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { site: row };
  });

export const updateMonitoredSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid(),
      label: z.string().min(1).max(120).nullable().optional(),
      alert_threshold: z.number().int().min(1).max(100).optional(),
      alert_email: z.string().email().nullable().optional(),
      alert_webhook_url: z.string().url().nullable().optional(),
      paused: z.boolean().optional(),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await supabaseAdmin
      .from("monitored_sites")
      .update(patch)
      .eq("id", id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMonitoredSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("monitored_sites")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
