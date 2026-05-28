import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { getRecentScans } from "@/lib/check/recent-scans.functions";

interface Row {
  id: string;
  host: string;
  overall: number;
  scanned_at: string;
}

export function RecentScans() {
  const fetchRecent = useServerFn(getRecentScans);
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchRecent()
      .then((r) => {
        if (!cancelled) setRows(r.scans);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchRecent]);

  if (!rows || rows.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="font-mono text-xs text-accent mb-4">RECENTLY SCANNED · LIVE FEED</div>
      <ul className="divide-y divide-border">
        {rows.map((r) => {
          const color =
            r.overall >= 85 ? "text-accent" : r.overall >= 70 ? "text-yellow-500" : "text-red-500";
          const ago = timeAgo(r.scanned_at);
          return (
            <li key={r.id} className="flex items-center justify-between py-3">
              <Link
                to="/history/$host"
                params={{ host: r.host }}
                className="flex items-baseline gap-3 min-w-0 hover:text-accent transition-colors group flex-1"
              >
                <span className={`font-mono font-semibold text-base ${color} w-10 shrink-0`}>
                  {r.overall}
                </span>
                <span className="font-mono text-sm text-foreground truncate group-hover:text-accent">
                  {r.host}
                </span>
              </Link>
              <span className="font-mono text-[11px] text-muted-foreground shrink-0 ml-3">
                {ago}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function timeAgo(iso: string): string {
  const sec = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (sec < 60) return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}
