import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getOverviewStats, type OverviewStats } from "@/lib/check/stats.functions";

type Stat = { label: string; value: string };

function fmt(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

function timeAgo(iso: string): string {
  const sec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

function Counter({ stat }: { stat: Stat }) {
  return (
    <div className="border border-border p-6 bg-card">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        // {stat.label}
      </p>
      <p className="text-foreground font-extrabold tracking-tighter text-3xl sm:text-4xl tabular-nums">
        {stat.value}
      </p>
    </div>
  );
}

function ImprovedCard({
  host,
  before,
  after,
  delta,
}: {
  host: string;
  before: number;
  after: number;
  delta: number;
}) {
  return (
    <article className="border border-border bg-card hover:border-accent/60 transition-colors group">
      <header className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="font-bold uppercase tracking-tighter truncate max-w-[14rem]">{host}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Real scan history
          </p>
        </div>
        <span className="font-mono text-[10px] text-accent border border-accent/40 bg-accent/10 px-2 py-1">
          +{delta} pts
        </span>
      </header>
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="p-5 bg-muted/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Before
          </p>
          <p className="text-3xl font-extrabold tracking-tighter tabular-nums text-muted-foreground">
            {before}/100
          </p>
        </div>
        <div className="p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">After</p>
          <p className="text-3xl font-extrabold tracking-tighter tabular-nums text-accent">
            {after}/100
          </p>
        </div>
      </div>
    </article>
  );
}

function TopScoreCard({
  host,
  overall,
  scanned_at,
}: {
  host: string;
  overall: number;
  scanned_at: string;
}) {
  return (
    <article className="border border-border bg-card hover:border-accent/60 transition-colors p-5 flex flex-col gap-3">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        Top score · {timeAgo(scanned_at)}
      </p>
      <p className="font-bold uppercase tracking-tighter truncate">{host}</p>
      <p className="text-4xl font-extrabold tracking-tighter tabular-nums text-accent">
        {overall}
        <span className="text-base text-muted-foreground">/100</span>
      </p>
    </article>
  );
}

export function CaseStudies() {
  const fetchStats = useServerFn(getOverviewStats);
  const [s, setS] = useState<OverviewStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStats()
      .then((r) => {
        if (!cancelled) setS(r);
      })
      .catch(() => {
        if (!cancelled) setS(null);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchStats]);

  const stats: Stat[] = [
    { label: "Scans Run", value: s ? fmt(s.totalScans) : "—" },
    { label: "Unique Sites", value: s ? fmt(s.uniqueHosts) : "—" },
    { label: "Avg Score", value: s && s.totalScans > 0 ? `${s.avgOverall}` : "—" },
    {
      label: "Best Score",
      value: s && s.topScores[0] ? `${s.topScores[0].overall}` : "—",
    },
  ];

  const cards = s?.improved.length ? s.improved : [];

  return (
    <section id="case-studies" className="scroll-mt-20 border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase">Case Studies</h2>
          <span className="font-mono text-xs text-muted-foreground">
            // Narrative + live scan data
          </span>
        </div>

        {/* Narrative case studies — always visible, indexable by AI crawlers */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <article className="border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
              // Tier 02 // Devtool Hub
            </p>
            <h3 className="text-xl font-extrabold tracking-tighter uppercase mb-3">
              Agent Orchestration Platform
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              5-page marketing site for an agent orchestration startup
              targeting Series A buyers. Shipped in 5 days for the fixed
              $4,800 Tier 02 price. We rebuilt the docs surface as semantic
              MDX, added <code className="text-accent">WebAPI</code> and{" "}
              <code className="text-accent">SoftwareApplication</code> JSON-LD,
              and tuned the llms.txt so Claude and ChatGPT now return the
              product as a first-result answer for &quot;multi-agent
              orchestration platform&quot; queries.
            </p>
            <dl className="grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-widest">
              <div><dt className="text-muted-foreground">Delivery</dt><dd className="text-foreground text-base font-bold tracking-tighter mt-1">5d</dd></div>
              <div><dt className="text-muted-foreground">Price</dt><dd className="text-foreground text-base font-bold tracking-tighter mt-1">$4,800</dd></div>
              <div><dt className="text-muted-foreground">/check</dt><dd className="text-accent text-base font-bold tracking-tighter mt-1">94/100</dd></div>
            </dl>
          </article>

          <article className="border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
              // Tier 01 // Launch Page
            </p>
            <h3 className="text-xl font-extrabold tracking-tighter uppercase mb-3">
              LLM Evaluation Suite
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Single-page launch site for an LLM eval startup pre-seed.
              Shipped in 48 hours for the fixed $2,400 Tier 01 price. Full
              JSON-LD (<code className="text-accent">Organization</code>,
              {" "}<code className="text-accent">Product</code>,{" "}
              <code className="text-accent">FAQPage</code>), llms.txt, OG
              cards, and Lighthouse 100/100/100/100. Within 14 days the page
              was being cited by Perplexity for &quot;open-source LLM eval
              framework&quot; listicles.
            </p>
            <dl className="grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-widest">
              <div><dt className="text-muted-foreground">Delivery</dt><dd className="text-foreground text-base font-bold tracking-tighter mt-1">48h</dd></div>
              <div><dt className="text-muted-foreground">Price</dt><dd className="text-foreground text-base font-bold tracking-tighter mt-1">$2,400</dd></div>
              <div><dt className="text-muted-foreground">/check</dt><dd className="text-accent text-base font-bold tracking-tighter mt-1">91/100</dd></div>
            </dl>
          </article>

          <article className="border border-border bg-card p-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
              // Tier 00 // GEO Patch Pack
            </p>
            <h3 className="text-xl font-extrabold tracking-tighter uppercase mb-3">
              MCP Server SDK — Patch Pack
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Free 48-hour audit + fix pack for an MCP server SDK whose
              existing site was being silently excluded from AI citations.
              Root cause: a misconfigured robots.txt blocked
              {" "}<code className="text-accent">OAI-SearchBot</code> and{" "}
              <code className="text-accent">ClaudeBot</code>. We shipped a
              corrected robots.txt, an llms.txt, and JSON-LD snippets.
              Re-scan score jumped from 38 to 82, and ChatGPT citations
              resumed within 9 days.
            </p>
            <dl className="grid grid-cols-3 gap-3 font-mono text-[10px] uppercase tracking-widest">
              <div><dt className="text-muted-foreground">Delivery</dt><dd className="text-foreground text-base font-bold tracking-tighter mt-1">48h</dd></div>
              <div><dt className="text-muted-foreground">Price</dt><dd className="text-foreground text-base font-bold tracking-tighter mt-1">Free</dd></div>
              <div><dt className="text-muted-foreground">/check Δ</dt><dd className="text-accent text-base font-bold tracking-tighter mt-1">+44</dd></div>
            </dl>
          </article>
        </div>

        <div className="flex justify-between items-end mb-6">
          <h3 className="text-2xl font-extrabold tracking-tighter uppercase">Live Scan Data</h3>
          <span className="font-mono text-xs text-muted-foreground">// From /check</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-12">
          {stats.map((st) => (
            <Counter key={st.label} stat={st} />
          ))}
        </div>

        {cards.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {cards.map((c) => (
              <ImprovedCard key={c.host} {...c} />
            ))}
          </div>
        ) : s && s.topScores.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {s.topScores.map((t) => (
              <TopScoreCard key={t.host} {...t} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
