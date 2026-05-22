import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

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

// Public routes safe to cache at the edge. Auth-gated routes
// (login, admin, checkout, contact form POST targets, etc.) are excluded
// so bots and anonymous users get instant HTML while logged-in users
// always see fresh state.
const CACHEABLE_PATHS = new Set([
  "/",
  "/services",
  "/work",
  "/pricing",
  "/process",
  "/products",
  "/check",
  "/leaderboard",
  "/badge",
  "/faq",
  "/api-docs",
  "/status",
  "/llms",
  "/cookies",
  "/privacy",
  "/terms",
  "/refund",
  "/playbook",
  "/sop",
  "/outreach",
  "/vs",
  "/blog",
]);

function isCacheableRequest(request: Request): boolean {
  if (request.method !== "GET") return false;
  // Supabase auth cookies start with "sb-" — never cache authenticated views.
  const cookie = request.headers.get("cookie") ?? "";
  if (cookie.includes("sb-")) return false;
  const url = new URL(request.url);
  if (CACHEABLE_PATHS.has(url.pathname)) return true;
  if (url.pathname.startsWith("/blog/")) return true;
  if (url.pathname.startsWith("/vs/")) return true;
  return false;
}

function applyEdgeCacheHeaders(request: Request, response: Response): Response {
  if (!isCacheableRequest(request)) return response;
  if (response.status !== 200) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) return response;
  // Don't override an explicit Cache-Control set by a route handler.
  const existing = response.headers.get("cache-control") ?? "";
  if (existing && !existing.includes("no-cache") && !existing.includes("no-store")) {
    return response;
  }
  // Edge caches for 5 minutes, serves stale for a day while revalidating.
  // Browsers don't cache (max-age=0) so authed users never see stale shells.
  const headers = new Headers(response.headers);
  headers.set(
    "cache-control",
    "public, max-age=0, s-maxage=300, stale-while-revalidate=86400",
  );
  headers.set("vary", "Accept-Encoding, Cookie");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);
      return applyEdgeCacheHeaders(request, normalized);
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
