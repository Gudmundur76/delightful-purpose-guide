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
  /** Optional: client this scan belongs to (enables per-client Composio triggers). */
  clientId?: string | null;
  /** Optional: lead email tied to this scan (for low-score follow-up). */
  leadEmail?: string | null;
}

export async function persistScan(args: PersistArgs): Promise<void> {
  let host = "";
  try {
    host = new URL(args.finalUrl || args.url).hostname.toLowerCase();
  } catch {
    host = args.url.slice(0, 253);
  }

  // Look up the previous overall for this host so we can detect score drops.
  let prevOverall: number | null = null;
  try {
    const { data: prev } = await supabaseAdmin
      .from("scans")
      .select("overall")
      .eq("host", host)
      .order("scanned_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    prevOverall = (prev as { overall?: number } | null)?.overall ?? null;
  } catch {
    prevOverall = null;
  }

  const finalUrl = (args.finalUrl || args.url).slice(0, 2048);
  const { error } = await supabaseAdmin.from("scans").insert({
    url: finalUrl,
    host,
    overall: args.overall,
    semantic: args.scores.semantic,
    jsonld: args.scores.jsonld,
    llms: args.scores.llms,
    citability: args.scores.citability,
    speed: args.scores.speed,
    protocol: args.scores.protocol ?? null,
    source: args.source ?? "check",
    client_id: args.clientId ?? null,
  });
  if (error) {
    console.error("persistScan failed", error);
    return;
  }

  // Composio triggers — fire-and-forget, never throw.
  if (args.clientId) {
    try {
      const triggers = await import("@/lib/composio/triggers.server");
      await Promise.allSettled([
        triggers.onLowScoreScan({
          clientId: args.clientId,
          leadEmail: args.leadEmail ?? null,
          url: finalUrl,
          overall: args.overall,
        }),
        prevOverall !== null
          ? triggers.onScoreDrop({
              clientId: args.clientId,
              url: finalUrl,
              prevOverall,
              newOverall: args.overall,
            })
          : Promise.resolve(),
      ]);
    } catch (e) {
      console.error("composio scan triggers failed", e);
    }
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
