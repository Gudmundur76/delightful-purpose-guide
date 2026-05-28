# Build Plans — All Three Tracks

Sequenced for compounding leverage. Track 1 ships this week (pure exposure of existing infra), Track 2 runs continuously starting now, Track 3 is a standalone deliverable in month 2.

---

## Track 1 — Public Playground + Leaderboard (this week)

### 1A. `/playground` (or `/mcp`)

**Goal:** Turn the invisible 90+ tool MCP into a sales weapon. Visitors run real tools in-browser, watch JSON-RPC stream, copy install snippets.

**Routes**
- `src/routes/playground.tsx` — main page, route head + JSON-LD `SoftwareApplication`
- `src/routes/playground.$tool.tsx` — deep link per tool (e.g. `/playground/scan_url`)

**Components** (`src/components/playground/`)
- `ToolCatalog.tsx` — left rail, grouped by category (Scan, Blog, Leads, Stats, AI, …), search box, count badge
- `ToolRunner.tsx` — center pane: JSON-schema-driven form built from each tool's Zod schema, "Run" button
- `RequestStream.tsx` — right pane: split view showing outgoing JSON-RPC request + streaming response with syntax highlight
- `InstallSnippets.tsx` — tabs for Claude Desktop config, ChatGPT custom GPT, cURL, n8n, raw `mcp.json`. Each tab has copy-to-clipboard

**Server**
- New serverFn `listMcpTools` in `src/lib/mcp/catalog.functions.ts` — returns `{ name, description, category, inputSchema }[]` derived from the existing tool registry (re-export the metadata, do NOT duplicate)
- Reuse existing `POST /api/public/mcp` for execution. For unauth public access, gate to a curated **read-only / safe** subset: `scan_url`, `validate_jsonld`, `check_llms_txt`, `extract_meta_tags`, `fetch_url`, `get_geo_standard`, `site_info`, `health_check`, `ping`. Mutating tools (`create_*`, `update_*`, `delete_*`, `grant_role`, `send_*`) require an OAuth token — show a "Sign in to run" CTA
- Rate limit: 10 runs/min/IP via existing `src/lib/api/rate-limit.ts`

**Telemetry**
- Log each playground run to `playground_runs` table (tool name, success, ms, ip-hash) so we can publish "top 5 most-tried tools" social proof

**Nav**
- Add `Playground` link to header between `Check` and `Leaderboard`
- Add `<a href="/playground">` from `/check` result page ("Want to run the same scan via API or MCP? Try the playground")

---

### 1B. Public `/leaderboard`

**Goal:** Viral hook. Top 100 agent-native sites by GEO score, weekly auto-refresh, badge embed per entry.

**Routes**
- `src/routes/leaderboard.tsx` already exists — audit and upgrade
- `src/routes/leaderboard.$slug.tsx` — per-entry detail page (score breakdown, history sparkline, badge embed code, "Rescan" button)
- `src/routes/leaderboard.methodology.tsx` — verify present, link from header

**Data**
- Use existing `leaderboard.json` endpoint + `submit_to_leaderboard` tool
- Cron: extend `/api/public/hooks/run-scheduled-scans` to rescan every leaderboard entry weekly. Store score history in `leaderboard_scores` (slug, scanned_at, total, semantic, jsonld, llms, cite, speed)

**UI**
- Table: rank, site, score (color-graded), category, last scan, "+/-" delta, badge button
- Filters: category, score range, country
- Public submit form ("Add your site") → triggers a fresh scan → if score ≥60, auto-listed

**Head/SEO**
- Per-entry head with `Article` + `Review` JSON-LD
- Sitemap: include every leaderboard slug (update `src/routes/sitemap[.]xml.ts`)

**Backlink loop**
- Each detail page shows the embed snippet for `<img src="/api/public/widget/badge.svg?slug=...">` with prominent copy
- Linkback verification: when a scan detects the badge img referencing grow.contact, mark entry `verified=true` and pin to top of its tier

---

## Track 2 — Content Engine Activation (continuous, starts now)

**Goal:** Run the engine you already built. AirOps wins on volume, not capability.

### 2A. Topic & calendar infrastructure

- New table `content_calendar` (slug, topic, target_keyword, intent [informational/comparison/glossary], status, due_at, published_url, scan_score)
- Admin UI at `/admin/content` listing the calendar with bulk actions: "Generate draft", "Approve", "Publish", "Rescan"
- Seed with 50 topics across four buckets:
  - **Glossary** (15): "What is GEO?", "What is llms.txt?", "What is MCP?", "What is AEO?", "Agent-native website", "JSON-LD for AI", "Citability score", "Schema.org for LLMs", …
  - **Playbooks** (15): "How to write llms.txt", "Pass the GEO check in 30 min", "Robots.txt matrix for AI crawlers", "Per-route head/meta for TanStack", "JSON-LD by page type", …
  - **Comparisons** (10): "AirOps vs Grow", "Profound vs Grow", "Athena vs Grow", "Surfer SEO vs Grow", "GEO vs AEO vs SEO", …
  - **Case-study templates** (10): "How [client] hit 100/100 GEO", populated as real clients ship

