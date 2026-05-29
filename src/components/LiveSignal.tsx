// LiveSignal — "Last scan: 4 minutes ago" header chrome that exposes a
// machine-parseable <time datetime="..."> wrapper. Required by Verifiability
// Layer §14.4 to defeat AI "Content Decay" downranking.

import { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** ISO timestamp of the last verified update. */
  timestamp: string;
  /** Label prefix, e.g. "Last scan", "Last verified". */
  label?: string;
  className?: string;
};

function relative(from: Date, now: Date): string {
  const diff = Math.max(0, now.getTime() - from.getTime());
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const days = Math.floor(hr / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function LiveSignal({ timestamp, label = "Last verified", className }: Props) {
  const parsed = new Date(timestamp);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const ago = relative(parsed, now);
  const stale = now.getTime() - parsed.getTime() > 90 * 24 * 60 * 60 * 1000;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider",
        stale ? "text-amber-300" : "text-emerald-300/90",
        className,
      )}
    >
      <Radio
        className={cn("h-3 w-3", !stale && "animate-pulse")}
        aria-hidden="true"
      />
      <span>{label}:</span>
      <time dateTime={parsed.toISOString()} title={parsed.toISOString()}>
        {ago}
      </time>
    </span>
  );
}
