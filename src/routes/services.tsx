import { createFileRoute } from "@tanstack/react-router";
import { Services } from "@/components/Services";
import { CompareSection } from "@/components/CompareSection";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/services")({
  component: ServicesPage,
  head: () => ({
    meta: [
      { title: "Services — Grow" },
      { name: "description", content: "Agent-native marketing sites, launch pages, and devtool hubs. Custom-coded, LLM-readable, fixed price." },
      { property: "og:title", content: "Services — Grow" },
      { property: "og:description", content: "Launch pages, marketing sites, and devtool hubs built agent-native — in 48 hours." },
      { property: "og:url", content: "https://grow.contact/services" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/services" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Web Design",
          name: "Agent-native web design",
          description:
            "Launch pages, marketing sites, and devtool hubs for AI/ML startups, agent platforms, and developer tools. Custom-coded, LLM-readable, 48-hour delivery.",
          provider: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
          areaServed: "Worldwide",
          url: "https://grow.contact/services",
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Grow tiers",
            itemListElement: [
              {
                "@type": "Offer",
                name: "Starter",
                price: "2400",
                priceCurrency: "USD",
                url: "https://grow.contact/pricing",
              },
              {
                "@type": "Offer",
                name: "Growth",
                price: "4800",
                priceCurrency: "USD",
                url: "https://grow.contact/pricing",
              },
            ],
          },
        }),
      },
    ],
  }),
});

