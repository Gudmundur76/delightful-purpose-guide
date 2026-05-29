// SourceSyncIndicator — visible "green light" proving the rendered site
// matches a specific commit in the public repository. Closes the
// Web → JSON-LD → GitHub loop (Agent-Verifiable Standard v2.1).

import { CheckCircle2, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { sourceSyncStatus } from "@/lib/seo/trust-handshake";

type Props = {
  className?: string;
  /** Compact pill (footer) vs full card (dashboards). */
  variant?: "pill" | "card";
};

export function SourceSyncIndicator({ className, variant = "pill" }: Props) {
  const s = sourceSyncStatus();
  const href = `${s.repoUrl}/tree/${s.ref}`;

  if (variant === "card") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener"
        aria-label={`Source-synced with ${s.repo} @ ${s.refLabel}`}
        className={cn(
          "block border border-emerald-500/30 bg-emerald-500/5 p-5 hover:border-emerald-500 transition-colors no-underline",
          className,
        )}
        data-source-sync="in-sync"
        data-source-ref={s.ref}
      >
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          Source-synced
        </div>
        <div className="mt-3 font-mono text-sm text-foreground">
          {s.repo}
          <span className="text-muted-foreground"> @ </span>
          <span className="text-accent">{s.refLabel}</span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Every verifiable claim on this site carries a <code className="font-mono">sameAs</code>{" "}
          link to the exact source file in this commit. Click to inspect.
        </p>
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label={`Source-synced with ${s.repo} @ ${s.refLabel}`}
      title={`Source-synced · ${s.repo} @ ${s.refLabel}`}
      className={cn(
        "inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/5 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-400 hover:border-emerald-500 transition-colors no-underline",
        className,
      )}
      data-source-sync="in-sync"
      data-source-ref={s.ref}
    >
      <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
      <GitBranch className="h-3 w-3" aria-hidden="true" />
      <span>
        {s.repo}@{s.refLabel}
      </span>
    </a>
  );
}
