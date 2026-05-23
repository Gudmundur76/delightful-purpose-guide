---
name: grow-standard
description: Grow GEO build standard — the engineering contract every grow.contact-style agent-native site must pass before delivery. Use when building, auditing, or remixing any site in the grow ecosystem (Tier 01, Tier 02, white-label remixes). Loads the full geo-standard.md spec and enforces the pass/fail thresholds, robots/llms.txt/JSON-LD/head-meta rules, performance budget, and delivery checklist. Always-on for grow remixes.
---

# Grow Standard (geo-standard@2026.05)

You are building, auditing, or remixing a site that must conform to the
**Grow GEO Standard**. This is a hard engineering contract, not a style guide.
Read it before writing code that touches routing, head/meta, robots.txt,
llms.txt, JSON-LD, sitemap, or performance-critical paths.

- **Current version:** `geo-standard@2026.05` (v1.0, published 2026-05-22)
- **Full spec:** `references/geo-standard.md` in this skill (mirror of
  `docs/geo-standard.md` in the project)
- **Changelog:** `references/CHANGELOG.md`

## Always-on rules (apply without being asked)

These are non-negotiable on every edit:

1. **Pass threshold is 90/100** on the `/check` scanner. Don't ship a route
   or feature that you know would drop the score below 90.
2. **Per-route head/meta is unique** — no route reuses the home page's
   title/description/og:*. Canonical lives on leaves only, never in
   `__root.tsx` (TanStack concatenates `links` without dedup).
3. **JSON-LD by page type** — see spec §6. Validate mentally against
   schema.org before shipping. Inline via the `scripts` array in `head()`.
4. **`/llms.txt` is required** at the root and lists only public routes.
   `/llms-full.txt` only for docs-heavy sites.
5. **`robots.txt` follows the §4 matrix exactly.** Search/citation bots
   (Googlebot, OAI-SearchBot, PerplexityBot, ClaudeBot, bingbot,
   FacebookBot) MUST be allowed. Training-only bots (GPTBot,
   Google-Extended, anthropic-ai, Meta-ExternalAgent, CCBot) are blocked
   only when the client opts out of training. Never confuse a training UA
   with a search UA.
6. **Performance budget is hard:** TTFB <200ms, HTML <1MB, FCP <1.5s
   mobile, JS <180KB gzipped first paint. SSR is mandatory; no
   client-only critical content.
7. **Content rule:** first 50–70 words answer the page's implicit
   question. Front-load quotable claims. Numbers, dates, named entities.
8. **Pre-flight first.** Before any other work, verify §3 — robots not
   blocking, no WAF challenge to bot UAs, server returns 200 to
   `curl -A "GPTBot"`, JS-disabled HTML still contains core content.

## When the user asks for something that violates the standard

Push back. Cite the section. Offer the compliant alternative. Do not
silently ship a regression — the standard is what the client is paying for.

## Stamping a build

Every grow site embeds the standard version it was built against. Look
for `geo-standard@<version>` in `<meta name="generator">` or footer copy.
When the standard bumps, old sites grandfather to their delivery-time
version unless on a retainer.

## How to use this skill

- **Starting a new route:** open `references/geo-standard.md` §6 (JSON-LD)
  and §7 (head/meta) and copy the right shape before writing the route.
- **Auditing a site:** walk §2 thresholds top-to-bottom, then §12
  delivery checklist.
- **Writing robots.txt or llms.txt:** use §4 and §5 verbatim — they are
  the contract.
- **Stress-testing a claim:** check it against §2 + per-engine notes in
  §11 + the four failure modes in `geo-specialist` SKILL.md (empty case
  studies, hidden pricing, undefined jargon, ambiguous logo strips).

## Companion skill

`geo-specialist` carries market context, competitive positioning, and
per-engine optimization details. This skill (`grow-standard`) is the
engineering contract. Use both together when building or auditing.
