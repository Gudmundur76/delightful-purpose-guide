#!/usr/bin/env node
// Generate a Markdown + JSON report of which routes declare og:image and
// twitter:image (directly or via ogImageMeta), which are exempt, and which
// are missing. Output goes to og-meta-report.md / og-meta-report.json so a
// CI job can publish it as an artifact / step summary.

import fs from "node:fs";
import path from "node:path";

const ROUTES_DIR = "src/routes";
const OUT_MD = process.env.OG_REPORT_MD || "og-meta-report.md";
const OUT_JSON = process.env.OG_REPORT_JSON || "og-meta-report.json";

// Keep in sync with scripts/validate-og-meta.mjs
const EXEMPT_PATTERNS = [
  /^__root\.tsx$/,
  /^admin\./,
  /^dashboard(\.|$)/,
  /^app(\.|$)/,
  /^content(\.|$)/,
  /^history\./,
  /^outreach(\.|$)/,
  /^checkout(\.|$)/,
  /^login\.tsx$/,
  /^unsubscribe\.tsx$/,
  /^integrations\.tsx$/,
  /^products\.tsx$/,
  /^status\.tsx$/,
  /^sop\.tsx$/,
  /^cookies\.tsx$/,
  /^privacy\.tsx$/,
  /^terms\.tsx$/,
  /^refund\.tsx$/,
  /^about\.author\./,
  /^llms\.tsx$/,
  /^report\./,
  /^verify\./,
  /^badge\.{/,
  /^check\.report\.tsx$/,
  /^leaderboard\.methodology\.tsx$/,
  /^api(\/|\.)/,
  /^lovable\//,
  /^email\//,
  /^blog\//,
  /^\[/,
  /\[\.\]/,
  /\{\$/,
  /\.ts$/,
];

const CHECKS = {
  ogImage: [/property:\s*["']og:image["']/, /ogImageMeta\(/],
  twitterImage: [/(name|property):\s*["']twitter:image["']/, /ogImageMeta\(/],
};

function isExempt(rel) {
  return EXEMPT_PATTERNS.some((re) => re.test(rel));
}

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

const files = walk(ROUTES_DIR)
  .filter((p) => /\.(tsx|ts)$/.test(p))
  .map((p) => path.relative(ROUTES_DIR, p).split(path.sep).join("/"))
  .sort();

const rows = [];
for (const rel of files) {
  const full = path.join(ROUTES_DIR, rel);
  const src = fs.readFileSync(full, "utf8");
  const isRoute = /createFileRoute\(/.test(src);
  const exempt = isExempt(rel);
  if (!isRoute && !exempt) continue;

  const ogImage = CHECKS.ogImage.some((re) => re.test(src));
  const twitterImage = CHECKS.twitterImage.some((re) => re.test(src));
  const usesHelper = /ogImageMeta\(/.test(src);

  let status;
  if (exempt) status = "exempt";
  else if (ogImage && twitterImage) status = "ok";
  else status = "missing";

  rows.push({ route: rel, status, ogImage, twitterImage, usesHelper });
}

const ok = rows.filter((r) => r.status === "ok");
const missing = rows.filter((r) => r.status === "missing");
const exempt = rows.filter((r) => r.status === "exempt");

const json = {
  generatedAt: new Date().toISOString(),
  totals: { total: rows.length, ok: ok.length, missing: missing.length, exempt: exempt.length },
  routes: rows,
};
fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2));

const icon = (b) => (b ? "✅" : "❌");
const lines = [];
lines.push("# OG / Twitter image meta coverage");
lines.push("");
lines.push(`_Generated ${json.generatedAt}_`);
lines.push("");
lines.push(`- **OK:** ${ok.length}`);
lines.push(`- **Missing:** ${missing.length}`);
lines.push(`- **Exempt:** ${exempt.length}`);
lines.push(`- **Total scanned:** ${rows.length}`);
lines.push("");

if (missing.length) {
  lines.push("## ❌ Missing");
  lines.push("");
  lines.push("| Route | og:image | twitter:image |");
  lines.push("| --- | :---: | :---: |");
  for (const r of missing) {
    lines.push(`| \`src/routes/${r.route}\` | ${icon(r.ogImage)} | ${icon(r.twitterImage)} |`);
  }
  lines.push("");
}

lines.push("## ✅ Covered");
lines.push("");
lines.push("| Route | og:image | twitter:image | via helper |");
lines.push("| --- | :---: | :---: | :---: |");
for (const r of ok) {
  lines.push(
    `| \`src/routes/${r.route}\` | ${icon(r.ogImage)} | ${icon(r.twitterImage)} | ${icon(r.usesHelper)} |`,
  );
}
lines.push("");

if (exempt.length) {
  lines.push("<details><summary>Exempt routes (" + exempt.length + ")</summary>");
  lines.push("");
  for (const r of exempt) lines.push(`- \`src/routes/${r.route}\``);
  lines.push("");
  lines.push("</details>");
}

fs.writeFileSync(OUT_MD, lines.join("\n"));

console.log(
  `og-meta report: ${ok.length} ok, ${missing.length} missing, ${exempt.length} exempt → ${OUT_MD}, ${OUT_JSON}`,
);

// If invoked with --fail-on-missing, exit non-zero when any route is missing.
if (process.argv.includes("--fail-on-missing") && missing.length) {
  process.exit(1);
}
