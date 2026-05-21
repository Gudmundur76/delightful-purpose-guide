import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getLeaderboard } from "@/lib/leaderboard/entries";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
  head: () => {
    const top = getLeaderboard().slice(0, 5).map((e) => e.name).join(", ");
    return {
      meta: [
        { title: "Agent Readability Leaderboard — Top 30 AI Sites | Grow" },
        {
          name: "description",
          content:
            "The Agent Readability Score ranks AI startups on how well ChatGPT, Perplexity, and Claude can read and cite their sites. Top 5: " +
            top + ".",
        },
        { property: "og:title", content: "Agent Readability Leaderboard — Top 30 AI Sites" },
        {
          property: "og:description",
          content:
            "Which AI startups are most readable by ChatGPT, Perplexity, and Claude? Scored across semantic HTML, JSON-LD, llms.txt, citability, and speed.",
        },
        { property: "og:url", content: "https://grow.contact/leaderboard" },
      ],
      links: [{ rel: "canonical", href: "https://grow.contact/leaderboard" }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Agent Readability Leaderboard",
            description:
              "Top AI companies ranked by Agent Readability Score — how well their site is parsed and cited by AI agents.",
            itemListOrder: "https://schema.org/ItemListOrderDescending",
            numberOfItems: getLeaderboard().length,
            itemListElement: getLeaderboard().map((e) => ({
              "@type": "ListItem",
              position: e.rank,
              name: e.name,
              url: `https://${e.domain}`,
            })),
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
  const rows = getLeaderboard();
  const avg = Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length);
  const agentNative = rows.filter((r) => r.score >= 85).length;
  const opaque = rows.filter((r) => r.score < 55).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
              // Leaderboard · live ranking
            </p>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter uppercase leading-[0.9]">
              Who gets cited
              <br />
              by ChatGPT?
            </h1>
            <p className="mt-8 max-w-2xl text-muted-foreground text-lg">
              The Agent Readability Score ranks {rows.length} well-known AI
              companies on how cleanly their site is parsed by ChatGPT,
              Perplexity, and Claude. Scored across five signals: semantic HTML,
              JSON-LD coverage, llms.txt, citability, and first-contentful
              speed.
            </p>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
              <StatCell label="Sites scored" value={String(rows.length)} />
              <StatCell label="Average score" value={`${avg}/100`} />
              <StatCell label="Agent-native (85+)" value={String(agentNative)} accent />
              <StatCell label="Opaque (<55)" value={String(opaque)} />
            </div>
          </div>
        </section>

        {/* Table */}
        <section>
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <div className="border border-border bg-card overflow-hidden">
              {/* Header row */}
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
                        {String(row.rank).padStart(2, "0")}
                      </div>
                      <div className="col-span-10 md:col-span-4">
                        <a
                          href={`https://${row.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <div className="font-bold tracking-tighter uppercase group-hover:text-accent transition-colors">
                            {row.name}
                          </div>
                          <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                            {row.domain}
                            {row.note ? <span className="ml-2 text-foreground/60">// {row.note}</span> : null}
                          </div>
                        </a>
                      </div>
                      <div className="col-span-6 md:col-span-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {row.category}
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
              Updated monthly.
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
                See where you'd rank against the top 30.
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
