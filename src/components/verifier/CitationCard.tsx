import { useState } from "react";
import { Check, X, ExternalLink, ChevronDown } from "lucide-react";
import { TruthBadge } from "./TruthBadge";
import { cn } from "@/lib/utils";
import type { Claim } from "@/lib/verifier/mock";

interface CitationCardProps {
  claim: Claim;
  index?: number;
}

export function CitationCard({ claim, index }: CitationCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <article className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            {typeof index === "number" && (
              <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
                [{index + 1}]
              </span>
            )}
            <h3 className="text-base font-semibold truncate">{claim.company_name}</h3>
            <span className="font-mono text-[10px] text-muted-foreground truncate">
              {claim.domain}
            </span>
          </div>
          <TruthBadge score={claim.truth_score} />
        </div>

        <blockquote className="mt-3 rounded-md bg-muted/40 border-l-2 border-accent/50 px-3 py-2 font-mono text-[13px] leading-relaxed text-foreground/90">
          "{claim.claim_text}"
        </blockquote>

        <div className="mt-3 flex items-center gap-4 flex-wrap text-xs">
          <a
            href={claim.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent hover:underline truncate max-w-full"
          >
            <ExternalLink className="h-3 w-3 shrink-0" />
            <span className="truncate">{claim.source_url}</span>
          </a>

          <span className="inline-flex items-center gap-1 text-muted-foreground">
            {claim.methodology_notes ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <X className="h-3.5 w-3.5 text-rose-400" />
            )}
            Methodology
          </span>

          <span className="inline-flex items-center gap-1 text-muted-foreground">
            {claim.reproducible ? (
              <Check className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <X className="h-3.5 w-3.5 text-rose-400" />
            )}
            Reproducible
          </span>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
            aria-expanded={open}
          >
            View analysis
            <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-muted/20 px-4 sm:px-5 py-4 space-y-2 text-sm">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            // analysis
          </p>
          <p className="text-muted-foreground">
            {claim.methodology_notes ?? "No methodology was disclosed by the source."}
          </p>
          <p className="text-xs text-muted-foreground/80">
            Category: <span className="text-foreground/80">{claim.claim_category}</span>
            {claim.scan_date && (
              <>
                {" "}· Scanned <span className="text-foreground/80">{claim.scan_date}</span>
              </>
            )}
          </p>
        </div>
      )}
    </article>
  );
}
