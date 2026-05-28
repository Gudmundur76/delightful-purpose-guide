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
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Web Design",
          name: "Agent-native web design",
          description:
            "Launch pages, marketing sites, and devtool hubs for AI/ML startups, agent platforms, and developer tools. Custom-coded, LLM-readable, 48-hour delivery.",
          provider: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
          areaServed: "Worldwide",
          url: "https://grow.contact/services",
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Grow tiers",
            itemListElement: [
              {
                "@type": "Offer",
                name: "Starter",
                price: "2400",
                priceCurrency: "USD",
                url: "https://grow.contact/pricing",
              },
              {
                "@type": "Offer",
                name: "Growth",
                price: "4800",
                priceCurrency: "USD",
                url: "https://grow.contact/pricing",
              },
            ],
          },
        }),
      },
    ],
  }),
});

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border" aria-label="Services overview">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// 03 Tiers</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">Services</h1>
            <p className="text-foreground mt-6 max-w-2xl text-base md:text-lg leading-relaxed">
              grow.contact ships agent-native marketing sites for AI startups, agent platforms, and developer tools — engineered so ChatGPT, Perplexity, Claude, and Google AI Overviews can cite your product. Three productized engagements: Agent-Native Website Build, Agent Readability Audit, Schema Optimization. Fixed price, fixed scope, 48-hour delivery.
            </p>
            <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed">
              Why this matters:{" "}
              <a href="https://sevisible.com" rel="noopener" className="text-accent underline underline-offset-2">83% of AI Overview citations come from pages outside the organic top 10</a>,{" "}
              <a href="https://grow.contact/check" rel="noopener" className="text-accent underline underline-offset-2">73% of sites are silently excluded from AI citations</a> due to fixable technical issues, and{" "}
              <a href="https://arxiv.org/abs/2311.09735" rel="noopener" className="text-accent underline underline-offset-2">pages over 20,000 characters receive 4.3× more AI citations</a> than thin pages (Princeton GEO framework).
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
              <time dateTime="2026-05-28">Last updated: May 2026</time>
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
