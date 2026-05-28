import { Check, ShieldCheck } from "lucide-react";

type Promise = {
  title: string;
  detail: string;
  proofLabel: string;
  proofHref: string;
};

const PROMISES: Promise[] = [
  {
  {
    title: "Agent Score 100/100",
    detail:
      "Every site we ship scores 100/100 on the grow.contact /check scanner at delivery. If it doesn't, you don't pay.",
    proofLabel: "Run the checker",
    proofHref: "/check",
  },
  {
    title: "Lighthouse 90+",
    detail:
      "Performance, Accessibility, Best Practices and SEO all ship at 90+ on mobile. Audited at handover.",
    proofLabel: "View audit method",
    proofHref: "https://pagespeed.web.dev/",
  },
  {
    title: "Full Schema Coverage",
    detail:
      "Organization, WebSite, Product, FAQ, Article and BreadcrumbList JSON-LD on every relevant page. Validated.",
    proofLabel: "Validate this site",
    proofHref:
      "https://search.google.com/test/rich-results?url=https%3A%2F%2Fgrow.contact%2F",
  },
  {
    title: "llms.txt Included",
    detail:
      "A maintained /llms.txt index ships at the root of every build, so LLM crawlers find the canonical map.",
    proofLabel: "See ours",
    proofHref: "/llms.txt",
  },
];

export function Guarantees() {
  return (
    <section
      id="guarantees"
      className="scroll-mt-20 border-t border-border bg-card/30"
    >
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">
              // Guarantees
            </p>
            <h2 className="text-4xl font-extrabold tracking-tighter uppercase">
              Promises We Ship Against
            </h2>
          </div>
          <span className="font-mono text-xs text-muted-foreground hidden md:inline">
            // Every build, verified
          </span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {PROMISES.map((p) => (
            <article
              key={p.title}
              className="group bg-background p-6 flex flex-col gap-4 hover:bg-card transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 inline-flex items-center justify-center bg-accent/15 border border-accent/40 text-accent">
                  <Check size={18} strokeWidth={3} />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-widest text-accent border border-accent/40 bg-accent/10 px-2 py-1 inline-flex items-center gap-1.5">
                  <ShieldCheck size={10} strokeWidth={3} />
                  Verified
                </span>
              </div>
              <h3 className="text-xl font-extrabold tracking-tighter uppercase leading-tight">
                {p.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                {p.detail}
              </p>
              <a
                href={p.proofHref}
                target={p.proofHref.startsWith("http") ? "_blank" : undefined}
                rel={
                  p.proofHref.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                className="font-mono text-[10px] uppercase tracking-widest text-foreground hover:text-accent transition-colors inline-flex items-center gap-1.5 pt-2 border-t border-border"
              >
                <span>{p.proofLabel}</span>
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
