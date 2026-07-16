#!/usr/bin/env node
// Verify Cache-Control headers + Cloudflare edge cache status on marketing routes.
//
// Usage:
//   node scripts/verify-cache.mjs                 # defaults to https://citation.is
//   node scripts/verify-cache.mjs https://staging.example.com
//
// Exits non-zero if any route fails its expectations.

const BASE = (process.argv[2] || "https://citation.is").replace(/\/+$/, "");

const ROUTES = [
  "/",
  "/services",
  "/pricing",
  "/work",
  "/playbook",
  "/contact",
  "/about",
  "/leaderboard",
  "/badge",
  "/check",
  "/blog",
];

const EXPECTED_CC = "public, max-age=0, s-maxage=300, stale-while-revalidate=86400";

function fmt(ok, label) {
  return `${ok ? "\x1b[32m✓\x1b[0m" : "\x1b[31m✗\x1b[0m"} ${label}`;
}

async function probe(path) {
  const url = `${BASE}${path}`;
  // First hit warms the edge; second hit should report HIT.
  await fetch(url, { headers: { "cache-control": "no-cache" } }).catch(() => {});
  const res = await fetch(url, { redirect: "manual" });
  const h = Object.fromEntries(res.headers);
  return {
    url,
    status: res.status,
    cc: h["cache-control"] || "",
    cfCache: h["cf-cache-status"] || "(none)",
    setCookie: h["set-cookie"] || "",
    age: h["age"] || "0",
    server: h["server"] || "",
  };
}

const results = [];
for (const path of ROUTES) {
  try {
    const r = await probe(path);
    const ccOk = r.cc === EXPECTED_CC;
    const noCookie = !r.setCookie;
    const edgeOk = /HIT|EXPIRED|REVALIDATED|STALE|UPDATING/i.test(r.cfCache) || r.cfCache === "MISS";
    const cfPresent = r.cfCache !== "(none)";
    const ok = ccOk && noCookie && cfPresent;
    results.push({ path, ok, ...r, ccOk, noCookie, edgeOk, cfPresent });
    console.log(fmt(ok, `${path}  [${r.status}]`));
    console.log(`    cache-control:  ${r.cc || "(missing)"}  ${ccOk ? "" : `\x1b[33m(expected: ${EXPECTED_CC})\x1b[0m`}`);
    console.log(`    cf-cache-status: ${r.cfCache}   age=${r.age}`);
    if (r.setCookie) console.log(`    \x1b[33mset-cookie present — will block edge cache\x1b[0m`);
  } catch (e) {
    results.push({ path, ok: false, error: String(e) });
    console.log(fmt(false, `${path}  ERROR ${e}`));
  }
}

const failed = results.filter((r) => !r.ok);
console.log("");
console.log(`${results.length - failed.length}/${results.length} routes pass`);
if (failed.length) {
  console.log("\nFailed routes:");
  for (const r of failed) console.log(`  - ${r.path}`);
  process.exit(1);
}
