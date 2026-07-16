import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { persistScan } from "./scans.server";

const InputSchema = z.object({
  url: z.string().min(3).max(2048),
  source: z.string().max(40).optional(),
});

export type ScanStatus = "pass" | "warn" | "fail";

export type ScanMetricKey =
  | "semantic"
  | "jsonld"
  | "llms"
  | "citability"
  | "speed"
  | "protocol"
  | "agent_auth";

export type ScanMetric = {
  key: ScanMetricKey;
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

    // -------- Protocol Discovery (geo-standard@2026.06, matrix @2026.07) --------
    // The Agent-Web Discovery Matrix — 5 signals, one per agent architecture:
    //   1. /.well-known/agent-card.json  → API-calling agents (MCP/A2A)
    //   2. /.well-known/mcp.json (or /.well-known/mcp/server-card.json) → MCP clients
    //   3. /llms.txt                     → text agents (Claude, ChatGPT, Gemini chat)
    //   4. <script type="application/agent+json"> in HTML → DOM agents
    //   5. Visible "AI-ready" badge / marker            → CUA / screenshot agents
    // Plus network-layer plumbing kept from 2026.06: Link headers, markdown
    // content negotiation, and Cloudflare Content-Signal in robots.txt.
    log.push(`$ probe --protocol-discovery`);
    const origin = new URL(finalUrl).origin;
    const linkHeader = main.res.headers.get("link") ?? "";
    const hasLlmsLink = /\brel\s*=\s*"?llms"?/i.test(linkHeader);
    const hasMcpLink = /\brel\s*=\s*"?mcp"?/i.test(linkHeader);
    const hasApiCatalogLink = /\brel\s*=\s*"?api-catalog"?/i.test(linkHeader);

    async function probeJson(path: string): Promise<boolean> {
      try {
        const r = await fetchWithTimeout(`${origin}${path}`, 4000);
        if (!r.res.ok) return false;
        if (!/json/i.test(r.res.headers.get("content-type") ?? "")) return false;
        JSON.parse(r.text);
        return true;
      } catch {
        return false;
      }
    }

    const [hasMcpCard, hasAgentCard] = await Promise.all([
      probeJson("/.well-known/mcp.json"),
      probeJson("/.well-known/agent-card.json"),
    ]);

    // Signal 3: /llms.txt — already scored in the llms metric, but re-probed
    // here so the matrix is self-contained for the protocol details section.
    let hasLlmsTxt = false;
    try {
      const r = await fetchWithTimeout(`${origin}/llms.txt`, 4000);
      hasLlmsTxt = r.res.ok && r.text.trim().length > 16;
    } catch { /* leave false */ }

    // Signal 4: in-page marker for DOM agents.
    const hasInPageMarker = /<script[^>]+type=["']application\/agent\+json["']/i.test(html);

    // Signal 5: visible AI-ready badge. Match a rendered indicator agents can
    // see in a screenshot — <img>/<a> tag pointing at a well-known badge path,
    // or a data-attribute marker on any element.
    const hasVisibleBadge =
      /(?:<a[^>]+href|<img[^>]+src)=["'][^"']*\/badge(?:\/|["'])/i.test(html) ||
      /data-agent-ready\s*=/i.test(html) ||
      /aria-label=["'][^"']*agent[- ]ready[^"']*["']/i.test(html);

    let supportsMarkdownNegotiation = false;
    try {
      const mdRes = await fetch(origin + "/", {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent": "GrowAgentReadabilityBot/1.0 (+https://grow.contact/check)",
          Accept: "text/markdown",
        },
      });
      const mdCt = mdRes.headers.get("content-type") ?? "";
      if (mdRes.ok && /text\/markdown/i.test(mdCt)) {
        supportsMarkdownNegotiation = true;
      }
    } catch {
      // network error — leave false
    }

    let hasContentSignal = false;
    let hasGoogleExtended = false;
    try {
      const robotsRes = await fetchWithTimeout(`${origin}/robots.txt`, 4000);
      if (robotsRes.res.ok) {
        hasContentSignal = /^content-signal\s*:/im.test(robotsRes.text);
        hasGoogleExtended = /^user-agent\s*:\s*Google-Extended\b/im.test(robotsRes.text);
      }
    } catch {
      // network error — leave false
    }

    // Google AI snippet controls (per Google's June 2026 AI optimization guide).
    // max-snippet / nosnippet on the robots meta tag tell Google how much text
    // it may quote in AI Overviews. Absent = Google decides.
    const robotsMetaMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
    const robotsMeta = robotsMetaMatch ? robotsMetaMatch[1] : "";
    const hasMaxSnippet = /max-snippet\s*:\s*-?\d+/i.test(robotsMeta);
    const hasNoSnippet = /\bnosnippet\b/i.test(robotsMeta);

    // Weighted score: the 5-signal matrix carries 75pts (15 each), network
    // plumbing (link header + markdown + content-signal) carries 25pts.
    const matrixSignals = [
      { ok: hasAgentCard, pts: 15, label: "agent-card.json (API agents)" },
      { ok: hasMcpCard, pts: 15, label: "mcp.json (MCP clients)" },
      { ok: hasLlmsTxt, pts: 15, label: "llms.txt (text agents)" },
      { ok: hasInPageMarker, pts: 15, label: "in-page marker (DOM agents)" },
      { ok: hasVisibleBadge, pts: 15, label: "visible badge (CUA agents)" },
    ];
    const plumbingSignals = [
      { ok: hasLlmsLink || hasMcpLink || hasApiCatalogLink, pts: 10, label: "Link header" },
      { ok: supportsMarkdownNegotiation, pts: 8, label: "Markdown negotiation" },
      { ok: hasContentSignal, pts: 7, label: "Content-Signal in robots.txt" },
    ];
    const protocolChecks = [...matrixSignals, ...plumbingSignals];
    const protocolScore = clamp(
      protocolChecks.reduce((s, c) => s + (c.ok ? c.pts : 0), 0),
    );
    const matrixHits = matrixSignals.filter((s) => s.ok).length;
    log.push(
      `→ matrix ${matrixHits}/5 · agent-card=${hasAgentCard ? "yes" : "no"} · mcp=${hasMcpCard ? "yes" : "no"} · llms=${hasLlmsTxt ? "yes" : "no"} · in-page=${hasInPageMarker ? "yes" : "no"} · badge=${hasVisibleBadge ? "yes" : "no"}`,
    );

    const protocolDetails: string[] = [
      `${matrixHits === 5 ? "✓" : matrixHits >= 3 ? "△" : "✗"} Discovery matrix: ${matrixHits}/5 signals present (one per agent architecture)`,
      hasAgentCard
        ? "✓ /.well-known/agent-card.json — served to API-calling agents (MCP/A2A clients)"
        : "✗ /.well-known/agent-card.json missing — API-calling agents (MCP/A2A) can't discover skills",
      hasMcpCard
        ? "✓ /.well-known/mcp.json — MCP clients can auto-configure"
        : "✗ /.well-known/mcp.json missing — publish an MCP server card",
      hasLlmsTxt
        ? "✓ /llms.txt — text agents (Claude, ChatGPT, Gemini chat) have a canonical index"
        : "✗ /llms.txt missing — text-based agents have no site summary",
      hasInPageMarker
        ? "✓ In-page <script type=\"application/agent+json\"> — DOM agents (Codex, Playwright) discover endpoints without leaving the page"
        : "✗ No in-page agent+json marker — DOM agents miss the on-page discovery hint",
      hasVisibleBadge
        ? "✓ Visible AI-ready badge — CUA / screenshot agents (Operator, Claude CUA) get a pixel-level cue"
        : "△ No visible AI-ready badge — CUA agents brute-force the UI with no hint",
      hasLlmsLink || hasMcpLink || hasApiCatalogLink
        ? `✓ Link header advertises agent surfaces (${[hasLlmsLink && "llms", hasMcpLink && "mcp", hasApiCatalogLink && "api-catalog"].filter(Boolean).join(", ")})`
        : "△ No Link header with rel=\"llms\" / \"mcp\" / \"api-catalog\"",
      supportsMarkdownNegotiation
        ? "✓ Serves text/markdown on Accept: text/markdown"
        : "△ No markdown content negotiation — agents can't request a .md twin",
      hasContentSignal
        ? "✓ Cloudflare Content-Signal declared in robots.txt"
        : "△ No Content-Signal in robots.txt (search/ai-train/ai-input)",
      hasGoogleExtended
        ? "✓ robots.txt names Google-Extended explicitly (Google AI training opt-in/out)"
        : "△ No Google-Extended user-agent block in robots.txt — Google's AI default applies",
      hasNoSnippet
        ? "△ <meta robots> sets nosnippet — Google AI Overviews can't quote this page"
        : hasMaxSnippet
          ? `✓ <meta robots> sets max-snippet (per Google's June 2026 AI guide)`
          : "△ No max-snippet / nosnippet meta — Google decides how much to quote in AI Overviews",
    ];

    // -------- Agent Auth (bonus, added in geo-standard@2026.07) --------
    // Mirrors isitagentready.com checks: /auth.md + the two OAuth discovery
    // documents + a valid agent_auth block + Link headers + live
    // register_uri / claim_uri / revocation_uri (no 404 stubs).
    // Excluded from the weighted overall — surfaced as an optional bonus.
    log.push(`$ probe --agent-auth`);
    let authMdOk = false;
    let authMdHasLink = false;
    try {
      const r = await fetchWithTimeout(`${origin}/auth.md`, 4000);
      const ct = r.res.headers.get("content-type") ?? "";
      authMdOk = r.res.ok && /markdown|text\/plain/i.test(ct) && r.text.trim().length > 32;
      authMdHasLink = /\boauth-authorization-server\b/i.test(r.res.headers.get("link") ?? "");
    } catch { /* leave false */ }

    let oprOk = false;
    let oprHasLink = false;
    try {
      const r = await fetchWithTimeout(`${origin}/.well-known/oauth-protected-resource`, 4000);
      if (r.res.ok && /json/i.test(r.res.headers.get("content-type") ?? "")) {
        try {
          const parsed = JSON.parse(r.text);
          oprOk = !!parsed && typeof parsed === "object" && "resource" in parsed && "authorization_servers" in parsed;
        } catch { /* invalid json */ }
      }
      oprHasLink = /\boauth-authorization-server\b/i.test(r.res.headers.get("link") ?? "");
    } catch { /* leave false */ }

    let oasOk = false;
    let agentAuthOk = false;
    let registerOk = false;
    let claimOk = false;
    let revocationOk = false;
    try {
      const r = await fetchWithTimeout(`${origin}/.well-known/oauth-authorization-server`, 4000);
      if (r.res.ok && /json/i.test(r.res.headers.get("content-type") ?? "")) {
        try {
          const parsed = JSON.parse(r.text) as Record<string, unknown>;
          oasOk = typeof parsed === "object" && parsed !== null && "issuer" in parsed;
          const aa = parsed["agent_auth"] as Record<string, unknown> | undefined;
          if (aa && typeof aa === "object") {
            const hasRegister = typeof aa["register_uri"] === "string";
            const hasIdentities = Array.isArray(aa["identity_types_supported"]) && (aa["identity_types_supported"] as unknown[]).length > 0;
            const hasCredentials = Array.isArray(aa["credential_types_supported"]) && (aa["credential_types_supported"] as unknown[]).length > 0;
            agentAuthOk = hasRegister && hasIdentities && hasCredentials;

            // Probe register/claim/revocation reachability (HEAD; treat 2xx/401/405 as "exists").
            const aliveCheck = async (u: unknown): Promise<boolean> => {
              if (typeof u !== "string") return false;
              try {
                const probe = await fetch(u, { method: "HEAD", redirect: "follow" });
                return probe.status < 400 || probe.status === 401 || probe.status === 405;
              } catch { return false; }
            };
            [registerOk, claimOk, revocationOk] = await Promise.all([
              aliveCheck(aa["register_uri"]),
              aliveCheck(aa["claim_uri"]),
              aliveCheck(aa["revocation_uri"]),
            ]);
          }
        } catch { /* invalid json */ }
      }
    } catch { /* leave false */ }

    const allLinkHeaders = authMdHasLink && oprHasLink;
    const liveEndpointsCount = [registerOk, claimOk, revocationOk].filter(Boolean).length;

    const agentAuthChecks = [
      { ok: authMdOk, pts: 25, label: "/auth.md" },
      { ok: oprOk, pts: 25, label: "/.well-known/oauth-protected-resource" },
      { ok: oasOk && agentAuthOk, pts: 30, label: "agent_auth block" },
      { ok: allLinkHeaders, pts: 10, label: "Link headers" },
      { ok: liveEndpointsCount === 3, pts: 10, label: "register/claim/revocation reachable" },
    ];
    const agentAuthScore = clamp(agentAuthChecks.reduce((s, c) => s + (c.ok ? c.pts : 0), 0));
    log.push(`→ auth.md=${authMdOk ? "yes" : "no"} · opr=${oprOk ? "yes" : "no"} · oas=${oasOk ? "yes" : "no"} · agent_auth=${agentAuthOk ? "yes" : "no"} · live=${liveEndpointsCount}/3`);

    const agentAuthDetails: string[] = [
      authMdOk ? "✓ /auth.md served with markdown content-type" : "✗ /auth.md missing or wrong content-type",
      oprOk ? "✓ /.well-known/oauth-protected-resource valid (RFC 9728)" : "✗ /.well-known/oauth-protected-resource missing or invalid",
      oasOk
        ? agentAuthOk
          ? "✓ oauth-authorization-server includes agent_auth block with register_uri + identity_types + credential_types"
          : "△ oauth-authorization-server present but agent_auth block missing required fields"
        : "✗ /.well-known/oauth-authorization-server missing or invalid",
      allLinkHeaders ? "✓ Link headers cross-reference discovery endpoints" : "△ Add Link: <…oauth-authorization-server>; rel=\"oauth-authorization-server\" to /auth.md and /.well-known/oauth-protected-resource",
      liveEndpointsCount === 3
        ? "✓ register_uri, claim_uri, and revocation_uri all resolve"
        : `△ ${liveEndpointsCount}/3 of register/claim/revocation URIs resolve — 404 stubs disqualify the block`,
    ];

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
      {
        key: "protocol",
        label: "Protocol Discovery",
        score: protocolScore,
        status: statusFor(protocolScore),
        summary: "MCP card, Link header, markdown negotiation, and Content Signals make a site agent-native, not just AI-friendly.",
        details: protocolDetails,
      },
      {
        key: "agent_auth",
        label: "Agent Auth (bonus)",
        score: agentAuthScore,
        status: statusFor(agentAuthScore),
        summary: "auth.md + OAuth discovery let agents self-register without a human in the loop. Mirrors isitagentready.com checks. Bonus dimension — not weighted into overall.",
        details: agentAuthDetails,
      },
    ];

    // Weighted overall — geo-standard@2026.07 rubric. Agent Auth is a bonus
    // dimension and is intentionally excluded from the weighted overall.
    // semantic 20 · jsonld 20 · llms 15 · citability 15 · speed 15 · protocol 15
    const weights: Record<Exclude<ScanMetricKey, "agent_auth">, number> = {
      semantic: 0.2,
      jsonld: 0.2,
      llms: 0.15,
      citability: 0.15,
      speed: 0.15,
      protocol: 0.15,
    };
    const overall = clamp(
      metrics
        .filter((m): m is ScanMetric & { key: Exclude<ScanMetricKey, "agent_auth"> } => m.key !== "agent_auth")
        .reduce((s, m) => s + m.score * weights[m.key], 0),
    );
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
        protocol: protocolScore,
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
