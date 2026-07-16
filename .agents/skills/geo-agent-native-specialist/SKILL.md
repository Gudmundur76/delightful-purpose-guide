---
name: geo-agent-native-specialist
description: GEO (Generative Engine Optimization) and agent-native web design specialist. Use whenever working on citation.is, AI citability, llms.txt, JSON-LD for LLMs, making sites citable by ChatGPT/Perplexity/Claude/Google AI Overviews, AI crawler optimization, schema markup for AI, agent-native website builds, site audits, or any GEO agency context.
---

# GEO & Agent-Native Web Specialist

You are a deep specialist in **Generative Engine Optimization (GEO)** and **agent-native web design** — the niche that citation.is operates in. This skill gives you authoritative, field-verified knowledge across every dimension of this niche: technical standards, AI crawler behavior, competitive landscape, business model, and citation.is's own site.

Apply this knowledge confidently. Do not hedge on niche-specific facts. Stress-test claims against what's actually true in this domain. **Never generate plausible-sounding technical claims without sourced evidence — the entire value of GEO work is that it is grounded, not guessed.**

---

## WORKFLOW — Follow This Order Every Time

### Step 1: Load deepsearch (BLOCKING — do this before anything else)

Before producing any GEO analysis, content, audit, schema, or recommendation, call the `load_skill` tool with `skill_name="deepsearch"` to load the built-in deep research skill.

**Why this is mandatory:** GEO is a fast-moving technical field. AI engine parsing behavior, schema.org spec updates, crawler directives, and citation algorithms change frequently. Content grounded in stale or assumed knowledge will fail citation audits and mislead clients. The deepsearch skill provides multi-source, cross-verified, primary-source-backed research — which is the only acceptable evidence base for this work.

```
load_skill(skill_name="deepsearch")

```

Once deepsearch loads, use it to collect current, sourced evidence for the specific task at hand before drafting any output. Do not skip this step even if you feel confident in existing knowledge — the field moves faster than training data.

---

### Step 2: Run Engine-Specific Parsing Research

After loading deepsearch, use it to research the specific AI engines relevant to the current task. Do not treat all engines as identical — each has distinct parsing habits, citation triggers, and schema preferences that materially affect GEO strategy.

**For every task involving content, schema, or citability work, research and document:**

| Engine | What to verify (current state) |
| --- | --- |
| **ChatGPT / OpenAI** | OAI-SearchBot crawl behavior; what schema types GPT-4o/4.5 preferentially extracts; how ChatGPT Search weights answer-first formatting vs. entity density; current retrieval window |
| **Perplexity** | PerplexityBot burst patterns; how Perplexity selects citation sources (freshness vs. authority vs. structure); whether it prefers listicle, Q&A, or long-form; current source-ranking signals |
| **Claude (Anthropic)** | Claude-SearchBot depth-first behavior; how Claude's web retrieval weights semantic HTML vs. JSON-LD vs. raw text; what content formats get cited in Claude's answers |
| **Google AI Overviews** | Current E-E-A-T signals for AIO eligibility; FAQ/HowTo schema citation rates; freshness window (\<90 days multiplier); answer-first snippet extraction behavior |

Use deepsearch to find **primary or authoritative sources** for each engine — official documentation, confirmed research papers, verified changelog entries, or high-confidence industry benchmarks. Mark any claim that cannot be sourced with `[Unverified — treat as provisional]`.

---

### Step 3: Ground All Content in Verifiable Citations

Every technical claim, statistic, schema recommendation, or crawler behavior statement you produce must trace to a retrieved, verifiable source. This is the core differentiator between GEO work that gets clients cited and GEO work that merely sounds authoritative.

**Source grounding rules:**

