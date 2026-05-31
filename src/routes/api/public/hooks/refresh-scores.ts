// Nightly job — recompute CCS pillars for every company from the latest
// content_analysis + authority_signals + citation activity, and insert a new
// company_scores row. Public route; auth is the Supabase anon key (apikey
// header) per the project's cron pattern.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const clamp = (n: number, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Math.round(n)));

// Normalize a raw count against a soft cap → 0..100.
const norm = (value: number, softCap: number) =>
  clamp((Math.min(value, softCap) / softCap) * 100);

type Authority = {
  backlinks: number | null;
  github_stars: number | null;
  news_mentions: number | null;
  reddit_mentions: number | null;
  g2_reviews: number | null;
  stackoverflow_questions: number | null;
};

type Content = {
  qa_blocks: number | null;
  expert_signals: number | null;
  factual_density: number | null;
  freshness_days: number | null;
  comparison_tables: number | null;
};

function computePillars(
  domain: string,
  a: Authority | null,
  c: Content | null,
  citationsLast30d: { total: number; cited: number },
) {
  // AUTHORITY — external signals
  const authority = a
    ? clamp(
        0.35 * norm(a.backlinks ?? 0, 5000) +
          0.20 * norm(a.news_mentions ?? 0, 50) +
          0.15 * norm(a.github_stars ?? 0, 10000) +
          0.15 * norm(a.reddit_mentions ?? 0, 100) +
          0.10 * norm(a.g2_reviews ?? 0, 200) +
          0.05 * norm(a.stackoverflow_questions ?? 0, 500),
      )
    : 0;

  // VERIFIABILITY — structured, cite-able content blocks
  const verifiability = c
    ? clamp(
        0.40 * norm(c.qa_blocks ?? 0, 20) +
          0.30 * norm(c.comparison_tables ?? 0, 10) +
          0.30 * clamp((c.factual_density ?? 0) * 100),
      )
    : 0;

  // PRECEDENT — has it already been cited?
  const ctRate =
    citationsLast30d.total > 0
      ? (citationsLast30d.cited / citationsLast30d.total) * 100
      : 0;
  const precedent = clamp(
    0.6 * clamp(ctRate) + 0.4 * norm(citationsLast30d.cited, 50),
  );

  // COMMENTARY — expert voice + community discussion
  const commentary = c
    ? clamp(
        0.55 * norm(c.expert_signals ?? 0, 10) +
          0.45 * norm(a?.reddit_mentions ?? 0, 100),
      )
    : 0;

  // INFORMATION_GAIN — density + freshness
  const freshnessScore = c?.freshness_days != null
    ? clamp(100 - Math.min(c.freshness_days, 365) * (100 / 365))
    : 0;
  const information_gain = c
    ? clamp(0.6 * clamp((c.factual_density ?? 0) * 100) + 0.4 * freshnessScore)
    : 0;

  // CANONICAL — proxy from freshness + QA presence (no boolean cols yet)
  const canonical = c
    ? clamp(
        0.5 * freshnessScore +
          0.5 * (((c.qa_blocks ?? 0) > 0 ? 100 : 0)),
      )
    : 0;

  // OVERALL — equal-weighted across the 6 pillars (geo-standard@2026.07).
  const overall_ccs = clamp(
    (authority +
      verifiability +
      precedent +
      commentary +
      information_gain +
      canonical) /
      6,
  );

  return {
    domain,
    authority,
    verifiability,
    precedent,
    commentary,
    information_gain,
    canonical,
    overall_ccs,
    citation_probability: clamp(0.5 * precedent + 0.5 * overall_ccs),
  };
}

export const Route = createFileRoute("/api/public/hooks/refresh-scores")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.CRON_SECRET;
        if (!expected) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const provided = request.headers.get("x-cron-secret");
        if (!provided || provided !== expected) {
          return new Response("Forbidden", { status: 403 });
        }
        const scanDate = new Date().toISOString();

        // 1) Domains to score
        const { data: companies, error: companiesErr } = await supabaseAdmin
          .from("companies")
          .select("domain")
          .limit(500);
        if (companiesErr) {
          return Response.json(
            { ok: false, error: companiesErr.message },
            { status: 500 },
          );
        }
        const domains = (companies ?? []).map((r) => r.domain);

        // 2) Bulk-fetch latest signals per domain
        const since30d = new Date(
          Date.now() - 30 * 24 * 3600 * 1000,
        ).toISOString();

        const [authRes, contentRes, eventsRes] = await Promise.all([
          supabaseAdmin
            .from("authority_signals")
            .select(
              "domain,backlinks,github_stars,news_mentions,reddit_mentions,g2_reviews,stackoverflow_questions,scan_date",
            )
            .in("domain", domains)
            .order("scan_date", { ascending: false }),
          supabaseAdmin
            .from("content_analysis")
            .select(
              "domain,qa_blocks,expert_signals,factual_density,freshness_days,comparison_tables,scan_date",
            )
            .in("domain", domains)
            .order("scan_date", { ascending: false }),
          supabaseAdmin
            .from("citation_events")
            .select("domain_queried,domain_was_cited")
            .in("domain_queried", domains)
            .gte("queried_at", since30d),
        ]);

        if (authRes.error || contentRes.error || eventsRes.error) {
          return Response.json(
            {
              ok: false,
              error:
                authRes.error?.message ??
                contentRes.error?.message ??
                eventsRes.error?.message,
            },
            { status: 500 },
          );
        }

        // 3) Reduce: latest row per domain
        const latest = <T extends { domain: string }>(rows: T[]) => {
          const map = new Map<string, T>();
          for (const r of rows) if (!map.has(r.domain)) map.set(r.domain, r);
          return map;
        };
        const authMap = latest(authRes.data ?? []);
        const contentMap = latest(contentRes.data ?? []);

        const citeAgg = new Map<string, { total: number; cited: number }>();
        for (const ev of eventsRes.data ?? []) {
          const cur = citeAgg.get(ev.domain_queried) ?? { total: 0, cited: 0 };
          cur.total += 1;
          if (ev.domain_was_cited) cur.cited += 1;
          citeAgg.set(ev.domain_queried, cur);
        }

        // 4) Compute & insert
        const rows = domains.map((d) =>
          computePillars(
            d,
            (authMap.get(d) as Authority | undefined) ?? null,
            (contentMap.get(d) as Content | undefined) ?? null,
            citeAgg.get(d) ?? { total: 0, cited: 0 },
          ),
        );

        const withDate = rows.map((r) => ({ ...r, scan_date: scanDate }));

        // Insert in chunks to avoid payload limits
        const CHUNK = 100;
        let inserted = 0;
        for (let i = 0; i < withDate.length; i += CHUNK) {
          const slice = withDate.slice(i, i + CHUNK);
          const { error } = await supabaseAdmin
            .from("company_scores")
            .insert(slice);
          if (error) {
            return Response.json(
              { ok: false, error: error.message, inserted },
              { status: 500 },
            );
          }
          inserted += slice.length;
        }

        return Response.json({
          ok: true,
          scanned: domains.length,
          inserted,
          scan_date: scanDate,
        });
      },
    },
  },
});
