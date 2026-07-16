import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

const URL = "https://citation.is/guide/llms-txt";
const TITLE = "llms.txt: The Complete Spec + Examples (2026)";
const DESCRIPTION =
  "llms.txt is the LLM-era robots.txt + sitemap.xml — a curated markdown map that AI agents load as context. Complete spec, file structure, working examples, and how to validate it.";
const PUBLISHED = "2026-05-30";
const UPDATED = "2026-05-30";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is llms.txt?",
    a: "llms.txt is a plain markdown file served at the root of a website (/llms.txt) that lists the site's public routes with a short description each. It is designed to be loaded into an LLM's context window at inference time so the model can answer questions about the site without crawling every page.",
  },
  {
    q: "Is llms.txt the same as robots.txt?",
    a: "No. robots.txt tells crawlers what they may or may not fetch. llms.txt tells an LLM what's on the site and how to think about it — it is a curated map, not an access policy. Most sites need both.",
  },
  {
    q: "What's the difference between llms.txt and llms-full.txt?",
    a: "llms.txt is the short index — a list of routes with descriptions. llms-full.txt is the full content dump — every public page's markdown concatenated into one file. Use llms-full.txt only for docs-heavy sites where an agent benefits from loading the whole product reference at once.",
  },
  {
    q: "Do AI engines actually read llms.txt today?",
    a: "Adoption is uneven but growing. ChatGPT and Claude support loading it via tool use, Perplexity reads it when scraping, and Anthropic's Claude project ingestion accepts it natively. Even where it is not auto-fetched, the file documents the site's structure for any agent integration you build.",
  },
  {
    q: "Where do I put llms.txt?",
    a: "At the root of the domain — https://example.com/llms.txt. Serve it with Content-Type text/markdown or text/plain. Keep it under 100 KB so it fits comfortably in any model's context window.",
  },
  {
    q: "How do I validate llms.txt?",
    a: "Run the URL through the citation.is /check scanner — it tests presence, content-type, route coverage against your sitemap, and markdown validity in one pass. The official spec lives at llmstxt.org.",
  },
];

const EXAMPLE = `# Acme Robotics

> Industrial automation for warehouse fulfillment. We sell autonomous picking robots, conveyor integration, and the software stack that runs them.

Acme Robotics makes robots that pick and pack orders in warehouses. Our customers are mid-market 3PLs and DTC brands processing 10k–100k orders per month.

## Products

- [Picker R1](/products/picker-r1): Autonomous bin-picking robot, $48k, 18-month lead time.
- [Conveyor Bridge](/products/conveyor-bridge): Software-defined conveyor sortation, SaaS $2k/mo per zone.

## Docs

- [API reference](/docs/api): REST + WebSocket endpoints for fleet control.
- [Integrations](/docs/integrations): Shopify, NetSuite, Manhattan WMS.

## Company

- [About](/about): Founded 2021, Series B, 84 employees, HQ Reykjavík.
- [Careers](/careers): Open roles in robotics, ML, and field engineering.

## Contact

- Sales: sales@acmerobotics.com
- Support: support@acmerobotics.com
`;

export const Route = createFileRoute("/guide/llms-txt")({
  component: LlmsTxtGuide,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "llms.txt, llms-full.txt, llmstxt.org, LLM SEO, agent-native website, AI crawler, generative engine optimization" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: URL },
      { property: "og:type", content: "article" },
      { property: "article:published_time", content: PUBLISHED },
      { property: "article:modified_time", content: UPDATED },
      { property: "article:author", content: "Grow" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      ...ogImageMeta({
        title: "llms.txt: Complete Spec",
        kicker: "Grow Guide",
        sub: "The LLM-era robots.txt + sitemap.xml — curated markdown map that AI agents load as context.",
      }),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          url: URL,
          datePublished: PUBLISHED,
          dateModified: UPDATED,
          inLanguage: "en",
          author: { "@type": "Organization", name: "Grow", url: "https://citation.is/" },
          publisher: { "@type": "Organization", name: "Grow", url: "https://citation.is/" },
          mainEntityOfPage: URL,
        }),
      },
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
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://citation.is/" },
            { "@type": "ListItem", position: 2, name: "Guides", item: "https://citation.is/guide" },
            { "@type": "ListItem", position: 3, name: "llms.txt", item: URL },
          ],
        }),
      },
    ],
  }),
});

