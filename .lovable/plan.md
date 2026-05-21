# Autonomous loops for grow.contact

Four independent systems. Each gets its own DB table(s), cron schedule, server route, and admin view. All AI calls go through Lovable AI Gateway (`google/gemini-2.5-flash` for cheap classify/draft, `gemini-2.5-pro` for longer-form blog). All emails go through your existing pgmq email queue.

---

## 1. Self-updating content (weekly AI blog drafts + leaderboard movers post)

**New table:** `blog_drafts` (id, slug, title, description, body_md, status: draft/approved/published, source: ai/manual, created_at, approved_at).
**New table:** `blog_topic_queue` (id, topic, angle, status: pending/used/skipped, created_at) — pre-seeded with 20 topics.

**New cron:** Every Monday 09:00 UTC → `POST /api/public/hooks/generate-weekly-post`
- Picks oldest pending topic from `blog_topic_queue`
- Calls Lovable AI (`gemini-2.5-pro`) with system prompt that mirrors your existing journal voice
- Saves as `status=draft` in `blog_drafts`
- Emails you a one-click approval link

**New cron:** Every Monday 10:00 UTC → `POST /api/public/hooks/leaderboard-movers-post`
- Diffs last week's leaderboard scores vs this week
- If any move ≥5 points, drafts a "Movers this week" post (template, not full AI)
- Saves as draft, emails you

**New admin page:** `/admin/drafts` — login-gated, list drafts, preview, "Approve & publish" button (writes to existing `blog_posts` source or appends to `src/lib/blog/posts.ts` via DB-backed read).

**Required code change:** `src/lib/blog/posts.ts` currently looks file-based. Need to extend `getAllPosts()` to merge file-based posts + `blog_drafts WHERE status='published'`. Posts page already works; only the data source changes.

---

## 2. Self-driving outreach

**New table:** `outreach_targets` (id, domain, score, last_emailed_at, status: pending/sent/replied/skipped, generated_email, sent_at).
**Existing helper:** `src/lib/outreach/generate.functions.ts` — reuse.

**New cron:** Every Tuesday 14:00 UTC → `POST /api/public/hooks/run-outreach-batch`
- Selects 10 lowest-scoring leaderboard sites not emailed in 60 days
- For each: calls existing `generateOutreach()` to build personalized email referencing their actual readiness gaps
- Enqueues into your `pgmq` email queue (using `enqueue_email`)
- Updates `outreach_targets.sent_at`

**New table:** `outreach_replies` (id, target_id, from_email, subject, body, received_at) — populated via inbound email webhook (Postmark/Resend inbound parse — needs separate setup OR skip inbound and just track sends).

**New admin page:** `/admin/outreach` — list of sent emails, status, manual "regenerate" / "skip" actions.

**Decision needed from you:** inbound reply tracking is heavy. For v1, just track *sends* and route replies to your normal inbox?

---

## 4. Self-serve checkout → delivery

**Existing:** PayPal credentials present (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, etc.).

**New table:** `projects` (id, lead_id, tier: starter/growth, status: paid/intake_sent/in_progress/delivered, paypal_order_id, amount, currency, intake_form_data jsonb, created_at).
**New table:** `intake_responses` (id, project_id, question_key, answer, submitted_at).

**New route:** `POST /api/public/hooks/paypal-webhook` (verify PayPal webhook signature)
- On `CHECKOUT.ORDER.APPROVED` or `PAYMENT.CAPTURE.COMPLETED`:
  - Create `projects` row
  - Generate one-time intake URL: `/intake/$projectId?token=...`
  - Enqueue email to customer with intake link
  - Enqueue notification email to you with order summary

**New route:** `/intake/$projectId` — public form (token-gated), 8–10 questions (brand, audience, tone, references, content, deadline, integrations, special asks). Saves to `intake_responses`, flips project status, notifies you.

**New admin page:** `/admin/projects` — kanban of paid/intake/in_progress/delivered.

**Decision needed:** does grow.contact already have a real PayPal checkout button wired to `/checkout`? I'll inspect — if not, this task partially expands to wiring the actual button.

---

## 5. Lead scoring + auto-reply

**Existing:** `leads` table, contact form at `/contact`, email infra.

**Schema change:** add columns to `leads` — `qualification_score int`, `qualification_tier text` (cold/warm/hot), `qualification_reasoning text`, `auto_replied_at timestamptz`.

**New trigger or post-insert call:** when a lead is created via `/contact`, fire `POST /api/public/hooks/score-lead` (called from the existing lead-create server fn, not from cron — instant).

Handler:
- Calls Lovable AI (`gemini-2.5-flash`, fast/cheap) with a strict JSON schema: `{ score: 0-100, tier: cold|warm|hot, reasoning: string, suggested_tier: starter|growth|enterprise }`
- Writes back to `leads` row
- Generates auto-reply email body via AI (warm tone, mentions their stated use case, links Calendly if hot, links pricing if warm, gentle nudge if cold)
- Enqueues auto-reply email to lead
- If `tier=hot`: also enqueues notification email to you with a "high-priority" subject prefix

**New admin page:** `/admin/leads` — leads list filtered by tier, with reasoning, original message, sent auto-reply preview.

**Decision needed:** Calendly URL to embed in hot-lead replies? (If you don't have one, I'll leave a placeholder you can swap.)

---

## Shared infrastructure I'll add

- **Admin auth gate:** simple `_admin.tsx` layout route that checks user role from `user_roles` table (already in your schema per security rules) — redirects non-admins to `/login`. All 4 admin pages live under it.
- **Approval-link emails:** signed JWT-style tokens for one-click "approve draft" / "skip outreach" / etc. from your inbox (no admin login required for those).
- **Cron registration:** all new crons added via one migration after routes exist, using your existing `apikey`-header pattern (consistent with `rescan-leaderboard`).

---

## Order of build (one task per turn, you confirm after each)

1. **Task 5 first** (lead scoring) — smallest, immediately useful, no scheduling, gives you a working AI loop to evaluate quality of Lovable AI output.
2. **Task 1** (blog drafts) — same pattern as #5 but scheduled; reuses the AI helper.
3. **Task 4** (checkout → intake) — most net-new code (webhook + intake form + projects table).
4. **Task 2** (outreach) — last because it's the most "spammy if broken" and depends on having stable leaderboard data.

---

## Three decisions I need from you before I start

1. **Outreach replies (task 2):** track inbound or just sends for v1? *(recommend: just sends for v1)*
2. **Calendly URL (task 5):** paste it, or leave placeholder?
3. **PayPal webhook (task 4):** is your `/checkout` flow already taking real PayPal orders today, or is it mock/stub? *(determines if task 4 = "wire delivery on top of working checkout" or "also wire checkout itself")*

Answer those 3 and I'll start with Task 5.
