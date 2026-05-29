import { AlertTriangle } from "lucide-react";
import type { Contradiction } from "@/lib/verifier/mock";

export function ContradictionSection({ contradiction }: { contradiction: Contradiction }) {
  return (
    <section className="rounded-xl border border-amber-500/30 bg-amber-500/[0.04] p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-amber-400">
          Contradiction detected
        </h2>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground tabular-nums">
          confidence {contradiction.confidence}%
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold mb-1">{contradiction.company_a}</p>
          <p className="font-mono text-[11px] text-muted-foreground mb-2">
            {contradiction.domain_a}
          </p>
          <blockquote className="font-mono text-[13px] leading-relaxed text-foreground/90">
            "{contradiction.claim_a}"
          </blockquote>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-sm font-semibold mb-1">{contradiction.company_b}</p>
          <p className="font-mono text-[11px] text-muted-foreground mb-2">
            {contradiction.domain_b}
          </p>
          <blockquote className="font-mono text-[13px] leading-relaxed text-foreground/90">
            "{contradiction.claim_b}"
          </blockquote>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-background/60 border border-border px-4 py-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
          // analysis
        </p>
        <p className="text-sm text-foreground/90">{contradiction.analysis}</p>
      </div>
    </section>
  );
}
