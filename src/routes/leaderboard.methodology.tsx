import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LEADERBOARD } from "@/lib/leaderboard/entries";
import { computeHeadlineStats } from "@/lib/leaderboard/stats";

export const Route = createFileRoute("/leaderboard/methodology")({
  component: MethodologyPage,
  head: () => ({
    meta: [
      { title: "Agent Readability Leaderboard — Methodology | Grow" },
      {
        name: "description",
        content:
          "How the Agent Readability Leaderboard scores AI companies. Five signals, weights, pass thresholds, refresh cadence, and licensing for the open dataset.",
      },
      { property: "og:title", content: "Agent Readability Leaderboard — Methodology" },
      {
        property: "og:description",
        content:
          "Transparent scoring: semantic HTML (25), JSON-LD (20), llms.txt (15), citability (20), first-byte speed (20). CC BY 4.0.",
      },
      { property: "og:url", content: "https://grow.contact/leaderboard/methodology" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/leaderboard/methodology" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: "Agent Readability Leaderboard — Methodology",
          description:
            "Scoring methodology for the Agent Readability Leaderboard: five signals, weights, thresholds, refresh cadence, and dataset license.",
          author: { "@type": "Organization", name: "Grow", url: "https://grow.contact" },
          publisher: { "@type": "Organization", name: "Grow", url: "https://grow.contact" },
          datePublished: "2026-05-28",
          dateModified: new Date().toISOString().slice(0, 10),
          url: "https://grow.contact/leaderboard/methodology",
          isPartOf: {
            "@type": "Dataset",
            name: "Agent Readability Leaderboard",
            url: "https://grow.contact/leaderboard",
          },
        }),
      },
    ],
  }),
});

const SIGNALS = [
  {
    key: "semantic",
    name: "Semantic HTML",
    weight: 25,
    pass: 19,
    blurb:
      "Landmark elements (<main>, <article>, <nav>, <section>), one H1, clean heading hierarchy, and alt text on every image. The universal signal — every AI crawler uses HTML structure to separate content from chrome.",
  },
  {
    key: "jsonLd",
    name: "JSON-LD",
    weight: 20,
    pass: 15,
    blurb:
      "Structured data in <script type=\"application/ld+json\"> blocks. Priority types: Organization, Product, FAQPage, Article, BreadcrumbList. Deeper entity nesting (Product → Brand → Organization) scores higher.",
  },
  {
    key: "llmsTxt",
    name: "llms.txt",
    weight: 15,
    pass: 11,
    blurb:
      "A curated markdown index at /llms.txt — H1 title, blockquote summary, H2 page lists. Read directly by OpenAI GPTs, Claude, and a growing set of agent tools.",
  },
  {
    key: "citability",
    name: "Citability",
    weight: 20,
    pass: 15,
    blurb:
      "Factual <title> + <meta description>, ≥150 words of substantive copy, answer-first formatting, named entities and dates the LLM can extract verbatim.",
  },
  {
    key: "speed",
    name: "First-byte speed",
    weight: 20,
    pass: 15,
    blurb:
      "TTFB under 800ms. AI crawlers timeout in 1–5 seconds — heavy client-rendered SPAs are silently excluded from citations even when the human-facing page looks fine.",
  },
];

function MethodologyPage() {
  const stats = computeHeadlineStats();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
              // Methodology · geo-standard@2026.05
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase leading-[0.95]">
              How {LEADERBOARD.length} AI sites are scored.
            </h1>
            <p className="mt-8 text-muted-foreground text-lg">
              The Agent Readability Leaderboard scores each site on five signals
              that determine whether ChatGPT, Perplexity, Claude, and Google AI
              Overviews can read and cite it. Weights total 100. Same scoring
              logic powers the free{" "}
              <Link to="/check" className="text-accent underline underline-offset-4">/check</Link>{" "}
              scanner — flagship rows are hand-scored, long-tail rows are
              deterministic estimates re-scored weekly.
            </p>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase mb-8">
              The five signals
            </h2>
            <ol className="space-y-6">
              {SIGNALS.map((s, i) => (
                <li key={s.key} className="border border-border p-6 bg-card/40">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="text-xl font-bold tracking-tighter uppercase">
                      <span className="font-mono text-muted-foreground mr-2">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.name}
                    </h3>
                    <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground tabular-nums shrink-0">
                      weight {s.weight} · pass ≥ {s.pass}
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{s.blurb}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-b border-border bg-card/40">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase mb-6">
              What the dataset shows right now
            </h2>
            <ul className="space-y-3">
              {stats.citable_headlines.map((h) => (
                <li
                  key={h}
                  className="font-mono text-sm border-l-2 border-accent pl-4 py-1 text-foreground"
                >
                  {h}
                </li>
              ))}
            </ul>
            <p className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              // Auto-computed from the live dataset. Cite as: "grow.contact
              Agent Readability Leaderboard, accessed {new Date().toISOString().slice(0, 10)}."
            </p>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase mb-6">
              Refresh cadence
            </h2>
            <p className="text-muted-foreground mb-4">
              The leaderboard re-scores all {LEADERBOARD.length} entries weekly
              via the public rescan hook. Anyone can trigger a fresh score for
              any domain on demand by visiting{" "}
              <code className="font-mono text-foreground">/check?u=&lt;domain&gt;</code>
              {" "}— the result lands in{" "}
              <Link to="/verify/$id" params={{ id: "grow.contact" }} className="text-accent underline underline-offset-4">
                /verify/&lt;domain&gt;
              </Link>{" "}
              and updates the dataset.
            </p>
          </div>
        </section>

        <section className="border-b border-border bg-card/40">
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase mb-6">
              Open dataset · CC BY 4.0
            </h2>
            <p className="text-muted-foreground mb-6">
              The full dataset is free to reuse with attribution. Hit the JSON
              endpoint directly:
            </p>
            <a
              href="/api/public/leaderboard.json"
              className="inline-block border border-border px-4 py-2 font-mono text-xs uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
            >
              GET /api/public/leaderboard.json
            </a>
            <p className="mt-6 text-sm text-muted-foreground">
              Attribution string:{" "}
              <code className="font-mono text-foreground">
                grow.contact Agent Readability Leaderboard (CC BY 4.0)
              </code>
            </p>
          </div>
        </section>

        <section>
          <div className="max-w-4xl mx-auto px-6 py-12 md:py-16 flex flex-wrap gap-3">
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter hover:bg-foreground hover:text-background transition-colors"
            >
              ← Back to leaderboard
            </Link>
            <Link
              to="/check"
              className="inline-flex items-center gap-2 border border-border px-6 py-3 font-bold uppercase tracking-tighter hover:border-accent hover:text-accent transition-colors"
            >
              Score a domain
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
