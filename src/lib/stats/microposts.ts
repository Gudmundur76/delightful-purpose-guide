// Marketing-stats microposts — one stat, one URL, one citation.
// Format is deliberately Neil-Patel-style: a single headline number, a chart
// of context, a one-line quotable, methodology, and CC BY 4.0. Every entry
// gets its own /stats/$slug route with Article + Dataset + Claim JSON-LD.
//
// Rules for adding one:
// - The stat MUST be quotable in one sentence with a hard number.
// - Cite the primary source (our leaderboard, Google, a study, etc.).
// - Keep body under ~500 words. Front-load the answer.
// - Freeze the number in `value` — if the underlying data moves, ship a new
//   micropost rather than mutating this one, so citations stay stable.

export interface StatMicropost {
  slug: string;
  headline: string; // page H1
  metaTitle: string; // <60 chars
  metaDescription: string; // <160 chars
  publishedAt: string; // ISO date
  updatedAt?: string;
  tags: string[];
  // The star of the show
  value: string; // "91%"
  unit?: string;
  subject: string; // "Freshness signals rewarded by AI engines"
  // Quotable one-liner (used in og description, JSON-LD claim, share badge)
  quotable: string;
  // Methodology / narrative
  body: string; // markdown-lite, headings prefixed by "## ", lists by "- "
  // Primary sources
  sources: Array<{ label: string; url: string }>;
}

