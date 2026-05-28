# Score History & Diff

Turn the `scans` table into a visible, client-facing **trajectory** — not just a "latest score." This is the foundation for retainer reporting, the proof-of-work artifact agencies show clients, and the data source future features (sequences, content recs, alerts) will read from.

## What we're building

1. **Per-host history page** at `/history/$host` — sparkline + scan table for any domain that's been scanned.
2. **Diff view** at `/history/$host/diff?a=<id>&b=<id>` — side-by-side metric comparison between two scans, with deltas highlighted.
3. **"View history" entry points** — from `/check/report`, the recent-scans feed, and the dashboard.
4. **Lightweight server fns** that aggregate the existing `scans` rows (no schema changes needed for v1).

## User-visible behavior

- After any scan, the report page gets a **"View full history for {host}"** link.
- History page shows: current score, 30/90-day trend sparkline, list of all scans with date + overall + sub-scores, and a "Compare" checkbox on each row.
- Pick any two scans → diff page shows each of the 6 metrics (overall, semantic, jsonld, llms, citability, speed) side-by-side with a green/red delta badge and a one-line plain-English summary ("LLMs.txt fixed: +18", "Speed regressed: -7").
- Public, no auth required (hosts that have been scanned are already public info via the leaderboard).

## Technical plan

### New files
- `src/lib/check/history.functions.ts` — two server fns:
  - `getHostHistory({ host, days })` — returns ordered scan rows + computed sparkline buckets.
  - `getScanDiff({ aId, bId })` — fetches two scans, returns per-metric delta + auto-generated summary lines.
- `src/routes/history.$host.tsx` — history page (loader uses `ensureQueryData` + `useSuspenseQuery`).
- `src/routes/history.$host.diff.tsx` — diff page, reads `?a=` & `?b=` from search params.
- `src/components/ScoreSparkline.tsx` — small inline SVG sparkline (no chart lib needed).
- `src/components/ScanHistoryTable.tsx` — table with row checkboxes + "Compare selected" button.

### Edits
- `src/routes/check.report.tsx` — add "View full history" link after a successful scan.
- `src/components/RecentScans.tsx` — make each host a link to `/history/{host}`.

### Reuse, don't duplicate
- `fetchLatestScanForHost` already exists in `scans.server.ts`.
- The MCP tools `track_competitor_over_time` and `diff_scan` already compute exactly this data — the server fns will share that logic (extract to `scans.server.ts` helpers so both MCP and the UI call the same code).

### No DB changes for v1
The `scans` table already stores everything needed (host, all 6 metrics, scanned_at). A future iteration could add a `notes` column to annotate "what changed between scan A and B" but that's not in scope.

### Summary-line generation
Deterministic, not LLM-based for v1 — a simple rules table:
- delta ≥ +10 on a metric → "{Metric} improved significantly: +{n}"
- delta ≤ -10 → "{Metric} regressed: {n}"
- |delta| < 3 → omit
Keeps it instant and free; we can swap to Lovable AI for nuance later.

## Out of scope (next iterations)
- Annotations / change-log entries
- Email/Slack alerts on score drops (the Composio triggers already fire — just need a UI to manage thresholds)
- Multi-host comparison (competitor overlay on the same chart)
- PDF export of the diff for client reports

## Estimated effort
~4 files new, 2 edits. No migration. Should be one focused session.
