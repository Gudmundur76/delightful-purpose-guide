import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import nimbusImg from "@/assets/portfolio-nimbus.jpg";
import vectorImg from "@/assets/portfolio-vector.jpg";
import { CaseStudies } from "@/components/CaseStudies";
import { CompareSection } from "@/components/CompareSection";
import { Guarantees } from "@/components/Guarantees";
import { SmartContactForm } from "@/components/SmartContactForm";
import { PricingTable } from "@/components/PricingTable";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { ReadabilityScore } from "@/components/ReadabilityScore";
import { Services } from "@/components/Services";
import { TechSpecs } from "@/components/TechSpecs";
import { useActiveSection } from "@/hooks/use-active-section";

const NAV_SECTIONS = ["services", "process", "archive"];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What does \"agent-native\" actually mean?",
    a: "Every page ships with semantic HTML, JSON-LD (Organization, Product, FAQ, BreadcrumbList), an llms.txt at the root, OpenGraph + Twitter cards, and a clean sitemap. The result: ChatGPT, Perplexity, Claude, and Google AI Overviews can read, cite, and link to your product without guessing.",
  },
  {
    q: "Who is this actually for?",
    a: "AI/ML startups (model APIs, infra, eval tools), agent platforms (orchestration, browser agents, voice), and developer tools (SDKs, CLIs, MCP servers). If your buyer is a technical founder or platform engineer, you're in the right place.",
  },
  {
    q: "How is 48 hours possible?",
    a: "We use a proprietary workflow powered by Lovable. We don't waste time on endless revisions; we build it right the first time using battle-tested technical frameworks.",
  },
  {
    q: "How much does it cost, and what's included?",
    a: "Fixed price per tier — no hourly surprises. Each build includes design, custom code, on-page SEO, responsive layouts, and deployment. Copy and stock imagery are on you; we can recommend writers if you need one.",
  },
  {
    q: "What do you need from me to hit the 48-hour window?",
    a: "Brand assets (logo, fonts if any), final copy, and any reference sites — handed over at kickoff. The clock starts when we have everything. Slow content is the #1 reason projects slip.",
  },
  {
    q: "What if I need changes?",
    a: "Every build includes one 4-hour revision block after delivery to polish the details and ensure perfection. Larger scope changes are quoted as a separate mini-engagement.",
  },
  {
    q: "Do I own the code?",
    a: "Yes. Full GitHub repository handover. The site is yours to host, modify, and extend — no lock-in, no proprietary CMS.",
  },
  {
    q: "Do you handle hosting and post-launch fixes?",
    a: "We deploy to your hosting of choice (Vercel, Netlify, Cloudflare) and fix any genuine bugs free for 14 days after launch. Ongoing maintenance is available as a monthly retainer if you want it.",
  },
  {
    q: "Can I see live examples or talk to a past client?",
    a: "Yes — see the Archive section above for live sites. On request we'll connect you with a recent founder for a short reference call before you commit.",
  },
  {
    q: "Will the site actually convert?",
    a: "We design around a single primary action per page and ship with analytics wired up so you can measure it. Conversion depends on offer and traffic too, but the site won't be the bottleneck.",
  },
  {
    q: "Do I need a launch page, a marketing site, or a devtool hub?",
    a: "Launching a model or waitlist? Start with a Launch Page. Raising or selling to enterprise? Marketing Site. Shipping an SDK, API, or MCP server with docs and dashboards? Devtool Hub. Tell us the goal and we'll recommend the smallest thing that works.",
  },
  {
    q: "What if I'm not happy with the result?",
    a: "If the first delivery misses the brief, we rework it on us until it matches what we agreed at kickoff. If it still isn't right after that, you pay only for time spent and walk away with whatever's been built.",
  },
];

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
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
});

