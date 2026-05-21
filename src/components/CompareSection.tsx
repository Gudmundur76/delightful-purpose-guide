import { useState } from "react";
import { Link } from "@tanstack/react-router";

const METRICS = [
  { key: "semantic", label: "Semantic HTML", yours: 42, ours: 92 },
  { key: "jsonld", label: "JSON-LD Coverage", yours: 18, ours: 88 },
  { key: "llms", label: "llms.txt", yours: 0, ours: 100 },
  { key: "citability", label: "Citability", yours: 51, ours: 78 },
  { key: "speed", label: "Speed (LCP)", yours: 64, ours: 70 },
];

export function CompareSection() {
  const [url, setUrl] = useState("");
  const [shown, setShown] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setShown(true);
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
            Paste your URL. We'll preview the gap between a typical marketing site and an agent-native one across five readability metrics.
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
            disabled={!url.trim()}
            className="rounded-md bg-foreground text-background font-mono text-sm px-6 py-3 hover:opacity-90 transition disabled:opacity-40"
          >
            compare
          </button>
        </form>

        <div className={`grid md:grid-cols-2 gap-4 transition-opacity duration-500 ${shown ? "opacity-100" : "opacity-60"}`}>
          <CompareColumn
            label="Your Site"
            sub={shown && url ? url : "awaiting URL…"}
            tone="muted"
            values={METRICS.map((m) => ({ label: m.label, value: shown ? m.yours : 0 }))}
          />
          <CompareColumn
            label="Agent-Native Site"
            sub="grow.contact baseline"
            tone="accent"
            values={METRICS.map((m) => ({ label: m.label, value: m.ours }))}
          />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-accent/40 bg-accent/5 p-6">
          <div>
            <div className="font-mono text-xs text-accent mb-1">FULL_REPORT</div>
            <p className="text-sm text-muted-foreground">
              These bars are a preview. The full scan inspects 40+ signals and gives per-metric fixes.
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
  values,
}: {
  label: string;
  sub: string;
  tone: "muted" | "accent";
  values: { label: string; value: number }[];
}) {
  const border = tone === "accent" ? "border-accent/40" : "border-border";
  const accentText = tone === "accent" ? "text-accent" : "text-muted-foreground";
  return (
    <div className={`rounded-xl border ${border} bg-background p-6`}>
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className={`font-mono text-[11px] ${accentText}`}>{tone === "accent" ? "● live" : "○ preview"}</div>
      </div>
      <div className="font-mono text-xs text-foreground/80 mb-6 truncate">{sub}</div>
      <div className="space-y-4">
        {values.map((v) => (
          <Bar key={v.label} label={v.label} value={v.value} tone={tone} />
        ))}
      </div>
    </div>
  );
}

function Bar({ label, value, tone }: { label: string; value: number; tone: "muted" | "accent" }) {
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
