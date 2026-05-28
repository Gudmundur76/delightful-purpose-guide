import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getGlossaryTerm, GLOSSARY } from "@/lib/glossary/data";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/glossary/$term")({
  loader: ({ params }) => {
    const term = getGlossaryTerm(params.term);
    if (!term) throw notFound();
    return { term };
  },
  head: ({ loaderData, params }) => {
    const t = loaderData?.term;
    if (!t) return { meta: [{ title: "Glossary — Grow" }] };
    const url = `https://grow.contact/glossary/${t.slug}`;
    const title = `${t.term} — GEO Glossary`;
    return {
      meta: [
        { title },
        { name: "description", content: t.short },
        { property: "og:title", content: title },
        { property: "og:description", content: t.short },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: t.short },
        { property: "og:image", content: `https://grow.contact/api/public/widget/og.svg?kicker=Glossary&title=${encodeURIComponent(title)}&sub=${encodeURIComponent(t.short)}` },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: title },
        { name: "twitter:image", content: `https://grow.contact/api/public/widget/og.svg?kicker=Glossary&title=${encodeURIComponent(title)}&sub=${encodeURIComponent(t.short)}` },

      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "DefinedTerm",
            "@id": url,
            name: t.term,
            description: t.short,
            url,
            termCode: t.slug,
            inDefinedTermSet: {
              "@type": "DefinedTermSet",
              "@id": "https://grow.contact/glossary",
              name: "GEO and Agent-Native Web Glossary",
              url: "https://grow.contact/glossary",
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://grow.contact/" },
              { "@type": "ListItem", position: 2, name: "Glossary", item: "https://grow.contact/glossary" },
              { "@type": "ListItem", position: 3, name: t.term, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: GlossaryTermPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">404</p>
        <h1 className="text-4xl font-extrabold tracking-tighter uppercase mb-6">Term not found</h1>
        <Link to="/glossary" className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm">
          Browse the glossary <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});

function GlossaryTermPage() {

  const { term } = Route.useLoaderData() as { term: NonNullable<ReturnType<typeof getGlossaryTerm>> };
  const relatedSlugs: string[] = term.related ?? [];
  const related = relatedSlugs
    .map((slug) => GLOSSARY.find((t) => t.slug === slug))
    .filter(Boolean) as Array<NonNullable<ReturnType<typeof getGlossaryTerm>>>;


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <Link
            to="/glossary"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Glossary
          </Link>

          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
            // {term.category}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">
            {term.term}
          </h1>
          <p className="text-xl text-muted-foreground leading-snug mb-10">
            {term.short}
          </p>

          <div className="prose prose-invert max-w-none space-y-5 text-base leading-relaxed">
            {term.long.split("\n\n").map((p: string, i: number) => (

              <p key={i}>{p}</p>
            ))}
          </div>

          {term.sources && term.sources.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
                // Sources
              </h2>
              <ul className="space-y-2">
                {term.sources.map((s: { label: string; url: string }) => (

                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
                    >
                      {s.label} <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {related.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
                // Related terms
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {related.map((r: NonNullable<ReturnType<typeof getGlossaryTerm>>) => (

                  <li key={r.slug}>
                    <Link
                      to="/glossary/$term"
                      params={{ term: r.slug }}
                      className="block border border-border p-4 hover:border-accent transition-colors"
                    >
                      <div className="font-bold tracking-tight mb-1">{r.term}</div>
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
                Score your site against this
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Free six-signal scan. No signup.
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
