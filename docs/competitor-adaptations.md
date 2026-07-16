# Competitor Adaptations

Source of truth for what grow.contact should learn, adapt, or steal from the
competitive landscape. Pair with `docs/geo-standard.md` (the engineering
contract) and the `geo-specialist` skill (market context).

Last reviewed: 2026-06.

---

## Top 5 competitors

### 1. iPullRank — `ipullrank.com`
Enterprise "Relevance Engineering" agency. $15k/mo, 6-month minimum.

**Strongest asset:** *AI Search Manual* — textbook-style, multi-chapter,
schema-heavy "official documentation" framing.

**Adapt:**
- Reframe `guide.generative-engine-optimization.tsx` as *"The GEO Standard
  for Agent-Native Sites"* with chapter structure + `dateModified` in
  JSON-LD. Pure metadata/copy change.
- Add `HowTo` JSON-LD to the technical checklist section — iPullRank
  doesn't, so we can win the AI Overview snippet.
- Publish a public "Keyword Portfolio Matrix" equivalent: query categories
  × structural signals (JSON-LD type, llms.txt, MCP) × engine citation
  impact. New section in `/leaderboard` or standalone `/tools/geo-matrix`.

**Don't copy:** $15k retainer, discovery-call funnel, "custom-designed
program" positioning — destroys the 48h fixed-price moat.

### 2. Go Fish Digital — `gofishdigital.com`
Mid-market SEO agency that bolted GEO onto its retainer stack. ~$6k–$20k/mo.

**Strongest asset:** Case study with concrete outcome metric in the
title (*"3X'ing Leads"*).

**Adapt:**
- Add before/after `/check` scores + citation-count deltas to every
  case study in `/work`. Turn the scanner into proof.
- Add `/vs/go-fish-digital` entry to `lib/comparisons/data.ts` — the
  `vs.$competitor` route handles the rest.
- Publish one client-named case study with a single sharp metric
  ("X citations in Perplexity in 30 days").

**Don't copy:** Full-service retainer upsells (PR, CRO, email) — blurs
the brand and kills the 48h promise. Don't make "book a call" the
primary CTA; `/check` is.

### 3. Profound — `tryprofound.com`
Enterprise AI visibility monitoring SaaS ($58.5M raised). They track, we build.

**Strongest asset:** *Profound Index* — public sector-level benchmark.
Backlinks, press, inbound queries for free.

**Adapt:**
- Monthly *"State of Agent Readiness — [Month] Index"* blog post backed
  by existing leaderboard data. New `blog.$slug.tsx` entry; `Dataset`
  schema already wired on `/leaderboard`.
- Add `sameAs` array to Organization JSON-LD on `index.tsx` (LinkedIn,
  GitHub, X, Crunchbase, Product Hunt). Closes entity disambiguation gap.
  ~15 min.
- Publish an `/report/agent-readiness-2026` route with `@type: Report` +
  `@type: Dataset` — first mover on "agent-readiness report" query.

