import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { computeHeadlineStats } from "@/lib/leaderboard/stats";
import { LEADERBOARD, CATEGORY_LABELS } from "@/lib/leaderboard/entries";
import { AUTHORS, DEFAULT_AUTHOR_SLUG, personJsonLd } from "@/lib/authors/data";
import { VerifiabilityBadge } from "@/components/VerifiabilityBadge";
import { verifiableClaim, claimCitation, DATA_URLS } from "@/lib/seo/verifiable";

const PAGE_URL = "https://grow.contact/report/q2-2026";
const PDF_URL = "https://grow.contact/report/q2-2026.pdf";
const PUBLISHED = "2026-05-28";
const REPORT_TITLE = "State of the Agent-Readable Web — Q2 2026";
const AUTHOR = AUTHORS.find((a) => a.slug === DEFAULT_AUTHOR_SLUG)!;
const ARCHIVE_KEY = "q2-2026";


export const Route = createFileRoute("/report/q2-2026")({
  component: ReportPage,
  loader: () => ({ stats: computeHeadlineStats() }),
  head: ({ loaderData }) => {
    const s = loaderData?.stats;
    const description = s
      ? `Quarterly report on AI-citation readiness across ${s.total} top AI companies. ${s.missing_llms_txt_pct}% are missing llms.txt; ${s.opaque_pct}% score below the threshold AI engines will cite. Open dataset, CC BY 4.0.`
      : `Quarterly report on agent-readability across the AI industry. CC BY 4.0.`;
    return {
      meta: [
        { title: `${REPORT_TITLE} | Grow` },
        { name: "description", content: description },
        { property: "og:title", content: REPORT_TITLE },
        { property: "og:description", content: description },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: PUBLISHED },
        { property: "article:author", content: "grow.contact" },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: s
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Report",
                name: REPORT_TITLE,
                headline: REPORT_TITLE,
                datePublished: PUBLISHED,
                dateModified: PUBLISHED,
                inLanguage: "en",
                url: PAGE_URL,
                author: personJsonLd(AUTHOR),
                publisher: { "@type": "Organization", name: "grow.contact", url: "https://grow.contact" },
                isBasedOn: "https://grow.contact/leaderboard",
                license: "https://creativecommons.org/licenses/by/4.0/",
                about: "Agent-readability and AI citation rates across the AI industry",
                abstract: description,
                citation: s.citable_headlines,
                encoding: {
                  "@type": "MediaObject",
                  encodingFormat: "application/pdf",
                  contentUrl: PDF_URL,
                },
              }),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify(personJsonLd(AUTHOR)),
            },
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Dataset",
                name: "Agent Readability Leaderboard",
                description: `Dataset underlying ${REPORT_TITLE} — ${s.total} AI companies scored across five signals.`,
                url: "https://grow.contact/leaderboard",
                license: "https://creativecommons.org/licenses/by/4.0/",
                creator: { "@type": "Organization", name: "grow.contact" },
                distribution: [
                  {
                    "@type": "DataDownload",
                    encodingFormat: "application/json",
                    contentUrl: "https://grow.contact/api/public/leaderboard.json",
                  },
                ],
                dateModified: PUBLISHED,
              }),
            },
          ]
        : [],
    };
  },
});

