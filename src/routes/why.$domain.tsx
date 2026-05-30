import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/why/$domain")({
  component: WhyReportPage,
  head: ({ params }) => ({
    meta: [
      { title: `Why isn't ${params.domain} cited by AI? — why.grow` },
      { name: "description", content: `Full AI citation diagnostic for ${params.domain}: authority, technical, content, engine breakdown, and ranked fixes.` },
      ...ogImageMeta({ title: `Why isn't ${params.domain} cited?`, kicker: "why.grow report", sub: "AI citation diagnostic" }),
    ],
  }),
});

type Report = {
  domain: string;
  ccs_score: number;
  sections: {
    citation_gap: { ccs_score: number; category_avg: number; expected_citations: number; actual_citations: number; gap: number };
    authority: { score: number; problems: string[] };
    technical: { score: number; problems: string[] };
    content: { score: number; problems: string[] };
    engine_breakdown: Record<string, { citations: number; total: number }>;
    competitor_comparison: { your_rank: number | null; total_in_category: number; top_3: Array<{ domain: string; ccs_score: number | null }> };
  };
  top_fixes: Array<{ action: string; impact: string; effort: string; priority: number }>;
  cta: { text: string; url: string };
};

function WhyReportPage() {
  const { domain } = Route.useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/public/why-report?domain=${encodeURIComponent(domain)}`)
      .then((r) => r.ok ? r.json() : Promise.reject("not found"))
      .then(setReport)
      .catch((e) => setError(typeof e === "string" ? e : "Failed to load report"));
  }, [domain]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
        <header className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">why.grow report</p>
          <h1 className="text-4xl font-bold tracking-tight">{domain}</h1>
        </header>

        {error && <Card className="p-6"><p className="text-destructive">{error}</p></Card>}
        {!report && !error && <p className="text-muted-foreground">Loading…</p>}

        {report && (
          <div className="space-y-6">
            <Section title="1. The citation gap">
              <Grid>
                <Stat label="CCS score" value={`${report.sections.citation_gap.ccs_score}/100`} />
                <Stat label="Category avg" value={`${report.sections.citation_gap.category_avg}`} />
                <Stat label="Expected citations" value={report.sections.citation_gap.expected_citations} />
                <Stat label="Actual citations" value={report.sections.citation_gap.actual_citations} />
              </Grid>
              <p className="text-sm text-muted-foreground mt-3">
                Gap: <strong>{report.sections.citation_gap.gap}</strong> missing citations vs. expected.
              </p>
            </Section>

            <Section title="2. Authority">
              <Stat label="Score" value={`${report.sections.authority.score}/100`} />
              <ProblemList items={report.sections.authority.problems} />
            </Section>

            <Section title="3. Technical">
              <Stat label="Score" value={`${report.sections.technical.score}/100`} />
              <ProblemList items={report.sections.technical.problems} />
            </Section>

            <Section title="4. Content">
              <Stat label="Score" value={`${report.sections.content.score}/100`} />
              <ProblemList items={report.sections.content.problems} />
            </Section>

            <Section title="5. Engine breakdown (last 7 days)">
              {Object.keys(report.sections.engine_breakdown).length === 0 ? (
                <p className="text-sm text-muted-foreground">No citation events captured yet for this domain.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(report.sections.engine_breakdown).map(([engine, v]) => (
                    <div key={engine} className="flex justify-between text-sm border rounded-md p-3">
                      <span className="font-medium">{engine}</span>
                      <span className="text-muted-foreground">
                        {v.citations} / {v.total} queries cited ({v.total ? Math.round((v.citations / v.total) * 100) : 0}%)
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Section>

            <Section title="6. Competitor comparison">
              <p className="text-sm text-muted-foreground mb-3">
                Your rank: <strong>{report.sections.competitor_comparison.your_rank ?? "—"}</strong> of {report.sections.competitor_comparison.total_in_category}
              </p>
              <div className="space-y-2">
                {report.sections.competitor_comparison.top_3.map((c, i) => (
                  <div key={c.domain} className="flex justify-between text-sm border rounded-md p-3">
                    <span>{i + 1}. {c.domain}</span>
                    <span className="font-mono">{c.ccs_score ?? "—"}/100</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="Top fixes (ranked by impact)">
              <ol className="space-y-3">
                {report.top_fixes.map((f) => (
                  <li key={f.priority} className="border rounded-md p-3 flex items-start gap-3">
                    <span className="text-2xl font-bold text-muted-foreground">{f.priority}</span>
                    <div className="text-sm">
                      <p className="font-medium">{f.action}</p>
                      <p className="text-muted-foreground">Impact: {f.impact} · Effort: {f.effort}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Section>

            <Card className="p-6 text-center bg-primary/5">
              <h3 className="text-xl font-bold mb-2">Want us to fix this for you?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Free strategy call. We'll walk through your report and scope the fixes.
              </p>
              <Button asChild size="lg">
                <a href={report.cta.url} target="_blank" rel="noopener noreferrer">{report.cta.text}</a>
              </Button>
            </Card>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">{title}</h2>
      {children}
    </Card>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border rounded-md p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}

function ProblemList({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-emerald-600 mt-3">No issues detected.</p>;
  return (
    <ul className="mt-3 space-y-1 text-sm">
      {items.map((p, i) => (
        <li key={i} className="text-destructive">• {p}</li>
      ))}
    </ul>
  );
}
