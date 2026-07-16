import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const PAGE_URL = "https://citation.is/report/methodology";

export const Route = createFileRoute("/report/methodology")({
  component: MethodologyPage,
  head: () => ({
    meta: [
      { title: "Report methodology — how we measure agent-readability | Grow" },
      { name: "description", content: "How the State of the Agent-Readable Web report is built: scoring formula, signal weights, pass thresholds, scan cadence, dataset limitations, and changelog. CC BY 4.0." },
      { property: "og:title", content: "Report methodology — how we measure agent-readability" },
      { property: "og:description", content: "Scoring formula, signal weights, scan cadence, limitations, and changelog for our quarterly agent-readability report." },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Methodology — State of the Agent-Readable Web",
          url: PAGE_URL,
          author: { "@type": "Organization", name: "citation.is" },
          publisher: { "@type": "Organization", name: "citation.is", url: "https://citation.is" },
          inLanguage: "en",
          license: "https://creativecommons.org/licenses/by/4.0/",
        }),
      },
    ],
  }),
});

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-10">
      <h2 className="text-2xl font-bold mb-3">{title}</h2>
      <div className="space-y-3 text-base leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function MethodologyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/report/q2-2026" className="hover:text-foreground">Report</Link>
          <span className="mx-2">/</span>
          <span className="text-accent">Methodology</span>
        </nav>

        <header className="mb-10 pb-6 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // geo-standard@2026.05
          </p>
          <h1 className="text-4xl font-bold mb-4">Methodology</h1>
          <p className="text-lg text-muted-foreground">
            How we compute our agent-readability score, what &ldquo;pass&rdquo; means for each
            signal, how often we refresh the dataset, and where the measurement stops being
            precise — laid out so anyone can reproduce it.
          </p>
        </header>

        <Section id="signals" title="The five signals">
          <p>Each domain is scored on five signals, weighted to a 100-point total:</p>
          <ul className="list-disc list-inside space-y-1 text-foreground">
            <li><strong>Semantic HTML</strong> — 25 pts. Landmark elements, single H1, alt text coverage.</li>
            <li><strong>JSON-LD</strong> — 20 pts. Organization at root; type-specific schema per leaf (Article, Product, FAQPage, BreadcrumbList).</li>
            <li><strong>llms.txt</strong> — 15 pts. Presence, validity, and content coverage at <code>/llms.txt</code>.</li>
            <li><strong>Citability</strong> — 20 pts. Front-loaded answer, named entities, numbers and dates in the first 50–70 words.</li>
            <li><strong>Speed</strong> — 20 pts. TTFB under 800ms (full 100 below 300ms); SSR HTML below 1MB.</li>
          </ul>
        </Section>

        <Section id="thresholds" title="Pass thresholds">
          <p>A site "passes" a signal when it clears roughly 75% of that signal's max — the empirical line above which AI engines reliably extract a clean answer:</p>
          <ul className="list-disc list-inside space-y-1 text-foreground">
            <li>Semantic ≥ 19 / 25</li>
            <li>JSON-LD ≥ 15 / 20</li>
            <li>llms.txt ≥ 11 / 15</li>
            <li>Citability ≥ 15 / 20</li>
            <li>Speed ≥ 15 / 20</li>
          </ul>
          <p>Total-score milestones: <strong>≥ 85/100</strong> "agent-native" (AI engines cite by name); <strong>&lt; 55/100</strong> "effectively opaque" (engines time out or skip).</p>
        </Section>

        <Section id="dataset" title="Dataset construction">
          <p>The Agent Readability Leaderboard tracks AI-industry companies across four canonical categories — Infra, Models, Agents, Dev Tools. Flagship rows (top ~30) are hand-scored; long-tail rows are deterministic estimates seeded from domain characteristics and re-scored weekly by an automated scan against the same five-signal scorer.</p>
          <p>Any row can be re-scored live by anyone at <Link to="/check" className="text-accent hover:underline">/check?u=&lt;domain&gt;</Link>. Discrepancies between the leaderboard score and a live re-scan are expected when a site ships changes between scheduled scans.</p>
        </Section>

        <Section id="cadence" title="Scan cadence">
          <p>Weekly re-scan of the full dataset via <code>/api/public/hooks/rescan-leaderboard</code>. Quarterly report aggregates the most recent four weekly snapshots. Monthly data drops surface single-stat findings between quarterly cuts.</p>
        </Section>

        <Section id="limitations" title="Limitations">
          <ul className="list-disc list-inside space-y-1 text-foreground">
            <li><strong>Marketing pages only.</strong> Docs sites and product UIs are out of scope — their access patterns and citation needs differ.</li>
            <li><strong>Public surface only.</strong> Auth-gated content cannot be scored; sites that hide everything behind login will under-score regardless of internal quality.</li>
            <li><strong>Snapshot in time.</strong> Scores reflect the most recent scan; sites that ship daily will drift between scans.</li>
            <li><strong>Five signals, not all signals.</strong> Backlinks, brand authority, and Information Gain affect citation rates but are out of scope for this measurement.</li>
          </ul>
        </Section>

        <Section id="license" title="License & attribution">
          <p>Report text, headline statistics, and the underlying dataset are licensed CC BY 4.0. Attribution: "citation.is, State of the Agent-Readable Web (CC BY 4.0)" with a link back to the report URL.</p>
          <p>Dataset endpoint: <a href="/api/public/leaderboard.json" className="text-accent hover:underline">/api/public/leaderboard.json</a></p>
        </Section>

        <Section id="changelog" title="Changelog">
          <ul className="list-disc list-inside space-y-1 text-foreground">
            <li><strong>geo-standard@2026.05</strong> — Current. Adds Citability weighting refinement (front-loaded answer detection).</li>
            <li><strong>geo-standard@2026.02</strong> — Added speed threshold step function below 300ms TTFB.</li>
            <li><strong>geo-standard@2025.11</strong> — Initial five-signal scorer released.</li>
          </ul>
        </Section>

        <footer className="pt-8 border-t border-border text-sm text-muted-foreground">
          <p>
            Questions or corrections: <a href="mailto:hello@citation.is" className="text-accent hover:underline">hello@citation.is</a>.
            Press kit and downloadable charts: <Link to="/report/press" className="text-accent hover:underline">/report/press</Link>.
          </p>
        </footer>
      </main>
      <SiteFooter />
    </div>
  );
}
