import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowRight, Check } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

const URL = "https://grow.contact/guide/generative-engine-optimization";
const TITLE = "Generative Engine Optimization: The 2026 Guide (GEO)";
const DESCRIPTION =
  "Generative Engine Optimization (GEO) is the practice of structuring a website so large language models cite it in answers. This guide is the working standard: definitions, technical checklist, per-engine playbook, and how to measure it.";
const PUBLISHED = "2026-05-24";
const UPDATED = "2026-05-24";

const TOC = [
  { id: "what-is-geo", label: "What GEO is (and isn't)" },
  { id: "why-now", label: "Why it matters in 2026" },
  { id: "five-pillars", label: "The five pillars" },
  { id: "technical-checklist", label: "Technical checklist" },
  { id: "per-engine", label: "Per-engine playbook" },
  { id: "content-rules", label: "Content rules that earn citations" },
  { id: "common-mistakes", label: "Six mistakes that kill citations" },
  { id: "measure", label: "How to measure GEO" },
  { id: "geo-vs-seo", label: "GEO vs SEO vs AEO" },
  { id: "faq", label: "FAQ" },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Generative Engine Optimization in one sentence?",
    a: "GEO is the practice of structuring a website's markup, content, and crawlability so generative AI engines like ChatGPT, Perplexity, Google AI Overviews, Claude, and Gemini cite it by name when answering user questions.",
  },
  {
    q: "Is GEO different from SEO?",
    a: "Yes. SEO optimizes for a ranked list of blue links read by humans. GEO optimizes for being quoted inside a generated answer read by no one — the citation is the click. 83% of AI citations come from outside the organic top 10, so high SEO rank does not guarantee GEO performance.",
  },
  {
    q: "What is llms.txt?",
    a: "A markdown file at the root of your site (/llms.txt) that lists your public routes with a short description each. It is the LLM-era equivalent of robots.txt + sitemap.xml combined — a curated map that inference-time agents can load as context. Spec lives at llmstxt.org.",
  },
  {
    q: "Will blocking GPTBot stop ChatGPT from citing my site?",
    a: "No, and this is the most expensive mistake teams make. GPTBot is OpenAI's training crawler. ChatGPT's live citations come from OAI-SearchBot and ChatGPT-User. You can block training while still being cited in answers — and you usually should.",
  },
  {
    q: "How fast do AI crawlers expect a response?",
    a: "Most generative engines timeout between 1 and 5 seconds. Target TTFB under 200ms, HTML under 1MB, first contentful paint under 1.5s on mobile. Client-side-only content is invisible to most agent crawlers because they do not execute JavaScript.",
  },
  {
    q: "Does JSON-LD actually help AI engines?",
    a: "Yes, in two ways. Search-derived engines (Google AI Overviews, Bing/Copilot) use it directly. LLMs that scrape pages use the typed entity graph to verify facts and disambiguate brand vs product vs person, which raises citation confidence.",
  },
  {
    q: "How long does it take to see GEO results?",
    a: "Citations from Perplexity and ChatGPT typically appear within 2–6 weeks of shipping a compliant site. Google AI Overviews lags 4–12 weeks. Gemini weights freshness heavily, so new content can appear within days.",
  },
  {
    q: "Do I need a separate strategy per engine?",
    a: "No. 80% of the work is shared: semantic HTML, JSON-LD, llms.txt, fast SSR, answer-first content. The remaining 20% is engine-specific (listicles for Perplexity, FAQ schema for AIO, technical docs for Claude, freshness for Gemini).",
  },
];

