import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getSystemStatus, type StatusPayload } from "@/lib/status/status.functions";

export const Route = createFileRoute("/status")({
  component: StatusPage,
  head: () => ({
    meta: [
      { title: "System Status — Grow" },
      {
        name: "description",
        content:
          "Live system status for Grow infrastructure. Real-time uptime probes and scan throughput.",
      },
      { property: "og:title", content: "System Status — Grow" },
      {
        property: "og:description",
        content: "Live system status for Grow infrastructure.",
      },
      { property: "og:url", content: "https://grow.contact/status" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/status" }],
  }),
});

const STATUS_CONFIG = {
  operational: {
    label: "Operational",
    dot: "bg-emerald-400",
    bg: "bg-emerald-400/10",
    text: "text-emerald-400",
    border: "border-emerald-400/30",
  },
  degraded: {
    label: "Degraded",
    dot: "bg-amber-400",
    bg: "bg-amber-400/10",
    text: "text-amber-400",
    border: "border-amber-400/30",
  },
  outage: {
    label: "Outage",
    dot: "bg-red-400",
    bg: "bg-red-400/10",
    text: "text-red-400",
    border: "border-red-400/30",
  },
} as const;

function StatusPage() {
  const fetchStatus = useServerFn(getSystemStatus);
  const [data, setData] = useState<StatusPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetchStatus()
        .then((r) => {
          if (!cancelled) {
            setData(r);
            setError(null);
          }
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : "Probe failed");
        });
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [fetchStatus]);

  const overall = data?.overall ?? "operational";
  const cfg = STATUS_CONFIG[overall];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="font-extrabold tracking-tighter text-xl uppercase">GROW_</span>
            <span className="font-mono text-[10px] font-medium px-2 py-1 border border-border text-muted-foreground tracking-tight uppercase">
              Status
            </span>
          </a>
          <a
            href="/"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Home
          </a>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <section className="mb-16">
          <div className={`border ${cfg.border} ${cfg.bg} rounded-xl p-8 md:p-12 text-center`}>
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className={`w-3 h-3 rounded-full ${cfg.dot} animate-pulse`} />
              <span className={`font-mono text-xs uppercase tracking-widest ${cfg.text}`}>
                {data
                  ? overall === "operational"
                    ? "All Systems Operational"
                    : overall === "degraded"
                      ? "Partial Degradation"
                      : "Active Outage"
                  : "Probing…"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">
              {data
                ? overall === "operational"
                  ? "Systems Green"
                  : "Issues Detected"
                : "Loading"}
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              {data
                ? `Last checked: ${new Date(data.checkedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    timeZoneName: "short",
                  })} · Refreshed every 30s`
                : "Running live probes…"}
            </p>
            {error && (
              <p className="mt-3 font-mono text-[11px] text-red-400">{error}</p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-16">
          <StatCell
            label="Scans (24h)"
            value={data ? `${data.totals.scans24h}` : "—"}
            sub="real-time"
          />
          <StatCell
            label="Scans (7d)"
            value={data ? `${data.totals.scans7d}` : "—"}
            sub="rolling"
          />
          <StatCell
            label="Unique Sites"
            value={data ? `${data.totals.uniqueHosts}` : "—"}
            sub="7d window"
          />
          <StatCell
            label="Avg Score"
            value={data && data.totals.avgScore ? `${data.totals.avgScore}` : "—"}
            sub="/100 (7d)"
          />
        </section>

        <section className="mb-16">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6">
            // Component Health
          </h2>
          <div className="border border-border divide-y divide-border">
            {(data?.components ?? []).map((c) => {
              const sc = STATUS_CONFIG[c.status];
              return (
                <div
                  key={c.name}
                  className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`w-2 h-2 rounded-full ${sc.dot} shrink-0`} />
                    <span className="font-medium text-sm tracking-tight truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-6 md:gap-10 text-right shrink-0">
                    <div className="hidden md:block">
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        HTTP
                      </p>
                      <p className="font-mono text-xs tabular-nums mt-0.5">
                        {c.httpStatus ?? "—"}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        Response
                      </p>
                      <p className="font-mono text-xs tabular-nums mt-0.5">
                        {c.responseMs != null ? `${c.responseMs}ms` : "—"}
                      </p>
                    </div>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${sc.border} ${sc.text} ${sc.bg} hidden sm:inline-block`}
                    >
                      {sc.label}
                    </span>
                  </div>
                </div>
              );
            })}
            {!data && (
              <div className="px-5 py-8 text-center font-mono text-xs text-muted-foreground">
                Running probes…
              </div>
            )}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6">
            // 24-Hour Scan Throughput
          </h2>
          <div className="border border-border bg-card p-6 md:p-8">
            <ThroughputBars values={data?.hourlyScans ?? new Array(24).fill(0)} />
            <div className="flex justify-between mt-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              <span>24h ago</span>
              <span>12h ago</span>
              <span>Now</span>
            </div>
          </div>
        </section>

        <section className="border border-accent/40 bg-accent/5 p-8 md:p-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // Developers
          </p>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tighter uppercase mb-3">
            Build on our API
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Programmatic access to scores, leads, and certification badges. OpenAPI 3.1 spec with
            interactive Swagger UI.
          </p>
          <a
            href="/api-docs"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-5 py-3 uppercase tracking-tighter text-xs hover:bg-foreground hover:text-background transition-colors"
          >
            View API Docs
            <span className="font-mono text-[10px]">→</span>
          </a>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            &copy; 2026 GROW STUDIO
          </span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            Live probes · 30s refresh
          </span>
        </div>
      </footer>
    </div>
  );
}

function StatCell({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-card p-5 md:p-6 text-center">
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl md:text-3xl font-extrabold tracking-tighter tabular-nums">{value}</p>
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
        {sub}
      </p>
    </div>
  );
}

function ThroughputBars({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return (
    <div className="flex items-end gap-[3px] md:gap-1.5 h-32 md:h-40">
      {values.map((h, i) => {
        const pct = (h / max) * 100;
        const isCurrent = i === values.length - 1;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end group"
            title={`${h} scan${h === 1 ? "" : "s"}`}
          >
            <div
              className={`w-full rounded-sm transition-all ${
                h === 0
                  ? "bg-muted-foreground/15"
                  : isCurrent
                    ? "bg-accent"
                    : "bg-emerald-400/50"
              }`}
              style={{ height: `${Math.max(pct, h > 0 ? 8 : 4)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