function LlmsTxtGuide() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-accent mb-4">Guide · Updated {UPDATED}</p>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] mb-6">
          llms.txt: the complete spec
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl">
          <strong className="text-foreground">llms.txt</strong> is a markdown file at <code className="text-sm bg-muted px-1.5 py-0.5">/llms.txt</code> that lists your site's public routes with a short description each. It is the LLM-era equivalent of <code className="text-sm bg-muted px-1.5 py-0.5">robots.txt</code> + <code className="text-sm bg-muted px-1.5 py-0.5">sitemap.xml</code> combined — a curated map that agents load into context before answering questions about your product.
        </p>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">Why llms.txt exists</h2>
          <p className="text-foreground/85 leading-relaxed mb-4">
            Generative AI agents have limited context windows and most cannot afford to crawl your entire site to answer one question. llms.txt gives them a single short file that answers two questions at once: <em>what is this site</em> and <em>where should I look for details</em>.
          </p>
          <p className="text-foreground/85 leading-relaxed">
            The spec was proposed by Jeremy Howard in September 2024 (<a href="https://llmstxt.org" rel="noopener" className="text-accent hover:underline">llmstxt.org</a>) and has been adopted by Anthropic's Claude project ingestion, Perplexity scraping, and the agent tool ecosystem.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">File structure</h2>
          <ol className="space-y-3 text-foreground/85 leading-relaxed list-decimal pl-5 mb-6">
            <li><strong>H1</strong> — the project name. One per file.</li>
            <li><strong>Blockquote</strong> — a one-sentence summary the LLM can quote verbatim.</li>
            <li><strong>One or more paragraphs</strong> — context that does not fit in the summary.</li>
            <li><strong>H2 sections</strong> — grouped lists of links. Each list item is <code className="text-xs bg-muted px-1.5 py-0.5">[Title](/path): description.</code></li>
            <li><strong>Optional "Optional" H2</strong> — links the agent may skip if context is tight.</li>
          </ol>
          <p className="text-foreground/85 leading-relaxed">
            Keep the file under 100 KB so it fits in any model's context. Serve it with <code className="text-xs bg-muted px-1.5 py-0.5">Content-Type: text/markdown</code> or <code className="text-xs bg-muted px-1.5 py-0.5">text/plain</code>.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">Working example</h2>
          <pre className="bg-muted/40 border border-border p-6 text-xs overflow-x-auto leading-relaxed">{EXAMPLE}</pre>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">llms.txt vs llms-full.txt</h2>
          <p className="text-foreground/85 leading-relaxed mb-4">
            <strong>llms.txt</strong> is the short index. <strong>llms-full.txt</strong> is the full content dump — every public page's markdown concatenated into one file, served at <code className="text-xs bg-muted px-1.5 py-0.5">/llms-full.txt</code>.
          </p>
          <p className="text-foreground/85 leading-relaxed">
            Use llms-full.txt only when the site is docs-heavy and an agent benefits from loading the whole product reference at once. For marketing sites the short index is enough — agents fetch individual routes when they need depth.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">Common mistakes</h2>
          <ul className="space-y-3 text-foreground/85 leading-relaxed list-disc pl-5">
            <li><strong>Listing private routes.</strong> llms.txt is public; never reference admin URLs, draft posts, or anything gated.</li>
            <li><strong>Out-of-sync with the sitemap.</strong> If a route exists in <code className="text-xs bg-muted px-1.5 py-0.5">sitemap.xml</code> but not in llms.txt, agents may miss it. Regenerate both from the same source.</li>
            <li><strong>HTML inside the file.</strong> llms.txt is markdown. Strip any HTML and use markdown links.</li>
            <li><strong>Wrong content-type.</strong> Some CDNs serve unknown extensions as <code className="text-xs bg-muted px-1.5 py-0.5">application/octet-stream</code>, which blocks inline rendering. Force text content-type.</li>
            <li><strong>Treating it as a replacement for robots.txt.</strong> It is not. llms.txt does not control crawler access; you still need robots.txt for that.</li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">FAQ</h2>
          <div className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q}>
                <h3 className="text-lg font-bold mb-2">{f.q}</h3>
                <p className="text-foreground/80 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border pt-12">
          <p className="text-sm text-muted-foreground mb-4">Related reading</p>
          <ul className="space-y-2">
            <li><Link to="/guide/generative-engine-optimization" className="text-accent hover:underline">→ The 2026 GEO guide</Link></li>
            <li><Link to="/guide/aeo-vs-geo-vs-seo" className="text-accent hover:underline">→ AEO vs GEO vs SEO</Link></li>
            <li><Link to="/llms" className="text-accent hover:underline">→ See citation.is's own llms.txt</Link></li>
            <li><Link to="/check" className="text-accent hover:underline">→ Validate your llms.txt with /check</Link></li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
