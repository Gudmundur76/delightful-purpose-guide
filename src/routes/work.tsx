import { createFileRoute } from "@tanstack/react-router";
import { CaseStudies } from "@/components/CaseStudies";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import nimbusImg from "@/assets/portfolio-nimbus.jpg";
import vectorImg from "@/assets/portfolio-vector.jpg";
import { ogImageMeta } from "@/lib/seo/og";

type ShippedCase = {
  client: string;
  url: string;
  category: string;
  before: number;
  after: number;
  testimonial?: string;
};

const SHIPPED: ShippedCase[] = [
  {
    client: "Rewyo",
    url: "startup-fast-lane.lovable.app",
    category: "AI startup / launch page",
    before: 62,
    after: 100,
  },
];

const CASE_JSONLD = SHIPPED.map((c) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: `${c.client} — ${c.after}/100 Agent Readability Score`,
  description: `Agent-native website build for ${c.client}. Score improved from ${c.before}/100 to ${c.after}/100 on the grow.contact scanner.`,
  url: "https://grow.contact/work",
  datePublished: "2026-05",
  publisher: { "@type": "Organization", name: "Grow", url: "https://grow.contact" },
}));

export const Route = createFileRoute("/work")({
  component: WorkPage,
  head: () => ({
    meta: [
      { title: "Work — Grow" },
      { name: "description", content: "Case studies and recent outputs: agent-native sites for AI startups and devtools." },
      { property: "og:title", content: "Work — Grow" },
      { property: "og:description", content: "Selected case studies and recent shipped sites." },
      { property: "og:url", content: "https://grow.contact/work" },
      ...ogImageMeta({
        title: "Work — Grow",
        kicker: "Grow",
        sub: "Case studies and recent outputs: agent-native sites for AI startups and devtools.",
      }),
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/work" }],
    scripts: CASE_JSONLD.map((j) => ({
      type: "application/ld+json",
      children: JSON.stringify(j),
    })),
  }),
});

function WorkPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// Archive</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">Work</h1>
            <p className="text-foreground mt-6 max-w-2xl text-base md:text-lg leading-relaxed">
              A look at what we've shipped recently — each build verified against the public /check scanner, with before-and-after scores so you can see exactly what changed. We focus on launch pages, marketing sites, and devtool hubs for AI startups, agent platforms, and developer tools.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
              <time dateTime="2026-06-06">Last updated: 2026-06-06</time> · new builds added at launch
            </p>
          </div>
        </section>

        {/* SSR-rendered shipped case studies — visible to AI crawlers */}
        <section id="shipped" className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">
                Shipped
              </h2>
              <span className="font-mono text-xs text-muted-foreground">
                // Verified by /check
              </span>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SHIPPED.map((c) => (
                <article
                  key={c.client}
                  className="border border-border bg-card hover:border-accent/60 transition-colors flex flex-col"
                >
                  <header className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <div className="min-w-0">
                      <h3 className="font-bold uppercase tracking-tighter text-lg truncate">
                        {c.client}
                      </h3>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground truncate">
                        {c.url}
                      </p>
                    </div>
                    <span className="font-mono text-[10px] text-accent border border-accent/40 bg-accent/10 px-2 py-1 shrink-0">
                      +{c.after - c.before} pts
                    </span>
                  </header>
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="p-5 bg-muted/20">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        Before
                      </p>
                      <p className="text-3xl font-extrabold tracking-tighter tabular-nums text-muted-foreground">
                        {c.before}/100
                      </p>
                    </div>
                    <div className="p-5">
                      <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                        After
                      </p>
                      <p className="text-3xl font-extrabold tracking-tighter tabular-nums text-accent">
                        {c.after}/100
                      </p>
                    </div>
                  </div>
                  <div className="px-5 py-4 border-t border-border mt-auto">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {c.category}
                    </p>
                    {c.testimonial ? (
                      <p className="mt-2 text-sm text-muted-foreground italic">
                        “{c.testimonial}”
                      </p>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <CaseStudies />
        <section className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">Recent Outputs</h2>
            <span className="font-mono text-xs text-muted-foreground">V.03/26</span>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
            <div className="bg-background p-4">
              <img src={nimbusImg} alt="Nimbus Agents — agent orchestration platform marketing site" width={1280} height={960} loading="lazy" className="w-full aspect-[4/3] object-cover bg-card" />
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-tighter">Nimbus Agents — Orchestration Platform</span>
                <span className="text-[10px] font-mono text-muted-foreground">DEVTOOL HUB // 48H</span>
              </div>
            </div>
            <div className="bg-background p-4">
              <img src={vectorImg} alt="Vector Eval — LLM evaluation platform marketing site" width={1280} height={960} loading="lazy" className="w-full aspect-[4/3] object-cover bg-card" />
              <div className="mt-4 flex justify-between items-center">
                <span className="font-bold uppercase tracking-tighter">Vector Eval — LLM Eval Suite</span>
                <span className="text-[10px] font-mono text-muted-foreground">MARKETING SITE // 48H</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
