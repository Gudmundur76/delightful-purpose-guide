import { createFileRoute } from "@tanstack/react-router";
import { PricingTable } from "@/components/PricingTable";
import { TechSpecs } from "@/components/TechSpecs";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "Pricing — Grow" },
      { name: "description", content: "Fixed-price tiers for agent-native marketing sites. No hourly surprises." },
      { property: "og:title", content: "Pricing — Grow" },
      { property: "og:description", content: "Transparent fixed-price tiers and technical specifications." },
      { property: "og:url", content: "https://grow.contact/pricing" },
      ...ogImageMeta({
        title: "Pricing — Grow",
        kicker: "Grow",
        sub: "Fixed-price tiers for agent-native marketing sites. No hourly surprises.",
      }),
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

        {/* Side-by-side comparison */}
        <section className="border-t border-border" aria-label="Tier comparison">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// What&apos;s Included — Side-by-Side</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-12">Tier Comparison</h2>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead className="bg-card/50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 border-b border-border">Feature</th>
                    <th className="text-center px-4 py-3 border-b border-border">Starter</th>
                    <th className="text-center px-4 py-3 border-b border-border">Growth</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Pages", "1", "Up to 5"],
                    ["Delivery", "48 hours", "~5 days"],
                    ["Semantic HTML (all landmark elements)", "✓", "✓"],
                    ["JSON-LD: Organization schema", "✓", "✓"],
                    ["JSON-LD: Product/Service schema", "✓", "✓"],
                    ["JSON-LD: FAQPage schema", "✓", "✓"],
                    ["JSON-LD: BreadcrumbList schema", "✓", "✓"],
                    ["JSON-LD: Article schema (blog/resource pages)", "—", "✓"],
                    ["JSON-LD: SoftwareApplication / WebAPI", "—", "✓"],
                    ["llms.txt (spec-compliant)", "✓", "✓"],
                    ["llms-full.txt (full markdown dump)", "✓", "✓"],
                    ["robots.txt (all 8 AI bots)", "✓", "✓"],
                    ["OpenGraph + Twitter cards (all pages)", "✓", "✓"],
                    ["XML sitemap", "✓", "✓"],
                    ["RSS / Atom feed", "✓", "✓"],
                    ["TTFB <200ms optimization", "✓", "✓"],
                    ["Agent Readability Audit (pre-launch)", "✓", "✓"],
                    ["Agent-Native Certified badge", "✓", "✓"],
                    ["GitHub repository handover", "✓", "✓"],
                    ["14-day bug fix window", "✓", "✓"],
                  ].map(([feat, s, g]) => {
                    const cell = (v: string) =>
                      v === "✓" ? <span className="text-accent font-mono">✓</span>
                      : v === "—" ? <span className="text-muted-foreground font-mono">—</span>
                      : <span className="text-foreground">{v}</span>;
                    return (
                      <tr key={feat} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3 align-top">{feat}</td>
                        <td className="px-4 py-3 align-top text-center">{cell(s)}</td>
                        <td className="px-4 py-3 align-top text-center">{cell(g)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm mt-8 max-w-3xl leading-relaxed">
              Every tier includes the full agent-native technical layer. The difference between Starter and Growth is page count and the additional schema types that unlock for multi-page sites (Article for blog/resource pages, SoftwareApplication and WebAPI for developer tools).
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="mb-10">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">// MONITORING</p>
            <h2 className="font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl">Continuous GEO monitoring</h2>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Track agent-readability of your sites over time. Get alerted when scores drop. Public REST API + webhooks.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              { id: "free", name: "Free", price: "$0", quota: "20 scans / mo", sites: "1 site", cadence: "weekly" },
              { id: "pro", name: "Pro", price: "$29", quota: "500 scans / mo", sites: "10 sites", cadence: "daily" },
              { id: "team", name: "Team", price: "$99", quota: "2,500 scans / mo", sites: "50 sites", cadence: "hourly" },
            ].map((p) => (
              <div key={p.id} className="border border-border bg-card p-6 flex flex-col">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent">// {p.id}</p>
                <h3 className="font-extrabold uppercase tracking-tighter text-2xl mt-2">{p.name}</h3>
                <p className="text-3xl font-bold mt-2">{p.price}<span className="text-sm text-muted-foreground">/mo</span></p>
                <ul className="mt-4 space-y-1 font-mono text-xs text-muted-foreground flex-1">
                  <li>{p.quota}</li>
                  <li>{p.sites}</li>
                  <li>Cadence: {p.cadence}</li>
                  <li>API + webhook alerts</li>
                </ul>
                <a
                  href={p.id === "free" ? "/login" : "/app/billing"}
                  className="mt-6 inline-block text-center bg-accent text-accent-foreground font-bold uppercase tracking-tighter py-3"
                >
                  {p.id === "free" ? "Start free" : "Subscribe"}
                </a>
              </div>
            ))}
          </div>
        </section>

        <TechSpecs />
      </main>
      <SiteFooter />
    </div>
  );
}
