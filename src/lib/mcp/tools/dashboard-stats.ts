import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const WINDOW_DAYS: Record<string, number> = { "24h": 1, "7d": 7, "30d": 30, "90d": 90 };

async function compute(window: string) {
  const days = WINDOW_DAYS[window] ?? 7;
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const [scansTotal, leadsTotal, pendingReviews, recentScans, recentLeads] = await Promise.all([
    supabaseAdmin.from("scans").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("leads").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabaseAdmin.from("scans").select("overall, scanned_at").gte("scanned_at", since),
    supabaseAdmin.from("leads").select("*", { count: "exact", head: true }).gte("created_at", since),
  ]);
  const overalls = (recentScans.data ?? []).map((r: { overall: number }) => r.overall);
  const avg = overalls.length ? Math.round(overalls.reduce((a, b) => a + b, 0) / overalls.length) : null;
  return {
    window,
    window_days: days,
    total_scans: scansTotal.count ?? 0,
    total_leads: leadsTotal.count ?? 0,
    pending_reviews: pendingReviews.count ?? 0,
    scans_in_window: overalls.length,
    leads_in_window: recentLeads.count ?? 0,
    avg_overall_score: avg,
  };
}

export const statsTool = defineTool({
  name: "get_stats",
  description: "Aggregate stats over a rolling window (default 7d). Pass window=24h|7d|30d|90d.",
  parameters: z.object({ window: z.enum(["24h", "7d", "30d", "90d"]).default("7d") }),
  execute: async ({ window }) => JSON.stringify(await compute(window), null, 2),
});

export const getDashboardStatsTool = defineTool({
  name: "get_dashboard_stats",
  description: "Dashboard headline stats over a rolling window (default 7d). Same shape as get_stats.",
  parameters: z.object({ window: z.enum(["24h", "7d", "30d", "90d"]).default("7d") }),
  execute: async ({ window }) => JSON.stringify(await compute(window), null, 2),
});
