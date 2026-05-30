import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeDomain } from "@/lib/interventions/shared.server";

const Body = z.object({ domain: z.string().min(3).max(255) });

type Problem = { issue: string; impact: string; fix: string; effort: string };

type Subscores = {
  canonical: number;
  authority: number;
  verifiability: number;
  information_gain: number;
  commentary: number;
  precedent: number;
};

type ContentSignals = {
  qa_blocks: number;
  expert_signals: number;
  factual_density: number;
  freshness_days: number;
  comparison_tables: number;
};

function buildProblems(sub: Subscores | null, content: ContentSignals | null): Problem[] {
  const p: Problem[] = [];

  // Content-level checks (real scanned signals)
  if (content) {
    if (content.qa_blocks === 0) {
      p.push({ issue: "No Q&A / FAQ blocks detected on top pages", impact: "-10 CCS", fix: "Add FAQPage JSON-LD with 5+ Q&As", effort: "2h" });
    }
    if (content.expert_signals < 2) {
      p.push({ issue: "Low expert signals (author bios, credentials, dates)", impact: "-8 CCS", fix: "Add author schema + dateModified to top pages", effort: "3h" });
    }
    if (content.factual_density < 0.3) {
      p.push({ issue: `Low factual density (${content.factual_density.toFixed(2)} — stats/numbers per 100 words)`, impact: "-8 CCS", fix: "Add concrete stats, dates, citations to top pages", effort: "4h" });
    }
    if (content.freshness_days > 180) {
      p.push({ issue: `Stale content (${content.freshness_days} days since last meaningful update)`, impact: "-6 CCS", fix: "Refresh top 5 pages with current data", effort: "3h" });
    }
    if (content.comparison_tables === 0) {
      p.push({ issue: "No comparison tables detected (AI loves structured comparisons)", impact: "-5 CCS", fix: "Add a comparison table to your pillar page", effort: "2h" });
    }
  }

  // Subscore-level checks (CCS pillars)
  if (sub) {
    if (sub.canonical < 60) {
      p.push({ issue: "Weak canonical structure (sitemap, llms.txt, robots for AI bots)", impact: "-12 CCS", fix: "Publish /llms.txt and allow GPTBot, ClaudeBot, PerplexityBot in robots.txt", effort: "1h" });
    }
    if (sub.authority < 50) {
      p.push({ issue: "Low third-party authority signals (GitHub, G2, news, Reddit)", impact: "-10 CCS", fix: "Seed external mentions: launch on HN, submit to G2, publish on dev.to", effort: "1 week" });
    }
    if (sub.verifiability < 50) {
      p.push({ issue: "Claims lack verifiability (no schema, no sources, no dateModified)", impact: "-9 CCS", fix: "Add JSON-LD Claim/Dataset schema + cite sources inline", effort: "4h" });
    }
    if (sub.information_gain < 50) {
      p.push({ issue: "Low information gain — pages mostly restate competitor content", impact: "-8 CCS", fix: "Publish 2 original data drops or proprietary benchmarks", effort: "1 week" });
    }
  }

  // De-dup by issue text and cap
  const seen = new Set<string>();
  return p.filter((x) => !seen.has(x.issue) && seen.add(x.issue)).slice(0, 8);
}

export const Route = createFileRoute("/api/public/why-preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try { parsed = Body.parse(await request.json()); }
        catch { return Response.json({ error: "domain required" }, { status: 400 }); }
        const domain = normalizeDomain(parsed.domain);

        const [siteRes, scoreRes, contentRes, companyRes, citesRes] = await Promise.all([
          supabaseAdmin
            .from("intervention_sites")
            .select("id, domain, ccs_score, citation_gap")
            .eq("domain", domain)
            .maybeSingle(),
          supabaseAdmin
            .from("company_scores")
            .select("overall_ccs, canonical, authority, verifiability, information_gain, commentary, precedent, scan_date")
            .eq("domain", domain)
            .order("scan_date", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from("content_analysis")
            .select("qa_blocks, expert_signals, factual_density, freshness_days, comparison_tables, scan_date")
            .eq("domain", domain)
            .order("scan_date", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabaseAdmin
            .from("companies")
            .select("category")
            .eq("domain", domain)
            .maybeSingle(),
          supabaseAdmin
            .from("citation_events")
            .select("domain_was_cited")
            .eq("domain_queried", domain)
            .gte("queried_at", new Date(Date.now() - 24 * 3600_000).toISOString()),
        ]);

        const site = siteRes.data;
        const score = scoreRes.data as Subscores & { overall_ccs: number } | null;
        const content = contentRes.data as ContentSignals | null;
        const category = (companyRes.data as { category: string } | null)?.category ?? null;
        const citations24h = (citesRes.data ?? []).filter((c) => (c as { domain_was_cited: boolean }).domain_was_cited).length;

        // Real category average from company_scores
        let categoryAvg: number | null = null;
        if (category) {
          const { data: avgRow } = await supabaseAdmin.rpc("noop_fallback" as never).then(
            () => ({ data: null as { avg: number } | null }),
            () => ({ data: null as { avg: number } | null }),
          );
          // RPC isn't defined; use raw query via from() aggregate
          const { data: peers } = await supabaseAdmin
            .from("companies")
            .select("domain")
            .eq("category", category)
            .limit(500);
          const peerDomains = (peers ?? []).map((p) => (p as { domain: string }).domain).filter((d) => d !== domain);
          if (peerDomains.length > 0) {
            const { data: peerScores } = await supabaseAdmin
              .from("company_scores")
              .select("overall_ccs")
              .in("domain", peerDomains);
            const vals = (peerScores ?? []).map((r) => (r as { overall_ccs: number }).overall_ccs).filter((n) => n != null);
            if (vals.length) categoryAvg = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
          }
          void avgRow;
        }

        const ccs = score?.overall_ccs ?? site?.ccs_score ?? null;

        if (ccs == null && !content && !score) {
          return Response.json({
            domain,
            ccs_score: null,
            citations_24h: citations24h,
            message: "Site not yet scanned. Add it to your dashboard for a full report.",
            cta: "Add to dashboard",
            cta_url: `/dashboard/sites?add=${encodeURIComponent(domain)}`,
          });
        }

        const subscores: Subscores | null = score
          ? {
              canonical: score.canonical,
              authority: score.authority,
              verifiability: score.verifiability,
              information_gain: score.information_gain,
              commentary: score.commentary,
              precedent: score.precedent,
            }
          : null;

        const problems = buildProblems(subscores, content);
        const gapNum = ccs != null && categoryAvg != null ? Math.round((ccs - categoryAvg) * 10) / 10 : null;

        return Response.json({
          domain,
          ccs_score: ccs,
          category: category ?? "uncategorized",
          category_average: categoryAvg,
          gap: gapNum == null ? null : gapNum > 0 ? `+${gapNum}` : `${gapNum}`,
          citations_24h: citations24h,
          preview_problems: problems.slice(0, 2),
          full_report_sections: 6,
          total_problems: problems.length,
        });
      },
    },
  },
});
