import { useState } from "react";

const TIERS = [
  {
    name: "Starter",
    label: "Tier 01",
    price: 2400,
    priceDisplay: "$2,400",
    delivery: "48 hours",
    pages: "1 page",
    features: [
      "Semantic HTML + CSS",
      "JSON-LD structured data",
      "llms.txt at root",
      "OpenGraph + Twitter cards",
      "Sitemap + RSS",
      "Agent-readability audit",
    ],
    recommended: false,
  },
  {
    name: "Growth",
    label: "Tier 02 // Most Popular",
    price: 4800,
    priceDisplay: "$4,800",
    delivery: "~5 days",
    pages: "Up to 5 pages",
    features: [
      "Everything in Starter",
      "MDX content layer",
      "Structured docs schema",
      "Blog + RSS feed",
      "Priority support",
      "Post-launch revision block",
    ],
    recommended: true,
  },
];

const FEATURES = [
  { key: "pages", label: "Pages" },
  { key: "delivery", label: "Delivery" },
  { key: "semanticHtml", label: "Semantic HTML" },
  { key: "jsonLd", label: "JSON-LD" },
  { key: "llmsTxt", label: "llms.txt" },
  { key: "openGraph", label: "OpenGraph" },
  { key: "sitemapRss", label: "Sitemap + RSS" },
  { key: "audit", label: "Agent Audit" },
  { key: "mdx", label: "MDX Layer" },
  { key: "blog", label: "Blog + RSS" },
  { key: "priority", label: "Priority Support" },
  { key: "revision", label: "Revision Block" },
];

function Check({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8L6.5 11.5L13 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Cross({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 4L12 12M12 4L4 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PricingTable() {
  const [hoveredCol, setHoveredCol] = useState<number | null>(null);

  const starterFeatures = new Set([
    "semanticHtml", "jsonLd", "llmsTxt", "openGraph", "sitemapRss", "audit",
  ]);
  const growthFeatures = new Set([
    "semanticHtml", "jsonLd", "llmsTxt", "openGraph", "sitemapRss", "audit",
    "mdx", "blog", "priority", "revision",
  ]);
  const tierFeatures = [starterFeatures, growthFeatures];

  return (
    <section className="scroll-mt-20 border-b border-border bg-background py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase text-accent mb-3 tracking-widest">
            // Pricing
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">
            Fixed Price. No Surprises.
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="py-4 pr-6 align-bottom">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    // Compare
                  </span>
                </th>
                {TIERS.map((tier, i) => (
                  <th
                    key={tier.name}
                    className={`py-4 px-6 align-bottom min-w-[200px] transition-colors duration-200 ${
                      tier.recommended
                        ? "border-x border-accent/40 bg-accent/5"
                        : hoveredCol === i
                          ? "bg-card/30"
                          : ""
                    }`}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <div className="space-y-2">
                      <span
                        className={`inline-block font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm ${
                          tier.recommended
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {tier.label}
                      </span>
                      <h3 className="text-2xl font-extrabold tracking-tighter uppercase">
                        {tier.name}
                      </h3>
                      <p className="text-3xl font-bold tracking-tighter">
                        {tier.priceDisplay}
                      </p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Pages row */}
              <tr className="border-b border-border/60">
                <td className="py-3 pr-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  Pages
                </td>
                {TIERS.map((tier, i) => (
                  <td
                    key={tier.name}
                    className={`py-3 px-6 font-mono text-sm ${
                      tier.recommended
                        ? "border-x border-accent/40 bg-accent/[0.03]"
                        : hoveredCol === i
                          ? "bg-card/30"
                          : ""
                    }`}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    {tier.pages}
                  </td>
                ))}
              </tr>
              {/* Delivery row */}
              <tr className="border-b border-border/60">
                <td className="py-3 pr-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  Delivery
                </td>
                {TIERS.map((tier, i) => (
                  <td
                    key={tier.name}
                    className={`py-3 px-6 font-mono text-sm ${
                      tier.recommended
                        ? "border-x border-accent/40 bg-accent/[0.03]"
                        : hoveredCol === i
                          ? "bg-card/30"
                          : ""
                    }`}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    {tier.delivery}
                  </td>
                ))}
              </tr>
              {/* Feature rows */}
              {FEATURES.map((feature) => (
                <tr key={feature.key} className="border-b border-border/40">
                  <td className="py-3 pr-6 font-mono text-xs text-muted-foreground uppercase tracking-wider">
                    {feature.label}
                  </td>
                  {TIERS.map((tier, i) => {
                    const hasFeature = tierFeatures[i].has(feature.key);
                    return (
                      <td
                        key={tier.name}
                        className={`py-3 px-6 ${
                          tier.recommended
                            ? "border-x border-accent/40 bg-accent/[0.03]"
                            : hoveredCol === i
                              ? "bg-card/30"
                              : ""
                        }`}
                        onMouseEnter={() => setHoveredCol(i)}
                        onMouseLeave={() => setHoveredCol(null)}
                      >
                        {hasFeature ? (
                          <Check className="text-accent" />
                        ) : (
                          <Cross className="text-muted-foreground/30" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {/* CTA row */}
              <tr>
                <td className="py-6 pr-6" />
                {TIERS.map((tier, i) => (
                  <td
                    key={tier.name}
                    className={`py-6 px-6 ${
                      tier.recommended
                        ? "border-x border-b border-accent/40 bg-accent/[0.03] rounded-b-lg"
                        : hoveredCol === i
                          ? "bg-card/30"
                          : ""
                    }`}
                    onMouseEnter={() => setHoveredCol(i)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <a
                      href="#cta"
                      className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-5 py-3 transition-colors ${
                        tier.recommended
                          ? "bg-accent text-accent-foreground hover:bg-foreground hover:text-background"
                          : "border border-border hover:border-accent text-foreground"
                      }`}
                    >
                      Start with {tier.name}
                      <span>→</span>
                    </a>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <p className="mt-6 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          This table uses semantic HTML — LLM parse time: 8ms
        </p>
      </div>
    </section>
  );
}
