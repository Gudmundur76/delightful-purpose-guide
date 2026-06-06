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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);

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

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalized = await normalizeCatastrophicSsrResponse(response);

      // 3) Edge-cache the homepage HTML so repeat visits (and agent scanners)
      //    get sub-100ms TTFB instead of paying SSR cost on every request.
      //    Also attach the agent-protocol Link header on every HTML response.
      const ct = normalized.headers.get("content-type") ?? "";
      const isHtml = ct.includes("text/html");
      // Edge-cache HTML on every public GET so AI crawlers and repeat
      // visitors get sub-200ms TTFB instead of paying SSR on every hit.
      const shouldOverrideCache =
        request.method === "GET" &&
        normalized.status === 200 &&
        isHtml &&
        !url.pathname.startsWith("/dashboard") &&
        !url.pathname.startsWith("/admin") &&
        !url.pathname.startsWith("/checkout") &&
        !url.pathname.startsWith("/content") &&
        !url.pathname.startsWith("/login") &&
        !url.pathname.startsWith("/api/");

      if (isHtml) {
        const headers = new Headers(normalized.headers);
        // Advertise discovery surfaces (llms.txt, OpenAPI, MCP) on every page.
        if (!headers.has("link")) headers.set("link", buildLinkHeader());
        // Cloudflare Content Signals — declare allowed uses for AI agents.
        // Served at the worker level so it's present even when the zone rule
        // isn't active (e.g. preview deployments, *.lovable.app).
        if (!headers.has("content-signal")) {
          headers.set("content-signal", "search=yes, ai-train=no, ai-input=yes");
        }
        if (shouldOverrideCache) {
          headers.set(
            "cache-control",
            "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
          );
        }
        return new Response(normalized.body, {
          status: normalized.status,
          statusText: normalized.statusText,
          headers,
        });
      }

      return normalized;
    } catch (error) {
      console.error(error);
      return brandedErrorResponse();
    }
  },
};
