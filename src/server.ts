import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import {
  handleWellKnownRequest,
  buildLinkHeader,
  buildMarkdownTwin,
  acceptsMarkdown,
} from "./lib/agent-protocol";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => ((m as { default?: ServerEntry }).default ?? (m as unknown as ServerEntry)),
    );
  }
  return serverEntryPromise;
}

function brandedErrorResponse(): Response {
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isCatastrophicSsrErrorBody(body: string, responseStatus: number): boolean {
  let payload: unknown;
  try {
    payload = JSON.parse(body);
  } catch {
    return false;
  }

  if (!payload || Array.isArray(payload) || typeof payload !== "object") {
    return false;
  }

  const fields = payload as Record<string, unknown>;
  const expectedKeys = new Set(["message", "status", "unhandled"]);
  if (!Object.keys(fields).every((key) => expectedKeys.has(key))) {
    return false;
  }

  return (
    fields.unhandled === true &&
    fields.message === "HTTPError" &&
    (fields.status === undefined || fields.status === responseStatus)
  );
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isCatastrophicSsrErrorBody(body, response.status)) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return brandedErrorResponse();
}

const CACHEABLE_PATH_EXCLUDES = [
  "/dashboard",
  "/admin",
  "/checkout",
  "/content",
  "/login",
  "/api/",
];

function isCacheablePath(pathname: string): boolean {
  return !CACHEABLE_PATH_EXCLUDES.some((p) => pathname.startsWith(p));
}

type ExecutionCtx = { waitUntil?: (p: Promise<unknown>) => void } | undefined;

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      const execCtx = ctx as ExecutionCtx;

      // 1) /.well-known/* + /auth.md — answered before TanStack to avoid
      //    routing edge cases with leading-dot path segments.
      const wellKnown = handleWellKnownRequest(url);
      if (wellKnown) return wellKnown;

      // 2) Markdown content negotiation: agents may request a .md twin of
      //    any HTML page via `Accept: text/markdown`. We serve a curated
      //    per-route summary so scrapers can skip the JS/HTML shell.
      if (request.method === "GET" && acceptsMarkdown(request)) {
        const md = buildMarkdownTwin(url.pathname);
        if (md) {
          return new Response(md.body, {
            status: 200,
            headers: {
              "content-type": "text/markdown; charset=utf-8",
              "cache-control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
              "x-content-type-options": "nosniff",
              link: buildLinkHeader(),
            },
          });
        }
      }

      // 3) Worker-level Cache API for HTML GETs. This bypasses any zone-level
      //    cache rule and guarantees warm hits return in <50ms regardless of
      //    what the origin's Cache-Control header says downstream.
      const cacheEligible =
        request.method === "GET" &&
        isCacheablePath(url.pathname) &&
        !request.headers.get("authorization") &&
        !request.headers.get("cookie")?.includes("sb-");

      const cache =
        cacheEligible && typeof caches !== "undefined" && (caches as { default?: Cache }).default
          ? (caches as unknown as { default: Cache }).default
          : null;

      const cacheKey = cache ? new Request(url.toString(), { method: "GET" }) : null;

      let hit: Response | undefined;
      if (cache && cacheKey) {
        try {
          hit = await cache.match(cacheKey);
        } catch {
          // Cache API not supported in this runtime (e.g. dynamically-loaded preview worker)
          hit = undefined;
        }
      }
      if (hit) {
        const h = new Headers(hit.headers);
        h.set("x-cache", "HIT");
        return new Response(hit.body, { status: hit.status, statusText: hit.statusText, headers: h });
      }


      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);

      const ct = normalized.headers.get("content-type") ?? "";
      const isHtml = ct.includes("text/html");

      if (isHtml) {
        const headers = new Headers(normalized.headers);
        if (!headers.has("link")) headers.set("link", buildLinkHeader());
        if (!headers.has("content-signal")) {
          headers.set("content-signal", "search=yes, ai-train=no, ai-input=yes");
        }
        if (cacheEligible && normalized.status === 200) {
          // Force browser revalidation (so users see fresh content) but allow
          // the worker cache + CF edge to serve warm copies for 5 minutes.
          headers.set(
            "cache-control",
            "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
          );
          headers.set("cdn-cache-control", "public, s-maxage=300, stale-while-revalidate=600");
          headers.set(
            "cloudflare-cdn-cache-control",
            "public, s-maxage=300, stale-while-revalidate=600",
          );
        }

        // Buffer the body so we can return it AND store a copy in the cache.
        const buf = await normalized.arrayBuffer();
        const out = new Response(buf, {
          status: normalized.status,
          statusText: normalized.statusText,
          headers,
        });

        if (cache && cacheKey && cacheEligible && normalized.status === 200) {
          const storeHeaders = new Headers(headers);
          storeHeaders.delete("set-cookie");
          storeHeaders.set("x-cache", "MISS-STORED");
          const toStore = new Response(buf, {
            status: 200,
            statusText: normalized.statusText,
            headers: storeHeaders,
          });
          if (execCtx?.waitUntil) {
            execCtx.waitUntil(cache.put(cacheKey, toStore));
          } else {
            cache.put(cacheKey, toStore).catch(() => {});
          }
        }

        return out;
      }

      return normalized;
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
