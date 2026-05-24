import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function normalizeHost(input: string): { host: string; url: string } {
  const url = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  const host = new URL(url).hostname.replace(/^www\./, "");
  return { host, url };
}

function nextRunFromCadence(cadence: string, from = new Date()): Date {
  const d = new Date(from);
  if (cadence === "daily") d.setUTCDate(d.getUTCDate() + 1);
  else if (cadence === "weekly") d.setUTCDate(d.getUTCDate() + 7);
  else d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}

export const scheduleScanTool = defineTool({
  name: "schedule_scan",
  description:
    "Schedule a recurring GEO scan for a URL. Cadence is daily, weekly, or monthly. Runs hourly via cron and writes results to the scans table.",
  parameters: z.object({
    url: z.string().min(3).max(2048),
    cadence: z.enum(["daily", "weekly", "monthly"]).default("weekly"),
    notes: z.string().max(500).optional(),
    start_now: z.boolean().default(true).describe("If true, next_run_at = now (cron will pick it up on next tick)"),
  }),
  execute: async ({ url, cadence, notes, start_now }) => {
    const { host, url: full } = normalizeHost(url);
    const next = start_now ? new Date() : nextRunFromCadence(cadence);
    const { data, error } = await supabaseAdmin
      .from("scheduled_scans")
      .insert({ host, url: full, cadence, notes, next_run_at: next.toISOString() })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return JSON.stringify({ scheduled: data }, null, 2);
  },
});

export const listScheduledScansTool = defineTool({
  name: "list_scheduled_scans",
  description: "List scheduled scans. Filter by host or active flag.",
  parameters: z.object({
    host: z.string().optional(),
    active_only: z.boolean().default(true),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  execute: async ({ host, active_only, limit }) => {
    let q = supabaseAdmin
      .from("scheduled_scans")
      .select("*")
      .order("next_run_at", { ascending: true })
      .limit(limit);
    if (host) q = q.eq("host", host.replace(/^www\./, ""));
    if (active_only) q = q.eq("active", true);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return JSON.stringify({ count: data?.length ?? 0, items: data ?? [] }, null, 2);
  },
});

export const cancelScheduledScanTool = defineTool({
  name: "cancel_scheduled_scan",
  description: "Deactivate a scheduled scan by id.",
  parameters: z.object({ id: z.string().uuid() }),
  execute: async ({ id }) => {
    const { data, error } = await supabaseAdmin
      .from("scheduled_scans")
      .update({ active: false })
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return JSON.stringify({ cancelled: data }, null, 2);
  },
});

export const runDueScheduledScansTool = defineTool({
  name: "run_due_scheduled_scans",
  description:
    "Manually trigger any scheduled scans that are due (next_run_at <= now). Normally invoked by cron; exposed here for testing.",
  parameters: z.object({ limit: z.number().int().min(1).max(50).default(10) }),
  execute: async ({ limit }) => {
    const { runDueScheduledScans } = await import("@/lib/check/run-scheduled.server");
    const result = await runDueScheduledScans(limit);
    return JSON.stringify(result, null, 2);
  },
});
