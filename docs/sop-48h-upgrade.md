# 48-Hour Agent-Native Upgrade — Fulfillment SOP

**Owner:** Delivery Lead
**Version:** 1.0 — May 2026
**Audience:** Internal only. Do not share with clients.
**Goal:** Ship every "48-hour upgrade" engagement at consistent quality, on time, with zero scope creep.

---

## 0. Definitions

- **T0** — the moment the kickoff checklist is 100% complete (all assets, copy, access in hand). The 48-hour clock starts here, not at contract signature.
- **Build window** — T0 → T0 + 48h. Two contiguous business days.
- **Polish window** — one 4-hour revision block within 5 business days of delivery.
- **Tier 01 / 02 / 03** — Launch Page ($2.4k) / Marketing Site ($4.8k) / Devtool Hub ($8.5k).

---

## 1. Pipeline Stages (end-to-end)

```
Lead → Qualify → Scope Call → Contract → Kickoff (T0) →
Build (48h) → QA → Deliver → Polish (4h) → Handover → 14-day Warranty
```

Every stage has a defined entry condition, exit condition, owner, and artifact.

---

## 2. Stage Details

### 2.1 Qualify (≤ 24h after inbound)

- **Owner:** Founder / sales
- **Entry:** New lead in Supabase `leads` table OR `/check` scan with email captured.
- **Actions:**
  1. Auto-reply (already wired via `lead-auto-reply` email template).
  2. Score the lead: budget tier present? AI/devtool/agent ICP? Live URL?
  3. If hot (tier_02+ and ICP match), trigger `lead-hot-notification`.
- **Exit:** Lead tagged `qualified` or `disqualified` in admin.
- **Artifact:** Lead row updated, internal Slack ping.

### 2.2 Scope Call (30 min, Cal.com)

- **Owner:** Founder
- **Entry:** Lead is `qualified`.
- **Agenda (strict):**
  - 5 min — confirm ICP fit, current site pain
  - 10 min — walk the readiness report (score, top 3 gaps)
  - 10 min — propose tier + scope, name a kickoff date
  - 5 min — answer pricing/process questions; send contract link before hangup
- **Exit:** Contract sent OR explicit "no".
- **Artifact:** Call notes pasted into `leads.notes`, contract URL logged.

### 2.3 Contract & Payment

- **Owner:** Ops
- **Tooling:** PayPal checkout (`/checkout`), invoice receipt auto-sent.
- **Rule:** No design work begins before payment clears for tier_01/02. Tier_03 may start at 50% deposit.
- **Exit:** Payment confirmed in PayPal webhook → `orders` table.

### 2.4 Kickoff — pre-T0 checklist (the most important step)

The 48-hour clock does NOT start until every box below is checked. This is the single biggest predictor of on-time delivery.

| # | Item | Source | Blocking? |
|---|------|--------|-----------|
| 1 | Final copy (hero, sections, FAQ, footer) | Google Doc from client | Yes |
| 2 | Brand assets (logo SVG, color hexes, font names) | Client upload | Yes |
| 3 | 3–5 reference sites (what they like, what to avoid) | Scope call notes | Yes |
| 4 | Hosting target (Vercel / Netlify / Cloudflare) + DNS access OR explicit "deploy to our staging" | Client | Yes |
| 5 | Domain decision (final or temporary) | Client | No, but warn |
| 6 | Analytics + form destinations (Plausible ID, email, CRM webhook) | Client | No |
| 7 | Legal pages (privacy, terms) — provided or use our template | Client | No |

Send the **Kickoff Pack** email (template: `kickoff-pack`) the moment payment clears. Chase missing items every 24h. **Do not start building partial scope** — that is how 48h slips to 96h.

- **Exit:** Checklist complete → set `orders.kickoff_at = now()` → T0 starts.

### 2.5 Build Window (48 hours, broken into 4 phases)

#### Phase A — Hours 0–6: Architecture
- Create new repo from `grow-template-tier-{01|02|03}`.
- Draft route map and `head()` metadata for every route.
- Stub `llms.txt`, `robots.txt`, `sitemap.xml`, `rss.xml` route files.
- Draft JSON-LD: `Organization`, `WebSite`, `Service` minimum; add `Product`, `FAQPage`, `BreadcrumbList` per tier.
- **Checkpoint:** route tree compiles, `bun run build` is green.

#### Phase B — Hours 6–24: Design + Build
- Implement hero + 1 hero variant (A/B switch left in code, off by default).
- Build sections in order: hero → social proof → core value → features/services → pricing/CTA → FAQ → footer.
- All copy lives in route files or `src/content/` — never inline strings in components.
- Use semantic tokens only (`bg-background`, `text-foreground`, `text-accent`). No hex in components.
- **Checkpoint at hour 24:** every section visible at desktop + mobile, no Lorem Ipsum.

#### Phase C — Hours 24–40: Agent-readiness pass
This is the differentiator. Do not skip.

