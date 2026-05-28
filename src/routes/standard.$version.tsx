import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { StandardMarkdown } from "@/components/StandardMarkdown";
import {
  getStandardVersion,
  STANDARD_LICENSE,
} from "@/lib/standard/data";

export const Route = createFileRoute("/standard/$version")({
  loader: ({ params }) => {
    const version = getStandardVersion(params.version);
    if (!version) throw notFound();
    return { version };
  },
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="text-center max-w-md">
        <p className="font-mono text-accent text-xs uppercase tracking-[0.2em] mb-4">
          // 404
        </p>
        <h1 className="text-3xl font-extrabold tracking-tighter uppercase mb-4">
          Version not found
        </h1>
        <Link
          to="/standard"
          className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter"
        >
          ← All versions
        </Link>
      </div>
    </div>
  ),
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-extrabold tracking-tighter uppercase mb-4">
          Something broke
        </h1>
        <p className="text-muted-foreground text-sm mb-6">{error.message}</p>
        <button
          onClick={reset}
          className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter"
        >
          Retry
        </button>
      </div>
    </div>
  ),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const v = loaderData.version;
    const url = `https://grow.contact/standard/${v.slug}`;
    return {
      meta: [
        {
          title: `The Agent-Native Web Standard — ${v.label} (${v.buildId}) | Grow`,
        },
        { name: "description", content: v.abstract },
        {
          name: "generator",
          content: v.buildId,
        },
        { property: "og:title", content: `The Agent-Native Web Standard — ${v.label}` },
        { property: "og:description", content: v.abstract },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: v.publishedAt },
        { property: "article:author", content: "grow.contact" },
      ],
      links: [
        { rel: "canonical", href: url },
        { rel: "alternate", type: "text/markdown", href: `${url}.md` },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: `The Agent-Native Web Standard, ${v.label}`,
            description: v.abstract,
            url,
            inLanguage: "en",
            datePublished: v.publishedAt,
            dateModified: v.publishedAt,
            version: v.buildId,
            license: STANDARD_LICENSE.url,
            isPartOf: {
              "@type": "CreativeWorkSeries",
              name: "The Agent-Native Web Standard",
              url: "https://grow.contact/standard",
            },
            author: {
              "@type": "Organization",
              name: "grow.contact",
              url: "https://grow.contact",
            },
            publisher: {
              "@type": "Organization",
              name: "grow.contact",
              url: "https://grow.contact",
              logo: {
                "@type": "ImageObject",
                url: "https://grow.contact/og-image.png",
              },
            },
            encoding: [
              {
                "@type": "MediaObject",
                contentUrl: `${url}.md`,
                encodingFormat: "text/markdown",
              },
            ],
          }),
        },
      ],
    };
  },
  component: StandardVersionPage,
});

function StandardVersionPage() {
  const { version } = Route.useLoaderData();
  const url = `https://grow.contact/standard/${version.slug}`;
  const apa = `grow.contact (${version.publishedAt.slice(0, 4)}). The Agent-Native Web Standard, ${version.label} (${version.buildId}). ${url}`;
  const bibtex = `@techreport{grow_anws_${version.slug},\n  author = {{grow.contact}},\n  title = {The Agent-Native Web Standard, ${version.label}},\n  number = {${version.buildId}},\n  institution = {grow.contact},\n  year = {${version.publishedAt.slice(0, 4)}},\n  url = {${url}}\n}`;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/standard" className="hover:text-foreground">Standard</Link>
          <span className="mx-2">/</span>
          <span className="text-accent">{version.label}</span>
        </nav>

        <header className="mb-10 pb-6 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // {version.buildId} · published {version.publishedAt} · {STANDARD_LICENSE.shortName}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-4">
            The Agent-Native Web Standard
          </h1>
          <p className="text-lg text-muted-foreground">{version.abstract}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/standard/${version.slug}.md`}
              className="border border-border text-xs font-bold px-3 py-2 uppercase tracking-tighter hover:bg-card"
            >
              Raw .md
            </a>
            <Link
              to="/standard"
              className="border border-border text-xs font-bold px-3 py-2 uppercase tracking-tighter hover:bg-card"
            >
              All versions
            </Link>
            <Link
              to="/check"
              className="border border-border text-xs font-bold px-3 py-2 uppercase tracking-tighter hover:bg-card"
            >
              Test a URL
            </Link>
          </div>
        </header>

        <StandardMarkdown markdown={version.markdown} />

        <section className="mt-16 pt-8 border-t border-border">
          <h2 className="text-2xl font-bold uppercase tracking-tighter mb-4">
            Cite this version
          </h2>
          <div className="space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                APA
              </p>
              <pre className="bg-card border border-border p-3 text-xs whitespace-pre-wrap font-mono text-foreground">
                {apa}
              </pre>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                BibTeX
              </p>
              <pre className="bg-card border border-border p-3 text-xs whitespace-pre-wrap font-mono text-foreground overflow-x-auto">
                {bibtex}
              </pre>
            </div>
          </div>
        </section>

        <section className="mt-12">
          <p className="text-sm text-muted-foreground">
            Licensed under{" "}
            <a
              href={STANDARD_LICENSE.url}
              className="text-foreground underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {STANDARD_LICENSE.name}
            </a>
            . You may copy, redistribute, remix, and build on this work for
            any purpose, including commercial, with attribution.
          </p>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}
