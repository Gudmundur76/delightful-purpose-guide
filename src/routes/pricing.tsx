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
        <section className="border-b border-border" aria-label="Pricing overview">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// Fixed Price</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">Pricing</h1>
            <p className="text-foreground mt-6 max-w-2xl text-base md:text-lg leading-relaxed">
              grow.contact pricing is fixed and transparent. Starter is <strong>$2,400 USD</strong> for a single agent-native page delivered in 48 hours. Growth is <strong>$4,800 USD</strong> for up to 5 pages delivered in 5 days. Every tier includes semantic HTML, JSON-LD schemas, llms.txt, OpenGraph, RSS, sitemap, and a verified /check score before launch. Full GitHub handover — no lock-in.
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
              <time dateTime="2026-05-28">Last updated: May 2026</time>
            </p>
          </div>
        </section>
        <PricingTable />
        <TechSpecs />
      </main>
      <SiteFooter />
    </div>
  );
}
