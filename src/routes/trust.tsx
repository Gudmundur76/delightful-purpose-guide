import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SourceSyncIndicator } from "@/components/SourceSyncIndicator";
import { ogImageMeta } from "@/lib/seo/og";

// /trust — the E-E-A-T anchor page. One URL that consolidates every
// trust signal a buyer (or an AI engine assessing authority) wants:
// who runs the studio, the guarantee, the receipts, the security stance,
// the methodology, and where the published numbers come from.

const PAGE_URL = "https://grow.contact/trust";

export const Route = createFileRoute("/trust")({
  component: TrustPage,
  head: () => ({
    meta: [
      { title: "Trust & Guarantees — Who's behind grow.contact | Grow" },
      {
        name: "description",
        content:
          "The people, guarantees, methodology, and receipts behind grow.contact. 100/100 agent-readability guarantee or your money back. Public scoring methodology. Founder-led.",
      },
      { property: "og:title", content: "Trust & Guarantees — grow.contact" },
      {
        property: "og:description",
        content:
          "Founder-led agent-native web agency. 100/100 guarantee, open scoring methodology, public dataset. Here's what stands behind the work.",
      },
      { property: "og:url", content: PAGE_URL },
      ...ogImageMeta({
        title: "Trust & Guarantees — Who's behind grow.contact | Grow",
        kicker: "Grow",
        sub: "The people, guarantees, methodology, and receipts behind grow.contact. 100/100 agent-readability guarantee or your money back. Public scoring methodology. Founder-led.",
      }),
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: "Trust & Guarantees",
          url: PAGE_URL,
          mainEntity: {
            "@type": "Organization",
            name: "Grow",
            alternateName: "grow.contact",
            url: "https://grow.contact",
            email: "hello@grow.contact",
            founder: {
              "@type": "Person",
              name: "Gudmundur Eyberg Kristjansson",
              jobTitle: "Founder",
              worksFor: { "@type": "Organization", name: "Grow" },
            },
            knowsAbout: [
              "Generative Engine Optimization",
              "Agent-readable websites",
              "AI citation",
              "JSON-LD structured data",
              "llms.txt",
              "Model Context Protocol",
            ],
            makesOffer: [
              {
                "@type": "Offer",
                name: "Agent-Native Website Build (Tier 01)",
                price: "2400",
                priceCurrency: "USD",
              },
              {
                "@type": "Offer",
                name: "Agent-Native Website Build (Tier 02)",
                price: "4800",
                priceCurrency: "USD",
              },
            ],
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is the 100/100 guarantee?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Every site grow.contact ships passes the public /check scanner at 100/100 across Semantic HTML, JSON-LD, llms.txt, Citability, and Speed at delivery. If it doesn't, the work is free.",
              },
            },
            {
              "@type": "Question",
              name: "How much does a build cost?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Tier 01 is $2,400 USD (single-route launch page, 48-hour delivery). Tier 02 is $4,800 USD (multi-route marketing site, 5-day delivery). Both are fixed price, no hourly billing.",
              },
            },
            {
              "@type": "Question",
              name: "Who runs grow.contact?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Grow is a founder-led studio operated by Gudmundur Eyberg Kristjansson. Every build is hands-on, not white-labelled to contractors.",
              },
            },
            {
              "@type": "Question",
              name: "Is the methodology public?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. The full scoring methodology — signal weights, pass thresholds, refresh cadence — is published at /leaderboard/methodology. The underlying dataset is licensed CC BY 4.0.",
              },
            },
          ],
        }),
      },
    ],
  }),
});

function Card({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="border border-border bg-card p-6">
      <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
        // {label}
      </p>
      <h3 className="text-xl font-extrabold tracking-tighter uppercase mb-3">{title}</h3>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </article>
  );
}

function TrustPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-background text-foreground">
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-20">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              // grow.contact / trust
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase max-w-4xl">
              The receipts behind grow.contact
            </h1>
            <p className="mt-6 max-w-3xl text-base sm:text-lg text-muted-foreground leading-relaxed">
              Founder-led. Fixed price. A public scoring methodology, an open
              dataset, and a 100/100 agent-readability guarantee at delivery. If
              you want to know who's actually behind the work, what we measure,
              and what happens if we miss — this is the page.
            </p>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
              <Card label="Guarantee" title="100 / 100 or it's free">
                <p>
                  Every site we ship passes our public{" "}
                  <Link to="/check" className="text-accent underline">
                    /check
                  </Link>{" "}
                  scanner at 100/100 across Semantic HTML, JSON-LD, llms.txt,
                  Citability and Speed on delivery day. If it doesn't, you don't pay.
                </p>
                <p>
                  Re-scan the site yourself any time at the same URL. No black box.
                </p>
              </Card>

              <Card label="Methodology" title="Public scoring, open dataset">
                <p>
                  The same scanner that grades your competitors grades us. Signal
                  weights, pass thresholds, and refresh cadence are documented at{" "}
                  <Link to="/leaderboard/methodology" className="text-accent underline">
                    /leaderboard/methodology
                  </Link>
                  .
                </p>
                <p>
                  The dataset behind every published number is CC BY 4.0 at{" "}
                  <a href="/api/public/leaderboard.json" className="text-accent underline">
                    /api/public/leaderboard.json
                  </a>
                  .
                </p>
              </Card>

              <Card label="Founder" title="Built by one person, not a reseller">
                <p>
                  Grow is operated by Gudmundur Eyberg Kristjansson. Every build is
                  hands-on. There is no offshore subcontractor, no white-labelled
                  template, no "junior PM" between you and the work.
                </p>
                <p>
                  Email goes to{" "}
                  <a href="mailto:hello@grow.contact" className="text-accent underline">
                    hello@grow.contact
                  </a>{" "}
                  and is read by the person who'll build the site.
                </p>
              </Card>

              <Card label="Pricing" title="Fixed price, in plain text">
                <p>
                  Tier 01 — single-route launch page, 48-hour delivery: <strong>$2,400 USD</strong>.
                </p>
                <p>
                  Tier 02 — multi-route marketing site, 5-day delivery: <strong>$4,800 USD</strong>.
                </p>
                <p>
                  No hourly billing, no surprise change orders. Full breakdown at{" "}
                  <Link to="/pricing" className="text-accent underline">
                    /pricing
                  </Link>
                  .
                </p>
              </Card>

              <Card label="Privacy & data" title="Minimal, documented, EU-aware">
                <p>
                  We collect what we need to deliver and bill, nothing more. Full
                  detail at{" "}
                  <Link to="/privacy" className="text-accent underline">
                    /privacy
                  </Link>
                  ,{" "}
                  <Link to="/terms" className="text-accent underline">
                    /terms
                  </Link>
                  , and{" "}
                  <Link to="/cookies" className="text-accent underline">
                    /cookies
                  </Link>
                  .
                </p>
                <p>
                  Right to be forgotten:{" "}
                  <a href="mailto:privacy@grow.contact" className="text-accent underline">
                    privacy@grow.contact
                  </a>
                  .
                </p>
              </Card>

              <Card label="Refunds" title="100/100 or full refund">
                <p>
                  If a site doesn't clear the 100/100 bar at delivery and we can't
                  resolve it in 7 days, the project is refunded in full. Policy at{" "}
                  <Link to="/refund" className="text-accent underline">
                    /refund
                  </Link>
                  .
                </p>
              </Card>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">
              Independent receipts
            </h2>
            <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
              <div className="bg-card p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                  // Live
                </p>
                <p className="font-bold uppercase tracking-tighter mb-1">/check on grow.contact</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Run the scanner on us right now. Same six signals, no special-casing.
                </p>
                <Link to="/check" className="text-accent underline text-sm">
                  Scan grow.contact ↗
                </Link>
              </div>
              <div className="bg-card p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                  // Lighthouse
                </p>
                <p className="font-bold uppercase tracking-tighter mb-1">PageSpeed Insights</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Google's own Lighthouse audit on our homepage. Public report, no edits possible.
                </p>
                <a
                  href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fgrow.contact"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline text-sm"
                >
                  View report ↗
                </a>
              </div>
              <div className="bg-card p-6">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                  // Data
                </p>
                <p className="font-bold uppercase tracking-tighter mb-1">Open leaderboard</p>
                <p className="text-sm text-muted-foreground mb-3">
                  Hundreds of AI companies scored against the same rubric. CC BY 4.0.
                </p>
                <Link to="/leaderboard" className="text-accent underline text-sm">
                  Open dataset ↗
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="max-w-4xl mx-auto px-6 py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">
              Two ways in
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Run the scanner first and bring the result. Or skip ahead and
              start a brief — same person reads either.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Link
                to="/check"
                className="bg-accent text-accent-foreground px-5 py-3 font-bold uppercase tracking-tighter hover:opacity-90"
              >
                Run a free scan →
              </Link>
              <Link
                to="/contact"
                className="border border-border px-5 py-3 font-bold uppercase tracking-tighter hover:border-accent"
              >
                Start a brief →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
