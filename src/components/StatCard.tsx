import { VerifiabilityBadge } from "@/components/VerifiabilityBadge";
import { claimCitation } from "@/lib/seo/verifiable";

export interface StatCardProps {
  id: string;
  value: string;
  label: string;
  blurb: string;
  cite: string;
  pageUrl?: string;
  dateModified?: string;
}

export function StatCard({
  id,
  value,
  label,
  blurb,
  cite,
  pageUrl = "https://grow.contact/stats",
  dateModified,
}: StatCardProps) {
  const citation = claimCitation(id);
  const today = dateModified ?? new Date().toISOString().slice(0, 10);
  return (
    <article
      id={id}
      className="scroll-mt-24 border border-border bg-card p-6 flex flex-col gap-3"
    >
      <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
        // {label}
      </p>
      <p className="text-5xl sm:text-6xl font-extrabold tracking-tighter tabular-nums text-foreground">
        <VerifiabilityBadge id={`${id}-value`} citation={citation} dateModified={today}>
          {value}
        </VerifiabilityBadge>
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">{blurb}</p>
      <details className="mt-2 border-t border-border pt-3">
        <summary className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground cursor-pointer hover:text-foreground">
          Cite this stat
        </summary>
        <pre className="mt-2 text-[11px] bg-muted/30 border border-border p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed text-foreground/80">
{cite}
{`\nSource: ${pageUrl}#${id} (CC BY 4.0)`}
{`\nVerifiable claim: ${citation}`}
        </pre>
        <a
          href={`${pageUrl}#${id}`}
          className="mt-2 inline-block font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
        >
          Permalink ↗
        </a>
      </details>
    </article>
  );
}
