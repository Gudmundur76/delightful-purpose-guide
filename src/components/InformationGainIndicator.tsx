// InformationGainIndicator — displays the curated "% unique tokens vs top 10
// SERP results" signal required by geo-standard@2026.07 §14.2. The value is
// stamped at build time (manual quarterly refresh); a live Semrush+SERP diff
// job is on the Phase 7 backlog.

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  /** Percentage 0-100 of unique factual tokens vs top 10 SERP results for the page's query. */
  value: number;
  /** ISO date the comparison was last refreshed. */
  measuredAt: string;
  /** Optional target query the comparison was run against. */
  query?: string;
  className?: string;
};

export function InformationGainIndicator({ value, measuredAt, query, className }: Props) {
  const clamped = Math.max(0, Math.min(100, value));
  const tone =
    clamped >= 40
      ? "text-emerald-300 border-emerald-400/30 bg-emerald-400/5"
      : clamped >= 20
        ? "text-amber-300 border-amber-400/30 bg-amber-400/5"
        : "text-rose-300 border-rose-400/30 bg-rose-400/5";
  return (
    <span
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={
        query
          ? `Information gain ${clamped}% unique tokens vs top 10 SERP results for "${query}"`
          : `Information gain ${clamped}% unique tokens vs top 10 SERP results`
      }
      title={`Last measured ${measuredAt}${query ? ` · query: ${query}` : ""}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        tone,
        className,
      )}
    >
      <Sparkles className="h-3 w-3" aria-hidden="true" />
      <span>Info-gain {clamped}%</span>
    </span>
  );
}
