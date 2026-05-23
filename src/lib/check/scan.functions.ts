import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { persistScan } from "./scans.server";

const InputSchema = z.object({
  url: z.string().min(3).max(2048),
  source: z.string().max(40).optional(),
});

export type ScanStatus = "pass" | "warn" | "fail";

export type ScanMetric = {
  key: "semantic" | "jsonld" | "llms" | "citability" | "speed";
  label: string;
  score: number;
  status: ScanStatus;
  summary: string;
  details: string[];
};

export type ScanResult = {
  ok: true;
  url: string;
  finalUrl: string;
  fetchedAt: string;
  overall: number;
  log: string[];
  metrics: ScanMetric[];
} | {
  ok: false;
  url: string;
  error: string;
  log: string[];
};

function normalizeUrl(input: string): string {
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  return u;
}

function statusFor(v: number): ScanStatus {
  return v >= 80 ? "pass" : v >= 60 ? "warn" : "fail";
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function countMatches(html: string, re: RegExp): number {
  const m = html.match(re);
  return m ? m.length : 0;
}

function fmtKb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)}kb`;
}

async function fetchWithTimeout(url: string, ms: number): Promise<{ res: Response; ms: number; headerMs: number; totalMs: number; bytes: number; text: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "GrowAgentReadabilityBot/1.0 (+https://grow.contact/check)",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    const headerMs = Date.now() - start;
    const text = await res.text();
    const totalMs = Date.now() - start;
    return { res, ms: totalMs, headerMs, totalMs, bytes: new TextEncoder().encode(text).length, text };
  } finally {
    clearTimeout(timer);
  }
}

export const scanUrl = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<ScanResult> => {
    const log: string[] = [];
    const url = normalizeUrl(data.url);
    log.push(`$ curl -sL ${url}`);

    let main: Awaited<ReturnType<typeof fetchWithTimeout>>;
    try {
      main = await fetchWithTimeout(url, 12000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "fetch failed";
      log.push(`→ FAIL · ${msg}`);
      return { ok: false, url, error: msg, log };
    }

    if (!main.res.ok) {
      log.push(`→ HTTP ${main.res.status} · ${main.ms}ms`);
      return {
        ok: false,
        url,
        error: `Origin returned HTTP ${main.res.status}`,
        log,
      };
    }

    const finalUrl = main.res.url || url;
    const html = main.text;
    log.push(`→ ${main.res.status} OK · ${fmtKb(main.bytes)} · ${main.totalMs}ms total · first byte ${main.headerMs}ms`);

    // -------- Semantic HTML --------
    log.push(`$ parse --semantic-tags`);
    const hasMain = /<main[\s>]/i.test(html);
    const hasArticle = /<article[\s>]/i.test(html);
    const hasHeader = /<header[\s>]/i.test(html);
    const hasNav = /<nav[\s>]/i.test(html);
    const hasFooter = /<footer[\s>]/i.test(html);
    const hasSection = /<section[\s>]/i.test(html);
    const h1Count = countMatches(html, /<h1[\s>]/gi);
    const h2Count = countMatches(html, /<h2[\s>]/gi);
    const divCount = countMatches(html, /<div[\s>]/gi);
    const imgCount = countMatches(html, /<img\b/gi);
    const imgAltCount = countMatches(html, /<img\b[^>]*\salt=/gi);
    const landmarksFound = [
      hasMain && "<main>",
      hasArticle && "<article>",
      hasHeader && "<header>",
      hasNav && "<nav>",
      hasFooter && "<footer>",
      hasSection && "<section>",
    ].filter(Boolean) as string[];
    log.push(`→ found ${landmarksFound.length ? landmarksFound.join(", ") : "no landmarks"} · h1=${h1Count} h2=${h2Count}`);

    const landmarkScore = (landmarksFound.length / 6) * 70;
    const headingScore = h1Count === 1 ? 20 : h1Count === 0 ? 0 : 10;
    const altScore = imgCount === 0 ? 10 : (imgAltCount / imgCount) * 10;
    const semanticScore = clamp(landmarkScore + headingScore + altScore);
    const semanticDetails: string[] = [
      `${landmarksFound.length}/6 landmark tags present${landmarksFound.length ? ` (${landmarksFound.join(", ")})` : ""}`,
      h1Count === 1
        ? "✓ Exactly one <h1>"
        : h1Count === 0
          ? "✗ No <h1> on the page"
          : `△ ${h1Count} <h1> tags — keep it to one`,
      imgCount === 0
        ? "✓ No images to caption"
        : imgAltCount === imgCount
          ? `✓ All ${imgCount} images have alt text`
          : `△ ${imgAltCount}/${imgCount} images have alt text`,
      divCount > 200 ? `△ ${divCount} <div>s — high ratio of non-semantic containers` : `✓ ${divCount} <div>s`,
    ];

    // -------- JSON-LD --------
    log.push(`$ extract --jsonld`);
    const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const ldBlocks: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = ldRe.exec(html)) !== null) ldBlocks.push(m[1]);
    const ldTypes = new Set<string>();
    let ldValid = 0;
    for (const block of ldBlocks) {
      try {
        const parsed = JSON.parse(block);
        ldValid++;
        const collect = (node: unknown) => {
          if (!node || typeof node !== "object") return;
          const obj = node as Record<string, unknown>;
          const t = obj["@type"];
          if (typeof t === "string") ldTypes.add(t);
          else if (Array.isArray(t)) for (const x of t) if (typeof x === "string") ldTypes.add(x);
          const graph = obj["@graph"];
          if (Array.isArray(graph)) for (const g of graph) collect(g);
        };
        if (Array.isArray(parsed)) for (const x of parsed) collect(x);
        else collect(parsed);
      } catch {
        // invalid block
      }
    }
    log.push(`→ ${ldBlocks.length} block(s), ${ldValid} valid · types=${[...ldTypes].join(",") || "none"}`);

    const ldBaseScore = ldBlocks.length === 0 ? 0 : ldValid === ldBlocks.length ? 60 : 35;
    const typeBonus = Math.min(40, ldTypes.size * 13);
    const jsonldScore = clamp(ldBaseScore + typeBonus);
    const jsonldDetails: string[] = [
      ldBlocks.length === 0
        ? "✗ No JSON-LD blocks found"
        : `✓ ${ldValid}/${ldBlocks.length} JSON-LD block(s) valid`,
      ldTypes.size
        ? `Types detected: ${[...ldTypes].join(", ")}`
        : "→ Add Organization or WebSite schema at minimum",
      ldTypes.has("FAQPage") ? "✓ FAQPage present" : "△ Missing FAQPage schema",
      ldTypes.has("BreadcrumbList") ? "✓ BreadcrumbList present" : "△ Missing BreadcrumbList schema",
    ];

    // -------- llms.txt --------
    log.push(`$ check /llms.txt`);
    let llmsScore = 0;
    const llmsDetails: string[] = [];
    try {
      const origin = new URL(finalUrl).origin;
      const llmsRes = await fetchWithTimeout(`${origin}/llms.txt`, 6000);
      if (llmsRes.res.ok && /^[\s\S]{32,}/.test(llmsRes.text) && !/<html/i.test(llmsRes.text.slice(0, 200))) {
        const t = llmsRes.text;
        const hasH1 = /^#\s+\S/m.test(t);
        const hasQuote = /^>\s+\S/m.test(t);
        const hasSections = /^##\s+\S/m.test(t);
        llmsScore = 60 + (hasH1 ? 15 : 0) + (hasQuote ? 15 : 0) + (hasSections ? 10 : 0);
        log.push(`→ 200 OK · ${fmtKb(llmsRes.bytes)}`);
        llmsDetails.push(`✓ /llms.txt present (${fmtKb(llmsRes.bytes)})`);
        llmsDetails.push(hasH1 ? "✓ Has top-level # heading" : "△ Missing top-level # heading");
        llmsDetails.push(hasQuote ? "✓ Has > tagline summary" : "△ Add a > blockquote tagline");
        llmsDetails.push(hasSections ? "✓ Uses ## sections" : "△ Add ## sections (Services, Pages, Contact)");
      } else {
        log.push(`→ HTTP ${llmsRes.res.status} · llms.txt not found`);
        llmsDetails.push("✗ /llms.txt returns " + llmsRes.res.status);
        llmsDetails.push("→ Add a top-level llms.txt summarizing the site");
        llmsDetails.push("→ Include a > tagline, services, pricing, and key links");
      }
    } catch (err) {
      log.push(`→ FAIL · ${err instanceof Error ? err.message : "llms.txt fetch error"}`);
      llmsDetails.push("✗ Could not fetch /llms.txt");
    }
    llmsScore = clamp(llmsScore);

    // -------- Citability --------
    log.push(`$ score --citability`);
    const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']{20,})["']/i);
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']{20,})["']/i);
    const titleMatch = html.match(/<title>([^<]{5,})<\/title>/i);
    const canonical = /<link[^>]+rel=["']canonical["']/i.test(html);

    // crude visible text approximation
    const visibleText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const wordCount = visibleText ? visibleText.split(" ").length : 0;

    let citabilityScore = 0;
    if (titleMatch) citabilityScore += 15;
    if (metaDescMatch) citabilityScore += 20;
    if (ogDescMatch) citabilityScore += 10;
    if (canonical) citabilityScore += 10;
    if (wordCount >= 300) citabilityScore += 25;
    else if (wordCount >= 100) citabilityScore += 12;
    if (h2Count >= 2) citabilityScore += 10;
    if (hasArticle) citabilityScore += 10;
    citabilityScore = clamp(citabilityScore);

    log.push(`→ words=${wordCount} · title=${titleMatch ? "ok" : "missing"} · meta=${metaDescMatch ? "ok" : "missing"}`);

    const citabilityDetails: string[] = [
      titleMatch ? `✓ <title>: "${titleMatch[1].slice(0, 70)}"` : "✗ Missing <title>",
      metaDescMatch ? "✓ Meta description present" : "✗ Missing meta description",
      ogDescMatch ? "✓ og:description present" : "△ Missing og:description",
      canonical ? "✓ Canonical link present" : "△ Missing rel=canonical",
      wordCount < 100 ? `✗ Only ${wordCount} visible words — agents need substance` : `✓ ${wordCount} visible words`,
    ];

    // -------- Speed --------
    log.push(`$ measure --first-byte`);
    const firstByteMs = main.headerMs;
    let speedScore = 100;
    if (firstByteMs > 800) speedScore -= 20;
    if (firstByteMs > 1500) speedScore -= 25;
    if (firstByteMs > 3000) speedScore -= 25;
    if (main.bytes > 200_000) speedScore -= 10;
    if (main.bytes > 500_000) speedScore -= 15;
    if (main.bytes > 1_000_000) speedScore -= 20;
    speedScore = clamp(speedScore);

    log.push(`→ first byte ${firstByteMs}ms · full HTML ${main.totalMs}ms · payload ${fmtKb(main.bytes)}`);
    log.push(`$ compile report.json`);

    const metrics: ScanMetric[] = [
      {
        key: "semantic",
        label: "Semantic HTML",
        score: semanticScore,
        status: statusFor(semanticScore),
        summary: "Landmark tags and heading hierarchy help agents map the page.",
        details: semanticDetails,
      },
      {
        key: "jsonld",
        label: "JSON-LD",
        score: jsonldScore,
        status: statusFor(jsonldScore),
        summary: "Structured data lets LLMs cite facts with confidence.",
        details: jsonldDetails,
      },
      {
        key: "llms",
        label: "llms.txt",
        score: llmsScore,
        status: statusFor(llmsScore),
        summary: "A /llms.txt file is the agent-era robots.txt + sitemap.",
        details: llmsDetails,
      },
      {
        key: "citability",
        label: "Citability",
        score: citabilityScore,
        status: statusFor(citabilityScore),
        summary: "Title, description, and substantive text drive citations.",
        details: citabilityDetails,
      },
      {
        key: "speed",
        label: "Speed",
        score: speedScore,
        status: statusFor(speedScore),
        summary: "Slow pages get partial crawls and timeouts.",
        details: [
          `First byte: ${firstByteMs}ms`,
          `Full HTML download: ${main.totalMs}ms`,
          `Payload size: ${fmtKb(main.bytes)}`,
          firstByteMs < 800 ? "✓ Fast time-to-content" : firstByteMs < 2000 ? "△ Acceptable but improvable" : "✗ Too slow for reliable crawls",
        ],
      },
    ];

    // Weighted overall matches the public methodology (25/20/15/20/20)
    const weights: Record<ScanMetric["key"], number> = {
      semantic: 0.25,
      jsonld: 0.2,
      llms: 0.15,
      citability: 0.2,
      speed: 0.2,
    };
    const overall = clamp(metrics.reduce((s, m) => s + m.score * weights[m.key], 0));
    log.push(`→ done · agent_readability_score = ${overall}`);

    // Persist to history (fire-and-forget — never fail the user-facing scan).
    persistScan({
      url,
      finalUrl,
      overall,
      scores: {
        semantic: semanticScore,
        jsonld: jsonldScore,
        llms: llmsScore,
        citability: citabilityScore,
        speed: speedScore,
      },
      source: data.source ?? "check",
    }).catch((e) => console.error("persistScan error", e));

    return {
      ok: true,
      url,
      finalUrl,
      fetchedAt: new Date().toISOString(),
      overall,
      log,
      metrics,
    };
  });
