#!/usr/bin/env node
// @grow-contact/cli — thin client over https://grow.contact/api/public/v1/*
// No deps. Works on Node >=18 (uses global fetch).

const API_BASE = process.env.GROW_API_BASE || "https://grow.contact";
const API_KEY = process.env.GROW_API_KEY || "";

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};
const noColor = !process.stdout.isTTY || process.env.NO_COLOR;
const paint = (col, s) => (noColor ? s : `${col}${s}${c.reset}`);

function gradeColor(score) {
  if (score >= 90) return c.green;
  if (score >= 75) return c.cyan;
  if (score >= 60) return c.yellow;
  return c.red;
}

function help() {
  console.log(`${paint(c.bold, "grow")} — agent-readiness scanner (https://grow.contact)

${paint(c.bold, "USAGE")}
  grow check <url> [--json] [--fail-under <score>]
  grow badge <url> [--out <path>]
  grow --help
  grow --version

${paint(c.bold, "COMMANDS")}
  check    Score a URL against the Grow GEO Standard (6 signals, 0–100).
  badge    Download the SVG badge for a URL you've scanned.

${paint(c.bold, "OPTIONS")}
  --json             Emit raw JSON (machine-readable).
  --fail-under <n>   Exit with code 1 if the score is below <n>. CI-friendly.
  --out <path>       Output file for the badge (default: ./grow-badge.svg).

${paint(c.bold, "ENV")}
  GROW_API_KEY       Required for 'check'. Get one at ${API_BASE}/api-docs.
  GROW_API_BASE      Override API base URL (default: ${API_BASE}).
  NO_COLOR           Disable ANSI colors.

${paint(c.bold, "EXAMPLES")}
  grow check https://example.com
  grow check https://example.com --fail-under 90
  grow badge https://example.com --out badge.svg
`);
}

function version() {
  console.log("0.1.0");
}

async function cmdCheck(args) {
  const url = args.positional[0];
  if (!url) {
    console.error(paint(c.red, "error: missing <url>"));
    console.error("usage: grow check <url> [--json] [--fail-under <score>]");
    process.exit(2);
  }
  if (!API_KEY) {
    console.error(paint(c.red, "error: GROW_API_KEY is required"));
    console.error(`get a free key at ${API_BASE}/api-docs and run:`);
    console.error("  export GROW_API_KEY=…");
    process.exit(2);
  }

  let res;
  try {
    res = await fetch(`${API_BASE}/api/public/v1/analyze`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": API_KEY,
        "user-agent": "grow-cli/0.1.0",
      },
      body: JSON.stringify({ url }),
    });
  } catch (err) {
    console.error(paint(c.red, `network error: ${err?.message || err}`));
    process.exit(3);
  }

  const body = await res.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    console.error(paint(c.red, `non-JSON response (${res.status}): ${body.slice(0, 200)}`));
    process.exit(3);
  }

  if (!res.ok) {
    console.error(paint(c.red, `error ${res.status}: ${data.error || "request failed"}`));
    process.exit(3);
  }

  if (args.flags.json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    renderReport(data);
  }

  const failUnder = Number(args.flags["fail-under"]);
  if (!Number.isNaN(failUnder) && data.score < failUnder) {
    console.error(
      paint(c.red, `\nscore ${data.score} is below threshold ${failUnder} — failing.`),
    );
    process.exit(1);
  }
}

function renderReport(d) {
  const col = gradeColor(d.score);
  console.log("");
  console.log(`  ${paint(c.bold, "Grow GEO Standard")}  ${paint(c.gray, "·")}  ${d.url}`);
  console.log(
    `  ${paint(col + c.bold, String(d.score).padStart(3))}/100  ${paint(col, d.grade)}  ${paint(c.gray, d.summary)}`,
  );
  console.log("");

  for (const [key, sig] of Object.entries(d.signals || {})) {
    const sCol = gradeColor(sig.score);
    const dot = sig.status === "pass" ? paint(c.green, "●") : sig.status === "warn" ? paint(c.yellow, "●") : paint(c.red, "●");
    const name = key.replace(/_/g, " ").padEnd(22);
    console.log(`  ${dot} ${paint(c.bold, name)} ${paint(sCol, String(sig.score).padStart(3))} ${paint(c.gray, "·")} ${sig.summary}`);
    const fixes = (sig.findings || []).slice(0, 2);
    for (const f of fixes) console.log(`      ${paint(c.gray, "↳ " + f)}`);
  }
  console.log("");
  console.log(paint(c.gray, `  Full report: ${API_BASE}/check/report?url=${encodeURIComponent(d.url)}`));
  console.log(paint(c.gray, `  Connect your agent: npx @grow-contact/cli mcp`));
  console.log("");
}

