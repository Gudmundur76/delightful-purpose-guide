import { createFileRoute } from "@tanstack/react-router";

const CONTENT = `# The Agent-Native Web Standard

> Canonical, versioned, open specification (CC BY 4.0) defining how a website becomes legible to ChatGPT, Perplexity, Claude, and Google AI Overviews.

Current version: geo-standard@2026.07 (v1.1, Verifiability Layer added)

## Core documents

- [Standard (current)](https://citation.is/standard) — Human-readable spec
- [standard.md](https://citation.is/standard.md) — Stable raw markdown
- [standard/v1.md](https://citation.is/standard/v1.md) — Pinned v1 archive

## The five signals (+ verifiability)

1. Semantic HTML — landmarks, one H1, alt text
2. Structured data — JSON-LD by page type (Organization, Article, Product, FAQPage, BreadcrumbList, Dataset, Claim)
3. llms.txt — root + hierarchical sub-contexts
4. Citability — first 50-70 words answer the page's implicit question; numbers, dates, named entities
5. Speed — TTFB <200ms, HTML <1MB, FCP <1.5s mobile
6. **Verifiability Layer (v1.1)** — every quoted stat carries verifiableClaim JSON-LD pointing to a raw data URL; dateModified on every page; sameAs on authors; live signal + freshness decay

## Crawler matrix (§4)

Allow: Googlebot, OAI-SearchBot, PerplexityBot, ClaudeBot, bingbot, FacebookBot
Block (opt-in): GPTBot, Google-Extended, anthropic-ai, Meta-ExternalAgent, CCBot

## Verification

- [Run the scanner](https://citation.is/check) — Free 6-signal score
- [Methodology](https://citation.is/leaderboard/methodology) — Weights, thresholds, refresh cadence
- [Raw data](https://citation.is/data/llms.txt) — Cite any score with a stable URL

## Licensing

CC BY 4.0. Cite as: "The Agent-Native Web Standard, geo-standard@2026.07, citation.is".
`;

export const Route = createFileRoute("/standard/llms.txt")({
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
