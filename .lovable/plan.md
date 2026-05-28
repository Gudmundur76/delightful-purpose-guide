## Composio integration plan

Before I start, two stack-level corrections to flag — both keep the spec's intent intact:

1. **Not a Supabase Edge Function.** This project is TanStack Start on Cloudflare Workers. The right home for `/agent-action` is a TanStack server route at `src/routes/api/public/agent-action.ts` (the `/api/public/*` prefix is the documented home for external callers — MCP, Skywork, n8n — and bypasses Lovable's published-site auth gate). Same URL semantics, same caller contract; just no separate Supabase Functions deployment.
2. **Composio SDK runtime.** `@composio/core` ≥ 0.6.0 added explicit Cloudflare Workers support (Jan 2026 release). I'll pin `^0.6.4` so it runs in the Worker SSR runtime. Older versions would crash with `[unenv]` stubs.

If you want it to be a Supabase Edge Function instead, say so and I'll route it through `supabase/functions/agent-action/` — but the published URL, auth model, and caller code are simpler with the server-route approach.

---

### 1. Secret + dependency

- `add_secret(["COMPOSIO_API_KEY"])` — user pastes value from composio.dev.
- `COMPOSIO_ENTITY_PREFIX` is a constant (`"grow_contact_"`) — hardcoded in `src/lib/composio/config.ts`, not a secret.
- `bun add @composio/core@^0.6.4`.

### 2. Database

One new table, RLS-scoped to the owning user:

```text
public.client_integrations
  id            uuid pk
  user_id       uuid references auth.users(id) on delete cascade
  toolkit       text   -- 'gmail' | 'hubspot' | 'pipedrive' | 'slack' | 'linkedin' | 'google_analytics'
  entity_id     text   -- "grow_contact_<user_id>"
  connection_id text   -- Composio connectedAccountId
  status        text   -- 'pending' | 'active' | 'error'
  created_at, updated_at
  unique (user_id, toolkit)
```

Grants: `authenticated` (CRUD own rows), `service_role` (all). RLS: user can see/manage only their own rows. No anon access.

### 3. Server functions (app-internal, `createServerFn`)

All under `src/lib/composio/`:

- `composio.server.ts` — singleton Composio client (reads `COMPOSIO_API_KEY` inside handler scope, never module scope).
- `integrations.functions.ts`:
  - `listIntegrations()` — returns the 6 toolkits + the current user's status from `client_integrations`.
  - `initiateConnection({ toolkit })` — calls Composio `connectedAccounts.initiate`, upserts row with `status:'pending'`, returns the OAuth `redirectUrl`.
  - `refreshConnectionStatus({ toolkit })` — polls Composio for `ACTIVE`, flips DB row.
  - `disconnectIntegration({ toolkit })` — Composio delete + DB row delete.
- All three are `.middleware([requireSupabaseAuth])` so they act as the logged-in user.

### 4. `/integrations` page (auth-gated)

- File: `src/routes/_authenticated/integrations.tsx` (sits under the existing `_authenticated` layout — same gate the rest of the app uses).
- Dark-themed settings card per toolkit: name, one-line purpose, status pill (`Connected` / `Not connected` / `Pending`), Connect / Reconnect / Disconnect button.
- Connect flow: server fn returns `redirectUrl` → `window.location.href = redirectUrl` → Composio handles OAuth → returns to `/integrations` → page polls `refreshConnectionStatus` on focus until `ACTIVE`.
- `head()` sets `noindex` (private settings page).

### 5. Agent Action endpoint (external callers)

`src/routes/api/public/agent-action.ts` — POST handler:

- Body: `{ tool: string, params: object, client_id: string }` validated with Zod (string min/max, params is a generic object).
- Auth: requires `Authorization: Bearer <ADMIN_API_KEY>` header (already in your secrets) — this is what MCP, Skywork, n8n use.
- Looks up the client's entity ID from `client_integrations` (using `supabaseAdmin`).
- Calls `composio.tools.execute(tool, { userId: entityId, arguments: params })`.
- Returns `{ success, result, error }` JSON.

### 6. Event triggers

Wire each event by calling a small helper from the existing emit site — no new background queue.

`src/lib/composio/triggers.server.ts` exports four functions, each takes the relevant payload + client `user_id`:

| Event source (existing) | Trigger | Composio action |
|---|---|---|
| `/check` scan completes with score < 70 | `onLowScoreScan(scan)` | Gmail: send personalized report to lead email |
| Scan score drops >10 vs last for same URL | `onScoreDrop(scan, prev)` | Slack: post alert to client's connected channel |
| `/contact` brief submitted | `onBriefSubmitted(lead)` | HubSpot: create deal, stage = "Brief Received" |
| Blog post `published` flips true | `onPostPublished(post)` | LinkedIn: create draft post for approval |

I'll trace where each event is currently emitted and add a single `await trigger(...)` call wrapped in try/catch so a Composio failure never breaks the originating request. All four are skipped silently when the client has no matching toolkit connected.

### 7. No changes to existing user-facing pages

Only addition to existing UI: a "Integrations" link inside the existing authenticated nav (if there is one — otherwise just live at `/integrations`).

---

### Technical notes (for the engineer)

- Composio client is constructed inside each server-fn `.handler()` (never at module top level — same rule as `process.env`).
- Entity ID format: `${COMPOSIO_ENTITY_PREFIX}${supabaseUserId}` — stable across reconnects.
- `redirectUrl` for OAuth callback: `https://grow.contact/integrations` (Composio handles the round-trip).
- `/api/public/agent-action` does its own bearer-token check (no `requireSupabaseAuth` — external callers don't have Supabase sessions).
- Triggers run on the request thread; if Composio is slow they'll add latency. If that becomes an issue we can move them to a queued worker later.

### What I need from you

- Approve the plan (especially the server-route vs Edge Function call).
- After approval I'll request `COMPOSIO_API_KEY` via the secret tool.
- Confirm Pipedream is intentional (spec said "HubSpot or Pipedream" — Composio's toolkit is `pipedrive`, not Pipedream the workflow tool). I'll assume **Pipedrive** unless you say otherwise.
