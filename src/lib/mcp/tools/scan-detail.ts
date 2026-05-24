import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getScanTool = defineTool({
  name: "get_scan",
  description: "Fetch a single GEO scan by id with all sub-scores.",
  parameters: z.object({ id: z.string().uuid() }),
  execute: async ({ id }) => {
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    if (!data) return JSON.stringify({ ok: false, error: "not_found" });
    return JSON.stringify({ ok: true, scan: data }, null, 2);
  },
});

export const compareHostsTool = defineTool({
  name: "compare_hosts",
  description:
    "Compare average GEO scores across hosts over the last N days. Returns per-host counts and average overall + sub-scores.",
  parameters: z.object({
    hosts: z.array(z.string().min(1).max(255)).min(1).max(10),
    days: z.number().int().min(1).max(365).default(30),
  }),
  execute: async ({ hosts, days }) => {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select("host, overall, semantic, jsonld, llms, citability, speed")
      .in("host", hosts)
      .gte("scanned_at", since);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const groups: Record<string, number[][]> = {};
    for (const r of data ?? []) {
      const row = r as { host: string; overall: number; semantic: number; jsonld: number; llms: number; citability: number; speed: number };
      groups[row.host] ??= [];
      groups[row.host].push([row.overall, row.semantic, row.jsonld, row.llms, row.citability, row.speed]);
    }
    const avg = (xs: number[]) =>
      xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null;
    const result = hosts.map((h) => {
      const rows = groups[h] ?? [];
      return {
        host: h,
        scans: rows.length,
        avg_overall: avg(rows.map((r) => r[0])),
        avg_semantic: avg(rows.map((r) => r[1])),
        avg_jsonld: avg(rows.map((r) => r[2])),
        avg_llms: avg(rows.map((r) => r[3])),
        avg_citability: avg(rows.map((r) => r[4])),
        avg_speed: avg(rows.map((r) => r[5])),
      };
    });
    return JSON.stringify({ ok: true, days, hosts: result }, null, 2);
  },
});
