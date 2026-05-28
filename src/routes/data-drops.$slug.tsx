import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getDataDrop, getAllDataDrops } from "@/lib/data-drops/data";
import { AUTHORS, DEFAULT_AUTHOR_SLUG, personJsonLd } from "@/lib/authors/data";

const AUTHOR = AUTHORS.find((a) => a.slug === DEFAULT_AUTHOR_SLUG)!;

export const Route = createFileRoute("/data-drops/$slug")({
  component: DataDropPage,
  loader: ({ params }) => {
    const drop = getDataDrop(params.slug);
    if (!drop) throw notFound();
    return { drop };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-3">Data drop not found</h1>
        <Link to="/data-drops" className="text-accent hover:underline">← All data drops</Link>
      </div>
    </div>
  ),
  head: ({ loaderData }) => {
    const d = loaderData?.drop;
    if (!d) return { meta: [{ title: "Data drop not found" }] };
    const url = `https://grow.contact/data-drops/${d.slug}`;
    return {
      meta: [
        { title: `${d.title} | Grow Data Drops` },
        { name: "description", content: d.headline },
        { property: "og:title", content: d.title },
        { property: "og:description", content: d.headline },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "og:image", content: `https://grow.contact/api/public/widget/chart/${d.slug}.svg` },
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:image", content: `https://grow.contact/api/public/widget/chart/${d.slug}.svg` },
        { property: "article:published_time", content: d.publishedAt },
        { property: "article:author", content: AUTHOR.name },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: d.title,
            datePublished: d.publishedAt,
            dateModified: d.publishedAt,
            url,
            inLanguage: "en",
            image: `https://grow.contact/api/public/widget/chart/${d.slug}.svg`,
            author: personJsonLd(AUTHOR),
            publisher: { "@type": "Organization", name: "grow.contact", url: "https://grow.contact" },
            description: d.headline,
            isBasedOn: "https://grow.contact/leaderboard",
            license: "https://creativecommons.org/licenses/by/4.0/",
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(personJsonLd(AUTHOR)),
        },
      ],
    };
  },
});

function DataDropPage() {
  const { drop } = Route.useLoaderData();
  const all = getAllDataDrops();
  const others = all.filter((d) => d.slug !== drop.slug).slice(0, 3);
  const compute = drop.compute?.();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/data-drops" className="hover:text-foreground">Data Drops</Link>
          <span className="mx-2">/</span>
          <span className="text-accent">{drop.slug}</span>
        </nav>

        <header className="mb-8 pb-6 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // Data Drop · {drop.publishedAt} · {drop.category} · By{" "}
            <Link to="/about/author/$slug" params={{ slug: AUTHOR.slug }} className="hover:text-foreground underline-offset-2 hover:underline">
              {AUTHOR.name}
            </Link>
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">{drop.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{drop.headline}</p>
        </header>

        <figure className="mb-8 border border-border bg-card">
          <img
            src={`/api/public/widget/chart/${drop.slug}.svg`}
            alt={`Chart: ${drop.title}`}
            width={720}
            height={360}
            className="w-full h-auto"
            loading="lazy"
          />
          <figcaption className="px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-t border-border">
            // Embeddable · CC BY 4.0 · Hotlink the SVG below
          </figcaption>
        </figure>

        {compute ? (
          <div className="mb-8 border border-accent/40 bg-accent/5 p-5 flex items-baseline justify-between gap-4 flex-wrap">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">// Headline figure</p>
              <p className="text-4xl font-bold mt-1">{compute.value}</p>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs text-right">{compute.basis}</p>
          </div>
        ) : null}

        <article className="prose prose-invert max-w-none mb-10 space-y-4">
          {drop.body.map((p: string, i: number) => (
            <p key={i} className="text-base leading-relaxed">{p}</p>
          ))}
        </article>

        <section className="mb-10 border border-border bg-card p-6">
          <h2 className="text-lg font-bold mb-3">Cite this drop</h2>
          <div className="space-y-3 font-mono text-xs">
            <div>
              <p className="text-muted-foreground mb-1">APA</p>
              <p className="select-all bg-background border border-border p-3">{drop.cite.apa}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">BibTeX</p>
              <pre className="select-all bg-background border border-border p-3 overflow-x-auto whitespace-pre-wrap">{drop.cite.bibtex}</pre>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Pull quote</p>
              <p className="select-all bg-background border border-border p-3 not-italic">"{drop.cite.pull_quote}" — {AUTHOR.name}, grow.contact</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Embed the chart (HTML)</p>
              <pre className="select-all bg-background border border-border p-3 overflow-x-auto whitespace-pre-wrap">{`<a href="https://grow.contact/data-drops/${drop.slug}"><img src="https://grow.contact/api/public/widget/chart/${drop.slug}.svg" alt="${drop.title.replace(/"/g, "'")}" width="720" height="360" /></a>`}</pre>
            </div>
          </div>
        </section>

        {others.length > 0 ? (
          <section className="pt-6 border-t border-border">
            <h2 className="text-lg font-bold mb-4">More drops</h2>
            <ul className="space-y-3">
              {others.map((o) => (
                <li key={o.slug}>
                  <Link to="/data-drops/$slug" params={{ slug: o.slug }} className="hover:text-accent">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">{o.publishedAt}</span>
                    {o.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <footer className="mt-10 pt-6 border-t border-border text-sm text-muted-foreground">
          <p>
            Part of the <Link to="/report/q2-2026" className="text-accent hover:underline">State of the Agent-Readable Web</Link> research series.
            Methodology: <Link to="/report/methodology" className="text-accent hover:underline">/report/methodology</Link>. CC BY 4.0.
          </p>
        </footer>
      </main>
      <SiteFooter />
    </div>
  );
}
