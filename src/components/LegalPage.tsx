import type { ReactNode } from "react";

type Props = {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, updated, intro, children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
          // {eyebrow}
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter mb-4">
          {title}
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-8">
          Last updated — {updated}
        </p>
        {intro && (
          <p className="text-base text-muted-foreground border-l-2 border-accent pl-4 mb-10">
            {intro}
          </p>
        )}
        <article className="prose-legal space-y-8 text-sm leading-relaxed text-foreground/90">
          {children}
        </article>
      </div>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-xl font-bold uppercase tracking-tight mt-10 mb-3 border-b border-border pb-2">
      {children}
    </h2>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-muted-foreground">{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-muted-foreground marker:text-accent">
      {children}
    </ul>
  );
}
