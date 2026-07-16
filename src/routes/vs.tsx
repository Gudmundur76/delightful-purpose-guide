import { createFileRoute, Link, Outlet, useMatches } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getAllComparisons } from "@/lib/comparisons/data";
import { ArrowRight } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/vs")({
  component: VsLayout,
  head: () => {
    const all = getAllComparisons();
    return {
      meta: [
        { title: "Grow vs Webflow, Framer, Wix, Profound, Rankscale & Agencies" },
        {
          name: "description",
          content:
            "Honest comparisons of Grow against Webflow, Framer, Wix Studio, traditional agencies, Profound, Rankscale, and DIY GEO. Where each wins and which to pick.",
        },
        { property: "og:title", content: "Grow vs the alternatives" },
        {
          property: "og:description",
          content:
            "Side-by-side comparisons of Grow against the major web design tools, AI visibility platforms, and agencies.",
        },
        { property: "og:url", content: "https://citation.is/vs" },
      ...ogImageMeta({
        title: "Grow vs Webflow, Framer, Wix, Profound, Rankscale & Agencies",
        kicker: "Grow",
        sub: "Honest comparisons of Grow against Webflow, Framer, Wix Studio, traditional agencies, Profound, Rankscale, and DIY GEO. Where each wins and which to pick.",
      }),
    ],
      links: [{ rel: "canonical", href: "https://citation.is/vs" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Grow vs the alternatives",
            description:
              "Side-by-side comparisons of Grow against web builders, AI visibility platforms, GEO audit tools, agencies, and DIY.",
            url: "https://citation.is/vs",
            numberOfItems: all.length,
            itemListElement: all.map((c, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `https://citation.is/vs/${c.slug}`,
              name: `Grow vs ${c.competitor}`,
            })),
          }),
        },
      ],
    };
  },
});

function VsLayout() {
  // If a child /vs/:competitor route is active, render only its outlet.
  const matches = useMatches();
  const isChild = matches.some((m) => m.routeId === "/vs/$competitor");
  if (isChild) return <Outlet />;

  const all = getAllComparisons();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
              Comparisons
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase leading-[0.95] mb-8">
              Grow vs <span className="text-accent">the alternatives</span>
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl">
              Grow isn&rsquo;t the right fit for every project — and that&rsquo;s fine.
              Here&rsquo;s an honest look at where we win, where we lose, and which option
              you should actually pick depending on what you&rsquo;re building.
            </p>
          </div>
        </section>

        <section>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid sm:grid-cols-2 gap-4">
            {all.map((c) => (
              <Link
                key={c.slug}
                to="/vs/$competitor"
                params={{ competitor: c.slug }}
                className="group border border-border hover:border-accent p-8 transition-colors"
              >
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  {c.category}
                </div>
                <div className="text-3xl font-extrabold tracking-tighter uppercase mb-3 group-hover:text-accent transition-colors">
                  Grow vs {c.competitor}
                </div>
                <p className="text-foreground/80 mb-6">{c.tagline}</p>
                <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent">
                  Read comparison <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
