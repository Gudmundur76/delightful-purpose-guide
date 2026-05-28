// Tactical GEO/agent-readability playbooks. Each renders as a HowTo
// JSON-LD page at /playbooks/{slug} — the exact format AI engines lift
// step-by-step when answering "how do I…" queries.

export interface PlaybookStep {
  name: string;
  text: string;
}

export interface Playbook {
  slug: string;
  title: string;
  short: string; // meta description, ≤160 chars
  intent: string; // the user question this answers verbatim
  totalTime: string; // ISO 8601 duration
  difficulty: "beginner" | "intermediate" | "advanced";
  category: "robots" | "llms-txt" | "schema" | "speed" | "content" | "crawlers";
  publishedAt: string;
  updatedAt: string;
  intro: string;
  steps: PlaybookStep[];
  pitfalls: string[];
  verify: string;
  related: string[]; // slugs
}

export const PLAYBOOKS: Playbook[] = [
  {
    slug: "robots-txt-for-chatgpt-citations",
    title: "robots.txt for ChatGPT Citations",
    short:
      "The exact robots.txt block to allow ChatGPT, Perplexity, and Claude citations while still blocking training-only bots. Copy-paste ready.",
    intent: "How do I let ChatGPT cite my site without giving OpenAI my data for training?",
    totalTime: "PT10M",
    difficulty: "beginner",
    category: "robots",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    intro:
      "The #1 cause of zero ChatGPT citations is a robots.txt that blocks the wrong bot. GPTBot is training. OAI-SearchBot is citations. Blocking GPTBot does NOT stop ChatGPT from citing you — blocking OAI-SearchBot silently does. This playbook ships the exact matrix.",
    steps: [
      {
        name: "Open public/robots.txt",
        text: "If the file does not exist at the site root, create it. Crawlers fetch it at https://yourdomain.com/robots.txt — it must be reachable without auth and return 200.",
      },
      {
        name: "Allow all search and citation bots",
        text: "Add explicit allow blocks for: Googlebot (AI Overviews), OAI-SearchBot (ChatGPT Search), ChatGPT-User (user pastes), PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, bingbot (Copilot), FacebookBot (Meta AI). Each gets its own User-agent line followed by Allow: /.",
      },
      {
        name: "Block training-only bots if you want to opt out",
        text: "Separately, add Disallow: / for GPTBot, Google-Extended, anthropic-ai, Meta-ExternalAgent, CCBot. These crawl for model training, not citations. Blocking them does NOT affect AI search visibility.",
      },
      {
        name: "Add the sitemap directive",
        text: "End the file with Sitemap: https://yourdomain.com/sitemap.xml so every bot discovers your canonical URL set on first fetch.",
      },
      {
        name: "Verify with curl",
        text: "Run: curl -A 'OAI-SearchBot/1.0' -I https://yourdomain.com/robots.txt — must return 200. Then curl the homepage with the same UA and confirm full HTML returns without JavaScript.",
      },
    ],
    pitfalls: [
      "Blocking GPTBot thinking it controls ChatGPT citations — it does not.",
      "Wildcard Disallow: / under User-agent: * with no per-bot allow — kills every crawler.",
      "Cloudflare 'AI Scrapers and Crawlers' toggle blocks search bots too — disable it or whitelist citation UAs at the WAF layer.",
      "Returning a 200 with HTML when bots request /robots.txt — must be text/plain.",
    ],
    verify:
      "Run grow.contact/check on your domain. Crawler discovery should pass with all six citation bots green.",
    related: ["fix-cloudflare-blocking-ai-crawlers", "llms-txt-in-10-minutes", "perplexity-listicle-format"],
  },
  {
    slug: "llms-txt-in-10-minutes",
    title: "Ship llms.txt in 10 Minutes",
    short:
      "A working llms.txt for any marketing site in under 10 minutes. The spec, the structure, and the exact template AI agents prefer.",
    intent: "How do I create an llms.txt file for my website?",
    totalTime: "PT10M",
    difficulty: "beginner",
    category: "llms-txt",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    intro:
      "llms.txt is to AI agents what robots.txt is to search crawlers — a curated, markdown-formatted index of your most important pages, served at /llms.txt. The spec is at llmstxt.org. This playbook ships a working file in three sections.",
    steps: [
      {
        name: "Create public/llms.txt at the site root",
        text: "It must be reachable at https://yourdomain.com/llms.txt without auth, with content-type text/plain or text/markdown. Crawlers do not follow redirects for this file.",
      },
      {
        name: "Write the header block",
        text: "Start with # Your Brand on line 1. Add a > blockquote with a one-sentence factual description on line 2. Include the disambiguation if your brand name is shared (e.g. 'Acme is not affiliated with acme.io').",
      },
      {
        name: "List Core Pages as a markdown link list",
        text: "## Core Pages followed by - [Name](url): one-line description per page. Cover your homepage, product, pricing, docs, blog, contact. Each description should answer 'what is on this page' factually — no marketing fluff.",
      },
      {
        name: "Add Tools and Feeds sections",
        text: "## Tools for free utilities and APIs. ## Feeds for RSS, sitemap, llms-full.txt. These map to common agent queries like 'is there an API?' or 'where is the blog feed?'.",
      },
      {
        name: "Optional: ship llms-full.txt",
        text: "For docs-heavy sites, also create /llms-full.txt with your entire content corpus in markdown. Agents fetch it for full-context Q&A. Skip if your site is <20 pages.",
      },
    ],
    pitfalls: [
      "Serving llms.txt as text/html — agents reject and fall back to HTML scraping.",
      "Listing pages that 404 or 301-redirect — every link in llms.txt must return 200.",
      "Putting marketing copy in descriptions — agents treat it as low-trust noise.",
      "Forgetting to update it when routes change — stale llms.txt is worse than none.",
    ],
    verify:
      "curl https://yourdomain.com/llms.txt — must return 200, content-type text/* or markdown, with parseable markdown structure.",
    related: ["robots-txt-for-chatgpt-citations", "json-ld-for-saas-pricing", "perplexity-listicle-format"],
  },
  {
    slug: "json-ld-for-saas-pricing",
    title: "JSON-LD for SaaS Pricing Pages",
    short:
      "The exact Product + Offer schema that gets your pricing surfaced in AI answers like 'how much does X cost?'. Copy-paste template included.",
    intent: "How do I add structured data to my pricing page so ChatGPT can quote my prices?",
    totalTime: "PT15M",
    difficulty: "intermediate",
    category: "schema",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    intro:
      "If your prices are not in scrapeable HTML text AND in JSON-LD AND in an FAQ answer, AI engines either dodge cost questions or recommend a competitor that does publish. This playbook nails all three.",
    steps: [
      {
        name: "Render every price as plain text",
        text: "On the pricing page, every tier name and dollar figure must be in static HTML — not behind a 'reveal price' button or a checkout flow. AI crawlers do not click. If the price is not in the initial response body, it does not exist.",
      },
      {
        name: "Add Product JSON-LD per tier",
        text: "Use @type: Product with name, description, brand, and offers. offers is a single Offer object (or array for multi-currency) with @type: Offer, price (string), priceCurrency (ISO 4217), availability: 'https://schema.org/InStock', and url pointing to the checkout page.",
      },
      {
        name: "Wrap multiple tiers in ItemList",
        text: "If you have 2+ tiers, add a parent @type: ItemList with itemListElement containing one ListItem per Product. This signals 'these are alternatives' rather than independent products.",
      },
      {
        name: "Mirror the price in an FAQ answer",
        text: "Add an FAQPage block with a Question 'How much does Y cost?' and Answer text containing the literal dollar figure. AI engines preferentially cite FAQPage entries because they are pre-structured Q&A pairs.",
      },
      {
        name: "Validate before shipping",
        text: "Paste the rendered HTML into validator.schema.org and Google's Rich Results Test. Both must return zero errors. JSON-LD with errors is silently dropped, not partially indexed.",
      },
    ],
    pitfalls: [
      "Price as a number — Schema.org requires string ('2400.00' not 2400).",
      "Missing priceCurrency — without it, the Offer is invalid.",
      "JSON-LD in the body instead of head — works, but head is more reliably parsed.",
      "Hiding tiers behind a tabs widget that requires JS — render all tiers in the DOM, then style.",
    ],
    verify:
      "Ask ChatGPT directly: 'How much does [your product] cost?' Within 48 hours of indexing, it should quote the dollar figure with your URL as the source.",
    related: ["llms-txt-in-10-minutes", "answer-first-content", "perplexity-listicle-format"],
  },
  {
    slug: "perplexity-listicle-format",
    title: "Write for Perplexity (Listicle Format)",
    short:
      "Perplexity cites listicles 4× more than prose. The exact H2/bullet pattern that earns Perplexity citations on listicle queries.",
    intent: "Why does Perplexity never cite my blog posts?",
    totalTime: "PT20M",
    difficulty: "intermediate",
    category: "content",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    intro:
      "Perplexity's synthesis model preferentially extracts structured lists. A 2,000-word essay loses to a 600-word listicle on the same topic. This is the format that wins.",
    steps: [
      {
        name: "Title the post as 'N [Things] for [Use Case] (YYYY)'",
        text: "Numbered, scoped, year-stamped. 'Best databases' loses to '8 Best Postgres Hosting Providers for AI Apps (2026)'. The year is a freshness signal Perplexity weights heavily.",
      },
      {
        name: "Open with a 2-sentence answer summary",
        text: "Before the list, write exactly 2 sentences that answer the title directly. Perplexity's extractor pulls this as the synthesized answer summary when no single list item dominates.",
      },
      {
        name: "Format each item as ### H3 + 2-3 sentence body",
        text: "Each list entry: ### Item Name, then 2-3 sentences covering what, why, and a distinguishing fact. No 'Click here to learn more' — every entry must stand alone as a citable unit.",
      },
      {
        name: "Front-load entity names",
        text: "Start each ### body with the entity name (brand, product, term). Perplexity's chunker splits at H3 — the first words of each chunk get the highest weight in retrieval.",
      },
      {
        name: "Add a comparison table at the end",
        text: "A 3-column markdown table (Item | Best for | Price/Free tier) gets extracted as a structured citation card on Perplexity's UI. Tables outperform prose for 'compare X vs Y' queries.",
      },
    ],
    pitfalls: [
      "Burying the list under 800 words of intro — Perplexity gives up before reaching it.",
      "Using H2 instead of H3 for items — H2 signals 'section', H3 signals 'list entry', and Perplexity chunks accordingly.",
      "Vague items like 'It depends' or 'Various options' — these get filtered out as low-information.",
    ],
    verify:
      "Search your title verbatim on Perplexity. Your post should appear in the sources panel within 7 days of indexing.",
    related: ["answer-first-content", "json-ld-for-saas-pricing", "llms-txt-in-10-minutes"],
  },
  {
    slug: "fix-cloudflare-blocking-ai-crawlers",
    title: "Fix Cloudflare Blocking AI Crawlers",
    short:
      "Cloudflare's default 'Bot Fight Mode' silently blocks OAI-SearchBot and PerplexityBot. The exact WAF rules to fix it.",
    intent: "Why is ChatGPT not citing my site even though my robots.txt allows OAI-SearchBot?",
    totalTime: "PT15M",
    difficulty: "intermediate",
    category: "crawlers",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    intro:
      "robots.txt is a polite suggestion that says 'you may crawl'. Cloudflare's WAF is an enforcement layer that says 'you cannot connect'. If WAF blocks the bot, robots.txt is never even fetched. This is the #2 cause of zero AI citations after wrong robots.txt.",
    steps: [
      {
        name: "Audit the actual bot block status",
        text: "In Cloudflare → Analytics → Security, filter requests by user-agent containing 'OAI-SearchBot' or 'PerplexityBot' over the last 7 days. If the block rate is non-zero, you have a WAF problem.",
      },
      {
        name: "Disable 'AI Scrapers and Crawlers' if enabled",
        text: "Cloudflare → Security → Bots. This toggle blocks all AI user-agents including citation bots, not just training bots. Disable it and use bot-specific allow rules instead.",
      },
      {
        name: "Add an allow rule per citation bot",
        text: "Security → WAF → Custom rules. Create rule: (http.user_agent contains 'OAI-SearchBot') or (http.user_agent contains 'PerplexityBot') or (http.user_agent contains 'ClaudeBot') or (http.user_agent contains 'ChatGPT-User') → Action: Skip → Skip: All remaining custom rules + Super Bot Fight Mode.",
      },
      {
        name: "Lower Bot Fight Mode sensitivity",
        text: "If you must keep Bot Fight Mode on, set it to 'Definitely Automated' only — not 'Likely Automated'. The latter false-positives on AI bots.",
      },
      {
        name: "Verify reverse DNS",
        text: "Cloudflare ships verified bot lists. OAI-SearchBot, PerplexityBot, ClaudeBot, and bingbot are on the verified list — they get a cf-verified-bot header. Allow that header in your firewall as a safety net.",
      },
    ],
    pitfalls: [
      "Allowing only User-Agent string but not the underlying IP range — sophisticated UA spoofing exists; rely on Cloudflare's verified-bot list when possible.",
      "Forgetting to test from the bot's actual IP range — curl from your laptop does not reproduce WAF behavior.",
      "Page Rules cache that strips Set-Cookie for bots — fine; AI bots ignore cookies anyway.",
    ],
    verify:
      "Run grow.contact/check on the domain. Crawler discovery should pass. Cross-check with Cloudflare Analytics — block rate for citation bots should be 0.",
    related: ["robots-txt-for-chatgpt-citations", "edge-cache-html-for-ai-crawlers", "llms-txt-in-10-minutes"],
  },
  {
    slug: "edge-cache-html-for-ai-crawlers",
    title: "Edge-Cache HTML for AI Crawlers",
    short:
      "AI crawlers timeout at 1-5 seconds. The exact Cache-Control headers and CDN config to serve HTML in under 200ms TTFB.",
    intent: "How do I make my site fast enough for AI crawlers?",
    totalTime: "PT20M",
    difficulty: "advanced",
    category: "speed",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    intro:
      "OAI-SearchBot, PerplexityBot, and ClaudeBot operate on tight per-fetch budgets — typically 1-5 seconds. If your TTFB is 800ms+ on SSR, you lose the citation race to faster competitors. Edge-cached HTML brings TTFB to sub-100ms.",
    steps: [
      {
        name: "Identify which pages can be safely cached",
        text: "Marketing pages, blog posts, docs, pricing — everything that does not vary by user session. Excludes /dashboard, /account, /api. Personalized variants kill caching.",
      },
      {
        name: "Set the canonical cache header",
        text: "On cacheable HTML responses: Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=600. max-age=0 makes browsers always revalidate. s-maxage=300 lets the CDN serve a cached copy for 5 minutes. stale-while-revalidate=600 lets it serve stale up to 10 minutes while revalidating in background.",
      },
      {
        name: "Strip cookies that bust the cache",
        text: "CDNs key cache entries by Vary: Cookie if any Set-Cookie header is present. Remove session cookies from public marketing routes. Move analytics to client-only beacons that fire after the cached HTML loads.",
      },
      {
        name: "Verify from the edge, not your laptop",
        text: "Use curl -I from multiple regions or webpagetest.org with location=Dulles, VA (US-East — closest to OpenAI's primary egress). TTFB should be <200ms on cache hit. Look for cf-cache-status: HIT or x-cache: HIT in response headers.",
      },
      {
        name: "Purge on content updates",
        text: "Add a build-step cache purge for changed routes. Without this, content updates take up to 10 minutes to propagate — fine for marketing, painful for time-sensitive blog posts.",
      },
    ],
    pitfalls: [
      "TanStack Start ships Cache-Control: no-cache by default — must be overridden in src/server.ts.",
      "Setting max-age=300 instead of s-maxage=300 — browsers cache for 5min and miss updates; only the CDN should hold the long TTL.",
      "Heavy hero images on the critical path — even with cached HTML, a 2MB hero blocks LCP for the crawler's snapshot.",
    ],
    verify:
      "WebPageTest from Dulles, VA: TTFB <200ms, Speed Index <2s. grow.contact/check Speed signal at 100/100.",
    related: ["fix-cloudflare-blocking-ai-crawlers", "answer-first-content", "robots-txt-for-chatgpt-citations"],
  },
  {
    slug: "answer-first-content",
    title: "Answer-First Content for AI Overviews",
    short:
      "Google AI Overviews extract the answer from the first 50-70 words. The exact opening pattern that wins extraction.",
    intent: "How do I write content that Google AI Overviews will cite?",
    totalTime: "PT15M",
    difficulty: "beginner",
    category: "content",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    intro:
      "Google AI Overviews fire on 48% of queries and extract one to three short passages per source. If the answer is buried under intro paragraphs, AIO skips you. This is the inverted-pyramid pattern that gets extracted.",
    steps: [
      {
        name: "Lead with the question verbatim as the H1",
        text: "If users search 'how does X work', the H1 should be 'How Does X Work?' — not 'Understanding X' or 'The Definitive Guide to X'. Verbatim match earns BERT relevance points.",
      },
      {
        name: "Answer in the first paragraph in 50-70 words",
        text: "Paragraph one is a direct, factual answer with the entity name, a number or date, and a distinguishing detail. No 'In this post, we will explore…'. AIO extractor truncates at ~70 words.",
      },
      {
        name: "Use the bold-lede pattern for definitions",
        text: "For 'what is X' queries: **X is [direct definition].** Then expand. The bold lede gets pulled into the AIO snippet as a Schema.org DefinedTerm equivalent.",
      },
      {
        name: "Add 3-5 H2s that match People Also Ask",
        text: "Open an incognito tab, search the primary query, screenshot the People Also Ask box. Each PAA question becomes an H2 in your post. Each H2 gets a 2-3 sentence direct answer beneath it.",
      },
      {
        name: "Close with FAQPage JSON-LD",
        text: "The same Q/A pairs go into an FAQPage schema in the page head. Bonus: Google may surface them as accordion-style rich snippets and AIO double-weights FAQPage-flagged answers.",
      },
    ],
    pitfalls: [
      "Burying the answer under a 'context-setting' intro — AIO never reaches it.",
      "Vague openers like 'It depends' or 'There are many factors' — extracted as low-confidence, downranked.",
      "Skipping FAQ schema thinking the prose is enough — FAQPage gets 2-3× the AIO citation rate of equivalent prose.",
    ],
    verify:
      "Search your target query on Google. Within 14 days of indexing, your bold-lede or first paragraph should appear in the AI Overview source panel.",
    related: ["perplexity-listicle-format", "json-ld-for-saas-pricing", "llms-txt-in-10-minutes"],
  },
  {
    slug: "schema-for-author-eeat",
    title: "Author Schema for E-E-A-T Signals",
    short:
      "The exact Person + sameAs schema that proves authorship to Google and AI engines. Required for YMYL content in 2026.",
    intent: "How do I add author bios with proper schema for E-E-A-T?",
    totalTime: "PT20M",
    difficulty: "intermediate",
    category: "schema",
    publishedAt: "2026-05-28",
    updatedAt: "2026-05-28",
    intro:
      "Google's 2024 helpful-content guidelines and the AI Overview ranking model both weight verified authorship heavily. An anonymous post by 'admin' on a YMYL topic (finance, health, legal, tech advice) gets near-zero AIO citation rate. This is the schema that fixes it.",
    steps: [
      {
        name: "Create a real /authors/{slug} page per writer",
        text: "Not a modal, not an inline bio — a standalone page with the author's name, photo, role, credentials, and 3-5 sentence bio. Crawlers need a canonical URL to resolve the entity.",
      },
      {
        name: "Add Person JSON-LD to the author page",
        text: "@type: Person, name, image, jobTitle, worksFor (Organization), description, url (self), and sameAs as an array of social profile URLs (LinkedIn, GitHub, X, Mastodon, ORCID if applicable). sameAs is the verification signal.",
      },
      {
        name: "Reference the author from every article",
        text: "On each blog post / Article schema, set author as an object with @type: Person, name, and url pointing to /authors/{slug}. Do not just inline the name — the URL link is what merges the entity in Google's Knowledge Graph.",
      },
      {
        name: "Add a visible byline above the fold",
        text: "Photo + name + 'Reviewed by' or 'Written by' + publication date + 'X min read'. The visible byline reinforces the schema and is what the AIO snippet panel surfaces as 'Source: Person Name, Publication, Date'.",
      },
      {
        name: "Link sameAs profiles back to the author page",
        text: "On LinkedIn / GitHub / personal sites, link to the /authors/{slug} URL. Bidirectional links resolve faster in entity graphs than one-way.",
      },
    ],
    pitfalls: [
      "Using @type: Organization for individual authors — destroys E-E-A-T signal.",
      "sameAs with profile URLs that 404 or are private — broken sameAs is worse than no sameAs.",
      "Inline author with just a name string — Google cannot disambiguate 'Sarah Chen' across 100k similarly named profiles without a URL.",
    ],
    verify:
      "Paste the article URL into Google's Rich Results Test → Article. Author should show as a resolved Person entity with image and sameAs links. Search Console → Enhancements → Article should show zero author errors.",
    related: ["answer-first-content", "json-ld-for-saas-pricing", "llms-txt-in-10-minutes"],
  },
];

export function getPlaybook(slug: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.slug === slug);
}
