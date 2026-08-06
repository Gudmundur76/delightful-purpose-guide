import { createFileRoute } from "@tanstack/react-router";
import { submitToIndexNow, sitemapUrls, INDEXNOW_HOST } from "@/lib/seo/indexnow";

/**
 * POST/GET /api/public/indexnow/resubmit
 *
 * Reads our own sitemap.xml and submits every URL to IndexNow. Safe to leave
 * public and to schedule (e.g. daily via pg_cron): it can only ask search
 * engines to re-crawl pages that already exist on grow.contact.
 */
async function run() {
  const urls = await sitemapUrls();
  if (urls.length === 0) {
    return new Response(JSON.stringify({ error: "Could not read sitemap.xml" }), {
      status: 502,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }
  const result = await submitToIndexNow(urls);
  return new Response(JSON.stringify({ host: INDEXNOW_HOST, count: result.submitted.length, ...result }, null, 2), {
    status: result.ok ? 200 : 502,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });
}

export const Route = createFileRoute("/api/public/indexnow/resubmit")({
  server: {
    handlers: {
      GET: async () => run(),
      POST: async () => run(),
    },
  },
});
