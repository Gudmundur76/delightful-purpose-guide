// Server fns for per-host scan history and scan-to-scan diff.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const METRIC_KEYS = ["overall", "semantic", "jsonld", "llms", "citability", "speed"] as const;
type MetricKey = (typeof METRIC_KEYS)[number];

const METRIC_LABELS: Record<MetricKey, string> = {
  overall: "Overall",
  semantic: "Semantic HTML",
  jsonld: "JSON-LD",
  llms: "llms.txt",
  citability: "Citability",
  speed: "Speed",
};

export interface HistoryScanRow {
  id: string;
  url: string;
  scanned_at: string;
  overall: number;
  semantic: number;
  jsonld: number;
  llms: number;
  citability: number;
  speed: number;
}

export interface HistoryResult {
  host: string;
  totalScans: number;
  scans: HistoryScanRow[];
  sparkline: { day: string; avg: number }[];
  first: number | null;
  last: number | null;
  delta: number | null;
}

function cleanHost(input: string): string {
  return input.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase().slice(0, 253);
}

export const getHostHistory = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({ host: z.string().min(1).max(253), days: z.number().int().min(7).max(365).default(90) })
      .parse(input),
  )
  .handler(async ({ data }): Promise<HistoryResult> => {
    const host = cleanHost(data.host);
    const since = new Date(Date.now() - data.days * 86400000).toISOString();
    const { data: rows, error } = await supabaseAdmin
      .from("scans")
      .select("id, url, scanned_at, overall, semantic, jsonld, llms, citability, speed")
      .eq("host", host)
      .gte("scanned_at", since)
      .order("scanned_at", { ascending: false })
      .limit(500);
    if (error || !rows) {
      return { host, totalScans: 0, scans: [], sparkline: [], first: null, last: null, delta: null };
    }
    const scans = rows as HistoryScanRow[];
    const buckets = new Map<string, number[]>();
    for (const r of scans) {
      const day = r.scanned_at.slice(0, 10);
      const arr = buckets.get(day) ?? [];
      arr.push(r.overall);
      buckets.set(day, arr);
    }
    const sparkline = [...buckets.entries()]
      .map(([day, xs]) => ({ day, avg: Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) }))
      .sort((a, b) => a.day.localeCompare(b.day));
    const first = sparkline[0]?.avg ?? null;
    const last = sparkline[sparkline.length - 1]?.avg ?? null;
    const delta = first !== null && last !== null ? last - first : null;
    return { host, totalScans: scans.length, scans, sparkline, first, last, delta };
  });

export interface DiffMetric {
  key: MetricKey;
  label: string;
  a: number;
  b: number;
  delta: number;
}

export interface ScanDiffResult {
  ok: boolean;
  error?: string;
  a?: { id: string; url: string; scanned_at: string };
  b?: { id: string; url: string; scanned_at: string };
  metrics?: DiffMetric[];
  summary?: string[];
}

export const getScanDiff = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ aId: z.string().uuid(), bId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }): Promise<ScanDiffResult> => {
    const { data: rows, error } = await supabaseAdmin
      .from("scans")
      .select("id, url, scanned_at, overall, semantic, jsonld, llms, citability, speed")
      .in("id", [data.aId, data.bId]);
    if (error || !rows || rows.length < 2) {
      return { ok: false, error: "Scan(s) not found" };
    }
    const aRow = rows.find((r) => (r as { id: string }).id === data.aId) as HistoryScanRow;
    const bRow = rows.find((r) => (r as { id: string }).id === data.bId) as HistoryScanRow;
    // Ensure A is earlier than B chronologically (so deltas read as before→after).
    const [earlier, later] =
      new Date(aRow.scanned_at).getTime() <= new Date(bRow.scanned_at).getTime()
        ? [aRow, bRow]
        : [bRow, aRow];
    const metrics: DiffMetric[] = METRIC_KEYS.map((k) => ({
      key: k,
      label: METRIC_LABELS[k],
      a: earlier[k],
      b: later[k],
      delta: later[k] - earlier[k],
    }));
    const summary: string[] = [];
    for (const m of metrics) {
      if (m.key === "overall") continue;
      if (m.delta >= 10) summary.push(`${m.label} improved significantly: +${m.delta}`);
      else if (m.delta <= -10) summary.push(`${m.label} regressed: ${m.delta}`);
    }
    if (summary.length === 0) {
      const overall = metrics.find((m) => m.key === "overall")!;
      if (Math.abs(overall.delta) < 3) summary.push("No significant changes between these scans.");
      else if (overall.delta > 0) summary.push(`Overall up ${overall.delta} points — small gains across metrics.`);
      else summary.push(`Overall down ${Math.abs(overall.delta)} points — minor regressions.`);
    }
    return {
      ok: true,
      a: { id: earlier.id, url: earlier.url, scanned_at: earlier.scanned_at },
      b: { id: later.id, url: later.url, scanned_at: later.scanned_at },
      metrics,
      summary,
    };
  });