function ReportPage() {
  const { stats } = Route.useLoaderData();
  const sortedCats = [...stats.category_averages].sort((a, b) => b.avg - a.avg);
  const leader = sortedCats[0];
  const trailer = sortedCats[sortedCats.length - 1];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span>Report</span>
          <span className="mx-2">/</span>
          <span className="text-accent">Q2 2026</span>
        </nav>

        <header className="mb-12 pb-8 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
            // Quarterly Report · Published {PUBLISHED} · By{" "}
            <Link to="/about/author/$slug" params={{ slug: AUTHOR.slug }} className="hover:text-foreground underline-offset-2 hover:underline">
              {AUTHOR.name}
            </Link>
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
            State of the Agent-Readable Web
            <span className="block text-2xl sm:text-3xl text-muted-foreground mt-2">Q2 2026</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            An open quarterly measurement of how reliably the AI industry's own
            marketing sites can be cited by ChatGPT, Perplexity, Claude, and
            Google AI Overviews. Across {stats.total} tracked AI companies,
            only {stats.agent_native_pct}% clear the threshold above which AI
            engines cite by name.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-mono">
            <a
              href={PDF_URL}
              className="border border-accent bg-accent/10 px-3 py-1.5 text-accent hover:bg-accent/20"
              download
            >
              Download PDF →
            </a>
            <Link to="/report/methodology" className="border border-border px-3 py-1.5 hover:border-accent">
              Methodology →
            </Link>
            <Link to="/report/press" className="border border-border px-3 py-1.5 hover:border-accent">
              Press kit →
            </Link>
            <a href="/api/public/leaderboard.json" className="border border-border px-3 py-1.5 hover:border-accent">
              Dataset (JSON) →
            </a>
            <Link to="/data-drops" className="border border-border px-3 py-1.5 hover:border-accent">
              Monthly drops →
            </Link>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Six headline findings</h2>
          <ol className="space-y-4 list-decimal list-inside">
            {stats.citable_headlines.map((line: string, i: number) => (

              <li key={i} className="text-base leading-relaxed pl-2">
                <span className="font-medium">{line}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">By category</h2>
          <p className="text-muted-foreground mb-6">
            {leader.label} leads agent-readability at {leader.avg}/100; {trailer.label} trails at {trailer.avg}/100 —
            a {Math.abs(leader.avg - trailer.avg)}-point gap inside one industry.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stats.category_averages.map((c: { category: string; label: string; avg: number; count: number }) => (

              <div key={c.category} className="border border-border bg-card p-5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent">// {c.label}</p>
                <p className="text-4xl font-bold mt-2">{c.avg}<span className="text-lg text-muted-foreground">/100</span></p>
                <p className="text-sm text-muted-foreground mt-1">avg across {c.count} sites</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Top {stats.top5.length} and bottom {stats.bottom5.length}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 mb-3">// Agent-native</h3>
              <ul className="space-y-2">
                {stats.top5.map((e: { name: string; domain: string; score: number }) => (

                  <li key={e.domain} className="flex justify-between border-b border-border pb-2 text-sm">
                    <span className="font-medium">{e.name}</span>
                    <span className="font-mono text-emerald-400">{e.score}/100</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-destructive mb-3">// Effectively opaque</h3>
              <ul className="space-y-2">
                {stats.bottom5.map((e: { name: string; domain: string; score: number }) => (

                  <li key={e.domain} className="flex justify-between border-b border-border pb-2 text-sm">
                    <span className="font-medium">{e.name}</span>
                    <span className="font-mono text-destructive">{e.score}/100</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What changed since Q1</h2>
          <ul className="space-y-3 text-base leading-relaxed">
            <li>• <strong>llms.txt adoption</strong> remains the single largest gap — {stats.missing_llms_txt_pct}% of the dataset still ships none or one too thin to serve as inference context.</li>
            <li>• <strong>JSON-LD coverage</strong> ({stats.weak_jsonld_pct}% weak) is the second-biggest leak; most failing sites ship Organization and stop there.</li>
            <li>• <strong>Speed</strong> failures concentrate in JS-rendered marketing pages with TTFB above the 800ms wall AI crawlers won't wait past — {stats.slow_pct}% of the dataset.</li>
            <li>• <strong>Citability</strong> — the front-loaded answer pattern AI engines extract from — is still rare even among the top {stats.top5.length}.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Implications for buyers</h2>
          <p className="text-base leading-relaxed mb-3">
            When {stats.opaque_pct}% of the AI industry's own marketing sites
            are below the threshold AI engines will cite, the upside is
            asymmetric. The first competitor in a category to ship clean
            HTML, valid JSON-LD, and a real llms.txt becomes the default
            answer to category queries for the entire quarter — until
            others catch up.
          </p>
          <p className="text-base leading-relaxed">
            None of the failing rows have a content problem. They have a
            reachability problem. Fixable in a single sprint.
          </p>
        </section>

        <section className="mb-12 border border-accent/40 bg-accent/5 p-6">
          <h2 className="text-xl font-bold mb-3">Cite this report</h2>
          <div className="space-y-3 font-mono text-xs">
            <div>
              <p className="text-muted-foreground mb-1">APA</p>
              <p className="select-all bg-card border border-border p-3">
                grow.contact (2026). State of the Agent-Readable Web — Q2 2026. Retrieved from {PAGE_URL}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">BibTeX</p>
              <pre className="select-all bg-card border border-border p-3 overflow-x-auto whitespace-pre-wrap">{`@techreport{grow_aiweb_q2_2026,
  author      = {{grow.contact}},
  title       = {State of the Agent-Readable Web --- Q2 2026},
  institution = {grow.contact},
  year        = {2026},
  month       = {May},
  url         = {${PAGE_URL}},
  note        = {CC BY 4.0}
}`}</pre>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Pull quote</p>
              <p className="select-all bg-card border border-border p-3 not-italic">
                "{stats.missing_llms_txt_pct}% of {stats.total} top AI companies ship no usable llms.txt — and {stats.opaque_pct}% score below the threshold AI engines will cite by name." — grow.contact, Q2 2026 report
              </p>
            </div>
          </div>
        </section>

        <footer className="pt-8 border-t border-border text-sm text-muted-foreground">
          <p>
            Dataset: {stats.total} AI companies across {CATEGORY_LABELS.infra}, {CATEGORY_LABELS.models}, {CATEGORY_LABELS.agents}, and {CATEGORY_LABELS.devtools}.
            Open under CC BY 4.0. Re-score any row at <Link to="/check" className="text-accent hover:underline">/check</Link>.
            Next report: Q3 2026, August 2026.
          </p>
        </footer>
      </main>
      <SiteFooter />
    </div>
  );
}