async function cmdBadge(args) {
  const url = args.positional[0];
  if (!url) {
    console.error(paint(c.red, "error: missing <url>"));
    process.exit(2);
  }
  let host;
  try {
    host = new URL(url.includes("://") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    console.error(paint(c.red, `error: invalid url '${url}'`));
    process.exit(2);
  }
  const out = args.flags.out || "./grow-badge.svg";
  const badgeUrl = `${API_BASE}/badge/${host}.svg`;
  const res = await fetch(badgeUrl, { headers: { "user-agent": "grow-cli/0.1.0" } });
  if (!res.ok) {
    console.error(paint(c.red, `error ${res.status}: could not fetch badge`));
    process.exit(3);
  }
  const svg = await res.text();
  const { writeFile } = await import("node:fs/promises");
  await writeFile(out, svg, "utf8");
  console.log(paint(c.green, `✓ saved ${out}`));
  console.log(paint(c.gray, `  source: ${badgeUrl}`));
}

const SERVER_KEY = "grow-contact";

function clientTargets() {
  const os = process.platform;
  const home = process.env.HOME || process.env.USERPROFILE || ".";
  const join = (...p) => p.join("/");
  const claude =
    os === "darwin"
      ? join(home, "Library/Application Support/Claude/claude_desktop_config.json")
      : os === "win32"
        ? join(process.env.APPDATA || join(home, "AppData/Roaming"), "Claude/claude_desktop_config.json")
        : join(home, ".config/Claude/claude_desktop_config.json");
  return [
    { id: "claude", label: "Claude Desktop", path: claude },
    { id: "cursor", label: "Cursor", path: join(home, ".cursor/mcp.json") },
    { id: "windsurf", label: "Windsurf", path: join(home, ".codeium/windsurf/mcp_config.json") },
    { id: "vscode", label: "VS Code (MCP)", path: join(home, ".vscode/mcp.json") },
  ];
}

async function cmdMcp(args) {
  const { readFile, writeFile, mkdir } = await import("node:fs/promises");
  const { dirname } = await import("node:path");

  const serverUrl = args.flags.url || `${API_BASE}/mcp`;
  const only = typeof args.flags.client === "string" ? args.flags.client : "all";
  const dryRun = Boolean(args.flags["dry-run"]);
  const entry = { command: "npx", args: ["-y", "mcp-remote", serverUrl] };

  const targets = clientTargets().filter((t) => only === "all" || only === t.id);
  if (!targets.length) {
    console.error(paint(c.red, `error: unknown --client '${only}' (claude|cursor|windsurf|vscode|all)`));
    process.exit(2);
  }

  console.log("");
  console.log(paint(c.bold, `  grow.contact MCP  ·  ${serverUrl}`));
  console.log("");

  let wrote = 0;
  for (const t of targets) {
    let config = {};
    let existed = false;
    try {
      config = JSON.parse(await readFile(t.path, "utf8"));
      existed = true;
    } catch {
      config = {};
    }
    // Cursor/Claude/Windsurf use `mcpServers`; VS Code uses `servers`.
    const key = t.id === "vscode" ? "servers" : "mcpServers";
    if (!existed && only === "all" && t.id !== "claude" && t.id !== "cursor") {
      console.log(paint(c.gray, `  ○ ${t.label.padEnd(16)} skipped (not installed)`));
      continue;
    }
    config[key] = { ...(config[key] || {}), [SERVER_KEY]: entry };

    if (dryRun) {
      console.log(paint(c.yellow, `  ▸ ${t.label.padEnd(16)} would write ${t.path}`));
      continue;
    }
    try {
      await mkdir(dirname(t.path), { recursive: true });
      await writeFile(t.path, `${JSON.stringify(config, null, 2)}\n`, "utf8");
      wrote++;
      console.log(paint(c.green, `  ✓ ${t.label.padEnd(16)} ${existed ? "updated" : "created"} ${t.path}`));
    } catch (err) {
      console.log(paint(c.red, `  ✗ ${t.label.padEnd(16)} ${err.message}`));
    }
  }

  console.log("");
  if (dryRun) {
    console.log(paint(c.gray, "  dry run — nothing written."));
  } else if (wrote) {
    console.log("  Next: restart your client. It will open a browser once to approve access.");
    console.log(paint(c.gray, "  Then ask your agent: “scan grow.contact with the grow tools”."));
  } else {
    console.log(paint(c.yellow, "  Nothing written. Add this to your client config manually:"));
    console.log("");
    console.log(
      paint(c.gray, JSON.stringify({ mcpServers: { [SERVER_KEY]: entry } }, null, 2)),
    );
  }
  console.log("");
  console.log(paint(c.gray, `  Tool catalog & auth docs: ${API_BASE}/mcp-server`));
  console.log("");
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      positional.push(a);
    }
  }
  return { positional, flags };
}

const [, , cmd, ...rest] = process.argv;
const args = parseArgs(rest);

if (!cmd || cmd === "--help" || cmd === "-h" || cmd === "help") {
  help();
  process.exit(0);
}
if (cmd === "--version" || cmd === "-v") {
  version();
  process.exit(0);
}
if (cmd === "check") {
  cmdCheck(args);
} else if (cmd === "badge") {
  cmdBadge(args);
} else {
  console.error(paint(c.red, `unknown command: ${cmd}`));
  help();
  process.exit(2);
}
