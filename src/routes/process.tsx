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
      { property: "og:url", content: "https://grow.contact/process" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/process" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "HowTo",
          name: "How Grow ships an agent-native website in 48 hours",
          description:
            "End-to-end 48-hour build process for fixed-price agent-native websites: brief, structure, design, content, launch.",
          totalTime: "PT48H",
          step: [
            { "@type": "HowToStep", position: 1, name: "Brief", text: "Send positioning, docs, and API surface. We extract intent and constraints into a tight creative brief." },
            { "@type": "HowToStep", position: 2, name: "Structure", text: "Turn the brief into a semantic site map, content schema, and JSON-LD taxonomy. Architecture first." },
            { "@type": "HowToStep", position: 3, name: "Design", text: "High-fidelity UI in the dark. Every component is coded, not mocked — no handoff gap." },
            { "@type": "HowToStep", position: 4, name: "Content", text: "llms.txt, OpenGraph, semantic markup, sitemap and RSS. Built to be parsed by agents at ingestion." },
            { "@type": "HowToStep", position: 5, name: "Launch", text: "Lighthouse audit, agent-readability check, domain handover. Live and citeable in 48 hours." },
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://grow.contact/" },
            { "@type": "ListItem", position: 2, name: "Process", item: "https://grow.contact/process" },
          ],
        }),
      },
    ],
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
