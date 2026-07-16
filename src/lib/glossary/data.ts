// GEO / agent-native glossary. Each term gets its own canonical URL
// at /glossary/{slug} and DefinedTerm JSON-LD for LLM citations.

export interface GlossaryTerm {
  slug: string;
  term: string;
  short: string; // one-sentence definition, <160 chars (used as meta description)
  long: string; // 2-4 paragraphs of substantive explanation
  category:
    | "Protocols"
    | "Crawlers"
    | "Schema"
    | "Optimization"
    | "Infrastructure"
    | "Metrics";
  aliases?: string[];
  related?: string[]; // slugs of related terms
  sources?: { label: string; url: string }[];
}

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "agent-readability",
    term: "Agent-Readability",
    short:
      "How easily an AI agent or LLM crawler can fetch, parse, and cite a webpage's content.",
    long: `Agent-readability is a composite measure of how well a website cooperates with AI agents — search bots, chat-engine crawlers, and autonomous browsing agents. It folds together server reachability (does the bot get a 200, or a WAF challenge?), render mode (is the content in the initial HTML, or only after JavaScript runs?), semantic structure (landmarks, heading discipline, alt text), machine-readable metadata (JSON-LD, OpenGraph, llms.txt), and answer-density of the prose (front-loaded claims, named entities, numbers).

A page can rank well in classical SEO and still be invisible to ChatGPT, Perplexity, or Google AI Overviews. The citation.is /check scanner measures this on a 0–100 scale across six signals. Industry-wide, 73% of marketing sites score below 60 — most are silently excluded from AI citations because of one-line robots.txt mistakes or client-side rendering, not content quality.`,
    category: "Metrics",
    related: ["llms-txt", "citability", "geo"],
  },
  {
    slug: "llms-txt",
    term: "llms.txt",
    short:
      "A markdown file at /llms.txt that gives LLMs a curated map of a website's most important pages.",
    long: `llms.txt is a proposed standard (llmstxt.org, Jeremy Howard, 2024) that places a markdown file at the root of a domain to help LLMs orient themselves. Unlike sitemap.xml — which lists every URL for crawlers — llms.txt is a curated, human-written summary: the project's identity, a short description, and grouped links to the canonical pages an agent should read first.

It's not robots.txt and it's not a feed. It's a brief. Think of it as the README an agent sees before it starts browsing. Pair it with llms-full.txt (full content in markdown) for documentation sites that want to be loaded into an agent's context window in a single fetch.

Adoption is uneven: as of mid-2026, ~14% of Y Combinator companies serve a valid llms.txt; the figure climbs to ~38% for dev-tool startups. Engines that demonstrably read it include Perplexity, Claude, and an increasing share of agent frameworks. Google has not confirmed direct use, but pages that ship llms.txt correlate with higher AI Overview citation rates.`,
    category: "Protocols",
    related: ["llms-full-txt", "robots-txt", "agent-readability"],
    sources: [{ label: "llmstxt.org spec", url: "https://llmstxt.org/" }],
  },
  {
    slug: "llms-full-txt",
    term: "llms-full.txt",
    short:
      "A single markdown file containing a site's full content, sized for an LLM context window.",
    long: `llms-full.txt is the companion file to llms.txt: where llms.txt is a curated map, llms-full.txt is the entire site dumped as markdown in one HTTP request. It exists so an agent can load complete project context (docs, API reference, tutorials) without crawling N URLs.

Used mostly by documentation sites and SDKs where the goal is "let an agent answer any question about us from a single fetch." Keep it under ~500KB so smaller-context models can still ingest it; large doc sites should split into versioned variants (llms-full-v2.txt) or skip it.`,
    category: "Protocols",
    related: ["llms-txt"],
  },
  {
    slug: "mcp",
    term: "Model Context Protocol (MCP)",
    short:
      "An open standard from Anthropic for connecting LLMs to external tools, data sources, and APIs.",
    long: `Model Context Protocol (MCP), released by Anthropic in November 2024 and adopted by OpenAI, Google, and most agent frameworks through 2025–2026, is the agent-side analog to USB-C: a single protocol an LLM client speaks to any compatible server (filesystem, database, SaaS app, internal API) to discover tools and call them.

For website operators, MCP matters in two ways. First, you can expose your own MCP server (e.g. at /.well-known/mcp.json) so that ChatGPT, Claude, and any MCP-aware client can invoke your APIs directly inside a conversation — turning your product into a first-class agent tool. Second, MCP-aware crawlers increasingly prefer sites that publish a server card over scraping HTML, because the tool surface is precise and auditable.

The "truly agent-native" frontier through 2027 is shifting from "be readable" to "be invocable." A site with a published MCP server gets cited and gets used — competing not for SERP position but for tool-call slots inside the conversation.`,
    category: "Protocols",
    related: ["agent-readability", "well-known"],
    sources: [
      { label: "MCP spec", url: "https://modelcontextprotocol.io/" },
    ],
  },
  {
    slug: "geo",
    term: "Generative Engine Optimization (GEO)",
    short:
      "The practice of optimizing content and infrastructure to be cited by AI engines like ChatGPT, Perplexity, and Google AI Overviews.",
    long: `Generative Engine Optimization (GEO) is the successor discipline to SEO for a world where users get answers from LLMs instead of clicking blue links. Where SEO optimizes for ranking position on a results page, GEO optimizes for being the source an AI engine quotes in its synthesized answer.

The shift matters because 83% of AI citations come from outside the organic top 10 — the classical ranking ladder doesn't predict citation. GEO instead rewards: front-loaded answers (the claim in the first 50–70 words), structured data (JSON-LD that confirms entities and facts), agent-readable infrastructure (llms.txt, semantic HTML, fast TTFB, no JS-only content), and originality (Information Gain — does this page add something not already in the LLM's training data?).

The market is moving fast: $886M in 2024 → projected $7.3B by 2031 (34% CAGR). Google AI Overviews now fire on 48% of queries; AI-referred traffic is up 527% year-over-year.`,
    category: "Optimization",
    related: ["agent-readability", "citability", "information-gain"],
  },
  {
    slug: "information-gain",
    term: "Information Gain",
    short:
      "How much novel information a page adds to what an AI engine already knows from training data.",
    long: `Information Gain is the criterion ranking engines and LLMs use to decide whether a page is worth citing rather than just paraphrasing from training data. A page with high Information Gain contains facts, numbers, dates, named entities, quotes, or original research that the model could not reconstruct from prior context. A page with low Information Gain — generic explainer content, listicles aggregated from other sources, AI-generated rewrites — is filtered out.

Perplexity, Google Gemini, and Claude's search bot all weight Information Gain heavily. It's why first-party data (original survey results, internal benchmarks, proprietary datasets) consistently outperforms thin SEO content in AI citations, even when the SEO content ranks higher in classical search.

Practical implications: ship one number that doesn't exist elsewhere on the internet and you'll get cited. Rewrite the same definition fifty competitors already publish and you'll be invisible.`,
    category: "Optimization",
    related: ["citability", "geo"],
  },
  {
    slug: "citability",
    term: "Citability",
    short:
      "The structural and stylistic properties that make a passage easy for an LLM to lift verbatim.",
    long: `Citability is the property of being quotable. AI engines synthesize answers by extracting sentence-level claims from sources; a passage is citable when it (a) makes a single self-contained claim, (b) front-loads the claim before any qualifying clause, (c) names specific entities and numbers, and (d) is short enough to lift without truncation.

"73% of websites are silently excluded from AI citations because of fixable technical issues" is citable: one claim, a number, an entity (websites), a mechanism (technical issues). "Many websites unfortunately struggle with various issues that can sometimes prevent them from being properly indexed by today's AI systems" carries the same idea but is not citable — no number, hedged, buried subject.

The citation.is /check scanner scores citability per page by measuring answer-first paragraphs, number/date density, named-entity coverage, and listicle structure. High-citability pages tend to score above 80; SEO-template marketing copy usually scores below 50.`,
    category: "Optimization",
    related: ["information-gain", "geo", "agent-readability"],
  },
  {
    slug: "agent-native",
    term: "Agent-Native",
    short:
      "Built from the ground up to be operated by AI agents, not just readable by them.",
    long: `Agent-native is the step beyond agent-readable. An agent-readable site can be parsed and cited. An agent-native site can be used — its capabilities are exposed as machine-callable tools (MCP server, OpenAPI, well-known endpoints), its content is structured for programmatic consumption, and its UX assumes the primary visitor might be an LLM acting on behalf of a human.

Concretely, agent-native sites publish: /.well-known/mcp.json (MCP server card), /.well-known/api-catalog (RFC 9727 API directory), llms.txt (curated brief), JSON-LD across every entity, and stable JSON endpoints for any data a human reader can see. They render fully server-side, serve sub-200ms TTFB, and treat HTML as one of several output formats rather than the only one.

citation.is builds in this category. As of 2026 the agent-native web is roughly 0.4% of indexed marketing sites — first-mover citation advantage is still wide open.`,
    category: "Optimization",
    related: ["mcp", "agent-readability", "well-known"],
  },
  {
    slug: "json-ld",
    term: "JSON-LD",
    short:
      "JSON-based structured data format used by schema.org to describe entities for search engines and LLMs.",
    long: `JSON-LD (JSON for Linking Data) is the W3C-recommended serialization for schema.org structured data. It's a <script type="application/ld+json"> block in a page's <head> describing the entities on the page — Organization, Product, FAQPage, Article, BreadcrumbList, and 800+ other types — in a graph format that search engines and LLMs can ingest without parsing prose.

Why it matters for AI citations: LLMs use JSON-LD to verify the entities they extract from a page. A claim like "citation.is charges $2,400 for a 48-hour build" is more likely to be cited if the page also ships Product JSON-LD with offers.price = "2400" and a matching name. The schema confirms the prose; the prose without the schema is treated as less reliable.

Rule of thumb: every entity that appears in the visible content should appear in JSON-LD. Don't ship FAQ visual sections without FAQPage schema, don't ship product pages without Product schema, don't ship articles without Article schema. Validate with Google's Rich Results Test or schema.org validator before publishing.`,
    category: "Schema",
    related: ["schema-org", "faqpage", "defined-term"],
  },
  {
    slug: "schema-org",
    term: "schema.org",
    short:
      "A collaborative vocabulary of structured-data types maintained by Google, Microsoft, Yahoo, and Yandex.",
    long: `schema.org is the canonical vocabulary used inside JSON-LD (and microdata, and RDFa) to describe what's on a page. Launched in 2011 by the major search engines, it now defines 800+ types — from Person, Organization, and Product to MedicalCondition and TouristAttraction — with thousands of properties.

For LLM citations, schema.org acts as the shared ontology between content and machine. When you tag a page with Article + author (Person with sameAs links) + datePublished, you're telling every parser the same story in the same vocabulary. This is what lets Perplexity confidently cite "according to citation.is, published May 2026" instead of vague paraphrase.

Pick the most specific type that fits (TechArticle beats Article beats CreativeWork) and stack types when more than one applies (a page can be both Article and BreadcrumbList).`,
    category: "Schema",
    related: ["json-ld", "defined-term", "faqpage"],
  },
  {
    slug: "defined-term",
    term: "DefinedTerm (schema.org)",
    short:
      "A schema.org type for marking up a single glossary definition so LLMs can lift it as a definitional citation.",
    long: `DefinedTerm is the schema.org type for individual terms in a controlled vocabulary or glossary. It carries name (the term), description (the definition), inDefinedTermSet (the parent glossary), and optional termCode and url. Wrap each glossary entry in a DefinedTerm and the parent index in a DefinedTermSet and you produce a machine-readable dictionary that LLMs treat as authoritative for definitional queries ("what is llms.txt?").

This is one of the highest-leverage schemas for AI citations: definitional questions are extremely common, the answer surface area is small, and there are very few canonical sources. A well-tagged glossary entry can become the cited source across dozens of LLM queries per day.`,
    category: "Schema",
    related: ["json-ld", "schema-org"],
  },
  {
    slug: "faqpage",
    term: "FAQPage",
    short:
      "A schema.org type for marking up question-and-answer pairs so search engines and LLMs can extract them directly.",
    long: `FAQPage is the schema.org type for a page that presents a list of Q&A pairs. Each item is a Question with an acceptedAnswer of type Answer. Properly tagged FAQPages can trigger rich results in Google search, get extracted directly into AI Overviews, and are heavily favored by Perplexity for "how do I…" / "what is…" queries.

The 2023 Google policy change limited FAQ rich results to medical and government sites, but the LLM citation value is unchanged and arguably grew — chat engines still parse and quote FAQ JSON-LD aggressively. Ship FAQ schema on pricing pages, product pages, and any page where you'd otherwise lose the visitor to an AI search for the same answer.`,
    category: "Schema",
    related: ["json-ld", "schema-org"],
  },
  {
    slug: "robots-txt",
    term: "robots.txt",
    short:
      "A text file at /robots.txt that tells crawlers which paths they may or may not fetch.",
    long: `robots.txt is the original web-crawler control file, published by Martijn Koster in 1994. It uses per-user-agent Allow and Disallow directives to permit or block access. For AI citations, the file is now the single highest-leverage configuration on a site: a one-line mistake here is the most common reason a site is invisible to ChatGPT or Perplexity.

The critical distinction: training-only bots (GPTBot, Google-Extended, anthropic-ai, Meta-ExternalAgent, CCBot) use different user-agents from search/citation bots (OAI-SearchBot, ChatGPT-User, PerplexityBot, ClaudeBot, Googlebot, bingbot, FacebookBot). Blocking GPTBot does NOT block ChatGPT citations — it only opts out of model training. Blocking OAI-SearchBot does. Most "block all AI" robots.txt files unintentionally do both.

A well-formed AI-aware robots.txt explicitly Allows search bots (even if Allow: / already permits them, the explicit block defends against future blanket disallows), and optionally Disallows training bots if the site owner opts out of training.`,
    category: "Crawlers",
    related: ["oai-searchbot", "perplexitybot", "claudebot", "gptbot"],
    sources: [
      { label: "robotstxt.org", url: "https://www.robotstxt.org/" },
    ],
  },
  {
    slug: "oai-searchbot",
    term: "OAI-SearchBot",
    short:
      "OpenAI's crawler for ChatGPT search citations — distinct from GPTBot (training).",
    long: `OAI-SearchBot is the user-agent OpenAI uses to fetch pages for ChatGPT's live search and Browse features. It is the bot you must allow to be cited inside ChatGPT answers. Blocking GPTBot (the training crawler) does not block OAI-SearchBot.

Typical volume on a mid-traffic site: 3,000–5,000 hits/day. Respects robots.txt, follows redirects, executes minimal JavaScript. Prefers fast TTFB (<300ms) — sites that timeout during peak query bursts get dropped from the citation index.

Critical configuration: in robots.txt add an explicit User-agent: OAI-SearchBot block with Allow: /. See /crawlers/oai-searchbot for full IP ranges, JS handling, and rate limits.`,
    category: "Crawlers",
    related: ["robots-txt", "perplexitybot", "claudebot"],
  },
  {
    slug: "perplexitybot",
    term: "PerplexityBot",
    short:
      "Perplexity's primary crawler for live search citations — bursty traffic, listicle-favoring.",
    long: `PerplexityBot fetches pages on demand when Perplexity users run queries. Unlike steady-state crawlers, it is bursty — viral queries can drive 240+ requests/minute against a single source. Sites with strict rate limiting frequently 429 PerplexityBot during traffic spikes and silently drop out of the citation set.

Perplexity citations favor listicles, numbered structures, and short definitional passages. Pages with H2/H3 lists ("5 ways to…", "3 differences between…") consistently outperform prose-heavy alternatives, even when the prose is more accurate. Edge caching is effectively mandatory; on-origin SSR without a CDN will lose Perplexity traffic.`,
    category: "Crawlers",
    related: ["robots-txt", "oai-searchbot", "claudebot"],
  },
  {
    slug: "claudebot",
    term: "ClaudeBot / Claude-SearchBot",
    short:
      "Anthropic's crawlers — ClaudeBot for general fetches, Claude-SearchBot for Claude's live web search.",
    long: `Anthropic operates two production crawlers. ClaudeBot is the general-purpose fetch agent used by Claude when a user pastes a URL or asks about a public page. Claude-SearchBot is the live-search crawler analogous to OAI-SearchBot, fetching pages to compose answers for Claude's web-search feature.

Both run depth-first rather than breadth-first — they tend to crawl a small number of sites very thoroughly rather than touching many sites lightly. /docs and /api paths are heavily favored; technical reference material is the highest-citation content type. Typical daily volume: 1,500–2,000 hits on a mid-traffic site, concentrated on long-form pages.

Note: anthropic-ai is the separate training-only user-agent. Blocking it does not affect Claude citations.`,
    category: "Crawlers",
    related: ["robots-txt", "oai-searchbot", "perplexitybot"],
  },
  {
    slug: "gptbot",
    term: "GPTBot",
    short:
      "OpenAI's training-data crawler — blocking it opts out of model training but does NOT block ChatGPT citations.",
    long: `GPTBot is OpenAI's crawler for collecting training data for future model versions. It is separate from OAI-SearchBot (live citations) and ChatGPT-User (user-initiated fetches). The most common AI-bot configuration mistake on the web is conflating GPTBot with OAI-SearchBot — robots.txt files that "block ChatGPT" by Disallowing GPTBot actually leave ChatGPT citations untouched while opting out of training.

Allow GPTBot if you want your content used to train future GPT models (citations may follow as a long-tail benefit). Disallow GPTBot if you opt out of training but still want to appear in ChatGPT answers — and confirm OAI-SearchBot is explicitly Allowed in the same file.`,
    category: "Crawlers",
    related: ["oai-searchbot", "robots-txt", "google-extended"],
  },
  {
    slug: "google-extended",
    term: "Google-Extended",
    short:
      "Google's training-data opt-out user-agent — does NOT affect Googlebot or AI Overviews.",
    long: `Google-Extended is a user-agent token (no separate crawler — it piggybacks on Googlebot fetches) that lets site owners opt out of having their content used to improve Gemini and Vertex AI models. It does not affect Google Search indexing or AI Overviews citations — those continue to use Googlebot.

Disallow: Google-Extended in robots.txt is the right move for sites that want to be indexed and cited but not used as training data. It is silently ignored by all other crawlers.`,
    category: "Crawlers",
    related: ["gptbot", "robots-txt"],
  },
  {
    slug: "well-known",
    term: "/.well-known/",
    short:
      "An IETF-standard URL path (RFC 8615) for site-wide metadata files that agents and protocols discover automatically.",
    long: `The /.well-known/ path is the IETF-blessed location for site-level metadata files. Originally introduced for protocols like ACME (Let's Encrypt) and OAuth, it has become the discovery surface for agent-native infrastructure: /.well-known/mcp.json (MCP server card), /.well-known/api-catalog (RFC 9727 API directory), /.well-known/oauth-authorization-server, /.well-known/jwks.json, /.well-known/http-message-signatures-directory.

Why it matters: an agent that lands on citation.is and wants to know "what tools does this site expose?" doesn't crawl — it issues exactly one GET to /.well-known/mcp.json. Sites that ship these endpoints are first-class citizens in agent frameworks; sites that don't require fallback scraping and are deprioritized.`,
    category: "Infrastructure",
    related: ["mcp", "agent-native"],
    sources: [
      { label: "RFC 8615", url: "https://datatracker.ietf.org/doc/html/rfc8615" },
    ],
  },
  {
    slug: "ttfb",
    term: "TTFB (Time to First Byte)",
    short:
      "How long after a request before the server's first byte of response arrives — AI crawlers timeout at 1–5s.",
    long: `Time to First Byte is the latency from request sent to first response byte received. For human visitors, anything under 800ms is acceptable. For AI crawlers, the budget is much tighter: OAI-SearchBot, PerplexityBot, and Google AI Overviews bots typically timeout between 1 and 5 seconds, with many requests cancelled at the 1.5s mark to keep chat response latency low.

The implication: a site that takes 2.5s TTFB might rank fine in Google but be invisible to ChatGPT and Perplexity. Edge caching at the HTML layer (Cloudflare s-maxage with stale-while-revalidate) is the single highest-leverage fix — it converts on-origin SSR latency into sub-100ms cache hits.

Target: under 200ms for full GEO compliance. Under 800ms to pass /check. Above 1.5s, expect dropped citations.`,
    category: "Metrics",
    related: ["agent-readability"],
  },
  {
    slug: "ssr",
    term: "SSR (Server-Side Rendering)",
    short:
      "Rendering HTML on the server so the response body contains full content — required for AI crawlers.",
    long: `Server-Side Rendering returns fully-formed HTML in the initial response, in contrast to Client-Side Rendering (CSR) where the server returns a near-empty shell and JavaScript builds the page in the browser. Every major AI crawler — OAI-SearchBot, PerplexityBot, ClaudeBot, FacebookBot — either does not execute JavaScript at all or executes a limited subset on a strict time budget.

CSR-only sites (vanilla create-react-app, Vue SPA without nuxt, Svelte SPA without SvelteKit) are silently invisible to most AI engines. The HTML they return contains <div id="root"></div> and a script tag — no content for the crawler to cite. SSR (Next.js, Nuxt, SvelteKit, TanStack Start, Remix) or static prerendering is mandatory for agent-readable sites.

Test: curl -A "OAI-SearchBot" https://your-site/ and grep the response for your main heading. If it's missing, you're CSR-only.`,
    category: "Infrastructure",
    related: ["ttfb", "agent-readability"],
  },
  {
    slug: "ai-overviews",
    term: "AI Overviews",
    short:
      "Google's AI-generated answer panel that appears above traditional search results on 48% of queries.",
    long: `AI Overviews is Google's Gemini-powered synthesized answer panel, rolled out broadly in 2024–2025. As of mid-2026 it fires on roughly 48% of queries, with citation links to 3–8 source pages per answer. Pages cited in AI Overviews receive elevated click-through despite the answer being shown upfront — users click sources to verify claims and dive deeper.

Optimization for AI Overviews skews toward classical E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) plus answer-first structure: a 50–70 word direct answer at the top, FAQ and HowTo schema, quarterly content refresh, named author with credentials. AI Overviews are more conservative than Perplexity or ChatGPT — they favor established sources but reward freshness and originality heavily.`,
    category: "Optimization",
    related: ["geo", "citability", "faqpage"],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}

export function getGlossaryByCategory(): Record<string, GlossaryTerm[]> {
  const out: Record<string, GlossaryTerm[]> = {};
  for (const t of GLOSSARY) {
    (out[t.category] ||= []).push(t);
  }
  return out;
}
