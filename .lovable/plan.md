# Auto-Fix Intervention Layer

Closes the loop: Scanner diagnoses → Auto-fix drafts → Customer approves → Snippet delivers → Loop validates.

## What ships

### 1. Database (one migration)

Four tables under `public`:

- **`intervention_sites`** — one row per customer domain. Holds `install_token` (uuid, used in snippet URL), `wp_api_key` (nullable, for plugin), `auto_fire_enabled` (bool), `owner_user_id`.
- **`interventions`** — one row per drafted fix. Columns: `site_id`, `kind` (`schema` | `llms_txt` | `robots_txt`), `status` (`drafted` | `approved` | `live` | `rejected` | `superseded`), `payload` (jsonb — the JSON-LD block, llms.txt body, or robots diff), `triggered_by` (`auto_ccs_drop` | `manual` | `scheduled`), `ccs_before`, `ccs_after`, `approved_by`, `approved_at`, `went_live_at`.
- **`intervention_deliveries`** — log of every snippet fetch + plugin pull. `site_id`, `intervention_id`, `delivery_method` (`snippet` | `wp_plugin`), `user_agent`, `ip`, `delivered_at`.
- **`intervention_audit`** — append-only log of state changes for trust/compliance.

All RLS-enabled, scoped to `owner_user_id` via `auth.uid()`. Service role for the public delivery endpoint and cron.

### 2. Three auto-fix MCP tools

In `src/lib/mcp/tools/auto-fix/`:

- **`auto_fix_schema`** — input `{ domain, page_url?, dry_run? }`. Crawls via Firecrawl, extracts Q/A pairs via Lovable AI (`google/gemini-3-flash-preview`, structured output), emits FAQPage + Product JSON-LD, writes a `drafted` row to `interventions`. Returns `{ intervention_id, preview, install_snippet }`.
- **`auto_fix_llms_txt`** — input `{ domain }`. Reuses existing `generateLlmsTxtTool` + `siteUrlsTool`, ranks top 20 routes by scan score, drafts intervention.
- **`auto_fix_robots_txt`** — input `{ domain }`. Fetches current robots.txt, diffs against grow-standard §4 matrix (the 6 search/citation bots: Googlebot, OAI-SearchBot, PerplexityBot, ClaudeBot, bingbot, FacebookBot), drafts intervention with the recommended block.

All three are wired into `src/routes/api/public/mcp.ts`.

### 3. Approval queue

- **Server fn `approveIntervention({ id })`** — auth-required, flips `drafted → approved`, sets `went_live_at = now()`. Snippet endpoint serves only `approved` interventions.
- **Server fn `rejectIntervention({ id, reason })`** — flips `drafted → rejected`.
- **Server fn `listPendingInterventions()`** — returns the user's drafted queue with `payload` for preview.
- **UI**: new route `src/routes/dashboard.interventions.tsx` — table of pending drafts with Preview (renders JSON-LD or diff) and Approve/Reject buttons. Linked from existing dashboard.

### 4. Snippet delivery

- **Public route `src/routes/api/public/inject/[$token][.]js.ts`** — returns a self-executing JS payload that injects approved interventions into `<head>`:
  - JSON-LD: appends `<script type="application/ld+json">` blocks
  - llms.txt: not applicable client-side; the snippet only logs an analytics ping (the actual llms.txt is served from our hosted endpoint customers proxy to)
  - robots.txt: not applicable client-side; surfaced via dashboard for manual paste OR WP plugin
  - Logs to `intervention_deliveries`
  - Aggressive cache headers (`max-age=300, stale-while-revalidate=3600`)
- **Public route `src/routes/api/public/inject/[$token].llms[.]txt.ts`** — serves the approved llms.txt body so customers can simply 301/proxy `/llms.txt` to us.

### 5. WordPress plugin scaffold

New directory `wp-plugin/grow-auto-fix/`:

- `grow-auto-fix.php` — plugin header, settings page (paste install token), hooks `wp_head` to inject schema, registers cron to pull updates every 6h.
- `README.md` with install instructions.
- Plugin calls `/api/public/inject/{token}/manifest.json` to get the current approved bundle, applies via filters (`robots_txt` filter for robots, virtual `/llms.txt` rewrite, `wp_head` for JSON-LD).
- Not auto-published; downloadable zip from `/dashboard/interventions` page.

### 6. Auto-fire trigger (closed loop)

- Extend existing `capture-citations` cron path: after each capture, if a site's 24h CCS drops >5pts vs prior period, enqueue an `auto_*` MCP call via a new helper `src/lib/interventions/auto-fire.server.ts`.
- Auto-fired interventions land in `interventions` as `drafted` with `triggered_by = 'auto_ccs_drop'`. Customer still approves before going live (per the answered design decision).
- Email notification via existing template registry: "3 fixes are ready to approve."

## What does NOT ship in this pass

- DNS proxy / hosted-site mode (Path D) — deferred.
- Auto-publish without approval — deferred until trust pattern is validated.
- Schema injection for non-FAQ/Product types (HowTo, Article, BreadcrumbList) — v1 covers the two highest-impact types; others added once usage data justifies.
- Plugins for Shopify/Webflow — WP only in v1.

## Technical notes

- AI calls use Lovable AI Gateway (`LOVABLE_API_KEY` already provisioned). Default model `google/gemini-3-flash-preview` per current guidance.
- Crawling uses existing Firecrawl integration (already wired in `src/lib/intelligence/company.functions.ts` patterns).
- All server-side logic in `createServerFn` per modern stack rules. Snippet delivery in `src/routes/api/public/` per public-API conventions.
- MCP tools follow existing pattern in `src/lib/mcp/tools/` and register in `src/routes/api/public/mcp.ts`.
- One additional pricing surface: `dashboard.interventions` is the upsell page — free tier shows drafted fixes, paid tier ($99/mo) unlocks Approve + snippet delivery.

## Out-of-scope cleanup

Pre-existing hydration warning on `/` (geo-standard version string) is unrelated to this work; will resolve on next published build.

## Order I'll build

1. Migration (tables + RLS + grants)
2. Three MCP tools + register
3. Snippet delivery route + llms.txt route
4. Approval server fns + dashboard route
5. Auto-fire hook in cron
6. WP plugin scaffold + zip download

Approve and I'll start with the migration.