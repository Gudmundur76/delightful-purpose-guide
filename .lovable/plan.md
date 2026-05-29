
# Agent-Verifiable Standard — Implementation Plan

Scope confirmed: **all four scope items** + **both data sources** (live API + Q2-2026 archive). Given the surface area (~40+ files), I'll ship in 6 sequenced phases so each one is verifiable before the next.

## Phase 1 — Spec & primitives (foundation)

- Bump `docs/geo-standard.md` → **v1.1 (geo-standard@2026.07)**: add §14 "Verifiability Layer" (Structural Authority, Information Gain, Citation Loop, Freshness Decay, Trust Handshake).
- Create `src/lib/seo/verifiable.ts` — helpers:
  - `verifiableClaim({ id, value, citation, dateModified })` → JSON-LD `Claim` + `StatisticalVariable` / `Observation` builders
  - `datasetSchema({ name, url, dateModified, distribution })`
  - `sectionAria(id)` → returns `{ "aria-labelledby": id }` ergonomic helper
- Create `src/components/VerifiabilityBadge.tsx`, `src/components/CitationSnippet.tsx` (APA + BibTeX one-click copy), `src/components/InformationGainIndicator.tsx`, `src/components/LiveSignal.tsx` (header "Last scan: Xm ago" wrapped in `<time datetime>`).

## Phase 2 — Hierarchical llms.txt

- Trim `public/llms.txt` to **Intent + High-level navigation** (target <2k chars).
- Keep `src/routes/llms-full[.]txt.ts` as the full-context dump.
- New sub-context routes:
  - `src/routes/standard.llms[.]txt.ts`
  - `src/routes/leaderboard.llms[.]txt.ts`
  - `src/routes/data.llms[.]txt.ts` (indexes the raw `/data/*.json` files)
- Root `/llms.txt` links to all three sub-contexts.

## Phase 3 — Raw data directory (live + archive)

- **Live** (server routes, generated from DB):
  - `src/routes/api/public/data/leaderboard[.]json.ts` — current top entries with `dateModified`
  - `src/routes/api/public/data/stats[.]json.ts` — scan totals, citation rate, etc.
  - `src/routes/api/public/data/claims[.]json.ts` — every headline claim with `id`, `value`, `source`, `dateModified`
- **Archive** (static snapshots):
  - `public/data/q2-2026/leaderboard.json`, `stats.json`, `claims.json` — frozen Q2-2026 numbers cited from the report
- Each file emits `Cache-Control: public, max-age=300, s-maxage=3600` and `Last-Modified` header.

## Phase 4 — Citation-loop wiring on key pages

Surgical edits to these high-claim routes:
- `src/routes/index.tsx` — wrap headline stats ("83%", "73%", "+527%") in `<span id="stat-83">` etc., add VerifiabilityBadge, emit nested JSON-LD with `verifiableClaim` linking to `/api/public/data/claims.json#stat-83`.
- `src/routes/leaderboard.tsx` — add `Dataset` schema with `distribution` pointing to live + archive JSON, LiveSignal in header, `dateModified` everywhere.
- `src/routes/stats.tsx` — same treatment for site-wide stats.
- `src/routes/report.q2-2026.tsx` — citation snippet block (APA + BibTeX) + dataset link to archive snapshot.
- `src/routes/about.author.$slug.tsx` — `Person` schema with `sameAs` (LinkedIn / GitHub / ORCID).

## Phase 5 — Semantic landmark + aria sweep

Across every page route in `src/routes/`:
- Ensure each top-level wrapper is `<main>`, each major block is `<section aria-labelledby="...-heading">` with its `<h2 id="...-heading">`.
- One `<h1>` per page, identical string to `JSON-LD.name`.
- Lighter automated pass: build a small script `scripts/check-landmarks.mjs` that flags routes missing `<main>` or with multiple `<h1>`s.

## Phase 6 — Polish & verify

- Add `<meta name="generator" content="geo-standard@2026.07">` in `__root.tsx`.
- Update `scripts/validate-og-meta.mjs` → also validate aria-labelledby + h1↔JSON-LD parity.
- Re-run `/check` after publish; expect Verifiability sub-score to surface.

## Out-of-scope (call out)

- I am **not** running a real "Information Gain vs top-10 SERPs" comparison — that needs Semrush queries and a separate background job. The `InformationGainIndicator` component will show a *stamped* value from `claims.json` (manually curated, refreshed quarterly). Want the live comparator job too? Say so and I'll add a Phase 7.
- I'm **not** redesigning the visual theme — the existing dark/mono direction already matches `ui_ux_directives.theme`.

---

If this plan looks right, reply **"go"** and I'll execute Phase 1 → 6 across the next turns (one phase per turn so you can review). If you want to drop or reorder phases, say which.
