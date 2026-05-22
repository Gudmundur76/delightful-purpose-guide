import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const FAQS: { q: string; a: string }[] = [
  { q: "What does \"agent-native\" actually mean?", a: "Every page ships with semantic HTML, JSON-LD (Organization, Product, FAQ, BreadcrumbList), an llms.txt at the root, OpenGraph + Twitter cards, and a clean sitemap. The result: ChatGPT, Perplexity, Claude, and Google AI Overviews can read, cite, and link to your product without guessing." },
  { q: "Who is this actually for?", a: "AI/ML startups (model APIs, infra, eval tools), agent platforms (orchestration, browser agents, voice), and developer tools (SDKs, CLIs, MCP servers). If your buyer is a technical founder or platform engineer, you're in the right place." },
  { q: "How is 48 hours possible?", a: "A battle-tested internal build system, a tight component library, and a strict no-revision-loop process. We design and code in the same environment — no Figma-to-dev handoff gap, no waiting on third parties." },
  { q: "How much does it cost, and what's included?", a: "Fixed price per tier — no hourly surprises. Each build includes design, custom code, on-page SEO, responsive layouts, and deployment. Copy and stock imagery are on you; we can recommend writers if you need one." },
  { q: "What do you need from me to hit the 48-hour window?", a: "Brand assets (logo, fonts if any), final copy, and any reference sites — handed over at kickoff. The clock starts when we have everything. Slow content is the #1 reason projects slip." },
  { q: "What if I need changes?", a: "Every build includes one 4-hour revision block after delivery to polish the details and ensure perfection. Larger scope changes are quoted as a separate mini-engagement." },
  { q: "Do I own the code?", a: "Yes. Full GitHub repository handover. The site is yours to host, modify, and extend — no lock-in, no proprietary CMS." },
  { q: "Do you handle hosting and post-launch fixes?", a: "We deploy to your hosting of choice (Vercel, Netlify, Cloudflare) and fix any genuine bugs free for 14 days after launch. Ongoing maintenance is available as a monthly retainer if you want it." },
  { q: "Can I see live examples or talk to a past client?", a: "Yes — see the Work page for live sites. On request we'll connect you with a recent founder for a short reference call before you commit." },
  { q: "Will the site actually convert?", a: "We design around a single primary action per page and ship with analytics wired up so you can measure it. Conversion depends on offer and traffic too, but the site won't be the bottleneck." },
  { q: "Do I need a launch page, a marketing site, or a devtool hub?", a: "Launching a model or waitlist? Start with a Launch Page. Raising or selling to enterprise? Marketing Site. Shipping an SDK, API, or MCP server with docs and dashboards? Devtool Hub. Tell us the goal and we'll recommend the smallest thing that works." },
  { q: "What if I'm not happy with the result?", a: "If the first delivery misses the brief, we rework it on us until it matches what we agreed at kickoff. If it still isn't right after that, you pay only for time spent and walk away with whatever's been built." },
];

export const Route = createFileRoute("/faq")({
  component: FaqPage,
  head: () => ({
    meta: [
      { title: "FAQ — Grow" },
      { name: "description", content: "Answers to common questions about agent-native sites, pricing, timelines, and ownership." },
      { property: "og:title", content: "FAQ — Grow" },
      { property: "og:description", content: "What 'agent-native' means, how 48h works, pricing, ownership, and more." },
      { property: "og:url", content: "https://grow.contact/faq" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});

function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// Questions</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">FAQ</h1>
          </div>
        </section>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="space-y-8 sm:space-y-10">
            {FAQS.map((f) => (
              <div key={f.q}>
                <p className="font-bold uppercase tracking-tighter text-base sm:text-lg">{f.q}</p>
                <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="mt-16 border-t border-border pt-10 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">// Ready?</p>
            <Link to="/contact" className="inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors">
              Start a Brief →
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
