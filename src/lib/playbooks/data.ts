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
      "Run citation.is/check on your domain. Crawler discovery should pass with all six citation bots green.",
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
      "Run citation.is/check on the domain. Crawler discovery should pass. Cross-check with Cloudflare Analytics — block rate for citation bots should be 0.",
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
      "WebPageTest from Dulles, VA: TTFB <200ms, Speed Index <2s. citation.is/check Speed signal at 100/100.",
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
  {
    slug: "rank-in-perplexity-comparison-queries",
    title: "Rank in Perplexity Comparison Queries",
    short:
      "The exact page structure Perplexity cites for 'X vs Y' queries — comparison table, verdict block, and the five entity signals that win the citation.",
    intent: "How do I get cited by Perplexity for vendor comparison searches?",
    totalTime: "PT45M",
    difficulty: "intermediate",
    category: "content",
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    intro:
      "Perplexity resolves 'X vs Y' queries by lifting the first page with (a) both entities named in the H1, (b) a comparison table with shared columns, and (c) a one-sentence verdict block. Miss any one of the three and you get cited as 'related reading' instead of the primary source.",
    steps: [
      {
        name: "H1 contains both entities + the word 'vs'",
        text: "Pattern: '<Entity A> vs <Entity B>: <year> Comparison'. Perplexity's retrieval favors exact-match H1s over title tags. Synonyms ('versus', 'compared to') reduce match confidence by ~30%.",
      },
      {
        name: "Ship a real <table> with matching rows",
        text: "Both products must share identical row labels (Pricing, Free tier, API rate limit, SOC 2, etc.). Asymmetric tables (one product has 8 rows, the other has 3) get demoted because Perplexity cannot diff them cleanly.",
      },
      {
        name: "Add a 'Verdict' or 'TL;DR' block above the table",
        text: "One sentence, fewer than 25 words: 'Choose X if you need Y; choose A if you need B.' This is what Perplexity quotes verbatim in the answer card.",
      },
      {
        name: "Wire ComparisonPage + Product schema",
        text: "JSON-LD with @type: 'WebPage', about referencing both Product entities by @id (canonical product URLs). Without the @id link, Perplexity treats the comparison as opinion content and downweights it.",
      },
      {
        name: "Internal-link to /vs/{a}-vs-{b} from both product pages",
        text: "Bidirectional internal links signal the comparison is canonical. Perplexity's freshness model uses internal link recency as a tie-breaker between competing comparison pages.",
      },
    ],
    pitfalls: [
      "Affiliate-heavy comparisons with disclosure banners above the table — Perplexity demotes for promotional intent signals.",
      "Comparison nested inside a tabbed UI that loads via JS — the table never renders for crawler fetches.",
      "Using 'Product A' / 'Product B' placeholders that got past QA — Perplexity will not cite a page with unresolved entity names.",
    ],
    verify:
      "Search '<your product> vs <competitor>' on Perplexity in an incognito session. Your page should appear as a numbered citation, not just in the source list. Refresh — Perplexity caches citations for ~24h.",
    related: ["perplexity-listicle-format", "answer-first-content", "schema-for-author-eeat"],
  },
  {
    slug: "get-cited-by-google-ai-overviews",
    title: "Get Cited by Google AI Overviews",
    short:
      "The five page-level signals that drive AI Overview citations: passage indexing, expert quote density, schema chaining, freshness, and the 280-character snippet rule.",
    intent: "How do I get my page cited in Google AI Overviews?",
    totalTime: "PT1H",
    difficulty: "intermediate",
    category: "content",
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    intro:
      "AI Overviews pull from Google's passage index — not the page index. The unit of citation is a 280-character span, not a URL. Pages structured for passage extraction get cited 4–8× more often than pages of equivalent topical authority.",
    steps: [
      {
        name: "Write atomic 60–80 word paragraphs",
        text: "Each paragraph answers one question fully and standalone. AIO will not stitch context across paragraphs — it lifts one span and cites you, or it lifts a competitor's span and cites them.",
      },
      {
        name: "Lead each section with the question as an H2",
        text: "Phrase H2s exactly as users phrase queries: 'How long does X take?' not 'Timing'. Passage retrieval scores H2-to-query similarity heavily.",
      },
      {
        name: "Embed at least one named expert quote per 1000 words",
        text: "Quote a Person with sameAs-verified credentials. AIO surfaces a 'According to <Person>, <Title>' attribution line — without a quote you're never the primary source.",
      },
      {
        name: "Chain Article → mentions → Thing schema",
        text: "Article.mentions references the canonical entity (Wikidata Q-ID or Wikipedia URL) for every product, person, and concept the page discusses. This is what merges your page into the knowledge panel as a source.",
      },
      {
        name: "Ship a last-modified header + visible 'Updated: <date>'",
        text: "AIO freshness window is 90 days for evergreen topics, 7 days for news. Update Last-Modified HTTP header AND <time datetime> in the byline. One without the other halves the freshness score.",
      },
    ],
    pitfalls: [
      "Long flowing paragraphs (>120 words) — passage extractor truncates mid-sentence and skips the citation.",
      "Quoting unattributed 'a recent study' — no entity, no citation lift.",
      "Updating publishedDate to fake freshness — Google's content fingerprint catches it and demotes the entire domain.",
    ],
    verify:
      "Search a long-tail query your page targets in an incognito Chrome on a Google account with AIO enabled. Your page should appear in the source carousel within 14 days of publish + index request.",
    related: ["answer-first-content", "schema-for-author-eeat", "json-ld-for-saas-pricing"],
  },
  {
    slug: "monitor-citation-share-monthly",
    title: "Monitor Your Citation Share Monthly",
    short:
      "The four-query, four-engine matrix that tells you whether you're gaining or losing share in Perplexity, ChatGPT, Claude, and Google AIO — every month.",
    intent: "How do I track my AI citation share over time?",
    totalTime: "PT30M",
    difficulty: "beginner",
    category: "content",
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    intro:
      "You can't optimize what you don't measure. Citation share is the only leading indicator for AI-sourced traffic — by the time GA shows referrer drops, you've already lost the quarter. This is the lightweight tracking sheet that catches volatility in week 1, not week 12.",
    steps: [
      {
        name: "Pick four query archetypes",
        text: "One category query ('best <category> tools'), one comparison ('X vs Y'), one how-to ('how to <task>'), one entity ('what is <your product>'). These four cover the 80% of AI traffic shapes.",
      },
      {
        name: "Run each query in all four engines, incognito",
        text: "Perplexity, ChatGPT (with web search), Claude (with web search), Google AIO. Record: did you appear as a citation? What position? What was the snippet quoted?",
      },
      {
        name: "Log into a single sheet, one row per query × engine × month",
        text: "Columns: month, query, engine, cited (Y/N), position, snippet, top competitor cited. Sixteen rows per month. Don't overengineer this — a Google Sheet beats a dashboard you never open.",
      },
      {
        name: "Flag movements >2 positions or losing citation entirely",
        text: "These are the only signals worth a code change. Single-position drift is noise. Set a calendar reminder for the 1st of each month.",
      },
      {
        name: "Diff the snippet text against your page",
        text: "If the engine quotes wording you don't have on-page, a competitor outranked you on a span you don't even cover. That's a content gap, not a technical one.",
      },
    ],
    pitfalls: [
      "Running queries while logged in / personalized — results skew toward your own brand. Always incognito.",
      "Sampling once and assuming stability — Perplexity in particular re-ranks every 24-48h. Need at least 3 samples per month.",
      "Tracking too many queries — 4 is enough to see trend, 40 is enough to never look.",
    ],
    verify:
      "After 3 months you should have 48 rows of data. Sort by 'cited Y/N' descending — your true citation surface is the count of distinct (query, engine) pairs where you appear.",
    related: ["rank-in-perplexity-comparison-queries", "get-cited-by-google-ai-overviews", "perplexity-listicle-format"],
  },
  {
    slug: "claim-your-knowledge-graph-entity",
    title: "Claim Your Knowledge Graph Entity",
    short:
      "The Wikidata + Wikipedia + sameAs sequence that turns your company into a resolvable entity Google and AI engines can cite by name, not URL.",
    intent: "How do I get my company into Google's Knowledge Graph so AI engines cite us by name?",
    totalTime: "PT2H",
    difficulty: "advanced",
    category: "schema",
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    intro:
      "Pages get cited. Entities get referenced. The difference: cited pages need to win each query; referenced entities show up in the answer regardless of which page ranks. Becoming an entity requires Wikidata, sameAs density, and one external corroborating source. Most B2B SaaS companies skip this and stay stuck as 'one of many vendors'.",
    steps: [
      {
        name: "Create a Wikidata item for your company",
        text: "wikidata.org/wiki/Special:NewItem. Required: label (your name), description (one-sentence, no marketing), instance of (Q4830453 = business) or (Q1058914 = software), inception (founding date), official website (P856).",
      },
      {
        name: "Add at least 3 sameAs identifiers",
        text: "GitHub org URL, LinkedIn company URL, X handle, Crunchbase URL. Each with the matching Wikidata property (P2037 GitHub, P4264 LinkedIn, P2002 Twitter, P2087 Crunchbase). Identifiers are how downstream consumers cross-reference.",
      },
      {
        name: "Land one external corroborating source",
        text: "A TechCrunch / The Verge / industry-pub article that names you specifically. Add as 'described at URL' (P973). Without one external secondary source, Google's KG ingestion will not promote the entity.",
      },
      {
        name: "Mirror sameAs on your /about page Organization schema",
        text: "JSON-LD Organization with sameAs as an array containing the Wikidata URL + every identifier from step 2. Bidirectional sameAs is what triggers KG entity merge.",
      },
      {
        name: "Request a Wikipedia stub (optional but high-leverage)",
        text: "If you can defend notability with 3+ secondary sources, an English Wikipedia stub multiplies entity weight ~10×. Do not write it yourself — commission an editor with COI-disclosure experience.",
      },
    ],
    pitfalls: [
      "Adding promotional language to the Wikidata description — gets reverted within 24h, looks like spam, slows ingestion.",
      "Skipping the external source — Wikidata accepts the item, Google KG never ingests it.",
      "Linking sameAs to social profiles that 404 or are private — broken sameAs hurts more than missing sameAs.",
    ],
    verify:
      "Search '<your company name>' on Google and check for a Knowledge Panel within 4-8 weeks. Then ask Perplexity 'tell me about <your company>' — the answer should cite Wikidata or Wikipedia, not just your homepage.",
    related: ["schema-for-author-eeat", "json-ld-for-saas-pricing", "get-cited-by-google-ai-overviews"],
  },
  {
    slug: "structured-data-for-changelogs",
    title: "Structured Data for Changelogs",
    short:
      "The Article + DataFeed schema that makes your changelog discoverable by AI agents searching 'what's new in <product> this month' — and the RSS feed they expect alongside it.",
    intent: "How do I make my product changelog discoverable by AI search?",
    totalTime: "PT30M",
    difficulty: "intermediate",
    category: "schema",
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    intro:
      "Changelogs are the highest-citation-density pages on most SaaS sites — and the most under-structured. An unmarked changelog gets indexed as one URL. A structured changelog gets indexed as N entries, each individually citable by recency-sensitive AI queries.",
    steps: [
      {
        name: "Give each release its own URL fragment + anchor",
        text: "/changelog#2026-05-29 or /changelog/2026-05-29 as a real route. AI engines treat each anchor as a distinct passage; without anchors, they cite only the topmost entry.",
      },
      {
        name: "Wrap each entry in Article schema",
        text: "@type: Article, headline (the release name), datePublished (ISO 8601), description (one-line summary). Nest inside an ItemList on the index page so the order is canonical.",
      },
      {
        name: "Add an RSS or Atom feed at /changelog.rss",
        text: "ChatGPT and Claude poll RSS for recency-sensitive queries. RSS-discovered content gets cited within hours; HTML-only changelogs take days to weeks.",
      },
      {
        name: "Link <link rel='alternate' type='application/rss+xml'> from /changelog",
        text: "This is the autodiscovery line. Without it, agents that don't crawl every URL miss the feed entirely.",
      },
      {
        name: "Reference the product entity in every entry",
        text: "Article.about → {@type: SoftwareApplication, @id: 'https://yourdomain.com/#product'}. Now each release is attributable to the entity, not just the URL.",
      },
    ],
    pitfalls: [
      "Changelog rendered client-side via fetch — entries are invisible to crawlers.",
      "Single Article schema wrapping the entire changelog — collapses N citable spans into 1.",
      "RSS feed that 404s, returns HTML, or excludes <pubDate> — silently disqualifies the feed.",
    ],
    verify:
      "curl -A 'ChatGPT-User' https://yourdomain.com/changelog.rss — must return application/rss+xml with at least 10 <item> entries, each with <pubDate>. Then ask ChatGPT 'what shipped in <product> this month' and confirm a recent entry is cited.",
    related: ["json-ld-for-saas-pricing", "answer-first-content", "edge-cache-html-for-ai-crawlers"],
  },
  {
    slug: "win-the-citation-vs-organic-tradeoff",
    title: "Win the Citation vs Organic Tradeoff",
    short:
      "The three content patterns where optimizing for AI citation hurts organic SEO — and the five where they reinforce each other. Plus the decision matrix.",
    intent: "Does optimizing for AI citations hurt my Google rankings?",
    totalTime: "PT45M",
    difficulty: "advanced",
    category: "content",
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    intro:
      "The most common pushback on GEO work: 'won't this tank our SEO?' Mostly no — the signals overlap. But in three specific patterns, the optimizations diverge. This is the matrix that tells you when to pick one, when to do both, and when to ship two pages.",
    steps: [
      {
        name: "Identify your query intent first",
        text: "Navigational ('Stripe pricing') → organic wins, AI lifts your page anyway. Transactional ('buy X') → organic wins; AI rarely cites commerce. Informational ('how does X work') → AI citation matters more than position #1.",
      },
      {
        name: "For informational queries, write answer-first",
        text: "Lead with the answer in 60-80 words. Organic suffers slightly (lower dwell time), AI citation rate triples. Net traffic usually doubles because AI citation drives new visits even if you drop from position 3 to position 6.",
      },
      {
        name: "For navigational queries, keep brand-heavy structure",
        text: "Homepage, /pricing, /docs — do NOT rewrite for AI. They rank for brand queries on organic and AI engines just pass through to them. Touching them risks the brand+modifier longtail.",
      },
      {
        name: "Split when the patterns conflict",
        text: "If the topic has both informational and transactional intent, ship two URLs: /guide/<topic> for AI citation, /<topic> for organic conversion. Internal-link them, don't merge them.",
      },
      {
        name: "Measure both surfaces, not just one",
        text: "GA4 'organic' + Search Console for traditional SEO. Manual monthly citation audit (see playbook 'monitor-citation-share-monthly') for AI. A page can lose 20% organic and gain 5× AI referrals — net positive, only visible if you track both.",
      },
    ],
    pitfalls: [
      "Rewriting every page for AI — your brand and commerce pages don't need it and may rank worse.",
      "Assuming AI traffic shows up as 'direct' or 'referral' in GA — most shows as direct from openai.com, perplexity.ai, etc. Set those as channel groups before declaring 'no AI traffic'.",
      "Ignoring the answer-first tradeoff on YMYL — high-stakes content needs depth AND lead, not lead alone.",
    ],
    verify:
      "Pick 5 informational pages, apply answer-first restructure, measure 8 weeks. Combined (organic + AI-referrer) sessions should be flat or up on every page. If down on any, that page needs the split treatment.",
    related: ["answer-first-content", "monitor-citation-share-monthly", "rank-in-perplexity-comparison-queries"],
  },
  {
    slug: "publish-a-citable-data-drop",
    title: "Publish a Citable Data Drop",
    short:
      "The four-file structure (JSON-LD Dataset + CSV + methodology page + JSON Schema) that makes your proprietary data the source AI engines cite — not just reference.",
    intent: "How do I publish original data so AI engines cite us as the source?",
    totalTime: "PT3H",
    difficulty: "advanced",
    category: "schema",
    publishedAt: "2026-05-29",
    updatedAt: "2026-05-29",
    intro:
      "Original data is the highest-leverage citation asset. One quarterly data drop, structured correctly, generates more durable citations than 50 blog posts. The catch: 'structured correctly' means four artifacts, not one PDF.",
    steps: [
      {
        name: "Ship the data as both CSV and JSON",
        text: "/data/{topic}-{quarter}.csv and /data/{topic}-{quarter}.json. Same rows, same schema. CSV is for humans + spreadsheet imports, JSON is for agents. Both at stable URLs — never overwrite, version them.",
      },
      {
        name: "Publish a JSON Schema describing the columns",
        text: "/data/schemas/{topic}.schema.json with explicit types, descriptions, and allowed values. Agents that ingest the JSON use the schema to label columns correctly in answers. Without it, your data gets misquoted.",
      },
      {
        name: "Write a methodology page",
        text: "/report/{topic}-{quarter} explaining sample size, collection method, time window, limitations, and license (CC BY 4.0 recommended). Cited authorities are transparent ones — opaque methodology gets one citation and never gets re-cited.",
      },
      {
        name: "Wrap the methodology page in Dataset schema",
        text: "@type: Dataset, name, description, distribution as an array of DataDownload entries (one per file: CSV, JSON, JSON Schema). Each DataDownload with encodingFormat and contentUrl. This is how Google Dataset Search and AI engines discover the corpus.",
      },
      {
        name: "Cross-link from a stable hub page",
        text: "/research or /data as the entry point. Each quarter, link the new drop from the hub + the previous drop's footer ('Next drop: …'). Continuity signals authority across quarters.",
      },
    ],
    pitfalls: [
      "Publishing data as a PDF — invisible to JSON agents, hard to quote precisely, gets cited as 'a report' not as 'the source'.",
      "Changing the URL each quarter — breaks downstream citations and re-zeros your authority.",
      "Skipping the license — engines hesitate to cite unlicensed data; CC BY 4.0 is the lowest-friction choice.",
    ],
    verify:
      "Search Google Dataset Search for your dataset name within 2 weeks of publish — should appear with a downloadable link. Then ask Perplexity 'cite a source for <claim from your data>' and confirm it returns your /data URL, not a third-party summary.",
    related: ["claim-your-knowledge-graph-entity", "structured-data-for-changelogs", "json-ld-for-saas-pricing"],
  },
];


export function getPlaybook(slug: string): Playbook | undefined {
  return PLAYBOOKS.find((p) => p.slug === slug);
}
