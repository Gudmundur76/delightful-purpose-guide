import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getPlaybook, PLAYBOOKS } from "@/lib/playbooks/data";
import { ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/playbooks/$slug")({
  loader: ({ params }) => {
    const playbook = getPlaybook(params.slug);
    if (!playbook) throw notFound();
    return { playbook };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.playbook;
    if (!p) return { meta: [{ title: "Playbook — Grow" }] };
    const url = `https://grow.contact/playbooks/${p.slug}`;
    const title = `${p.title} — GEO Playbook`;
    return {
      meta: [
        { title },
        { name: "description", content: p.short },
        { property: "og:title", content: title },
        { property: "og:description", content: p.short },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { property: "article:published_time", content: p.publishedAt },
        { property: "article:modified_time", content: p.updatedAt },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: p.short },
        { property: "og:image", content: `https://grow.contact/api/public/widget/og.svg?kicker=Playbook&title=${encodeURIComponent(title)}&sub=${encodeURIComponent(p.short)}` },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:image:alt", content: title },
        { name: "twitter:image", content: `https://grow.contact/api/public/widget/og.svg?kicker=Playbook&title=${encodeURIComponent(title)}&sub=${encodeURIComponent(p.short)}` },

      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "@id": url,
            name: p.title,
            description: p.short,
            url,
            totalTime: p.totalTime,
            datePublished: p.publishedAt,
            dateModified: p.updatedAt,
            step: p.steps.map((s, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              name: s.name,
              text: s.text,
              url: `${url}#step-${i + 1}`,
            })),
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: p.intent,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: p.intro,
                },
              },
            ],
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "https://grow.contact/" },
              { "@type": "ListItem", position: 2, name: "Playbooks", item: "https://grow.contact/playbooks" },
              { "@type": "ListItem", position: 3, name: p.title, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: PlaybookPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">404</p>
        <h1 className="text-4xl font-extrabold tracking-tighter uppercase mb-6">Playbook not found</h1>
        <Link to="/playbooks" className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm">
          Browse playbooks <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});

function PlaybookPage() {
  const { playbook: p } = Route.useLoaderData() as { playbook: NonNullable<ReturnType<typeof getPlaybook>> };
  const related = p.related
    .map((s) => PLAYBOOKS.find((x) => x.slug === s))
    .filter(Boolean) as typeof PLAYBOOKS;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <Link
            to="/playbooks"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Playbooks
          </Link>

          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
            // {p.category} · {p.difficulty}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">
            {p.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-8">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3 h-3" /> {p.totalTime.replace("PT", "").toLowerCase()}
            </span>
            <span>Updated {p.updatedAt}</span>
          </div>

          <div className="border-l-2 border-accent pl-4 mb-10">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
              // Answers
            </p>
            <p className="text-lg font-bold tracking-tight">{p.intent}</p>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed mb-12">
            {p.intro}
          </p>

          <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-border pb-3">
            // Steps
          </h2>
          <ol className="space-y-8 mb-12">
            {p.steps.map((s, i) => (
              <li key={i} id={`step-${i + 1}`} className="grid grid-cols-[auto_1fr] gap-4">
                <span className="font-mono text-3xl font-extrabold text-accent leading-none">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">{s.name}</h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <section className="border border-border bg-muted/20 p-6 mb-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-4 inline-flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" /> // Common pitfalls
            </h2>
            <ul className="space-y-3">
              {p.pitfalls.map((x, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-3">
                  <span className="text-destructive font-mono shrink-0">✗</span>
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="border border-emerald-500/30 bg-emerald-500/5 p-6 mb-12">
            <h2 className="font-mono text-xs uppercase tracking-widest text-emerald-400 mb-4 inline-flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3" /> // Verify
            </h2>
            <p className="text-sm text-foreground leading-relaxed">{p.verify}</p>
          </section>

          {related.length > 0 && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
                // Related playbooks
              </h2>
              <ul className="grid sm:grid-cols-2 gap-3">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      to="/playbooks/$slug"
                      params={{ slug: r.slug }}
                      className="block border border-border p-4 hover:border-accent transition-colors"
                    >
                      <div className="font-bold tracking-tight mb-1">{r.title}</div>
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
                Want us to ship this for you?
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Fixed price. 48-hour delivery. 100/100 or it's free.
              </p>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm shrink-0"
            >
              Start a brief <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
