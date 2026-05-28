import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";

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

export const startInstance = createStart(() => ({
  requestMiddleware: [errorMiddleware, cacheMiddleware],
}));