function Index() {
  const active = useActiveSection(NAV_SECTIONS);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
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
      {/* Header */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 border-b ${
          scrolled
            ? "bg-background/70 backdrop-blur-xl border-border/80 shadow-[0_1px_0_0_rgba(255,255,255,0.04)]"
            : "bg-background border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-extrabold tracking-tighter text-xl uppercase">
              GROW_
            </span>
            <span className="font-mono text-[10px] font-medium px-2 py-1 border border-accent/40 bg-accent/10 text-accent tracking-tight rounded-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Score: 85
            </span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {NAV_SECTIONS.map((id) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`transition-colors hover:text-foreground ${active === id ? "text-foreground" : ""}`}
                >
                  {id === "archive" ? "Archive" : id === "services" ? "Services" : "Process"}
                </a>
              ))}
              <Link
                to="/blog"
                className="transition-colors hover:text-foreground"
              >
                Journal
              </Link>
            </div>
            <a
              href="#cta"
              className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:bg-accent hover:text-accent-foreground transition-all"
            >
              Start Brief
            </a>
          </div>
        </div>
      </nav>


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
                <a
                  href="#cta"
                  className="group inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
                >
                  Check Your Site's Score
                  <span className="font-mono text-[10px] opacity-70 group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </a>
                <a
                  href="#archive"
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2"
                >
                  View Recent Outputs
                </a>
              </div>
            </div>
            <div className="lg:col-span-5 animate-in [animation-delay:150ms]">
              <ReadabilityScore />
            </div>
          </div>
        </div>
      </section>

      {/* Compare */}
      <CompareSection />

      {/* Case Studies */}
      <CaseStudies />


      {/* Process */}
      <ProcessTimeline />

      {/* Services */}
      <Services />

      {/* Guarantees */}
      <Guarantees />


      {/* Portfolio */}
      <section id="archive" className="scroll-mt-20 max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase">
            Recent Outputs
          </h2>
          <span className="font-mono text-xs text-muted-foreground">V.03/26 Portfolio</span>
        </div>
        <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
          <div className="bg-background p-4">
            <img
              src={nimbusImg}
              alt="Nimbus Agents — agent orchestration platform marketing site"
              width={1280}
              height={960}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover bg-card"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold uppercase tracking-tighter">
                Nimbus Agents — Orchestration Platform
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                DEVTOOL HUB // 48H
              </span>
            </div>
          </div>
          <div className="bg-background p-4">
            <img
              src={vectorImg}
              alt="Vector Eval — LLM evaluation platform marketing site"
              width={1280}
              height={960}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover bg-card"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold uppercase tracking-tighter">
                Vector Eval — LLM Eval Suite
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                MARKETING SITE // 48H
              </span>
            </div>
          </div>
        </div>
      </section>

      <PricingTable />

      {/* Technical Specifications */}
      <TechSpecs />
      </main>


      {/* FAQ + CTA */}
      <footer id="cta" className="scroll-mt-20 border-t border-border py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-24">
            <div>
              <h4 className="font-mono text-xs uppercase text-accent mb-8">
                // Frequently Asked Questions
              </h4>
              <div className="space-y-10">
                {FAQS.map((f) => (
                  <div key={f.q}>
                    <p className="font-bold uppercase tracking-tighter text-lg">
                      {f.q}
                    </p>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-accent p-12 flex flex-col gap-8">
              <div>
                <h2 className="text-4xl font-extrabold tracking-tighter uppercase text-accent-foreground leading-none">
                  Ready to
                  <br />
                  ship your
                  <br />
                  vision?
                </h2>
                <p className="font-mono text-[10px] text-accent-foreground/70 uppercase tracking-widest mt-4">
                  Next available slot: Today, 14:00 UTC
                </p>
              </div>
              <SmartContactForm />
            </div>
          </div>
          <div className="mt-24 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-10">
            <div>
              <h5 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">// Studio</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#services" className="hover:text-foreground transition-colors">Services</a></li>
                <li><a href="#process" className="hover:text-foreground transition-colors">Process</a></li>
                <li><a href="#archive" className="hover:text-foreground transition-colors">Archive</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">// Resources</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Journal</Link></li>
                <li><a href="/llms.txt" className="hover:text-foreground transition-colors">llms.txt</a></li>
                <li><a href="/api/public/v1/docs" className="hover:text-foreground transition-colors">API Docs</a></li>
                <li><Link to="/status" className="hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">// Contact</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="mailto:hello@grow.contact" className="hover:text-foreground transition-colors">hello@grow.contact</a></li>
                <li><a href="#cta" className="hover:text-foreground transition-colors">Start a Brief</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">// Readiness</h5>
              <pre className="font-mono text-[11px] leading-relaxed bg-card border border-border rounded-md p-3 text-emerald-400 overflow-x-auto">
<span className="text-muted-foreground">user@grow:~$</span> curl /api/readiness
{`{"status":"agent-ready","score":85}`}<span className="inline-block w-2 h-3 bg-emerald-400 ml-1 align-middle animate-[blink_1s_steps(2,start)_infinite]" />
              </pre>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row gap-4 md:items-center md:justify-between font-mono text-[10px] text-muted-foreground uppercase">
            <span>&copy; 2026 GROW STUDIO</span>
            <a
              href="https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fgrow.contact"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Lighthouse performance audit on PageSpeed Insights"
              className="group inline-flex items-center gap-2 border border-emerald-500/40 bg-emerald-500/5 px-3 py-1.5 hover:border-emerald-500 transition-colors"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span className="text-emerald-400">Lighthouse</span>
              <span className="text-emerald-400 font-bold">98</span>
              <span className="text-muted-foreground">/ 100</span>
              <span className="text-muted-foreground opacity-70 group-hover:opacity-100">↗</span>
            </a>
            <span>Powering 48H Innovation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