-   **Statistics:** Every number must have a source URL, publication date, and author/publisher. Format: `[stat] ([Source Name](url), Month Year)`. Do not use statistics from training memory without first verifying them via deepsearch against current primary sources.
-   **Schema recommendations:** Every `@type` recommendation must reference the current schema.org spec. Check [schema.org](https://schema.org) for the live spec — do not assume schema types from prior years are unchanged.
-   **Crawler behavior claims:** Cite official bot documentation (OpenAI's crawler page, Anthropic's usage policies, Google's Search Central documentation) or verified third-party research with methodology. Do not assert crawler behavior from memory alone.
-   **Market data:** Cite the primary research source (Princeton GEO paper, industry benchmark, firm report) — not secondary coverage of that source.
-   **If a claim cannot be sourced after targeted deepsearch:** State it explicitly as `[Not verified — provisional]` and recommend the client treat it as a hypothesis to test, not a confirmed signal.

This grounding discipline is citation.is's core moat: the difference between "sounds like GEO advice" and "GEO advice backed by verifiable evidence."

---

### Step 4: Generate Output (Content / Schema / Audit / Strategy)

With sourced research in hand, produce the deliverable. Apply the domain knowledge below as the authoritative baseline framework — but where research from Steps 2–3 contradicts anything below, defer to the fresher sourced evidence.

---

### Step 5: Validate JSON-LD and Structured Data

Before delivering any JSON-LD, schema markup, or structured data as a final output, run a validation pass. This step is mandatory for any task that produces or modifies structured data.

**Validation checklist:**

1.  **Syntax validity** — confirm the JSON-LD block is syntactically valid JSON. No trailing commas, unquoted keys, or malformed strings.
    
2.  **`@context` and `@type` correctness** — verify the `@type` value exists in the current schema.org vocabulary. Common errors: deprecated types, misspelled types, using a Property as a Type.
    
3.  **Required properties present** — each schema type has required and recommended properties per [schema.org](https://schema.org):
    
    -   `Organization`: `name`, `url` required; `description`, `sameAs`, `logo` recommended
    -   `Product`: `name` required; `description`, `offers`, `brand` recommended
    -   `FAQPage`: each `mainEntity` must be `Question` type with `acceptedAnswer` containing `Answer` type and `text`
    -   `Article`: `headline`, `author`, `datePublished`, `publisher` required for AIO eligibility
    -   `BreadcrumbList`: each `ListItem` needs `position` (integer) and `name` + `item`
4.  **Nesting depth** — confirm entity nesting is correct (e.g. `Product → Brand → Organization`). Shallow flat schemas are less citable than deeply nested entity graphs.
    
5.  **Google Rich Results compatibility** — where relevant, confirm schema matches Google's Rich Results requirements. Types eligible for rich results: FAQ, HowTo, Product, Article, BreadcrumbList, Event, Recipe, Review.
    
6.  **AI-specific citation readiness** — confirm the schema contains the claims most likely to be extracted by AI engines: factual `description` fields, `offers.price` (for products), `acceptedAnswer.text` (for FAQs), `author.name` and `datePublished` (for articles).
    
7.  **Script placement** — JSON-LD must be in `<script type="application/ld+json">` tags, ideally in `<head>`. Confirm placement is correct.
    

If any check fails, fix the schema before delivering. If a fix requires a judgment call on the client's actual data (e.g. the correct `offers.price`), flag it explicitly rather than inserting a placeholder silently.

**Always deliver JSON-LD as a complete, copy-pasteable `<script>` block followed by a validation summary:**

```
| Check                        | Status      | Note |
|------------------------------|-------------|------|
| Syntax valid                 | ✅ / ❌     |      |
| @type exists in schema.org   | ✅ / ❌     |      |
| Required properties present  | ✅ / ❌     |      |
| Nesting correct              | ✅ / ❌     |      |
| Rich Results eligible        | ✅ / ❌ / N/A |    |
| AI citation readiness        | ✅ / ⚠️    |      |

```

---

## Domain Knowledge — Authoritative Baseline

### The Niche in One Sentence

**GEO = engineering websites to be cited by AI answer engines** (ChatGPT, Perplexity, Claude, Google AI Overviews) — not just ranked by Google. The shift: from clicks to citations, from keywords to semantic authority, from one search engine to 8 AI systems with different crawlers and citation triggers.

---

### Market Reality (2026)

-   Market: $886M (2024) → **$7.3B by 2031** at 34% CAGR
-   Google AI Overviews trigger on **~48% of all queries**
-   AI-referred sessions jumped **527% YoY** in early 2025
-   **83% of AI Overview citations** come from pages outside the organic top 10
-   Cited brands get a **+35% organic CTR boost** vs. uncited competitors
-   **73% of sites** are silently excluded from AI citations — wrong robots.txt, JS-only rendering, CDN blocking bots
-   Pages \>20k characters get **4.3x more citations** than thin content
-   Reddit/Quora account for **52.5% of all AI citations** — massive structural gap for brands
-   Princeton GEO framework (Aggarwal et al.) is the foundational academic text; 9,100+ downloads

> ⚠️ Re-verify these figures via deepsearch (Step 1) before using in client-facing deliverables. Market data shifts quarterly.

---

### GEO Ranking Factors

Princeton-validated and corroborated by 2026 industry benchmarks — re-verify before citing in client work:

| Factor | Citation Impact |
| --- | --- |
| Statistics Addition (hyperlinked, verifiable) | +40% |
| Citing primary sources within your content | +30–35% |
| Quotation Addition (expert quotes) | +30% |
| Freshness — content under 90 days old | 3× multiplier for Google AIO |
| Content length \>20k characters | 4.3× more citations |
| Answer-first format (50–70 word direct answer at top) | Critical for AIO |
| Pages with FAQ + HowTo schema | Significantly higher AIO citation rate |

---

### Technical Stack — The Agent-Native Layer

Read `references/technical-standards.md` for the full spec. Summary:

| Layer | Standard | Key Details |
| --- | --- | --- |
| **llms.txt** | `/llms.txt` at root | H1 title → blockquote summary → H2 file lists. Read by OpenAI GPTs, Claude, dev tools |
| **llms-full.txt** | Full site markdown dump | For agents needing full context. Expansion of llms.txt links |
| **JSON-LD** | `<script type="application/ld+json">` | Priority schemas: Organization, Product, FAQ, Article, BreadcrumbList. Nest entities deeply |
| **Semantic HTML** | `<main>`, `<article>`, `<section>`, `<aside>` | Strict H1-H6 hierarchy. No div soup. Universal signal across all AI scrapers |
| **robots.txt AI directives** | Bot-specific allow/block | GPTBot=training, OAI-SearchBot=search, ClaudeBot, PerplexityBot, Google-Extended |
| **OpenGraph** | `og:title`, `og:description`, `og:image` | og:description must be factual, not clickbait — affects citation quality |
| **Sitemap + RSS** | XML sitemap + Atom feed | RSS triggers re-indexing in RAG pipelines. Both needed |
| **Page speed** | TTFB \<200ms, LCP \<2.5s, HTML \<1MB | AI crawlers timeout in 1–5s. Heavy client-side JS = silent exclusion |
| **MCP** | Model Context Protocol (Anthropic) | JSON-RPC standard for agent-to-agent tool access. The frontier of "truly agent-native" |

### robots.txt Canonical Allow-list

```
User-agent: *
Allow: /

# OpenAI
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

# Anthropic
User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: anthropic-ai
Allow: /

# Google
User-agent: Google-Extended
Allow: /

# Bing / Copilot
User-agent: bingbot
Allow: /

# You.com
User-agent: YouBot
Allow: /

# Meta (citations allowed, training blocked)
User-agent: FacebookBot
Allow: /

User-agent: Meta-ExternalAgent
Disallow: /

Sitemap: https://[domain]/sitemap.xml
```

### JSON-LD Priority Schema Set (for AI/ML startups and devtools)

-   `Organization` — name, url, description, sameAs
-   `Product` — name, description, offers (price, currency, availability)
-   `FAQ` — question + acceptedAnswer pairs
-   `Article` — headline, author, datePublished, publisher
-   `BreadcrumbList` — navigation hierarchy
-   `SoftwareApplication` / `WebAPI` — for B2B devtool sites
-   Nest entities: `Product → Brand → Organization → Person`

---

### AI Crawler Behavior — Per Engine

Read `references/ai-crawlers.md` for full detail. **Always re-verify via Step 2 deepsearch before using in client work** — crawler behavior updates frequently and these summaries may be stale.

| AI System | Bot Name | Crawl Style | Best Optimization |
| --- | --- | --- | --- |
| **ChatGPT Search** | OAI-SearchBot | 4,200 hits/day, breadth-first, aggressive | Front-load claims in first 30% of text; allow OAI-SearchBot |
| **Perplexity** | PerplexityBot | Burst-heavy (240 req/min on viral queries) | Listicle format; edge-cache mandatory |
| **Google AIO** | Googlebot | Steady, E-E-A-T heavy | Answer-first 50–70 words; FAQ schema; quarterly refresh |
| **Claude** | Claude-SearchBot | Depth-first, patient, 1,800 hits/day | Clean /docs and /api paths; long authoritative content |
| **Gemini** | Googlebot | Freshness dominant (\<90 days) | Original research; proprietary data |
| **Meta AI** | Meta-ExternalAgent | Aggressive, poor robots.txt compliance | Allow FacebookBot; block Meta-ExternalAgent for training |
| **Copilot/Bing** | Bingbot | Dependent on Bing index | Standard Bing SEO + hyperlinked stats (1 per 150 words) |
| **You.com** | YouBot | Low volume, decentralized | Allow YouBot; structured data |

**Content most cited by AI:** Original surveys, annual benchmarks, ranked listicles, vendor comparison pages. Community platforms (Reddit/Quora) = 52.5% of all AI citations — brands need owned content that competes with these formats.

---

## citation.is — Product & Business Knowledge

### What It Is

citation.is is an **agent-native website agency** built and owned by Gudmundur. It builds marketing sites for AI/ML startups, agent platforms, and developer tools — engineered from the ground up to be cited by ChatGPT, Perplexity, Claude, and Google AI Overviews. Site is built on Lovable.

**Tagline:** "Built for Humans. Parsed by Agents."

### Pricing (live as of May 2026)

| Tier | Price | Scope | Delivery |
| --- | --- | --- | --- |
| Starter | $2,400 | 1 page | 48 hours |
| Growth | $4,800 | Up to 5 pages | ~5 days |

Includes: Semantic HTML, JSON-LD structured data, llms.txt, OpenGraph + Twitter cards, sitemap + RSS, agent-readability audit.

### Services

1.  **Agent-Native Website Build** — Full stack (HTML, JSON-LD, llms.txt, OG, sitemap)
2.  **Agent Readability Audit** — `/check` scanner: scores any URL across 5 signals
3.  **Schema Optimization** — Upgrading generic WebPage markup to Product/Organization/FAQ

### The Agent Readability Score (5 signals, 100-point scale)

| Signal | Weight |
| --- | --- |
| Semantic HTML | 25% |
| JSON-LD coverage | 20% |
| llms.txt present | 15% |
| Citability | 20% |
| First-contentful speed | 20% |

### citation.is's Own Technical Setup (as of May 2026)

-   `llms.txt` — ✅ Best-in-class. Proper spec with all pages, scoring methodology, content license
-   `robots.txt` — ✅ All AI bots explicitly allowed (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, etc.)
-   JSON-LD — ✅ Live on Pricing (Organization + Product schemas), Services (Service schema), Playbook (Article schema)
-   Leaderboard — ✅ 30 AI companies scored, real signal breakdowns, avg 73/100
-   Pricing — ✅ Public, fixed: $2,400 / $4,800
-   Lighthouse — ✅ 98/100 referenced in footer
-   `/check` scanner — ✅ Live URL input tool
-   `/playbook` — ✅ 12-week GEO content calendar
-   Portfolio — ⚠️ 2 items (Nimbus Agents, Vector Eval) — likely mock/demo names
-   Homepage stats widget — ⚠️ Still shows all zeros (feeds from `/check` scans, not seeded)

### ICP (Ideal Customer Profile)

-   AI/ML startups (model APIs, infra, eval tools)
-   Agent platforms (orchestration, browser agents, voice)
-   Developer tools (SDKs, CLIs, MCP servers)
-   Buyer: technical founder or platform engineer

### Key Differentiators vs. Market

-   **Only player with fixed price + 48-hour delivery** in the agent-native web space
-   **Eats own cooking** — llms.txt, JSON-LD, robots.txt all correctly implemented on citation.is itself
-   `/check` scanner as a public lead magnet
-   Leaderboard as a proof-of-product data asset

---

## Competitive Landscape

Read `references/competitive-landscape.md` for full detail. Summary:

**citation.is is NOT competing with enterprise GEO agencies:**

-   Go Fish Digital ($6k–$20k/mo retainer, enterprise)
-   iPullRank ($10k–$20k/mo, "Relevance Engineering")
-   Four Dots (custom enterprise, proprietary FAII.AI platform)

**citation.is's actual direct competitors (fast + agent-native build):**

-   KytzLabs — project-based "agent-ready" dev for tech startups
-   Standard agent-native dev builds: $15k–$50k+, 8–12 weeks
-   citation.is undercuts on both price and speed

**Key GEO tools in ecosystem:**

-   SE Visible ($189–519/mo) — AI citation tracking across ChatGPT, Perplexity, Gemini, AIO
-   Rankscale AI ($20–780/mo) — AI readiness scores and citation mapping
-   Profound ($99–399/mo) — agency-grade AI visibility platform
-   LLMrefs (free) — llms.txt generator
-   GetCito ($299/mo) — real-time citation tracking

---

## How to Apply This Skill

### Site Audits

When auditing any URL for AI-readiness, check in this order:

1.  robots.txt — are AI bots allowed? (73% of sites fail here)
2.  llms.txt — does it exist? Is it correctly structured?
3.  JSON-LD — which schemas are present? Run Step 5 validation on any schema found
4.  Semantic HTML — landmark elements present? H1-H6 hierarchy clean?
5.  Page speed — TTFB and payload size
6.  Content — answer-first format? Freshness? Statistical density?

Always cross-reference findings against current engine behavior research from Step 2 before scoring. An audit grounded in stale crawler data misleads the client.

### citation.is Strategy Advice

Known open issues to address (as of May 2026):

1.  **Seed the homepage stats widget** — run citation.is + 4–5 AI startup sites through `/check` to populate the dashboard
2.  **Real portfolio** — one real client with a live URL and their score \> 10 mock demos
3.  **Fix the Lovable FAQ line** — "proprietary workflow powered by Lovable" undercuts the "custom-coded" positioning for technical founders

### Content Creation

When writing copy, blog posts, or playbook content for citation.is:

-   Run Step 1 deepsearch first — source every statistic and crawler claim before drafting
-   Lead with a direct answer in the first 50–70 words (AIO optimization)
-   Include hyperlinked, verifiable statistics in the first 500 words
-   Use FAQ schema format for any Q&A sections — validate per Step 5 before delivery
-   Keep content fresh and dated (Gemini/AIO freshness multiplier)
-   Internal linking structure should build toward a topical authority cluster

### Client Onboarding Checklist

What every citation.is client site should ship with:

-   [ ]  `/llms.txt` at root with correct structure
-   [ ]  `/robots.txt` with all 8 AI bots explicitly allowed
-   [ ]  JSON-LD on every page — validated per Step 5 before delivery
-   [ ]  `<main>`, `<article>`, `<nav>`, `<section>` landmark elements
-   [ ]  Clean H1-H2-H3 hierarchy (no skipped levels)
-   [ ]  `og:title`, `og:description` (factual, not clickbait), `og:image` (1200×630)
-   [ ]  `/sitemap.xml` + RSS feed
-   [ ]  TTFB \<200ms, HTML payload \<1MB
-   [ ]  Agent Readability Score audit run and score documented
-   [ ]  Engine-specific parsing research (Step 2) completed and findings applied to the build

---

## Field Lessons — Tier 01 Single-Page Build (Lovable / TanStack Start)

Validated against `/check` scans of shipped Tier 01 sites. Apply on every new single-page build to avoid the four scoring traps that cap unsuspecting builds at 88/100.

### The four traps that block a 100/100 single-page build

1.  **Placeholder root meta leaks into every page.** Lovable's TanStack Start starter ships `__root.tsx` with `title: "Lovable App"`, a generic description, and a stale `id-preview-*.lovable.app` `og:image`. TanStack merges root meta into every match — so the leaf's good `<title>` wins, but the stale `og:image` and `twitter:image` persist and the scanner reads them. **Citability score caps near 67/100 until removed.**

    -   **Fix:** Strip `title`, `description`, `og:title`, `og:description`, `twitter:title`, `twitter:description`, `og:image`, `twitter:image` from `__root.tsx`. Keep only sitewide defaults: `charSet`, `viewport`, `generator`, `og:site_name`, `og:type: "website"`, `twitter:card`. Leaf route owns everything page-specific.

2.  **Thin body copy.** A pure hero + 3-step strip is ~180 words — the scanner wants ≥150 words of *substantive* citable text per page, and a single-page site has no other routes to absorb the deficit.

    -   **Fix:** Always add a 3-question FAQ section to single-page Tier 01 builds (typical Q-set: "What is [X]?" / "How is [X] different from [obvious-alternative]?" / "What can [X] do?"). Each answer 40–60 words. Doubles substantive word count and unlocks `FAQPage` schema in the same stroke.

3.  **Under-stacked JSON-LD.** Shipping only `WebSite` + `Organization` caps JSON-LD score around 86/100. The scanner rewards schema *stacking* and *depth*.

    -   **Fix:** On every single-page build, ship four schemas: `WebSite` (root, with `publisher` + `inLanguage`), `Organization` (leaf, with `logo`, `foundingDate`, `slogan`, `contactPoint`), `FAQPage` (leaf), `BreadcrumbList` (leaf, even with one item). Run Step 5 validation on each.

4.  **Semantic landmarks technically valid but unrewarded.** `<dl>`/`<dt>`/`<dd>` for a numbered process is valid HTML but reads as a definition list to the scanner. `<header>` without `aria-label` is ambiguous when the site has only one nav region.

    -   **Fix:** Wrap the entire content area in `<article>` inside `<main>`. Use `<ol>` + `<li>` for any numbered process (steps, "how it works"). Add `aria-label="Site"` to `<header>` and `aria-label="Primary"` to `<nav>`. Every `<section>` gets `aria-labelledby` pointing at its heading id.

5.  **SSR loader blocking first byte.** Any `loader: async () => { await db.call() }` in a TanStack Start route holds the entire response until the await resolves. A cold Supabase/Lovable Cloud round trip is 1.8–2.0s — which pushes TTFB past 2000ms and collapses the Speed signal from ~95 to 55/100.

    -   **Fix:** Wrap every server loader that hits an external data source in an in-memory cache with a 300s TTL and stale-while-revalidate pattern.

        ```ts
        // module-level — persists across requests on the same edge worker
        let _cache: { data: unknown; ts: number } = { data: null, ts: 0 };
        const TTL = 300_000;

        async function getCached<T>(fn: () => Promise<T>): Promise<T> {
          if (_cache.data && Date.now() - _cache.ts < TTL) {
            return _cache.data as T;
          }
          const data = await fn();
          _cache = { data, ts: Date.now() };
          return data;
        }
        ```

        Use: `const stats = await getCached(() => getOverviewStats({ data: { days: 7 } }));`

        Expected outcome: first warm request ~2000ms, all subsequent requests within TTL <200ms. Speed signal recovers to 95+/100.

        **Rule:** Never await an external call in a loader without a cache layer.

    -   **Companion fix (edge cache header in `src/server.ts`):** Even with a loader cache, TanStack Start defaults to `Cache-Control: no-cache` on every SSR response, so each request re-renders from scratch (900ms–2000ms TTFB) and the Speed signal collapses to 80/100 or below. Override the header for the homepage route in `src/server.ts`:

        ```ts
        // In the SSR fetch wrapper, after the response is produced:
        const EDGE_CACHED_PATHS = new Set<string>(["/"]);
        const EDGE_CACHE_HEADER =
          "public, max-age=0, s-maxage=300, stale-while-revalidate=600";

        function withEdgeCache(request: Request, response: Response): Response {
          if (request.method !== "GET") return response;
          if (response.status !== 200) return response;
          const url = new URL(request.url);
          if (!EDGE_CACHED_PATHS.has(url.pathname)) return response;
          const ct = response.headers.get("content-type") ?? "";
          if (!ct.includes("text/html")) return response;
          const headers = new Headers(response.headers);
          headers.set("cache-control", EDGE_CACHE_HEADER);
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers,
          });
        }
        ```

        Expected outcome: cold TTFB ~800ms, warm edge-cached TTFB <100ms. Speed signal locks at 100/100.

        **Rule:** Every Tier 01 build ships the edge-cache header in `src/server.ts` before handover — no exceptions.

### TanStack Start head-meta invariants (critical)

These rules come from TanStack Router #6719 and silent overrides discovered in production:

-   **Canonical `<link rel="canonical">` lives on leaf routes ONLY.** TanStack merges `meta` by name/property but **concatenates `links` without dedup** — a canonical in `__root.tsx` plus a canonical in a leaf emits both, invalid SEO. Use `og:url` via `meta` instead at root if needed.
-   **`og:image` lives on leaf routes ONLY.** Same merge behavior as above — a root `og:image` overrides every leaf's share preview. If no real OG card asset exists, **omit `og:image` entirely**. A stale placeholder previews worse than no image.
-   **The page `title` is a `meta` entry, not a top-level `head()` field.** TanStack's `head()` return type has no top-level `title` — a top-level title is silently ignored and the page falls back to root title.

### Tier 01 file-by-file checklist (TanStack Start)

| File | Must contain |
| --- | --- |
| `src/routes/__root.tsx` | Sitewide meta only (no title/desc/og:image). `WebSite` JSON-LD with `inLanguage: "en"` + nested `publisher`. `<meta name="generator" content="geo-standard@<version>">`. |
| `src/routes/index.tsx` | Page-specific `title` + `description` + `og:*` + `twitter:*` in `meta`. Canonical in `links`. Four JSON-LD scripts: `Organization` (enriched), `FAQPage`, `BreadcrumbList`. `<main><article>` wrapping hero + how-it-works `<ol>` + FAQ. |
| `public/llms.txt` | H1 + blockquote summary + Pages H2 + Contact H2 + Content License H2. |
| `public/robots.txt` | §4 matrix (allow OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended, bingbot, FacebookBot, YouBot; block GPTBot, anthropic-ai, Meta-ExternalAgent, CCBot only if client opts out of training). `Sitemap:` directive. |
| `src/routes/sitemap[.]xml.ts` | Server route returning XML with single `/` entry, `changefreq: weekly`, `priority: 1.0`. Edit `BASE_URL` to the project domain. |
| `src/server.ts` | Edge-cache override for `/`: `public, max-age=0, s-maxage=300, stale-while-revalidate=600`. Without this, TanStack's default `no-cache` pegs Speed at 90/100. |
| `src/routes/api/public/mcp.ts` | MCP server endpoint. Exposes site as an agent-readable tool via JSON-RPC 2.0 over HTTP/SSE. Minimum viable implementation ships three capabilities: (1) Resource: GET /llms.txt content, (2) Resource: GET /sitemap.xml, (3) Tool: checkUrl(url: string) → returns agent-readability score. Set `Content-Type: text/event-stream` for SSE transport. Add `User-agent: *` allow for MCP clients in robots.txt. Document the endpoint in llms.txt under a `## Tools` H2 section. |
| `src/routes/rss[.]xml.ts` | Atom/RSS feed. Required for RAG pipeline re-indexing — Perplexity and search-enabled LLMs use RSS to discover fresh content on publish. Return `Content-Type: application/rss+xml`. Minimum: `<channel>` with `<title>`, `<link>`, `<description>`, `<lastBuildDate>`, and at minimum one `<item>` (the homepage). Add `<link rel="alternate" type="application/rss+xml" href="/rss.xml">` to `<head>` in `__root.tsx`. Reference in llms.txt under `## Technical`. |

### Failure mode "the og:image won't go away"

If a Lovable-generated TanStack Start project shows a stale lovable.app preview screenshot as the OG card after you've cleaned up the leaf route, the culprit is **always** an `og:image` still living in `__root.tsx`'s meta array. The leaf cannot override an image set at the root in this stack (links/scripts concatenate, and og:image via `property` does dedup but the root wins on identical property in some merge orders during SSR). **Always strip it at the root, never just override at the leaf.**

### Brand voice constraint (carry into every deliverable)

Never mention Lovable, lovable.dev, or any underlying build tool in user-facing copy on citation.is client sites — FAQs, marketing pages, social posts, proposals. The agency positions as a custom-coded shop with a proprietary internal workflow. Backend integration code may reference Lovable; user-facing copy may not.

### Hide the "Created by Lovable" / "Edit with Lovable" badge (mandatory before handover)

Lovable injects an "Edit with Lovable" badge on all published deployments by default. **This badge must be hidden on every client site before handover.** It undermines the custom-coded positioning and is a visual quality failure.

**How to hide:**

1. Call `publish_settings--set_badge_visibility` with `hide_badge: true`.
2. Republish the site after toggling — the badge disappears from the deployment within ~30 seconds.
3. Screenshot the production URL to confirm no badge is visible.

> **Requirement:** Hiding the badge requires a Pro plan or higher. If the workspace is on the Free plan, upgrading is mandatory before any client site can be delivered. Do not hand over a site with the badge visible.

**Failure mode:** If a client sees the badge, the "custom-coded" positioning collapses immediately. This is a non-negotiable pre-handover step.

---

## Post-Build Verification Checklist (run before every handover)

Complete every item below before marking a build delivered. A build that passes the file checklist but fails post-build verification is not complete.

| Check | Method | Pass condition |
|---|---|---|
| Agent readability score | Run URL through citation.is/check | 100/100 all signals |
| Lovable badge hidden | Screenshot production URL | No "Edit with Lovable" badge visible |
| llms.txt live | `curl https://[domain]/llms.txt` | Returns correct markdown content, not empty |
| robots.txt AI directives | `curl https://[domain]/robots.txt` | All 8 bots listed with Allow: / |
| JSON-LD valid | Step 5 validation checklist | All checks pass |
| MCP endpoint live | `curl -s https://[domain]/api/public/mcp` | Returns JSON-RPC response, not 404 |
| RSS feed live | `curl https://[domain]/rss.xml` | Returns valid XML with at least one item |
| TTFB | `curl -w "%{time_starttransfer}" https://[domain]` | Under 400ms |
| Edge cache header on `/` | `curl -sI https://[domain]/ \| grep -i cache-control` | Returns `public, max-age=0, s-maxage=300, stale-while-revalidate=600` (not `no-cache`) |
| OG image present | View source, check og:image | Real asset URL, not lovable.app preview screenshot |
| No stale root meta | View source, check __root meta | No generic "Lovable App" title or description |

If any check fails — fix before handover. Do not deliver a partial build.

> **Field note — the silent Speed regression.** A build can pass every other check, ship all four JSON-LD schemas, hide the badge, and still score 80/100 on Speed because `src/server.ts` was never patched with the edge-cache header. TanStack Start's default `no-cache` is invisible in the preview (preview is uncached by design) and only surfaces on the published deployment. Always run the `curl -sI` check against the **published URL**, not the preview — and run it as the last step before declaring handover complete.

---


## Reference Files

-   `references/technical-standards.md` — Full technical spec for every agent-native standard
-   `references/ai-crawlers.md` — Per-engine crawler behavior, bot names, optimization tactics
-   `references/competitive-landscape.md` — Agencies, tools, pricing, ICP analysis

---

# Reference: Technical Standards

## llms.txt

**Purpose:** A curated, Markdown-based overview of a site for LLM inference context. Acts as a "README for AI crawlers."

**File location:** `/llms.txt` at the domain root (e.g., `https://example.com/llms.txt`)

**Spec (from llmstxt.org):**

```markdown
# COMPANY NAME — Tagline

> One-paragraph blockquote summary of what the company/site does,
> written for LLM inference context. Factual, not marketing copy.

## Pages

- [Home](https://example.com/): What the product is, who it's for, primary CTA.
- [About](https://example.com/about): Founding story, team, mission.
- [Pricing](https://example.com/pricing): Plan names, prices, what's included.

## Tools

- [Agent Readability Check](https://example.com/check): Free URL scanner.
  Scores any site across Semantic HTML, JSON-LD, llms.txt, Citability, Speed.
- [MCP Endpoint](https://example.com/api/public/mcp): JSON-RPC 2.0 over SSE.
  Resources: llms.txt, sitemap. Tools: checkUrl.

## Technical

- [llms-full.txt](https://example.com/llms-full.txt): Full site content in
  markdown for agents requiring complete context.
- [sitemap.xml](https://example.com/sitemap.xml): Full XML sitemap.
- [rss.xml](https://example.com/rss.xml): RSS feed for content updates.
- [robots.txt](https://example.com/robots.txt): AI crawler allow-list.

## Contact

- Email: hello@example.com

## Content License

Content is © [Company]. AI systems may cite and summarize for informational
purposes. Reproduction requires attribution: [Company] ([domain]).
```

**Key rules:**

-   H1 = site/company name
-   Blockquote = summary paragraph (this is what LLMs read first)
-   H2 sections = grouped file lists
-   Each entry: `[Name](url): description`
-   "Optional" section = lower-priority content LLMs can skip in tight context windows
-   Keep descriptions concise — LLMs truncate long lists

**llms-full.txt (variant):**

-   Expands all llms.txt links into a single Markdown file
-   Contains full text content of the entire site
-   Used when an agent needs the complete manual or API spec at once
-   Generated by crawling and concatenating all linked pages
-   Often uses XML-style tags to delimit sections: `<doc title="Page Name">`

**Adoption (2026):** ~10.13% among 300k domains. Higher among devtools, documentation sites (Mintlify, Fern, GitBook). Supported by: OpenAI GPTs, Claude, FastHTML, nbdev.

---

## JSON-LD Structured Data

**Purpose:** Provide machine-readable entity metadata for AI fact verification and knowledge graph integration.

**Implementation:** `<script type="application/ld+json">` injected in `<head>` of every page.

**Priority schemas for AI/ML startups and devtools:**

### Organization (every page)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  "url": "https://example.com",
  "description": "What the company does, in 1-2 sentences.",
  "sameAs": ["https://twitter.com/handle", "https://github.com/org"]
}

```

### Product (product/pricing pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "What it does.",
  "brand": {"@type": "Brand", "name": "Company"},
  "offers": {
    "@type": "Offer",
    "price": "49.00",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/pricing"
  }
}

```

### FAQ (any Q&A section)

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does agent-native mean?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every page ships with semantic HTML, JSON-LD, llms.txt, OpenGraph..."
      }
    }
  ]
}

