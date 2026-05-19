# Make Grow fully functional

Three additions, all small. Defaults: internal notifications go to `hello@grow.contact` (one-line constant — easy to change later).

## 1. Smooth scroll + active nav highlight

In `src/routes/index.tsx`:
- Add `scroll-behavior: smooth` via `html { scroll-behavior: smooth }` in `src/styles.css`, plus `scroll-mt-20` on each `<section id=…>` so anchors clear the sticky header.
- Add a tiny `useActiveSection` hook (IntersectionObserver) that tracks `services / process / archive / cta` and returns the current id.
- In the nav, apply `text-foreground` (instead of `text-muted-foreground`) to the link whose id matches.

No new routes — keeps the single-page layout the design uses.

## 2. Lead confirmation email (to the submitter)

Uses Lovable Emails on the already-configured `notify.grow.contact` sender.

- Run transactional-email scaffolding (creates `send-transactional-email` server route, unsubscribe route, suppression handler, registry).
- Add template `src/lib/email-templates/lead-confirmation.tsx` — branded "Brief received" message matching the Operator Technical look (mono accents, black/white, accent color). Body bg `#ffffff`.
- Register it in `src/lib/email-templates/registry.ts`.

## 3. Internal new-lead notification email

- Add template `src/lib/email-templates/lead-notification.tsx` — shows name, email, budget tier, message in a clean operator-style layout.
- Register it.
- Constant `NOTIFY_INBOX = "hello@grow.contact"` at the top of the leads route (one-line edit to change).

## 4. Wire the leads endpoint

Edit `src/routes/api/public/leads.ts`. After a successful insert:

1. Enqueue `lead-confirmation` to the submitter (idempotency: `lead-confirm-<row.id>`), with `templateData: { name, budgetTier, message }`.
2. Enqueue `lead-notification` to `NOTIFY_INBOX` (idempotency: `lead-notify-<row.id>`), with `templateData: { name, email, budgetTier, message }`.

Since this is a public, unauthenticated route, call the send route server-to-server with the service-role key (already in env) — not from the browser. Email failures are logged but don't fail the 200 response (the lead is already saved).

## Technical notes

- Send pipeline goes through the existing pgmq queue (`enqueue_email` RPC), so retries/rate-limits are handled.
- DNS for `notify.grow.contact` must be verified for emails to actually leave the queue — if it's still pending, lead-saving and UI still work; emails flush once DNS goes active.
- No DB migrations needed — `leads` table and email infra already exist.
- No new secrets needed.

## Files touched

- `src/styles.css` — add `html { scroll-behavior: smooth }`
- `src/routes/index.tsx` — `scroll-mt-20` on sections, active-link highlight via new hook
- `src/hooks/use-active-section.ts` — new
- `src/lib/email-templates/lead-confirmation.tsx` — new
- `src/lib/email-templates/lead-notification.tsx` — new
- `src/lib/email-templates/registry.ts` — created/updated by scaffolding + 2 entries
- `src/routes/api/public/leads.ts` — enqueue both emails after insert
- Scaffolded server routes under `src/routes/lovable/email/transactional/*` and `src/routes/email/unsubscribe.*` (created by tool)
