import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getComparison, getAllComparisons } from "@/lib/comparisons/data";
import { Check, X, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/vs/$competitor")({
  component: VsPage,
  loader: ({ params }) => {
    const comparison = getComparison(params.competitor);
    if (!comparison) throw notFound();
    return { comparison };
  },
  head: ({ loaderData }) => {
    const c = loaderData?.comparison;
    if (!c) {
      return { meta: [{ title: "Comparison — Grow" }] };
    }
    const url = `https://grow.contact/vs/${c.slug}`;
    const title = `Grow vs ${c.competitor} — AI Startup Sites`;
    const description = c.oneLiner;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: c.faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: title,
            description,
            url,
            author: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
            publisher: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
          }),
        },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">404</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">No comparison yet</h1>
        <p className="text-muted-foreground mb-8">We haven't written this comparison. Browse the ones we have.</p>
        <Link to="/vs" className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm">
          See all comparisons <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-32">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </main>
      <SiteFooter />
    </div>
  ),
});

function VsPage() {
  const { comparison: c } = Route.useLoaderData() as { comparison: NonNullable<ReturnType<typeof getComparison>> };
  const others = getAllComparisons().filter((o) => o.slug !== c.slug);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
              Comparison · {c.category}
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase leading-[0.95] mb-8">
              Grow <span className="text-muted-foreground">vs</span>{" "}
              <span className="text-accent">{c.competitor}</span>
            </h1>
            <p className="text-xl sm:text-2xl text-foreground/80 max-w-3xl mb-6 leading-snug">
              {c.tagline}
            </p>
            <p className="text-base text-muted-foreground max-w-3xl">{c.oneLiner}</p>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-5 py-3 uppercase tracking-tighter text-xs">
                Start a brief <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/check" className="inline-flex items-center gap-2 border border-border hover:border-accent hover:text-accent transition-colors font-bold px-5 py-3 uppercase tracking-tighter text-xs">
                Score your current site
              </Link>
            </div>
          </div>
        </section>

        {/* Verdict */}
        <section className="border-b border-border bg-muted/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Verdict</div>
              <h2 className="text-2xl font-extrabold tracking-tighter uppercase">The short answer</h2>
            </div>
            <div className="md:col-span-2 space-y-4 text-base text-foreground/85 leading-relaxed">
              <p>{c.verdict}</p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Grow is best for:</span> {c.bestFor}
              </p>
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Side by side</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase mb-10">
              Where they differ
            </h2>

            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-4 w-1/3">
                      Dimension
                    </th>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-accent px-4 py-4">
                      Grow
                    </th>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-4">
                      {c.competitor}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {c.rows.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-4 font-semibold align-top">{r.dimension}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-2">
                          {r.growWins ? (
                            <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <span className={r.growWins ? "text-foreground" : "text-muted-foreground"}>{r.grow}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-2">
                          {!r.growWins ? (
                            <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                          )}
                          <span className={!r.growWins ? "text-foreground" : "text-muted-foreground"}>{r.competitor}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Switch / Stay */}
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-2 gap-8">
            <div className="border border-accent/40 bg-accent/5 p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">Switch to Grow if</div>
              <ul className="space-y-3">
                {c.switchIf.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/85">
                    <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-border p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Stay with {c.competitor} if
              </div>
              <ul className="space-y-3">
                {c.stayIf.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <X className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase mb-10">
              Common questions
            </h2>
            <div className="space-y-8">
              {c.faqs.map((f, i) => (
                <article key={i} className="border-b border-border pb-8 last:border-0">
                  <h3 className="text-lg font-bold mb-3">{f.q}</h3>
                  <p className="text-foreground/80 leading-relaxed">{f.a}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Other comparisons */}
        <section className="border-b border-border bg-muted/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">More comparisons</div>
            <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-8">Compare Grow to</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  to="/vs/$competitor"
                  params={{ competitor: o.slug }}
                  className="group border border-border hover:border-accent p-6 transition-colors"
                >
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                    {o.category}
                  </div>
                  <div className="text-xl font-extrabold tracking-tighter uppercase mb-2 group-hover:text-accent transition-colors">
                    Grow vs {o.competitor}
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">{o.tagline}</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">
              Ready to ship a site agents can read?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              48-hour delivery. Fixed price. Built semantic-first.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm">
                Start a brief <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/pricing" className="inline-flex items-center gap-2 border border-border hover:border-accent hover:text-accent transition-colors font-bold px-6 py-4 uppercase tracking-tighter text-sm">
                See pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
