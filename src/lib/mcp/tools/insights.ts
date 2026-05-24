import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const topScannedHostsTool = defineTool({
  name: "top_scanned_hosts",
  description:
    "Most-scanned hosts over the last N days. Returns host, scan_count, latest_overall, avg_overall — useful for spotting accounts with traction or stuck scores.",
  parameters: z.object({
    days: z.number().int().min(1).max(90).default(14),
    limit: z.number().int().min(1).max(50).default(20),
  }),
  execute: async ({ days, limit }) => {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select("host, overall, scanned_at")
      .gte("scanned_at", since)
      .limit(5000);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const map = new Map<string, { count: number; sum: number; latest: { t: number; overall: number } }>();
    for (const r of data ?? []) {
      const m = map.get(r.host) ?? { count: 0, sum: 0, latest: { t: 0, overall: 0 } };
      m.count += 1; m.sum += r.overall;
      const t = new Date(r.scanned_at).getTime();
      if (t > m.latest.t) m.latest = { t, overall: r.overall };
      map.set(r.host, m);
    }
    const rows = Array.from(map.entries())
      .map(([host, m]) => ({
        host,
        scan_count: m.count,
        avg_overall: Math.round(m.sum / m.count),
        latest_overall: m.latest.overall,
        latest_scanned_at: new Date(m.latest.t).toISOString(),
      }))
      .sort((a, b) => b.scan_count - a.scan_count)
      .slice(0, limit);
    return JSON.stringify({ ok: true, days, count: rows.length, hosts: rows }, null, 2);
  },
});

export const leadFunnelTool = defineTool({
  name: "get_lead_funnel",
  description:
    "Conversion funnel over N days: report_requests → leads → qualified (hot/warm) → orders. Returns counts and conversion ratios.",
  parameters: z.object({ days: z.number().int().min(1).max(180).default(30) }),
  execute: async ({ days }) => {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const [rep, leads, orders] = await Promise.all([
      supabaseAdmin.from("report_requests").select("id", { count: "exact", head: true }).gte("created_at", since),
      supabaseAdmin.from("leads").select("id, qualification_tier").gte("created_at", since),
      supabaseAdmin.from("orders").select("id, status").gte("created_at", since),
    ]);
    const leadRows = leads.data ?? [];
    const hot = leadRows.filter((l) => l.qualification_tier === "hot").length;
    const warm = leadRows.filter((l) => l.qualification_tier === "warm").length;
    const paidOrders = (orders.data ?? []).filter((o) => o.status === "captured" || o.status === "completed" || o.status === "paid").length;
    const funnel = {
      report_requests: rep.count ?? 0,
      leads: leadRows.length,
      qualified_hot: hot,
      qualified_warm: warm,
      orders_total: orders.data?.length ?? 0,
      orders_paid: paidOrders,
    };
    const ratios = {
      reports_to_leads: funnel.report_requests ? +(funnel.leads / funnel.report_requests).toFixed(3) : null,
      leads_to_hot: funnel.leads ? +(funnel.qualified_hot / funnel.leads).toFixed(3) : null,
      leads_to_paid: funnel.leads ? +(funnel.orders_paid / funnel.leads).toFixed(3) : null,
    };
    return JSON.stringify({ ok: true, days, funnel, ratios }, null, 2);
  },
});
