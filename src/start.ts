import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { supabaseAdmin } from "./integrations/supabase/client.server";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";


const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Marketing pages with no per-user content — safe to cache at the edge.
// Cloudflare honors s-maxage; browsers honor max-age. SWR keeps repeat
// loads instant while origin revalidates in the background.
const CACHEABLE_PATHS = new Set<string>([
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
]);

const CACHE_HEADER =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=86400";

const cacheMiddleware = createMiddleware().server(async ({ request, next }) => {
  const response = (await next()) as unknown as Response;
  try {
    if (request.method !== "GET") return response;
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    const isCacheable =
      CACHEABLE_PATHS.has(path) || path.startsWith("/blog/");
    if (!isCacheable) return response;
    const ct = response.headers.get("content-type") || "";
    if (!ct.includes("text/html")) return response;
    if (response.status !== 200) return response;
    // These marketing pages render no per-user content, so it's safe to
    // strip any incidental Set-Cookie (e.g. Supabase SSR session refresh)
    // and let Cloudflare cache the response at the edge.
    const headers = new Headers(response.headers);
    headers.delete("set-cookie");
    headers.set("cache-control", CACHE_HEADER);
    headers.set("vary", "Accept, Accept-Encoding");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch {
    return response;
  }
});

// Intelligence platforms we explicitly want to track when they crawl us.
// Match on the referrer hostname (and on User-Agent as a fallback for
// bots that do not send Referer).
const TRACKED_PLATFORMS = [
  "silobreaker.com",
  "visvo.com",
  "egerin.com",
  "jamasp.com",
  "findelio.com",
  "alhea.com",
];

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function matchTrackedPlatform(host: string): string | null {
  const h = host.toLowerCase();
  for (const p of TRACKED_PLATFORMS) {
    if (h === p || h.endsWith("." + p)) return p;
  }
  return null;
}

const platformCrawlMiddleware = createMiddleware().server(
  async ({ request, next }) => {
    try {
      const url = new URL(request.url);
      // Don't track our own asset/API noise — only HTML page loads.
      const path = url.pathname;
      const isAsset =
        path.startsWith("/api/") ||
        path.startsWith("/_") ||
        path.startsWith("/assets/") ||
        /\.[a-zA-Z0-9]{2,5}$/.test(path);

      if (!isAsset && request.method === "GET") {
        const ua = request.headers.get("user-agent") || "";
        const referer = request.headers.get("referer") || "";

        let matched: string | null = null;
        if (referer) {
          try {
            matched = matchTrackedPlatform(new URL(referer).hostname);
          } catch {
            /* ignore */
          }
        }
        if (!matched && ua) {
          const uaLower = ua.toLowerCase();
          for (const p of TRACKED_PLATFORMS) {
            if (uaLower.includes(p.replace(".com", ""))) {
              matched = p;
              break;
            }
          }
        }

        if (matched) {
          const ip =
            request.headers.get("cf-connecting-ip") ||
            request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
            "unknown";
          const ipHash = await sha256Hex(ip);
          // Fire-and-forget; never block the response.
          supabaseAdmin
            .from("platform_crawls")
            .insert({
              referrer_domain: matched,
              crawled_path: path,
              user_agent: ua.slice(0, 500),
              ip_hash: ipHash,
            })
            .then(({ error }) => {
              if (error) console.error("platform_crawls insert", error.message);
            });
        }
      }
    } catch (e) {
      console.error("platformCrawlMiddleware error", e);
    }
    return next();
  },
);

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, platformCrawlMiddleware, cacheMiddleware],
}));

