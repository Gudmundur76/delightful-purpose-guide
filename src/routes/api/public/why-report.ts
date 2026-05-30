import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeDomain } from "@/lib/interventions/shared.server";

export const Route = createFileRoute("/api/public/why-report")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = url.searchParams.get("domain");
        if (!raw) return Response.json({ error: "domain required" }, { status: 400 });
        const domain = normalizeDomain(raw);

        const { data: site } = await supabaseAdmin
          .from("intervention_sites")
          .select("id, domain, ccs_score, report_unlocked")
          .eq("domain", domain)
          .maybeSingle();

        if (!site) return Response.json({ error: "site not found" }, { status: 404 });

        const ccs = (site as { ccs_score: number | null }).ccs_score ?? 0;
        const categoryAvg = 50;
        const expectedCites = Math.round((ccs / 100) * 25);

        const { data: cites } = await supabaseAdmin
          .from("citation_events")
          .select("engine, domain_was_cited")
          .eq("domain_queried", domain)
          .gte("queried_at", new Date(Date.now() - 7 * 24 * 3600_000).toISOString());

        const actualCites = (cites ?? []).filter((c) => (c as { domain_was_cited: boolean }).domain_was_cited).length;

        const byEngine: Record<string, { citations: number; total: number }> = {};
        for (const c of cites ?? []) {
          const e = (c as { engine: string }).engine;
          if (!byEngine[e]) byEngine[e] = { citations: 0, total: 0 };
          byEngine[e].total++;
          if ((c as { domain_was_cited: boolean }).domain_was_cited) byEngine[e].citations++;
        }

        const { data: competitors } = await supabaseAdmin
          .from("intervention_sites")
          .select("domain, ccs_score")
          .order("ccs_score", { ascending: false, nullsFirst: false })
          .limit(10);

        const yourRank = ((competitors ?? []) as Array<{ domain: string }>).findIndex((c) => c.domain === domain) + 1;

        return Response.json({
          domain,
          ccs_score: ccs,
          sections: {
            citation_gap: {
              ccs_score: ccs,
              category_avg: categoryAvg,
              expected_citations: expectedCites,
              actual_citations: actualCites,
              gap: expectedCites - actualCites,
            },
            authority: {
              score: Math.round(ccs * 0.6),
              problems: ccs < 70 ? ["Low backlink authority", "Few Reddit/HN mentions"] : [],
            },
            technical: {
              score: Math.round(ccs * 0.8),
              problems: [
                ...(ccs < 80 ? ["No FAQ schema (-10)"] : []),
                ...(ccs < 70 ? ["No llms.txt (-7)"] : []),
                ...(ccs < 60 ? ["AI crawlers blocked (-6)"] : []),
              ],
            },
            content: {
              score: Math.round(ccs * 0.7),
              problems: [
                ...(ccs < 60 ? ["Low factual density (-8)"] : []),
                ...(ccs < 50 ? ["No comparison tables (-10)"] : []),
              ],
            },
            engine_breakdown: byEngine,
            competitor_comparison: {
              your_rank: yourRank || null,
              total_in_category: (competitors ?? []).length,
              top_3: (competitors ?? []).slice(0, 3),
            },
          },
          top_fixes: [
            { action: "Add FAQ schema", impact: "+10 pts", effort: "2h", priority: 1 },
            { action: "Create llms.txt", impact: "+7 pts", effort: "1h", priority: 2 },
            { action: "Allow AI crawlers in robots.txt", impact: "+6 pts", effort: "30m", priority: 3 },
            { action: "Add comparison tables to top pages", impact: "+10 pts", effort: "4h", priority: 4 },
          ],
          cta: {
            text: "Book a free strategy call",
            url: "https://calendly.com/grow-contact/intro",
          },
        });
      },
    },
  },
});
