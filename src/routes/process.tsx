import { createFileRoute } from "@tanstack/react-router";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { Guarantees } from "@/components/Guarantees";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/process")({
  component: ProcessPage,
  head: () => ({
    meta: [
      { title: "Process — Grow" },
      { name: "description", content: "How Grow ships agent-native sites in 48 hours: a five-step process from kickoff to launch, with re-score and bug-fix guarantees." },
      { property: "og:title", content: "Process — Grow" },
      { property: "og:description", content: "Five steps from kickoff to launch in 48 hours. Plus our re-score and 14-day bug-fix guarantees." },
      { property: "og:url", content: "https://grow.contact/process" },
      ...ogImageMeta({
        title: "Process — Grow",
        kicker: "Grow",
        sub: "Five steps from kickoff to launch in 48 hours, with guarantees.",
      }),
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/process" }],
  }),
});

function ProcessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// 48h Workflow</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">Process</h1>
            <p className="text-foreground mt-6 max-w-2xl text-base md:text-lg leading-relaxed">
              Here's exactly how a Grow build runs. Five steps, 48 hours from kickoff to live site: <strong>Brief</strong> (hours 0–2), <strong>Architecture</strong> (2–6), <strong>Design + Build</strong> (6–36), <strong>Agent Layer</strong> (36–44), and <strong>Launch + Audit</strong> (44–48). Every build ships against the same agent-readability checklist and won't go live unless it scores 90+ on the /check scanner.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
              <time dateTime="2026-06-06">Last updated: 2026-06-06</time> · process reviewed per build
            </p>
          </div>
        </section>
        <ProcessTimeline />
        <Guarantees />
      </main>
      <SiteFooter />
    </div>
  );
}
