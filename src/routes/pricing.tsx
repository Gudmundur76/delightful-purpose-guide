import { createFileRoute } from "@tanstack/react-router";
import { PricingTable } from "@/components/PricingTable";
import { TechSpecs } from "@/components/TechSpecs";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Grow" },
      { name: "description", content: "Fixed-price tiers for agent-native marketing sites. No hourly surprises." },
      { property: "og:title", content: "Pricing — Grow" },
      { property: "og:description", content: "Transparent fixed-price tiers and technical specifications." },
      { property: "og:url", content: "https://grow.contact/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/pricing" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Product",
              name: "GEO Fix Pack",
              description:
                "24-hour GEO remediation on your existing site: robots.txt, llms.txt, JSON-LD, OpenGraph and semantic HTML fixes. No redesign.",
              brand: { "@type": "Brand", name: "Grow" },
              url: "https://grow.contact/pricing",
              offers: {
                "@type": "Offer",
                price: "499",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: "https://grow.contact/pricing",
              },
            },
            {
              "@type": "Product",
              name: "Starter",
              description:
                "Launch page or focused marketing site. Custom-coded, agent-native, delivered in 48 hours.",
              brand: { "@type": "Brand", name: "Grow" },
              url: "https://grow.contact/pricing",
              offers: {
                "@type": "Offer",
                price: "2400",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: "https://grow.contact/checkout",
              },
            },
            {
              "@type": "Product",
              name: "Growth",
              description:
                "Full marketing site or devtool hub with docs surface. Custom-coded, agent-native, delivered in 48 hours.",
              brand: { "@type": "Brand", name: "Grow" },
              url: "https://grow.contact/pricing",
              offers: {
                "@type": "Offer",
                price: "4800",
                priceCurrency: "USD",
                availability: "https://schema.org/InStock",
                url: "https://grow.contact/checkout",
              },
            },
          ],
        }),
      },
    ],
  }),
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// Fixed Price</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">Pricing</h1>
          </div>
        </section>
        <PricingTable />
        <TechSpecs />
      </main>
      <SiteFooter />
    </div>
  );
}
