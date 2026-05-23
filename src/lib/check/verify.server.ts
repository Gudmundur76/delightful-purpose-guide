// Server-only helpers for the /verify/<host> public verdict page.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface VerifyMetricRow {
  semantic: number;
  jsonld: number;
  llms: number;
  citability: number;
  speed: number;
}

export interface VerifyRecord {
  host: string;
  url: string;
  overall: number;
  scanned_at: string;
  metrics: VerifyMetricRow;
  history: { scanned_at: string; overall: number }[];
  total_scans: number;
}

function normalizeHost(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

export async function fetchVerifyRecord(rawHost: string): Promise<VerifyRecord | null> {
  const host = normalizeHost(rawHost);
  if (!host) return null;

  const { data, error } = await supabaseAdmin
    .from("scans")
    .select("url, host, overall, semantic, jsonld, llms, citability, speed, scanned_at")
    .eq("host", host)
    .order("scanned_at", { ascending: false })
    .limit(30);

  if (error || !data || data.length === 0) return null;

  const latest = data[0];
  return {
    host,
    url: latest.url,
    overall: latest.overall,
    scanned_at: latest.scanned_at,
    metrics: {
      semantic: latest.semantic,
      jsonld: latest.jsonld,
      llms: latest.llms,
      citability: latest.citability,
      speed: latest.speed,
    },
    history: data
      .map((r) => ({ scanned_at: r.scanned_at, overall: r.overall }))
      .reverse(),
    total_scans: data.length,
  };
}

export async function fetchLatestScoreByHost(rawHost: string): Promise<number | null> {
  const host = normalizeHost(rawHost);
  if (!host) return null;
  const { data, error } = await supabaseAdmin
    .from("scans")
    .select("overall")
    .eq("host", host)
    .order("scanned_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.overall;
}

export { normalizeHost };
