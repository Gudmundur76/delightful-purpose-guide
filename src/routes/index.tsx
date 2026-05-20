import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { ReadabilityScore } from "@/components/ReadabilityScore";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Grow — Agent-Native Websites for AI startups & devtools" },
      {
        name: "description",
        content:
          "Grow ships agent-native marketing sites for AI/ML startups, agent platforms, and developer tools. Custom-coded, LLM-readable, live in 48 hours — fixed price.",
      },
      { property: "og:title", content: "Grow — Agent-Native Websites for AI startups & devtools" },
      {
        property: "og:description",
        content:
          "Marketing sites built for the agent era: structured data, llms.txt, MCP-ready docs. For AI/ML startups, agent platforms, and devtools. 48 hours, fixed price.",
      },
      { property: "og:url", content: "https://grow.contact/" },
    ],
    links: [
      { rel: "canonical", href: "https://grow.contact/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&family=JetBrains+Mono:wght@400;500&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: "Grow",
              url: "https://grow.contact/",
              description:
                "Productized web design agency. Custom-coded websites shipped in 48 hours.",
            },
            {
              "@type": "WebSite",
              name: "Grow",
              url: "https://grow.contact/",
            },
          ],
        }),
      },
    ],
  }),
});

function Index() {
  useEffect(() => {
    console.log(
      "%c⚡ Agent-native. Score: 85/100",
      "color:#22d3ee;font-family:monospace;font-weight:bold;font-size:13px",
    );
    console.log(
      "%c  > npm install agent-native",
      "color:#64748b;font-family:monospace;font-size:11px",
    );
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative border-b border-border overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <div className="lg:col-span-7 animate-in">
                <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
                  // Agent-Native Website Agency
                </p>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-balance leading-[0.95] mb-8">
                  Built for <span className="text-muted-foreground">Humans.</span>
                  <br />
                  Parsed by <span className="italic text-accent">Agents.</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-xl">
                  We build marketing sites engineered to be cited by ChatGPT,
                  Perplexity, Claude, and Google AI Overviews — not just ranked by
                  Google. Structured data, llms.txt, and semantic HTML, shipped in
                  48 hours.
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
                  >
                    Check Your Site's Score
                    <span className="font-mono text-[10px] opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    to="/work"
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2"
                  >
                    View Recent Outputs
                  </Link>
                </div>
              </div>
              <div className="lg:col-span-5 animate-in [animation-delay:150ms]">
                <ReadabilityScore />
              </div>
            </div>
          </div>
        </section>

        {/* Quick nav cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
            {[
              { to: "/services" as const, label: "Services", desc: "Three productized tiers." },
              { to: "/process" as const, label: "Process", desc: "48-hour workflow." },
              { to: "/work" as const, label: "Work", desc: "Case studies & archive." },
              { to: "/pricing" as const, label: "Pricing", desc: "Fixed, transparent." },
            ].map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group bg-background p-6 sm:p-8 hover:bg-card transition-colors"
              >
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">// {c.label}</p>
                <p className="font-extrabold uppercase tracking-tighter text-xl">{c.desc}</p>
                <p className="font-mono text-[10px] text-muted-foreground mt-6 group-hover:text-foreground transition-colors">Read more →</p>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
