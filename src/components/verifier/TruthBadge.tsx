import { cn } from "@/lib/utils";

interface TruthBadgeProps {
  score: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TruthBadge({ score, className, size = "md" }: TruthBadgeProps) {
  const tone =
    score >= 75
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : score >= 50
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-rose-500/15 text-rose-400 border-rose-500/30";

  const sizing =
    size === "lg"
      ? "px-3 py-1.5 text-sm"
      : size === "sm"
      ? "px-1.5 py-0.5 text-[10px]"
      : "px-2 py-0.5 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border font-mono font-medium tabular-nums",
        tone,
        sizing,
        className,
      )}
      aria-label={`Truth score ${score} out of 100`}
    >
      <span className="opacity-60">truth</span>
      <span>{score}</span>
    </span>
  );
}
