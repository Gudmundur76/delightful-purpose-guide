// Public rescan endpoint — triggers a fresh /check scan for a URL and
// returns the score plus a live TTFB + cache-header probe of the target.
// No auth required (soft IP rate limit only). Meant for the dashboard
// "rescan" button, external monitors, and the WordPress plugin.
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { scanUrl } from "@/lib/check/scan.functions";
import { JSON_HEADERS, optionsResponse } from "@/lib/api/auth";
import { rateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";

const InputSchema = z.object({
  url: z.string().min(3).max(2048),
  source: z.string().max(40).optional(),
});

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...JSON_HEADERS, ...extra },
  });
}

function normalizeUrl(input: string): string {
  const u = input.trim();
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

type HeaderProbe = {
  ttfb_ms: number | null;
  total_ms: number | null;
  status: number | null;
  final_url: string | null;
  headers: {
    "cache-control": string | null;
    "cdn-cache-control": string | null;
    "cloudflare-cdn-cache-control": string | null;
    "content-signal": string | null;
    "x-cache": string | null;
    "cf-cache-status": string | null;
    age: string | null;
    server: string | null;
    link: string | null;
    "content-type": string | null;
  };
  edge_cacheable: boolean;
  error?: string;
};

async function probeHeaders(target: string): Promise<HeaderProbe> {
  const started = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(target, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "grow-contact-rescan/1.0 (+https://grow.contact)",
        accept: "text/html,application/xhtml+xml",
      },
    });
    const ttfb = Date.now() - started;
    // Drain a small chunk so cf-cache-status is finalized, then abort.
    const reader = res.body?.getReader();
    if (reader) {
      try { await reader.read(); } catch {}
      try { await reader.cancel(); } catch {}
    }
    const total = Date.now() - started;
    const h = (k: string) => res.headers.get(k);
    const cc = h("cache-control");
    const sMaxAge = /s-maxage=(\d+)/i.exec(cc ?? "");
    const edgeCacheable =
      !!(sMaxAge && Number(sMaxAge[1]) > 0) ||
      /public/i.test(cc ?? "") && !/no-store|private/i.test(cc ?? "");
    return {
      ttfb_ms: ttfb,
      total_ms: total,
      status: res.status,
      final_url: res.url,
      headers: {
        "cache-control": cc,
        "cdn-cache-control": h("cdn-cache-control"),
        "cloudflare-cdn-cache-control": h("cloudflare-cdn-cache-control"),
        "content-signal": h("content-signal"),
        "x-cache": h("x-cache"),
        "cf-cache-status": h("cf-cache-status"),
        age: h("age"),
        server: h("server"),
        link: h("link"),
        "content-type": h("content-type"),
      },
      edge_cacheable: edgeCacheable,
    };
  } catch (err) {
    return {
      ttfb_ms: null,
      total_ms: null,
      status: null,
      final_url: null,
      headers: {
        "cache-control": null,
        "cdn-cache-control": null,
        "cloudflare-cdn-cache-control": null,
        "content-signal": null,
        "x-cache": null,
        "cf-cache-status": null,
        age: null,
        server: null,
        link: null,
        "content-type": null,
      },
      edge_cacheable: false,
      error: err instanceof Error ? err.message : String(err),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const Route = createFileRoute("/api/public/rescan")({
  server: {
    handlers: {
      OPTIONS: () => optionsResponse(),
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const target = url.searchParams.get("url");
        if (!target) return json({ error: "missing_url" }, 400);
        return handle(request, target, url.searchParams.get("source") ?? "rescan-get");
      },
      POST: async ({ request }) => {
        let body: unknown;
        try { body = await request.json(); }
        catch { return json({ error: "invalid_json" }, 400); }
        const parsed = InputSchema.safeParse(body);
        if (!parsed.success) {
          return json({ error: "invalid_input", issues: parsed.error.issues }, 400);
        }
        return handle(request, parsed.data.url, parsed.data.source ?? "rescan");
      },
    },
  },
});

async function handle(request: Request, rawUrl: string, source: string): Promise<Response> {
  const ip = clientIpFromRequest(request);
  // 10 rescans / minute / IP is plenty for humans and the WP plugin.
  if (rateLimit(`rescan:${ip}`, 10, 60_000)) {
    return json({ error: "rate_limited", retry_after_seconds: 60 }, 429, { "Retry-After": "60" });
  }

  const normalized = normalizeUrl(rawUrl);
  const startedAt = new Date().toISOString();

  const [probe, scan] = await Promise.all([
    probeHeaders(normalized),
    scanUrl({ data: { url: normalized, source } }).catch((e) => ({
      ok: false as const,
      url: normalized,
      error: e instanceof Error ? e.message : String(e),
      log: [] as string[],
    })),
  ]);

  return json({
    ok: true,
    started_at: startedAt,
    completed_at: new Date().toISOString(),
    input_url: rawUrl,
    normalized_url: normalized,
    probe,
    scan,
  });
}
