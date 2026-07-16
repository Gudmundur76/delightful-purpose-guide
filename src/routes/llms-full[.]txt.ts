import { createFileRoute } from "@tanstack/react-router";

const CONTENT = `# citation.is — Full Content

> Agent-native website agency. Marketing sites for AI startups, agent platforms, and developer tools — engineered to be cited by ChatGPT, Perplexity, Claude, and Google AI Overviews. Fixed price. 48-hour delivery.

Last updated: May 2026

---

# Home — Built for Humans. Parsed by Agents.

citation.is builds agent-native websites for AI startups. Every site we deliver is engineered to be cited by ChatGPT, Perplexity, Claude, and Google AI Overviews — with semantic HTML, JSON-LD structured data, llms.txt, and a verified agent-readability score. Fixed price. 48-hour delivery.

## Why agent-native matters

- 83% of AI Overview citations come from pages outside the organic top 10 — the old SEO playbook is structurally broken for AI engines.
- 73% of websites are silently excluded from AI citations due to fixable technical issues (wrong robots.txt, CDN/WAF blocks, JS-only rendering).
- Google AI Overviews now trigger on approximately 48% of all queries.
- AI-referred sessions jumped 527% year-over-year in early 2025.
- Pages with content over 20,000 characters receive ~4.3× more AI citations than thin pages (Princeton GEO framework, Aggarwal et al.).

## What we ship

- Semantic HTML5 with one H1 per page and full landmark coverage (main, nav, header, footer, article, section).
- JSON-LD schemas: Organization, WebSite, Service, Product, FAQPage, BreadcrumbList, Article — validated before launch.
- /llms.txt and /llms-full.txt at the site root.
- robots.txt that allows search/citation bots (Googlebot, OAI-SearchBot, PerplexityBot, ClaudeBot, bingbot, FacebookBot) and only blocks training-only bots when the client opts out.
- OpenGraph + Twitter Card meta on every route.
- RSS/Atom feed at /rss.xml.
- Edge-cached HTML for sub-200ms TTFB.

---

# Services

Three productized engagements. Fixed price, fixed scope, fixed timeline.

## Agent-Native Website Build — from $2,400

Full-stack agent-native site: semantic HTML, JSON-LD structured data, llms.txt, OpenGraph, sitemap, and RSS. Scored and delivered in 48 hours.

## Agent Readability Audit — from $800

Run the citation.is /check scanner on your existing site across six signals (Semantic HTML, JSON-LD, llms.txt, Citability, Speed, Protocol Discovery). Get a prioritized fix list.

## Schema & Structured Data Optimization — from $1,200

Deep JSON-LD work: Organization, Product, FAQ, BreadcrumbList, Article, WebAPI. Validated against schema.org. Built so AI engines verify your entity and cite you correctly.

---

# Process — Five Steps to a Live Agent-Readable Site

1. Brief — fixed scope, fixed price, hard delivery date.
2. Build — battle-tested internal component library, no Figma-to-dev handoff gap.
3. Score — every page passes the citation.is /check scanner at 90+/100 before review.
4. Review — one 4-hour revision block included.
5. Ship — deploy to your hosting (Vercel, Netlify, Cloudflare). Full GitHub handover.

---

# Pricing

| Tier | Price | Delivery | Includes |
|---|---|---|---|
| Starter | $2,400 USD | 48 hours | 1 page, full agent-native stack |
| Growth | $4,800 USD | 5 days | Up to 5 pages, blog, full schema |

Fixed price. No hourly surprises. Code is yours — full GitHub handover, no lock-in.

---

# Who It's For

- AI/ML startups — model APIs, infrastructure, eval tools, fine-tuning platforms.
- Agent platforms — orchestration, browser agents, voice agents.
- Developer tools — SDKs, CLIs, MCP servers, API products.

If your buyer is a technical founder or platform engineer, you are in the right place.

---

# How We're Different From SEO

Traditional SEO optimizes for Google's ranking algorithm. GEO (Generative Engine Optimization) optimizes for being cited by AI engines.

- SEO measures clicks from a results page.
- GEO measures citations inside an AI answer.
- 83% of AI citations come from outside the organic top 10 — ranking does not predict citation.
- AI crawlers timeout at 1–5 seconds. They do not execute heavy client-side JavaScript.
- AI engines reward semantic HTML, deep JSON-LD, factual front-loaded content, and a published llms.txt.

---

# FAQ

## What does "agent-native" actually mean?
Every page ships with semantic HTML, JSON-LD (Organization, Product, FAQ, BreadcrumbList), an llms.txt at the root, OpenGraph + Twitter cards, and a clean sitemap. The result: ChatGPT, Perplexity, Claude, and Google AI Overviews can read, cite, and link to your product without guessing.

## How is 48 hours possible?
A battle-tested internal build system, a tight component library, and a strict no-revision-loop process. Design and code in the same environment — no Figma-to-dev handoff gap, no waiting on third parties.

## How much does it cost?
Starter: $2,400 USD (1 page, 48 hours). Growth: $4,800 USD (up to 5 pages, 5 days). Fixed price. No hourly surprises.

## What is an agent-readability score?
A 0–100 score across six signals: Semantic HTML, JSON-LD, llms.txt, Citability, Page Speed, Protocol Discovery. Run the free scanner at https://citation.is/check.

## Who is this for?
AI/ML startups, agent platforms, and developer tools selling to technical buyers.

## What if I need changes?
Every build includes one 4-hour revision block after delivery. Larger scope changes are quoted as a separate mini-engagement.

## Do I own the code?
Yes. Full GitHub repository handover. No proprietary CMS, no lock-in.

---

# Contact

Email hello@citation.is or start a brief at https://citation.is/contact.
`;

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: async () => {
        return new Response(CONTENT, {
          status: 200,
          headers: {
            "content-type": "text/markdown; charset=utf-8",
            "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
