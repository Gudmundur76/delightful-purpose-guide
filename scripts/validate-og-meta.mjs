#!/usr/bin/env node
// Validate that every user-facing leaf route declares og:image and
// twitter:image (directly, or via the shared ogImageMeta helper).
//
// Fails the build/CI if a route would silently inherit the root
// preview image. Run via `node scripts/validate-og-meta.mjs` or
// `bun scripts/validate-og-meta.mjs`.

import fs from "node:fs";
import path from "node:path";

const ROUTES_DIR = "src/routes";

// Routes that are NOT user-facing share targets and therefore do not
// need an og:image. Keep this list tight and explicit — anything not
// listed must declare og:image + twitter:image.
const EXEMPT_PATTERNS = [
  /^__root\.tsx$/,
  // Admin / authenticated dashboards
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
  // Legal / utility pages — low share value, optional og
  /^cookies\.tsx$/,
  /^privacy\.tsx$/,
  /^terms\.tsx$/,
  /^refund\.tsx$/,
  // Author profile pages, llms, badge image stubs, verify, report sub-pages
  /^about\.author\./,
  /^llms\.tsx$/,
  /^report\./,
  /^verify\./,
  /^badge\.\{/,
  /^check\.report\.tsx$/,
  // Sub-paths of leaderboard methodology etc.
  /^leaderboard\.methodology\.tsx$/,
  // Non-page routes (server handlers, api, well-known, raw assets)
  /^api(\/|\.)/,
  /^lovable\//,
  /^email\//,
  /^blog\//, // blog/rss
  /^\[/,     // [.]well-known etc.
  /\[\.\]/,  // any file with [.] extension marker -> raw response route
  /\{\$/,    // {$version}.md.ts style raw response route
  /\.ts$/,   // server-only route files
];

const REQUIRED = [
  { name: "og:image", patterns: [/property:\s*["']og:image["']/, /ogImageMeta\(/] },
  { name: "twitter:image", patterns: [/(name|property):\s*["']twitter:image["']/, /ogImageMeta\(/] },
];

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

const all = walk(ROUTES_DIR)
  .filter((p) => /\.(tsx|ts)$/.test(p))
  .map((p) => path.relative(ROUTES_DIR, p).split(path.sep).join("/"));

const checked = [];
const failures = [];

for (const rel of all) {
  if (isExempt(rel)) continue;
  const full = path.join(ROUTES_DIR, rel);
  const src = fs.readFileSync(full, "utf8");

  // Only validate files that actually register a route component / page.
  if (!/createFileRoute\(/.test(src)) continue;

  checked.push(rel);

  const missing = [];
  for (const req of REQUIRED) {
    if (!req.patterns.some((re) => re.test(src))) missing.push(req.name);
  }
  if (missing.length) failures.push({ rel, missing });
}

if (failures.length) {
  console.error(
    `\n✗ og-meta validation failed: ${failures.length} route(s) would inherit the root preview image.\n`,
  );
  for (const f of failures) {
    console.error(`  src/routes/${f.rel}`);
    console.error(`    missing: ${f.missing.join(", ")}`);
    console.error(
      `    fix: import { ogImageMeta } from "@/lib/seo/og" and spread it into head().meta`,
    );
  }
  console.error(
    `\nIf the route genuinely should not have a share image (admin, raw asset, etc.), add it to EXEMPT_PATTERNS in scripts/validate-og-meta.mjs.\n`,
  );
  process.exit(1);
}

console.log(`✓ og-meta validation passed (${checked.length} leaf routes checked).`);
