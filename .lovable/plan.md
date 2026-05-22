
# Plan: Two Case-Study Projects to Prove the 48h Promise

## Decisions (locked in)
- **Project A domain:** `agentready.report`
- **Project B domain:** `llms.direct`
- **Backend:** shared Supabase (this project's) — scans + leads flow into grow.contact
- **Project B monetization:** free (pure lead magnet / authority play)
- **Order:** ship A first, then B



Goal: ship two real, useful sites that double as portfolio proof for the $2,400 (Tier 01 — Launch Page) and $4,800 (Tier 02 — Marketing Site) packages. Both must be genuinely agent-native (the niche we sell) and ideally function as supporting services that funnel back to grow.contact.

---

## Concept

Both projects are **owned by us**, niche-relevant, and create real utility — so they're not throwaway demos but tools we can point clients and crawlers at.

### Project A — Tier 01 ($2,400, ~6h build target)
**`agentreadiness.dev`** (or similar) — *"Is your site agent-ready? Free 30-second scan."*

- Single-page launch site wrapping a free public version of our `/check` scanner.
- Lead magnet: every scan captures an email → funnel into grow.contact pipeline.
- Proves: fast turnaround, JSON-LD, llms.txt, OG, single-route SEO done right.
- Practical use: ongoing lead generator for grow.contact.

### Project B — Tier 02 ($4,800, ~24h build target)
**`llmsdirectory.com`** (or similar) — *"The directory of agent-ready sites + the playbook to join them."*

- Multi-route marketing site: home, directory listings, individual site profiles, blog/playbook, submit form, pricing.
- Public leaderboard of best-scoring sites (pulls from our existing `scans` table).
- Blog with 5–8 evergreen posts on agent-native SEO (we already have content patterns).
- Proves: bigger IA, dynamic routes, blog, RSS, sitemap, multi-route OG.
- Practical use: backlink machine + authority play in the niche; every listed site is a warm lead.

Both are positioned as "built by Grow in 48 hours" with a visible badge linking back.

---

## Code Reuse from grow.contact (this is the killer feature)

A huge percentage is reusable as-is or via light adaptation:

| Component / Module | Reuse Strategy | Project A | Project B |
|---|---|---|---|
| `MiniChecker`, `/check`, `scan.functions.ts`, `scans.server.ts` | Copy as-is, point at same Supabase or fork DB | ✅ core | ✅ |
| `RecentScans`, `CaseStudies`, `stats.functions.ts` | Copy | — | ✅ leaderboard |
| `LeadForm`, `SmartContactForm`, `qualify.server.ts` | Copy | ✅ | ✅ |
| `SiteHeader`, `SiteFooter`, `CookieConsent`, `LegalPage` | Copy, restyle tokens | ✅ | ✅ |
| `PricingTable`, `TierCheckoutDialog`, PayPal v6 flow | Skip A; reuse for B if monetized | — | optional |
| Blog system (`blog/posts.ts`, `blog.$slug.tsx`, `rss[.]xml.ts`) | Copy | — | ✅ |
| SEO scaffolding (`llms.tsx`, `sitemap[.]xml.ts`, `robots.txt`, JSON-LD patterns) | Copy | ✅ | ✅ |
| Email templates + `lovable/email/*` routes | Copy + rebrand | ✅ | ✅ |
| Public API (`/api/public/v1/*`) | Skip A; selectively reuse for B | — | ✅ |
| Lead notifications (Slack/email) | Copy | ✅ | ✅ |

**Reuse mechanism:** Lovable's `cross_project--*` tools + `Remix` feature. Best path is to **remix grow.contact** as the starting point for each, then strip what's not needed and rebrand tokens in `src/styles.css`. This is faster than copying file-by-file and preserves working server functions and Supabase wiring.

**Key decision needed:** shared Supabase backend vs. separate per project.
- Shared: instant data, one leaderboard powers all sites, lead funnel is unified.
- Separate: cleaner case-study story ("each project is standalone"), no cross-contamination.
- Recommendation: **shared** for the scan/leads tables (compounding network effect), separate for project-specific tables.

---

## Niche Alignment / Agent-Native Proof

Both sites must *practice what we preach* — they are the case studies:

- llms.txt, robots.txt, sitemap.xml, RSS
- JSON-LD: Organization, WebSite, Service, FAQPage, BreadcrumbList, ItemList (for B's directory)
- Per-route OG image + canonical
- Lighthouse mobile: SEO ≥95, A11y ≥95, Perf ≥85
- Internal `/check` score ≥90 on both (we eat our own dog food)
- Visible "Built by Grow in 48h — scan this site" badge linking back

---

## Timeline

**Project A — 1 build day (8h actual, marketed as "shipped in 6h")**
- Hour 0–2: Remix + rebrand tokens + strip unneeded routes
- Hour 2–5: Hero, scanner embed, lead capture, FAQ, footer
- Hour 5–7: SEO pass, JSON-LD, OG images, llms.txt
- Hour 7–8: QA, deploy, write case-study entry on grow.contact/work

**Project B — 2 build days (16h actual, marketed as "shipped in 48h")**
- Day 1: IA, routes, directory schema, blog port, design pass
- Day 2: Dynamic profile pages, leaderboard, submit flow, content (5–8 posts), SEO, QA, deploy

---

## Deliverables

1. Two live URLs on real domains.
2. Two `/work` case-study entries on grow.contact (replace `nimbusImg` / `vectorImg` placeholders).
3. Loom walkthrough per project showing the 48h timeline + agent-readiness score.
4. Updated `CaseStudies` section pulling real scans from these two sites.

---

## Questions to Resolve Before Building

1. **Domain names** — do we have `agentreadiness.dev` / `llmsdirectory.com` or pick alternatives? (Could check availability.)
2. **Shared vs separate Supabase** — recommend shared for scans+leads.
3. **Monetization on Project B** — leave free (pure lead magnet) or paid listings? Free is faster to ship.
4. **Order** — ship A first (smaller, proves the pattern), then B. Or parallel?

---

## Technical Approach (for the build phase, not now)

```text
grow.contact (source)
   │
   ├── Remix → Project A (Tier 01 launch page)
   │     - keep: scan, lead, SEO scaffolding, header/footer
   │     - drop: pricing, checkout, admin, outreach, public API, blog
   │     - rebrand: tokens in src/styles.css, fonts, logo, copy
   │
   └── Remix → Project B (Tier 02 marketing site)
         - keep: everything from A + blog, leaderboard, public API, OG generation
         - add: directory routes (/site/$slug), submit form, ItemList JSON-LD
         - rebrand: distinct visual identity (different palette + type pair)
```

Shared Supabase project means new scans on either site flow into the same `scans` table that powers grow.contact's `CaseStudies` — instant compounding value.
