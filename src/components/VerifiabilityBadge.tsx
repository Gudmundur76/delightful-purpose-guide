// VerifiabilityBadge — visible signal that a stat has a machine-checkable
// citation. Wraps the value in a <span id={...}> so the JSON-LD verifiableClaim
// fragment-link (`#stat-83`) resolves on the rendered HTML, and exposes a
// small "✓ verified" affordance linking to the raw JSON.
//
// Usage:
//   <VerifiabilityBadge id="stat-83" citation={claimCitation("stat-83")}>
//     83%
//   </VerifiabilityBadge>

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  citation: string;
  dateModified?: string;
  className?: string;
  children: React.ReactNode;
  /** When false, only renders the inline span (no badge chrome). */
  showBadge?: boolean;
};

export function VerifiabilityBadge({
  id,
  citation,
  dateModified,
  className,
  children,
  showBadge = true,
}: Props) {
  return (
    <span className={cn("inline-flex items-baseline gap-1.5", className)}>
      <span
        id={id}
        itemProp="value"
        data-verifiable="true"
        data-citation={citation}
        {...(dateModified ? { "data-date-modified": dateModified } : {})}
      >
        {children}
      </span>
      {showBadge ? (
        <a
          href={citation}
          target="_blank"
          rel="noopener"
          aria-label={`Verify ${id} against the raw dataset`}
          title={
            dateModified
              ? `Verified · last updated ${dateModified}`
              : "Verified against the raw dataset"
          }
          className="inline-flex items-center text-emerald-400/80 hover:text-emerald-300 transition-colors no-underline"
        >
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">verified</span>
        </a>
      ) : null}
    </span>
  );
}
