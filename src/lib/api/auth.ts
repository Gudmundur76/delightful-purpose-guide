// Shared API key auth + CORS helpers for /api/public/v1/* endpoints.

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-API-Key",
  "Access-Control-Max-Age": "86400",
} as const;

export const JSON_HEADERS = {
  "Content-Type": "application/json",
  ...CORS_HEADERS,
};

export function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export function optionsResponse(): Response {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// Constant-time-ish string compare.
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/**
 * Verify the request carries a valid API key.
 * Accepts either `X-API-Key: <key>` or `Authorization: Bearer <key>`.
 * Returns null on success, or a Response (401/500) to short-circuit the handler.
 */
export function requireApiKey(request: Request): Response | null {
  const expected = process.env.PUBLIC_API_KEY;
  if (!expected) {
    console.error("[auth] PUBLIC_API_KEY environment variable is not configured");
    return jsonResponse({ error: "Internal server error" }, 500);
  }
  const headerKey = request.headers.get("x-api-key");
  const auth = request.headers.get("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : undefined;
  const provided = headerKey || bearer;
  if (!provided || !safeEqual(provided, expected)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  return null;
}

/**
 * Verify the request carries the privileged admin API key.
 * This key MUST be distinct from PUBLIC_API_KEY and is only granted to
 * internal/trusted tooling that needs full CRUD on internal infrastructure
 * tables. Never share it with external API consumers.
 */
export function requireAdminApiKey(request: Request): Response | null {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected) {
    console.error("[auth] ADMIN_API_KEY environment variable is not configured");
    return jsonResponse({ error: "Internal server error" }, 500);
  }
  const headerKey = request.headers.get("x-admin-api-key");
  const auth = request.headers.get("authorization");
  const bearer = auth?.toLowerCase().startsWith("bearer ")
    ? auth.slice(7).trim()
    : undefined;
  const provided = headerKey || bearer;
  if (!provided || !safeEqual(provided, expected)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }
  return null;
}
