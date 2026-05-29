import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { parsePairSlug, findEntry, getFeaturedPairsWithEntries } from "@/lib/compare/data";
import type { LeaderboardEntry } from "@/lib/leaderboard/entries";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";


export const Route = createFileRoute("/compare/$pair")({
  loader: ({ params }) => {
    const parsed = parsePairSlug(params.pair);
    if (!parsed) throw notFound();
    const a = findEntry(parsed.aDomain);
    const b = findEntry(parsed.bDomain);
    if (!a || !b) throw notFound();
    return { a, b };
  },
  head: ({ loaderData }) => {
    const a = loaderData?.a;
    const b = loaderData?.b;
    if (!a || !b) return { meta: [{ title: "Compare — Grow" }] };
    const slug = `${a.domain.replace(/\./g, "-")}-vs-${b.domain.replace(/\./g, "-")}`;
    const url = `https://grow.contact/compare/${slug}`;
    const title = `${a.name} vs ${b.name} — Agent Readability`;
    const winner = a.score >= b.score ? a : b;
    const desc = `${a.name} scores ${a.score}/100, ${b.name} scores ${b.score}/100 on the grow.contact agent-readability index. ${winner.name} leads on AI citation surface.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
        ...ogImageMeta({
          title: title,
          kicker: "Compare",
          sub: desc,
        }),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "@id": url,
            name: `${a.name} vs ${b.name}`,
            description: desc,
            url,
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                item: {
                  "@type": "Organization",
                  name: a.name,
                  url: `https://${a.domain}`,
                  identifier: a.domain,
                },
              },
              {
                "@type": "ListItem",
                position: 2,
                item: {
                  "@type": "Organization",
                  name: b.name,
                  url: `https://${b.domain}`,
                  identifier: b.domain,
                },
              },
            ],
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
                name: `Which is more agent-readable: ${a.name} or ${b.name}?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `${winner.name} scores ${winner.score}/100 on the grow.contact six-signal agent-readability index, ahead of ${(winner === a ? b : a).name} at ${(winner === a ? b : a).score}/100. The index covers semantic HTML, JSON-LD, llms.txt, citability, page speed, and protocol discovery.`,
                },
              },
              {
                "@type": "Question",
                name: `What does the score measure?`,
                acceptedAnswer: {
                  "@type": "Answer",
                  text: `A 0-100 score combining six weighted signals: semantic HTML (25), JSON-LD structured data (20), llms.txt presence (15), citability (20), page speed (20), protocol discovery (10 bonus). Higher scores correlate with AI citations from ChatGPT, Perplexity, Claude, and Google AI Overviews.`,
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
              { "@type": "ListItem", position: 2, name: "Compare", item: "https://grow.contact/compare" },
              { "@type": "ListItem", position: 3, name: `${a.name} vs ${b.name}`, item: url },
            ],
          }),
        },
      ],
    };
  },
  component: ComparePage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-32 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">404</p>
        <h1 className="text-4xl font-extrabold tracking-tighter uppercase mb-6">Comparison not found</h1>
        <Link to="/compare" className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm">
          Browse comparisons <ArrowRight className="w-4 h-4" />
        </Link>
      </main>
      <SiteFooter />
    </div>
  ),
});

function Bar({ label, a, b, max }: { label: string; a: number; b: number; max: number }) {
  const aPct = Math.round((a / max) * 100);
  const bPct = Math.round((b / max) * 100);
  return (
    <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center py-3 border-b border-border last:border-b-0">
      <div className="text-right">
        <div className="font-mono text-xs">{a}/{max}</div>
        <div className="h-1.5 mt-1 bg-muted ml-auto" style={{ width: `${aPct}%` }}>
          <div className="h-full bg-accent" />
        </div>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center whitespace-nowrap">
        {label}
      </div>
      <div>
        <div className="font-mono text-xs">{b}/{max}</div>
        <div className="h-1.5 mt-1 bg-muted" style={{ width: `${bPct}%` }}>
          <div className="h-full bg-accent" />
        </div>
      </div>
    </div>
  );
}

function Side({ e, lead }: { e: LeaderboardEntry; lead: boolean }) {
  return (
    <div className={`border ${lead ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"} p-6`}>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {e.domain}
      </div>
      <h2 className="text-3xl font-extrabold tracking-tighter uppercase mb-3">{e.name}</h2>
      <div className="flex items-baseline gap-2 mb-4">
        <span className={`text-5xl font-extrabold ${lead ? "text-emerald-400" : "text-foreground"}`}>
          {e.score}
        </span>
        <span className="font-mono text-xs text-muted-foreground">/100</span>
        {lead && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 ml-2">
            // Leads
          </span>
        )}
      </div>
      {e.note && <p className="text-xs text-muted-foreground italic">{e.note}</p>}
    </div>
  );
}

