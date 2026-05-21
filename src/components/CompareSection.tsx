import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { scanUrl, type ScanResult } from "@/lib/check/scan.functions";
import { getOverviewStats, type OverviewStats } from "@/lib/check/stats.functions";

type Row = { key: string; label: string; yours: number | null; ours: number };

const METRIC_KEYS: { key: keyof OverviewStats["metrics"]; label: string }[] = [
  { key: "semantic", label: "Semantic HTML" },
  { key: "jsonld", label: "JSON-LD" },
  { key: "llms", label: "llms.txt" },
  { key: "citability", label: "Citability" },
  { key: "speed", label: "Speed" },
];

export function CompareSection() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [yours, setYours] = useState<ScanResult | null>(null);

  const runScan = useServerFn(scanUrl);
  const fetchStats = useServerFn(getOverviewStats);
  const [stats, setStats] = useState<OverviewStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStats()
      .then((r) => !cancelled && setStats(r))
      .catch(() => !cancelled && setStats(null));
    return () => {
      cancelled = true;
    };
  }, [fetchStats]);

  const baseline = stats?.metrics ?? {
    semantic: 0,
    jsonld: 0,
    llms: 0,
    citability: 0,
    speed: 0,
  };

  const yourMetrics: Record<string, number> = {};
  if (yours?.ok) {
    for (const m of yours.metrics) yourMetrics[m.key] = m.score;
  }

  const rows: Row[] = METRIC_KEYS.map(({ key, label }) => ({
    key,
    label,
    yours: yours?.ok ? (yourMetrics[key] ?? 0) : null,
    ours: baseline[key],
  }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);
    setYours(null);
    try {
      const r = await runScan({ data: { url: url.trim(), source: "compare" } });
      setYours(r);
      if (!r.ok) setError(r.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="compare" className="scroll-mt-20 border-t border-border bg-card/30">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="mb-10">
          <div className="font-mono text-xs text-accent mb-3">COMPARE_YOUR_SITE</div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
            See how your site stacks up.
          </h2>
          <p className="text-muted-foreground max-w-2xl">
            Paste your URL. We run a real scan and compare it against the live average across every
            site scanned on grow.contact.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mb-12 max-w-2xl">
          <div className="flex-1 flex items-center gap-2 rounded-md border border-border bg-background px-4 py-3 font-mono text-sm focus-within:border-accent transition-colors">
            <span className="text-accent">›</span>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={!url.trim() || loading}
            className="rounded-md bg-foreground text-background font-mono text-sm px-6 py-3 hover:opacity-90 transition disabled:opacity-40"
          >
            {loading ? "scanning…" : "compare"}
          </button>
        </form>

        {error && (
          <div className="mb-6 rounded-md border border-red-400/40 bg-red-400/5 p-4 font-mono text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <CompareColumn
            label="Your Site"
            sub={yours?.ok ? yours.finalUrl : url ? url : "awaiting URL…"}
            tone="muted"
            live={!!yours?.ok}
            values={rows.map((r) => ({ label: r.label, value: r.yours ?? 0 }))}
            empty={!yours}
          />
          <CompareColumn
            label="Live grow.contact Average"
            sub={
              stats && stats.totalScans > 0
                ? `${stats.totalScans} scans · ${stats.uniqueHosts} sites`
                : "no scans yet"
            }
            tone="accent"
            live
            values={rows.map((r) => ({ label: r.label, value: r.ours }))}
            empty={!stats || stats.totalScans === 0}
          />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-accent/40 bg-accent/5 p-6">
          <div>
            <div className="font-mono text-xs text-accent mb-1">FULL_REPORT</div>
            <p className="text-sm text-muted-foreground">
              These bars are a real scan summary. The full report on /check breaks down every
              signal and ships an actionable fix list.
            </p>
          </div>
          <Link
            to="/check"
            className="rounded-md bg-accent text-accent-foreground font-mono text-sm px-6 py-3 hover:opacity-90 transition whitespace-nowrap text-center"
          >
            Get the Full Analysis →
          </Link>
        </div>
      </div>
    </section>
  );
}

function CompareColumn({
  label,
  sub,
  tone,
  live,
  values,
  empty,
}: {
  label: string;
  sub: string;
  tone: "muted" | "accent";
  live: boolean;
  values: { label: string; value: number }[];
  empty: boolean;
}) {
  const border = tone === "accent" ? "border-accent/40" : "border-border";
  const accentText = tone === "accent" ? "text-accent" : "text-muted-foreground";
  return (
    <div className={`rounded-xl border ${border} bg-background p-6`}>
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className={`font-mono text-[11px] ${accentText}`}>
          {live ? "● live" : "○ awaiting"}
        </div>
      </div>
      <div className="font-mono text-xs text-foreground/80 mb-6 truncate">{sub}</div>
      <div className="space-y-4">
        {values.map((v) => (
          <Bar key={v.label} label={v.label} value={empty ? 0 : v.value} tone={tone} />
        ))}
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "muted" | "accent";
}) {
  const fill = tone === "accent" ? "bg-accent" : "bg-muted-foreground/60";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 font-mono text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={tone === "accent" ? "text-accent" : "text-foreground"}>{value}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-border/60 overflow-hidden">
        <div
          className={`h-full ${fill} transition-[width] duration-[1200ms] ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
