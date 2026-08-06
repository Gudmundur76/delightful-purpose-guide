import { createFileRoute } from "@tanstack/react-router";
import { submitToIndexNow, INDEXNOW_KEY_LOCATION, INDEXNOW_HOST } from "@/lib/seo/indexnow";

/**
 * POST /api/public/indexnow  { "urls": ["https://grow.contact/blog/x"] }
 * GET  /api/public/indexnow?url=https://grow.contact/blog/x
 *
 * Only URLs on grow.contact are accepted, so this is safe to leave public:
 * a caller can at most ask search engines to re-crawl our own pages.
 */
async function handle(urls: string[]) {
  const result = await submitToIndexNow(urls);
  return new Response(JSON.stringify({ host: INDEXNOW_HOST, keyLocation: INDEXNOW_KEY_LOCATION, ...result }, null, 2), {
    status: result.ok ? 200 : result.status === 400 ? 400 : 502,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/indexnow")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const list = url.searchParams.getAll("url");
        return handle(list);
      },
      POST: async ({ request }) => {
        let urls: string[] = [];
        try {
          const body = (await request.json()) as { urls?: unknown; url?: unknown };
          if (Array.isArray(body.urls)) urls = body.urls.filter((u): u is string => typeof u === "string");
          else if (typeof body.url === "string") urls = [body.url];
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }
        return handle(urls);
      },
    },
  },
});