**Don't copy:** Demo-gated funnel, $1.5k–$5k/mo subscription model,
"Marketing Engineer" manifesto/category-creation play (needs sustained
audience investment we don't have).

### 4. AthenaHQ — `athenahq.ai`
YC-backed GEO action platform (ex-Google/DeepMind). $95/mo self-serve.

**Strongest asset:** *State of AI Search 2026* annual report (gated, sitewide
top-banner) + free 10-minute audit CTA.

**Adapt:**
- Post-scan: surface a *"Share your score"* CTA with badge embed code
  + OG card link. We already have `badge.tsx` and `badge.{$id}[.]svg.ts`
  — just need prominent UI in `check.report.tsx`. Every shared badge =
  inbound link from the exact ICP.
- Add *"your score vs category average"* line to scan results using
  `LEADERBOARD` data. Turns abstract number into a conversion moment.
- One ruthlessly-titled data post anchored to leaderboard data
  (*"AI Companies Scoring Under 50 Leave 38% of Citation Opportunities
  on the Table"*) — dual `Dataset` + `Article` schema.

**Don't copy:** $95/mo subscription — cannibalizes the 48h fix urgency
and forces us to maintain a recurring data pipeline. No credit-based
API pricing.

### 5. isitagentready.com (Cloudflare)
Free public scanner aligned with Cloudflare's agent-protocol stack. The
most technically broad scanner in the market — covers MCP, OAuth, Agent
Skills, x402, A2A, DNS-AID, markdown negotiation.

**Strongest asset:** Customizable check matrix (filter by site type,
toggle individual checks) that *names the standards* — educates users
while scanning, and creates indexable surface area for every standard.

**How we stack up:**

| Category | Their checks | grow.contact today | Gap |
|---|---|---|---|
| Discoverability | robots.txt, sitemap, Link headers, DNS-AID | robots ✓, sitemap ✓ | `Link: <…>; rel="llms"` header; DNS-AID is observational only |
| Content Accessibility | Markdown content negotiation (`Accept: text/markdown` → `.md`) | ✗ | Route-scoped `.md` twin via SSR middleware |
| Bot Access Control | AI bot rules, Cloudflare Content Signals, Web Bot Auth | AI allow-list ✓ | Add `Content-Signal` lines to `robots.txt`; Web Bot Auth observational |
| Protocol Discovery | MCP Server Card, Agent Skills, WebMCP, API Catalog, OAuth discovery, OAuth Protected Resource, `auth.md` | MCP endpoint ✓, OpenAPI ✓ | `/.well-known/mcp.json`, `/.well-known/oauth-protected-resource`, `/auth.md`, `agents.json` |
| Commerce | x402, MPP, UCP, ACP | ✗ | x402 + ACP on `/api/public/v1/checkout` (Tier checkout) |

**Adapt — three tracks:**

**Track 1 — Site-level adoption (~half a day):**
1. Markdown negotiation middleware in `src/server.ts` — if
   `Accept: text/markdown`, return the route's `.md` twin (extends
   the existing `llms-full.txt` generator).
2. `Link` discovery header on every response:
   `Link: </llms.txt>; rel="llms", </api/public/v1/openapi.json>; rel="api-catalog", </api/public/mcp>; rel="mcp"`.
3. `/.well-known/mcp.json` server card pointing at the existing MCP
   endpoint.
4. `/.well-known/oauth-protected-resource` + `/auth.md` (RFC 9728) —
   Supabase auth already in place.
5. `Content-Signal: search=yes, ai-train=no, ai-input=yes` lines in
   `public/robots.txt`.

**Track 2 — Extend the GEO Standard + `/check` rubric:**
Add a sixth signal block (*Protocol Discovery*) to
`docs/geo-standard.md` and to the `/check` scoring (MCP card,
OAuth/`auth.md`, markdown negotiation, Link header, Content
Signals). This keeps grow.contact as the credible standard rather
than a subset of isitagentready's framing. Update
`lib/check/scan.functions.ts` + `geo-standard.md` + the `/check`
report UI in the same PR.

**Track 3 — x402 / ACP for Tier checkout (separate, bigger):**
Add an x402 `402 Payment Required` response on
`/api/public/v1/checkout` alongside existing PayPal v6. Makes
grow.contact the first literally agent-payable agency. Strong
journal + leaderboard narrative.

**Don't copy:**
- DNS-AID — speculative, near-zero adoption. Track, don't implement.
- WebMCP — overlaps with our existing MCP server. One is enough.
- Protocol-completeness as primary value prop — confuses startup
  founders who just want ChatGPT citations. Stay focused on the
  ~8 signals that drive citation probability.

---

## Top 5 adaptations to ship next (leverage / effort)

| # | Adaptation | File(s) | Effort |
|---|---|---|---|
| 1 | Organization `sameAs` array (Profound) | `src/routes/index.tsx` | ~15 min |
| 2 | isitagentready Track 1 bundle (markdown negotiation + `Link` header + `.well-known` files + Content Signals) | `src/server.ts`, `public/robots.txt`, new well-known routes | ~half day |
| 3 | GEO Standard v2 — add Protocol Discovery signal to `/check` rubric | `docs/geo-standard.md`, `src/lib/check/scan.functions.ts`, `src/routes/check.report.tsx` | ~half day |
| 4 | Post-scan "Share your score" badge CTA (AthenaHQ) | `src/routes/check.report.tsx`, `src/routes/badge.tsx` | ~2 h |
| 5 | "Your score vs category average" in scan results (AthenaHQ) | `src/routes/check.report.tsx`, `src/lib/leaderboard/entries.ts` | ~3 h |

Track 3 (x402 checkout) is a separate workstream — bigger, but
unique-in-market once shipped.

---

## Unfair advantage none can replicate

The feedback loop: **scanner → score → 48h fix → higher score** as a
single purchase journey. None of the agencies scan publicly. None of
the tools build. Every adaptation above should sharpen that loop, not
dilute it.
