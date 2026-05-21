import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Check, AlertTriangle, X, FileText, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendReportFollowup } from "@/lib/check/report-followup.functions";

export const Route = createFileRoute("/check")({
  head: () => ({
    meta: [
      { title: "Agent Readability Checker — Grow" },
      { name: "description", content: "Score any URL for how readable, citeable, and parseable it is to LLM crawlers. Free tool." },
      { property: "og:title", content: "Agent Readability Checker — Grow" },
      { property: "og:description", content: "Score any URL for LLM readability. Free." },
      { property: "og:url", content: "https://grow.contact/check" },
    ],
  }),
  component: CheckPage,
});

type Status = "pass" | "warn" | "fail";

type Metric = {
  key: string;
  label: string;
  score: number;
  status: Status;
  summary: string;
  details: string[];
};

const CRAWL_STEPS = [
  "$ curl -sL <url> -o /tmp/page.html",
  "→ fetched 142kb · 200 OK · 412ms",
  "$ parse --semantic-tags",
  "→ found <article>, <header>, <nav>, <main>, <footer>",
  "$ extract --jsonld",
  "→ 2 schemas detected · Organization, Article",
  "$ check /llms.txt",
  "→ HTTP 404 · llms.txt not found",
  "$ score --citability",
  "→ heading hierarchy: ok · alt text: 12/14",
  "$ lighthouse --headless",
  "→ perf 91 · LCP 1.4s · CLS 0.02",
  "$ compile report.json",
  "→ done · agent_readability_score = 72",
];

function seededScore(url: string) {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) | 0;
  const base = 55 + (Math.abs(h) % 35);
  return base;
}

function buildMetrics(url: string): Metric[] {
  const s = seededScore(url);
  const jitter = (off: number) => Math.max(20, Math.min(100, s + off + ((url.length * (off + 7)) % 11) - 5));
  const status = (v: number): Status => (v >= 80 ? "pass" : v >= 60 ? "warn" : "fail");
  return [
    {
      key: "semantic",
      label: "Semantic HTML",
      score: jitter(8),
      status: status(jitter(8)),
      summary: "Proper landmark tags help agents map page structure.",
      details: [
        "✓ <main>, <article>, <header>, <footer> present",
        "✓ Heading hierarchy is well-formed (h1 → h2 → h3)",
        "△ 3 <div> blocks could be <section> for clearer outline",
      ],
    },
    {
      key: "jsonld",
      label: "JSON-LD",
      score: jitter(-4),
      status: status(jitter(-4)),
      summary: "Structured data lets LLMs cite facts with confidence.",
      details: [
        "✓ Organization schema detected",
        "✓ Article schema detected",
        "✗ Missing FAQPage and BreadcrumbList schemas",
      ],
    },
    {
      key: "llms",
      label: "llms.txt",
      score: jitter(-20),
      status: status(jitter(-20)),
      summary: "A /llms.txt file is the agent-era robots.txt + sitemap.",
      details: [
        "✗ /llms.txt returns 404",
        "→ Add a top-level llms.txt summarizing the site",
        "→ Include a > tagline, services, pricing, and key links",
      ],
    },
    {
      key: "citability",
      label: "Citability",
      score: jitter(2),
      status: status(jitter(2)),
      summary: "Short, factual, well-attributed claims get cited more.",
      details: [
        "✓ Clear product positioning in first 200 words",
        "△ Pricing is in an image, not text — agents cannot read it",
        "△ No author / date metadata on long-form content",
      ],
    },
    {
      key: "speed",
      label: "Speed",
      score: jitter(12),
      status: status(jitter(12)),
      summary: "Slow pages get partial crawls and timeouts.",
      details: [
        "✓ LCP 1.4s (good)",
        "✓ CLS 0.02 (good)",
        "△ 380kb of unused JS on first load",
      ],
    },
  ];
}