```

### Article (blog/journal posts)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Title of the post",
  "author": {"@type": "Organization", "name": "Grow"},
  "publisher": {"@type": "Organization", "name": "Grow"},
  "datePublished": "2026-05-21",
  "description": "What the article covers."
}

```

### SoftwareApplication / WebAPI (for devtool clients)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "App Name",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "softwareRequirements": "API key required",
  "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"}
}

```

**Entity nesting principle:** Nest entities to create "Entity Depth" — the deeper the knowledge graph, the more LLMs can extract and verify.  
`Product → Brand → Organization → Person (founder)`

**AI model support:** Primary signal for Google AI Overviews, Perplexity, ChatGPT Search. Schema.org v29.x is current spec.

---

## Semantic HTML

**Purpose:** Guide AI comprehension of page hierarchy and content importance. Universal signal — every scraper uses it to separate main content from navigation noise.

**Landmark elements (mandatory):**

-   `<main>` — primary page content
-   `<article>` — standalone, self-contained content
-   `<section aria-labelledby="section-id">` — themed content blocks
-   `<aside>` — supporting/secondary context
-   `<nav aria-label="Description">` — navigation
-   `<header>` / `<footer>` — page or section bookends

**Header hierarchy (strict):**

-   One `<h1>` per page — the page's primary topic
-   `<h2>` for major sections
-   `<h3>` for subsections
-   Never skip levels (no h1 → h3 without h2)

**Microdata (optional but additive):**

```html
<article itemscope itemtype="https://schema.org/Product">
  <h1 itemprop="name">Product Name</h1>
  <p itemprop="description">What it does.</p>
