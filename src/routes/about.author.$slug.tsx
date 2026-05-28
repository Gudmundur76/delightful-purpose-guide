import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getAuthor, personJsonLd, AUTHORS } from "@/lib/authors/data";
import { getAllDataDrops } from "@/lib/data-drops/data";
import { ogImageMeta } from "@/lib/seo/og";


export const Route = createFileRoute("/about/author/$slug")({
  component: AuthorPage,
  loader: ({ params }) => {
    const author = getAuthor(params.slug);
    if (!author) throw notFound();
    return { author };
  },
  notFoundComponent: () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-3">Author not found</h1>
        <Link to="/" className="text-accent hover:underline">← Home</Link>
      </div>
    </div>
  ),
  head: ({ loaderData }) => {
    const a = loaderData?.author;
    if (!a) return { meta: [{ title: "Author not found" }] };
    const url = `https://grow.contact/about/author/${a.slug}`;
    return {
      meta: [
        { title: `${a.name} — ${a.role} | Grow` },
        { name: "description", content: a.shortBio },
        { property: "og:title", content: `${a.name} — ${a.role}` },
        { property: "og:description", content: a.shortBio },
        { property: "og:url", content: url },
        { property: "og:type", content: "profile" },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(personJsonLd(a)),
        },
      ],
    };
  },
});

function AuthorPage() {
  const { author } = Route.useLoaderData();
  const drops = getAllDataDrops().slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span>About</span>
          <span className="mx-2">/</span>
          <span className="text-accent">{author.name}</span>
        </nav>

        <header className="mb-10 pb-8 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">// Research desk</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">{author.name}</h1>
          <p className="text-lg text-muted-foreground">{author.role}</p>
        </header>

        <section className="mb-10">
          <p className="text-base leading-relaxed">{author.bio}</p>
        </section>

        <section className="mb-10">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">// Focus areas</h2>
          <ul className="flex flex-wrap gap-2">
            {author.knowsAbout.map((k: string) => (
              <li key={k} className="border border-border bg-card px-3 py-1.5 text-sm">{k}</li>
            ))}
          </ul>
        </section>

        <section className="mb-10 border border-border bg-card p-6">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">// Contact</h2>
          <p className="text-sm">
            Press, analyst, and citation requests: <a href={`mailto:${author.email}`} className="text-accent hover:underline">{author.email}</a>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Press kit and pull-quotes: <Link to="/report/press" className="text-accent hover:underline">/report/press</Link>
          </p>
        </section>

        {drops.length > 0 ? (
          <section className="mb-10">
            <h2 className="text-lg font-bold mb-3">Recent publications</h2>
            <ul className="space-y-2">
              {drops.map((d) => (
                <li key={d.slug}>
                  <Link to="/data-drops/$slug" params={{ slug: d.slug }} className="hover:text-accent">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">{d.publishedAt}</span>
                    {d.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/report/q2-2026" className="hover:text-accent">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">Quarterly</span>
                  State of the Agent-Readable Web — Q2 2026
                </Link>
              </li>
            </ul>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

export const _allAuthorSlugs = AUTHORS.map((a) => a.slug);
