import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import {
  CATEGORY_LABELS,
  LEADERBOARD,
  type LeaderboardCategory,
  getLeaderboard,
} from "@/lib/leaderboard/entries";
import {
  computeHeadlineStats,
  failsSignal,
  SIGNAL_LABEL,
  type SignalKey,
} from "@/lib/leaderboard/stats";
import { CitationSnippet } from "@/components/CitationSnippet";
import { InformationGainIndicator } from "@/components/InformationGainIndicator";
import { z } from "zod";

const CATEGORIES: LeaderboardCategory[] = ["infra", "models", "agents", "devtools"];
const SIGNAL_KEYS: SignalKey[] = ["semantic", "jsonLd", "llmsTxt", "citability", "speed"];

const searchSchema = z.object({
  cat: z.enum(["all", "infra", "models", "agents", "devtools"]).catch("all"),
  fail: z.enum(["none", "semantic", "jsonLd", "llmsTxt", "citability", "speed"]).catch("none"),
});

export const Route = createFileRoute("/leaderboard")({
  validateSearch: searchSchema,
  component: LeaderboardPage,
  head: () => {
    return {
      meta: [
        { title: `Agent Readability Leaderboard — ${LEADERBOARD.length} AI Sites | Grow` },
        {
          name: "description",
          content:
            `Public benchmark ranking ${LEADERBOARD.length} AI companies on how well ChatGPT, Perplexity, and Claude read and cite their sites.`,
        },
        { property: "og:title", content: `Agent Readability Leaderboard — ${LEADERBOARD.length} AI Sites` },
        {
          property: "og:description",
          content:
            "Living benchmark of how well AI startups are read by ChatGPT, Perplexity, and Claude. Filter by infra, models, agents, dev tools. Open dataset.",
        },
        { property: "og:url", content: "https://grow.contact/leaderboard" },
      ...ogImageMeta({
        title: "Agent Readability Leaderboard — ${LEADERBOARD.length} AI Sites | Grow",
        kicker: "Grow",
        sub: "Public benchmark ranking ${LEADERBOARD.length} AI companies on how well ChatGPT, Perplexity, and Claude read and cite their sites.",
      }),
    ],
      links: [{ rel: "canonical", href: "https://grow.contact/leaderboard" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Dataset",
            name: "Agent Readability Leaderboard",
            description:
              `Public benchmark of ${LEADERBOARD.length} AI companies scored on how well ChatGPT, Perplexity, and Claude can read and cite their sites.`,
            url: "https://grow.contact/leaderboard",
            license: "https://creativecommons.org/licenses/by/4.0/",
            creator: { "@type": "Organization", name: "Grow", url: "https://grow.contact" },
            distribution: [
              {
                "@type": "DataDownload",
                encodingFormat: "application/json",
                contentUrl: "https://grow.contact/api/public/leaderboard.json",
              },
            ],
            variableMeasured: ["Semantic HTML", "JSON-LD", "llms.txt", "Citability", "Speed"],
          }),
        },
      ],
    };
  },
});

function tier(score: number) {
  if (score >= 85) return { label: "AGENT-NATIVE", className: "text-accent border-accent" };
  if (score >= 70) return { label: "READABLE", className: "text-foreground border-foreground/40" };
  if (score >= 55) return { label: "PARTIAL", className: "text-muted-foreground border-border" };
  return { label: "OPAQUE", className: "text-destructive border-destructive/60" };
}

