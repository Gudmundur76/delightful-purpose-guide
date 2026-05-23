// THE SPEED FIX. Patch into src/server.ts inside the fetch handler,
// AFTER you get the SSR response and BEFORE returning it.
//
// Without this, TanStack ships `cache-control: no-cache` and every request
// pays full SSR cost. With this, Cloudflare edge-caches the homepage HTML
// (and any other GET HTML you opt in) at sub-100ms TTFB. Required to score
// 100/100 on /check Speed.

// Inside: async fetch(request, env, ctx) { ... }
// After: const response = await handler.fetch(request, env, ctx);
// (or your equivalent normalized response)

if (request.method === "GET" && response.status === 200) {
  const url = new URL(request.url);
  const ct = response.headers.get("content-type") ?? "";

  // Cache the homepage. Add more pathnames here as needed
  // (pricing, marketing pages — anything that's not user-specific).
  const cacheable = url.pathname === "/";

  if (cacheable && ct.includes("text/html")) {
    const headers = new Headers(response.headers);
    headers.set(
      "cache-control",
      "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
    );
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

return response;

// Notes:
// - max-age=0           → browsers always revalidate
// - s-maxage=300        → Cloudflare serves cached HTML for 5 min
// - stale-while-revalidate=600 → serve stale up to 10 more min while refreshing
// - NEVER cache authenticated routes. Only public, anonymous HTML.
// - The override must run regardless of what cache-control TanStack already set.