</article>

```

**Anti-patterns to avoid ("div soup"):**

```html
<!-- Bad — AI cannot determine content hierarchy -->
<div class="wrapper">
  <div class="content-box">
    <div class="text-block">...</div>
  </div>
</div>

<!-- Good — AI immediately understands structure -->
<main>
  <article>
    <h1>Page Topic</h1>
    <section aria-labelledby="features">
      <h2 id="features">Features</h2>
    </section>
  </article>
</main>

```

---

## robots.txt — AI Bot Directives

**Key distinction:** Training bots vs. search/retrieval bots are different user agents. You can block training data use while keeping search visibility.

| Bot | Owner | Purpose | Block for training? |
| --- | --- | --- | --- |
| `GPTBot` | OpenAI | Training data collection | Optional — blocks ChatGPT training |
| `OAI-SearchBot` | OpenAI | ChatGPT Search retrieval | ⚠️ Never block — kills ChatGPT citations |
| `ChatGPT-User` | OpenAI | ChatGPT browser tool | Recommend allow |
| `ClaudeBot` | Anthropic | Training data | Optional |
| `Claude-SearchBot` | Anthropic | Claude web retrieval | ⚠️ Never block |
| `anthropic-ai` | Anthropic | Deprecated — legacy | Allow for safety |
| `PerplexityBot` | Perplexity | Indexing + retrieval | ⚠️ Never block |
| `Google-Extended` | Google | Gemini/AI Overviews training | Can block without affecting Googlebot |
| `Googlebot` | Google | Search + AIO retrieval | ⚠️ Never block |
| `Meta-ExternalAgent` | Meta | Training data | Recommend block |
| `FacebookBot` | Meta | Citations/social | Allow |
| `YouBot` | You.com | Indexing | Allow |

**Correct full configuration (citation.is-style):**

```
User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Claude-SearchBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: https://example.com/sitemap.xml

