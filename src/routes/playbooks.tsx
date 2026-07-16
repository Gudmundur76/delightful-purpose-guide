import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PLAYBOOKS } from "@/lib/playbooks/data";
import { ArrowRight, Clock } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

const URL_ = "https://citation.is/playbooks";
const TITLE = "GEO playbooks — tactical, step-by-step AI citation guides";
const DESC =
  "Short, opinionated playbooks for earning AI citations: robots.txt for ChatGPT, llms.txt in ten minutes, Cloudflare WAF fixes, Perplexity listicle format, and more. Each one ships HowTo JSON-LD so engines can lift the steps verbatim.";

export const Route = createFileRoute("/playbooks")({
  component: PlaybooksIndex,
  head: () => ({
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
        title: "GEO Playbooks — Step-by-Step AI Citation Tactics",
        kicker: "Grow",
        sub: "Tactical step-by-step playbooks for earning AI citations: robots.txt for ChatGPT, llms.txt in 10 minutes, Cloudflare WAF fixes, Perplexity listicle format, and more. Each ships HowTo JSON-LD.",
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
          name: "GEO Playbooks",
          description: DESC,
          numberOfItems: PLAYBOOKS.length,
          itemListElement: PLAYBOOKS.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://citation.is/playbooks/${p.slug}`,
            name: p.title,
          })),
        }),
      },
    ],
  }),
});

function PlaybooksIndex() {
  const byCat: Record<string, typeof PLAYBOOKS> = {};
  for (const p of PLAYBOOKS) {
    (byCat[p.category] ??= []).push(p);
  }
  const cats = Object.keys(byCat).sort();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <header className="border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              // Playbooks
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase mb-6">
              GEO Playbooks
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {PLAYBOOKS.length} short, opinionated guides for earning AI
              citations. Each one ships <code className="text-foreground">HowTo</code>{" "}
              JSON-LD so ChatGPT, Perplexity, Claude, and Google AI Overviews
              can lift the steps verbatim.
            </p>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
          {cats.map((cat) => (
            <section key={cat}>
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-border pb-3">
                // {cat}
              </h2>
              <ul className="divide-y divide-border">
                {byCat[cat].map((p) => (
                  <li key={p.slug}>
                    <Link
                      to="/playbooks/$slug"
                      params={{ slug: p.slug }}
                      className="group block py-6 hover:bg-muted/30 -mx-3 px-3 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                        <span className="font-bold text-lg tracking-tight group-hover:text-accent transition-colors">
                          {p.title}
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground inline-flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {p.totalTime.replace("PT", "").toLowerCase()} · {p.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 max-w-3xl">
                        {p.short}
                      </p>
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
              Score your site first
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Run the free six-signal scan to find which playbooks apply to you
              right now.
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
