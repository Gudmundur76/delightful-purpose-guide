# GrowContent build plan

A working content workflow at `/content` with three tabs (Briefs, Drafts, Calendar) and a Tiptap draft editor that scores SEO/GEO/AEO live as you type. Replaces the existing "coming soon" placeholder.

## 1. Database (one migration)

New tables in `public`:

- **`content_briefs`** — `id`, `site` (text), `title`, `topic`, `intent`, `audience`, `keywords` (text[]), `content_type`, `target_word_count` (int), `status` (text default `'open'`), `created_by`, `created_at`, `updated_at`.
- **`content_drafts`** — `id`, `brief_id` (fk content_briefs), `title`, `version` (int default 1), `body_html` (text), `seo_score`, `geo_score`, `aeo_score`, `overall_score`, `checks` (jsonb), `status` (text: `draft|in_review|approved|scheduled|published|rejected`), `scheduled_for` (timestamptz), `published_at`, `created_by`, `created_at`, `updated_at`.
- **`agent_runs`** — `id`, `agent_type` (text), `input` (jsonb), `output` (jsonb), `status` (text default `'queued'`), `error`, `created_at`, `completed_at`. (Generic — reused by future agents.)

GRANTs to `authenticated` + `service_role`. RLS: authenticated team members can CRUD all rows (matches existing `clients`/`scans` pattern). `update_updated_at_column` triggers on briefs + drafts.

## 2. Scoring engine — `src/lib/scoring/content-score.ts`

Pure, no I/O. Parses `html` with a lightweight DOMParser (use `linkedom` — already Worker-safe; install if absent, otherwise regex-based fallback).

```ts
export type ContentBrief = { keywords?: string[]; target_word_count?: number };
export type Check = { id: string; label: string; pass: boolean; category: 'seo'|'geo'|'aeo'; weight: number };
export type ContentScore = { seo: number; geo: number; aeo: number; overall: number; checks: Check[] };
export function scoreContent(html: string, brief?: ContentBrief): ContentScore;
```

- 6 SEO checks, 6 GEO checks, 6 AEO checks (exactly per spec).
- Each category score = `(passing weight / total weight) * 100`, rounded.
- `overall = round(seo*0.25 + geo*0.35 + aeo*0.40)`.
- Unit-testable; export helpers (`extractText`, `paragraphs`, `findFaqPairs`, `hasDirectAnswer`).

## 3. Server functions — `src/lib/content/content.functions.ts`

All `requireSupabaseAuth` protected:
- `listBriefsFn`, `createBriefFn(input)` — also inserts an `agent_runs` row (`agent_type='content'`, `input={brief_id}`).
- `listDraftsFn`, `getDraftFn(id)`, `updateDraftFn({id, body_html, scores, checks})`, `setDraftStatusFn({id, status})`.
- `listCalendarFn({month})` — drafts where `status in (published, scheduled, draft)`.

## 4. Routes

- `src/routes/content.tsx` — layout `<Outlet/>` + tab nav (`Briefs | Drafts | Calendar`). Replaces existing placeholder if any (we'll check `/content` route existence).
- `src/routes/content.index.tsx` — redirects to `/content/briefs`.
- `src/routes/content.briefs.tsx` — table of briefs + "New brief" dialog (form: site, title, topic, intent, audience, keywords (comma-split), content type select, word count). On submit → `createBriefFn` → toast → refetch.
- `src/routes/content.drafts.tsx` — grid of draft cards (title, v{version}, three score badges color-coded, status pill). Click → `/content/drafts/$id`.
- `src/routes/content.drafts.$id.tsx` — editor page (see §5).
- `src/routes/content.calendar.tsx` — month grid (current month default, prev/next nav). Cells show drafts colored by status (published=emerald, scheduled=blue, draft=zinc).

All under `_authenticated`? Existing dashboard isn't gated by a layout — check `src/routes/dashboard.tsx`. Match the same auth pattern (`beforeLoad` redirect-to-login).

## 5. Draft editor `/content/drafts/$id`

- Install `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`.
- Layout: `grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6`.
- **Left (60%)**: Tiptap editor bound to `body_html`. Toolbar: bold, italic, H2, H3, link, bullet/ordered list. Prose styling via Tailwind `prose` class.
- **Right (40%)**: live score panel
  - Overall ring + three sub-scores (SEO/GEO/AEO) with progress bars.
  - Three `<Collapsible>` sections (one per category) listing each check with ✅/❌ and label.
  - "Top 3 fixes" — first 3 failing checks across all categories.
  - Recomputes via `useMemo`/debounced state on editor update (1s debounce).
- **Action bar** (sticky bottom): `Approve` → status `approved`, `Request revision` → status `draft` + bump `version`, `Reject` → status `rejected`.
- **Autosave**: debounced 3s after edits → `updateDraftFn({id, body_html, ...scores, checks})`. Show "Saved · 12s ago" indicator.

## 6. Navigation

Add `Content` link to `SiteHeader` / dashboard nav if it points elsewhere. Keep existing `/content` content if it's marketing — otherwise replace.

## Technical notes

- HTML parsing: prefer `linkedom` (`bun add linkedom`) — works on Cloudflare Workers and in browser. Fallback regex if install fails.
- Tiptap is React-friendly and SSR-safe with `immediatelyRender: false`.
- Debouncing: small inline `useDebouncedValue` hook (no new dep).
- Calendar: pure JS month grid, no `date-fns` needed (project may already have it — check).
- No PayPal/email touches — pure CRUD + scoring.

## Out of scope (call out explicitly)

- No AI draft generation (the `agent_runs` row is enqueued but not processed — a future worker will read it).
- No publishing pipeline (status=`published` is manual flag, no external CMS push).
- No collaboration / presence.
- No version diff view (version just increments on "Request revision").

Ship order: migration → scoring engine + tests-in-head → server fns → routes → editor.
