import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { computeHeadlineStats } from "@/lib/leaderboard/stats";
import { LEADERBOARD } from "@/lib/leaderboard/entries";
import { ogImageMeta } from "@/lib/seo/og";

// "State of the Agent-Readable Web" — a permanent, citable stats page.
// Every stat has a stable anchor (#missing-llms-txt, #weak-jsonld, …) so
// journalists, bloggers, and LLMs can deep-link to a single figure with
// attribution. This is the citation magnet: one number → one anchor → one
// citation back to grow.contact.

const PAGE_URL = "https://grow.contact/stats";
const TODAY = new Date().toISOString().slice(0, 10);

export const Route = createFileRoute("/stats")({
  component: StatsPage,
  loader: () => ({ stats: computeHeadlineStats(), sample: LEADERBOARD.length }),
  head: ({ loaderData }) => {
    const s = loaderData?.stats;
    const description = s
      ? `${s.missing_llms_txt_pct}% of ${s.total} top AI companies are missing llms.txt. ${s.opaque_pct}% score below 55 — effectively opaque to ChatGPT, Perplexity, and Claude. Open dataset, CC BY 4.0.`
      : "Quotable stats on the state of the agent-readable web. Open dataset, CC BY 4.0.";
    return {
      meta: [
        { title: "State of the Agent-Readable Web — Citable Stats | Grow" },
        { name: "description", content: description },
        { property: "og:title", content: "State of the Agent-Readable Web" },
        { property: "og:description", content: description },
        { property: "og:url", content: PAGE_URL },
      ...ogImageMeta({
        title: "State of the Agent-Readable Web — Citable Stats | Grow",
        kicker: "Grow",
      }),
    ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: s
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Dataset",
                name: "State of the Agent-Readable Web",
                description:
                  "Headline statistics over the Agent Readability Leaderboard — quotable figures on AI-citation readiness across the top AI companies.",
                url: PAGE_URL,
                license: "https://creativecommons.org/licenses/by/4.0/",
                creator: { "@type": "Organization", name: "Grow", url: "https://grow.contact" },
                isBasedOn: "https://grow.contact/leaderboard",
                distribution: [
                  {
                    "@type": "DataDownload",
                    encodingFormat: "application/json",
                    contentUrl: "https://grow.contact/api/public/leaderboard.json",
                  },
                ],
                dateModified: TODAY,
                variableMeasured: s.citable_headlines,
              }),
            },
          ]
        : [],
    };
  },
});

interface StatCardProps {
  id: string;
  value: string;
  label: string;
  blurb: string;
  cite: string;
}

function StatCard({ id, value, label, blurb, cite }: StatCardProps) {
  return (
    <article
      id={id}
      className="scroll-mt-24 border border-border bg-card p-6 flex flex-col gap-3"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
        // {label}
      </p>
      <p className="text-5xl sm:text-6xl font-extrabold tracking-tighter tabular-nums text-foreground">
        {value}
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">{blurb}</p>
      <details className="mt-2 border-t border-border pt-3">
        <summary className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground">
          Cite this stat
        </summary>
        <pre className="mt-2 text-[11px] bg-muted/30 border border-border p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed text-foreground/80">
{cite}
{`\nSource: grow.contact/stats#${id} (CC BY 4.0)`}
        </pre>
        <a
          href={`${PAGE_URL}#${id}`}
          className="mt-2 inline-block font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
        >
          Permalink ↗
        </a>
      </details>
    </article>
  );
}

