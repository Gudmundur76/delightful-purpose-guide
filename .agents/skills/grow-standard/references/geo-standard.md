# The Grow GEO Standard

**Version:** 1.0 — 2026-05-22
**Owner:** Grow (grow.contact)
**Status:** Acceptance criteria for every Tier 01 / Tier 02 delivery.

This document is the engineering contract. A site is not "done" until it passes
every MUST in this file. The `/check` scanner enforces the scored portion;
this doc covers everything the scanner can't see.

---

## 1. Why this exists

73% of websites are silently excluded from AI citations due to fixable
technical issues. Our promise — "agent-native in 48 hours" — only holds if
every site we ship clears the bar below. This standard is what we sell.

---

## 2. Pass / fail thresholds (the contract)

A site MUST hit all of these before handoff:

| Signal | Threshold | Enforced by |
|---|---|---|
| `/check` Agent Readability Score | **≥ 90 / 100** | scanner |
| Semantic HTML | **≥ 22 / 25** | scanner |
| JSON-LD coverage | **≥ 18 / 20** | scanner |
| `/llms.txt` present and valid | **15 / 15** | scanner |
| Citability (canonical, OG, meta) | **≥ 18 / 20** | scanner |
| Speed (FCP) | **< 1.5s** mobile, **18 / 20** | scanner + Lighthouse |
| Lighthouse mobile SEO | **≥ 95** | manual |
| Lighthouse mobile A11y | **≥ 95** | manual |
| Lighthouse mobile Perf | **≥ 85** | manual |
| HTML payload | **< 1 MB** per route | manual |
| TTFB | **< 200 ms** | manual |

Any red on the above blocks delivery. No exceptions.

---

## 3. The pre-flight checklist (the "73% trap")

Before any other work, verify the site is reachable by AI:

- [ ] `robots.txt` does NOT contain `Disallow: /` for `*` or any AI bot
- [ ] CDN / WAF (Cloudflare, Vercel, etc.) does NOT challenge non-browser UAs
- [ ] Server returns 200 (not 403/503) to `curl -A "GPTBot"` and `curl -A "PerplexityBot"`
- [ ] Core content is in server-rendered HTML — visible with JS disabled
- [ ] No `noindex` in `__root.tsx` or sitewide meta
- [ ] No login wall, paywall, or geo-gate on public pages
- [ ] No `Content-Encoding` errors (brotli/gzip negotiated correctly)

If any of these fail, fix first. Everything downstream is wasted otherwise.

---

## 4. Crawler allow / block matrix

Place this exact matrix in `public/robots.txt`. Edit only the `Sitemap:` URL.

### Allow (search & citation bots — these drive traffic)

| Bot | User-Agent | Why |
|---|---|---|
| Google search + AI Overviews | `Googlebot` | Largest source of AI citations |
| ChatGPT search | `OAI-SearchBot` | ChatGPT live citations |
| ChatGPT browse-on-demand | `ChatGPT-User` | User-triggered fetches |
| Perplexity search | `PerplexityBot` | Citation-heavy answer engine |
| Perplexity user fetch | `Perplexity-User` | User-triggered fetches |
| Claude search | `Claude-SearchBot` / `ClaudeBot` | Anthropic citations |
| Bing / Copilot | `bingbot` | Powers Microsoft Copilot |
| Meta AI citations | `FacebookBot` | Citation surface |

### Block (training-only crawlers — no traffic upside)

Block only if the client explicitly opts out of training. Default = allow.

| Bot | User-Agent | Notes |
|---|---|---|
| OpenAI training | `GPTBot` | Separate from OAI-SearchBot |
| Google training | `Google-Extended` | Separate from Googlebot |
| Anthropic training | `anthropic-ai` | Separate from ClaudeBot |
| Meta scraper | `Meta-ExternalAgent` | Aggressive, poor compliance |
| Common Crawl | `CCBot` | Training data feed |

**Critical:** Search bots and training bots are different UAs. Blocking
`GPTBot` does NOT block `OAI-SearchBot`. Get this wrong and you either leak
training data or kill citations.

---

## 5. `llms.txt` requirements

Every site ships `/llms.txt` at the root. Spec: https://llmstxt.org.

MUST:
- `# {Site name}` (single H1)
- `> One-line summary` (blockquote)
- One paragraph of plain-English context
- `## Pages` section with `- [Title](/path): description` per public route
- `## Optional` section last, for low-priority resources
- No nested headings beyond H2
- Public routes only — never list `/admin`, `/login`, `/api/*`, per-user pages

Also ship `/llms-full.txt` ONLY when the site has substantial documentation
that benefits from full-context loading (docs sites, API references).
Marketing sites should not.

---

## 6. JSON-LD schema requirements

Pick by page type. Inline via the `scripts` array in each route's `head()`.

