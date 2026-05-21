// Server-side probes + scan-derived metrics for the public status page.
// All numbers come from real measurements; no hard-coded uptime/incident data.
import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface ComponentProbe {
  name: string;
  url: string;
  status: "operational" | "degraded" | "outage";
  responseMs: number | null;
  httpStatus: number | null;
  checkedAt: string;
}

export interface StatusPayload {
  components: ComponentProbe[];
  overall: "operational" | "degraded" | "outage";
  hourlyScans: number[]; // length 24
  totals: {
    scans24h: number;
    scans7d: number;
    uniqueHosts: number;
    avgScore: number;
  };
  checkedAt: string;
}

const TARGETS: { name: string; path: string }[] = [
  { name: "Website (grow.contact)", path: "/" },
  { name: "Blog & Journal", path: "/blog" },
  { name: "Score Check (/check)", path: "/check" },
  { name: "Leaderboard", path: "/leaderboard" },
  { name: "Public API v1", path: "/api/public/v1" },
  { name: "OpenAPI Spec", path: "/api/public/v1/openapi.json" },
  { name: "llms.txt", path: "/llms.txt" },
  { name: "Sitemap", path: "/sitemap.xml" },
];

async function probe(origin: string, name: string, path: string): Promise<ComponentProbe> {
  const url = origin + path;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "grow-status-probe/1.0" },
      signal: AbortSignal.timeout(5000),
    });
    const ms = Date.now() - start;
    const status: ComponentProbe["status"] =
      res.ok ? (ms > 2000 ? "degraded" : "operational") : "outage";
    return {
      name,
      url,
      status,
      responseMs: ms,
      httpStatus: res.status,
      checkedAt: new Date().toISOString(),
    };
  } catch {
    return {
      name,
      url,
      status: "outage",
      responseMs: null,
      httpStatus: null,
      checkedAt: new Date().toISOString(),
    };
  }
}

export const getSystemStatus = createServerFn({ method: "GET" }).handler(
  async (): Promise<StatusPayload> => {
    const origin =
      process.env.SITE_ORIGIN ||
      "https://grow.contact";

    const components = await Promise.all(
      TARGETS.map((t) => probe(origin, t.name, t.path)),
    );

    const hasOutage = components.some((c) => c.status === "outage");
    const hasDegrade = components.some((c) => c.status === "degraded");
    const overall: StatusPayload["overall"] = hasOutage
      ? "outage"
      : hasDegrade
        ? "degraded"
        : "operational";

    // Pull scan metrics
    const since7d = new Date(Date.now() - 7 * 86_400_000).toISOString();
    const { data } = await supabaseAdmin
      .from("scans")
      .select("host, overall, scanned_at")
      .gte("scanned_at", since7d)
      .limit(5000);

    const now = Date.now();
    const hourly = new Array(24).fill(0);
    let scans24h = 0;
    const hosts = new Set<string>();
    let scoreSum = 0;
    const rows = data ?? [];
    for (const r of rows) {
      hosts.add(r.host);
      scoreSum += r.overall;
      const t = new Date(r.scanned_at).getTime();
      const hoursAgo = Math.floor((now - t) / 3_600_000);
      if (hoursAgo < 24 && hoursAgo >= 0) {
        hourly[23 - hoursAgo] += 1;
        scans24h += 1;
      }
    }

    return {
      components,
      overall,
      hourlyScans: hourly,
      totals: {
        scans24h,
        scans7d: rows.length,
        uniqueHosts: hosts.size,
        avgScore: rows.length ? Math.round(scoreSum / rows.length) : 0,
      },
      checkedAt: new Date().toISOString(),
    };
  },
);