function ComparePage() {
  const { a, b } = Route.useLoaderData() as { a: LeaderboardEntry; b: LeaderboardEntry };
  const winner = a.score >= b.score ? a : b;
  const loser = winner === a ? b : a;
  const gap = winner.score - loser.score;
  const featured = getFeaturedPairsWithEntries().slice(0, 8);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-3 h-3" /> Compare
          </Link>

          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
            // Head-to-head
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">
            {a.name} vs {b.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-snug mb-10">
            <strong className="text-foreground">{winner.name}</strong> leads the
            agent-readability index with <strong className="text-foreground">{winner.score}/100</strong>,{" "}
            {gap === 0 ? "tied with" : `ahead of ${loser.name} at`}{" "}
            {gap === 0 ? loser.name : `${loser.score}/100`}
            {gap > 0 ? ` — a ${gap}-point gap.` : "."} Both compete in the{" "}
            <strong className="text-foreground">{a.category === b.category ? a.category : `${a.category} / ${b.category}`}</strong>{" "}
            category.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 mb-12">
            <Side e={a} lead={a.score > b.score} />
            <Side e={b} lead={b.score > a.score} />
          </div>

          <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-border pb-3">
            // Six-signal radar
          </h2>
          <div className="border border-border bg-muted/10 p-4 mb-12">
            <RadarCompare a={a} b={b} />
          </div>

          <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-border pb-3">
            // Signal breakdown
          </h2>
          <div className="mb-12">
            <Bar label="Semantic HTML" a={a.semantic} b={b.semantic} max={25} />
            <Bar label="JSON-LD" a={a.jsonLd} b={b.jsonLd} max={20} />
            <Bar label="llms.txt" a={a.llmsTxt} b={b.llmsTxt} max={15} />
            <Bar label="Citability" a={a.citability} b={b.citability} max={20} />
            <Bar label="Speed" a={a.speed} b={b.speed} max={20} />
          </div>

          <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-6 border-b border-border pb-3">
            // Full metrics table
          </h2>
          <div className="overflow-x-auto mb-12 border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3">Metric</th>
                  <th className="text-right px-4 py-3">{a.name}</th>
                  <th className="text-right px-4 py-3">{b.name}</th>
                  <th className="text-right px-4 py-3">Gap</th>
                  <th className="text-right px-4 py-3">Max</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <MetricRow label="Overall CCS" a={a.score} b={b.score} max={100} />
                <MetricRow label="Semantic HTML" a={a.semantic} b={b.semantic} max={25} />
                <MetricRow label="JSON-LD" a={a.jsonLd} b={b.jsonLd} max={20} />
                <MetricRow label="llms.txt" a={a.llmsTxt} b={b.llmsTxt} max={15} />
                <MetricRow label="Citability" a={a.citability} b={b.citability} max={20} />
                <MetricRow label="Speed" a={a.speed} b={b.speed} max={20} />
              </tbody>
            </table>
            <div className="bg-muted/20 px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex flex-wrap gap-3 justify-between">
              <span>Deep-link: grow.contact/compare/{a.domain.replace(/\./g, "-")}-vs-{b.domain.replace(/\./g, "-")}</span>
              <button
                type="button"
                onClick={() => {
                  if (typeof navigator !== "undefined") {
                    void navigator.clipboard?.writeText(window.location.href);
                  }
                }}
                className="text-accent hover:text-foreground transition-colors"
              >
                Copy link
              </button>
            </div>
          </div>


          <section className="border border-border bg-muted/20 p-6 mb-12">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
              // How the score works
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              A 0–100 weighted score across six signals AI engines use to
              decide whether to cite a page: semantic HTML (25), JSON-LD
              structured data (20), llms.txt presence (15), citability (20),
              page speed (20), protocol discovery (10 bonus).
            </p>
            <Link
              to="/leaderboard/methodology"
              className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-accent hover:text-foreground transition-colors"
            >
              Full methodology <ArrowRight className="w-3 h-3" />
            </Link>
          </section>

          <section className="mt-12 pt-8 border-t border-border">
            <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-4">
              // More comparisons
            </h2>
            <ul className="grid sm:grid-cols-2 gap-3">
              {featured.filter((p) => p.a.domain !== a.domain || p.b.domain !== b.domain).slice(0, 6).map((p) => (
                <li key={p.slug}>
                  <Link
                    to="/compare/$pair"
                    params={{ pair: p.slug }}
                    className="block border border-border p-4 hover:border-accent transition-colors"
                  >
                    <div className="font-bold tracking-tight">
                      {p.a.name} vs {p.b.name}
                    </div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                      {p.a.score} · {p.b.score}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </article>

        <section className="border-t border-border bg-muted/20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-extrabold tracking-tighter uppercase">
                Where does your site rank?
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
