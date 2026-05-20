import { useEffect, useRef, useState } from "react";

type Stat = { label: string; value: number; suffix?: string; prefix?: string };
const STATS: Stat[] = [
  { label: "Sites Built", value: 47 },
  { label: "Avg Score", value: 84 },
  { label: "LLM Citations", value: 156 },
  { label: "Delivery", value: 48, suffix: "h" },
];

type Case = {
  client: string;
  vertical: string;
  metric: string;
  before: number;
  after: number;
  display: (n: number) => string;
  fix: string;
  delta: string;
};

const CASES: Case[] = [
  {
    client: "Nimbus Agents",
    vertical: "Agent Orchestration",
    metric: "Agent Readability Score",
    before: 34,
    after: 89,
    display: (n) => `${Math.round(n)}/100`,
    fix: "Replaced div soup with semantic <article>/<section>, added Product + FAQ JSON-LD, shipped /llms.txt",
    delta: "+55 pts",
  },
  {
    client: "Vector Eval",
    vertical: "LLM Eval Suite",
    metric: "LLM Citations / mo",
    before: 0,
    after: 12,
    display: (n) => `${Math.round(n)}`,
    fix: "Restructured docs as cite-ready Q&A blocks, added canonical anchors, exposed /api/public/v1 OpenAPI",
    delta: "+12",
  },
  {
    client: "Helix MCP",
    vertical: "MCP Server / SDK",
    metric: "Organic Traffic",
    before: 100,
    after: 440,
    display: (n) => `${Math.round(n)}%`,
    fix: "Migrated SPA → SSR, added Article + HowTo schema on every doc page, sitemap + RSS",
    delta: "+340%",
  },
];

function useCountUp(target: number, run: boolean, duration = 1400) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!run) return;
    const steps = 60;
    const tickMs = duration / steps;
    let step = 0;

    const id = setInterval(() => {
      step++;
      const p = Math.min(1, step / steps);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p >= 1) clearInterval(id);
    }, tickMs);

    return () => clearInterval(id);
  }, [target, run, duration]);
  return n;
}

function Counter({ stat, run }: { stat: Stat; run: boolean }) {
  const n = useCountUp(stat.value, run);
  return (
    <div className="border border-border p-6 bg-card">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        // {stat.label}
      </div>
      <div className="text-4xl md:text-5xl font-extrabold tracking-tighter tabular-nums">
        {stat.prefix ?? ""}
        {Math.round(n)}
        <span className="text-accent">{stat.suffix ?? ""}</span>
      </div>
    </div>
  );
}

function CaseCard({ c, run }: { c: Case; run: boolean }) {
  const before = useCountUp(c.before, run);
  const after = useCountUp(c.after, run, 1800);
  return (
    <article className="border border-border bg-card hover:border-accent/60 transition-colors group">
      <header className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <p className="font-bold uppercase tracking-tighter">{c.client}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {c.vertical}
          </p>
        </div>
        <span className="font-mono text-[10px] text-accent border border-accent/40 bg-accent/10 px-2 py-1">
          {c.delta}
        </span>
      </header>
      <div className="grid grid-cols-2 divide-x divide-border">
        <div className="p-5 bg-muted/20">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Before
          </p>
          <p className="text-3xl font-extrabold tracking-tighter tabular-nums text-muted-foreground">
            {c.display(before)}
          </p>
          <div className="mt-4 h-16 flex items-end gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-muted-foreground/30"
                style={{ height: `${20 + ((i * 37) % 30)}%` }}
              />
            ))}
          </div>
        </div>
        <div className="p-5 relative">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
            After
          </p>
          <p className="text-3xl font-extrabold tracking-tighter tabular-nums text-accent">
            {c.display(after)}
          </p>
          <div className="mt-4 h-16 flex items-end gap-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-accent/70"
                style={{ height: `${40 + ((i * 53) % 55)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 py-4 border-t border-border">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          // Fix Applied
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed">{c.fix}</p>
      </div>
      <div className="px-5 py-3 border-t border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex justify-between">
        <span>Metric: {c.metric}</span>
        <span className="text-accent group-hover:translate-x-0.5 transition-transform">→</span>
      </div>
    </article>
  );
}

export function CaseStudies() {
  const ref = useRef<HTMLElement | null>(null);
  const [run, setRun] = useState(false);
  useEffect(() => {
    // Start animation after a short delay to ensure visibility
    const timer = setTimeout(() => setRun(true), 300);
    return () => clearTimeout(timer);
  }, []);
  return (
    <section
      ref={ref}
      id="case-studies"
      className="scroll-mt-20 border-t border-border"
    >
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase">
            Case Studies
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            // Verified outcomes
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-12">
          {STATS.map((s) => (
            <Counter key={s.label} stat={s} run={run} />
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {CASES.map((c) => (
            <CaseCard key={c.client} c={c} run={run} />
          ))}
        </div>
      </div>
    </section>
  );
}
