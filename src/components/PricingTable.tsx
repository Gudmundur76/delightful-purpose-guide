import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { TierCheckoutDialog } from "@/components/TierCheckoutDialog";
import type { TierKey } from "@/lib/paypal/tier-checkout.functions";


const TIERS: Array<{
  key: TierKey;
  name: string;
  label: string;
  priceDisplay: string;
  delivery: string;
  pages: string;
  features: string[];
  recommended: boolean;
}> = [
  {
    key: "fix",
    name: "GEO Patch Pack",
    label: "Tier 00 // Free (Beta)",
    priceDisplay: "Free",
    delivery: "48 hours",
    pages: "Existing site",
    features: [
      "Custom robots.txt + llms.txt",
      "JSON-LD schema snippets",
      "OpenGraph + Twitter meta tags",
      "Semantic HTML fix list",
      "Copy-paste install guide",
      "Re-scan + score delta report",
    ],
    recommended: false,
  },

  {
    key: "starter",
    name: "Starter",
    label: "Tier 01",
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
    key: "growth",
    name: "Growth",
    label: "Tier 02 // Most Popular",
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

export function PricingTable({ leadId }: { leadId?: string } = {}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [active, setActive] = useState<TierKey | null>(null);
  const activeTier = TIERS.find((t) => t.key === active) ?? null;

  return (
    <section className="scroll-mt-20 border-b border-border bg-background py-16 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-14">
          <p className="font-mono text-xs uppercase text-accent mb-3 tracking-widest">
            // Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">
            Fixed Price. No Surprises.
          </h2>
        </div>

        <div className="space-y-6">
          {TIERS.map((tier, i) => (
            <article
              key={tier.name}
              className={`border transition-colors duration-200 ${
                tier.recommended
                  ? "border-accent/60 bg-accent/[0.03]"
                  : hovered === i
                    ? "border-accent/40 bg-card/30"
                    : "border-border bg-card"
              }`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="p-5 sm:p-6 border-b border-border/60">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span
                      className={`inline-block font-mono text-[10px] uppercase tracking-widest px-2 py-1 mb-3 ${
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
                  </div>
                  <p className="text-3xl font-bold tracking-tighter shrink-0">
                    {tier.priceDisplay}
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-xs text-muted-foreground uppercase tracking-wider">
                  <span>Pages: {tier.pages}</span>
                  <span>Delivery: {tier.delivery}</span>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                  // What's included
                </p>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="text-accent mt-0.5 shrink-0" />
                      <span className="text-sm text-foreground/90">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-5 sm:px-6 pb-5 sm:pb-6">
                {tier.key === "fix" ? (
                  <Link
                    to="/contact"
                    search={{ tier: "fix" } as never}
                    className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-5 py-3 transition-colors w-full justify-center border border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    Request free patch pack
                    <span>→</span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActive(tier.key)}
                    className={`inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-5 py-3 transition-colors w-full justify-center ${
                      tier.recommended
                        ? "bg-accent text-accent-foreground hover:bg-foreground hover:text-background"
                        : "border border-border hover:border-accent text-foreground"
                    }`}
                  >
                    Start with {tier.name}
                    <span>→</span>
                  </button>
                )}
              </div>

            </article>
          ))}
        </div>

        <p className="mt-6 font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
          Semantic markup — LLM parse time: 8ms
        </p>
      </div>

      {activeTier && (
        <TierCheckoutDialog
          open={active !== null}
          onClose={() => setActive(null)}
          tier={activeTier.key}
          tierName={activeTier.name}
          priceDisplay={activeTier.priceDisplay}
          leadId={leadId}
        />
      )}
    </section>
  );
}
