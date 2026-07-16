import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GLOSSARY, getGlossaryByCategory } from "@/lib/glossary/data";
import { ArrowRight } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

const URL = "https://citation.is/glossary";
const TITLE = "GEO glossary — plain definitions for the agent-native web";
const DESC =
  "Short, plain-English definitions for the terms shaping generative engine optimization: llms.txt, MCP, OAI-SearchBot, JSON-LD, citability, and the rest of the agent-native web vocabulary.";

export const Route = createFileRoute("/glossary")({
  component: GlossaryIndex,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...ogImageMeta({
        title: "GEO Glossary — Agent-Native Web Terms",
        kicker: "Grow",
        sub: "Definitions for the terms shaping generative engine optimization: llms.txt, MCP, OAI-SearchBot, JSON-LD, citability, and the rest of the agent-native web vocabulary.",
      }),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "DefinedTermSet",
          "@id": URL,
          name: "GEO and Agent-Native Web Glossary",
          description: DESC,
          url: URL,
          hasDefinedTerm: GLOSSARY.map((t) => ({
            "@type": "DefinedTerm",
            "@id": `https://citation.is/glossary/${t.slug}`,
            name: t.term,
            description: t.short,
            url: `https://citation.is/glossary/${t.slug}`,
            termCode: t.slug,
          })),
        }),
      },
    ],
  }),
});

function GlossaryIndex() {
  const grouped = getGlossaryByCategory();
  const categories = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <header className="border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              // Reference
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase mb-6">
              GEO Glossary
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {GLOSSARY.length} short definitions covering the agent-native web — llms.txt,
              MCP, JSON-LD, the major crawlers, and the metrics that decide
              whether AI engines cite a site. Each term is its own citable answer with{" "}
              <code className="text-foreground">DefinedTerm</code> JSON-LD attached.
            </p>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
          {categories.map((cat) => (
            <section key={cat}>
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-border pb-3">
                // {cat}
              </h2>
              <ul className="divide-y divide-border">
                {grouped[cat].map((t) => (
                  <li key={t.slug}>
                    <Link
                      to="/glossary/$term"
                      params={{ term: t.slug }}
                      className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-5 hover:bg-muted/30 -mx-3 px-3 transition-colors"
                    >
                      <span className="font-bold text-lg tracking-tight sm:w-64 shrink-0 group-hover:text-accent transition-colors">
                        {t.term}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {t.short}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="border-t border-border bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-4">
              Score your own site
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Run the same six-signal check we use to measure every term in
              this glossary against any URL — free, no signup.
            </p>
            <Link
              to="/check"
              className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm"
            >
              Run a free scan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
