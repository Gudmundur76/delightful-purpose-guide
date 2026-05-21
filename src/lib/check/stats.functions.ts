// Aggregated, real-data stats derived from the scans table.
// Used to replace mock numbers across the marketing site.
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface OverviewStats {
  totalScans: number;
  uniqueHosts: number;
  avgOverall: number;
  metrics: {
    semantic: number;
    jsonld: number;
    llms: number;
    citability: number;
    speed: number;
  };
  topScores: { host: string; overall: number; scanned_at: string }[];
  improved: { host: string; before: number; after: number; delta: number }[];
  recentDailyCounts: number[]; // length 24 (last 24h, bucketed hourly)
}

const EMPTY: OverviewStats = {
  totalScans: 0,
  uniqueHosts: 0,
  avgOverall: 0,
  metrics: { semantic: 0, jsonld: 0, llms: 0, citability: 0, speed: 0 },
  topScores: [],
  improved: [],
  recentDailyCounts: new Array(24).fill(0),
};

export const getOverviewStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<OverviewStats> => {
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select("host, overall, semantic, jsonld, llms, citability, speed, scanned_at")
      .order("scanned_at", { ascending: false })
      .limit(2000);
    if (error || !data || data.length === 0) return EMPTY;

    const totalScans = data.length;
    const hostSet = new Set(data.map((r) => r.host));
    const avg = (key: keyof typeof data[number]) =>
      Math.round(
        data.reduce((s, r) => s + (Number(r[key]) || 0), 0) / totalScans,
      );

    // Top scores — best per host
    const bestByHost = new Map<string, typeof data[number]>();
    for (const r of data) {
      const cur = bestByHost.get(r.host);
      if (!cur || r.overall > cur.overall) bestByHost.set(r.host, r);
    }
    const topScores = [...bestByHost.values()]
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 3)
      .map((r) => ({ host: r.host, overall: r.overall, scanned_at: r.scanned_at }));

    // Improved — for hosts with ≥2 scans, compare oldest vs newest
    const byHost = new Map<string, typeof data>();
    for (const r of data) {
      const arr = byHost.get(r.host) ?? [];
      arr.push(r);
      byHost.set(r.host, arr);
    }
    const improved: OverviewStats["improved"] = [];
    for (const [host, rows] of byHost) {
      if (rows.length < 2) continue;
      const sorted = [...rows].sort(
        (a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime(),
      );
      const before = sorted[0].overall;
      const after = sorted[sorted.length - 1].overall;
      if (after > before) improved.push({ host, before, after, delta: after - before });
    }
    improved.sort((a, b) => b.delta - a.delta);

    // 24h hourly buckets
    const now = Date.now();
    const buckets = new Array(24).fill(0);
    for (const r of data) {
      const t = new Date(r.scanned_at).getTime();
      const hoursAgo = Math.floor((now - t) / 3_600_000);
      if (hoursAgo >= 0 && hoursAgo < 24) buckets[23 - hoursAgo] += 1;
    }

    return {
      totalScans,
      uniqueHosts: hostSet.size,
      avgOverall: avg("overall"),
      metrics: {
        semantic: avg("semantic"),
        jsonld: avg("jsonld"),
        llms: avg("llms"),
        citability: avg("citability"),
        speed: avg("speed"),
      },
      topScores,
      improved: improved.slice(0, 3),
      recentDailyCounts: buckets,
    };
  },
);