function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="border-b border-border" aria-label="Services overview">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">// 03 Tiers</p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase">Services</h1>
            <p className="text-foreground mt-6 max-w-2xl text-base md:text-lg leading-relaxed">
              grow.contact ships agent-native marketing sites for AI startups, agent platforms, and developer tools — engineered so ChatGPT, Perplexity, Claude, and Google AI Overviews can cite your product. Three productized engagements: Agent-Native Website Build, Agent Readability Audit, Schema Optimization. Fixed price, fixed scope, 48-hour delivery.
            </p>
            <p className="text-muted-foreground mt-4 max-w-2xl text-sm leading-relaxed">
              Why this matters:{" "}
              <a href="https://allbusinessrealm.com/index.php/2026/04/30/the-83-rule-why-ai-overviews-skip-the-top-10-and-where-small-sites-are-quietly-winning/" rel="noopener" className="text-muted-foreground underline underline-offset-2 decoration-muted-foreground/30 hover:text-accent hover:decoration-accent transition-colors">83% of AI Overview citations come from pages outside the organic top 10</a>,{" "}
              <a href="https://grow.contact/check" rel="noopener" className="text-muted-foreground underline underline-offset-2 decoration-muted-foreground/30 hover:text-accent hover:decoration-accent transition-colors">73% of sites are silently excluded from AI citations</a> due to fixable technical issues, and{" "}
              <a href="https://arxiv.org/abs/2311.09735" rel="noopener" className="text-muted-foreground underline underline-offset-2 decoration-muted-foreground/30 hover:text-accent hover:decoration-accent transition-colors">pages over 20,000 characters receive 4.3× more AI citations</a> than thin pages (Princeton GEO framework).
            </p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-6">
              <time dateTime="2026-05-28">Last updated: May 2026</time>
            </p>
          </div>
        </section>
        <Services />
        <CompareSection />

        {/* Full Technical Specification */}
        <section className="border-t border-border" aria-label="Full technical specification">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// Full Technical Specification</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-12">What We Ship</h2>
            <div className="grid gap-px bg-border border border-border">
              {[
                ["Semantic HTML", "Every page delivered with <main> wrapping the primary content zone, <article> for standalone content, <section aria-label=\"...\"> for content regions, <nav> for navigation, <aside> for supplementary content. H1 is singular per page and descriptive. H2–H6 hierarchy never skips a level. No presentational divs wrapping semantic content."],
                ["JSON-LD", "Four schema types minimum on every build: Organization (with sameAs for brand disambiguation), Product or Service (with Offer, pricing, availability), FAQPage (matching visible FAQ content exactly), BreadcrumbList (navigation hierarchy). Additional types based on site type: SoftwareApplication and WebAPI for developer tools, Article with datePublished for blog pages, Person for founder authority signals. All entities nested — not flat."],
                ["llms.txt", "Spec-compliant llms.txt at site root: H1 matching your site title, blockquote summary of 2–3 sentences, H2 sections linking to Product, Documentation, Company, and Pricing pages. Brand disambiguation included. Linked from HTML <head> as a <link rel=\"alternate\"> tag."],
                ["llms-full.txt", "Full markdown dump of all site content at /llms-full.txt. Clean markdown only — no HTML tags, no navigation chrome, no footer boilerplate. Pages separated by ---. Token budget managed to stay under 50,000 tokens for marketing sites. Updated at each deployment."],
                ["robots.txt", "All eight AI crawlers explicitly allowed with correct User-agent strings. GPTBot and OAI-SearchBot separated (training vs. search retrieval). Meta-ExternalAgent blocked for training; FacebookBot allowed for search. Comments inline explaining each directive. Sitemap URL declared at the bottom."],
                ["OpenGraph", "og:title, og:description (factual, 120–155 characters, not clickbait), og:image (1200×630px), og:type, og:url. Twitter cards on all pages. og:description written as a factual statement — not a teaser. Citation quality is directly affected by how accurately og:description describes the page content."],
                ["RSS + Sitemap", "XML sitemap at /sitemap.xml with all pages, lastmod dates, and changefreq values. Atom RSS feed at /rss.xml with title, link, pubDate, and first-150-word description for each content page. RSS entry updated at each deployment to signal freshness to RAG pipelines."],
                ["Page Speed", "TTFB under 200ms. HTML payload under 1MB. LCP under 2.5s. All non-critical JavaScript deferred or lazy-loaded. No inline base64 images in HTML. External font preconnect declared."],
              ].map(([title, body]) => (
                <div key={title} className="bg-background p-6 md:p-8">
                  <p className="font-mono text-accent text-[11px] uppercase tracking-widest mb-3">{title} — What We Ship</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The 48-Hour Process */}
        <section className="border-t border-border bg-card/20" aria-label="The 48-hour process">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// The 48-Hour Process</p>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-12">Five Steps</h2>
            <div className="space-y-6">
              {[
                ["Step 1 — Brief", "Hours 0–2", "You send positioning doc, existing copy if any, reference sites, and brand assets. We extract: primary ICP, core value proposition, key technical differentiators, pricing structure, and the single primary action each page should drive. We build a creative brief in writing and share it before any design work starts. You confirm or correct. No assumptions."],
                ["Step 2 — Architecture", "Hours 2–6", "Before any visual design: site map, content schema, JSON-LD taxonomy, and H1–H6 hierarchy for every page. We decide which schema types each page needs, where the answer-first blocks go, which pages need FAQPage schema, and where llms.txt will link. Architecture is reviewed as a document — not a design mockup."],
                ["Step 3 — Design + Build", "Hours 6–36", "Full visual design and code implementation in parallel. Every component is coded — not a template with replaced text. The agent-readability layer is built alongside the visual layer, not bolted on afterward. This is the difference between a site that scores 100/100 and one that scores 60/100 with the same visual design."],
                ["Step 4 — Agent Layer", "Hours 36–44", "The final build pass: llms.txt and llms-full.txt written and tested, JSON-LD validated, robots.txt AI directives confirmed, RSS feed validated, page speed measured to TTFB targets. The agent-readability scan is run against the staging URL. If it does not hit 90+, we fix before handover."],
                ["Step 5 — Launch + Audit", "Hours 44–48", "Domain handover, DNS configuration, 14-day bug fix window. Final agent-readability score documented and shared. You receive: the live URL, the GitHub repository, the score report, and the Agent-Native Certified badge for your footer."],
              ].map(([title, hours, body]) => (
                <article key={title} className="border border-border p-6 md:p-8 bg-background">
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <p className="font-mono text-accent text-[11px] uppercase tracking-widest">{title}</p>
                    <span className="font-mono text-xs text-muted-foreground">{hours}</span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
