import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { Shield, Bot, Search, Server, Zap, BadgeCheck, FileCode, ArrowRight, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/for-agents")({
  component: ForAgentsPage,
  head: () => ({
    meta: [
      { title: "For AI agents — a verification layer your users can trust | Grow" },
      {
        name: "description",
        content:
          "Help users trust the agents they delegate to. Grow's MCP server, REST API, and embeddable badge let any AI platform verify claims, sources, and citations in real time.",
      },
      {
        property: "og:title",
        content: "For AI agents — a verification layer your users can trust",
      },
      {
        property: "og:description",
        content:
          "MCP server, REST API, and embeddable badge so AI platforms can verify claims, sources, and citations in real time.",
      },
      { property: "og:url", content: "https://citation.is/for-agents" },
      ...ogImageMeta({
        title: "For AI agents — a verification layer your users can trust",
        kicker: "Grow",
        sub: "MCP, API, and badge integrations for AI platforms.",
      }),
    ],
    links: [{ rel: "canonical", href: "https://citation.is/for-agents" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Grow Agent Verification",
          description:
            "Verification layer for AI agent platforms. MCP server, API, and badge integrations.",
          brand: { "@type": "Brand", name: "Grow" },
          url: "https://citation.is/for-agents",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
          },
        }),
      },
    ],
  }),
});

const CALENDLY_URL = "https://calendly.com/grow-contact/intro";

function ForAgentsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border" aria-label="Hero">
          <div className="max-w-7xl mx-auto px-6 py-20 md:py-32">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">
              // Agent Partnerships
            </p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase max-w-4xl">
              Help your users trust the agents they delegate to.
            </h1>
            <p className="mt-6 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed">
              Grow is a verification layer for the{" "}
              <span className="text-foreground font-semibold">$5.83B agent economy</span>:
              an MCP server, a REST API, and a small embeddable badge that let your platform show, in real time, which agent answers are sourced, citable, and safe to act on.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
              >
                Schedule Integration Call
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                to="/research"
                className="inline-flex items-center gap-2 border border-border font-bold px-6 py-3 uppercase tracking-tighter text-sm hover:border-accent hover:text-accent transition-colors"
              >
                Read the Research
              </Link>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="border-b border-border" aria-label="Problem">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">
              // The Problem
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase max-w-3xl">
              Users don&apos;t trust agents that can&apos;t show their work
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="border border-border p-6 md:p-8">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Stat 01
                </div>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tighter text-accent">
                  73%
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  of agent claims are unverifiable — no source, no citation, no way for users to
                  check what the agent just asserted.
                </p>
              </div>
              <div className="border border-border p-6 md:p-8">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Stat 02
                </div>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tighter text-accent">
                  0%
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  trust conversion for agents without any proof signal. Users abandon agents that
                  hallucinate or refuse to show their work.
                </p>
              </div>
              <div className="border border-border p-6 md:p-8">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Stat 03
                </div>
                <div className="text-4xl md:text-5xl font-extrabold tracking-tighter text-accent">
                  Delist
                </div>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                  Unverified agents get delisted from marketplaces. Platforms that don&apos;t enforce
                  claim verification lose developer and enterprise confidence.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="border-b border-border" aria-label="Solution">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">
              // The Solution
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase max-w-3xl">
              Score Every Claim. Badge Every Agent.
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              <div className="flex gap-4">
                <div className="mt-1">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-extrabold tracking-tight uppercase text-sm">
                    Score Claims for Verifiability
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    citation.is scores every claim an agent makes against source quality, citation
                    depth, and factual grounding. Low-scoring claims are flagged before they reach
                    users.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1">
                  <BadgeCheck className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-extrabold tracking-tight uppercase text-sm">
                    Verified Badge for Truth Scores &gt;75
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Agents with truth scores above 75 earn a &quot;Verified by citation.is&quot;
                    badge. Users see it on agent profiles, search results, and marketplace listings.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1">
                  <Search className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-extrabold tracking-tight uppercase text-sm">
                    Certified Agents Rank Higher
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Verified agents surface first in AI search results, marketplace directories,
                    and platform recommendations. Certification becomes a ranking signal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integration options */}
        <section className="border-b border-border" aria-label="Integrations">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">
              // Integrations
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase max-w-3xl">
              Three Ways to Verify
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {/* Card 1 — MCP */}
              <div className="border border-border p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Server className="w-5 h-5 text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Option 01
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight uppercase">MCP Server</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  Agents call{" "}
                  <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                    verify_claim()
                  </code>{" "}
                  before publishing any output. Real-time truth scoring with structured JSON
                  responses. Built for LangChain, CrewAI, AutoGPT, and any MCP-compatible runtime.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    "Structured truth scores",
                    "Sub-100ms response time",
                    "No state to manage",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <span className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-tighter text-muted-foreground">
                    MCP Server v2.0
                  </span>
                </div>
              </div>

              {/* Card 2 — API */}
              <div className="border border-border p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Option 02
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight uppercase">API</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  Batch-verify every agent in your marketplace. Upload a manifest, get back a
                  complete verification report with per-agent truth scores, citation quality,
                  and recommended fixes.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    "Bulk agent verification",
                    "CSV / JSON export",
                    "Webhook notifications",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <Link
                    to="/research"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-tighter hover:text-accent transition-colors"
                  >
                    API Docs <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Card 3 — Badge */}
              <div className="border border-border p-6 md:p-8 flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <FileCode className="w-5 h-5 text-accent" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Option 03
                  </span>
                </div>
                <h3 className="text-xl font-extrabold tracking-tight uppercase">Badge</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  Embed a &quot;Verified by citation.is&quot; badge on every agent profile. SVG,
                  dark-mode aware, and auto-updating. One line of HTML. No JavaScript required.
                </p>
                <ul className="mt-6 space-y-2">
                  {[
                    "Auto-updating score",
                    "Dark + light modes",
                    "One-line embed",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="w-3.5 h-3.5 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-6 pt-6 border-t border-border">
                  <Link
                    to="/leaderboard"
                    className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-tighter hover:text-accent transition-colors"
                  >
                    See Badges <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="border-b border-border" aria-label="Social proof">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">
              // Traction
            </p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase max-w-3xl">
              Trusted by Agent Platforms
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-3">
              <div className="text-center border border-border p-8">
                <Bot className="w-8 h-8 text-accent mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-extrabold tracking-tighter">
                  66
                </div>
                <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">
                  AI companies audited
                </p>
              </div>
              <div className="text-center border border-border p-8">
                <Shield className="w-8 h-8 text-accent mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-extrabold tracking-tighter">
                  76
                </div>
                <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">
                  citation events tracked
                </p>
              </div>
              <div className="text-center border border-border p-8">
                <Search className="w-8 h-8 text-accent mx-auto mb-4" />
                <div className="text-3xl md:text-4xl font-extrabold tracking-tighter">
                  391
                </div>
                <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest">
                  companies in citation dataset
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section aria-label="Call to action">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <div className="border border-border p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tighter uppercase">
                Ready to Verify Your Agents?
              </h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Book a 30-minute integration call. We&apos;ll walk through MCP setup, API
                credentials, and badge embedding for your platform.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
                >
                  Schedule Integration Call
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/check"
                  className="inline-flex items-center gap-2 border border-border font-bold px-6 py-3 uppercase tracking-tighter text-sm hover:border-accent hover:text-accent transition-colors"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-wrap gap-8 md:gap-16">
            <div>
              <h4 className="font-extrabold tracking-tight uppercase text-sm mb-4">
                Documentation
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/api/public/mcp"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    MCP Server
                  </Link>
                </li>
                <li>
                  <Link
                    to="/research"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    API Reference
                  </Link>
                </li>
                <li>
                  <Link
                    to="/playground"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    Playground
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-extrabold tracking-tight uppercase text-sm mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/check"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link
                    to="/leaderboard"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    Leaderboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/research"
                    className="text-sm text-muted-foreground hover:text-accent transition-colors"
                  >
                    Research
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              © {new Date().getFullYear()} Grow. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link
                to="/privacy"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
