import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getMicropost, STAT_MICROPOSTS } from "@/lib/stats/microposts";
import { ogImageMeta } from "@/lib/seo/og";
import { ArrowRight } from "lucide-react";

const BASE = "https://grow.contact";

export const Route = createFileRoute("/stats/$slug")({
  component: MicropostPage,
  loader: ({ params }) => {
    const post = getMicropost(params.slug);
    if (!post) throw notFound();
    return { post };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Stat — Grow" }] };
    const url = `${BASE}/stats/${params.slug}`;
    return {
      meta: [
        { title: p.metaTitle },
        { name: "description", content: p.metaDescription },
        { property: "og:title", content: p.metaTitle },
        { property: "og:description", content: p.metaDescription },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:title", content: p.metaTitle },
        { name: "twitter:description", content: p.metaDescription },
        ...ogImageMeta({
          title: p.headline,
          kicker: "grow.contact / stats",
          sub: p.quotable,
        }),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: p.headline,
            description: p.metaDescription,
            url,
            datePublished: p.publishedAt,
            dateModified: p.updatedAt ?? p.publishedAt,
            author: { "@type": "Organization", name: "Grow", url: `${BASE}/` },
            publisher: { "@type": "Organization", name: "Grow", url: `${BASE}/` },
            keywords: p.tags.join(", "),
            isBasedOn: p.sources.map((s) => s.url),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: p.subject,
            description: p.quotable,
            url,
            license: "https://creativecommons.org/licenses/by/4.0/",
            creator: { "@type": "Organization", name: "Grow", url: `${BASE}/` },
            dateModified: p.updatedAt ?? p.publishedAt,
            variableMeasured: {
              "@type": "PropertyValue",
              name: p.subject,
              value: p.value,
            },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Claim",
            appearance: url,
            firstAppearance: url,
            claimReviewed: p.quotable,
            datePublished: p.publishedAt,
            author: { "@type": "Organization", name: "Grow", url: `${BASE}/` },
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
        <h1 className="text-4xl font-extrabold tracking-tighter uppercase mb-6">No such stat</h1>
        <p className="text-muted-foreground mb-8">
          That micropost doesn&rsquo;t exist. Browse the ones that do.
        </p>
        <Link
          to="/stats"
          className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm"
        >
          All stats <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-32">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-muted-foreground mb-6">{error.message}</p>
        <button onClick={() => reset()} className="text-accent underline">
          Try again
        </button>
      </main>
      <SiteFooter />
    </div>
  ),
});

function renderBody(md: string) {
  // Tiny markdown-lite: paragraphs, ## headings, - lists, **bold**, [link](url).
  const blocks = md.split(/\n\n+/);
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2
          key={i}
          className="mt-10 mb-4 text-2xl font-extrabold tracking-tighter uppercase"
        >
          {block.slice(3)}
        </h2>
      );
    }
    if (block.startsWith("- ")) {
      const items = block.split("\n").map((l) => l.replace(/^-\s+/, ""));
      return (
        <ul key={i} className="my-4 space-y-2 list-disc pl-6 text-foreground/85">
          {items.map((it, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ul>
      );
    }
    if (/^\d+\.\s/.test(block)) {
      const items = block.split("\n").map((l) => l.replace(/^\d+\.\s+/, ""));
      return (
        <ol key={i} className="my-4 space-y-2 list-decimal pl-6 text-foreground/85">
          {items.map((it, j) => (
            <li key={j} dangerouslySetInnerHTML={{ __html: inline(it) }} />
          ))}
        </ol>
      );
    }
    return (
      <p
        key={i}
        className="my-4 text-foreground/85 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: inline(block) }}
      />
    );
  });
}

function inline(s: string) {
  return s
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 text-[0.9em]">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" class="text-accent underline">$1</a>',
    );
}

function MicropostPage() {
  const { post } = Route.useLoaderData() as {
    post: NonNullable<ReturnType<typeof getMicropost>>;
  };
  const others = STAT_MICROPOSTS.filter((m) => m.slug !== post.slug).slice(0, 3);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <article>
          <header className="border-b border-border">
            <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6">
                grow.contact / stats /{" "}
                <time dateTime={post.publishedAt}>{post.publishedAt}</time>
              </div>
              <div className="mb-8 flex flex-wrap items-baseline gap-6">
                <div className="text-7xl sm:text-8xl font-extrabold tracking-tighter text-accent leading-none">
                  {post.value}
                </div>
                <div className="max-w-md text-sm text-muted-foreground">
                  {post.subject}
                </div>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6 leading-tight">
                {post.headline}
              </h1>
              <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl leading-snug">
                {post.quotable}
              </p>
              <div className="mt-8 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest">
                <span className="border border-border px-3 py-1.5 text-muted-foreground">
                  License: CC BY 4.0
                </span>
                <span className="border border-border px-3 py-1.5 text-muted-foreground">
                  Attribution: grow.contact
                </span>
                {post.tags.map((t) => (
                  <span
                    key={t}
                    className="border border-border px-3 py-1.5 text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </header>

          <section>
            <div className="max-w-3xl mx-auto px-6 py-12 sm:py-16">
              {renderBody(post.body)}
            </div>
          </section>

          <section className="border-t border-border bg-muted/10">
            <div className="max-w-3xl mx-auto px-6 py-10">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                Sources
              </div>
              <ul className="space-y-2 text-sm">
                {post.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} className="text-accent underline" rel="noopener">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="border-t border-border">
            <div className="max-w-3xl mx-auto px-6 py-10">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                Cite this
              </div>
              <pre className="whitespace-pre-wrap rounded border border-border bg-muted/30 p-4 text-xs leading-relaxed">
{`grow.contact (${post.publishedAt.slice(0, 4)}). ${post.headline}. State of the Agent-Readable Web. ${BASE}/stats/${post.slug} (accessed ${post.publishedAt}).`}
              </pre>
            </div>
          </section>
        </article>

        {others.length > 0 && (
          <section className="border-t border-border bg-muted/10">
            <div className="max-w-6xl mx-auto px-6 py-16">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                More stats
              </div>
              <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-8">
                Other numbers worth quoting
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {others.map((o) => (
                  <Link
                    key={o.slug}
                    to="/stats/$slug"
                    params={{ slug: o.slug }}
                    className="group border border-border hover:border-accent p-6 transition-colors"
                  >
                    <div className="text-3xl font-extrabold tracking-tighter text-accent mb-2">
                      {o.value}
                    </div>
                    <div className="text-sm font-semibold group-hover:text-accent transition-colors">
                      {o.headline}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
