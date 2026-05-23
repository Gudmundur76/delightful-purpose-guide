import { createFileRoute } from "@tanstack/react-router";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { Guarantees } from "@/components/Guarantees";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/process")({
  component: ProcessPage,
  head: () => ({
    meta: [
      { title: "Process — Grow" },
      { name: "description", content: "48-hour delivery process: kickoff, build, ship. Plus our guarantees." },
      { property: "og:title", content: "Process — Grow" },
      { property: "og:description", content: "How we ship agent-native sites in 48 hours, with verified guarantees." },
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
          </div>
        </section>
        <ProcessTimeline />
        <Guarantees />
      </main>
      <SiteFooter />
    </div>
  );
}