function StatsPage() {
  const { stats: s, sample } = Route.useLoaderData() as {
    stats: ReturnType<typeof computeHeadlineStats>;
    sample: number;
  };

  const cards: StatCardProps[] = [
    {
      id: "missing-llms-txt",
      value: `${s.missing_llms_txt_pct}%`,
      label: "Missing llms.txt",
      blurb: `${s.missing_llms_txt_pct}% of the top ${sample} AI companies have no llms.txt or one too thin for inference. This is the single cheapest agent-readability fix — and most of the industry still skips it.`,
      cite: `${s.missing_llms_txt_pct}% of the top ${sample} AI companies are missing or under-serving llms.txt.`,
    },
    {
      id: "weak-jsonld",
      value: `${s.weak_jsonld_pct}%`,
      label: "Weak JSON-LD",
      blurb: `${s.weak_jsonld_pct}% ship insufficient structured data for reliable AI citation. ChatGPT, Perplexity, and Google AI Overviews lean on JSON-LD to know who, what, and how much.`,
      cite: `${s.weak_jsonld_pct}% of top AI companies ship insufficient JSON-LD for reliable AI citation.`,
    },
    {
      id: "opaque",
      value: `${s.opaque_pct}%`,
      label: "Opaque to AI engines",
      blurb: `${s.opaque_pct}% of the sample score below 55/100 — effectively invisible to ChatGPT, Perplexity, and Claude live search. Most are fixable in a single sprint.`,
      cite: `${s.opaque_pct}% of top AI companies are effectively opaque (score <55/100) to ChatGPT, Perplexity, and Claude.`,
    },
    {
      id: "agent-native",
      value: `${s.agent_native_pct}%`,
      label: "Clear the agent-native bar",
      blurb: `Only ${s.agent_native_pct}% of the sample clear 85/100 — the bar where a site is reliably cited across all four major AI search engines.`,
      cite: `Only ${s.agent_native_pct}% of top AI companies clear the agent-native bar (score ≥85/100).`,
    },
    {
      id: "slow-ttfb",
      value: `${s.slow_pct}%`,
      label: "Fail the speed threshold",
      blurb: `${s.slow_pct}% of sites are slow enough that AI crawlers (which timeout in 1–5s) skip them outright. The penalty isn't a ranking drop — it's silence.`,
      cite: `${s.slow_pct}% of top AI companies fail the first-byte speed threshold AI crawlers time out against.`,
    },
    {
      id: "weak-semantic",
      value: `${s.weak_semantic_pct}%`,
      label: "Weak semantic HTML",
      blurb: `${s.weak_semantic_pct}% miss core landmark elements (<main>, <article>, <nav>) AI scrapers use to extract content reliably. Cheap to fix; rarely audited.`,
      cite: `${s.weak_semantic_pct}% of top AI companies ship HTML without the semantic landmarks AI scrapers rely on.`,
    },
  ];

  return (
    <>
      <SiteHeader />
      <main className="bg-background text-foreground">
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              // grow.contact / stats · updated {TODAY}
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase max-w-4xl">
              The State of the Agent-Readable Web
            </h1>
            <p className="mt-6 max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              {s.missing_llms_txt_pct}% of the top {sample} AI companies are missing llms.txt.{" "}
              {s.opaque_pct}% are effectively opaque to ChatGPT, Perplexity, and Claude. Only{" "}
              {s.agent_native_pct}% clear the agent-native bar. These are the headline
              numbers from the open{" "}
              <Link to="/leaderboard" className="text-accent underline">
                Agent Readability Leaderboard
              </Link>
              . Every stat below has a stable anchor — cite freely under CC BY 4.0.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest">
              <span className="border border-border px-3 py-1.5 text-muted-foreground">
                Sample: {sample} AI companies
              </span>
              <span className="border border-border px-3 py-1.5 text-muted-foreground">
                License: CC BY 4.0
              </span>
              <Link
                to="/leaderboard/methodology"
                className="border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent hover:bg-accent/20"
              >
                Methodology ↗
              </Link>
              <a
                href="/api/public/leaderboard.json"
                className="border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent hover:bg-accent/20"
              >
                JSON API ↗
              </a>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-8">
              Six numbers worth quoting
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
              {cards.map((c) => (
                <StatCard key={c.id} {...c} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
            <div id="best-worst-categories" className="scroll-mt-24">
              <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-4">
                Best vs worst category
              </h2>
              <ul className="border border-border divide-y divide-border">
                {s.category_averages
                  .sort((a, b) => b.avg - a.avg)
                  .map((c) => (
                    <li
                      key={c.category}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div>
                        <p className="font-bold uppercase tracking-tighter">{c.label}</p>
                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {c.count} companies
                        </p>
                      </div>
                      <span className="text-3xl font-extrabold tracking-tighter tabular-nums">
                        {c.avg}
                        <span className="text-base text-muted-foreground">/100</span>
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            <div id="leaders" className="scroll-mt-24">
              <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-4">
                Top 5 agent-readable AI sites
              </h2>
              <ol className="border border-border divide-y divide-border">
                {s.top5.map((t, i) => (
                  <li
                    key={t.domain}
                    className="flex items-center justify-between px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="font-bold uppercase tracking-tighter">{t.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          {t.domain}
                        </p>
                      </div>
                    </div>
                    <span className="text-2xl font-extrabold tabular-nums text-accent">
                      {t.score}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-[1.2fr_1fr] gap-10 items-center">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
                // Run your own number
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">
                Where do you sit on the index?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl">
                The scanner that powers these stats is free and public. Drop a URL,
                get the same six-signal score, and a punch-list of what to fix to
                clear the agent-native bar.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/check"
                  className="bg-accent text-accent-foreground px-5 py-3 font-bold uppercase tracking-tighter hover:opacity-90"
                >
                  Run a free scan →
                </Link>
                <Link
                  to="/contact"
                  className="border border-border px-5 py-3 font-bold uppercase tracking-tighter hover:border-accent"
                >
                  Talk to the team
                </Link>
              </div>
            </div>
            <div className="border border-border bg-background p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                // For journalists & analysts
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Every figure on this page is recomputed from the same open dataset
                that powers the leaderboard. Use any of them with attribution —
                no email gate, no API key.
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/api/public/leaderboard.json"
                    className="text-accent underline"
                  >
                    /api/public/leaderboard.json
                  </a>{" "}
                  — full dataset + headline stats
                </li>
                <li>
                  <Link to="/leaderboard/methodology" className="text-accent underline">
                    /leaderboard/methodology
                  </Link>{" "}
                  — scoring weights & refresh cadence
                </li>
                <li>
                  <a href="mailto:hello@grow.contact" className="text-accent underline">
                    hello@grow.contact
                  </a>{" "}
                  — quote, comment, or custom cut
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
