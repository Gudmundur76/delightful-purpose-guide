import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

const URL = "https://citation.is/guide/aeo-vs-geo-vs-seo";
const TITLE = "AEO vs GEO vs SEO: What's the Difference? (2026)";
const DESCRIPTION =
  "AEO vs GEO vs SEO compared in plain English: what each acronym means, what it optimizes for, which crawlers matter, and the one technical checklist that covers all three.";
const PUBLISHED = "2026-05-30";
const UPDATED = "2026-05-30";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What does AEO stand for?",
    a: "Answer Engine Optimization. AEO is the practice of structuring content so a search engine, voice assistant, or AI answer box returns it as the single direct answer — the featured snippet, the spoken response, the Google AI Overview pullquote.",
  },
  {
    q: "What does GEO stand for?",
    a: "Generative Engine Optimization. GEO is the practice of structuring a site so generative AI engines (ChatGPT, Perplexity, Claude, Gemini, Google AI Overviews) cite it inside their generated answers. It is broader than AEO because there is no single 'answer slot' — many sources are quoted in one response.",
  },
  {
    q: "Is GEO the same as AEO?",
    a: "No. AEO is older and Google-centric: it targets featured snippets, position zero, and voice answers. GEO is newer and engine-agnostic: it targets being cited in any generative answer, including ones that quote five sources at once. Pages built for GEO almost always win AEO too. The reverse is not always true.",
  },
  {
    q: "Does SEO still matter if I do GEO?",
    a: "Yes. Classic SEO drives the underlying signals (indexability, content depth, link graph) that AI engines reuse to decide who is trustworthy enough to quote. The technical layer also overlaps: fast SSR, valid schema.org, semantic HTML, and a clean sitemap help all three at once.",
  },
  {
    q: "Which one should I prioritize first?",
    a: "Fix the technical reachability layer that all three share — robots.txt that allows search and citation bots, server-side rendering, valid JSON-LD, llms.txt. Then write answer-first content with numbers, dates, and named entities in the first 50–70 words. That single playbook covers SEO, AEO, and GEO simultaneously.",
  },
];

export const Route = createFileRoute("/guide/aeo-vs-geo-vs-seo")({
  component: ComparePage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "aeo vs seo, geo vs seo, aeo vs geo, answer engine optimization, generative engine optimization, search engine optimization" },
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
        title: "AEO vs GEO vs SEO",
        kicker: "Grow Guide",
        sub: "What each acronym means, what it optimizes for, and the one checklist that covers all three.",
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
            { "@type": "ListItem", position: 3, name: "AEO vs GEO vs SEO", item: URL },
          ],
        }),
      },
    ],
  }),
});

const ROWS: { label: string; seo: string; aeo: string; geo: string }[] = [
  { label: "Stands for", seo: "Search Engine Optimization", aeo: "Answer Engine Optimization", geo: "Generative Engine Optimization" },
  { label: "Optimizes for", seo: "Ranking in the 10 blue links", aeo: "Being the single direct answer (featured snippet, voice, AI box)", geo: "Being cited inside a generated AI answer" },
  { label: "Read by", seo: "Humans scanning a results page", aeo: "Humans hearing or skimming one answer", geo: "An LLM composing a multi-source response" },
  { label: "Primary engines", seo: "Google, Bing", aeo: "Google snippets, Alexa, Siri, AI Overviews", geo: "ChatGPT, Perplexity, Claude, Gemini, AI Overviews" },
  { label: "Key crawlers", seo: "Googlebot, bingbot", aeo: "Googlebot, bingbot", geo: "OAI-SearchBot, PerplexityBot, ClaudeBot, Googlebot, bingbot" },
  { label: "Winning signal", seo: "Backlinks + on-page relevance", aeo: "Concise answer + FAQ schema", geo: "Front-loaded claim + entity graph + edge-cached SSR" },
  { label: "Failure mode", seo: "Page 2 of Google", aeo: "Snippet goes to a competitor", geo: "Cited by zero engines despite ranking" },
  { label: "Click outcome", seo: "User clicks your link", aeo: "User hears the answer, may not click", geo: "User reads the cited brand, may not click" },
];

function ComparePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <p className="font-mono text-xs uppercase tracking-widest text-accent mb-4">Guide · Published {PUBLISHED}</p>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] mb-6">
          AEO vs GEO vs SEO
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-3xl">
          Three acronyms, one underlying job: get your content in front of the people asking questions. They differ in <em>where</em> the answer is shown and <em>who</em> reads it first.
        </p>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">The 30-second version</h2>
          <ul className="space-y-3 text-foreground/85 leading-relaxed">
            <li><strong>SEO</strong> wins a slot in the ranked list of 10 blue links.</li>
            <li><strong>AEO</strong> wins the single answer box at the top of the page (or the voice assistant's reply).</li>
            <li><strong>GEO</strong> wins a citation inside a generated AI answer that may quote five sources at once.</li>
          </ul>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">Side-by-side comparison</h2>
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Dimension</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">SEO</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">AEO</th>
                  <th className="text-left p-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">GEO</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.label} className="border-t border-border align-top">
                    <td className="p-3 font-semibold">{r.label}</td>
                    <td className="p-3 text-foreground/80">{r.seo}</td>
                    <td className="p-3 text-foreground/80">{r.aeo}</td>
                    <td className="p-3 text-foreground/80">{r.geo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-6">The one checklist that covers all three</h2>
          <ol className="space-y-3 text-foreground/85 leading-relaxed list-decimal pl-5">
            <li>Allow search and citation bots in <code className="text-xs bg-muted px-1.5 py-0.5">robots.txt</code> — Googlebot, bingbot, OAI-SearchBot, PerplexityBot, ClaudeBot, FacebookBot. Blocking <code className="text-xs bg-muted px-1.5 py-0.5">GPTBot</code> does <em>not</em> block ChatGPT citations.</li>
            <li>Render every public route server-side. Most AI crawlers do not execute JavaScript.</li>
            <li>Ship valid <strong>JSON-LD</strong> per page type — Organization at the root, Article on posts, Product on commerce pages, FAQPage on Q&amp;A blocks.</li>
            <li>Publish <a href="/guide/llms-txt" className="text-accent hover:underline">/llms.txt</a> with a curated route list.</li>
            <li>Write the answer in the first 50–70 words. Numbers, dates, named entities — front-loaded.</li>
            <li>Edge-cache HTML so TTFB stays under 200ms. Crawlers timeout fast.</li>
          </ol>
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
            <li><Link to="/guide/llms-txt" className="text-accent hover:underline">→ llms.txt: complete spec + examples</Link></li>
            <li><Link to="/check" className="text-accent hover:underline">→ Run the free /check scanner on your URL</Link></li>
          </ul>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
