# @grow-contact/cli

Score any URL against the **Grow GEO Standard** — 6 signals, 0–100 — right from your terminal. The "Lighthouse for AI agents."

```bash
npx @grow-contact/cli check https://example.com
```

```
  Grow GEO Standard  ·  https://example.com
   87/100  B  Solid agent readability with a few opportunities to improve.

  ● semantic html         95 · 6/6 landmarks, single H1, alt text on all images
  ● json ld               90 · Organization + WebSite present
  ● llms txt              80 · /llms.txt found, missing 2 routes
  ● citability            85 · First 60 words answer the page's implicit question
  ● speed                 92 · TTFB 180ms, HTML 240KB
  ● protocol discovery    78 · No Link header advertising llms.txt
      ↳ Add: Link: </llms.txt>; rel="llms"
```

## Connect your agent (MCP)

```bash
npx @grow-contact/cli mcp
```

Writes the `grow-contact` MCP server into Claude Desktop, Cursor, Windsurf and VS Code
configs, then your client opens a browser once for OAuth approval.
Flags: `--client <claude|cursor|windsurf|vscode|all>`, `--url <url>`, `--dry-run`.

## Install

```bash
npm i -g @grow-contact/cli
# or
npx @grow-contact/cli ...
```

## Setup

Get a free API key at https://grow.contact/api-docs, then:

```bash
export GROW_API_KEY=...
```

## Commands

```bash
grow check <url> [--json] [--fail-under <score>]
grow badge <url> [--out <path>]
grow --help
```

## CI

Fail the build when a deploy regresses below 90:

```yaml
# .github/workflows/agent-readiness.yml
- run: npx @grow-contact/cli check https://example.com --fail-under 90
  env:
    GROW_API_KEY: ${{ secrets.GROW_API_KEY }}
```

## Why

- **Built on the public Grow GEO Standard** (`geo-standard@2026.06`) — same 6 signals as the public scanner at https://grow.contact/check.
- **No telemetry, no lock-in.** MIT, zero deps, ~250 LOC.
- **CI-native.** Use `--fail-under` to gate deploys on agent readiness.

Need a 48-hour fix when the score is low? https://grow.contact/pricing.

## License

MIT