function LeaderboardPage() {
  const { cat, fail } = Route.useSearch();
  const activeCategory = cat === "all" ? undefined : cat;
  const failSignal: SignalKey | undefined = fail === "none" ? undefined : (fail as SignalKey);
  let rows = getLeaderboard(activeCategory);
  if (failSignal) rows = rows.filter((r) => failsSignal(r, failSignal));
  const allRows = getLeaderboard();
  const avg = Math.round(rows.reduce((s, r) => s + r.score, 0) / Math.max(1, rows.length));
  const agentNative = rows.filter((r) => r.score >= 85).length;
  const opaque = rows.filter((r) => r.score < 55).length;
  const headline = computeHeadlineStats();

  const counts: Record<string, number> = {
    all: allRows.length,
    infra: LEADERBOARD.filter((e) => e.category === "infra").length,
    models: LEADERBOARD.filter((e) => e.category === "models").length,
    agents: LEADERBOARD.filter((e) => e.category === "agents").length,
    devtools: LEADERBOARD.filter((e) => e.category === "devtools").length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
              // Leaderboard · open dataset · {LEADERBOARD.length} companies
            </p>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter uppercase leading-[0.9]">
              Who gets cited
              <br />
              by ChatGPT?
            </h1>
            <p className="mt-8 max-w-2xl text-muted-foreground text-lg">
              The Agent Readability Score ranks {LEADERBOARD.length} AI companies
              across <strong className="text-foreground">infra</strong>,{" "}
              <strong className="text-foreground">models</strong>,{" "}
              <strong className="text-foreground">agents</strong>, and{" "}
              <strong className="text-foreground">dev tools</strong> on how cleanly
              their site is parsed by ChatGPT, Perplexity, and Claude. Scored
              across five signals: semantic HTML, JSON-LD coverage, llms.txt,
              citability, and first-contentful speed.
            </p>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
              <StatCell label="Sites in view" value={String(rows.length)} />
              <StatCell label="Average score" value={`${avg}/100`} />
              <StatCell label="Agent-native (85+)" value={String(agentNative)} accent />
              <StatCell label="Opaque (<55)" value={String(opaque)} />
            </div>

            {/* Dataset chip */}
            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <a
                href="/api/public/leaderboard.json"
                className="border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors uppercase tracking-widest"
              >
                GET /api/public/leaderboard.json
              </a>
              <Link
                to="/leaderboard/methodology"
                className="border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors uppercase tracking-widest"
              >
                Methodology →
              </Link>
              <Link
                to="/standard/$version"
                params={{ version: "v1" }}
                className="border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors uppercase tracking-widest"
              >
                Standard v1 →
              </Link>
              <Link
                to="/badge"
                className="border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors uppercase tracking-widest"
              >
                Embed badge →
              </Link>
              <span className="uppercase tracking-widest">// CC BY 4.0 · re-scored weekly</span>
              <InformationGainIndicator
                value={61}
                measuredAt={new Date().toISOString().slice(0, 10)}
                query="ai company readability leaderboard"
              />
            </div>

          </div>
        </section>

        {/* Headline citable stats strip */}
        <section
          aria-labelledby="leaderboard-headlines"
          className="border-b border-border bg-card/40"
        >
        <section
          aria-labelledby="leaderboard-headlines"
          className="border-b border-border bg-card/40"
        >
          <div className="max-w-7xl mx-auto px-6 py-10 md:py-14">
            <h2
              id="leaderboard-headlines"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-5"
            >
              // What the {LEADERBOARD.length}-site dataset shows · cite as grow.contact/leaderboard
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {headline.citable_headlines.map((h) => (
                <li
                  key={h}
                  className="font-mono text-sm border-l-2 border-accent pl-4 py-1 text-foreground"
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Filter tabs */}
        <section aria-labelledby="leaderboard-filter-heading" className="border-b border-border bg-card/40 sticky top-0 z-10 backdrop-blur">
          <h2 id="leaderboard-filter-heading" className="sr-only">Filter leaderboard by category or signal failure</h2>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
                // Category:
              </span>
              <CategoryTab to="/leaderboard" search={{ cat: "all" as const, fail }} active={cat === "all"} label="All" count={counts.all} />
              {CATEGORIES.map((c) => (
                <CategoryTab
                  key={c}
                  to="/leaderboard"
                  search={{ cat: c, fail }}
                  active={cat === c}
                  label={CATEGORY_LABELS[c]}
                  count={counts[c]}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
                // Failing signal:
              </span>
              <FailTab to="/leaderboard" search={{ cat, fail: "none" as const }} active={fail === "none"} label="Any" />
              {SIGNAL_KEYS.map((s) => (
                <FailTab
                  key={s}
                  to="/leaderboard"
                  search={{ cat, fail: s }}
                  active={fail === s}
                  label={SIGNAL_LABEL[s]}
                />
              ))}
            </div>
          </div>
        </section>


        {/* Table */}
        <section aria-labelledby="leaderboard-ranking-heading">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <h2 id="leaderboard-ranking-heading" className="sr-only">Ranked AI sites by agent readability score</h2>
            <div className="border border-border bg-card overflow-hidden">
              <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-border bg-muted/30 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Company</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-1 text-right">Score</div>
                <div className="col-span-4">Signals (sem · jsonld · llms · cite · spd)</div>
              </div>

              <ul className="divide-y divide-border">
                {rows.map((row) => {
                  const t = tier(row.score);
                  return (
                    <li
                      key={row.domain}
                      className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-muted/20 transition-colors items-center"
                    >
                      <div className="col-span-2 md:col-span-1 font-mono text-sm tabular-nums text-muted-foreground">
                        {String(row.rank).padStart(3, "0")}
                      </div>
                      <div className="col-span-10 md:col-span-4">
                        <Link
                          to="/verify/$id"
                          params={{ id: row.domain }}
                          className="block group"
                        >
                          <div className="font-bold tracking-tighter uppercase group-hover:text-accent transition-colors">
                            {row.name}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            {row.domain}
                            {row.note ? <span className="ml-2 text-foreground/60">// {row.note}</span> : null}
                          </div>
                        </Link>
                      </div>
                      <div className="col-span-6 md:col-span-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {CATEGORY_LABELS[row.category]}
                      </div>
                      <div className="col-span-6 md:col-span-1 md:text-right">
                        <span className={`font-mono text-sm tabular-nums px-2 py-1 border ${t.className}`}>
                          {row.score}
                        </span>
                      </div>
                      <div className="col-span-12 md:col-span-4">
                        <SignalBar value={row.semantic} max={25} />
                        <div className="mt-2 grid grid-cols-5 gap-1 font-mono text-[10px] text-muted-foreground tabular-nums">
                          <span>{row.semantic}/25</span>
                          <span>{row.jsonLd}/20</span>
                          <span>{row.llmsTxt}/15</span>
                          <span>{row.citability}/20</span>
                          <span>{row.speed}/20</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              // Methodology: weighted across semantic HTML (25), JSON-LD (20),
              llms.txt (15), citability (20), first-contentful speed (20).
              Flagship rows hand-scored; long-tail rows re-scored weekly. Click any
              row for the live verdict.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">
                // Is your site here?
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase leading-[0.95]">
                Score your site
                <br />
                in under a minute.
              </h2>
              <p className="mt-6 text-muted-foreground text-lg max-w-md">
                Free scan. Semantic HTML, JSON-LD, llms.txt, citability, speed.
                See where you'd rank against {LEADERBOARD.length} AI companies.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link
                to="/check"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter hover:bg-foreground hover:text-background transition-colors"
              >
                Run /check
                <span className="font-mono text-xs">→</span>
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 font-bold uppercase tracking-tighter hover:border-accent hover:text-accent transition-colors"
              >
                Rebuild agent-native
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

type FailSearch = "none" | SignalKey;

function CategoryTab({
  to,
  search,
  active,
  label,
  count,
}: {
  to: string;
  search: { cat: "all" | LeaderboardCategory; fail: FailSearch };
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      to={to}
      search={search}
      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest border transition-colors ${
        active
          ? "bg-accent text-accent-foreground border-accent"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
      }`}
    >
      {label} <span className="tabular-nums opacity-70">({count})</span>
    </Link>
  );
}

function FailTab({
  to,
  search,
  active,
  label,
}: {
  to: string;
  search: { cat: "all" | LeaderboardCategory; fail: FailSearch };
  active: boolean;
  label: string;
}) {
  return (
    <Link
      to={to}
      search={search}
      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest border transition-colors ${
        active
          ? "bg-accent text-accent-foreground border-accent"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
      }`}
    >
      {label}
    </Link>
  );
}


function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-background p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        // {label}
      </div>
      <div
        className={`mt-2 text-2xl md:text-3xl font-extrabold tracking-tighter tabular-nums ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SignalBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-1.5 w-full bg-border overflow-hidden">
      <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}
