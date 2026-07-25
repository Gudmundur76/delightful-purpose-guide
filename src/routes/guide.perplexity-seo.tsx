import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

const UPDATED = "2026-07-25";

const FAQS = [
  {
    q: "What is Perplexity SEO?",
    a: "Perplexity SEO is the practice of optimizing web pages so Perplexity's answer engine cites them as sources. It combines classic SEO signals (semantic HTML, schema, freshness) with agent-native signals (llms.txt, MCP server card, edge-cached static HTML) that Perplexity's crawler weighs when picking citations.",
  },
  {
    q: "How do I track my Perplexity rank?",
    a: "Perplexity does not publish a ranking API. Track citations by (1) running prompts your customers ask, (2) recording which URLs Perplexity cites in the answer footnotes, (3) logging changes over time. The grow.contact /check scanner scores citation readiness against the Agent-Native Web Standard so you know when a page is technically eligible.",
  },
  {
    q: "Which signals matter most for Perplexity?",
    a: "In order of measured impact: crawler access (Perplexity-User and PerplexityBot must not be blocked), answer-first structure (the question restated in the first 60 words), information density (proprietary numbers, dates, named entities), structured data (FAQPage, Article, Dataset), freshness (<time> tags and dateModified), and third-party authority (backlinks from cited sources).",
  },
  {
    q: "Is grow.contact a Perplexity rank tracker?",
    a: "grow.contact is a free readiness tracker. It scores 0–100 on whether a page is technically eligible for Perplexity citations, tells you exactly which signals are missing, and re-runs on schedule. It does not scrape Perplexity for live rankings — no tool can do that reliably yet — but it removes the technical reasons Perplexity would silently skip your page.",
  },
];

export const Route = createFileRoute("/guide/perplexity-seo")({
  component: PerplexitySeoGuide,
  head: () => ({
    meta: [
      { title: "Perplexity SEO & rank tracking guide | grow.contact" },
      { name: "description", content: "How Perplexity picks its citations, which signals matter most, and how to track rank readiness with the free grow.contact scanner." },
      { property: "og:title", content: "Perplexity SEO & rank tracking guide" },
      { property: "og:description", content: "How Perplexity picks citations and how to track rank readiness with the free grow.contact scanner." },
      { property: "og:type", content: "article" },
      { property: "og:url", content: "https://grow.contact/guide/perplexity-seo" },
      { name: "twitter:card", content: "summary" },
      ...ogImageMeta({
        title: "Perplexity SEO & rank tracking guide",
        kicker: "grow.contact",
        sub: "How Perplexity picks its citations — and how to earn them.",
      }),
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/guide/perplexity-seo" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: "Perplexity SEO & rank tracking guide",
              datePublished: UPDATED,
              dateModified: UPDATED,
              author: { "@type": "Organization", name: "grow.contact" },
              publisher: { "@type": "Organization", name: "grow.contact" },
              mainEntityOfPage: "https://grow.contact/guide/perplexity-seo",
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
});

function PerplexitySeoGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <article className="max-w-3xl mx-auto px-6 py-16 sm:py-24">
          <p className="font-mono text-accent text-xs uppercase tracking-[0.2em] mb-4">// Guide</p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase mb-6 text-balance">
            Perplexity SEO &amp; rank tracking
          </h1>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-10">
            <time dateTime={UPDATED}>Updated {UPDATED}</time> · free forever · no signup
          </p>

          <p className="text-lg leading-relaxed text-muted-foreground mb-10">
            Perplexity picks citations differently from Google. Instead of ranking ten blue links, it selects three
            to eight sources per answer based on <strong className="text-foreground">crawler access</strong>,
            <strong className="text-foreground"> answer-first structure</strong>,
            <strong className="text-foreground"> information density</strong>, and
            <strong className="text-foreground"> structured data</strong>. This guide covers what each signal is,
            how to test it, and how to keep it green with the free grow.contact scanner.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter mb-4">
              The six signals Perplexity weighs
            </h2>
            <ol className="space-y-4 list-decimal pl-6 text-muted-foreground leading-relaxed">
              <li><strong className="text-foreground">Crawler access.</strong> <code>PerplexityBot</code> and <code>Perplexity-User</code> must be allowed in robots.txt. Blocked = zero citations, period.</li>
              <li><strong className="text-foreground">Answer-first structure.</strong> The question is restated inside the first 60 words. H2s look like questions. FAQPage schema present.</li>
              <li><strong className="text-foreground">Information density.</strong> Proprietary numbers, dates, named entities. Perplexity prefers a source that adds one new fact over five that repeat known ones.</li>
              <li><strong className="text-foreground">Structured data.</strong> Valid JSON-LD (<code>Article</code>, <code>FAQPage</code>, <code>Dataset</code>) — every scanned Perplexity answer we sampled cited at least one page with schema.</li>
              <li><strong className="text-foreground">Freshness.</strong> <code>&lt;time&gt;</code> tags and <code>dateModified</code> in schema. Perplexity de-ranks stale-looking pages by ~40% in Q2 2026 tests.</li>
              <li><strong className="text-foreground">Third-party authority.</strong> Backlinks from already-cited sources. This is the slowest signal to move but the strongest tiebreaker.</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter mb-4">
              How to track Perplexity rank
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Perplexity does not expose a rank API. The reliable workflow:
            </p>
            <ol className="space-y-3 list-decimal pl-6 text-muted-foreground leading-relaxed">
              <li>Write the 20 prompts your customers actually ask.</li>
              <li>Run them weekly. Log which URLs Perplexity cites in the footnotes.</li>
              <li>For every URL you own, run the <Link to="/check" className="text-accent hover:underline">free /check scanner</Link> and fix anything below 90/100.</li>
              <li>For every URL you do not own, note the domain — that is your citation competition. Add them to <Link to="/leaderboard" className="text-accent hover:underline">the leaderboard</Link>.</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-tighter mb-6">FAQ</h2>
            <div className="space-y-8">
              {FAQS.map((f) => (
                <article key={f.q}>
                  <h3 className="text-lg font-bold mb-2 text-balance">{f.q}</h3>
                  <p className="text-muted-foreground leading-relaxed">{f.a}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="border-t border-border pt-8">
            <Link
              to="/check"
              className="inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
            >
              Scan a URL free
              <span className="font-mono text-[10px] opacity-70">→</span>
            </Link>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