### 2B. Generation pipeline

- Reuse `draft_blog_post` → `ai_complete_with_context` (with `get_geo_standard` + `check_llms_txt` results as context) → `create_blog_post` → human review → `publish_blog_post`
- Cron: nightly job picks the next 2 calendar items where `status = todo`, generates drafts, sets `status = needs_review`
- Quality gate: every draft auto-runs through the `/check` scanner on a preview URL before allowing publish; reject if score <90

### 2C. Surface the output

- `/blog` index already exists — upgrade with category tabs (Glossary / Playbooks / Compare / Case Studies), JSON-LD `Blog` + per-post `Article`
- `/glossary` route generated from posts tagged `glossary`, alphabetical, each term gets a `DefinedTerm` JSON-LD
- `/compare/[a]-vs-[b]` route pattern with `ComparisonTable` JSON-LD
- Add posts to sitemap dynamically (loader-driven)
- RSS already at `/rss.xml` — verify it picks up new posts

**Volume target:** 50 posts in 30 days, then 4/week steady-state.

---

## Track 3 — Browser Extension (month 2)

**Goal:** Viral discovery surface. Show GEO score on any site, drive installs from Chrome Store.

### 3A. MV3 extension scaffold

- New dir `extension/` (per chrome-extension knowledge)
- `manifest.json` — MV3, permissions: `activeTab`, `storage`, host permissions for `https://*/*`
- `popup.html` + `popup.tsx` — score gauge, 5 sub-scores, top 3 fixes, "Open full report" → `https://grow.contact/check?url=<current>`
- `background.js` — service worker, listens to `chrome.action.onClicked`, calls `POST https://grow.contact/api/public/v1/analyze` with the current tab URL
- `content.js` — optional badge injection into top-right of page (toggle in popup settings)

### 3B. API surface

- Reuse existing `/api/public/v1/analyze` — no new endpoint needed
- Add `X-Source: chrome-extension` header for analytics segmentation
- Rate limit: 60 scans/hour/install (track by anon install_id stored in `chrome.storage.local`)

### 3C. Distribution

- Package via `nix run nixpkgs#zip` (per chrome-extension knowledge), serve `/grow-geo.zip` from `public/`
- Landing page `/extension` with install CTA (fetch+blob download for preview, real Chrome Web Store link once published)
- Promote: header badge ("Get the extension"), every `/check` result page ("Get one-click scans everywhere"), every blog post footer
- Submit to Chrome Web Store + Firefox Add-ons + Edge Add-ons (same MV3 build works for all Chromium browsers)

### 3D. Growth loop

- Extension popup includes "Add this site to the leaderboard" → one-click submit, drives Track 1B
- After 10 scans, prompt user to leave a Chrome Store review
- Weekly digest email (opt-in): "Top 10 most-scanned sites this week from extension users"

---

## Sequencing & dependencies

```text
Week 1  ┃ Track 1A (Playground)        ┃ Track 2A (calendar seed)
Week 2  ┃ Track 1B (Leaderboard)       ┃ Track 2B (generation cron live)
Week 3  ┃ —                            ┃ Track 2C (glossary/compare routes)
Week 4  ┃ Track 3A+B (extension MVP)   ┃ Track 2 steady-state
Week 5  ┃ Track 3C (store submission)  ┃
Week 6  ┃ Track 3D (growth loop)       ┃
```

Track 1 must ship before Track 3 — extension links back to playground + leaderboard. Track 2 runs in parallel from day 1; content fills the routes Track 1 creates.

## Technical notes

- All new routes follow the `grow-geo-recipe` skill: per-route head/meta, JSON-LD by type, canonical on leaves, og:image only at leaves, sitemap updated
- Playground tool runner uses the existing MCP endpoint over `fetch` with `Accept: application/json, text/event-stream` (per mcp-servers knowledge) — no new transport
- Leaderboard rescan reuses existing `run_due_scheduled_scans` infra, just adds a new scheduled_scan row per entry
- Content engine writes to existing `blog_posts` table — no schema change beyond `content_calendar`
- Extension calls only the already-public `/api/public/v1/analyze` — zero new auth surface

## Out of scope (parked for later)

- MCP-as-a-Service per client (track 6 in your message) — needs multi-tenant scoping work, defer to month 3
- Public directory/marketplace (track 7) — emerges naturally from a populated leaderboard + glossary; revisit once those have content
