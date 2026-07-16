import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getFeaturedPairsWithEntries } from "@/lib/compare/data";
import { ArrowRight } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

const URL_ = "https://citation.is/compare";
const TITLE = "Agent-Readability Head-to-Heads — Compare AI Companies";
const DESC =
  "Side-by-side agent-readability comparisons of the AI companies you actually compare: Anthropic vs OpenAI, Perplexity vs ChatGPT, Vercel vs Modal, Pinecone vs Weaviate, and more.";

export const Route = createFileRoute("/compare")({
  component: CompareIndex,
  head: () => {
    const pairs = getFeaturedPairsWithEntries();
    return {
      meta: [
        { title: TITLE },
        { name: "description", content: DESC },
        { property: "og:title", content: TITLE },
        { property: "og:description", content: DESC },
        { property: "og:url", content: URL_ },
        { property: "og:type", content: "website" },
        { name: "twitter:title", content: TITLE },
        { name: "twitter:description", content: DESC },
        ...ogImageMeta({
        title: "Agent-Readability Head-to-Heads — Compare AI Companies",
        kicker: "Grow",
        sub: "Side-by-side agent-readability comparisons of the AI companies you actually compare: Anthropic vs OpenAI, Perplexity vs ChatGPT, Vercel vs Modal, Pinecone vs Weaviate, and more.",
      }),
  ],
      links: [{ rel: "canonical", href: URL_ }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": URL_,
            name: "AI Company Agent-Readability Comparisons",
            description: DESC,
            numberOfItems: pairs.length,
            itemListElement: pairs.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://citation.is/compare/${p.slug}`,
              name: `${p.a.name} vs ${p.b.name}`,
            })),
          }),
        },
      ],
    };
  },
});

function CompareIndex() {
  const pairs = getFeaturedPairsWithEntries();
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <header className="border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              // Head-to-head
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase mb-6">
              Compare AI Companies
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Side-by-side <strong className="text-foreground">agent-readability</strong>{" "}
              scores for the AI companies buyers actually weigh against each
              other. Pulled live from our 390-company leaderboard, open
              methodology, CC BY 4.0 — cite freely.
            </p>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <ul className="grid sm:grid-cols-2 gap-4">
            {pairs.map((p) => {
              const winner = p.a.score >= p.b.score ? p.a : p.b;
              return (
                <li key={p.slug}>
                  <Link
                    to="/compare/$pair"
                    params={{ pair: p.slug }}
                    className="group block border border-border p-5 hover:border-accent transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-lg tracking-tight group-hover:text-accent transition-colors truncate">
                          {p.a.name} vs {p.b.name}
                        </div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                          {p.a.score}/100 · {p.b.score}/100
                        </div>
                      </div>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 shrink-0">
                        {winner.name} +{Math.abs(p.a.score - p.b.score)}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <section className="border-t border-border bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-4">
              Compare your own site
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Run the same scan we use to score every company on this list.
            </p>
            <Link
              to="/check"
              className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm"
            >
              Run /check <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
