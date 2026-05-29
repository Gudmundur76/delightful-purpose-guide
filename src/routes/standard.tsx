import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import {
  STANDARD_VERSIONS,
  getCurrentStandard,
  STANDARD_LICENSE,
} from "@/lib/standard/data";
import { CitationSnippet } from "@/components/CitationSnippet";
import { InformationGainIndicator } from "@/components/InformationGainIndicator";

const PAGE_URL = "https://grow.contact/standard";

export const Route = createFileRoute("/standard")({
  component: StandardIndex,
  head: () => {
    const current = getCurrentStandard();
    return {
      meta: [
        {
          title:
            "The Agent-Native Web Standard — A Canonical Specification for AI-Citable Websites | Grow",
        },
        {
          name: "description",
          content:
            "The Agent-Native Web Standard is a versioned, open specification defining how a website becomes legible to ChatGPT, Perplexity, Claude, and Google AI Overviews. Five signals, hard thresholds, the crawler matrix, llms.txt and JSON-LD requirements. CC BY 4.0.",
        },
        { property: "og:title", content: "The Agent-Native Web Standard" },
        {
          property: "og:description",
          content:
            "A canonical, versioned specification for agent-readable websites. Free, open, CC BY 4.0.",
        },
        { property: "og:url", content: PAGE_URL },
        { property: "og:type", content: "website" },
      ...ogImageMeta({
        title: "The Agent-Native Web Standard — A Canonical Specification for AI-Citable Websites | Grow\", }, { name: \"description\", content: \"The Agent-Native Web Standard is a versioned, open specification defining how a website becomes legible to ChatGPT, Perplexity, Claude, and Google AI Overviews. Five signals, hard thresholds, the crawler matrix, llms.txt and JSON-LD requirements. CC BY 4.0.\", }, { property: \"og:title\", content: \"The Agent-Native Web Standard",
        kicker: "Grow",
        sub: "The Agent-Native Web Standard is a versioned, open specification defining how a website becomes legible to ChatGPT, Perplexity, Claude, and Google AI Overviews. Five signals, hard thresholds, the crawler matrix, llms.txt and JSON-LD requirements. CC BY 4.0.",
      }),
    ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: "The Agent-Native Web Standard",
            description:
              "Canonical specification defining how websites become legible to AI search engines.",
            url: PAGE_URL,
            inLanguage: "en",
            license: STANDARD_LICENSE.url,
            isPartOf: { "@type": "CreativeWorkSeries", name: "The Agent-Native Web Standard" },
            hasPart: STANDARD_VERSIONS.map((v) => ({
              "@type": "TechArticle",
              name: `The Agent-Native Web Standard, ${v.label}`,
              url: `https://grow.contact/standard/${v.slug}`,
              version: v.buildId,
              datePublished: v.publishedAt,
            })),
            author: { "@type": "Organization", name: "grow.contact", url: "https://grow.contact" },
            publisher: { "@type": "Organization", name: "grow.contact", url: "https://grow.contact" },
          }),
        },
      ],
    };
  },
});

