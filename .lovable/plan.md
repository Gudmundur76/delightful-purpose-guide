# Citation Intelligence Platform — Phased Rebuild

The brief lists Next.js/Clerk/Stripe/Upstash. This project runs on **TanStack Start + Lovable Cloud (Supabase) + PayPal**, already deployed at grow.contact with `/leaderboard`, `/verify/$id`, `/check`, `/compare`, `/playbooks`, `/api-docs`, and a working scanner + monitoring + billing stack. The rebuild adapts the spec to that stack — no framework swap.

Shipping happens in 5 phases across multiple turns. Each phase is independently shippable (build passes, no regressions).

---

## Phase 1 — Data model + ingest (this turn)

New tables in Lovable Cloud (Supabase):

- `companies` — domain (pk), name, category, logo_url, github_url, g2_url, stackoverflow_tag, claimed_by_user_id
- `company_scores` — domain, scan_date, overall_ccs, canonical, precedent, authority, verifiability, commentary, information_gain, citation_probability
- `citations` — domain, ai_engine (perplexity/chatgpt/claude/google_aio), query_category, query_text, cited_url, position, cited_at, confidence
- `citation_history` — domain, month, total_citations, perplexity_share, chatgpt_share, claude_share, google_aio_share, volatility (stable/rising/falling)
- `authority_signals` — domain, scan_date, g2_reviews, github_stars, stackoverflow_questions, news_mentions, reddit_mentions, backlinks
- `content_analysis` — domain, scan_date, factual_density, freshness_days, expert_signals, qa_blocks, comparison_tables, video_count
- `certifications` — domain, user_id, status, issued_at, expires_at, badge_url

All with explicit GRANTs, RLS scoped (public SELECT on companies/scores/citations/history; authenticated for claims; service_role for writes). Seed ~60 companies derived from the existing `LEADERBOARD` static data so the new tables aren't empty.

## Phase 2 — Leaderboard upgrade

Rebuild `/leaderboard` as a filterable, sortable table reading from the new tables:

- Category filter tabs (Infra/Models/Agents/DevTools/Data/Security/Robotics/Biotech)
- Sortable columns: Company, Category, CCS, Citation Probability, 30d Citations, Perplexity %, ChatGPT %, Claude %, Google AIO %, Last Scan
- 30-day sparkline per row (reuse `ScoreSparkline`)
- Volatility badge (Stable/Rising/Falling)
- Live search, compare-checkbox (2–4 rows), CSV/JSON export (free=top100, Pro=full via existing quota)
- Stats bar + "Featured analysis" card
- FAQ JSON-LD block at the bottom

## Phase 3 — Verify page rebuild

`/verify/$id` becomes a Wikipedia-style profile:

- Hero infobox (logo, domain, category, CCS big, citation probability %, 30d citations, volatility)
- 90-day multi-line history chart
- 6 signal cards (canonical / precedent / authority / verifiability / commentary / information gain)
- Citation analysis: top queries, platform breakdown bar, "competitors cited more often" table
- Content quality block (factual density, freshness, third-party validation counts)
- Q&A block (5 questions, FAQ schema)
- Comparison table vs top 2 competitors
- "Claim this profile" + "Compare" + "Improve" CTAs
- Article + FAQPage + BreadcrumbList JSON-LD

## Phase 4 — New pages

- `/citation-index` — monthly report, ranked list with movers, per-month archive, RSS
- `/compare` upgrade — radar chart + full metrics table + deep-link
- `/playbooks` — 7 new entries from the brief, AED structure + FAQ schema
- `/api-docs` upgrade — interactive Stripe-style explorer with cURL/Python/JS samples
- `/certification` upgrade — 3-step flow (verify domain → audit CCS>75 → PayPal) using existing PayPal stack
- `/research` hub — index of report + data drops + playbooks + glossary

## Phase 5 — Crawler/citation ingest

- `src/lib/citations/ingest.server.ts` — server-only helpers to upsert citations + recompute citation_probability + roll up `citation_history` monthly
- `/api/public/hooks/citation-import` — signed webhook for batch citation imports
- Cron entry to recompute volatility nightly

## Technical notes

- Stack stays TanStack Start + Lovable Cloud + PayPal (NOT Next/Clerk/Stripe). Auth = existing Supabase auth + Google. Charts = Recharts (already installed). Caching = Lovable Cloud's existing edge cache; no Upstash.
- Every new public-schema table gets GRANT + RLS in the same migration.
- Reads from public verify/leaderboard pages use `createServerFn` + `supabaseAdmin` with explicit safe-column projection (not broad anon SELECT) — public route loaders cannot use `requireSupabaseAuth`.
- All new routes get per-route `head()` with title/description/og:* and JSON-LD where applicable; canonical only on leaves.
- og:image only on leaves with a meaningful image.

## Confirmation needed before Phase 1

Phase 1 creates 7 new tables in your production Lovable Cloud DB and seeds them from `src/lib/leaderboard/entries.ts`. Approving this plan starts the Phase 1 migration immediately; subsequent phases happen on follow-up turns so you can review between each.
