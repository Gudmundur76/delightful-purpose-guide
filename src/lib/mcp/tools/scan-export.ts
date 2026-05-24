import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const exportScansCsvTool = defineTool({
  name: "export_scans_csv",
  description:
    "Export recent scans as CSV (id, scanned_at, host, url, overall, semantic, jsonld, llms, citability, speed, source). Filter by host and/or days.",
  parameters: z.object({
    host: z.string().max(255).optional(),
    days: z.number().int().min(1).max(365).default(30),
    limit: z.number().int().min(1).max(5000).default(1000),
  }),
  execute: async ({ host, days, limit }) => {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    let q = supabaseAdmin
      .from("scans")
      .select("id, scanned_at, host, url, overall, semantic, jsonld, llms, citability, speed, source")
      .gte("scanned_at", since)
      .order("scanned_at", { ascending: false })
      .limit(limit);
    if (host) q = q.eq("host", host);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const rows = data ?? [];
    const header = "id,scanned_at,host,url,overall,semantic,jsonld,llms,citability,speed,source";
    const body = rows
      .map((r) =>
        [r.id, r.scanned_at, r.host, JSON.stringify(r.url), r.overall, r.semantic, r.jsonld, r.llms, r.citability, r.speed, r.source].join(","),
      )
      .join("\n");
    return JSON.stringify({ ok: true, count: rows.length, csv: header + "\n" + body }, null, 2);
  },
});

export const hostTrendTool = defineTool({
  name: "get_host_trend",
  description:
    "Time-series of overall + sub-scores for a single host over N days. Returns daily averages plus delta vs previous period.",
  parameters: z.object({
    host: z.string().min(1).max(255),
    days: z.number().int().min(7).max(180).default(30),
  }),
  execute: async ({ host, days }) => {
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const prevSince = new Date(Date.now() - days * 2 * 86_400_000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select("scanned_at, overall, semantic, jsonld, llms, citability, speed")
      .eq("host", host)
      .gte("scanned_at", prevSince)
      .order("scanned_at", { ascending: true })
      .limit(5000);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const rows = data ?? [];
    const buckets = new Map<string, { sum: number; n: number; sem: number; js: number; ll: number; ci: number; sp: number }>();
    let cur = { s: 0, n: 0 };
    let prev = { s: 0, n: 0 };
    const cutoff = new Date(since).getTime();
    for (const r of rows) {
      const day = r.scanned_at.slice(0, 10);
      const t = new Date(r.scanned_at).getTime();
      if (t >= cutoff) {
        cur.s += r.overall; cur.n += 1;
        const b = buckets.get(day) ?? { sum: 0, n: 0, sem: 0, js: 0, ll: 0, ci: 0, sp: 0 };
        b.sum += r.overall; b.n += 1;
        b.sem += r.semantic; b.js += r.jsonld; b.ll += r.llms; b.ci += r.citability; b.sp += r.speed;
        buckets.set(day, b);
      } else {
        prev.s += r.overall; prev.n += 1;
      }
    }
    const series = Array.from(buckets.entries()).map(([day, b]) => ({
      day,
      n: b.n,
      overall: Math.round(b.sum / b.n),
      semantic: Math.round(b.sem / b.n),
      jsonld: Math.round(b.js / b.n),
      llms: Math.round(b.ll / b.n),
      citability: Math.round(b.ci / b.n),
      speed: Math.round(b.sp / b.n),
    }));
    const curAvg = cur.n ? Math.round(cur.s / cur.n) : 0;
    const prevAvg = prev.n ? Math.round(prev.s / prev.n) : 0;
    return JSON.stringify(
      { ok: true, host, days, current_avg: curAvg, previous_avg: prevAvg, delta: curAvg - prevAvg, series },
      null,
      2,
    );
  },
});
