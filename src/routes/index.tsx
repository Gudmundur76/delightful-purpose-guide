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

type FaqItem = { q: string; a: string };
type FaqRow = { question: string; answer: string };

export const Route = createFileRoute("/")({
  component: Index,

  loader: async ({ context }) => {
    // Prefetch FAQ + home content so SSR HTML and JSON-LD reflect DB state
    // and stay in sync with what the user sees after hydration.
    const [faqData, homeContent] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["faq-items"],
        queryFn: () => getFaqItemsFn(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["site-content", "home"],
        queryFn: () => getPageContentFn({ data: "home" }),
      }),
    ]);
    return { faqData, homeContent };
  },

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
  const loaderData = Route.useLoaderData();

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
  const { data: faqData } = useQuery({ queryKey: ["faq-items"], queryFn: () => fetchFaq(), initialData: loaderData.faqData });
  const { data: homeContent } = useQuery({ queryKey: ["site-content", "home"], queryFn: () => fetchHome({ data: "home" }), initialData: loaderData.homeContent });
  const { data: stats = null } = useQuery({
    queryKey: ["overview-stats", 7],
    queryFn: () => fetchStats({ data: { days: 7 } }),
  });


  const faqItems = (faqData && faqData.length > 0)
    ? faqData.map((d: FaqRow) => ({ q: d.question, a: d.answer }))
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
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                  {heroSubheadline}
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-10 max-w-xl">
                  Why now:{" "}
                  <a href="https://allbusinessrealm.com/index.php/2026/04/30/the-83-rule-why-ai-overviews-skip-the-top-10-and-where-small-sites-are-quietly-winning/" rel="noopener" className="text-accent underline underline-offset-2">83% of AI Overview citations come from outside the organic top 10</a>,{" "}
                  <a href="https://grow.contact/check" rel="noopener" className="text-accent underline underline-offset-2">73% of sites are silently excluded from AI citations</a>, and{" "}
                  AI-referred sessions{" "}
                  <a href="https://searchengineland.com/ai-traffic-up-seo-rewritten-459954" rel="noopener" className="text-accent underline underline-offset-2">jumped 527% year-over-year in early 2025</a>.
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
            {/* FAQPage JSON-LD generated from the same source the UI renders,
                so visible Q&A and structured data can never drift. */}
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  "@context": "https://schema.org",
                  "@type": "FAQPage",
                  mainEntity: faqItems.map((f: FaqItem) => ({
                    "@type": "Question",
                    name: f.q,
                    acceptedAnswer: { "@type": "Answer", text: f.a },
                  })),
                }),
              }}
            />
            <div className="mb-10">
              <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// Questions</p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase">FAQ</h2>
            </div>
            <div className="space-y-8 sm:space-y-10">
              {faqItems.map((f: FaqItem) => (
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

        {/* GEO Citation Factors */}
        <section className="border-t border-border" aria-label="GEO citation factors">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// The GEO Citation Factors</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-3">Citation Factors</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-10 max-w-2xl">What actually determines whether AI engines cite your site.</p>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead className="bg-card/50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 border-b border-border">Factor</th>
                    <th className="text-left px-4 py-3 border-b border-border">Citation Impact</th>
                    <th className="text-left px-4 py-3 border-b border-border">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Hyperlinked verifiable statistics in content", "+40% citation rate", "Princeton GEO Framework, 2023"],
                    ["Citing primary sources within your content", "+30–35% citation rate", "Princeton GEO Framework, 2023"],
                    ["Expert quotes with attribution", "+30% citation rate", "Princeton GEO Framework, 2023"],
                    ["Content freshness (under 90 days)", "3× multiplier for Google AIO", "Industry benchmark, 2026"],
                    ["Content length over 20,000 characters", "4.3× more citations", "Princeton GEO Framework, 2023"],
                    ["Answer-first format (50–70 words at top)", "Critical for Google AIO", "Google Search Central, 2025"],
                    ["FAQ schema on page", "Significantly higher AIO rate", "Industry benchmark, 2026"],
                  ].map(([f, i, s]) => (
                    <tr key={f} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 align-top">{f}</td>
                      <td className="px-4 py-3 align-top font-mono text-xs text-accent">{i}</td>
                      <td className="px-4 py-3 align-top text-muted-foreground text-xs">{s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm md:text-base mt-8 max-w-3xl leading-relaxed">
              These are not SEO factors. They are citation factors — the signals that determine whether ChatGPT, Perplexity, Claude, and Google AI Overviews quote your site or skip it entirely. Every grow.contact build is engineered against all seven.
            </p>
          </div>
        </section>

        {/* 8 AI Systems */}
        <section className="border-t border-border bg-card/20" aria-label="AI crawler matrix">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// 8 AI Systems. 8 Different Crawlers.</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-6">The Crawler Matrix</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-4 max-w-3xl leading-relaxed">
              Most sites are optimized for one crawler: Googlebot. In 2026, your buyers are using eight AI systems to research vendors, compare tools, and make purchase decisions. Each one sends a different bot, with different crawl behavior, different citation triggers, and different content preferences.
            </p>
            <p className="text-muted-foreground text-sm md:text-base mb-10 max-w-3xl leading-relaxed">
              Here is what is actually crawling your site right now:
            </p>
            <div className="overflow-x-auto border border-border">
              <table className="w-full text-sm">
                <thead className="bg-card/50 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="text-left px-4 py-3 border-b border-border">AI System</th>
                    <th className="text-left px-4 py-3 border-b border-border">Crawler</th>
                    <th className="text-left px-4 py-3 border-b border-border">Behavior</th>
                    <th className="text-left px-4 py-3 border-b border-border">What It Cites</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["ChatGPT Search", "OAI-SearchBot", "4,200 hits/day, breadth-first", "Front-loaded claims, public pricing, named features"],
                    ["Perplexity", "PerplexityBot", "Burst-heavy, 240 req/min on viral queries", "Listicles, comparison tables, quantified claims"],
                    ["Google AI Overviews", "Googlebot", "Steady, E-E-A-T weighted", "Answer-first paragraphs, FAQ schema, fresh content"],
                    ["Claude (Anthropic)", "Claude-SearchBot", "Depth-first, 1,800 hits/day", "Technical docs, long-form, /docs and /api paths"],
                    ["Gemini", "Googlebot", "Freshness dominant, <90 days", "Original research, quarterly refreshed content"],
                    ["Meta AI", "Meta-ExternalAgent", "Aggressive, poor robots.txt compliance", "Block for training; allow FacebookBot for search"],
                    ["Copilot / Bing", "Bingbot", "Bing index dependent", "Standard structured content, hyperlinked stats"],
                    ["You.com", "YouBot", "Low volume, decentralized", "Structured data, clean HTML"],
                  ].map(([sys, bot, beh, cite]) => (
                    <tr key={sys} className="border-b border-border last:border-b-0">
                      <td className="px-4 py-3 align-top font-bold">{sys}</td>
                      <td className="px-4 py-3 align-top font-mono text-xs text-accent">{bot}</td>
                      <td className="px-4 py-3 align-top text-muted-foreground text-xs">{beh}</td>
                      <td className="px-4 py-3 align-top text-muted-foreground text-xs">{cite}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground text-sm md:text-base mt-8 max-w-3xl leading-relaxed">
              73% of sites are silently excluded from AI citations before content quality even matters — wrong robots.txt configuration, JavaScript-only rendering, or CDN rules that block AI crawlers entirely. Every grow.contact build starts by fixing these access failures first.
            </p>
          </div>
        </section>

        {/* Agent-Native Stack */}
        <section className="border-t border-border" aria-label="Agent-native technical stack">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// The Agent-Native Stack</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-3">Six Layers</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-12 max-w-2xl">Every grow.contact site ships with this technical layer.</p>
            <div className="grid gap-px bg-border border border-border">
              {[
                ["Layer 1 — Semantic HTML", "Every page uses <main>, <article>, <section>, and <nav> landmark elements. Strict H1 → H6 hierarchy. No div soup. This is the universal signal across every AI scraper — before JSON-LD, before llms.txt, before anything else. If your HTML structure is ambiguous, no amount of schema will save it."],
                ["Layer 2 — JSON-LD Structured Data", "Organization, Product, FAQPage, Article, BreadcrumbList — nested correctly, not just present. A flat Organization schema tells an AI crawler your company exists. A nested Organization → Product → Offer schema tells it what you sell, at what price, to whom. We implement the deep nesting that grounding-heavy models like GPT-4o actually use when citing vendors."],
                ["Layer 3 — llms.txt", "A machine-readable index at your site root: H1 title, blockquote summary, H2 file lists linking to your key pages. Read by OpenAI GPTs, Claude, and developer tools as the first thing they request when building context about your product. We include brand disambiguation (grow.contact ≠ grow.com) to prevent citation bleed to unrelated companies."],
                ["Layer 4 — llms-full.txt", "A full markdown dump of your entire site content — no navigation chrome, no HTML tags, no boilerplate — served at /llms-full.txt. Used by agents that need full context before answering questions about your product. Especially critical for API documentation, manuals, and technical specs. Linked from your llms.txt."],
                ["Layer 5 — robots.txt AI Directives", "All eight AI crawlers explicitly allowed, with training bots separated from search/retrieval bots. GPTBot (OpenAI training), OAI-SearchBot (ChatGPT Search retrieval), PerplexityBot, ClaudeBot, Claude-SearchBot, Google-Extended, YouBot, Bingbot — each with the correct directive. Blocks Meta-ExternalAgent for training; allows FacebookBot for search."],
                ["Layer 6 — RSS Feed + Sitemap", "An XML sitemap for crawl discovery. An Atom/RSS feed that triggers re-indexing in RAG pipelines — the architecture behind Perplexity, ChatGPT Search, and Gemini. When you publish new content, the RSS feed signals AI systems to re-fetch and re-index your site within hours rather than weeks."],
              ].map(([title, body]) => (
                <div key={title} className="bg-background p-6 md:p-8">
                  <p className="font-mono text-accent text-[11px] uppercase tracking-widest mb-3">{title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How the Score Works */}
        <section className="border-t border-border bg-card/20" aria-label="How the score works">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// How the Score Works</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-3">Five Signals. One Number.</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-12 max-w-2xl">What each signal means and how it&apos;s weighted.</p>
            <div className="space-y-6">
              {[
                ["Signal 1 — Semantic HTML", "25%", "Does the page use proper landmark elements? Is the H1 singular and descriptive? Are content regions wrapped in <article> and <section>? Is navigation in <nav>? This is the foundation — every AI scraper reads HTML before it reads anything else."],
                ["Signal 2 — JSON-LD Coverage", "20%", "Is structured data present? Which schema types? Are entities nested or flat? An Organization schema alone scores low. Organization + Product + FAQ + BreadcrumbList, correctly nested, scores high. We check type, nesting depth, and field completeness."],
                ["Signal 3 — llms.txt Present", "15%", "Does /llms.txt exist? Is it correctly structured per the specification — H1 title, blockquote summary, H2 file lists? Does it link to key pages? Does it include brand disambiguation? A malformed llms.txt scores lower than no llms.txt at all."],
                ["Signal 4 — Citability", "20%", "Does the page contain answer-first content? Are there verifiable statistics with hyperlinks to primary sources? Is there FAQ content? Is content fresh (under 90 days)? This signal measures whether AI engines have something concrete to cite — or whether the page is too vague to quote."],
                ["Signal 5 — Page Speed", "20%", "TTFB under 200ms. HTML payload under 1MB. LCP under 2.5s. AI crawlers time out in 1–5 seconds — if your server is slow or your page is heavy, the crawler may never read the content that matters. We measure the raw server response, not the browser-rendered experience."],
              ].map(([title, weight, body]) => (
                <article key={title} className="border border-border p-6 md:p-8 bg-background">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <p className="font-mono text-accent text-[11px] uppercase tracking-widest">{title}</p>
                    <span className="font-mono text-xs text-accent">{weight}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Why This Matters Now */}
        <section className="border-t border-border" aria-label="Why this matters now">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// Why This Matters Now</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-10">The Shift Is Measurable</h2>
            <div className="space-y-5 text-muted-foreground text-base leading-relaxed">
              <p>The shift from search to AI answer engines is not a prediction. It is a measurement.</p>
              <p><strong className="text-foreground">Google AI Overviews now trigger on approximately 48% of all queries.</strong> The share of queries that generate an AI-synthesized answer — rather than a traditional list of blue links — crossed the majority threshold for technology and software categories in late 2025.</p>
              <p><strong className="text-foreground">AI-referred sessions jumped 527% year-over-year in early 2025.</strong> That is not a rounding error. That is a structural shift in how buyers find vendors.</p>
              <p><strong className="text-foreground">83% of AI Overview citations come from pages outside the organic top 10.</strong> Domain authority, the metric that SEO agencies have sold for 20 years, does not predict AI citations. Structured data, semantic clarity, statistical density, and content length do.</p>
              <p>For AI/ML startups, agent platforms, and developer tool companies — the companies grow.contact serves — this matters more than it does for any other category. Your buyers are technical founders who use Perplexity to research alternatives before they ever visit your site. They use Claude to analyze your documentation before they sign up for a trial. They ask ChatGPT to compare your pricing against competitors.</p>
              <p className="text-foreground font-bold">If your site is not agent-readable, you are invisible to the entire top of the funnel.</p>
              <p>The Princeton GEO Framework (Aggarwal et al., 2023) — the foundational academic paper on Generative Engine Optimization — identified the specific content signals that correlate with AI citation rates. Statistics addition: +40%. Source citation: +30–35%. Expert quotes: +30%. These are measured correlations across thousands of queries.</p>
              <p>Pages over 20,000 characters receive <strong className="text-foreground">4.3 times more AI citations</strong> than thin pages. Most marketing sites are under 3,000 characters per page. The gap is structural, not cosmetic.</p>
              <p className="text-foreground"><strong>grow.contact fixes the structural gap. In 48 hours. At a fixed price.</strong></p>
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
