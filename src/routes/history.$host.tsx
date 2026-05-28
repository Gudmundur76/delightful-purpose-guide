import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { getHostHistory } from "@/lib/check/history.functions";
import { ScoreSparkline } from "@/components/ScoreSparkline";
import { ScanHistoryTable } from "@/components/ScanHistoryTable";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/history/$host")({
  loader: ({ params }) => getHostHistory({ data: { host: params.host, days: 90 } }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.host} — Agent Readability History | Grow` },
      {
        name: "description",
        content: `Full scan history and Agent Readability Score trend for ${params.host}.`,
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const data = Route.useLoaderData();
  const { host, scans, sparkline, first, last, delta } = data;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-12 w-full flex-1">
        <Link
          to="/check"
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="w-3 h-3" /> back to scanner
        </Link>

        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
          SCORE HISTORY · LAST 90 DAYS
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase mb-10">
          {host}
        </h1>

        {scans.length === 0 ? (
          <div className="border border-border rounded p-12 text-center">
            <p className="text-muted-foreground mb-6">No scans found for this host in the last 90 days.</p>
            <Link
              to="/check"
              className="inline-flex bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter text-sm"
            >
              Run a scan →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
              <Stat label="Latest" value={last !== null ? `${last}` : "—"} big />
              <Stat label="First (90d)" value={first !== null ? `${first}` : "—"} />
              <Stat
                label="Delta"
                value={delta !== null ? (delta > 0 ? `+${delta}` : `${delta}`) : "—"}
                trend={delta}
              />
              <Stat label="Scans" value={`${data.totalScans}`} />
            </div>

            <div className="border border-border rounded p-6 mb-10">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                Overall trend
              </div>
              <ScoreSparkline points={sparkline} />
            </div>

            <ScanHistoryTable host={host} scans={scans} />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({
  label,
  value,
  big,
  trend,
}: {
  label: string;
  value: string;
  big?: boolean;
  trend?: number | null;
}) {
  const TrendIcon =
    trend === undefined || trend === null
      ? null
      : trend > 0
        ? TrendingUp
        : trend < 0
          ? TrendingDown
          : Minus;
  const trendColor =
    trend === undefined || trend === null
      ? "text-foreground"
      : trend > 0
        ? "text-accent"
        : trend < 0
          ? "text-red-500"
          : "text-muted-foreground";
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      <div className={`flex items-baseline gap-2 ${trendColor}`}>
        <span className={`font-extrabold tracking-tighter ${big ? "text-5xl" : "text-2xl"}`}>
          {value}
        </span>
        {TrendIcon && <TrendIcon className="w-5 h-5" />}
      </div>
    </div>
  );
}
