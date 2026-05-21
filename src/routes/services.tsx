import { createFileRoute } from "@tanstack/react-router";
import { Services } from "@/components/Services";
import { CompareSection } from "@/components/CompareSection";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — Grow" },
      { name: "description", content: "Agent-native marketing sites, launch pages, and devtool hubs. Custom-coded, LLM-readable, fixed price." },
      { property: "og:title", content: "Services — Grow" },
      { property: "og:description", content: "Launch pages, marketing sites, and devtool hubs built agent-native — in 48 hours." },
      { property: "og:url", content: "https://grow.contact/services" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/services" }],
  }),
});

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// 03 Tiers</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">Services</h1>
            <p className="text-muted-foreground mt-6 max-w-2xl">
              Three productized engagements. Fixed price, fixed scope, fixed timeline.
            </p>
          </div>
        </section>
        <Services />
        <CompareSection />
      </main>
      <SiteFooter />
    </div>
  );
}
