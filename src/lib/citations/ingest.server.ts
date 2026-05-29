// Server-only helpers for ingesting AI-engine citations.
// Used by /api/public/hooks/citation-import (signed webhook) and the
// nightly volatility rollup cron.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AiEngine = "perplexity" | "chatgpt" | "claude" | "google_aio";

export const AI_ENGINES: AiEngine[] = [
  "perplexity",
  "chatgpt",
  "claude",
  "google_aio",
];

export type IncomingCitation = {
  domain: string;
  ai_engine: AiEngine;
  query_category?: string | null;
  query_text?: string | null;
  cited_url?: string | null;
  position?: number | null;
  confidence?: number | null;
  cited_at?: string; // ISO; defaults server-side to now()
};

function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

function clampNumber(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function isAiEngine(value: unknown): value is AiEngine {
  return typeof value === "string" && (AI_ENGINES as string[]).includes(value);
}

/**
 * Validate + insert a batch of citations.
 * Caps batch at 500 rows to keep the worker request small.
 */
export async function ingestCitationBatch(
  rows: unknown[],
): Promise<{ accepted: number; rejected: number; errors: string[] }> {
  if (!Array.isArray(rows)) {
    return { accepted: 0, rejected: 0, errors: ["payload.citations must be an array"] };
  }
  const capped = rows.slice(0, 500);
  const errors: string[] = [];
  const cleaned: IncomingCitation[] = [];

  for (let i = 0; i < capped.length; i++) {
    const raw = capped[i];
    if (!raw || typeof raw !== "object") {
      errors.push(`row ${i}: not an object`);
      continue;
    }
    const r = raw as Record<string, unknown>;
    const domainStr = typeof r.domain === "string" ? normalizeDomain(r.domain) : "";
    if (!domainStr || domainStr.length > 253) {
      errors.push(`row ${i}: invalid domain`);
      continue;
    }
    if (!isAiEngine(r.ai_engine)) {
      errors.push(`row ${i}: invalid ai_engine`);
      continue;
    }
    cleaned.push({
      domain: domainStr,
      ai_engine: r.ai_engine,
      query_category:
        typeof r.query_category === "string" ? r.query_category.slice(0, 80) : null,
      query_text:
        typeof r.query_text === "string" ? r.query_text.slice(0, 500) : null,
      cited_url:
        typeof r.cited_url === "string" ? r.cited_url.slice(0, 2048) : null,
      position:
        typeof r.position === "number" && Number.isFinite(r.position)
          ? clampNumber(Math.round(r.position), 1, 50)
          : null,
      confidence:
        typeof r.confidence === "number" && Number.isFinite(r.confidence)
          ? clampNumber(r.confidence, 0, 1)
          : null,
      cited_at:
        typeof r.cited_at === "string" && !Number.isNaN(Date.parse(r.cited_at))
          ? new Date(r.cited_at).toISOString()
          : undefined,
    });
  }

  if (cleaned.length === 0) {
    return { accepted: 0, rejected: capped.length, errors };
  }

  const { error } = await supabaseAdmin.from("citations").insert(cleaned);
  if (error) {
    return {
      accepted: 0,
      rejected: capped.length,
      errors: [...errors, `db: ${error.message}`],
    };
  }

  // Best-effort: refresh probability + history for affected domains.
  const affected = Array.from(new Set(cleaned.map((c) => c.domain)));
  await Promise.all(affected.map((d) => recomputeCitationProbability(d).catch(() => {})));
  await rollupCitationHistory(affected).catch(() => {});

  return { accepted: cleaned.length, rejected: capped.length - cleaned.length, errors };
}

/**
 * Recompute the latest citation_probability for a single domain.
 * Heuristic: 30-day citation count, log-scaled to 0..100, blended with
 * average position (lower position = higher probability).
 */
export async function recomputeCitationProbability(domain: string): Promise<number> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabaseAdmin
    .from("citations")
    .select("position")
    .eq("domain", domain)
    .gte("cited_at", since);
  if (error) throw new Error(error.message);

  const total = data?.length ?? 0;
  const positions = (data ?? [])
    .map((r) => (typeof r.position === "number" ? r.position : null))
    .filter((p): p is number => p !== null);
  const avgPos =
    positions.length > 0
      ? positions.reduce((a, b) => a + b, 0) / positions.length
      : 10;

  // Log-scaled volume: 1→0, 10→33, 100→66, 1000→100
  const volumeScore = total === 0 ? 0 : clampNumber(Math.log10(total + 1) * 33, 0, 100);
  // Position score: pos=1→100, pos=10→0
  const positionScore = clampNumber(100 - (avgPos - 1) * 11, 0, 100);
  const probability = Math.round(volumeScore * 0.7 + positionScore * 0.3);

  // Patch the most recent company_scores row for this domain.
  const { data: latest } = await supabaseAdmin
    .from("company_scores")
    .select("id")
    .eq("domain", domain)
    .order("scan_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latest?.id) {
    await supabaseAdmin
      .from("company_scores")
      .update({ citation_probability: probability })
      .eq("id", latest.id);
  }

  return probability;
}

