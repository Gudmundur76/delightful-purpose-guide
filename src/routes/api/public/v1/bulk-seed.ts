// Bulk seed endpoint for the citation-graph dataset.
// Auth: ADMIN_API_KEY (X-Admin-API-Key or Authorization: Bearer).
// Upserts into companies, company_scores, authority_signals, citation_history.
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  jsonResponse,
  optionsResponse,
  requireAdminApiKey,
} from "@/lib/api/auth";

const RecordSchema = z
  .object({
    hostname: z.string().min(3).max(253).optional(),
    domain: z.string().min(3).max(253).optional(),
    name: z.string().max(200).optional(),
    category: z.string().max(80).optional(),
    description: z.string().max(2000).optional(),
    github_url: z.string().url().max(500).optional().nullable(),

    // CCS / signals
    ccs_v1: z.number().optional(),
    overall_ccs: z.number().optional(),
    score_authority: z.number().optional(),
    score_precedent: z.number().optional(),
    score_verifiability: z.number().optional(),
    score_commentary: z.number().optional(),
    score_canonical: z.number().optional(),
    score_information_gain: z.number().optional(),
    information_gain_score: z.number().optional(),
    citation_probability: z.number().optional(),

    // Authority raw signals
    github_stars: z.number().optional(),
    g2_reviews: z.number().optional(),
    stackoverflow_questions: z.number().optional(),
    news_mentions: z.number().optional(),
    reddit_mentions: z.number().optional(),
    backlinks: z.number().optional(),

    // Citation history (per-engine current-month)
    citations_total: z.number().optional(),
    citations_perplexity: z.number().optional(),
    citations_chatgpt: z.number().optional(),
    citations_claude: z.number().optional(),
    citations_google_aio: z.number().optional(),
    volatility: z.enum(["stable", "rising", "falling", "volatile"]).optional(),
  })
  .passthrough();

const BodySchema = z.object({
  records: z.array(RecordSchema).min(1).max(500),
  scan_date: z.string().datetime().optional(),
  month: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/).optional(),
});

const clamp = (n: number, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Math.round(n)));

const pickDomain = (r: z.infer<typeof RecordSchema>): string | null => {
  const raw = (r.domain ?? r.hostname ?? "").toString().trim().toLowerCase();
  if (!raw) return null;
  const clean = raw.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(clean) ? clean : null;
};

export const Route = createFileRoute("/api/public/v1/bulk-seed")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      POST: async ({ request }) => {
        const unauth = requireAdminApiKey(request);
        if (unauth) return unauth;

        let parsed;
        try {
          const body = await request.json();
          parsed = BodySchema.parse(body);
        } catch (err) {
          return jsonResponse(
            { error: "Invalid body", details: err instanceof Error ? err.message : String(err) },
            400,
          );
        }

        const scanDate = parsed.scan_date ?? new Date().toISOString();
        const monthDate = (() => {
          if (parsed.month) {
            const m = parsed.month.length === 7 ? `${parsed.month}-01` : parsed.month;
            return m;
          }
          const d = new Date();
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
        })();

        const results: Array<{ domain: string; ok: boolean; error?: string }> = [];

        for (const r of parsed.records) {
          const domain = pickDomain(r);
          if (!domain) {
            results.push({ domain: r.domain ?? r.hostname ?? "?", ok: false, error: "invalid domain" });
            continue;
          }
          try {
            // 1) company
            const { error: companyErr } = await supabaseAdmin.from("companies").upsert(
              {
                domain,
                name: r.name ?? domain.split(".")[0],
                category: r.category ?? "general",
                description: r.description ?? null,
                github_url: r.github_url ?? null,
              },
              { onConflict: "domain" },
            );
            if (companyErr) throw companyErr;

            // 2) company_scores
            const overall = clamp(r.overall_ccs ?? r.ccs_v1 ?? 0);
            const { error: scoresErr } = await supabaseAdmin.from("company_scores").insert({
              domain,
              scan_date: scanDate,
              overall_ccs: overall,
              authority: clamp(r.score_authority ?? 0, 0, 20),
              precedent: clamp(r.score_precedent ?? 0, 0, 20),
              verifiability: clamp(r.score_verifiability ?? 0, 0, 20),
              commentary: clamp(r.score_commentary ?? 0, 0, 20),
              canonical: clamp(r.score_canonical ?? 0, 0, 20),
              information_gain: clamp(r.score_information_gain ?? r.information_gain_score ?? 0, 0, 20),
              citation_probability: clamp(r.citation_probability ?? overall),
            });
            if (scoresErr) throw scoresErr;

            // 3) authority_signals
            const { error: authErr } = await supabaseAdmin.from("authority_signals").insert({
              domain,
              scan_date: scanDate,
              github_stars: r.github_stars ?? 0,
              g2_reviews: r.g2_reviews ?? 0,
              stackoverflow_questions: r.stackoverflow_questions ?? 0,
              news_mentions: r.news_mentions ?? 0,
              reddit_mentions: r.reddit_mentions ?? 0,
              backlinks: r.backlinks ?? 0,
            });
            if (authErr) throw authErr;

            // 4) citation_history (optional)
            const total = r.citations_total ?? 0;
            if (total > 0 || r.citations_perplexity || r.citations_chatgpt || r.citations_claude || r.citations_google_aio) {
              const sum =
                (r.citations_perplexity ?? 0) +
                (r.citations_chatgpt ?? 0) +
                (r.citations_claude ?? 0) +
                (r.citations_google_aio ?? 0);
              const denom = sum > 0 ? sum : 1;
              const share = (n?: number) => Number((((n ?? 0) / denom) * 100).toFixed(2));
              const { error: histErr } = await supabaseAdmin.from("citation_history").upsert(
                {
                  domain,
                  month: monthDate,
                  total_citations: total || sum,
                  perplexity_share: share(r.citations_perplexity),
                  chatgpt_share: share(r.citations_chatgpt),
                  claude_share: share(r.citations_claude),
                  google_aio_share: share(r.citations_google_aio),
                  volatility: r.volatility ?? "stable",
                },
                { onConflict: "domain,month" },
              );
              if (histErr) throw histErr;
            }

            results.push({ domain, ok: true });
          } catch (err) {
            results.push({
              domain,
              ok: false,
              error: err instanceof Error ? err.message : String(err),
            });
          }
        }

        const succeeded = results.filter((r) => r.ok).length;
        return jsonResponse({
          ok: true,
          received: parsed.records.length,
          succeeded,
          failed: results.length - succeeded,
          results,
        });
      },
    },
  },
});