| Page type | Required schemas |
|---|---|
| Root (`__root.tsx`) | `Organization` OR `WebSite` (one, not both) |
| Home / landing | `Organization` + `WebSite` with `potentialAction` SearchAction |
| Blog post | `Article` (or `BlogPosting`) + `BreadcrumbList` |
| Product / pricing | `Product` with `offers` + `BreadcrumbList` |
| FAQ page | `FAQPage` with all Q&A as `mainEntity` |
| Service / category | `Service` + `BreadcrumbList` |
| Directory listing | `ItemList` with `itemListElement` |
| Profile / case study | `Article` + `BreadcrumbList` |
| About / contact | `Organization` (rich, with `contactPoint`) |
| HowTo / guide | `HowTo` with `step` array |

All schemas MUST validate at https://validator.schema.org with zero errors.
Warnings are acceptable only if documented.

---

## 7. Head / meta requirements (per route)

Every route's `head()` MUST set:

- `title` (in `meta`, not top-level — TanStack ignores top-level title)
- `description` (meta)
- `og:title`, `og:description`, `og:url`, `og:type` (meta)
- `canonical` (in `links`, leaf only — never in `__root.tsx`)

SHOULD set when available:
- `og:image` + `twitter:image` (skip if no meaningful image — a generic
  placeholder previews worse than nothing)
- `article:published_time` / `article:author` on blog posts

MUST NOT:
- Duplicate canonical across `__root.tsx` and a leaf (TanStack concatenates
  `links` without dedup — invalid SEO)
- Reuse home-page title/description on other routes
- Use `noindex` sitewide

---

## 8. Content rules (the citation-trigger layer)

AI engines cite content that is:

1. **Answer-first.** The first 50–70 words of every page must directly answer
   the page's implicit question. No throat-clearing intros.
2. **Front-loaded claims.** Quotable, standalone sentences in the first 30%
   of the body. Each claim self-contained — no "as mentioned above".
3. **Information-dense.** Numbers, dates, named entities, specifics. Vague
   marketing copy does not get cited.
4. **Listicle-friendly where appropriate.** Perplexity especially favors
   numbered lists and comparison tables.
5. **Fresh.** Gemini weights content < 90 days heavily. Quarterly refresh on
   evergreen pages; date-stamp visibly.
6. **Original.** Proprietary data, original research, or a unique POV.
   Rehashed content does not earn citations.

---

## 9. Performance budget

AI crawlers timeout aggressively (1–5s). Hard limits:

- TTFB < 200 ms (SSR, edge-rendered)
- HTML payload < 1 MB
- FCP < 1.5s mobile
- LCP < 2.0s mobile
- CLS < 0.05
- JS bundle < 180 KB gzipped on first paint
- No client-side-only critical content (must render in initial HTML)

---

## 10. Required files at site root

Every site ships:

- `/llms.txt` — agent context (see §5)
- `/robots.txt` — crawler matrix (see §4)
- `/sitemap.xml` — every public route, lastmod accurate
- `/blog/rss.xml` if a blog exists
- `/favicon.ico` and full PWA icon set
- (Optional) `/llms-full.txt` for docs-heavy sites

---

## 11. Per-crawler optimization notes

Quick reference. Build to the matrix in §4 first; tune from here.

- **ChatGPT (OAI-SearchBot):** front-load claims; cites brands without linking
- **Perplexity:** listicle format wins; edge-cache mandatory (burst 240 req/min)
- **Google AIO:** E-E-A-T + FAQ/HowTo schema + quarterly refresh
- **Claude:** loves `/docs` and `/api` paths; long authoritative content
- **Gemini:** freshness < 90 days; original data
- **Meta AI:** allow `FacebookBot`; block `Meta-ExternalAgent` unless training is OK

---

## 12. Delivery checklist (the handoff)

Before marking a site shipped:

- [ ] All §2 thresholds green
- [ ] §3 pre-flight passes
- [ ] §4 robots.txt deployed and verified with `curl -A`
- [ ] §5 `/llms.txt` validates
- [ ] §6 JSON-LD validates at schema.org with zero errors
- [ ] §7 head/meta audit — unique per route, no duplicate canonicals
- [ ] §9 perf budget met on mobile (Lighthouse run on throttled 4G)
- [ ] §10 root files all present and 200
- [ ] `/check` scanner run against the live URL → score ≥ 90
- [ ] "Built by Grow in 48h" badge visible and links to grow.contact
- [ ] Case study entry added to grow.contact `/work`

---

## 13. Versioning

This standard is versioned. AI engines and crawlers change behavior fast.
Review quarterly. Bump version on any threshold change. Old sites grandfather
to their delivery-time version unless on a retainer.

- **v1.0 (2026-05-22)** — initial publication
