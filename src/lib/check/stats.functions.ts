// Aggregated, real-data stats derived from the scans table.
// Used to replace mock numbers across the marketing site.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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

const StatsInput = z.object({ days: z.number().int().min(1).max(365).optional().default(7) });

// Simple server-side in-memory cache (module-scoped → survives across requests in same Worker instance)
const cache = new Map<string, { data: OverviewStats; ts: number }>();
const TTL = 300_000; // 5 minutes in ms

export const getOverviewStats = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => StatsInput.parse(input))
  .handler(async ({ data }): Promise<OverviewStats> => {
    const days = data.days;
    const key = `overview-stats-${days}d`;
    const now = Date.now();
    const hit = cache.get(key);
    if (hit && now - hit.ts < TTL) {
      return hit.data;
    }

    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const { data: rows, error } = await supabaseAdmin
      .from("scans")
      .select("host, overall, semantic, jsonld, llms, citability, speed, scanned_at")
      .gte("scanned_at", since)
      .order("scanned_at", { ascending: false })
      .limit(2000);
    if (error || !rows || rows.length === 0) return EMPTY;

    const totalScans = rows.length;
    const hostSet = new Set(rows.map((r) => r.host));
    const avg = (key: keyof typeof rows[number]) =>
      Math.round(
        rows.reduce((s, r) => s + (Number(r[key]) || 0), 0) / totalScans,
      );

    // Top scores — best per host
    const bestByHost = new Map<string, typeof rows[number]>();
    for (const r of rows) {
      const cur = bestByHost.get(r.host);
      if (!cur || r.overall > cur.overall) bestByHost.set(r.host, r);
    }
    const topScores = [...bestByHost.values()]
      .sort((a, b) => b.overall - a.overall)
      .slice(0, 3)
      .map((r) => ({ host: r.host, overall: r.overall, scanned_at: r.scanned_at }));

    // Improved — for hosts with ≥2 scans, compare oldest vs newest
    const byHost = new Map<string, typeof rows>();
    for (const r of rows) {
      const arr = byHost.get(r.host) ?? [];
      arr.push(r);
      byHost.set(r.host, arr);
    }
    const improved: OverviewStats["improved"] = [];
    for (const [host, items] of byHost) {
      if (items.length < 2) continue;
      const sorted = [...items].sort(
        (a, b) => new Date(a.scanned_at).getTime() - new Date(b.scanned_at).getTime(),
      );
      const before = sorted[0].overall;
      const after = sorted[sorted.length - 1].overall;
      if (after > before) improved.push({ host, before, after, delta: after - before });
    }
    improved.sort((a, b) => b.delta - a.delta);

    // 24h hourly buckets (always from the filtered set)
    const now = Date.now();
    const buckets = new Array(24).fill(0);
    for (const r of rows) {
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
  });
