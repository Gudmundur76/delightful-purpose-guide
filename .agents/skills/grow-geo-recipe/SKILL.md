---
name: grow-geo-recipe
description: Paste-in recipe to score 90+/100 on the grow.contact /check agent-readability scanner. Use when the user asks to "make this agent-readable", "GEO setup", "score 100 on /check", "AI-readable", "add llms.txt", or sets up a new project from the grow.contact playbook. Covers semantic HTML, JSON-LD, llms.txt, robots.txt matrix, per-route head/meta, sitemap, and the edge-cache speed fix.
---

# Grow GEO Recipe

Drop-in recipe for the **Grow GEO Standard** (geo-standard@2026.07). Apply this on any new project to hit 90+/100 on all six weighted `/check` dimensions — Semantic HTML, JSON-LD, llms.txt, Citability, Speed, Protocol — plus the optional Agent Auth bonus dimension.

The full spec is in `references/geo-standard.md` — it's the contract. This skill is the **applier**: it tells you what to ship and gives you the files to copy.

## When to use

- New project that needs to pass the grow.contact `/check` scanner
- User says "make this agent-readable" / "GEO setup" / "AI-readable"
- Migrating an existing site to the Grow standard
- Auditing a site that's stuck at 70–90/100

## Stack detection (do this first)

Look at the project root:
- `src/routes/__root.tsx` exists → **TanStack Start** → use `assets/tanstack/`
- `index.html` at root + `src/main.tsx` + react-router-dom → **Vite/React** → use `assets/vite/`
- Anything else → use `references/geo-standard.md` and adapt the shapes by hand

## Apply checklist (in order)

1. **Pre-flight** (spec §3) — `curl -A "GPTBot" https://<site>/` must return 200 with the core HTML content present **without JS**. If not, stop and fix reachability first; nothing else matters.
2. **robots.txt** → copy `assets/robots.txt` to `public/robots.txt`. This is the §4 matrix: allows search/citation bots (Googlebot, OAI-SearchBot, PerplexityBot, ClaudeBot, bingbot, FacebookBot), blocks training-only bots (GPTBot, Google-Extended, anthropic-ai, Meta-ExternalAgent, CCBot). Edit the `Sitemap:` line to the project domain.
3. **llms.txt** → copy `assets/llms.txt.example` to `public/llms.txt` and rewrite the route list + project description.
4. **Sitemap**:
   - TanStack: copy `assets/tanstack/sitemap[.]xml.ts` to `src/routes/sitemap[.]xml.ts`, edit `BASE_URL` and `entries`.
   - Vite: copy `assets/vite/sitemap.xml` to `public/sitemap.xml`.
5. **Per-route head/meta + JSON-LD**:
   - TanStack: every route file uses the `head()` pattern in `assets/tanstack/route-head.template.tsx`. Root JSON-LD Organization goes in `__root.tsx` (see `assets/tanstack/root-head.snippet.tsx`).
   - Vite: edit `index.html` head with the block in `assets/vite/index-head.html`.
6. **Semantic HTML** — every page renders exactly one `<h1>`, uses `<main>`, `<header>`, `<nav>`, `<footer>`, `<section>`/`<article>` landmarks. Every `<img>` has alt text. Don't ship a layout that's all `<div>`.
7. **Speed / edge cache** (TanStack only — the killer fix):
   - Patch `src/server.ts` with the override block in `assets/tanstack/server.cache-snippet.ts`. This forces `cache-control: public, max-age=0, s-maxage=300, stale-while-revalidate=600` on the homepage HTML so Cloudflare can serve it at sub-100ms TTFB instead of paying SSR cost every request.
   - Without this, TanStack's default `no-cache` header pegs Speed at 90/100 forever.
8. **Citability** — first 50–70 words of the homepage and every leaf route must answer the page's implicit question. Numbers, dates, named entities. No "Welcome to our site" filler.
9. **Verify** — run `/check?url=<site>&auto=true` (preview or published). Target: 100/100. If Speed < 100, re-check step 7 reached production (the cache override only fires on the published worker).

## Hard rules (don't violate)

- **Canonical lives on leaves only**, never in `__root.tsx` — TanStack concatenates `links` without dedup (router#6719). Use `og:url` via meta everywhere.
- **Never confuse training UAs with search UAs.** Blocking `GPTBot` does NOT block ChatGPT citations (that's `OAI-SearchBot`). The §4 matrix in `robots.txt` is correct — do not "simplify" it.
- **Per-route head/meta is unique.** No leaf reuses the home page's title/description.
- **`og:image` only at leaves** (root concatenates and overrides).
- **No client-only critical content.** SSR mandatory. If you need a chart, render a static fallback.
- **Brand voice:** never mention Lovable, lovable.dev, or any underlying build tool in user-facing copy. The agency positions as a custom-coded shop. (Backend integration code is fine.)

## What the standard pegs (spec §2 thresholds)

| Dimension | Pass | How to get 100 |
|---|---|---|
| Semantic HTML | 6/6 landmarks, 1 `<h1>`, alt text on all images | Replace any nav `<div>` with `<nav>`, page wrapper with `<main>` |
| JSON-LD | Valid Organization or WebSite at root | Add type-specific schema per leaf (Article, Product, FAQPage, BreadcrumbList) |
| llms.txt | Present at `/llms.txt`, lists public routes | Keep in sync with sitemap |
| Citability | Title + description + ≥150 words substantive text per leaf | Front-load the answer, numbers/dates/entities |
| Speed | First-byte < 800ms (sub-300ms = full 100) | Edge-cache HTML (step 7), no JS-only content |

## Stamping the build

Add to `__root.tsx` head meta or footer copy:
```
<meta name="generator" content="geo-standard@2026.05">
```
Old sites grandfather to their delivery-time version unless on a retainer.

## Files in this skill

- `references/geo-standard.md` — full spec (geo-standard@2026.05)
- `assets/robots.txt` — §4 matrix, drop-in for `public/`
- `assets/llms.txt.example` — starter, rewrite for the project
- `assets/tanstack/*` — TanStack Start templates (sitemap route, route head, root head, server cache snippet)
- `assets/vite/*` — Vite/React fallback templates (static sitemap, head block for `index.html`)
- `scripts/apply.sh` — copies the right assets into the current project after stack detection
