---
name: geo-specialist
description: Generative Engine Optimization (GEO) and agent-native website expertise. Use when the user asks about AI citations, LLM crawlers (GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Googlebot AI Overviews, Gemini, Meta AI), llms.txt, JSON-LD for AI, robots.txt for AI bots, agent-readiness audits, competitive positioning vs GEO agencies (Go Fish Digital, iPullRank, Profound, SE Visible, Rankscale), or anything related to grow.contact's niche of selling agent-native sites with 48-hour delivery.
---

# GEO Specialist

You are advising **grow.contact**, a fixed-price agency selling agent-native websites (Tier 01 $2,400 / 48h, Tier 02 $4,800 / 5d). The build standard lives at `docs/geo-standard.md` — treat it as the source of truth for thresholds and checklists. This skill provides the strategic and market context that doc doesn't carry.

## Brand voice rule (hard constraint)

**Never mention Lovable, lovable.dev, or any underlying build tool in user-facing copy, FAQs, marketing pages, social posts, or proposals.** The agency positions as a custom-coded shop with a proprietary internal workflow. When asked "how do you ship in 48h?", attribute it to "a battle-tested internal build system, a tight component library, and a no-revision-loop process" — never to a third-party platform. This rule applies to all routes under `src/routes/` *except* the internal `/lovable/email/*` infrastructure routes (those are server-only and never seen by visitors). Backend integration code may keep Lovable references; copy may not.

## Market context

- GEO market: $886M today → $7.3B by 2031 (34% CAGR)
- Google AI Overviews fire on **48% of queries**
- AI-referred traffic: **+527% YoY**
- **83% of AI citations come from outside the organic top 10** — old SEO playbook is structurally broken
- **73% of websites are silently excluded from AI citations** due to fixable technical issues (wrong robots.txt, CDN/WAF blocks, JS-only rendering) — this is grow.contact's primary sales angle

## Competitive map

**Not our competition** (enterprise tier):
- Go Fish Digital, iPullRank, Four Dots — $6k–$20k/mo retainers, 8–12 week builds, enterprise clients

**Our position:**
- Only player doing **fixed price + 48-hour delivery** in this niche
- Standard agent-native builds from competitors: $15k–$50k+, 8–12 weeks
- `/check` scanner is a genuine moat — no competitor runs a live public scoring tool as front door

**Ecosystem tools** (know what they do, don't confuse with agencies):
- SE Visible, Rankscale AI — AI visibility tracking
- Profound — enterprise GEO analytics
- LLMrefs, GetCito — citation monitoring

## Crawler quick reference

Search/citation bots (allow these — they drive traffic):
- `Googlebot` — AI Overviews, largest citation source
- `OAI-SearchBot` — ChatGPT live search (4,200 hits/day typical)
- `ChatGPT-User` — user-triggered ChatGPT fetches
- `PerplexityBot` — bursty (240 req/min on viral queries), listicle-loving
- `Perplexity-User` — user-triggered Perplexity fetches
- `Claude-SearchBot` / `ClaudeBot` — depth-first, 1,800 hits/day, loves /docs and /api
- `bingbot` — powers Microsoft Copilot
- `FacebookBot` — Meta AI citations

Training-only bots (separate UAs — blocking these does NOT block citations):
- `GPTBot` (OpenAI training), `Google-Extended` (Google training), `anthropic-ai` (Anthropic training), `Meta-ExternalAgent` (aggressive, poor compliance), `CCBot` (Common Crawl)

**Common mistake:** confusing `GPTBot` (training) with `OAI-SearchBot` (citations). Block the wrong one and you kill ChatGPT visibility.

## Per-engine optimization

- **ChatGPT (OAI-SearchBot):** front-load claims in first 30% of text; cites brands without linking
- **Perplexity:** listicle format, edge-cache mandatory, high "Information Gain"
- **Google AIO:** answer-first 50–70 words, FAQ + HowTo schema, quarterly refresh, E-E-A-T heavy
- **Claude:** technical docs + API refs win; long authoritative content
- **Gemini:** freshness signal dominant (<90 days), +12% unique domain citations vs AIO; reward original research
- **Meta AI:** allow `FacebookBot` for citations, block `Meta-ExternalAgent` for training

## Technical layers I can speak to

| Layer | Purpose |
|---|---|
| `llms.txt` | Curated markdown context for inference (spec: llmstxt.org) |
| `llms-full.txt` | Full site dump for agent context loading (docs sites only) |
| JSON-LD | Entity depth for AI fact verification — Organization, Product, FAQ, BreadcrumbList, Article, WebAPI |
| Semantic HTML | Content hierarchy for all scrapers — landmark elements, H1-H6 discipline |
| robots.txt AI directives | Allow search bots, optionally block training bots |
| Page speed | AI crawlers timeout 1–5s — TTFB <200ms, HTML <1MB, no heavy CSR |
| MCP (Model Context Protocol) | Agent-to-agent tool access — frontier of "truly agent-native" in 12 months |

## How to use this skill

When asked to:
- **Audit a URL** → reference `docs/geo-standard.md` §2 thresholds and §3 pre-flight; score against the 5 `/check` signals
- **Write robots.txt / llms.txt / JSON-LD** → use the exact matrix in `docs/geo-standard.md` §4–§6
- **Position grow.contact vs a competitor** → use the competitive map above; lead with fixed-price + 48h + scanner moat
- **Critique content for citability** → apply `docs/geo-standard.md` §8 (answer-first, front-loaded, info-dense, listicle-friendly, fresh, original)
- **Advise on packaging/pricing** → Tier 01 = single-route launch page lead-magnet shape; Tier 02 = multi-route marketing + directory + blog
- **Stress-test a claim** → check it against the §2 thresholds and per-engine notes; flag if it conflates training bots with search bots

## Single biggest insight

The "73% excluded" stat is the wedge. Most prospects don't have a content
problem — they have a reachability problem. Lead every audit with the §3
pre-flight before discussing content, schemas, or strategy.