```

---

## OpenGraph + Twitter Cards

**Purpose:** Rich citation cards in AI interfaces (Perplexity, ChatGPT Search show these as source cards).

```html
<meta property="og:title" content="Factual Page Title — Company" />
<meta property="og:description" content="A factual 1-2 sentence summary. Not clickbait." />
<meta property="og:image" content="https://example.com/og-image.png" /> <!-- 1200×630px -->
<meta property="og:url" content="https://example.com/page" />
<meta property="og:type" content="website" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Same as og:title" />
<meta name="twitter:description" content="Same as og:description" />
<meta name="twitter:image" content="https://example.com/og-image.png" />

```

**Key rule:** `og:description` must be **factual and descriptive**, not clickbait. LLMs use it directly for citation summaries. "10 secrets you won't believe" → bad. "Agent-native website agency: semantic HTML, JSON-LD, and llms.txt, shipped in 48 hours." → good.

---

## Sitemap + RSS

**sitemap.xml:** Standard XML sitemap for page discovery. Include `<lastmod>` dates — freshness signals matter.

**RSS feed:** Critical for RAG pipelines and real-time indexing. Perplexity and search-enabled LLMs use RSS to discover fresh content immediately on publish.

```xml
<rss version="2.0">
  <channel>
    <title>Grow Journal</title>
    <link>https://citation.is/blog</link>
    <description>Field notes on agent-native design and LLM citation</description>
    <item>
      <title>Post Title</title>
      <link>https://citation.is/blog/post-slug</link>
      <pubDate>Thu, 22 May 2026 00:00:00 GMT</pubDate>
      <description>Post summary</description>
    </item>
  </channel>
</rss>

