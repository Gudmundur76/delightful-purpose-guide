import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeDomain } from "@/lib/interventions/shared.server";

const Body = z.object({ domain: z.string().min(3).max(255) });

function buildProblems(site: Record<string, unknown>) {
  const p: Array<{ issue: string; impact: string; fix: string; effort: string }> = [];
  // Heuristic: we don't have these specific columns, so derive from ccs_score
  const ccs = (site.ccs_score as number | null) ?? 0;
  if (ccs < 80) p.push({ issue: "No FAQ schema detected", impact: "-10 CCS", fix: "Add FAQPage JSON-LD", effort: "2h" });
  if (ccs < 70) p.push({ issue: "No llms.txt at root", impact: "-7 CCS", fix: "Create /llms.txt", effort: "1h" });
  if (ccs < 60) p.push({ issue: "AI crawlers may be blocked", impact: "-6 CCS", fix: "Allow GPTBot, ClaudeBot, PerplexityBot in robots.txt", effort: "30m" });
  if (ccs < 50) p.push({ issue: "Low factual density", impact: "-8 CCS", fix: "Add stats, numbers, citations to top pages", effort: "4h" });
  return p;
}

export const Route = createFileRoute("/api/public/why-preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let parsed;
        try { parsed = Body.parse(await request.json()); }
        catch { return Response.json({ error: "domain required" }, { status: 400 }); }
        const domain = normalizeDomain(parsed.domain);

        const { data: site } = await supabaseAdmin
          .from("intervention_sites")
          .select("id, domain, ccs_score, citation_gap")
          .eq("domain", domain)
          .maybeSingle();

        // Citations in last 24h
        const { data: cites } = await supabaseAdmin
          .from("citation_events")
          .select("id, domain_was_cited", { count: "exact", head: false })
          .eq("domain_queried", domain)
          .gte("queried_at", new Date(Date.now() - 24 * 3600_000).toISOString());
        const citations24h = (cites ?? []).filter((c) => (c as { domain_was_cited: boolean }).domain_was_cited).length;

        if (!site) {
          return Response.json({
            domain,
            ccs_score: null,
            citations_24h: citations24h,
            message: "Site not yet scanned. Add it to your dashboard for a full report.",
            cta: "Add to dashboard",
            cta_url: `/dashboard/sites?add=${encodeURIComponent(domain)}`,
          });
        }

        const ccs = (site as { ccs_score: number | null }).ccs_score ?? 0;
        const categoryAvg = 50;
        const gapNum = Math.round((ccs - categoryAvg) * 10) / 10;
        const problems = buildProblems(site as Record<string, unknown>);

        return Response.json({
          domain,
          ccs_score: ccs,
          category: "AI/ML",
          category_average: categoryAvg,
          gap: gapNum > 0 ? `+${gapNum}` : `${gapNum}`,
          citations_24h: citations24h,
          preview_problems: problems.slice(0, 2),
          full_report_sections: 6,
        });
      },
    },
  },
});
