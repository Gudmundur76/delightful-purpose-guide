import { createFileRoute, Link } from "@tanstack/react-router";
import fluxImg from "@/assets/portfolio-flux.jpg";
import architexImg from "@/assets/portfolio-architex.jpg";
import { LeadForm } from "@/components/LeadForm";
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
    q: "Do I need a marketing site, a landing page, or a web app?",
    a: "If you're testing a single offer, start with a landing page. If you're raising or hiring, a full marketing site. If users log in and do work, that's a web app — we build all three; tell us the goal and we'll recommend the smallest thing that works.",
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
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-medium px-2 py-1 border border-accent text-accent tracking-tighter uppercase">
              Status: Ready
            </span>
            <span className="font-extrabold tracking-tighter text-xl uppercase">
              GROW_
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
          <div className="grid md:grid-cols-12 gap-12 items-end">
            <div className="md:col-span-8 animate-in">
              <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
                // Agent-Native Websites · Live in 48 Hours
              </p>
              <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-balance leading-[0.9] mb-8">
                BUILT FOR <span className="text-muted-foreground">HUMANS.</span>
                <br />
                READ BY <span className="italic">AGENTS.</span>
              </h1>
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-4 bg-card border border-border flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    Fixed Rate
                  </span>
                  <span className="text-2xl font-bold tracking-tighter">$2,400.00</span>
                </div>
                <div className="px-6 py-4 bg-card border border-border flex flex-col gap-1">
                  <span className="font-mono text-[10px] text-muted-foreground uppercase">
                    Delivery Window
                  </span>
                  <span className="text-2xl font-bold tracking-tighter">48:00:00</span>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 animate-in [animation-delay:150ms]">
              <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm">
                Marketing sites for AI/ML startups, agent platforms, and developer tools.
                Structured for humans, parseable by LLMs, indexable by every crawler that
                matters in 2026.
              </p>
              <a
                href="#cta"
                className="block text-center w-full py-4 border-2 border-foreground font-bold uppercase tracking-tighter hover:bg-foreground hover:text-background transition-colors"
              >
                Book Intro Call (15m)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section id="process" className="scroll-mt-20 border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-6 pt-16">
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase">
            The Process
          </h2>
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
          {[
            { n: "01", t: "The Brief", d: "Send your positioning, docs, and API surface. We turn it into a structured site map and content schema in hours, not weeks." },
            { n: "02", t: "The Build", d: "48-hour sprint: custom code, semantic HTML, JSON-LD, llms.txt, OpenGraph, sitemap. Preview link within 12h." },
            { n: "03", t: "The Launch", d: "Lighthouse audit, agent-readability check (ChatGPT, Perplexity, Claude), domain handover. Live and citeable." },
          ].map((s, i) => (
            <div
              key={s.n}
              className="flex-1 p-10 animate-in"
              style={{ animationDelay: `${200 + i * 100}ms` }}
            >
              <span className="font-mono text-accent text-xs">{s.n}</span>
              <h3 className="text-xl font-bold mt-4 uppercase tracking-tighter">{s.t}</h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

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
              src={fluxImg}
              alt="Flux Capital fintech dashboard"
              width={1280}
              height={960}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover bg-card"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold uppercase tracking-tighter">
                Flux Capital Branding
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                LANDING PAGE // 48H
              </span>
            </div>
          </div>
          <div className="bg-background p-4">
            <img
              src={architexImg}
              alt="Architex Studio portfolio site"
              width={1280}
              height={960}
              loading="lazy"
              className="w-full aspect-[4/3] object-cover bg-card"
            />
            <div className="mt-4 flex justify-between items-center">
              <span className="font-bold uppercase tracking-tighter">
                Architex Studio
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                MARKETING SITE // 48H
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="services" className="scroll-mt-20 bg-foreground text-background py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold tracking-tighter uppercase mb-12">
            Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                tier: "Tier 01",
                name: "Launch Page",
                desc: "Single-page site for an AI product launch, waitlist, or YC demo day.",
                price: "$2,400",
                features: ["+ 48hr Delivery", "+ llms.txt + JSON-LD", "+ Agent-readability audit"],
                accent: false,
                label: "Tier 01",
              },
              {
                tier: "Tier 02 // Most Popular",
                name: "Marketing Site",
                desc: "Up to 5 pages for AI/ML startups and agent platforms — home, product, pricing, docs intro, about.",
                price: "$4,800",
                features: ["+ MDX content layer", "+ Structured docs schema", "+ Priority support"],
                accent: true,
                label: "Tier 02 // Most Popular",
              },
              {
                tier: "Tier 03",
                name: "Devtool Hub",
                desc: "Marketing site + API reference + MCP-ready docs for developer tools and agent SDKs.",
                price: "$8,500+",
                features: ["+ API reference layer", "+ MCP/OpenAPI surface", "+ Auth & dashboard scaffold"],
                accent: false,
                label: "Tier 03",
              },
            ].map((p) => (
              <div
                key={p.name}
                className={`border-l-2 pl-8 ${p.accent ? "border-accent" : "border-background/20"}`}
              >
                <p
                  className={`font-mono text-[10px] uppercase mb-2 ${p.accent ? "text-accent" : "opacity-60"}`}
                >
                  {p.label}
                </p>
                <h3 className="text-3xl font-extrabold uppercase tracking-tighter">
                  {p.name}
                </h3>
                <p className="text-sm mt-4 opacity-80 h-12">{p.desc}</p>
                <p className="text-4xl font-bold tracking-tighter mt-8">{p.price}</p>
                <ul className="mt-8 space-y-2 text-xs font-mono uppercase tracking-tighter">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
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
              <LeadForm />
            </div>
          </div>
          <div className="mt-24 pt-8 border-t border-border flex justify-between font-mono text-[10px] text-muted-foreground uppercase">
            <span>&copy; 2026 GROW STUDIO</span>
            <span>Powering 48H Innovation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
