import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { ReadabilityScore } from "@/components/ReadabilityScore";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CompareSection } from "@/components/CompareSection";
import { TechSpecs } from "@/components/TechSpecs";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { MiniChecker } from "@/components/MiniChecker";
import { AgentViewPanel } from "@/components/AgentViewPanel";
import { getFaqItemsFn, getPageContentFn } from "@/lib/site/content.functions";
import { getOverviewStats } from "@/lib/check/stats.functions";
import { ogImageMeta } from "@/lib/seo/og";
import { VerifiabilityBadge } from "@/components/VerifiabilityBadge";
import { verifiableClaim, claimCitation } from "@/lib/seo/verifiable";

const HOME_DATE_MODIFIED = "2026-07-16";

const HOME_CLAIMS = [
  {
    id: "home-stat-83",
    value: "83%",
    label: "Share of AI Overview citations from pages outside the organic top 10 (allbusinessrealm analysis, April 2026)",
  },
  {
    id: "home-stat-73",
    value: "73%",
    label: "Sites silently excluded from AI citations due to fixable technical issues (grow.contact /check scanner, n=2,400+ sites, 2026)",
  },
  {
    id: "home-stat-527",
    value: "527%",
    label: "Year-over-year growth in AI-referred sessions, early 2025 (Search Engine Land, 2025)",
  },
  {
    id: "home-stat-48",
    value: "48%",
    label: "Share of all queries that trigger a Google AI Overview (Semrush AI Overview tracking, Q1 2026)",
  },
] as const;

const DEFAULT_FAQS: { q: string; a: string }[] = [
  { q: "Is grow.contact really free?", a: "Yes — the scanner, the standard, the playbooks, the leaderboard, the MCP server, the WordPress plugin, the browser extension, the CLI, and every data drop are free forever. No paywall, no trial, no upsell. Bring an account only if you want your scans saved to a dashboard." },
  { q: "What does grow.contact actually do?", a: "grow.contact is open infrastructure for AI search visibility. Point the scanner at any URL and get a 0–100 score against the Agent-Native Web Standard, a diff of what ChatGPT, Perplexity, Claude and Google AI Overviews see when they crawl the page, and a checklist of concrete fixes ordered by impact." },
  { q: "What is the Agent-Native Web Standard?", a: "A six-layer open specification for making a website legible to AI engines: semantic HTML, JSON-LD schema, llms.txt, an MCP server card, edge-cached static HTML, and a verifiability layer. Published under CC-BY, versioned like software, forkable on GitHub." },
  { q: "How is the scanner different from PageSpeed or Lighthouse?", a: "Lighthouse checks whether a browser can render your page. grow.contact checks whether an agent can cite it — robots.txt permissions for AI crawlers, JSON-LD validity, llms.txt presence, TTFB against the 1–5 second AI-crawler timeout, JavaScript-only content, verifiable claims, and MCP discoverability." },
  { q: "Can I self-host or fork it?", a: "Yes. The scanner, the standard docs, the WordPress plugin, the CLI, and the MCP server are open source. You can run the full stack on your own infrastructure or fork the standard and publish a variant. Attribution appreciated, not required." },
  { q: "How do I plug this into my site?", a: "Three paths, pick one: install the WordPress plugin for auto-fixes on save, run the CLI in CI to fail builds that drop below your threshold, or connect the MCP server to Claude/ChatGPT/Cursor and let the agent audit and fix pages itself." },
  { q: "Do you collect my data?", a: "The scanner fetches the URL you submit and stores the score plus a summary. It never stores full page bodies, never runs JavaScript against your users, and never sells anything. The database schema and retention policy are public." },
  { q: "Who maintains it?", a: "Started and maintained by Gudmundur Eyberg Kristjansson in Reykjavík, with pull requests and issue reports welcome from anyone who audits, cites, or ships against the standard." },
];

type FaqItem = { q: string; a: string };
type FaqRow = { question: string; answer: string };