/**
 * Roll up per-engine citation shares and volatility for the current month
 * for each affected domain. Uses month = first day of UTC month.
 */
export async function rollupCitationHistory(domains: string[]): Promise<void> {
  if (domains.length === 0) return;
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthIso = monthStart.toISOString().slice(0, 10); // date column
  const since = monthStart.toISOString();

  for (const domain of domains) {
    const { data, error } = await supabaseAdmin
      .from("citations")
      .select("ai_engine")
      .eq("domain", domain)
      .gte("cited_at", since);
    if (error) continue;

    const counts: Record<AiEngine, number> = {
      perplexity: 0,
      chatgpt: 0,
      claude: 0,
      google_aio: 0,
    };
    for (const row of data ?? []) {
      if (isAiEngine(row.ai_engine)) counts[row.ai_engine] += 1;
    }
    const total = counts.perplexity + counts.chatgpt + counts.claude + counts.google_aio;
    const share = (n: number) => (total === 0 ? 0 : Number(((n / total) * 100).toFixed(2)));

    // Volatility vs previous month total.
    const prevMonthStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
    )
      .toISOString()
      .slice(0, 10);
    const { data: prev } = await supabaseAdmin
      .from("citation_history")
      .select("total_citations")
      .eq("domain", domain)
      .eq("month", prevMonthStart)
      .maybeSingle();
    const prevTotal = prev?.total_citations ?? 0;
    let volatility: "stable" | "rising" | "falling" = "stable";
    if (prevTotal > 0) {
      const delta = (total - prevTotal) / prevTotal;
      if (delta > 0.2) volatility = "rising";
      else if (delta < -0.2) volatility = "falling";
    } else if (total > 0) {
      volatility = "rising";
    }

    // Upsert: delete-then-insert (no unique constraint guaranteed).
    await supabaseAdmin
      .from("citation_history")
      .delete()
      .eq("domain", domain)
      .eq("month", monthIso);
    await supabaseAdmin.from("citation_history").insert({
      domain,
      month: monthIso,
      total_citations: total,
      perplexity_share: share(counts.perplexity),
      chatgpt_share: share(counts.chatgpt),
      claude_share: share(counts.claude),
      google_aio_share: share(counts.google_aio),
      volatility,
    });
  }
}

/**
 * Nightly rollup across every domain that has citations this month.
 * Called by the cron route.
 */
export async function rollupAllDomainsForCurrentMonth(): Promise<{
  domains: number;
}> {
  const monthStart = new Date(
    Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1),
  ).toISOString();
  const { data, error } = await supabaseAdmin
    .from("citations")
    .select("domain")
    .gte("cited_at", monthStart)
    .limit(10000);
  if (error) throw new Error(error.message);
  const domains = Array.from(new Set((data ?? []).map((r) => r.domain as string)));
  await rollupCitationHistory(domains);
  return { domains: domains.length };
}