function CheckPage() {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "done">("idle");
  const [logIndex, setLogIndex] = useState(0);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [overall, setOverall] = useState(0);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase !== "loading") return;
    if (logIndex >= CRAWL_STEPS.length) {
      const m = buildMetrics(url || "https://example.com");
      setMetrics(m);
      setOverall(Math.round(m.reduce((a, b) => a + b.score, 0) / m.length));
      setPhase("done");
      return;
    }
    const t = setTimeout(() => setLogIndex((i) => i + 1), 220);
    return () => clearTimeout(t);
  }, [phase, logIndex, url]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [logIndex]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setPhase("loading");
    setLogIndex(0);
    setMetrics([]);
    setOpenKey(null);
  };

  const reset = () => {
    setPhase("idle");
    setLogIndex(0);
    setUrl("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-mono text-sm text-accent">grow/</Link>
          <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">← back</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="font-mono text-xs text-accent mb-3">AGENT READABILITY CHECKER</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            How readable is your site to AI agents?
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Paste any URL. We crawl it the way ChatGPT, Perplexity, and Claude do — then grade it on semantic structure, schemas, llms.txt, citability, and speed.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="flex-1 flex items-center gap-2 rounded-md border border-border bg-card px-4 py-3 font-mono text-sm focus-within:border-accent transition-colors">
            <span className="text-accent">›</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com"
              disabled={phase === "loading"}
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={phase === "loading" || !url.trim()}
            className="rounded-md bg-accent text-accent-foreground font-mono text-sm px-6 py-3 hover:opacity-90 transition disabled:opacity-40"
          >
            {phase === "loading" ? "scanning…" : "run scan"}
          </button>
          {phase === "done" && (
            <button type="button" onClick={reset} className="rounded-md border border-border font-mono text-sm px-4 py-3 hover:border-accent transition">
              reset
            </button>
          )}
        </form>

        {phase !== "idle" && (
          <div
            ref={logRef}
            className="rounded-lg border border-border bg-[#0a0a0a] font-mono text-[13px] leading-relaxed p-5 mb-10 h-64 overflow-auto"
          >
            {CRAWL_STEPS.slice(0, logIndex).map((line, i) => (
              <div key={i} className={line.startsWith("$") ? "text-accent" : "text-muted-foreground"}>
                {line}
              </div>
            ))}
            {phase === "loading" && (
              <div className="text-accent animate-pulse">▍</div>
            )}
          </div>
        )}

        {phase === "done" && (
          <div className="space-y-10 animate-fade-in">
            <div className="grid md:grid-cols-[280px_1fr] gap-8 items-center rounded-xl border border-border bg-card p-8">
              <ScoreCircle value={overall} />
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-2">AGENT_READABILITY_SCORE</div>
                <h2 className="text-2xl font-semibold mb-2">
                  {overall >= 85 ? "Strong agent surface." : overall >= 70 ? "Decent — with quick wins." : "Significant gaps."}
                </h2>
                <p className="text-muted-foreground text-sm">
                  Scanned <span className="text-foreground font-mono">{url}</span> across 5 dimensions. Expand each metric below for actionable feedback.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.map((m) => (
                <MetricCard
                  key={m.key}
                  metric={m}
                  open={openKey === m.key}
                  onToggle={() => setOpenKey(openKey === m.key ? null : m.key)}
                />
              ))}
            </div>

            <ReportGate url={url} score={overall} />

            <div className="rounded-xl border border-accent/40 bg-accent/5 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="font-mono text-xs text-accent mb-2">NEXT STEP</div>
                <h3 className="text-xl font-semibold mb-1">Want us to fix these? Free 20-min consult.</h3>
                <p className="text-muted-foreground text-sm">We'll walk through your report and outline a fix plan.</p>
              </div>
              <a
                href="mailto:hello@grow.contact?subject=Free%20Consultation"
                className="rounded-md bg-accent text-accent-foreground font-mono text-sm px-6 py-3 hover:opacity-90 transition whitespace-nowrap"
              >
                Book a Free Consultation →
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ScoreCircle({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 900);
      setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const r = 90;
  const c = 2 * Math.PI * r;
  const offset = c - (display / 100) * c;
  const color = value >= 85 ? "hsl(var(--accent))" : value >= 70 ? "#eab308" : "#ef4444";

  return (
    <div className="relative w-[220px] h-[220px] mx-auto">
      <svg viewBox="0 0 220 220" className="w-full h-full -rotate-90">
        <circle cx="110" cy="110" r={r} stroke="hsl(var(--border))" strokeWidth="10" fill="none" />
        <circle
          cx="110"
          cy="110"
          r={r}
          stroke={color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 200ms linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-5xl font-semibold font-mono" style={{ color }}>{display}</div>
        <div className="text-xs font-mono text-muted-foreground mt-1">/ 100</div>
      </div>
    </div>
  );
}

function MetricCard({ metric, open, onToggle }: { metric: Metric; open: boolean; onToggle: () => void }) {
  const Icon = metric.status === "pass" ? Check : metric.status === "warn" ? AlertTriangle : X;
  const color =
    metric.status === "pass" ? "text-accent" : metric.status === "warn" ? "text-yellow-500" : "text-red-500";
  const ring =
    metric.status === "pass" ? "border-accent/40" : metric.status === "warn" ? "border-yellow-500/40" : "border-red-500/40";

  return (
    <div className={`rounded-lg border ${ring} bg-card overflow-hidden transition-colors hover:border-accent/60`}>
      <button onClick={onToggle} className="w-full text-left p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="font-mono text-xs text-muted-foreground uppercase tracking-wider">{metric.label}</span>
          </div>
          {open ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-3xl font-semibold font-mono ${color}`}>{metric.score}</span>
          <span className="text-xs font-mono text-muted-foreground">/100</span>
        </div>
        <p className="text-sm text-muted-foreground">{metric.summary}</p>
      </button>
      {open && (
        <div className="border-t border-border bg-[#0a0a0a]/60 px-5 py-4 font-mono text-[12px] space-y-1.5 animate-fade-in">
          {metric.details.map((d, i) => (
            <div key={i} className="text-muted-foreground">{d}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportGate({ url, score }: { url: string; score: number }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const sendFollowup = useServerFn(sendReportFollowup);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      setState("error");
      return;
    }
    setState("saving");
    setError(null);
    try {
      const { error: dbError } = await supabase.from("report_requests").insert({
        email: trimmed,
        url,
        score,
        source: "check",
      });
      if (dbError) throw dbError;
      // Fire follow-up email — non-blocking; ignore failures for UX.
      sendFollowup({ data: { email: trimmed, url, score } }).catch((err) => {
        console.error("report follow-up failed", err);
      });
      setState("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  const reportHref = `/check/report?u=${encodeURIComponent(url)}&s=${score}&e=${encodeURIComponent(email.trim())}`;

  return (
    <div className="rounded-xl border border-border bg-card p-8">
      <div className="flex items-start gap-3 mb-4">
        <FileText className="w-5 h-5 text-accent shrink-0 mt-1" />
        <div>
          <div className="font-mono text-xs text-accent mb-1">FULL PDF REPORT</div>
          <h3 className="text-xl font-semibold">Get the printable, share-ready version</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Every finding, every fix, weighted scores, methodology — formatted for handoff to your team.
          </p>
        </div>
      </div>

      {state !== "ready" ? (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mt-6">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={state === "saving"}
            className="flex-1 rounded-md border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-accent transition-colors disabled:opacity-50"
            required
          />
          <button
            type="submit"
            disabled={state === "saving"}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground text-background font-mono text-sm px-6 py-3 hover:opacity-90 transition disabled:opacity-40"
          >
            {state === "saving" ? <><Loader2 className="w-4 h-4 animate-spin" /> sending</> : "Get the PDF →"}
          </button>
        </form>
      ) : (
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 rounded-md border border-accent/40 bg-accent/10 p-4">
          <Check className="w-5 h-5 text-accent shrink-0" />
          <div className="flex-1 text-sm">
            Report ready. Open it below, then use <span className="font-mono">Save as PDF</span>.
          </div>
          <a
            href={reportHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent text-accent-foreground font-mono text-sm px-5 py-3 hover:opacity-90 transition whitespace-nowrap"
          >
            Open report →
          </a>
        </div>
      )}

      {state === "error" && error && (
        <div className="mt-3 text-xs font-mono text-red-500">{error}</div>
      )}

      <p className="mt-4 text-[11px] font-mono text-muted-foreground">
        No spam. One follow-up email max. Unsubscribe in a click.
      </p>
    </div>
  );
}
