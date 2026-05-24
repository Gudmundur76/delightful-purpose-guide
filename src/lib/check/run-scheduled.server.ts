import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { scanUrl } from "./scan.functions";

function nextRunFromCadence(cadence: string, from = new Date()): Date {
  const d = new Date(from);
  if (cadence === "daily") d.setUTCDate(d.getUTCDate() + 1);
  else if (cadence === "weekly") d.setUTCDate(d.getUTCDate() + 7);
  else d.setUTCMonth(d.getUTCMonth() + 1);
  return d;
}

export async function runDueScheduledScans(limit = 10) {
  const nowIso = new Date().toISOString();
  const { data: due, error } = await supabaseAdmin
    .from("scheduled_scans")
    .select("*")
    .eq("active", true)
    .lte("next_run_at", nowIso)
    .order("next_run_at", { ascending: true })
    .limit(limit);
  if (error) throw new Error(error.message);

  const results: Array<Record<string, unknown>> = [];
  for (const row of due ?? []) {
    try {
      const scan = await scanUrl({ data: { url: row.url, source: "schedule" } });
      const scanId = (scan as { id?: string } | null)?.id ?? null;
      await supabaseAdmin
        .from("scheduled_scans")
        .update({
          last_run_at: new Date().toISOString(),
          last_scan_id: scanId,
          next_run_at: nextRunFromCadence(row.cadence).toISOString(),
        })
        .eq("id", row.id);
      results.push({ id: row.id, host: row.host, ok: true, scan_id: scanId });
    } catch (e) {
      results.push({ id: row.id, host: row.host, ok: false, error: (e as Error).message });
    }
  }
  return { processed: results.length, results };
}
