import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { callTool } from "@/lib/dashboard/mcp-client";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewPage,
});

type Stats = {
  total_scans: number;
  total_leads: number;
  pending_reviews: number;
  avg_overall_score_30d: number | null;
  scans_last_30d: number;
};

type ActivityEvent = {
  type: string;
  at?: string;
  created_at?: string;
  scanned_at?: string;
  host?: string;
  url?: string;
  overall?: number;
  email?: string;
  tier?: string;
  amount?: number;
  [k: string]: unknown;
};

function ScoreGauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const circumference = 2 * Math.PI * 42;
  const dash = (pct / 100) * circumference;
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
      <circle cx="50" cy="50" r="42" stroke="hsl(var(--border, 0 0% 25%))" strokeOpacity="0.3" strokeWidth="6" fill="none" />
      <circle
        cx="50"
        cy="50"
        r="42"
        stroke="currentColor"
        className="text-accent"
        strokeWidth="6"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`}
      />
    </svg>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-border p-6 bg-card/40">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
        // {label}
      </div>
      <div className="font-extrabold text-4xl tabular-nums tracking-tighter">{value}</div>
    </div>
  );
}

function OverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [emailsSent, setEmailsSent] = useState<number | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, feed, emailStats] = await Promise.allSettled([
          callTool<Stats>("get_stats"),
          callTool<{ events?: ActivityEvent[] } | ActivityEvent[]>("activity_feed", {
            limit: 20,
          }),
          callTool<{ delivered?: number; sent?: number; total?: number }>(
            "email_delivery_stats",
          ),
        ]);
        if (cancelled) return;
        if (s.status === "fulfilled") setStats(s.value);
        if (feed.status === "fulfilled") {
          const v = feed.value as { events?: ActivityEvent[] } | ActivityEvent[];
          setActivity(Array.isArray(v) ? v : v.events ?? []);
        }
        if (emailStats.status === "fulfilled") {
          const v = emailStats.value as Record<string, number>;
          setEmailsSent(v.sent ?? v.delivered ?? v.total ?? null);
        }
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-10">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
          // OVERVIEW
        </div>
        <h1 className="font-extrabold text-4xl sm:text-5xl uppercase tracking-tighter">
          System status
        </h1>
      </header>

      {err && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 font-mono text-xs text-destructive">
          {err}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="SCANS" value={loading ? "···" : stats?.total_scans ?? 0} />
        <StatCard label="LEADS" value={loading ? "···" : stats?.total_leads ?? 0} />
        <StatCard
          label="EMAILS SENT"
          value={loading ? "···" : emailsSent ?? "—"}
        />
        <div className="border border-border p-6 bg-card/40 flex items-center justify-between">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              // AVG SCORE (30d)
            </div>
            <div className="font-extrabold text-4xl tabular-nums tracking-tighter">
              {stats?.avg_overall_score_30d ?? "—"}
              <span className="text-muted-foreground text-xl">/100</span>
            </div>
          </div>
          <ScoreGauge value={stats?.avg_overall_score_30d ?? 0} />
        </div>
      </div>

      <section>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          // ACTIVITY FEED · LIVE
        </div>
        <div className="border border-border divide-y divide-border bg-card/20">
          {activity.length === 0 && !loading && (
            <div className="p-6 font-mono text-xs text-muted-foreground">
              // NO ACTIVITY YET
            </div>
          )}
          {activity.map((ev, i) => {
            const when = ev.at ?? ev.created_at ?? ev.scanned_at;
            return (
              <div
                key={i}
                className="px-4 py-3 flex items-center gap-4 font-mono text-xs"
              >
                <span className="text-accent uppercase tracking-widest min-w-[80px]">
                  {ev.type ?? "event"}
                </span>
                <span className="text-foreground truncate flex-1">
                  {ev.host ?? ev.url ?? ev.email ?? ev.tier ?? "—"}
                </span>
                {typeof ev.overall === "number" && (
                  <span className="text-accent tabular-nums">{ev.overall}/100</span>
                )}
                {typeof ev.amount === "number" && (
                  <span className="text-accent tabular-nums">€{ev.amount}</span>
                )}
                <span className="text-muted-foreground tabular-nums hidden sm:inline">
                  {when ? new Date(when).toLocaleString() : ""}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
