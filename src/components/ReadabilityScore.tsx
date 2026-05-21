import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getOverviewStats, type OverviewStats } from "@/lib/check/stats.functions";

const RADIUS = 88;
const CIRC = 2 * Math.PI * RADIUS;

const METRIC_LABELS: { key: keyof OverviewStats["metrics"]; label: string }[] = [
  { key: "semantic", label: "Semantic HTML" },
  { key: "jsonld", label: "JSON-LD Schema" },
  { key: "llms", label: "llms.txt" },
  { key: "citability", label: "Citability" },
  { key: "speed", label: "Speed" },
];

export function ReadabilityScore() {
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

  const score = s?.avgOverall ?? 0;
  const offset = CIRC - (score / 100) * CIRC;
  const hasData = !!s && s.totalScans > 0;

  return (
    <div className="bg-card border border-border p-6 md:p-8 relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 font-mono text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-2 text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          GET /api/stats/overview
        </div>
        <span className="text-muted-foreground">
          {hasData ? `${s.totalScans} scans` : "no data yet"}
        </span>
      </div>

      <div className="flex items-center gap-6 mb-8">
        <div className="relative w-[200px] h-[200px] shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              className="text-border"
            />
            <circle
              cx="100"
              cy="100"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              className="text-accent transition-[stroke-dashoffset] duration-700 ease-out"
              style={{ filter: "drop-shadow(0 0 8px rgb(34 211 238 / 0.4))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Avg Score
            </span>
            <span className="font-mono text-5xl font-bold tracking-tighter tabular-nums text-foreground">
              {hasData ? score : "—"}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Status
          </span>
          <span className="font-bold text-sm uppercase tracking-tighter">
            {hasData ? (score >= 80 ? "Agent-Ready" : score >= 60 ? "Needs Work" : "Critical") : "Awaiting data"}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground leading-relaxed">
            Aggregated from
            <br />
            {hasData ? `${s.uniqueHosts} unique sites` : "all /check scans"}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-border">
        {METRIC_LABELS.map((m, i) => (
          <MetricBar
            key={m.key}
            label={m.label}
            value={s?.metrics[m.key] ?? 0}
            delay={400 + i * 120}
          />
        ))}
      </div>
    </div>
  );
}

function MetricBar({ label, value, delay }: { label: string; value: number; delay: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => setW(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-32 shrink-0">
          {label}
        </span>
        <div className="h-1 flex-1 bg-border/60 overflow-hidden">
          <div
            className="h-full bg-accent transition-[width] duration-700 ease-out"
            style={{ width: `${w}%` }}
          />
        </div>
      </div>
      <span className="font-mono text-[10px] tabular-nums text-foreground w-8 text-right">
        {value}
      </span>
    </div>
  );
}