function StandardIndex() {
  const current = getCurrentStandard();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-accent">Standard</span>
        </nav>

        <header className="mb-12 pb-8 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // {current.buildId} — CC BY 4.0
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">
            The Agent-Native Web Standard
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            A versioned, open specification defining how a website becomes
            legible to AI search engines — ChatGPT, Perplexity, Claude,
            Google AI Overviews. Five signals. Hard thresholds. The crawler
            allow/block matrix that 73% of sites get wrong.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/standard/$version"
              params={{ version: current.slug }}
              className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:opacity-90"
            >
              Read {current.label} →
            </Link>
            <a
              href={`/standard/${current.slug}.md`}
              className="border border-border text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:bg-card"
            >
              Raw markdown
            </a>
            <Link
              to="/check"
              className="border border-border text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:bg-card"
            >
              Test a URL
            </Link>
          </div>
          <div className="mt-6">
            <InformationGainIndicator
              value={68}
              measuredAt={current.publishedAt}
              query="agent native web standard specification"
            />
          </div>
        </header>

        <CitationSnippet
          className="mb-12"
          citation={{
            authors: ["grow.contact"],
            year: new Date(current.publishedAt).getFullYear(),
            title: `The Agent-Native Web Standard, ${current.label}`,
            publisher: "grow.contact",
            url: `${PAGE_URL}/${current.slug}`,
            accessed: current.publishedAt,
            key: `grow-standard-${current.slug}`,
          }}
        />

        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">
            What this is
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              The Standard is a written contract. A site either passes every
              MUST in the document, or it doesn&rsquo;t. We publish it openly,
              version it like a software release, and license it CC BY 4.0 so
              any agency, contractor, or in-house team can build to it
              without paying us a cent.
            </p>
            <p>
              We use it ourselves on every Grow build. The{" "}
              <Link to="/check" className="text-foreground underline">
                /check scanner
              </Link>{" "}
              enforces the scored portion; the rest is the human-readable
              specification you&rsquo;re looking at.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">
            Why a standard
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              AI engines cite documents that other documents cite. The web is
              full of opinions about &ldquo;GEO best practice&rdquo; — what it
              lacks is a single, versioned, machine-citable specification
              anyone can point to. RFCs work this way. The web platform works
              this way. We built one for the agent-readable web.
            </p>
            <p>
              If you implement against the Standard, link to the version you
              built against. That&rsquo;s the only attribution the license
              requires.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">
            Versions
          </h2>
          <ul className="space-y-4">
            {STANDARD_VERSIONS.map((v) => (
              <li
                key={v.slug}
                className="border border-border p-4 sm:p-6 bg-card"
              >
                <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
                  <Link
                    to="/standard/$version"
                    params={{ version: v.slug }}
                    className="text-xl font-bold tracking-tighter uppercase hover:text-accent"
                  >
                    {v.label}
                  </Link>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {v.status === "current" ? "current · " : ""}
                    {v.publishedAt}
                  </span>
                </div>
                <p className="font-mono text-[11px] text-muted-foreground mb-2">
                  {v.buildId}
                </p>
                <p className="text-sm text-muted-foreground mb-3">
                  {v.changelog}
                </p>
                <div className="flex gap-3 text-xs font-mono uppercase tracking-widest">
                  <Link
                    to="/standard/$version"
                    params={{ version: v.slug }}
                    className="text-accent hover:underline"
                  >
                    Read →
                  </Link>
                  <a
                    href={`/standard/${v.slug}.md`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    .md
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">
            License & citation
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Licensed under{" "}
              <a
                href={STANDARD_LICENSE.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline"
              >
                {STANDARD_LICENSE.name}
              </a>
              . You may copy, redistribute, remix, and build on the Standard
              for any purpose — including commercial — provided you credit the
              source.
            </p>
            <p className="font-mono text-xs bg-card border border-border p-4 text-foreground">
              grow.contact (2026). The Agent-Native Web Standard, {current.label}.{" "}
              {current.buildId}. https://grow.contact/standard/{current.slug}
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">
            Related
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/check" className="text-accent hover:underline">
                /check
              </Link>
              <span className="text-muted-foreground"> — the scanner that enforces the scored portion</span>
            </li>
            <li>
              <Link to="/leaderboard" className="text-accent hover:underline">
                /leaderboard
              </Link>
              <span className="text-muted-foreground"> — 390+ AI companies measured against the Standard</span>
            </li>
            <li>
              <Link to="/report/q2-2026" className="text-accent hover:underline">
                /report/q2-2026
              </Link>
              <span className="text-muted-foreground"> — quarterly findings on standard compliance</span>
            </li>
            <li>
              <Link to="/report/methodology" className="text-accent hover:underline">
                /report/methodology
              </Link>
              <span className="text-muted-foreground"> — scoring methodology</span>
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
