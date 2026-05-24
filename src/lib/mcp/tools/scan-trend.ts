import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const trackCompetitorOverTimeTool = defineTool({
  name: "track_competitor_over_time",
  description:
    "Score trend for a host over N days, bucketed daily. Returns trajectory, not just current position. Useful for client reporting and competitor monitoring.",
  parameters: z.object({
    host: z.string().min(3).max(255),
    days: z.number().int().min(7).max(365).default(90),
  }),
  execute: async ({ host, days }) => {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const clean = host.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select("scanned_at, overall, semantic, jsonld, llms, citability, speed")
      .eq("host", clean)
      .gte("scanned_at", since)
      .order("scanned_at", { ascending: true });
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const buckets: Record<string, number[]> = {};
    for (const r of data ?? []) {
      const day = (r as { scanned_at: string }).scanned_at.slice(0, 10);
      buckets[day] ??= [];
      buckets[day].push((r as { overall: number }).overall);
    }
    const series = Object.entries(buckets)
      .map(([day, xs]) => ({ day, avg_overall: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length), n: xs.length }))
      .sort((a, b) => a.day.localeCompare(b.day));
    const first = series[0]?.avg_overall ?? null;
    const last = series[series.length - 1]?.avg_overall ?? null;
    const delta = first !== null && last !== null ? last - first : null;
    return JSON.stringify({ ok: true, host: clean, days, total_scans: data?.length ?? 0, first, last, delta, series }, null, 2);
  },
});

export const diffScanTool = defineTool({
  name: "diff_scan",
  description:
    "Compute the per-metric difference between two scans (typically before/after a fix). Proof-of-work tool for client reporting.",
  parameters: z.object({
    scan_id_a: z.string().uuid().describe("Earlier scan id (before)"),
    scan_id_b: z.string().uuid().describe("Later scan id (after)"),
  }),
  execute: async ({ scan_id_a, scan_id_b }) => {
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select("*")
      .in("id", [scan_id_a, scan_id_b]);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    if (!data || data.length < 2) return JSON.stringify({ ok: false, error: "scan(s) not found" });
    const a = data.find((r) => (r as { id: string }).id === scan_id_a) as Record<string, number | string>;
    const b = data.find((r) => (r as { id: string }).id === scan_id_b) as Record<string, number | string>;
    const metrics = ["overall", "semantic", "jsonld", "llms", "citability", "speed"] as const;
    const diff: Record<string, { a: number; b: number; delta: number }> = {};
    for (const m of metrics) {
      const av = Number(a[m]);
      const bv = Number(b[m]);
      diff[m] = { a: av, b: bv, delta: bv - av };
    }
    return JSON.stringify({ ok: true, a: { id: scan_id_a, url: a.url, scanned_at: a.scanned_at }, b: { id: scan_id_b, url: b.url, scanned_at: b.scanned_at }, diff }, null, 2);
  },
});