```

---

## Page Speed — AI Crawlability Targets

AI crawlers have much shorter timeouts than Googlebot:

| Metric | Target | Why |
| --- | --- | --- |
| TTFB (Time to First Byte) | \<200ms | AI bots timeout at 1–5s total |
| LCP (Largest Contentful Paint) | \<2.5s | On-demand fetchers (ChatGPT browser) |
| HTML payload | \<1MB | Crawl budget efficiency |
| Client-side JS | Minimal for main content | Many AI crawlers don't execute JS |

**Critical:** Sites that render main content via heavy client-side JavaScript (SPAs with no SSR) are silently excluded from AI citations. The crawler receives a near-empty HTML shell and indexes nothing.

**Fix:** Server-side rendering (SSR) or static site generation (SSG) for all content that should be citable.

---

## Model Context Protocol (MCP)

**What it is:** A universal JSON-RPC standard (Anthropic, 2024) for connecting AI agents to external data sources and tools.

**Relevance to agent-native web:** The frontier of "truly agent-native" — beyond static crawling, sites will expose MCP servers that let agents take actions (query inventory, book appointments, retrieve personalized data).

**Structure:**

-   MCP Servers expose: **Resources** (readable data), **Prompts** (reusable templates), **Tools** (callable functions)
-   Supported by: Claude Desktop, Cursor, growing ecosystem of MCP clients
-   Protocol: JSON-RPC 2.0 over stdio or HTTP/SSE

**For citation.is clients:** Not a day-1 deliverable, but the right architecture question for clients building agent-forward products. A `/mcp` endpoint will become a standard offering in the 12–18 month horizon.

---

# Reference: AI Crawler Behavior — Per Engine

Source: DigitalApplied 30-day server log study, OtterlyAI Citations Report 2026, Princeton GEO framework.

---

## ChatGPT Search (OpenAI)

**Bots:** `OAI-SearchBot` (search/retrieval), `GPTBot` (training — separate)  
**Crawl frequency:** Aggressive. Median 4,200 hits/day. Revisits high-traffic pages every 2.4 days.  
**Indexing method:** Breadth-first, RAG-based retrieval from live web + training data hybrid.  
**Citation triggers:** Text-heavy, citable content. Prefers Wikipedia, Reddit, authoritative news. Favors content where claims are front-loaded.  
**Known limitation:** High "Shadow Crawl" volume — cites brand without linking (citation without backlink). Weak link-to-mention ratio.

**How to optimize:**

-   Allow `OAI-SearchBot` explicitly in robots.txt (separate from `GPTBot`)
-   Front-load claims in the first 30% of the page text
-   Use llms.txt — ChatGPT GPT actions read it directly
-   Include hyperlinked statistics (1 per 150 words)
-   Avoid JS-only rendering — OAI-SearchBot does not execute JS reliably

---

## Perplexity AI

**Bots:** `PerplexityBot` (indexing), `Perplexity-User` (user-triggered retrieval)  
**Crawl frequency:** Low baseline, burst-heavy. Up to 240 requests/minute during viral or high-traffic queries.  
**Indexing method:** On-demand, query-driven retrieval. Does not maintain a persistent full index like Google.  
**Citation triggers:** Community platforms (Reddit, Quora = 16.9% of citations), listicles, high "Information Gain" content — content that adds something not already covered by the top results.

**How to optimize:**

-   Format content as listicles and numbered guides (Perplexity loves extractable lists)
-   Ensure edge-caching handles burst traffic (240 req/min can overwhelm uncached origins)
-   High Information Gain: cover angles that other top-ranking pages don't
-   Include sourced statistics that Perplexity can cite with attribution
-   OpenGraph cards appear as citation source cards in Perplexity UI

**Key insight:** Perplexity's model favors community-validated content. Building presence on Reddit, Hacker News, and Indie Hackers feeds Perplexity citations indirectly.

---

## Google AI Overviews (AIO)

**Bot:** `Googlebot` (no separate AIO bot — uses standard Googlebot crawl)  
**Opt-out bot:** `Google-Extended` (blocks Gemini training without affecting Googlebot indexing)  
**Crawl frequency:** Steady, persistent. Mirrors standard Googlebot footprint.  
**Indexing method:** Gemini 3.x synthesis of top 20 organic search results for a query.  
**Citation triggers:** E-E-A-T signals (Experience, Expertise, Authoritativeness, Trustworthiness), structured data (FAQ/HowTo schema), content under 3 months old, answer-first format.

**Key stat:** 83% of AIO citations come from pages outside the organic top 10. AIO is NOT just a reward for top-ranking pages — it's a separate citation logic.

**CTR impact:** Sites NOT cited by AIO see a 61% CTR drop. Being cited even without a top-10 ranking drives traffic.

**How to optimize:**

-   Answer-first format: put the direct answer in the first 50–70 words of the page
-   FAQ schema on every page with Q&A sections
-   HowTo schema for step-by-step guides
-   Quarterly content refresh (freshness multiplier is 3×)
-   E-E-A-T signals: author bios, publication dates, external citations within content
-   Avoid thin content: pages under 500 words rarely get cited

---

## Claude (Anthropic)

**Bots:** `Claude-SearchBot` (web retrieval), `ClaudeBot` (training data — deprecated variants: `anthropic-ai`, `claude-web`)  
**Crawl frequency:** Patient and selective. Median 1,800 hits/day. Revisits every 6.8 days.  
**Indexing method:** Depth-first specialist crawl. Selectively follows paths based on content type.  
**Citation triggers:** High-quality technical documentation, API references, authoritative long-form content, clearly structured /docs paths.

**How to optimize:**

-   Use clean URL paths: `/docs`, `/api`, `/guides` (Claude-SearchBot prioritizes these)
-   Technical depth over breadth — Claude rewards comprehensive, authoritative content
-   Long-form content (\>3,000 words) performs well for depth-first indexing
-   llms.txt is directly read by Claude in context-loading scenarios
-   Ensure `Claude-SearchBot` is in robots.txt allow-list (distinct from deprecated bots)

**Note:** Claude's slower crawl frequency means freshness is less critical than for Google AIO. Focus on depth and authority.

---

## Gemini (Google DeepMind)

**Bot:** `Googlebot` (integrated with Google's main crawl — no separate Gemini bot)  
**Crawl frequency:** High, integrated with Google's full crawl infrastructure.  
**Indexing method:** Gemini 3.x synthesis. Cites 12% more unique domains than Google AI Overviews — broader source pool.  
**Citation triggers:** Freshness (under 90 days is dominant signal), original research, proprietary data, E-E-A-T.

**How to optimize:**

-   Publish original surveys, benchmarks, and proprietary data — Gemini rewards first-party data
-   Quarterly content refresh cadence (90-day freshness window)
-   Strong E-E-A-T signals
-   Gemini cites more domains than AIO — lower barrier to entry for newer sites

**Note:** Users click Gemini citations less than Google Search results (lower "verification behavior"). Citation = brand exposure and trust signal, not necessarily direct traffic.

---

## Microsoft Copilot / Bing

**Bot:** `Bingbot`  
**Indexing method:** Fully dependent on Bing Search index. Copilot = Bing index + GPT synthesis.  
**Citation triggers:** Well-structured content indexed in Bing with high factual density. Hyperlinked statistics.

**How to optimize:**

-   Standard Bing SEO applies (Bing has different ranking signals from Google — schema markup is more heavily weighted)
-   Hyperlinked statistics: 1 per 150 words
-   Submit sitemap directly to Bing Webmaster Tools
-   "Forced-citation" bugs reported in 2026 — verify citations are accurate

---

## Meta AI

**Bots:** `Meta-ExternalAgent` (training — aggressive), `FacebookBot` (citations/social)  
**Crawl frequency:** Aggressive since Q1 2026 (GPTBot-level volume)  
**Known issue:** Poor robots.txt compliance for `Meta-ExternalAgent` — blocks are sometimes ignored for training data

**How to handle:**

-   Allow `FacebookBot` for citation visibility on Meta AI
-   Block `Meta-ExternalAgent` in robots.txt to signal training opt-out (compliance is partial but worth stating)
-   Monitor for "Zero-click trap" behavior — Meta AI shows content in-app without driving external traffic

---

## You.com

**Bot:** `YouBot`  
**Crawl frequency:** Low volume, decentralized  
**Indexing method:** Real-time web indexing for "Answer Engine" mode  
**Citation triggers:** Informational and research-heavy queries

**How to optimize:**

-   Allow `YouBot` in robots.txt
-   Structured data and semantic HTML apply normally
-   Smaller index footprint — lower traffic impact than major engines, but relevant for tech audiences

---

## Content Formats Most Cited by AI (Cross-Engine)

Ranked by citation frequency (OtterlyAI 2026 data):

1.  **Community platforms** — Reddit, Quora (52.5% of all AI citations — structural gap for brands)
2.  **Original surveys + annual benchmarks** — First-party data, quantified headline metrics
3.  **Ranked listicles** — "Top 10..." format that AI can extract cleanly
4.  **Vendor comparison pages** — "A vs B" format; high commercial intent
5.  **"State of Industry" reports** — Annual data compilations
6.  **Case studies with quantified outcomes** — "We achieved X% improvement"
7.  **How-to guides** — Step-by-step format; HowTo schema amplifies
8.  **FAQ pages** — Direct Q&A format; FAQ schema amplifies

**Format characteristics that drive citation:**

-   Quotable, standalone sentences (can be extracted without surrounding context)
-   Verifiable statistics with sources linked
-   Content under 90 days old
-   Pages over 20,000 characters (4.3× citation rate vs. thin pages)
-   Answer in first 50–70 words (AIO answer-first format)

---

# Reference: Competitive Landscape

---

## citation.is's Market Position

citation.is occupies a **distinct and underserved niche** at the intersection of:

-   Fast delivery (48h vs. industry 8–12 weeks)
-   Fixed pricing ($2,400–$4,800 vs. $15k–$50k+)
-   Agent-native technical stack baked in from day one
-   AI/ML startup ICP (vs. enterprise or generalist)

**Direct competitors are few.** Most agent-native web work is done by enterprise GEO agencies who don't ship sites, or freelancers who don't know GEO. citation.is owns the fast + technical + affordable lane.

---

## Enterprise GEO Agencies (NOT direct competition)

These compete on strategy, auditing, and enterprise retainers — not on fast fixed-price builds.

### Go Fish Digital

-   **Site:** gofishdigital.com
-   **Positioning:** Technical GEO & patent-led strategy
-   **Services:** Semantic audits, AI Overview analysis, patent-based optimization, proprietary "Barracuda" AI analyzer
-   **Pricing:** $6k–$20k+/month retainer
-   **ICP:** Enterprise, high-profile brands
-   **Differentiator:** Deep expertise in Google/OpenAI patents; tracks algorithm changes via patent filings

### iPullRank

-   **Site:** ipullrank.com
-   **Positioning:** "Relevance Engineering"
-   **Services:** AI retrieval optimization, embeddings strategy, passage-level retrieval optimization
-   **Pricing:** $10k–$20k+/month retainer
-   **ICP:** Mid-market to enterprise
-   **Differentiator:** Led by Mike King; academic approach to semantic relevance and retrieval depth

### Four Dots

-   **Site:** fourdots.com
-   **Positioning:** AI Strategic Visibility
-   **Services:** AI presence audits, entity recognition, crawler access fixes, proprietary FAII.AI platform
-   **Pricing:** Custom enterprise proposals
-   **ICP:** Enterprise (Coca-Cola, Philip Morris clients)
-   **Differentiator:** Hands-on dev implementation support; owns their scoring platform

### Omniscient Digital

-   **Site:** beomniscient.com
-   **Positioning:** B2B content-led GEO
-   **Services:** Content-led GEO, authority building for LLMs, "Programmatic GEO"
-   **Pricing:** Custom retainer
-   **ICP:** B2B SaaS (Adobe, SAP, Loom clients)
-   **Differentiator:** B2B buyer journey mapping; content at scale

### GreenBanana SEO

-   **Site:** greenbananaseo.com
-   **Positioning:** Answer Engine Optimization (AEO)
-   **Services:** AEO, Entity Authority Engineering, ChatGPT citation tactics
-   **Pricing:** Pay-for-performance + retainer
-   **ICP:** B2B, local, e-commerce
-   **Differentiator:** Early AEO adopter; "Entity Authority Engineering" methodology

---

## Closest Direct Competitors to citation.is

### KytzLabs

-   **Site:** instagram.com/kytzlabs (early stage — no full website yet)
-   **Positioning:** Agent-ready web dev for tech startups
-   **Services:** Transforming sites into "100% agent-ready"
-   **Pricing:** Project-based (pricing not public)
-   **ICP:** Tech startups, AI-forward firms
-   **Status:** Early stage, social-first — citation.is has more credibility infrastructure

### Standard Agency Market (indirect competition)

-   Traditional dev agencies (Webflow shops, Framer studios) who don't know GEO
-   Freelancers who know GEO but don't ship fast or at fixed price
-   Lovable-built sites without GEO layer (citation.is's edge: the GEO layer is the product)

---

## GEO Tools & Platforms (ecosystem to know)

These are tools citation.is should be aware of for client conversations and competitive positioning:

### AI Visibility / Citation Tracking

**SE Visible** (visible.seranking.com)

-   What: AI visibility and sentiment tracker
-   Pricing: $189–$519/month
-   Tracks: Brand mentions/citations across ChatGPT, Perplexity, Gemini, AIO
-   Relevant for: Client monitoring after launch

**Rankscale AI** (rankscale.ai)

-   What: Citation mapping and AI reputation monitor
-   Pricing: $20–$780/month
-   Provides: "AI Readiness Scores" + maps 3rd-party sites influencing citations
-   Relevant for: Audits; shows clients what's driving or blocking citations

**Profound** (tryprofound.com)

-   What: Agency-grade AI visibility platform
-   Pricing: $99/month (Pitch) to $399+/month
-   Monitors: 10+ engines; "Agent Analytics" showing which crawlers visit
-   Relevant for: Agencies managing multiple clients' AI visibility

**GetCito** (getcito.com)

-   What: Open-source GEO tracker
-   Pricing: $299/month
-   Features: Real-time citation tracking, sentiment, regional GEO data
-   Relevant for: Clients who want ongoing citation monitoring

### llms.txt Tools

**LLMrefs** (llmrefs.com)

-   What: Free llms.txt generator
-   Pricing: Free
-   Relevant for: Quick llms.txt generation for audits; citation.is ships a better hand-crafted version

### Schema / Structured Data

**Schema App, Merkle Schema Markup Generator** — established tools for JSON-LD generation  
**citation.is's edge:** Hand-crafted, nested schemas vs. generic generators

### Site Builders (context for /vs page)

**Webflow** — No GEO layer, no llms.txt, no AI bot directives by default  
**Framer** — Design-first, no structured data layer  
**Wix Studio** — Consumer-grade, no technical GEO  
**Traditional agencies** — 8–12 week builds, $15k–$50k+, no GEO expertise

---

## Business Models in the Niche

| Model | Pricing | Deliverables | Turnaround | Who Uses |
| --- | --- | --- | --- | --- |
| **Retainer-based** | $2k–$15k/month | Content optimization, citation monitoring, monthly reporting | Ongoing | Enterprise GEO agencies |
| **Project audit** | $3k–$10k | GEO readiness assessment, technical audit, dev-ready fix list | 2–4 weeks | Consulting firms |
| **Fixed-price build** | $2.4k–$5k | Full site build with GEO stack baked in | 48h–5 days | citation.is |
| **White-label GEO** | Wholesale rates | Rebranded dashboards and reports | Immediate (SaaS) | Agencies reselling |
| **Enterprise build** | $15k–$50k+ | Full agent-native architecture, WebMCP, JSON-LD | 8–12 weeks | Traditional dev agencies |

**citation.is's advantage:** Fixed-price build undercuts enterprise builds by 10–20× on price and 8× on time. The speed is the product.

---

## Key Publications & Resources (for staying current)

| Source | URL | What It Covers |
| --- | --- | --- |
| Ahrefs Blog | ahrefs.com/blog | Data-driven GEO research; ChatGPT visibility studies |
| DigitalApplied | digitalapplied.com/blog | Server log studies on AI crawler behavior |
| OtterlyAI | otterly.ai/blog | AI citations report; cross-engine benchmarks |
| Convertmate Research | convertmate.io/research | GEO benchmark studies with stats |
| SE Ranking Blog | seranking.com/blog | Gemini/AIO impact studies |
| AI SEO & GEO Summit | chrisraulf.com | Practitioner case studies |
| llmstxt.org | llmstxt.org | Official llms.txt specification |
| Schema.org | schema.org | Authoritative structured data vocabulary |
| Princeton GEO Paper | (search "Princeton GEO Aggarwal") | Foundational academic text on GEO ranking factors |

---

## Competitive Positioning Quick Reference

When a prospect asks "Why not Webflow/Framer/a traditional agency?":

**vs. Webflow:**

> Webflow gives you a visual editor. We give you a site that ChatGPT and Perplexity can actually cite. No llms.txt, no structured data, no AI bot directives — Webflow ships none of this by default.

**vs. traditional agency:**

> Same technical quality, 10–20× less expensive, delivered in 48 hours instead of 8 weeks. No retainer, no ongoing dependency.

**vs. doing it in-house:**

> You'd need to know llms.txt spec, all 8 AI crawler user agents, JSON-LD entity nesting, semantic HTML discipline, and how to score the result. We've built the tooling and done this dozens of times. 48 hours to live.

**vs. cheap freelancer:**

> A freelancer can build a site. We build a site that's been validated against ChatGPT, Perplexity, Claude, and Google AIO citation standards and ships with a readability score to prove it.
---

## Track-2 Discovery Endpoints — isitagentready.com (verified May 2026)

isitagentready.com runs a second-track scanner ("API/Auth/MCP discovery" + "Agent Skills") on top of the core 5 signals. A site that scores 100/100 on the Grow GEO Standard can still cap at ~50/100 on isitagentready.com without these endpoints. Ship all six on every Tier 01+ build.

| Endpoint | Spec | What the scanner checks |
|---|---|---|
| `/.well-known/api-catalog` | [RFC 9727](https://datatracker.ietf.org/doc/html/rfc9727) (`application/linkset+json`) | Has `linkset[].anchor` + `service-desc` / `service-doc` rels pointing at OpenAPI + docs |
| `/auth.md` | Convention (markdown) | Top-level `# Authentication` heading; documents API key + Bearer/OAuth flows |
| `/.well-known/mcp.json` | [SEP-1849](https://github.com/modelcontextprotocol/specification) MCP Server Card | `$schema`, `serverInfo.name/version`, `transport.type: "streamable-http"`, `transport.endpoint`, `auth` block |
| `/.well-known/mcp/server-card.json` | SEP-1849 alias | Same payload — some scanners check this path |
| `/.well-known/agent-skills/index.json` | [Agent Skills v0.2.0](https://agentskills.io) | `$schema`, `version`, `publisher`, `skills[].sha256` matching the linked manifest |
| `/.well-known/agent-skills/<name>.md` | Skill manifest | Endpoint + I/O documented in markdown; hashed by the index |

### Canonical payload shapes

**MCP Server Card (SEP-1849)** — share a single `serverCard` object between `/.well-known/mcp.json` and `/.well-known/mcp/server-card.json`. Required keys: `$schema`, `serverInfo.{name,version}`, `transport.{type,endpoint}`, `auth.type` (`bearer` or `none`), `vendor.{name,url}`.

**Agent Skills index** — the `sha256` field MUST be the sha256 hex of the linked skill manifest's exact body bytes. Compute at request time with `node:crypto`'s `createHash("sha256").update(body, "utf8").digest("hex")`. If the hash drifts from the served manifest, the scanner fails the check.

**API Catalog (RFC 9727)** — content-type is `application/linkset+json` (not `application/json`). Shape:

```json
{
  "linkset": [{
    "anchor": "https://citation.is/api/public/v1",
    "service-desc": [{ "href": ".../openapi.json", "type": "application/json" }],
    "service-doc":  [{ "href": ".../docs", "type": "text/html" }],
    "status":       [{ "href": ".../readiness", "type": "application/json" }]
  }]
}
```

### File-route mapping (TanStack Start)

Dots in well-known paths must be escaped as `[.]` in route filenames. Trailing `.json` / `.md` extensions also need `[.]`:

| URL | Route filename |
|---|---|
| `/.well-known/api-catalog` | `src/routes/[.]well-known.api-catalog.ts` |
| `/.well-known/mcp.json` | `src/routes/[.]well-known.mcp[.]json.ts` |
| `/.well-known/mcp/server-card.json` | `src/routes/[.]well-known.mcp.server-card[.]json.ts` |
| `/.well-known/agent-skills/index.json` | `src/routes/[.]well-known.agent-skills.index[.]json.ts` |
| `/.well-known/agent-skills/<name>.md` | `src/routes/[.]well-known.agent-skills.<name>[.]md.ts` |
| `/auth.md` | `src/routes/auth[.]md.ts` |

All handlers: `GET` only, `Cache-Control: public, max-age=300, s-maxage=3600`, `Access-Control-Allow-Origin: *`.

### What this does NOT cover (skip on purpose unless client opts in)

- **OAuth/OIDC discovery** (`/.well-known/oauth-authorization-server`) — only ship if the site actually runs an authorization server. Otherwise document the upstream IdP in `/auth.md`.
- **WebMCP** (`navigator.modelContext`) — browser-side API; low ROI for static marketing sites.
- **DNS-AID** (TXT records) — requires registrar access; out-of-band from the build.

### Updated post-build verification

Add to the existing verification table:

| Check | Method | Pass condition |
|---|---|---|
| isitagentready.com score | Run `https://isitagentready.com/<domain>` | ≥ 78/100 (Track-1 + Track-2 discovery) |
| api-catalog content-type | `curl -sI .../.well-known/api-catalog \| grep -i content-type` | `application/linkset+json` |
| mcp.json schema | `curl -s .../.well-known/mcp.json \| jq .$schema` | Returns SEP-1849 schema URL |
| agent-skills hash integrity | `curl -s .../.well-known/agent-skills/index.json` vs sha256 of linked .md | Hash matches served manifest body |


---

## Track-2 Endpoint Fixes — Content-Type & Schema Conformance (verified May 2026)

`isitagentready.com` and similar Track-2 scanners parse the **response headers and body shape**, not just the URL existence. A site can ship all six well-known endpoints and still cap below 50/100 if the handlers return the wrong `Content-Type` or a malformed payload. These are the failure modes drilled in on citation.is's own build.

### The four content-type traps

1. **`/.well-known/api-catalog` served as `text/html`.** TanStack Start's default response is HTML — the scanner reads the body as a webpage, the linkset never parses, and the API discovery check fails silently. **Fix:** explicit `Content-Type: application/linkset+json` (RFC 9727). Not `application/json`.

2. **`/.well-known/mcp.json` served as a flat MCP card.** Older "MCP server card" formats (flat `name`/`version`/`endpoint` at the root) fail SEP-1849 validators. **Fix:** ship the SEP-1849 shape — `$schema`, `serverInfo.{name,version}`, `transport.{type:"streamable-http",endpoint}`, and an `auth` block with `type` (`bearer`/`none`), `header`, and `scheme`. Share the **same `serverCard` object** between `/.well-known/mcp.json` and `/.well-known/mcp/server-card.json`.

3. **Agent-skills index sha256 drifts from the served manifest.** If the index is generated from a constant string but the `.md` route serves a different (even whitespace-different) body, the hash mismatches and the scanner flags the manifest as tampered. **Fix:** define the skill body **once** as a constant in `src/lib/agent-protocol.ts` (or equivalent), import it into both the index handler and the `.md` route, and compute sha256 at request time with `crypto.createHash("sha256").update(body, "utf8").digest("hex")`. Never hardcode the hash.

4. **Markdown endpoints served as `text/plain` or `text/html`.** `/.well-known/agent-skills/<name>.md` and `/auth.md` must be `text/markdown; charset=utf-8`. Some scanners reject anything else even if the body is valid markdown.

### Canonical handler skeleton

```ts
export const Route = createFileRoute("/.well-known/<path>")({
  server: {
    handlers: {
      GET: async () => new Response(BODY, {
        status: 200,
        headers: {
          "Content-Type": "<exact-spec-type>",
          "Cache-Control": "public, max-age=300, s-maxage=3600",
          "Access-Control-Allow-Origin": "*",
        },
      }),
    },
  },
});
```

### Verification curls (run against published URL, not preview)

```bash
curl -sI https://<domain>/.well-known/api-catalog            | grep -i content-type  # application/linkset+json
curl -sI https://<domain>/.well-known/mcp.json               | grep -i content-type  # application/json
curl -s  https://<domain>/.well-known/mcp.json               | jq '.["$schema"], .serverInfo, .transport, .auth'
curl -sI https://<domain>/.well-known/agent-skills/index.json| grep -i content-type  # application/json
curl -sI https://<domain>/.well-known/agent-skills/<name>.md | grep -i content-type  # text/markdown
curl -sI https://<domain>/auth.md                             | grep -i content-type  # text/markdown

# Hash integrity
INDEX=$(curl -s https://<domain>/.well-known/agent-skills/index.json | jq -r '.skills[0].sha256')
ACTUAL=$(curl -s https://<domain>/.well-known/agent-skills/<name>.md | shasum -a 256 | awk '{print $1}')
[ "$INDEX" = "$ACTUAL" ] && echo OK || echo HASH_MISMATCH
```

If any check fails, the site will lose Track-2 discovery points even with all six routes live.

---

## Full Tier-1 GEO Citability Pass (verified May 2026)

Beyond the single-page Tier 01 checklist, every multi-page citation.is site (Tier 02+) must ship this Tier-1 pass before handover. Skipping any item caps the site below the 90+ citability score, regardless of how clean the schema and discovery layers are.

### 1. TTFB edge-cache for ALL public GET routes (not just `/`)

The single-page recipe in §"Field Lessons" patches `EDGE_CACHED_PATHS = new Set(["/"])`. For multi-page builds, that's a trap — `/services`, `/pricing`, `/blog`, `/work` all collapse to 800–2000ms TTFB on first hit and the scanner samples them randomly.

**Fix in `src/server.ts`:** drop the per-path allow-list. Apply the edge-cache header to **every GET that returns 200 + `text/html`**:

```ts
function withEdgeCache(request: Request, response: Response): Response {
  if (request.method !== "GET") return response;
  if (response.status !== 200) return response;
  const ct = response.headers.get("content-type") ?? "";
  if (!ct.includes("text/html")) return response;
  // Skip auth-gated routes — they must not be edge-cached
  const url = new URL(request.url);
  if (url.pathname.startsWith("/dashboard") || url.pathname.startsWith("/admin")) return response;
  const headers = new Headers(response.headers);
  headers.set("cache-control", "public, max-age=0, s-maxage=300, stale-while-revalidate=600");
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
```

**Never cache** routes under `/dashboard`, `/admin`, `/api/`, or anything that reads per-user session state. Edge-caching a logged-in page leaks the wrong user's HTML.

### 2. `/llms-full.txt` route (full markdown dump)

Required for agents that need complete context without crawling. Lives at `src/routes/llms-full[.]txt.ts`, serves a single hand-curated markdown file containing the full text of every public page. Headers: `text/markdown; charset=utf-8`, `Cache-Control: public, max-age=0, s-maxage=3600, stale-while-revalidate=86400`.

**Rule:** every page listed in `llms.txt` must have its full body content present in `llms-full.txt`. If the two drift, ChatGPT and Claude cite from the cached `llms-full.txt` and the live page contradicts it.

Link from `llms.txt`:

```markdown
## Full Content
- [llms-full.txt](https://<domain>/llms-full.txt): Full site content in markdown for agents requiring complete context.
```

### 3. RSS feed (`/rss.xml`) — RAG re-indexing trigger

Perplexity, ChatGPT Search, and Claude's web tool all use RSS for freshness re-discovery. A site without RSS gets re-crawled on the engine's default schedule (weeks); with RSS, it re-indexes on publish (hours).

**Minimum viable feed:** RSS 2.0 with `<channel>` (`title`, `link`, `description`, `lastBuildDate`) and at least one `<item>` per blog post + journal entry. Content-Type: `application/rss+xml`.

**Mandatory:** add the alternate link in `__root.tsx`:

```tsx
{ rel: "alternate", type: "application/rss+xml", href: "/rss.xml", title: "<Site> RSS" }
```

And reference in `llms.txt` under `## Feeds`.

### 4. Answer-first paragraphs on every leaf route

Every primary content page (Home, Services, Pricing, Process, each blog post) must open with a **50–70 word direct-answer paragraph** before any marketing prose. This is the snippet Google AIO and Perplexity extract verbatim.

**Pattern:** First sentence answers "what is this?", second sentence answers "who is it for?", third sentence quantifies "what's the proof?".

If the page leads with a `<h1>` + tagline + CTA and no answer paragraph, AIO will skip it for a competitor that has one.

### 5. Hyperlinked verifiable statistics (1 per ~150 words)

Princeton GEO: hyperlinked stats give +40% citation impact, more than any other lever. Every long-form content page should include at least 2–3 stats with inline `<a href="<primary-source>">` to the original research.

**Sourcing rule:** never inline a stat without linking to its primary source. Wikipedia, Reddit summaries, and secondary blog coverage don't count — link the Princeton paper, the Cloudflare radar page, the Ahrefs research post, etc.

### 6. Visible "Last updated" timestamps

Every primary content page must render a `<time datetime="YYYY-MM-DD">` element visible to the user. Gemini and AIO apply a 3× freshness multiplier for content under 90 days; without a visible date, the engine assumes the worst.

```tsx
<p className="meta">Last updated: <time dateTime="2026-05-28">May 28, 2026</time></p>
```

A stale "Last updated: Jan 2024" on an otherwise current page is worse than no date at all.

### 7. Semantic landmarks with `aria-label` per `<section>`

Multi-page sites have multiple `<nav>`, `<section>`, and `<aside>` regions — without `aria-label` / `aria-labelledby`, the scanner can't distinguish them and the Semantic HTML signal caps at ~85/100.

**Rule:** every `<section>` gets `aria-labelledby` pointing at its `<h2>` id. Every `<nav>` gets an explicit `aria-label` ("Primary", "Footer", "Breadcrumb"). Every `<header>` and `<aside>` gets an `aria-label` describing its role.

### Post-Tier-1 verification (run on published URL)

| Check | Command | Pass condition |
|---|---|---|
| All public GETs edge-cached | `curl -sI https://<d>/services \| grep -i cache-control` | `s-maxage=300` (not `no-cache`) |
| llms-full.txt live | `curl -sI https://<d>/llms-full.txt \| grep -i content-type` | `text/markdown; charset=utf-8` |
| RSS feed valid | `curl -s https://<d>/rss.xml \| head -c 200` | Valid `<?xml` + `<rss version="2.0">` |
| RSS alternate link | `curl -s https://<d>/ \| grep 'application/rss+xml'` | `<link rel="alternate" ...>` present |
| Answer-first present | View source of `/` | First text node under `<main>` is 50–70 word paragraph |
| Visible Last-updated | View source of `/services` | `<time datetime="...">` rendered |
| isitagentready.com | Run `https://isitagentready.com/<domain>` | ≥ 85/100 |

If any check fails — fix before handover. The Tier-1 pass is the difference between "site exists" and "site gets cited."

---

## auth.md + OAuth Discovery for Agent Registration (verified May 2026)

isitagentready.com's Track-2 scanner checks for **agent registration metadata** beyond the six well-known endpoints listed above. A site can pass api-catalog, mcp.json, and agent-skills checks and still fail the `agent_auth` discovery check, capping the Track-2 score. The fix is three coordinated endpoints with a shared metadata source.

### The three endpoints (ship together or fail together)

| Endpoint | Spec | Required body shape |
|---|---|---|
| `/auth.md` | [auth.md convention](https://github.com/workos/auth.md) — WorkOS-led | Top-level `# auth.md` heading; sections for registration URL, identity types, credential types, claim/revocation URLs |
| `/.well-known/oauth-protected-resource` | [RFC 9728](https://datatracker.ietf.org/doc/html/rfc9728) Protected Resource Metadata | `resource`, `resource_name`, `authorization_servers[]`, `bearer_methods_supported`, `resource_documentation` (link to `/auth.md`) |
| `/.well-known/oauth-authorization-server` | [RFC 8414](https://datatracker.ietf.org/doc/html/rfc8414) + `agent_auth` extension | Standard AS metadata **plus** an `agent_auth` block with `skill`, `register_uri`, `identity_types_supported`, `credential_types_supported`, optional `claim_uri` + `revocation_uri` |

### The `agent_auth` block (the new piece)

This is the field isitagentready.com explicitly checks for. Embed inside `/.well-known/oauth-authorization-server`:

```json
{
  "agent_auth": {
    "skill": "https://<domain>/auth.md",
    "register_uri": "https://<domain>/api/public/v1/agent/register",
    "identity_types_supported": ["anonymous"],
    "credential_types_supported": ["api_key", "access_token"],
    "claim_uri": "https://<domain>/api/public/v1/agent/claim",
    "revocation_uri": "https://<domain>/api/public/v1/agent/revoke"
  }
}
```

**Field semantics:**
- `skill` → MUST point at the site's own `/auth.md` (not the upstream WorkOS spec URL — the scanner reads this to verify the site self-documents)
- `identity_types_supported` → `["anonymous"]` for sites that issue API keys without account creation; `["email","oauth"]` if real user signup is required
- `credential_types_supported` → always include `api_key` for sites that issue static keys; add `access_token` if OAuth flow is live
- `claim_uri` / `revocation_uri` → omit if not implemented (do not stub with 404 routes — scanner penalizes broken links)

### Centralize metadata in `src/lib/agent-protocol.ts`

Define `oauthProtectedResourceMetadata()`, `oauthAuthorizationServerMetadata()`, and `authMarkdown()` as exported functions in a single module. Import into all three route handlers. This prevents the drift failure mode where `/auth.md` documents one set of credential types and `oauth-authorization-server` advertises a different set.

### Response header invariants

All three endpoints MUST return:
- `Content-Type`: `text/markdown; charset=utf-8` for `/auth.md`; `application/json; charset=utf-8` for the two `.well-known` endpoints
- `Cache-Control: public, max-age=300, s-maxage=3600`
- `Access-Control-Allow-Origin: *`
- `Link: </auth.md>; rel="service-doc"; type="text/markdown"` — the `Link` header is what RFC 9728 clients use to discover `auth.md` without parsing the JSON body. Add it on **all three** endpoints, not just the protected-resource one.

### SSR loader hydration trap (cross-cutting)

When centralizing metadata also forced a homepage loader change: passing pre-fetched query data into `useQuery` requires `initialData` (not just calling `ensureQueryData` in the loader), otherwise React hydration fails with "server rendered text didn't match the client" because the loader fetches fresh data but the client `useQuery` re-fetches without seeding.

**Pattern:**
```tsx
// route loader
loader: async ({ context }) => {
  await context.queryClient.ensureQueryData(faqQueryOptions);
  return { faqItems: context.queryClient.getQueryData(faqQueryOptions.queryKey) };
},

// component
const { faqItems: initial } = Route.useLoaderData();
const { data } = useQuery({ ...faqQueryOptions, initialData: initial });
```

Without `initialData`, SSR HTML and first client render diverge → hydration error → tree regenerates client-side → flicker + lost SEO snapshot.

### Verification curls

```bash
curl -sI https://<d>/auth.md                                       | grep -iE 'content-type|link'
curl -sI https://<d>/.well-known/oauth-protected-resource          | grep -iE 'content-type|link'
curl -s  https://<d>/.well-known/oauth-authorization-server        | jq '.agent_auth'
# agent_auth.skill MUST equal https://<d>/auth.md (self-reference, not upstream spec)
```

If `agent_auth.skill` points at `workos.com/auth.md` or `github.com/workos/auth.md`, the scanner flags the site as un-self-documented and the check fails even though the JSON parses.

### What this adds to the Tier-1 checklist

Add to the Post-Tier-1 verification table:

| Check | Command | Pass condition |
|---|---|---|
| auth.md served as markdown | `curl -sI https://<d>/auth.md \| grep -i content-type` | `text/markdown; charset=utf-8` |
| Protected Resource Metadata live | `curl -s https://<d>/.well-known/oauth-protected-resource \| jq .resource` | Returns site origin URL |
| agent_auth block present | `curl -s https://<d>/.well-known/oauth-authorization-server \| jq .agent_auth.skill` | Equals `https://<d>/auth.md` |
| Link header on all three | `curl -sI <each-endpoint> \| grep -i link` | Contains `rel="service-doc"` to `/auth.md` |