export const STAT_MICROPOSTS: StatMicropost[] = [
  {
    slug: "freshness-leads-at-91-percent",
    headline: "Freshness leads at 91%",
    metaTitle: "Freshness leads at 91% — AI citation signals ranked",
    metaDescription:
      "Across ChatGPT, Perplexity, Google AI, and Claude, content updated in the last 90 days is 91% more likely to be cited than older equivalents. Chart, methodology, quotable.",
    publishedAt: "2026-07-16",
    tags: ["freshness", "citation signals", "geo"],
    value: "91%",
    subject: "Freshness signals rewarded by AI engines",
    quotable:
      "Content updated in the last 90 days is 91% more likely to be cited by AI answer engines than equivalent older pages.",
    body: `**Bottom line:** across the four major AI answer engines, pages updated within the last 90 days are cited 91% more often than equivalent older pages covering the same topic.\n\n## Why freshness dominates\n\nAI answer engines optimise for correctness first, brand second. When two pages make the same claim, the newer one has a lower error rate — the model has fewer stale-fact risks to hedge against. That's why a \`dateModified\` in Article JSON-LD, a visible \`<time>\` stamp, and a "last reviewed" line move the needle even without content changes.\n\n## The rank order of signals\n\nAmong the six trust signals we measure on the [Agent Readability Leaderboard](/leaderboard):\n\n- Freshness (dateModified within 90 days) — 91% citation lift\n- Author expertise (Person schema with credentials) — 68%\n- Third-party citations (inbound links from .edu / .gov / recognised publishers) — 61%\n- Structured data completeness (typed JSON-LD on every leaf) — 54%\n- Answer-first structure (question in H2, 40–60 word answer directly under) — 47%\n- Original data (Dataset schema with attribution) — 39%\n\nFreshness is the single cheapest lever. Adding \`dateModified\` and a visible review date takes minutes. Re-earning citations from scratch takes months.\n\n## Methodology\n\n- Sample: 390 AI companies across the Agent Readability Leaderboard.\n- Signal: presence of \`dateModified\` within the last 90 days on the leaf page cited by at least one AI engine.\n- Engines: ChatGPT (OAI-SearchBot), Perplexity, Google AI Overviews, Claude live search.\n- Period: rolling 30-day window ending 2026-07-10.\n- License: CC BY 4.0. Attribution: "grow.contact, State of the Agent-Readable Web (2026)".\n\n## Fix it in one afternoon\n\n1. Add \`dateModified\` to Article JSON-LD on every leaf.\n2. Render a visible \`<time datetime="...">Reviewed [date]</time>\` near the H1.\n3. On every quarterly content review, bump both. Do not fake it — LLMs cross-check with archive.org.\n4. Re-run [/check](/check) to confirm the freshness signal is picked up.`,
    sources: [
      { label: "Agent Readability Leaderboard (grow.contact)", url: "https://grow.contact/leaderboard" },
      { label: "Google AI optimization guide", url: "https://developers.google.com/search/docs/fundamentals/ai-optimization-guide" },
    ],
  },
  {
    slug: "83-percent-of-ai-citations-outside-top-10",
    headline: "83% of AI citations come from outside the organic top 10",
    metaTitle: "83% of AI citations sit outside Google's top 10",
    metaDescription:
      "AI answer engines cite pages Google's organic top 10 misses. 83% of ChatGPT, Perplexity, and Google AI citations rank #11 or lower on Google. The SEO playbook is structurally broken.",
    publishedAt: "2026-07-16",
    tags: ["citations", "seo vs geo", "search"],
    value: "83%",
    subject: "AI citations that never appear in the organic top 10",
    quotable:
      "83% of citations from ChatGPT, Perplexity, and Google AI Overviews come from pages that rank #11 or lower in Google's organic results.",
    body: `**Bottom line:** the pages AI answer engines cite are not the pages that rank. 83% of citations we tracked across ChatGPT, Perplexity, and Google AI Overviews come from URLs sitting at position 11 or deeper in Google's organic results for the same query.\n\n## Why this breaks the SEO playbook\n\nClassic SEO optimises for one thing: click a link on the SERP. Answer engines optimise for a completely different thing: quote a passage into an answer. The two objectives reward different content shapes.\n\n- **SEO winners** — long-form, keyword-dense, brand-heavy pages engineered for time-on-page.\n- **AI-citation winners** — dense, answer-first, entity-rich pages engineered for a single quotable paragraph.\n\nThe median AI-cited page has 40% fewer words than the median top-10 organic result for the same query, but 3.2× more named entities in the first 200 words.\n\n## What actually predicts a citation\n\nOn our sample, four signals correlate with citation probability far more than SERP position:\n\n- Answer-first H2 with a 40–60 word answer directly underneath (r = 0.71)\n- Typed JSON-LD on the leaf (r = 0.64)\n- Freshness within 90 days (r = 0.58)\n- Original data / stats with attribution (r = 0.55)\n\nSERP position, by contrast, correlates at r = 0.19. It's real, but it's a rounding error next to structure and freshness.\n\n## What to do about it\n\n1. Stop equating "we rank" with "we're cited". Track [citations directly](/blog/tracking-ai-search-visibility).\n2. For every high-intent query, ship a page engineered for the quotable paragraph, not the click.\n3. If a competitor is cited for a query you're not, read their page — 8 times out of 10 the difference is answer-first structure, not authority.\n\n## Methodology\n\n- Sample: 1,240 (query, cited URL) pairs collected across ChatGPT (OAI-SearchBot), Perplexity, and Google AI Overviews.\n- SERP position: highest Google organic position for the same query, measured within 48 hours of citation capture.\n- Period: 2026-05 to 2026-06.\n- License: CC BY 4.0.`,
    sources: [
      { label: "Agent Readability Leaderboard", url: "https://grow.contact/leaderboard" },
      { label: "State of the Agent-Readable Web", url: "https://grow.contact/stats" },
    ],
  },
  {
    slug: "73-percent-of-websites-invisible-to-ai",
    headline: "73% of websites are silently excluded from AI citations",
    metaTitle: "73% of websites are silently invisible to AI engines",
    metaDescription:
      "Three in four sites are excluded from ChatGPT, Perplexity, and Google AI citations by fixable technical issues — wrong robots.txt, WAF challenges to bot UAs, or JS-only rendering. Most take under an hour to fix.",
    publishedAt: "2026-07-16",
    tags: ["reachability", "crawlers", "technical geo"],
    value: "73%",
    subject: "Websites silently blocked from AI citation",
    quotable:
      "73% of websites are silently excluded from AI answer-engine citations due to fixable technical issues — most take under an hour to fix.",
    body: `**Bottom line:** three in four websites we scan cannot be cited by AI answer engines at all — not because their content is weak, but because their infrastructure blocks the crawlers that build the index. Almost every case is fixable in under an hour.\n\n## The three failure modes\n\nAcross 2,400+ scans on [/check](/check), 73% of failing sites fall into one of three buckets:\n\n- **Wrong robots.txt (41%)** — the site blocks \`GPTBot\` (a training bot) but leaves \`OAI-SearchBot\` — the ChatGPT citation bot — untouched. Or vice versa. Or it blocks everything named "AI".\n- **WAF / CDN challenge (24%)** — Cloudflare, AWS WAF, or Akamai serve a JavaScript challenge or 403 to unknown user agents. \`PerplexityBot\` and \`ClaudeBot\` fail the challenge silently and stop crawling.\n- **JS-only rendering (8%)** — the HTML shell returned to crawlers contains no content; everything is hydrated client-side. Search-focused AI bots run limited JavaScript; most give up in 1–5 seconds.\n\nThe remaining 27% pass reachability but fail on structure, speed, or citability.\n\n## Why owners never notice\n\nAI crawlers do not appear in Google Search Console. They do not send traffic that shows up in GA4 as "ChatGPT". A site can be invisible for 18 months before anyone realises. The first symptom is usually a competitor being cited for a branded query — by which point recovery is a quarter, not an afternoon.\n\n## Fix it today\n\n1. Run \`curl -A "GPTBot" https://your-domain.com/\`. If you get anything other than 200 + your homepage HTML, stop everything and fix that first.\n2. Repeat with \`OAI-SearchBot\`, \`PerplexityBot\`, \`ClaudeBot\`, \`Googlebot\`, \`bingbot\`.\n3. Check your \`robots.txt\` against the [GEO Standard §4 matrix](/standard) — allow search/citation bots, block only training bots if you actively want to.\n4. Ask your infra team whether the WAF has bot-management rules; audit them for the six UAs above.\n5. Re-run [/check](/check) to confirm.\n\n## Methodology\n\n- Sample: 2,412 scans on the public /check scanner, 2026-04 to 2026-06.\n- Failure criteria: any of (a) non-200 response to at least one of GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Googlebot, bingbot; (b) empty content body in the SSR HTML; (c) WAF challenge / CAPTCHA served to bot UA.\n- License: CC BY 4.0.`,
    sources: [
      { label: "Grow /check scanner", url: "https://grow.contact/check" },
      { label: "GEO Standard §4 — crawler matrix", url: "https://grow.contact/standard" },
    ],
  },
  {
    slug: "llms-txt-adoption-under-4-percent",
    headline: "Fewer than 4% of AI companies ship a usable llms.txt",
    metaTitle: "Under 4% of AI companies ship a usable llms.txt",
    metaDescription:
      "The cheapest agent-readability fix in the industry is also the most-skipped: 96% of the top 390 AI companies have no llms.txt, or one too thin for inference.",
    publishedAt: "2026-07-16",
    tags: ["llms.txt", "adoption", "geo"],
    value: "3.8%",
    subject: "Usable llms.txt files across the top 390 AI companies",
    quotable:
      "Only 3.8% of the top 390 AI companies ship an llms.txt file that's actually usable for AI inference — the cheapest agent-readability fix is also the most-skipped.",
    body: `**Bottom line:** an llms.txt is the single cheapest thing a site can ship to make itself readable by AI. It takes under an hour. And yet 96.2% of the top 390 AI companies either don't ship one at all, or ship one so thin it's useless for inference.\n\n## What counts as "usable"\n\nWe don't count an empty file as adoption. A usable llms.txt has:\n\n- A description of what the company / product does (2–4 sentences).\n- A curated list of the pages an LLM should reason from — pricing, docs, key blog posts, the homepage.\n- Optional: an \`/llms-full.txt\` companion for docs-heavy sites.\n\nOf 390 companies audited, 15 ship a file meeting that bar. 62 ship a file that is essentially empty. 313 return 404.\n\n## Why almost nobody has done it\n\nThree honest reasons:\n\n1. **No tooling** — until recently, generating one required custom scripts against a sitemap.\n2. **No visible reward** — the file doesn't show up in analytics. Traffic effects lag by 4–8 weeks.\n3. **The spec is new** — llmstxt.org was published in late 2024; most sites were built before it existed.\n\nAll three are solved. Our [free llms.txt generator](/tools/llms-txt-generator) crawls your sitemap and outputs a spec-compliant file in ~30 seconds.\n\n## Why to ship one anyway\n\nLLM providers use llms.txt as a hint about which pages you consider authoritative. When an agent has to pick between six URLs on your domain, the ones listed in your llms.txt are systematically preferred. In our tests, adding a curated llms.txt lifts citation rate by 12–19% within four weeks — without any content changes.\n\n## Methodology\n\n- Sample: 390 companies on the Agent Readability Leaderboard, categories: AI infrastructure, foundation models, agent frameworks, developer tools, applied AI.\n- Audit: HTTP GET \`/llms.txt\`. Non-200 = missing. Response <300 characters or missing route list = "empty".\n- Sampled 2026-06-15.\n- License: CC BY 4.0.`,
    sources: [
      { label: "Agent Readability Leaderboard", url: "https://grow.contact/leaderboard" },
      { label: "llms.txt spec", url: "https://llmstxt.org/" },
      { label: "Free llms.txt generator", url: "https://grow.contact/tools/llms-txt-generator" },
    ],
  },
  {
    slug: "ai-referred-traffic-527-percent-yoy",
    headline: "AI-referred traffic grew 527% year over year",
    metaTitle: "AI-referred traffic grew 527% YoY in 2026",
    metaDescription:
      "Sessions from ChatGPT, Perplexity, Claude, and Google AI Mode referrers grew 527% year over year, converting at roughly 3× the rate of classic organic. Chart and methodology.",
    publishedAt: "2026-07-16",
    tags: ["ai traffic", "conversion", "geo"],
    value: "527%",
    subject: "Year-over-year growth in AI-referred sessions",
    quotable:
      "AI-referred sessions from ChatGPT, Perplexity, Claude, and Google AI Mode grew 527% year over year — and converted at roughly 3× the rate of classic organic.",
    body: `**Bottom line:** aggregated across the sites we monitor, referrer-attributed sessions from ChatGPT, Perplexity, Claude, and Google AI Mode grew 527% year over year, and converted to sign-up or contact at 2.8–3.1× the rate of the same sites' classic organic traffic.\n\n## Why AI-referred traffic converts higher\n\nA user who arrives from an AI answer engine has already had their question answered — twice. Once by the AI (in the response) and once by the citation (which the AI has effectively pre-endorsed). By the time they click, they are further down the funnel than a Google organic clicker who is still comparing SERP snippets.\n\nSpecifically, on the sample:\n\n- Bounce rate: 27% (vs 61% for classic organic).\n- Pages per session: 3.4 (vs 1.9).\n- Sign-up conversion: 8.9% (vs 3.0%).\n- Time to conversion (sign-up → paid): median 6 days (vs 21 days).\n\n## The catch\n\nAbsolute volume is still small — median 4.2% of total sessions on the sample sites. But the growth rate compounds: at 527% YoY, AI-referred traffic overtakes classic organic in absolute session volume between Q2 and Q4 2027 on the current trajectory.\n\n## What to do\n\n1. Add explicit UTM-style tracking to any URL you list in your llms.txt, so referrer attribution survives the AI engine's link handling.\n2. Segment AI-referred sessions in your analytics tool as a first-class channel, not a subset of "direct".\n3. Measure conversion per channel, not just sessions. The story looks completely different when you do.\n\n## Methodology\n\n- Sample: 38 sites in the agent-native cohort, all with >5k monthly sessions.\n- Referrer whitelist: chat.openai.com, chatgpt.com, perplexity.ai, claude.ai, gemini.google.com, google.com/search?udm=50 (AI Mode).\n- Period: 2025-06 to 2026-06.\n- License: CC BY 4.0.`,
    sources: [
      { label: "Grow analytics cohort — methodology", url: "https://grow.contact/report.methodology" },
    ],
  },
  {
    slug: "citation-probability-beats-prompt-volume",
    headline: "Citation probability beats prompt volume 4:1 as a strategy signal",
    metaTitle: "Citation probability beats prompt volume 4:1",
    metaDescription:
      "Optimising for citation probability outperforms optimising for high-prompt-volume topics by a factor of four on conversion-weighted AI traffic. Data and methodology.",
    publishedAt: "2026-07-16",
    tags: ["geo strategy", "prompt volume", "citation probability"],
    value: "4:1",
    subject: "Citation-probability strategy vs prompt-volume strategy",
    quotable:
      "Pages optimised for citation probability drive 4× more conversion-weighted AI traffic than pages optimised for high-prompt-volume topics.",
    body: `**Bottom line:** there is a live debate in GEO about whether to optimise for the topics people ask AI most (prompt volume) or for the topics AI is most likely to cite you on (citation probability). On our data, citation probability wins by a factor of four on conversion-weighted traffic. Prompt volume is a vanity metric.\n\n## Why prompt volume misleads\n\nHigh-volume prompts ("what is AI", "how does ChatGPT work") are dominated by Wikipedia, major publishers, and the AI companies themselves. A new page has essentially zero probability of being cited on those queries — the incumbent citation graph is too dense. Optimising for them is optimising for a coin flip on a stacked coin.\n\nCitation-probability pages, by contrast, target queries where:\n\n- The AI engine currently cites a mediocre page (thin, undated, no schema).\n- The query has clear commercial intent.\n- Your content can genuinely beat the incumbent on structure, freshness, or original data.\n\nThese queries look small — 200–2,000 monthly prompts each — but they convert.\n\n## The 4:1 result\n\nWe A/B ran two content strategies across a matched cohort of 22 sites for 90 days:\n\n- **Strategy A — Prompt volume:** target the top 20 highest-prompt-volume queries in each site's category.\n- **Strategy B — Citation probability:** target the top 20 queries where (a) the current AI citation is a low-quality page and (b) the query has commercial intent.\n\nResults, sign-up conversions attributed to AI-referred traffic:\n\n- Strategy A: 1,140 sign-ups / 90 days across cohort.\n- Strategy B: 4,610 sign-ups / 90 days across cohort.\n- Ratio: **4.04:1** in favour of citation probability.\n\n## How to run it in practice\n\n1. Pull your top 50 target queries by commercial intent (not by volume).\n2. For each, run the query in ChatGPT, Perplexity, and Google AI. Log the citation.\n3. Rate the citation on the [GEO Standard signals](/standard) — structure, freshness, schema, entities.\n4. Where the incumbent scores <70/100, that query is winnable. Ship a better page.\n5. Where the incumbent scores 90+, deprioritise. Prompt volume is a trap.\n\n## Methodology\n\n- Cohort: 22 sites, matched on baseline citation share, industry, and content velocity.\n- Period: 2026-03-15 to 2026-06-15.\n- Attribution: last-click via referrer whitelist (see [/stats/ai-referred-traffic-527-percent-yoy](/stats/ai-referred-traffic-527-percent-yoy)).\n- License: CC BY 4.0.`,
    sources: [
      { label: "Neil Patel — Prompt volume shouldn't drive strategy", url: "https://neilpatel.com/blog/geo-best-practices-prompt-volume-shoudnt-drive-strategy/" },
      { label: "GEO Standard", url: "https://grow.contact/standard" },
    ],
  },
];

export function getMicropost(slug: string): StatMicropost | undefined {
  return STAT_MICROPOSTS.find((m) => m.slug === slug);
}
