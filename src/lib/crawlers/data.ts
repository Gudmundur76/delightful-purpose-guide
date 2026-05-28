// Reference data for the major AI / search crawlers. Each entry powers
// the /crawlers index and a dedicated /crawlers/{slug} page with
// TechArticle JSON-LD for citation queries like "what is OAI-SearchBot?".

export type CrawlerPurpose = "search" | "training" | "user-fetch" | "hybrid";

export interface Crawler {
  slug: string;
  name: string;
  operator: string;
  purpose: CrawlerPurpose;
  powers: string; // what product/feature this bot feeds
  userAgents: string[];
  robotsToken: string; // the token to use in User-agent: line
  recommendation: "allow" | "block-for-opt-out" | "block-if-not-using";
  recommendationText: string;
  short: string; // one-liner, used as meta description
  details: string; // multi-paragraph long form
  respectsRobots: boolean;
  executesJs: "no" | "limited" | "yes";
  typicalVolume: string;
  ipRanges?: string; // URL or note
  docs?: { label: string; url: string }[];
  citationsImpact: string; // one sentence summary of impact on AI citations
}

export const CRAWLERS: Crawler[] = [
  {
    slug: "oai-searchbot",
    name: "OAI-SearchBot",
    operator: "OpenAI",
    purpose: "search",
    powers: "ChatGPT Search, ChatGPT Browse citations",
    userAgents: [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
    ],
    robotsToken: "OAI-SearchBot",
    recommendation: "allow",
    recommendationText:
      "Allow. This is the bot that decides whether your site can be cited inside ChatGPT answers. Blocking it makes you invisible to ~700M weekly ChatGPT users.",
    short:
      "OpenAI's crawler for ChatGPT search citations. Distinct from GPTBot (training). Allow it to appear in ChatGPT answers.",
    details: `OAI-SearchBot is the user-agent OpenAI uses to fetch pages for ChatGPT's Search and Browse features. When a ChatGPT user asks a question that triggers live retrieval, OAI-SearchBot fetches candidate pages in real time and feeds them to GPT for answer synthesis with citation links.

This is the single most important AI crawler to allow as of 2026. ChatGPT serves ~700M weekly active users and citations from its search feature drive significant referral traffic. The most common mistake on the web is conflating OAI-SearchBot with GPTBot (OpenAI's training-data crawler, a separate user-agent) — robots.txt files that "block ChatGPT" by Disallowing GPTBot leave citations intact, while files that Disallow OAI-SearchBot silently kill them.

Behavior: respects robots.txt strictly, follows up to 5 redirects, executes minimal JavaScript (single-pass, ~3s budget). Prefers fast TTFB; sites that timeout get deprioritized. Sends an Accept-Language header matching the ChatGPT user's locale.`,
    respectsRobots: true,
    executesJs: "limited",
    typicalVolume: "3,000–5,000 hits/day on a mid-traffic site",
    ipRanges:
      "https://platform.openai.com/docs/bots — OpenAI publishes current IP CIDR ranges; verify reverse-DNS to oai-searchbot.openai.com",
    docs: [
      { label: "OpenAI bot docs", url: "https://platform.openai.com/docs/bots" },
    ],
    citationsImpact:
      "Blocking this bot makes a site invisible inside ChatGPT Search — the highest-volume AI citation surface as of 2026.",
  },
  {
    slug: "chatgpt-user",
    name: "ChatGPT-User",
    operator: "OpenAI",
    purpose: "user-fetch",
    powers: "User-initiated URL fetches inside ChatGPT",
    userAgents: [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot",
    ],
    robotsToken: "ChatGPT-User",
    recommendation: "allow",
    recommendationText:
      "Allow. This is the bot used when a ChatGPT user pastes your URL or asks about your specific page. Blocking it breaks user-initiated workflows.",
    short:
      "OpenAI's user-initiated fetch bot. Fires when a ChatGPT user pastes a URL or asks about a specific page.",
    details: `ChatGPT-User fetches pages on direct user action: a pasted URL, a "summarize this page" request, or a plugin/tool that resolves a link. Unlike OAI-SearchBot (which runs automated retrieval for search queries) and GPTBot (which crawls for training), ChatGPT-User runs only when there's a human in the loop on the OpenAI side.

Volume is low and bursty — only fires for pages users explicitly point ChatGPT at. Blocking it tends to surface as user-facing errors ("I couldn't access that page") rather than silent invisibility, but the UX damage is real: a prospect who tries to share your URL with ChatGPT and gets a refusal is unlikely to come back.`,
    respectsRobots: true,
    executesJs: "limited",
    typicalVolume: "10–200 hits/day depending on URL share frequency",
    docs: [
      { label: "OpenAI bot docs", url: "https://platform.openai.com/docs/bots" },
    ],
    citationsImpact:
      "Blocking creates visible UX failures when users share your URL in ChatGPT, even though it doesn't affect automated citations directly.",
  },
  {
    slug: "gptbot",
    name: "GPTBot",
    operator: "OpenAI",
    purpose: "training",
    powers: "Future GPT model training data",
    userAgents: [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot",
    ],
    robotsToken: "GPTBot",
    recommendation: "block-for-opt-out",
    recommendationText:
      "Block only if you want to opt out of training future GPT models. Blocking does NOT affect ChatGPT citations — that's OAI-SearchBot. Confirm OAI-SearchBot is explicitly Allowed in the same file.",
    short:
      "OpenAI's training-data crawler. Blocking it opts out of GPT model training but does NOT block ChatGPT citations.",
    details: `GPTBot is OpenAI's crawler for collecting training data for future model versions. It is the source of the persistent confusion in the AI-bots ecosystem: thousands of high-traffic sites Disallow GPTBot believing they are "blocking ChatGPT," then are surprised when they still appear in ChatGPT citations — because citations come from OAI-SearchBot, a separate user-agent.

Decision framework: Allow if you want your public content used to improve future GPT models (which may yield long-tail citation benefit). Disallow if you opt out of training but still want to be cited live — and in that case explicitly Allow OAI-SearchBot in the same robots.txt to make the intent unambiguous.

Behavior: respects robots.txt strictly, no JavaScript execution, polite crawl pace. Publishes IP ranges for verification.`,
    respectsRobots: true,
    executesJs: "no",
    typicalVolume: "500–2,000 hits/day, slow steady pace",
    docs: [
      { label: "OpenAI bot docs", url: "https://platform.openai.com/docs/bots" },
    ],
    citationsImpact:
      "Blocking does NOT affect ChatGPT citations — only opts out of model training. The most-misconfigured bot on the AI web.",
  },
  {
    slug: "perplexitybot",
    name: "PerplexityBot",
    operator: "Perplexity",
    purpose: "search",
    powers: "Perplexity AI live search and citations",
    userAgents: [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot",
    ],
    robotsToken: "PerplexityBot",
    recommendation: "allow",
    recommendationText:
      "Allow. Perplexity is the second-largest AI citation surface and the most generous about driving referral traffic — its UI prominently links to cited sources.",
    short:
      "Perplexity's primary search crawler. Bursty traffic, listicle-favoring, requires edge caching to survive viral spikes.",
    details: `PerplexityBot fetches pages on demand when Perplexity users run queries. Unlike steady-rate crawlers, it is heavily bursty — a viral query on Twitter/HN can drive 240+ requests/minute against a single source. Sites with strict origin rate limits frequently 429 PerplexityBot during spikes and silently drop out of the citation set for the duration.

Perplexity's answer format heavily favors listicles: "5 ways to…", "3 differences between X and Y", numbered H2/H3 sections. Pages with explicit list structure consistently outperform prose-heavy alternatives even when prose is more accurate. Perplexity also prioritizes freshness more than ChatGPT — content updated in the last 90 days gets a citation boost.

Critical infrastructure note: edge caching is effectively mandatory. On-origin SSR without a CDN layer will lose Perplexity traffic during viral spikes. Cloudflare with s-maxage + stale-while-revalidate is the standard fix.`,
    respectsRobots: true,
    executesJs: "limited",
    typicalVolume: "1,000–4,000 hits/day, bursty",
    ipRanges:
      "https://docs.perplexity.ai/guides/bots — IPs published, reverse-DNS to perplexitybot.com",
    docs: [
      { label: "Perplexity bot docs", url: "https://docs.perplexity.ai/guides/bots" },
    ],
    citationsImpact:
      "Blocking removes you from Perplexity's citation panel — the highest referral-CTR AI surface.",
  },
  {
    slug: "perplexity-user",
    name: "Perplexity-User",
    operator: "Perplexity",
    purpose: "user-fetch",
    powers: "User-triggered URL fetches inside Perplexity",
    userAgents: [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Perplexity-User/1.0; +https://perplexity.ai/perplexity-user",
    ],
    robotsToken: "Perplexity-User",
    recommendation: "allow",
    recommendationText:
      "Allow. Fires when a Perplexity user pastes your URL — blocking causes visible UX failures.",
    short:
      "Perplexity's user-initiated fetch bot. Like ChatGPT-User but for Perplexity.",
    details: `Perplexity-User is the analog of OpenAI's ChatGPT-User: fired when a Perplexity user pastes a URL or asks about a specific page, not when running automated search. Volume is low. Blocking it surfaces as visible failures in the Perplexity UI when users try to share your link.`,
    respectsRobots: true,
    executesJs: "limited",
    typicalVolume: "5–50 hits/day",
    docs: [
      { label: "Perplexity bot docs", url: "https://docs.perplexity.ai/guides/bots" },
    ],
    citationsImpact:
      "Low automated impact, but blocking breaks the share-to-Perplexity flow.",
  },
  {
    slug: "claudebot",
    name: "ClaudeBot",
    operator: "Anthropic",
    purpose: "hybrid",
    powers: "Claude live page fetches and (historically) training data",
    userAgents: [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0; +claudebot@anthropic.com",
    ],
    robotsToken: "ClaudeBot",
    recommendation: "allow",
    recommendationText:
      "Allow. ClaudeBot is the general-purpose fetch agent for Claude. Anthropic operates a separate anthropic-ai token for training opt-outs.",
    short:
      "Anthropic's general-purpose Claude crawler. Depth-first, favors technical docs and API references.",
    details: `ClaudeBot is Anthropic's main crawler — used by Claude when a user pastes a URL, asks about a public page, or when Claude's tool-use feature browses the web. Anthropic also operates Claude-SearchBot (live search-specific) and anthropic-ai (training-only opt-out token).

ClaudeBot runs depth-first: it tends to crawl a small number of sites very thoroughly rather than touching many sites lightly. /docs, /api, and reference paths are heavily favored. Technical reference material is consistently the highest-citation content type in Claude answers. Long-form authoritative content outperforms short marketing copy in Claude's citation selection.`,
    respectsRobots: true,
    executesJs: "limited",
    typicalVolume: "1,500–2,000 hits/day on docs-heavy sites",
    docs: [
      { label: "Anthropic crawler info", url: "https://support.anthropic.com/en/articles/8896518" },
    ],
    citationsImpact:
      "Blocking removes you from Claude answers and from Claude Code / Claude Desktop tool-use responses.",
  },
  {
    slug: "claude-searchbot",
    name: "Claude-SearchBot",
    operator: "Anthropic",
    purpose: "search",
    powers: "Claude's live web search feature",
    userAgents: [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; Claude-SearchBot/1.0; +claudebot@anthropic.com",
    ],
    robotsToken: "Claude-SearchBot",
    recommendation: "allow",
    recommendationText:
      "Allow. The search-specific Claude crawler — distinct from anthropic-ai (training).",
    short:
      "Anthropic's live-search crawler. Powers Claude's web search citations specifically.",
    details: `Claude-SearchBot is the Anthropic equivalent of OAI-SearchBot: a crawler dedicated to fetching pages for Claude's live web-search feature. Separate user-agent from ClaudeBot (general fetches) and anthropic-ai (training). All three are independent — robots.txt rules apply per-token.`,
    respectsRobots: true,
    executesJs: "limited",
    typicalVolume: "500–1,500 hits/day",
    docs: [
      { label: "Anthropic crawler info", url: "https://support.anthropic.com/en/articles/8896518" },
    ],
    citationsImpact:
      "Blocking removes you from Claude's web-search citations specifically.",
  },
  {
    slug: "anthropic-ai",
    name: "anthropic-ai",
    operator: "Anthropic",
    purpose: "training",
    powers: "Anthropic model training data opt-out token",
    userAgents: [
      "anthropic-ai (token used in robots.txt — no separate crawler user-agent)",
    ],
    robotsToken: "anthropic-ai",
    recommendation: "block-for-opt-out",
    recommendationText:
      "Block only if you want to opt out of Claude model training. Does NOT affect Claude citations — those use ClaudeBot and Claude-SearchBot.",
    short:
      "Anthropic's training opt-out user-agent. Like Google-Extended — blocking it opts out of training without affecting citations.",
    details: `anthropic-ai is the user-agent token Anthropic publishes for training opt-outs. Disallowing it in robots.txt tells Anthropic not to use your content for training future Claude models. It does not affect ClaudeBot or Claude-SearchBot — those continue to operate under their own tokens.

Same pattern as Google-Extended: opt-out signal only, no actual crawl traffic under this user-agent.`,
    respectsRobots: true,
    executesJs: "no",
    typicalVolume: "Token-only — no traffic appears under this user-agent",
    citationsImpact:
      "No impact on citations. Blocking is a pure training opt-out signal.",
  },
  {
    slug: "googlebot",
    name: "Googlebot",
    operator: "Google",
    purpose: "search",
    powers: "Google Search, AI Overviews citations",
    userAgents: [
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) … Googlebot/2.1",
    ],
    robotsToken: "Googlebot",
    recommendation: "allow",
    recommendationText:
      "Allow. Googlebot powers both classical search and AI Overviews — the largest combined source of AI-cited traffic.",
    short:
      "Google's primary crawler. Powers both classical search and AI Overviews — the largest single source of AI citations.",
    details: `Googlebot is the original web crawler and as of 2026 still the highest-volume source of AI citations on the open web, because it now serves dual purpose: indexing for Google Search (and downstream AI Overviews) as well as feeding Gemini's grounded responses. AI Overviews fires on ~48% of queries with 3–8 cited sources each.

Googlebot is the most capable JS-rendering crawler in production — it executes JavaScript on a second-pass render, which means CSR sites partially survive Googlebot when they're invisible to OAI-SearchBot and PerplexityBot. Don't rely on it though; SSR remains the right answer for AI-readability across the board.

For Gemini training opt-out specifically, use the separate Google-Extended token.`,
    respectsRobots: true,
    executesJs: "yes",
    typicalVolume: "Highly variable — thousands to millions of hits/day",
    docs: [
      { label: "Google crawler docs", url: "https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers" },
    ],
    citationsImpact:
      "Blocking is functionally disconnecting from the open web — kills Google Search, AI Overviews, and Gemini grounding simultaneously.",
  },
  {
    slug: "google-extended",
    name: "Google-Extended",
    operator: "Google",
    purpose: "training",
    powers: "Gemini and Vertex AI model training opt-out token",
    userAgents: [
      "Google-Extended (token used in robots.txt — piggybacks on Googlebot fetches)",
    ],
    robotsToken: "Google-Extended",
    recommendation: "block-for-opt-out",
    recommendationText:
      "Block only if you want to opt out of Gemini/Vertex training. Does NOT affect Googlebot, Google Search, or AI Overviews citations.",
    short:
      "Google's Gemini training opt-out. Does NOT affect Googlebot or AI Overviews — only opts out of training.",
    details: `Google-Extended is not a separate crawler — it's a token piggybacking on Googlebot fetches. Disallowing it in robots.txt tells Google not to use your content for training Gemini or Vertex AI models. Googlebot continues to crawl for Search and AI Overviews under its own rules.

This is the cleanest training opt-out in the ecosystem: zero impact on citations or indexing, single line in robots.txt.`,
    respectsRobots: true,
    executesJs: "no",
    typicalVolume: "Token-only — no separate traffic",
    docs: [
      { label: "Google-Extended docs", url: "https://blog.google/technology/ai/an-update-on-web-publisher-controls/" },
    ],
    citationsImpact:
      "No impact on citations or indexing. Pure training opt-out.",
  },
  {
    slug: "bingbot",
    name: "bingbot",
    operator: "Microsoft",
    purpose: "search",
    powers: "Bing Search, Microsoft Copilot citations",
    userAgents: [
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    ],
    robotsToken: "bingbot",
    recommendation: "allow",
    recommendationText:
      "Allow. bingbot feeds Microsoft Copilot citations — the third-largest AI answer surface after ChatGPT and Google.",
    short:
      "Microsoft's crawler. Powers Bing Search and feeds Copilot citations across Windows, Edge, and Microsoft 365.",
    details: `bingbot is Microsoft's primary crawler. It indexes for Bing Search and downstream feeds Copilot's web citations across Windows, Edge browser, Microsoft 365, and the standalone Copilot apps. Combined Copilot reach is in the hundreds of millions of users; bingbot is therefore high-leverage despite Bing's smaller direct search share.

Behavior is close to Googlebot — respects robots.txt, executes JavaScript on a second pass, polite crawl pace. Microsoft publishes IP ranges for verification.`,
    respectsRobots: true,
    executesJs: "yes",
    typicalVolume: "Hundreds to thousands of hits/day",
    docs: [
      { label: "Bing webmaster docs", url: "https://www.bing.com/webmasters/help/which-crawlers-does-bing-use-8c184ec0" },
    ],
    citationsImpact:
      "Blocking removes you from Microsoft Copilot citations across the entire Microsoft ecosystem.",
  },
  {
    slug: "facebookbot",
    name: "FacebookBot",
    operator: "Meta",
    purpose: "search",
    powers: "Meta AI citations across WhatsApp, Instagram, Facebook",
    userAgents: [
      "facebookexternalhit/1.1",
      "Meta-ExternalFetcher/1.0",
      "FacebookBot/1.0",
    ],
    robotsToken: "FacebookBot",
    recommendation: "allow",
    recommendationText:
      "Allow FacebookBot. Block the separate Meta-ExternalAgent token if you want to opt out of Meta model training.",
    short:
      "Meta's citation crawler. Powers Meta AI citations across WhatsApp, Instagram, and Facebook chat.",
    details: `FacebookBot is Meta's crawler for live AI citations across the Meta AI assistant integrated into WhatsApp, Instagram, Facebook, and the standalone Meta.ai web app. It is distinct from Meta-ExternalAgent (training-only) and facebookexternalhit (OpenGraph preview fetcher) — though all three are operated by Meta and share infrastructure.

Volume is high on consumer-facing content and lower on B2B/dev-tool sites, mirroring Meta's user base. Compliance with robots.txt is good for FacebookBot but historically inconsistent for Meta-ExternalAgent.`,
    respectsRobots: true,
    executesJs: "limited",
    typicalVolume: "Highly variable — high for consumer content",
    docs: [
      { label: "Meta crawlers", url: "https://developers.facebook.com/docs/sharing/bot" },
    ],
    citationsImpact:
      "Blocking removes you from Meta AI citations across the entire Meta consumer ecosystem.",
  },
  {
    slug: "meta-externalagent",
    name: "Meta-ExternalAgent",
    operator: "Meta",
    purpose: "training",
    powers: "Meta Llama model training",
    userAgents: [
      "Meta-ExternalAgent/1.0 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)",
    ],
    robotsToken: "Meta-ExternalAgent",
    recommendation: "block-for-opt-out",
    recommendationText:
      "Block if you opt out of Llama training. Note: historically the least-compliant major-vendor crawler — some operators block by IP as well.",
    short:
      "Meta's Llama training crawler. Aggressive and historically less robots.txt-compliant than other major vendors.",
    details: `Meta-ExternalAgent is Meta's training-data crawler for Llama models. It has the worst robots.txt compliance reputation among major-vendor crawlers — multiple site operators have reported continued fetches after Disallow rules were added. Many production sites block it at the WAF layer (Cloudflare, AWS WAF) in addition to robots.txt.

Distinct from FacebookBot (citations) and facebookexternalhit (link previews). The three operate independently.`,
    respectsRobots: true,
    executesJs: "no",
    typicalVolume: "Variable; can spike aggressively",
    docs: [
      { label: "Meta crawlers", url: "https://developers.facebook.com/docs/sharing/bot" },
    ],
    citationsImpact:
      "No impact on citations. Pure training crawler — but consider WAF-level blocking if robots.txt is ignored.",
  },
  {
    slug: "ccbot",
    name: "CCBot",
    operator: "Common Crawl",
    purpose: "training",
    powers: "Common Crawl open dataset (used by virtually every LLM provider)",
    userAgents: ["CCBot/2.0 (https://commoncrawl.org/faq/)"],
    robotsToken: "CCBot",
    recommendation: "block-if-not-using",
    recommendationText:
      "Allow if you're comfortable with your content appearing in open LLM training datasets. Block if you want broad training opt-out — Common Crawl feeds nearly every major LLM provider.",
    short:
      "Common Crawl's open-dataset crawler. Indirectly feeds training for nearly every major LLM.",
    details: `CCBot is the crawler for Common Crawl, the open web archive that has been a primary training source for nearly every major LLM (GPT-3, the LLaMA family, Mistral, many open-source models). Blocking CCBot is an indirect but effective broad training opt-out — content not in Common Crawl is harder for new model entrants to ingest.

Note that blocking CCBot does not retroactively remove content from past Common Crawl snapshots already used in published models. It only affects future snapshots.`,
    respectsRobots: true,
    executesJs: "no",
    typicalVolume: "Periodic — large monthly crawl sweeps",
    docs: [
      { label: "Common Crawl FAQ", url: "https://commoncrawl.org/faq/" },
    ],
    citationsImpact:
      "Indirect — does not affect live citation bots but reduces visibility in future LLM training corpora.",
  },
];

export function getCrawler(slug: string): Crawler | undefined {
  return CRAWLERS.find((c) => c.slug === slug);
}

export function getCrawlersByPurpose(): Record<CrawlerPurpose, Crawler[]> {
  const out: Record<CrawlerPurpose, Crawler[]> = {
    search: [],
    training: [],
    "user-fetch": [],
    hybrid: [],
  };
  for (const c of CRAWLERS) out[c.purpose].push(c);
  return out;
}