export const Route = createFileRoute("/guide/generative-engine-optimization")({
  component: GeoGuidePage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "generative engine optimization, GEO, AI SEO, LLM citations, llms.txt, ChatGPT SEO, Perplexity SEO, AI Overviews, agent-native website" },
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
        title: "Generative Engine Optimization: The 2026 Guide (GEO)",
        kicker: "Grow",
        sub: "Generative Engine Optimization (GEO) is the practice of structuring a website so large language models cite it in answers. This guide is the working standard: definitions, technical checklist, per-engine playbook, and how to measure it.",
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
          author: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
          publisher: { "@type": "Organization", name: "Grow", url: "https://grow.contact/" },
          mainEntityOfPage: URL,
          about: [
            { "@type": "Thing", name: "Generative Engine Optimization" },
            { "@type": "Thing", name: "Large Language Models" },
            { "@type": "Thing", name: "Search Engine Optimization" },
          ],
          keywords:
            "generative engine optimization, GEO, llms.txt, AI Overviews, ChatGPT, Perplexity, Claude, Gemini, JSON-LD",
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
            { "@type": "ListItem", position: 1, name: "Home", item: "https://grow.contact/" },
            { "@type": "ListItem", position: 2, name: "Guides", item: "https://grow.contact/guide" },
            { "@type": "ListItem", position: 3, name: "Generative Engine Optimization", item: URL },
          ],
        }),
      },
    ],
  }),
});

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase mt-20 mb-6"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xl font-bold mt-10 mb-3">{children}</h3>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-foreground/85 leading-relaxed mb-4">{children}</p>;
}

function GeoGuidePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <header className="border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
            <nav aria-label="Breadcrumb" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
              <Link to="/" className="hover:text-accent">Home</Link>
              <span className="mx-2">/</span>
              <span>Guide</span>
              <span className="mx-2">/</span>
              <span className="text-foreground">Generative Engine Optimization</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter uppercase leading-[0.95] mb-8">
              Generative Engine Optimization: <span className="text-accent">the 2026 guide</span>
            </h1>
            <p className="text-xl text-foreground/85 leading-snug max-w-3xl mb-6">
              Generative Engine Optimization (GEO) is the practice of structuring a website so large
              language models cite it in answers. ChatGPT, Perplexity, Google AI Overviews, Claude, and
              Gemini now decide what 48% of search queries look like. This guide is the working
              standard we ship against: definitions, the five technical pillars, a per-engine
              playbook, the six mistakes that kill citations, and how to measure the whole thing.
            </p>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Published {PUBLISHED} · Updated {UPDATED} · ~14 min read
            </div>
          </div>
        </header>

        {/* TOC */}
        <aside aria-label="Table of contents" className="border-b border-border bg-muted/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              Contents
            </div>
            <ol className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {TOC.map((t, i) => (
                <li key={t.id}>
                  <a href={`#${t.id}`} className="hover:text-accent transition-colors">
                    <span className="text-muted-foreground font-mono mr-2">{String(i + 1).padStart(2, "0")}</span>
                    {t.label}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </aside>

        <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          {/* What is GEO */}
          <section>
            <H2 id="what-is-geo">What GEO is (and isn&apos;t)</H2>
            <P>
              <strong>Generative Engine Optimization</strong> is the discipline of preparing a website
              to be quoted — by name, with a link — inside answers produced by generative AI engines.
              The unit of success is a <em>citation</em>: the moment ChatGPT, Perplexity, Google AI
              Overviews, Claude, or Gemini names your site as a source while answering a user&apos;s
              question.
            </P>
            <P>
              It is <strong>not</strong> a rebrand of SEO. Classical SEO optimizes for a ranked list of
              blue links a human reads, clicks, and scrolls through. GEO optimizes for being quoted
              inside a generated answer the user may never click through. According to a widely-cited
              2025 BrightEdge analysis,{" "}
              <strong>83% of AI citations come from URLs outside the organic top 10</strong>. Ranking
              first is no longer the same job as being cited first.
            </P>
            <P>
              It is also not the same as AEO (Answer Engine Optimization), which is the narrower
              practice of formatting content for featured-snippet-style direct answers. AEO is a
              subset of GEO. GEO covers the whole pipeline — reachability, markup, content, freshness,
              entity graph, per-engine quirks.
            </P>
          </section>

          {/* Why now */}
          <section>
            <H2 id="why-now">Why it matters in 2026</H2>
            <P>
              Four numbers explain the urgency. Google AI Overviews now fire on{" "}
              <strong>48% of all search queries</strong>. AI-referred traffic is up{" "}
              <strong>+527% year-over-year</strong>. The GEO services market is on track to grow from{" "}
              <strong>$886M in 2025 to $7.3B by 2031</strong>{" "}
              (a 34% CAGR, per Verified Market Reports). And{" "}
              <strong>73% of websites are silently excluded from AI citations</strong>{" "}
              because of fixable technical issues — usually a misconfigured robots.txt, a WAF that
              challenges bot UAs, or content that renders only after JavaScript executes.
            </P>
            <P>
              The asymmetry: the first three signals reward a marketing investment; the fourth is
              purely an engineering bug. Most of the citation gap on most sites is not a content
              problem. It is a reachability problem. Fix reachability first.
            </P>
          </section>

          {/* Five pillars */}
          <section>
            <H2 id="five-pillars">The five pillars</H2>
            <P>
              Every GEO program reduces to five measurable dimensions. These are the same five our
              free <Link to="/check" className="underline decoration-accent underline-offset-2">/check scanner</Link>{" "}
              scores out of 100. Pass threshold for production is 90.
            </P>
            <ol className="space-y-6 my-8">
              {[
                {
                  n: "1",
                  title: "Semantic HTML",
                  body: "Landmark elements (<main>, <nav>, <header>, <footer>, <article>, <section>), exactly one <h1> per page, sane heading order, alt text on every image. Crawlers that don't execute JavaScript read the DOM you ship — div soup is invisible to them.",
                },
                {
                  n: "2",
                  title: "JSON-LD structured data",
                  body: "Typed schema.org entities per page: Organization or WebSite at the root, then Article on posts, Product on commerce pages, FAQPage on FAQ blocks, BreadcrumbList on deep routes. Validates the entity graph and disambiguates brand vs product vs person — which is what raises citation confidence.",
                },
                {
                  n: "3",
                  title: "llms.txt",
                  body: "A curated markdown file at the root of the site (/llms.txt) listing public routes with short descriptions. Inference-time agents load it as context. Spec: llmstxt.org. Keep it in sync with sitemap.xml — divergence is a smell.",
                },
                {
                  n: "4",
                  title: "Citability",
                  body: "Every page answers its implicit question in the first 50–70 words. Numbers, dates, named entities, claims that are quotable in isolation. No 'Welcome to our site.' This is where almost all sites that pass the first three pillars fail.",
                },
                {
                  n: "5",
                  title: "Speed",
                  body: "TTFB under 200ms, HTML under 1MB, first contentful paint under 1.5s on mobile, first-paint JS under 180KB gzipped. Generative crawlers timeout between 1 and 5 seconds — a slow site is functionally a blocked site.",
                },
              ].map((p) => (
                <li key={p.n} className="border-l-2 border-accent pl-6">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                    Pillar {p.n}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{p.title}</h3>
                  <p className="text-foreground/85 leading-relaxed">{p.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Technical checklist */}
          <section>
            <H2 id="technical-checklist">Technical checklist</H2>
            <P>
              The pre-flight every site must pass before any content work begins. If a single item in
              the first block fails, nothing downstream matters.
            </P>

            <H3>Reachability (pre-flight)</H3>
            <ul className="space-y-3 mb-8">
              {[
                "curl -A \"GPTBot\" https://yoursite/ returns 200 with the core HTML present without JavaScript.",
                "robots.txt does not Disallow: / for any allowed search/citation bot.",
                "No Cloudflare/WAF challenge intercepts known LLM crawler UAs (check 'Bot Fight Mode' settings).",
                "TLS valid, no mixed-content warnings, no infinite redirects.",
                "Sitemap.xml exists, returns 200, lists every public route.",
              ].map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/85">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>

            <H3>robots.txt — the bot matrix</H3>
            <P>
              The single most common GEO own-goal is blocking the wrong bot. The rule:{" "}
              <strong>allow search/citation bots, optionally block training-only bots</strong>. They
              are different user agents.
            </P>
            <div className="overflow-x-auto border border-border my-6">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">User-Agent</th>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Purpose</th>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Googlebot", "Search + AI Overviews", "Allow"],
                    ["OAI-SearchBot", "ChatGPT live citations", "Allow"],
                    ["ChatGPT-User", "User-triggered ChatGPT fetch", "Allow"],
                    ["PerplexityBot", "Perplexity citations", "Allow"],
                    ["ClaudeBot / Claude-SearchBot", "Claude citations", "Allow"],
                    ["bingbot", "Bing + Microsoft Copilot", "Allow"],
                    ["FacebookBot", "Meta AI citations", "Allow"],
                    ["GPTBot", "OpenAI model training", "Block if opting out"],
                    ["Google-Extended", "Google model training", "Block if opting out"],
                    ["anthropic-ai", "Anthropic training", "Block if opting out"],
                    ["Meta-ExternalAgent", "Meta training (aggressive)", "Block if opting out"],
                    ["CCBot", "Common Crawl", "Block if opting out"],
                  ].map(([ua, purpose, action], i) => (
                    <tr key={i} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{ua}</td>
                      <td className="px-4 py-3 text-foreground/85">{purpose}</td>
                      <td className={`px-4 py-3 font-bold ${action === "Allow" ? "text-accent" : "text-muted-foreground"}`}>{action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <H3>Per-route head/meta</H3>
            <P>
              Every public route ships a unique title, meta description, og:title, og:description, and
              og:url. Canonical lives on leaf routes only — never on a layout root, because most
              frameworks concatenate link tags without dedup and emit two canonicals (invalid SEO).
              JSON-LD goes inline per route, typed to the page (Article on posts, Product on commerce,
              FAQPage on FAQ blocks, BreadcrumbList on anything deeper than one level).
            </P>

            <H3>Performance budget</H3>
            <P>
              SSR is mandatory. No critical content rendered only on the client. Edge-cache the HTML
              of static and semi-static routes (Cloudflare, Vercel Edge, Fastly) with{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5">s-maxage=300, stale-while-revalidate=600</code>{" "}
              or similar. The killer optimization on most modern SSR stacks is overriding the
              default <code className="text-xs bg-muted px-1.5 py-0.5">cache-control: no-cache</code>{" "}
              header on the homepage HTML so the edge can serve it at sub-100ms TTFB.
            </P>
          </section>

          {/* Per-engine */}
          <section>
            <H2 id="per-engine">Per-engine playbook</H2>
            <P>
              Eighty percent of GEO is shared. The remaining twenty percent is engine-specific. The
              compressed version:
            </P>
            <div className="grid sm:grid-cols-2 gap-4 my-8">
              {[
                { name: "ChatGPT", ua: "OAI-SearchBot", body: "Front-load claims in the first 30% of the text. Cites brands frequently without a linked URL — being named is the win. Reward: clean entity graph in JSON-LD." },
                { name: "Perplexity", ua: "PerplexityBot", body: "Listicle format wins. Bursty crawler — can hit 240 req/min on viral queries — so edge caching is mandatory. Rewards 'Information Gain' (claims that aren't already in the top 10)." },
                { name: "Google AIO", ua: "Googlebot", body: "Answer-first 50–70 words. FAQ + HowTo schema directly feed Overview boxes. Heavy E-E-A-T weighting. Quarterly content refresh keeps citation share." },
                { name: "Claude", ua: "ClaudeBot", body: "Depth-first crawler — 1,800 hits/day typical. Loves /docs, /api, technical reference pages. Long, authoritative content outperforms short marketing." },
                { name: "Gemini", ua: "Googlebot-Gemini", body: "Freshness dominant: content under 90 days old gets +12% citation share vs AIO baseline. Original research + numbers + dates wins." },
                { name: "Meta AI", ua: "FacebookBot", body: "Allow FacebookBot for citations, block Meta-ExternalAgent for training. Different bots, different consent. Conflating them is a top-three mistake." },
              ].map((e) => (
                <div key={e.name} className="border border-border p-5">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">{e.ua}</div>
                  <div className="font-bold text-lg mb-2">{e.name}</div>
                  <p className="text-sm text-foreground/85 leading-relaxed">{e.body}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Content rules */}
          <section>
            <H2 id="content-rules">Content rules that earn citations</H2>
            <P>
              Once reachability and markup are clean, content decides whether the page is ever quoted.
              The pattern across thousands of cited URLs:
            </P>
            <ul className="space-y-3 my-6">
              {[
                { k: "Answer first", v: "The first 50–70 words answer the page's implicit question — no preamble, no welcome, no scene-setting." },
                { k: "Information Gain", v: "Make at least one claim, number, or framing the top 10 results don't already make. Engines reward novelty." },
                { k: "Quotable in isolation", v: "Every paragraph should make sense if pasted alone into an answer. Avoid 'as we discussed above.'" },
                { k: "Numbers, dates, entities", v: "Citation-worthy text is dense with specifics. 'Most teams' loses to '73% of teams in our May 2026 audit of 1,400 sites.'" },
                { k: "Listicle scannability", v: "Ordered or unordered lists win on Perplexity and AIO. Title each item with the takeaway, not the topic." },
                { k: "Freshness signals", v: "datePublished + dateModified in both visible copy and JSON-LD. Gemini and Perplexity especially weight this." },
                { k: "Defined jargon", v: "Every technical term gets a 'which means…' clause in the same sentence. Undefined jargon is uncitable to general audiences." },
              ].map((c, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground/85">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-1.5" />
                  <span><strong className="text-foreground">{c.k}.</strong> {c.v}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Common mistakes */}
          <section>
            <H2 id="common-mistakes">Six mistakes that kill citations</H2>
            <ol className="space-y-6 my-6 list-decimal pl-6 marker:text-accent marker:font-bold">
              <li>
                <strong>Blocking GPTBot and assuming ChatGPT is now blocked.</strong> GPTBot is the
                training crawler. ChatGPT cites from OAI-SearchBot and ChatGPT-User. Block the wrong
                one and you kill visibility while preserving training exposure — the exact inverse of
                what most teams want.
              </li>
              <li>
                <strong>Client-only rendering of critical content.</strong> If view-source on the page
                doesn&apos;t contain the H1, hero copy, or pricing, neither does the agent crawler.
                Most LLM crawlers do not execute JavaScript.
              </li>
              <li>
                <strong>Hidden pricing.</strong> If the dollar figure isn&apos;t in scrapeable text on
                a pricing page, in an FAQ answer, and in Product JSON-LD <code className="text-xs bg-muted px-1.5 py-0.5">offers.price</code>,
                the AI either dodges the question or recommends a competitor that does publish.
              </li>
              <li>
                <strong>Empty or live-only social proof.</strong> &quot;No data yet&quot; placeholders
                and pure live-stat widgets read as &quot;no track record.&quot; Ship narrative case
                studies as static HTML; let live numbers supplement, never replace.
              </li>
              <li>
                <strong>Ambiguous logo strips.</strong> A row of vendor logos with no caption is read
                as a customer claim. Caption it: <em>&quot;Optimized for these AI engines — not
                customer logos.&quot;</em> Reserve &quot;customer&quot; framing for verifiable logos.
              </li>
              <li>
                <strong>One title and description, reused across every route.</strong> If{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5">/about</code>,{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5">/pricing</code>, and{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5">/contact</code> all carry the
                home page&apos;s meta, every route looks identical to a crawler. Per-route head/meta
                is table stakes, not polish.
              </li>
            </ol>
          </section>

          {/* Measure */}
          <section>
            <H2 id="measure">How to measure GEO</H2>
            <P>
              The honest answer: measurement is still early, but four signals matter and are all
              accessible today.
            </P>
            <ul className="space-y-4 my-6">
              <li>
                <strong>Server-log analysis.</strong> Filter access logs for the bot UAs in the matrix
                above. Track requests/day per UA. A healthy site sees Googlebot daily, OAI-SearchBot
                multiple times per week, PerplexityBot in bursts, ClaudeBot consistently on /docs.
              </li>
              <li>
                <strong>Citation tracking tools.</strong> Profound, Peec, SE Visible, Rankscale,
                LLMrefs, and GetCito poll a fixed prompt set across engines and report whether you were
                cited. Useful for trend lines; only meaningful once the site is technically passing.
                See our <Link to="/vs/$competitor" params={{ competitor: "profound" }} className="underline decoration-accent underline-offset-2">/vs/profound</Link> comparison.
              </li>
              <li>
                <strong>AI referral traffic in analytics.</strong> chatgpt.com, perplexity.ai,
                gemini.google.com, claude.ai, copilot.microsoft.com — segment as their own channel in
                GA4 / Plausible / Fathom. This is the &quot;clicks from the citation&quot; number.
              </li>
              <li>
                <strong>Direct readability score.</strong> Re-run{" "}
                <Link to="/check" className="underline decoration-accent underline-offset-2">/check</Link>{" "}
                on the published URL after every release. A regression in any of the five pillars
                signals what to fix before it tanks citation share.
              </li>
            </ul>
          </section>

          {/* GEO vs SEO vs AEO */}
          <section>
            <H2 id="geo-vs-seo">GEO vs SEO vs AEO</H2>
            <P>
              Three acronyms that overlap and confuse buyers. Plain version:
            </P>
            <div className="overflow-x-auto border border-border my-6">
              <table className="w-full text-sm">
                <thead className="bg-muted/30 border-b border-border">
                  <tr>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Discipline</th>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Optimizes for</th>
                    <th className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground px-4 py-3">Unit of success</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-bold">SEO</td>
                    <td className="px-4 py-3 text-foreground/85">Ranked list of blue links</td>
                    <td className="px-4 py-3 text-foreground/85">A click from the SERP</td>
                  </tr>
                  <tr className="border-b border-border">
                    <td className="px-4 py-3 font-bold">AEO</td>
                    <td className="px-4 py-3 text-foreground/85">Featured-snippet-style direct answers</td>
                    <td className="px-4 py-3 text-foreground/85">Appearing as &quot;the&quot; answer box</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-accent">GEO</td>
                    <td className="px-4 py-3 text-foreground/85">Being quoted in a generated answer</td>
                    <td className="px-4 py-3 text-foreground/85">A named citation in an AI response</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <P>
              AEO is a subset of GEO. SEO is the older sibling that still pays — Google AIO sources its
              citations heavily from the top-ranked organic pages. Don&apos;t abandon SEO. Layer GEO on
              top.
            </P>
          </section>

          {/* FAQ */}
          <section>
            <H2 id="faq">Frequently asked questions</H2>
            <div className="space-y-8 mt-8">
              {FAQS.map((f, i) => (
                <article key={i} className="border-b border-border pb-8 last:border-0">
                  <h3 className="text-lg font-bold mb-3">{f.q}</h3>
                  <p className="text-foreground/85 leading-relaxed">{f.a}</p>
                </article>
              ))}
            </div>
          </section>

          {/* Related */}
          <section className="mt-20">
            <H2 id="related">Keep reading</H2>
            <div className="grid sm:grid-cols-2 gap-4 mt-6">
              {[
                { to: "/check", title: "Score your site against the standard", body: "Free /check scanner. The same five pillars graded out of 100." },
                { to: "/playbook", title: "The 12-week agent-native playbook", body: "Week-by-week content calendar for earning LLM citations." },
                { to: "/vs", title: "Grow vs the alternatives", body: "Side-by-side comparisons against Webflow, Framer, Profound, Rankscale, and DIY." },
                { to: "/pricing", title: "Fixed-price builds", body: "$2,400 / 48h and $4,800 / 5d. Delivered against geo-standard@2026.05." },
              ].map((r) => (
                <Link
                  key={r.to}
                  to={r.to}
                  className="group border border-border hover:border-accent p-6 transition-colors"
                >
                  <div className="text-lg font-extrabold tracking-tighter uppercase mb-2 group-hover:text-accent transition-colors">
                    {r.title}
                  </div>
                  <p className="text-sm text-muted-foreground">{r.body}</p>
                </Link>
              ))}
            </div>
          </section>
        </article>

        {/* CTA */}
        <section className="border-t border-border bg-muted/10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase mb-6">
              Want this shipped, not just understood?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              We build sites against this exact standard. 48-hour delivery from $2,400. 100/100 on
              /check or we fix it.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm">
                Start a brief <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/check" className="inline-flex items-center gap-2 border border-border hover:border-accent hover:text-accent transition-colors font-bold px-6 py-4 uppercase tracking-tighter text-sm">
                Score your site first
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
