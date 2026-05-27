import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ReadabilityScore } from "@/components/ReadabilityScore";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CompareSection } from "@/components/CompareSection";
import { CaseStudies } from "@/components/CaseStudies";
import { ProcessTimeline } from "@/components/ProcessTimeline";
import { Services } from "@/components/Services";
import { TechSpecs } from "@/components/TechSpecs";
import { SmartContactForm } from "@/components/SmartContactForm";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { MiniChecker } from "@/components/MiniChecker";
import { getFaqItemsFn, getPageContentFn } from "@/lib/site/content.functions";
import { getOverviewStats } from "@/lib/check/stats.functions";


const FAQS: { q: string; a: string }[] = [
  { q: "What does \"agent-native\" actually mean?", a: "Every page ships with semantic HTML, JSON-LD (Organization, Product, FAQ, BreadcrumbList), an llms.txt at the root, OpenGraph + Twitter cards, and a clean sitemap. The result: ChatGPT, Perplexity, Claude, and Google AI Overviews can read, cite, and link to your product without guessing." },
  { q: "Who is this actually for?", a: "AI/ML startups (model APIs, infra, eval tools), agent platforms (orchestration, browser agents, voice), and developer tools (SDKs, CLIs, MCP servers). If your buyer is a technical founder or platform engineer, you're in the right place." },
  { q: "How is 48 hours possible?", a: "A battle-tested internal build system, a tight component library, and a strict no-revision-loop process. We design and code in the same environment — no Figma-to-dev handoff gap, no waiting on third parties." },
  { q: "How much does it cost, and what's included?", a: "Fixed price per tier — no hourly surprises. Each build includes design, custom code, on-page SEO, responsive layouts, and deployment. Copy and stock imagery are on you; we can recommend writers if you need one." },
  { q: "What do you need from me to hit the 48-hour window?", a: "Brand assets (logo, fonts if any), final copy, and any reference sites — handed over at kickoff. The clock starts when we have everything. Slow content is the #1 reason projects slip." },
  { q: "What if I need changes?", a: "Every build includes one 4-hour revision block after delivery to polish the details and ensure perfection. Larger scope changes are quoted as a separate mini-engagement." },
  { q: "Do I own the code?", a: "Yes. Full GitHub repository handover. The site is yours to host, modify, and extend — no lock-in, no proprietary CMS." },
  { q: "Do you handle hosting and post-launch fixes?", a: "We deploy to your hosting of choice (Vercel, Netlify, Cloudflare) and fix any genuine bugs free for 14 days after launch. Ongoing maintenance is available as a monthly retainer if you want it." },
];

export const Route = createFileRoute("/")({
  component: Index,

  head: () => ({
    meta: [
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
                acceptedAnswer: {
                  "@type": "Answer",
                  text: f.a,
                },
              })),
            },
            {
              "@type": "Service",
              serviceType: "Web Design",
              provider: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
              areaServed: "Worldwide",
              name: "Agent-native marketing sites",
              description:
                "Custom-coded marketing sites, launch pages, and devtool hubs for AI/ML startups, agent platforms, and developer tools. Delivered in 48 hours, fixed price.",
              offers: [
                { "@type": "Offer", name: "Starter", price: "2400", priceCurrency: "USD", url: "https://grow.contact/pricing" },
                { "@type": "Offer", name: "Growth", price: "4800", priceCurrency: "USD", url: "https://grow.contact/pricing" },
              ],
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
      "%c⚡ Agent-native. Score: 100/100",
      "color:#22d3ee;font-family:monospace;font-weight:bold;font-size:13px",
    );
    console.log(
      "%c  > npm install agent-native",
      "color:#64748b;font-family:monospace;font-size:11px",
    );
  }, []);

  const fetchFaq = useServerFn(getFaqItemsFn);
  const fetchHome = useServerFn(getPageContentFn);
  const fetchStats = useServerFn(getOverviewStats);
  const { data: faqData } = useQuery({ queryKey: ["faq-items"], queryFn: () => fetchFaq() });
  const { data: homeContent } = useQuery({ queryKey: ["site-content", "home"], queryFn: () => fetchHome({ data: "home" }) });
  const { data: stats = null } = useQuery({
    queryKey: ["overview-stats", 7],
    queryFn: () => fetchStats({ data: { days: 7 } }),
  });


  const faqItems = (faqData && faqData.length > 0)
    ? faqData.map((d) => ({ q: d.question, a: d.answer }))
    : FAQS;
  const heroEyebrow = homeContent?.hero_eyebrow ?? "// Agent-Native Website Agency";
  const heroHeadlinePrefix = homeContent?.hero_headline_prefix ?? "Built for";
  const heroHeadlineHuman = homeContent?.hero_headline_human ?? "Humans.";
  const heroHeadlineParsed = homeContent?.hero_headline_parsed ?? "Parsed by";
  const heroHeadlineAgents = homeContent?.hero_headline_agents ?? "Agents.";
  const heroSubheadline = homeContent?.hero_subheadline ?? "We build marketing sites engineered to be cited by ChatGPT, Perplexity, Claude, and Google AI Overviews — not just ranked by Google. Structured data, llms.txt, and semantic HTML, shipped in 48 hours.";
  const ctaLabel = homeContent?.cta_label ?? "Check Your Site's Score";

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
                  {heroEyebrow}
                </p>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-balance leading-[0.95] mb-8">
                  {heroHeadlinePrefix} <span className="text-muted-foreground">{heroHeadlineHuman}</span>
                  <br />
                  {heroHeadlineParsed} <span className="italic text-accent">{heroHeadlineAgents}</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-10 max-w-xl">
                  {heroSubheadline}
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    to="/contact"
                    className="group inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
                  >
                    {ctaLabel}
                    <span className="font-mono text-[10px] opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>

                  <Link
                    to="/work"
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2"
                  >
                    View Recent Outputs
                  </Link>
                </div>
                <MiniChecker />
              </div>
              <div className="lg:col-span-5 animate-in [animation-delay:150ms]">
                <ReadabilityScore initialData={stats} />
              </div>
            </div>
          </div>
        </section>

        <CaseStudies initialData={stats} />
        <SocialProofStrip />
        <ProcessTimeline />
        <Services />
        <TechSpecs />

        {/* FAQ */}
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="mb-10">
              <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// Questions</p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">FAQ</h2>
            </div>
            <div className="space-y-8 sm:space-y-10">
              {faqItems.map((f) => (
                <article key={f.q}>
                  <p className="font-bold uppercase tracking-tighter text-base sm:text-lg">{f.q}</p>
                  <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{f.a}</p>
                </article>
              ))}
            </div>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
              >
                Start a Brief
                <span className="font-mono text-[10px] opacity-70 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link to="/faq" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                See all FAQ →
              </Link>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="border-t border-border bg-card/30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="mb-10">
              <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// Start a brief</p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">Get in touch</h2>
            </div>
            <SmartContactForm />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