- [ ] Single `<h1>` per route, semantic `<section>` / `<article>` / `<nav>`.
- [ ] JSON-LD validates in Schema.org validator (zero errors).
- [ ] `llms.txt` at root, summarizing site purpose + key URLs.
- [ ] OpenGraph: 1200×630 PNG per route OR derived from hero image.
- [ ] `twitter:card = summary_large_image`, `og:image` set on every shareable route.
- [ ] Canonical tag on every route.
- [ ] `sitemap.xml` includes every public route, with `lastmod`.
- [ ] Lighthouse SEO ≥ 95, Accessibility ≥ 95, Performance ≥ 85 on mobile.
- [ ] Internal `/check` score ≥ 85 on the staged URL.

#### Phase D — Hours 40–48: QA + Deploy
- Run `bun run build` — must pass with zero warnings.
- Manual click-through: every CTA, every form, every external link (open in new tab + `rel="noopener"`).
- Test forms end-to-end: lead lands in Supabase, confirmation email sent, hot-lead Slack ping fires.
- Test on real iPhone Safari + Android Chrome (BrowserStack acceptable).
- Deploy to client's host. Verify DNS, SSL, `www` redirect.
- Verify Plausible/GA fires on production.

- **Exit:** Public URL live, all green checks, deploy logged in `orders.delivered_at`.

### 2.6 Delivery Email (template: `delivery-handover`)

Sent at T0 + 48h sharp (even if a tiny polish item is open — flag it).

Must include:
1. Live URL.
2. GitHub repo invitation link.
3. Loom walkthrough (≤ 5 min) covering: how to edit copy, how to deploy, how forms work, where analytics lives.
4. The **Polish Form** — single Typeform/Cal link to book the 4-hour revision block. Deadline: 5 business days.
5. Warranty terms (14 days, genuine bugs only).

### 2.7 Polish Window (one 4-hour block)

- **Owner:** Original builder.
- **Rule:** Collect ALL revision notes in writing BEFORE the block starts. No live "while you're in there" additions.
- **Out of scope (quote separately):** new sections, new routes, copy rewrites > 30%, new integrations, new design directions.
- **Exit:** Client sign-off email OR auto-close at day 5 of silence.

### 2.8 14-Day Warranty

Fix free: genuine bugs, broken links, regressions caused by us.
Not free: new requests, content changes, third-party breakage (e.g. their CRM API changed).

Log every warranty fix in `orders.warranty_log` for retro.

---

## 3. Quality Bars (non-negotiable)

A build cannot ship unless ALL are true:

- `bun run build` passes with zero TypeScript errors.
- Internal `/check` score ≥ 85.
- Lighthouse mobile: SEO ≥ 95, A11y ≥ 95, Performance ≥ 85.
- No `console.error` in production build.
- Every route has unique `<title>` and `meta description` < 160 chars.
- Every image has `alt`. Every form input has a `<label>`.
- No `localhost`, `lorem`, `placeholder`, or `TODO` strings in shipped HTML.

Run `bun run qa` (script: `scripts/qa-checklist.ts`) before declaring done.

---

## 4. Roles & RACI

| Activity | Founder | Builder | Ops |
|---|---|---|---|
| Qualify lead | A/R | — | C |
| Scope call | A/R | C | — |
| Contract + invoice | A | — | R |
| Kickoff pack | A | C | R |
| Build (48h) | C | A/R | — |
| QA pass | A | R | — |
| Deploy | C | A/R | — |
| Delivery email | A | C | R |
| Polish block | C | A/R | — |
| Warranty | C | A/R | — |

(R = responsible, A = accountable, C = consulted.)

---

## 5. Tooling & Where Things Live

| Concern | Tool / Location |
|---|---|
| Leads, orders, scans | Supabase (`leads`, `orders`, `scans` tables) |
| Payments | PayPal — `/checkout` flow |
| Calls | Cal.com — `cal.com/grow-contact/intro` |
| Email | TanStack server routes under `/lovable/email/*` |
| Internal templates | `grow-template-tier-{01|02|03}` repos |
| Site QA | `/check` (internal scanner) + Lighthouse CI |
| Deploys | Client's hosting; we keep no production secrets |

---

## 6. Failure Modes & Mitigations

| Failure | Cause | Mitigation |
|---|---|---|
| 48h slips | Started without complete kickoff pack | Refuse to start T0; document gating items |
| Polish balloons to a second build | No written revision list | Force Typeform submission before block |
| Client ghosts during build | No async checkpoint | Send hour-24 preview link + Loom |
| Warranty abuse | "Bug" is actually a new feature | Refer to written warranty terms in delivery email |
| Repeated copy rewrites | Copy not signed off at kickoff | Mark copy "FINAL" in writing before T0 |
| Lighthouse regression on deploy | Client host config differs from staging | Deploy first, then re-run Lighthouse on prod |

---

## 7. Continuous Improvement

- After every project, a 15-minute retro. Log in `retros/YYYY-MM-DD-{client}.md`.
- Anything that slipped or surprised gets added to either:
  - The kickoff checklist (if it's a client-side input)
  - The QA checklist (if it's a build-side miss)
  - This SOP (if it's a process gap)

SOPs are living documents. Update the version number at the top whenever the process changes.
