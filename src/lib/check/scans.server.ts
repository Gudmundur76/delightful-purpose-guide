// Server-only helper for persisting scan results. Kept in a .server.ts
// file so it stays out of client bundles (it imports supabaseAdmin).
import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface PersistArgs {
  url: string;
  finalUrl: string;
  overall: number;
  scores: {
    semantic: number;
    jsonld: number;
    llms: number;
    citability: number;
    speed: number;
    protocol?: number;
  };
  source?: string;
}

export async function persistScan(args: PersistArgs): Promise<void> {
  let host = "";
  try {
    host = new URL(args.finalUrl || args.url).hostname.toLowerCase();
  } catch {
    host = args.url.slice(0, 253);
  }
  const { error } = await supabaseAdmin.from("scans").insert({
    url: (args.finalUrl || args.url).slice(0, 2048),
    host,
    overall: args.overall,
    semantic: args.scores.semantic,
    jsonld: args.scores.jsonld,
    llms: args.scores.llms,
    citability: args.scores.citability,
    speed: args.scores.speed,
    protocol: args.scores.protocol ?? null,
    source: args.source ?? "check",
  });
  if (error) {
    console.error("persistScan failed", error);
  }
}

export interface RecentScanRow {
  id: string;
  url: string;
  host: string;
  overall: number;
  scanned_at: string;
}

export async function fetchRecentScans(limit = 8): Promise<RecentScanRow[]> {
  const { data, error } = await supabaseAdmin
    .from("scans")
    .select("id, url, host, overall, scanned_at")
    .order("scanned_at", { ascending: false })
    .limit(Math.min(50, Math.max(1, limit)));
  if (error || !data) return [];
  return data as RecentScanRow[];
}

export async function fetchLatestScanForHost(host: string): Promise<RecentScanRow | null> {
  const { data, error } = await supabaseAdmin
    .from("scans")
    .select("id, url, host, overall, scanned_at")
    .eq("host", host.toLowerCase())
    .order("scanned_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data as RecentScanRow;
}
