# The Agent-Readability Index

Turn the existing `/leaderboard` (30 hand-picked AI sites) into **the** reference dataset for "which AI companies are actually agent-readable" — the kind of asset Perplexity, ChatGPT, and bloggers cite by name.

## Why this gets cited (the virality angle)

Three ingredients AI engines reward, all stackable in one asset:

1. **Original ranked data** — competitors don't publish per-signal agent-readability scores for the whole AI industry. We do.
2. **Listicle + comparison format** — Perplexity's #1 preferred shape; ChatGPT extracts "top N" lists directly.
3. **Quotable headline stats** — e.g. *"Only 18% of YC W26 AI startups allow OAI-SearchBot"* — bloggers reuse them, those blogs get cited, citation graph compounds.

Bonus: every entry is a backlink magnet. Founders share "we scored 94/100 on the Agent-Readability Index" → inbound links → Claude/Gemini weight us higher.

## Scope (v1)

### 1. Expand the dataset to 200 entries
Categorize across 8 buckets the AI industry actually searches for:
- LLM providers (OpenAI, Anthropic, Google, Mistral, Cohere…)
- Agent platforms (LangChain, CrewAI, AutoGPT, Composio…)
- AI IDEs / coding (Cursor, Windsurf, Lovable, Bolt, v0…)
- Vector DBs / RAG (Pinecone, Weaviate, Chroma, Qdrant…)
- Eval & observability (Braintrust, Langfuse, Helicone…)
- MCP servers / tooling
- Voice / multimodal
- Inference / infra (Modal, Replicate, Together…)

Seed the list from YC W25/S25/W26 AI batches + Product Hunt AI top 100. Run them through the existing scanner in a batch job.

### 2. New `/index` route (rename + redirect)
- `/leaderboard` → 301 → `/index` (keep link equity)
- Filterable by: category, score range, signal failures (e.g. "show me everyone missing llms.txt")
- Sortable: overall score, semantic, JSON-LD, llms.txt, citability, speed
- Per-entry detail panel: 5 signal breakdowns + 2–3 specific findings ("missing FAQPage schema", "blocks OAI-SearchBot")

### 3. Quotable headline stats strip
Auto-computed across the index, refreshed nightly:
- % of AI companies that block OAI-SearchBot accidentally
- Average score by category (LLM providers vs. agent platforms etc.)
- Top 10 / bottom 10
- "Biggest gap": who has the worst score relative to their funding/popularity

### 4. Public JSON API
`GET /api/public/index.json` — full dataset, CC-BY licensed. This is the citation engine: every blog or analyst that uses our data links back.

```json
{
  "updated_at": "2026-05-28T...",
  "license": "CC-BY-4.0",
  "attribution": "grow.contact/index",
  "methodology_url": "https://grow.contact/index/methodology",
  "entries": [
    { "host": "openai.com", "category": "llm-provider",
      "score": 87, "signals": { "semantic": 95, "jsonld": 80, ... },
      "findings": ["missing llms.txt"], "last_scanned": "..." }
  ]
}
```

### 5. JSON-LD on the index page
`Dataset` schema + `ItemList` with each company as a `ListItem` containing `Organization`. This is what makes us machine-cite-able as a structured ranking, not just a webpage.

### 6. Per-company embeddable badge
"Scored 94/100 — Agent-Readability Index" SVG (we already have `/api/public/widget/badge.svg`). Add a one-click "share your score" flow on the per-entry panel. Backlinks farming, ethical version.

### 7. `/index/methodology` page
Reuses content from `docs/geo-standard.md`. Strong E-E-A-T signal: explains the 5 signals, the scoring formula, the rescan cadence. This is what gets cited when someone challenges a score.

## Out of scope (v2+)
- Historical score charts per company (the history feature we just built handles this)
- Email alerts when a company's score changes
- Paid "verified" tier for companies to claim their listing
- Comparison view (vs.com-style head-to-head — could fold into the existing `/vs` infra later)

## Technical sketch

**Data layer**
- Reuse existing `scans` table — no new tables for v1
- New `index_entries` table (or just a static seed file `src/lib/index/companies.ts`) mapping `host → { category, display_name, funding?, yc_batch? }`
- Nightly cron via existing `run-scheduled-scans` infra to keep all 200 hosts re-scanned weekly

**Routes**
- `src/routes/index.tsx` is taken (homepage). Use `src/routes/the-index.tsx` or `src/routes/ari.tsx` ("Agent-Readability Index"). Recommend **`/the-index`** — clean, brandable, no collision.
- `src/routes/the-index.methodology.tsx`
- `src/routes/api/public/the-index[.]json.ts`

**Server functions**
- `getIndexEntries({ category?, minScore?, sortBy? })` — server fn that joins seed list with latest scan per host
- `getIndexHeadlineStats()` — computes the quotable strip, cached 1h

**SEO/citation wiring**
- Per-entry deep link: `/the-index/openai.com` → individual company page with full breakdown + JSON-LD `Organization` + `Article` (the audit) → 200 new indexable pages, each citable independently
- Update `llms.txt`, `sitemap.xml`, `rss.xml` to include the index
- `Dataset` JSON-LD with `distribution` pointing to the public JSON endpoint

## Estimated effort
~2 focused sessions:
- Session 1: seed list, batch-scan infra, JSON endpoint, base `/the-index` route with filtering
- Session 2: per-company pages, methodology page, headline stats, badge share flow, JSON-LD

## Why this beats alternatives I considered
- **Generic glossary** — useful but doesn't generate backlinks, no virality
- **Quarterly research report** — high-leverage but slow; the Index is the *data source* every future report draws from
- **Generic AI tools directory** — table stakes, already owned by Futurepedia/G2

The Index is the foundation. Once it exists, the quarterly research report (#3 from earlier) writes itself from its data.

Want me to start with Session 1?
