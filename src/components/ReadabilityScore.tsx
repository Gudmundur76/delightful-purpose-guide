import { useEffect, useState } from "react";

const METRICS = [
  { label: "Semantic HTML", value: 92 },
  { label: "JSON-LD Schema", value: 88 },
  { label: "llms.txt", value: 100 },
  { label: "OpenGraph", value: 78 },
  { label: "Sitemap + RSS", value: 70 },
];

const TARGET = Math.round(METRICS.reduce((s, m) => s + m.value, 0) / METRICS.length);
const RADIUS = 88;
const CIRC = 2 * Math.PI * RADIUS;

export function ReadabilityScore() {
  const [score, setScore] = useState(0);

  useEffect(() => {
    const duration = 1400;
    const steps = 60;
    const tickMs = duration / steps;
    let step = 0;

    const id = setInterval(() => {
      step++;
      const p = Math.min(1, step / steps);
      const eased = 1 - Math.pow(1 - p, 3);
      setScore(Math.round(eased * TARGET));
      if (p >= 1) clearInterval(id);
    }, tickMs);

    return () => clearInterval(id);
  }, []);

  const offset = CIRC - (score / 100) * CIRC;

  return (
    <div className="bg-card border border-border p-6 md:p-8 relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 font-mono text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-2 text-accent">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          GET /api/readiness
        </div>
        <span className="text-muted-foreground">200 OK · 18ms</span>
      </div>

      {/* Radial gauge */}
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
              className="text-accent transition-[stroke-dashoffset] duration-100 ease-out"
              style={{ filter: "drop-shadow(0 0 8px rgb(34 211 238 / 0.4))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
              Score
            </span>
            <span className="text-5xl font-extrabold tracking-tighter tabular-nums">
              {score}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Status
          </span>
          <span className="font-bold text-sm uppercase tracking-tighter">
            Agent-Ready
          </span>
          <span className="font-mono text-[10px] text-muted-foreground leading-relaxed">
            ChatGPT · Perplexity
            <br />
            Claude · Google AI
          </span>
        </div>
      </div>

      {/* Metric bars */}
      <div className="space-y-3 pt-6 border-t border-border">
        {METRICS.map((m, i) => (
          <MetricBar key={m.label} {...m} delay={400 + i * 120} />
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
