// Monthly Citation Index report — Crunchbase-style snapshot of who's
// getting cited across Perplexity / ChatGPT / Claude / Google AIO.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getCitationIndex } from "@/lib/leaderboard/companies.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const citationIndexQuery = queryOptions({
  queryKey: ["citation-index"],
  queryFn: () => getCitationIndex(),
});

export const Route = createFileRoute("/citation-index")({
  loader: ({ context }) => context.queryClient.ensureQueryData(citationIndexQuery),
  component: CitationIndexPage,
  head: () => {
    const monthLabel = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
    const title = `Citation Index — ${monthLabel} | grow.contact`;
    const desc = `Monthly ranking of which AI companies get cited most by Perplexity, ChatGPT, Claude, and Google AI Overviews. ${monthLabel} report.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: "https://grow.contact/citation-index" },
        { rel: "alternate", type: "application/rss+xml", title: "Citation Index", href: "https://grow.contact/rss.xml" },
      ],
    };
  },
});

function pct(n: number) {
  return `${(n * 100).toFixed(0)}%`;
}

function Volatility({ v }: { v: "stable" | "rising" | "falling" }) {
  const map = {
    rising: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    falling: "border-red-500/40 bg-red-500/10 text-red-300",
    stable: "border-border bg-card/40 text-muted-foreground",
  };
  const label = { rising: "▲ Rising", falling: "▼ Falling", stable: "● Stable" }[v];
  return (
    <span className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${map[v]}`}>
      {label}
    </span>
  );
}

function CitationIndexPage() {
  const { data } = useSuspenseQuery(citationIndexQuery);
  const rows = data.rows;
  const monthLabel = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

  const top10 = rows.slice(0, 10);
  const movers = [...rows].filter((r) => r.volatility !== "stable").slice(0, 8);
  const byCategory = new Map<string, typeof rows>();
  for (const r of rows) {
    const arr = byCategory.get(r.category) ?? [];
    arr.push(r);
    byCategory.set(r.category, arr);
  }

  const avgCcs = rows.length ? Math.round(rows.reduce((s, r) => s + r.overall_ccs, 0) / rows.length) : 0;
  const avgProb = rows.length ? rows.reduce((s, r) => s + r.citation_probability, 0) / rows.length : 0;
  const totalCits = rows.reduce((s, r) => s + r.total_citations, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
            // monthly report / citation-index
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Citation Index — {monthLabel}
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-3xl">
            The authoritative monthly ranking of which AI companies get cited by Perplexity,
            ChatGPT, Claude, and Google AI Overviews. Methodology:{" "}
            <Link to="/leaderboard/methodology" className="text-accent underline">
              CCS v1.2
            </Link>
            . Updates monthly on the 1st.
          </p>
        </header>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Stat label="Companies tracked" value={rows.length.toString()} />
          <Stat label="Avg CCS" value={avgCcs.toString()} />
          <Stat label="Avg citation prob." value={pct(avgProb)} />
          <Stat label="30d citations" value={totalCits.toLocaleString()} />
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Top 10 most cited</h2>
          <div className="border border-border bg-card/40">
            <table className="w-full text-sm">
              <thead className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <tr>
                  <th className="text-left p-3">#</th>
                  <th className="text-left p-3">Company</th>
                  <th className="text-left p-3">Category</th>
                  <th className="text-right p-3">CCS</th>
                  <th className="text-right p-3">Citation prob.</th>
                  <th className="text-right p-3">30d cites</th>
                  <th className="text-left p-3">Trend</th>
                </tr>
              </thead>
              <tbody>
                {top10.map((r, i) => (
                  <tr key={r.domain} className="border-b border-border/50 hover:bg-card/60">
                    <td className="p-3 font-mono text-muted-foreground">{i + 1}</td>
                    <td className="p-3">
                      <Link to="/verify/$id" params={{ id: r.domain }} className="font-medium hover:text-accent">
                        {r.name}
                      </Link>
                      <div className="text-xs text-muted-foreground">{r.domain}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{r.category}</td>
                    <td className="p-3 text-right font-mono">{r.overall_ccs}</td>
                    <td className="p-3 text-right font-mono">{pct(r.citation_probability)}</td>
                    <td className="p-3 text-right font-mono">{r.total_citations.toLocaleString()}</td>
                    <td className="p-3"><Volatility v={r.volatility} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {movers.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Movers this month</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {movers.map((r) => (
                <Link
                  key={r.domain}
                  to="/verify/$id"
                  params={{ id: r.domain }}
                  className="border border-border bg-card/40 p-4 hover:border-accent transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.domain} · {r.category}</div>
                    </div>
                    <Volatility v={r.volatility} />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <div>PPLX {pct(r.perplexity_share)}</div>
                    <div>GPT {pct(r.chatgpt_share)}</div>
                    <div>CLD {pct(r.claude_share)}</div>
                    <div>AIO {pct(r.google_aio_share)}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">By category</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {Array.from(byCategory.entries()).map(([cat, items]) => (
              <div key={cat} className="border border-border bg-card/40 p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">{cat}</div>
                <ol className="space-y-1.5 text-sm">
                  {items.slice(0, 5).map((r, i) => (
                    <li key={r.domain} className="flex items-center justify-between">
                      <Link to="/verify/$id" params={{ id: r.domain }} className="hover:text-accent">
                        <span className="text-muted-foreground font-mono mr-2">{i + 1}.</span>
                        {r.name}
                      </Link>
                      <span className="font-mono text-xs text-muted-foreground">{r.overall_ccs}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-border bg-card/40 p-6 mb-12">
          <h2 className="text-xl font-semibold mb-3">Archive & data</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/report/q2-2026" className="text-accent underline">Q2 2026 full report</Link> —
              quarterly analysis with methodology
            </li>
            <li>
              <a href="/data/q2-2026/leaderboard.json" className="text-accent underline">Leaderboard JSON</a>{" "}
              · <a href="/data/q2-2026/claims.json" className="text-accent underline">Claims JSON</a> ·{" "}
              <a href="/data/q2-2026/stats.json" className="text-accent underline">Stats JSON</a>
            </li>
            <li>
              <a href="/rss.xml" className="text-accent underline">RSS feed</a> for monthly updates
            </li>
          </ul>
        </section>

        <p className="text-xs text-muted-foreground font-mono">
          Generated {new Date(data.generated_at).toISOString()} · grow.contact Citation Intelligence Platform
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-card/40 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
