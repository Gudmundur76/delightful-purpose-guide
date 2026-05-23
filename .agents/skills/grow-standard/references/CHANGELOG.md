# Grow GEO Standard — Changelog

Format: [`@YYYY.MM`] — date — summary. Bump on any change to §2 thresholds,
§4 crawler matrix, §6 JSON-LD requirements, or §9 perf budget. Patch
versions for clarifications and typos.

## [`@2026.05`] — 2026-05-22 — v1.0 (initial publication)

- Published §2 pass/fail thresholds (Agent Readability Score ≥ 90/100)
- Locked §4 crawler allow/block matrix (8 allow, 5 conditional block)
- Locked §6 JSON-LD requirements per page type
- Locked §9 perf budget (TTFB <200ms, FCP <1.5s mobile, JS <180KB gz)
- Established §12 delivery checklist as the handoff gate
- Established `/check` scanner score ≥ 90 as the merge gate (see
  `.github/workflows/geo-check.yml`)

## Versioning policy

- **Major** (`@YYYY.MM`): threshold or matrix changes that can fail an
  existing site. Old sites grandfather to their delivery-time version
  unless on a retainer.
- **Minor**: additive rules (new schema type, new bot UA in the allow
  list). Existing sites stay compliant.
- **Patch**: clarifications, typos, doc structure. No site impact.

Review quarterly. AI engines and crawlers change behavior fast.
