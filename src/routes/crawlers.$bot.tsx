import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getCrawler, CRAWLERS } from "@/lib/crawlers/data";
import { ArrowLeft, ArrowRight, ExternalLink, Check, X, AlertTriangle } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/crawlers/$bot")({
  loader: ({ params }) => {
    const crawler = getCrawler(params.bot);
    if (!crawler) throw notFound();
    return { crawler };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.crawler;
    if (!c) return { meta: [{ title: "Crawler — Grow" }] };
    const url = `https://grow.contact/crawlers/${c.slug}`;
    const title = `${c.name} — What It Is, What It Powers, How to Configure`;
    return {
      meta: [
        { title },
        { name: "description", content: c.short },
        { property: "og:title", content: title },
        { property: "og:description", content: c.short },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: c.short },
        ...ogImageMeta({
          title: title,
          kicker: "Crawler",
          sub: c.short,
        }),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            "@id": url,
            headline: title,
            description: c.short,
            url,
            about: c.name,
            keywords: [c.name, c.operator, c.robotsToken, "AI crawler", "robots.txt"].join(", "),
            author: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
            publisher: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://grow.contact/" },
              { "@type": "ListItem", position: 2, name: "Crawlers", item: "https://grow.contact/crawlers" },
              { "@type": "ListItem", position: 3, name: c.name, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: CrawlerPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">404</p>
        <h1 className="text-4xl font-extrabold tracking-tighter uppercase mb-6">Crawler not found</h1>
        <Link to="/crawlers" className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm">
          Browse all crawlers <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});

function CrawlerPage() {

  const { crawler: c } = Route.useLoaderData() as { crawler: NonNullable<ReturnType<typeof getCrawler>> };
  const robotsBlock =
    c.recommendation === "allow"
      ? `User-agent: ${c.robotsToken}\nAllow: /`
      : `User-agent: ${c.robotsToken}\nDisallow: /`;

  const related = CRAWLERS.filter(
    (x) => x.slug !== c.slug && x.operator === c.operator,
  ).slice(0, 4);



  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <Link
            to="/crawlers"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> All crawlers
          </Link>

          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
            // {c.operator} · {c.purpose}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">
            {c.name}
          </h1>
          <p className="text-xl text-muted-foreground leading-snug mb-8">
            {c.short}
          </p>

          <div
            className={`border p-4 mb-10 ${
              c.recommendation === "allow"
                ? "border-emerald-500/40 bg-emerald-500/5"
                : c.recommendation === "block-for-opt-out"
                  ? "border-yellow-500/40 bg-yellow-500/5"
                  : "border-red-500/40 bg-red-500/5"
            }`}
          >
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest mb-2">
              {c.recommendation === "allow" ? (
                <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Recommendation: Allow</span></>
              ) : c.recommendation === "block-for-opt-out" ? (
                <><AlertTriangle className="w-3 h-3 text-yellow-400" /><span className="text-yellow-400">Recommendation: Block only as opt-out</span></>
              ) : (
                <><X className="w-3 h-3 text-red-400" /><span className="text-red-400">Recommendation: Optional block</span></>
              )}
            </div>
            <p className="text-sm">{c.recommendationText}</p>
          </div>

          <section className="grid sm:grid-cols-2 gap-4 mb-12 text-sm">
            <Fact label="Operator" value={c.operator} />
            <Fact label="Purpose" value={c.purpose} />
            <Fact label="Powers" value={c.powers} />
            <Fact label="Respects robots.txt" value={c.respectsRobots ? "Yes" : "Inconsistent"} />
            <Fact label="Executes JavaScript" value={c.executesJs} />
            <Fact label="Typical volume" value={c.typicalVolume} />
          </section>

          <section className="mb-12">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
              // Details
            </h2>
            <div className="space-y-4 text-base leading-relaxed">
              {c.details.split("\n\n").map((p: string, i: number) => (

                <p key={i}>{p}</p>
              ))}
            </div>
          </section>

          <section className="mb-12">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
              // User-agent strings
            </h2>
            <ul className="space-y-2">
              {c.userAgents.map((ua: string) => (

                <li
                  key={ua}
                  className="font-mono text-xs bg-muted/40 border border-border p-3 break-all"
                >
                  {ua}
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
              // robots.txt snippet
            </h2>
            <pre className="font-mono text-xs bg-muted/40 border border-border p-4 overflow-x-auto whitespace-pre">{robotsBlock}</pre>
          </section>

          {c.ipRanges && (
            <section className="mb-12">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
                // IP ranges
              </h2>
              <p className="text-sm text-muted-foreground">{c.ipRanges}</p>
            </section>
          )}

          <section className="mb-12 border-t border-border pt-8">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
              // Impact on AI citations
            </h2>
            <p className="text-base leading-relaxed">{c.citationsImpact}</p>
          </section>

          {c.docs && c.docs.length > 0 && (
            <section className="mb-12">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
                // Official documentation
              </h2>
              <ul className="space-y-2">
                {c.docs.map((d: { label: string; url: string }) => (

                  <li key={d.url}>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                    >
                      {d.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="pt-8 border-t border-border">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
                // Other {c.operator} bots
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to="/crawlers/$bot"
                      params={{ bot: r.slug }}
                      className="block border border-border p-4 hover:border-accent transition-colors"
                    >
                      <div className="font-bold tracking-tight mb-1">{r.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{r.short}</div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <section className="border-t border-border bg-muted/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold tracking-tighter uppercase">
                Is your robots.txt blocking citations?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                /check audits every AI bot in 5 seconds.
              </p>
            </div>
            <Link
              to="/check"
              className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm shrink-0"
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

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}
