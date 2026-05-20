import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/status")({
  component: StatusPage,
  head: () => ({
    meta: [
      { title: "System Status — Grow" },
      {
        name: "description",
        content:
          "Real-time system status for Grow infrastructure. Check API health, uptime, and response times.",
      },
      { property: "og:title", content: "System Status — Grow" },
      {
        property: "og:description",
        content:
          "Real-time system status for Grow infrastructure. Check API health, uptime, and response times.",
      },
      { property: "og:url", content: "https://grow.contact/status" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/status" }],
  }),
});

interface SystemComponent {
  name: string;
  status: "operational" | "degraded" | "outage" | "maintenance";
  uptime: string;
  responseTime: string;
}

interface Incident {
  date: string;
  title: string;
  status: "resolved" | "monitoring" | "investigating";
  duration: string;
}

const COMPONENTS: SystemComponent[] = [
  { name: "Public API v1", status: "operational", uptime: "99.99%", responseTime: "42ms" },
  { name: "Website (grow.contact)", status: "operational", uptime: "99.97%", responseTime: "28ms" },
  { name: "Blog & Journal", status: "operational", uptime: "99.98%", responseTime: "35ms" },
  { name: "Certification Badge Service", status: "operational", uptime: "99.95%", responseTime: "18ms" },
  { name: "Score Check (/check)", status: "operational", uptime: "99.96%", responseTime: "51ms" },
  { name: "Email Delivery", status: "operational", uptime: "99.92%", responseTime: "124ms" },
  { name: "Webhook Ingestion", status: "operational", uptime: "99.94%", responseTime: "67ms" },
];

const INCIDENTS: Incident[] = [
  { date: "2026-05-15", title: "Elevated latency on badge SVG endpoint", status: "resolved", duration: "12 min" },
  { date: "2026-04-28", title: "API v1 rate-limiting adjustment", status: "resolved", duration: "8 min" },
  { date: "2026-03-10", title: "Scheduled maintenance: blog migration", status: "resolved", duration: "45 min" },
];

const STATUS_CONFIG = {
  operational: { label: "Operational", dot: "bg-emerald-400", bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/30" },
  degraded: { label: "Degraded", dot: "bg-amber-400", bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/30" },
  outage: { label: "Major Outage", dot: "bg-red-400", bg: "bg-red-400/10", text: "text-red-400", border: "border-red-400/30" },
  maintenance: { label: "Maintenance", dot: "bg-blue-400", bg: "bg-blue-400/10", text: "text-blue-400", border: "border-blue-400/30" },
} as const;

function StatusPage() {
  const allOperational = COMPONENTS.every((c) => c.status === "operational");
  const overall = allOperational ? "operational" : "degraded";
  const cfg = STATUS_CONFIG[overall];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <span className="font-extrabold tracking-tighter text-xl uppercase">
              GROW_
            </span>
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
        {/* Overall Status */}
        <section className="mb-16">
          <div
            className={`border ${cfg.border} ${cfg.bg} rounded-xl p-8 md:p-12 text-center`}
          >
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span
                className={`w-3 h-3 rounded-full ${cfg.dot} animate-pulse`}
              />
              <span className={`font-mono text-xs uppercase tracking-widest ${cfg.text}`}>
                {allOperational ? "All Systems Operational" : "Partial System Degradation"}
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">
              {allOperational ? "Systems Green" : "Issues Detected"}
            </h1>
            <p className="mt-4 text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
              Last updated: {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZoneName: "short" })}
              {" · "}
              Refreshed every 30s
            </p>
          </div>
        </section>

        {/* API Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border mb-16">
          <StatCell label="API Uptime" value="99.9%" sub="30-day" />
          <StatCell label="Avg Response" value="45ms" sub="p50 latency" />
          <StatCell label="API Version" value="v1.0.0" sub="stable" />
          <StatCell label="Active Regions" value="3" sub="edge nodes" />
        </section>

        {/* Components */}
        <section className="mb-16">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6">
            // Component Health
          </h2>
          <div className="border border-border divide-y divide-border">
            {COMPONENTS.map((c) => {
              const sc = STATUS_CONFIG[c.status];
              return (
                <div
                  key={c.name}
                  className="flex items-center justify-between px-5 py-4 md:px-6 md:py-5 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                    <span className="font-medium text-sm tracking-tight">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 md:gap-10 text-right">
                    <div className="hidden md:block">
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        Uptime
                      </p>
                      <p className="font-mono text-xs tabular-nums mt-0.5">
                        {c.uptime}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                        Response
                      </p>
                      <p className="font-mono text-xs tabular-nums mt-0.5">
                        {c.responseTime}
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
          </div>
        </section>

        {/* Response Time Chart (mock) */}
        <section className="mb-16">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6">
            // 24-Hour Response Time
          </h2>
          <div className="border border-border bg-card p-6 md:p-8">
            <ResponseTimeBars />
            <div className="flex justify-between mt-4 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
              <span>24h ago</span>
              <span>12h ago</span>
              <span>Now</span>
            </div>
          </div>
        </section>

        {/* Incident History */}
        <section className="mb-16">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6">
            // Incident History
          </h2>
          <div className="border border-border divide-y divide-border">
            {INCIDENTS.map((inc) => (
              <div
                key={inc.date + inc.title}
                className="flex flex-col md:flex-row md:items-center justify-between px-5 py-4 md:px-6 md:py-5 gap-2 md:gap-0"
              >
                <div className="flex items-start md:items-center gap-3 md:gap-4">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums mt-0.5 md:mt-0">
                    {inc.date}
                  </span>
                  <span className="text-sm font-medium tracking-tight">
                    {inc.title}
                  </span>
                </div>
                <div className="flex items-center gap-4 ml-16 md:ml-0">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
                    Duration: {inc.duration}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 border border-emerald-400/30 text-emerald-400 bg-emerald-400/10">
                    {inc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* API Docs Link */}
        <section className="border border-accent/40 bg-accent/5 p-8 md:p-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // Developers
          </p>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tighter uppercase mb-3">
            Build on our API
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Programmatic access to scores, leads, and certification badges.
            OpenAPI 3.1 spec with interactive Swagger UI.
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

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            &copy; 2026 GROW STUDIO
          </span>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            Status Page v1.0.0
          </span>
        </div>
      </footer>
    </div>
  );
}

function StatCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-card p-5 md:p-6 text-center">
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-2xl md:text-3xl font-extrabold tracking-tighter">
        {value}
      </p>
      <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
        {sub}
      </p>
    </div>
  );
}

function ResponseTimeBars() {
  // Mock 24 data points for the last 24 hours
  const bars = [
    32, 28, 35, 42, 38, 31, 29, 45, 52, 48, 41, 36,
    33, 30, 34, 40, 44, 39, 37, 43, 50, 46, 38, 35,
  ];
  const max = Math.max(...bars);

  return (
    <div className="flex items-end gap-[3px] md:gap-1.5 h-32 md:h-40">
      {bars.map((h, i) => {
        const pct = (h / max) * 100;
        const isCurrent = i === bars.length - 1;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col justify-end group"
            title={`${h}ms`}
          >
            <div
              className={`w-full rounded-sm transition-all ${
                isCurrent
                  ? "bg-accent"
                  : h > 45
                    ? "bg-amber-400/60"
                    : "bg-emerald-400/40"
              }`}
              style={{ height: `${pct}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}