export const Route = createFileRoute("/")({
  component: Index,

  loader: async ({ context }) => {
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
      { name: "description", content: "Free, open infrastructure for AI search visibility. Scan any URL, connect the MCP server, drop in the WordPress plugin. No paywall, no account required." },
      { property: "og:title", content: "grow.contact — Free, open infrastructure for AI search visibility" },
      {
        property: "og:description",
        content:
          "Open scanner, open standard, open MCP server, open WordPress plugin. Make your site cited by ChatGPT, Perplexity, Claude and Google AI. Free forever.",
      },
      { name: "twitter:title", content: "grow.contact — Free, open infrastructure for AI search visibility" },
      { name: "twitter:description", content: "Free scanner, free standard, free MCP server, free WordPress plugin. Get cited by ChatGPT, Perplexity, Claude and Google AI." },
      { property: "og:url", content: "https://grow.contact/" },
      ...ogImageMeta({
        title: "Free infrastructure for AI search visibility",
        kicker: "grow.contact",
        sub: "Open scanner · Open standard · Open MCP server · Open WordPress plugin.",
      }),
    ],

    links: [
      { rel: "canonical", href: "https://grow.contact/" },
    ],

    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              name: "grow.contact",
              url: "https://grow.contact/",
              description: "Free, open infrastructure for AI search visibility.",
            },
            {
              "@type": "SoftwareApplication",
              name: "grow.contact scanner",
              applicationCategory: "DeveloperApplication",
              operatingSystem: "Any",
              url: "https://grow.contact/check",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
              description: "Free scanner that scores any URL against the Agent-Native Web Standard.",
            },
            {
              "@type": "WebPage",
              "@id": "https://grow.contact/#webpage",
              url: "https://grow.contact/",
              name: "grow.contact — free open infrastructure for AI search visibility",
              dateModified: HOME_DATE_MODIFIED,
              mentions: HOME_CLAIMS.map((c) =>
                verifiableClaim({
                  id: c.id,
                  value: c.value,
                  label: c.label,
                  citation: claimCitation(c.id),
                  dateModified: HOME_DATE_MODIFIED,
                  unitCode: c.value.endsWith("%") ? "P1" : undefined,
                }),
              ),
            },
            {
              "@type": "FAQPage",
              "@id": "https://grow.contact/#quick-answers",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is an agent-native website?",
                  acceptedAnswer: { "@type": "Answer", text: "An agent-native website is a site engineered so AI engines (ChatGPT, Perplexity, Claude, Google AI Overviews) can read, cite, and link to it without rendering JavaScript. It ships semantic HTML, JSON-LD schema, an llms.txt file, an MCP server card, and edge-cached static HTML — the six layers of the open Agent-Native Web Standard." },
                },
                {
                  "@type": "Question",
                  name: "Do I need to pay anything to use grow.contact?",
                  acceptedAnswer: { "@type": "Answer", text: "No. The scanner, the standard docs, the playbooks, the leaderboard, the WordPress plugin, the CLI, the browser extension, the MCP server, and every data drop are free forever. There is no paid tier, no trial, and no billing surface anywhere on this site." },
                },
                {
                  "@type": "Question",
                  name: "Why are 73% of sites excluded from AI citations?",
                  acceptedAnswer: { "@type": "Answer", text: "Per the /check scanner dataset (n=2,400+ sites audited as of June 2026), 73% of sites fail at least one of: robots.txt blocking citation bots, JavaScript-only rendering (23% parse success vs 94% for static HTML), missing JSON-LD, or TTFB above the 1–5 second AI-crawler timeout. Each is a small, mechanical fix." },
                },
                {
                  "@type": "Question",
                  name: "Can I connect this to Claude, ChatGPT, or Cursor?",
                  acceptedAnswer: { "@type": "Answer", text: "Yes. grow.contact ships an OAuth-protected MCP server at /mcp with tools for scanning URLs, extracting claims, and reading the standard. Any MCP-compatible assistant (Claude, ChatGPT, Cursor, Codex, Codeium) can connect in one click and act on your behalf." },
                },
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
      "%c⚡ grow.contact — free & open. No paywall, no upsell.",
      "color:#22d3ee;font-family:monospace;font-weight:bold;font-size:13px",
    );
    console.log(
      "%c  > curl https://grow.contact/api/public/scan?url=YOUR_SITE",
      "color:#64748b;font-family:monospace;font-size:11px",
    );
  }, []);

  const fetchFaq = useServerFn(getFaqItemsFn);
  const fetchStats = useServerFn(getOverviewStats);
  const { data: faqData } = useQuery({ queryKey: ["faq-items"], queryFn: () => fetchFaq(), initialData: loaderData.faqData });
  const { data: stats = null } = useQuery({
    queryKey: ["overview-stats", 7],
    queryFn: () => fetchStats({ data: { days: 7 } }),
  });

  const faqItems = (faqData && faqData.length > 0)
    ? faqData.map((d: FaqRow) => ({ q: d.question, a: d.answer }))
    : DEFAULT_FAQS;

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
                  // Free & open infrastructure
                </p>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-balance leading-[0.95] mb-6">
                  Make your site <span className="text-muted-foreground">citable</span>
                  <br />
                  by <span className="italic text-accent">AI engines.</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6 max-w-xl">
                  grow.contact is open infrastructure for AI search visibility.
                  Scan any URL against the Agent-Native Web Standard, connect the MCP server to your assistant,
                  and drop the WordPress plugin into your site. No paywall. No account required. No upsell.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-10 max-w-xl">
                  Why it matters:{" "}
                  <a href="https://allbusinessrealm.com/index.php/2026/04/30/the-83-rule-why-ai-overviews-skip-the-top-10-and-where-small-sites-are-quietly-winning/" rel="noopener" className="text-muted-foreground underline underline-offset-2 decoration-muted-foreground/30 hover:text-accent hover:decoration-accent transition-colors">
                    <VerifiabilityBadge id="home-stat-83" citation={claimCitation("home-stat-83")} dateModified={HOME_DATE_MODIFIED} showBadge={false}>83%</VerifiabilityBadge> of AI Overview citations come from pages outside the organic top 10
                  </a>,{" "}
                  <Link to="/check" className="text-muted-foreground underline underline-offset-2 decoration-muted-foreground/30 hover:text-accent hover:decoration-accent transition-colors">
                    <VerifiabilityBadge id="home-stat-73" citation={claimCitation("home-stat-73")} dateModified={HOME_DATE_MODIFIED} showBadge={false}>73%</VerifiabilityBadge> of sites are quietly excluded by fixable technical issues
                  </Link>, and{" "}
                  <a href="https://searchengineland.com/ai-traffic-up-seo-rewritten-459954" rel="noopener" className="text-muted-foreground underline underline-offset-2 decoration-muted-foreground/30 hover:text-accent hover:decoration-accent transition-colors">
                    AI-referred sessions grew <VerifiabilityBadge id="home-stat-527" citation={claimCitation("home-stat-527")} dateModified={HOME_DATE_MODIFIED} showBadge={false}>527%</VerifiabilityBadge> YoY in early 2025
                  </a>.
                </p>

                <div className="flex flex-wrap gap-4 items-center">
                  <Link
                    to="/check"
                    className="group inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
                  >
                    Run Free Scan
                    <span className="font-mono text-[10px] opacity-70 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                  <Link
                    to="/standard"
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2"
                  >
                    Read the Standard →
                  </Link>
                  <Link
                    to="/mcp-server"
                    className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors px-2"
                  >
                    Connect via MCP →
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

        {/* What you get — free tools grid */}
        <section className="border-t border-border" aria-label="Free tools">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// What you get, free</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-3">Everything, no paywall</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-10 max-w-2xl">
              Every tool below runs against the same Agent-Native Web Standard. Pick the surface that fits your workflow — the scanner in a browser, the CLI in CI, the plugin on WordPress, or the MCP server inside your AI assistant.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
              {[
                { to: "/check", kicker: "Tool", title: "Free Scanner", body: "Point it at any URL. Get a 0–100 score, a diff of what agents see, and a prioritised fix list in under 30 seconds." },
                { to: "/playground", kicker: "Tool", title: "Playground", body: "Try every MCP tool live in the browser. No install, no key — just prompts and results." },
                { to: "/mcp-server", kicker: "Protocol", title: "MCP Server", body: "Connect Claude, ChatGPT, Cursor, or Codex. Let the agent scan pages and apply fixes itself." },
                { to: "/extension", kicker: "Tool", title: "Browser Extension", body: "See any page's agent-readability score inline as you browse. Free for Chrome and Firefox." },
                { to: "/cli", kicker: "Tool", title: "CLI", body: "Fail builds that drop below your threshold. Install with one command, no config required." },
                { to: "/tools/robots-checker", kicker: "Tool", title: "robots.txt Checker", body: "Verify that AI citation bots (GPTBot, PerplexityBot, ClaudeBot, Google-Extended) can actually reach you." },
                { to: "/standard", kicker: "Standard", title: "Agent-Native Web Standard", body: "The six-layer open spec. Read it, cite it, fork it — published under CC-BY, versioned like software." },
                { to: "/playbooks", kicker: "Docs", title: "Playbooks", body: "Step-by-step guides for shipping structured data, llms.txt, MCP servers, and verifiable claims." },
                { to: "/leaderboard", kicker: "Data", title: "Leaderboard", body: "Live scores for 2,400+ audited sites across AI, devtools, and agent platforms. Free to browse and query." },
              ].map((c) => (
                <Link key={c.to} to={c.to} className="bg-background p-6 md:p-8 group hover:bg-card/40 transition-colors">
                  <p className="font-mono text-accent text-[11px] uppercase tracking-widest mb-3">// {c.kicker}</p>
                  <p className="font-bold uppercase tracking-tighter text-lg mb-2 group-hover:text-accent transition-colors">{c.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{c.body}</p>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-4 inline-block group-hover:text-accent transition-colors">Open →</span>
                </Link>
              ))}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
              <time dateTime={HOME_DATE_MODIFIED}>Last updated: {HOME_DATE_MODIFIED}</time> · every tool free forever, no card required
            </p>
          </div>
        </section>

        {/* Answer-first quick answers */}
        <section className="border-t border-border bg-card/10" aria-label="Quick answers">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
            <div className="flex items-baseline justify-between flex-wrap gap-3 mb-8">
              <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">// Quick Answers</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <time dateTime={HOME_DATE_MODIFIED}>Last updated: {HOME_DATE_MODIFIED}</time> · refreshed weekly
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
              {[
                {
                  q: "What is an agent-native website?",
                  a: "An agent-native website is a site engineered so AI engines (ChatGPT, Perplexity, Claude, Google AI Overviews) can read, cite, and link to it without rendering JavaScript. It ships semantic HTML, JSON-LD schema, an llms.txt file, an MCP server card, and edge-cached static HTML — the six layers of the open Agent-Native Web Standard.",
                },
                {
                  q: "Do I need to pay anything to use grow.contact?",
                  a: "No. The scanner, the standard docs, the playbooks, the leaderboard, the WordPress plugin, the CLI, the browser extension, the MCP server, and every data drop are free forever. There is no paid tier, no trial, and no billing surface anywhere on this site.",
                },
                {
                  q: "Why are 73% of sites excluded from AI citations?",
                  a: "Per the /check scanner dataset (n=2,400+ sites audited as of June 2026), 73% of sites fail at least one of: robots.txt blocking citation bots, JavaScript-only rendering (23% parse success vs 94% for static HTML), missing JSON-LD, or TTFB above the 1–5 second AI-crawler timeout. Each is a small, mechanical fix.",
                },
                {
                  q: "Can I connect this to Claude, ChatGPT, or Cursor?",
                  a: "Yes. grow.contact ships an OAuth-protected MCP server at /mcp with tools for scanning URLs, extracting claims, and reading the standard. Any MCP-compatible assistant (Claude, ChatGPT, Cursor, Codex, Codeium) can connect in one click and act on your behalf.",
                },
              ].map((item) => (
                <article key={item.q} className="bg-background p-6 md:p-8">
                  <h2 className="font-bold uppercase tracking-tighter text-lg md:text-xl mb-3 text-balance">{item.q}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                </article>
              ))}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
              All stats attributed: /check scanner internal benchmark (n=2,400+), 2026.
            </p>
          </div>
        </section>

        <SocialProofStrip />
        <TechSpecs />
        <AgentViewPanel />
        <CompareSection />

        {/* FAQ */}
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
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
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-4">
                <span className="text-accent">✓</span> FAQPage schema validated · <span className="text-accent">✓</span> answer-first structure · <time dateTime={HOME_DATE_MODIFIED}>updated {HOME_DATE_MODIFIED}</time>
              </p>
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
                to="/check"
                className="group inline-flex items-center gap-3 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
              >
                Scan Your Site (Free)
                <span className="font-mono text-[10px] opacity-70 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <Link to="/faq" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
                See all FAQ →
              </Link>
            </div>
          </div>
        </section>

        {/* Deep dives */}
        <section className="border-t border-border bg-card/20" aria-label="Deep dives">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// Go deeper</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-3">The Full Stack</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-10 max-w-2xl">
              Every claim on this site is documented on its own page — the standard, the crawler matrix, the scoring methodology, the citation research. Read, cite, and fork whatever you need.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
              {[
                { to: "/standard", kicker: "Standard", title: "Agent-Native Web Standard", body: "The six-layer open spec. CC-BY, versioned, forkable." },
                { to: "/crawlers", kicker: "Matrix", title: "8 AI Systems, 8 Crawlers", body: "How ChatGPT, Perplexity, Claude, Gemini, Copilot and others crawl and cite." },
                { to: "/guide/generative-engine-optimization", kicker: "Guide", title: "GEO vs SEO", body: "What generative engine optimization is, and what moves AI citations." },
                { to: "/guide/aeo-vs-geo-vs-seo", kicker: "Guide", title: "AEO vs GEO vs SEO", body: "Side-by-side comparison of the three optimisation frameworks." },
                { to: "/guide/llms-txt", kicker: "Guide", title: "llms.txt Spec", body: "The complete specification with examples and validation rules." },
                { to: "/v-score", kicker: "Method", title: "How the Score Works", body: "Five weighted signals — semantic HTML, JSON-LD, llms.txt, citability, speed." },
                { to: "/leaderboard", kicker: "Data", title: "Live Leaderboard", body: "Scores for 2,400+ audited sites across AI, devtools, and agent platforms." },
                { to: "/research", kicker: "Research", title: "Reports & Data Drops", body: "Quarterly report, monthly citation index, playbooks, glossary — every artifact in one hub." },
                { to: "/blog", kicker: "Journal", body: "Field notes on AI search visibility, updates to the standard, and post-mortems.", title: "Journal" },
              ].map((c) => (
                <Link key={c.to} to={c.to} className="bg-background p-6 md:p-8 group hover:bg-card/40 transition-colors">
                  <p className="font-mono text-accent text-[11px] uppercase tracking-widest mb-3">// {c.kicker}</p>
                  <p className="font-bold uppercase tracking-tighter text-lg mb-2 group-hover:text-accent transition-colors">{c.title}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{c.body}</p>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-4 inline-block group-hover:text-accent transition-colors">Read →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
