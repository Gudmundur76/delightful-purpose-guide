import { createFileRoute } from "@tanstack/react-router";

// Routes worth keeping warm at the edge. Hitting them every 5 minutes
// ensures the Cloudflare Worker has a hot isolate and the edge cache
// holds a fresh entry — important because AI crawlers (PerplexityBot,
// OAI-SearchBot, ClaudeBot) time out at 1.5–3s on cold starts.
const WARM_URLS = [
  "/",
  "/services",
  "/pricing",
  "/check",
  "/leaderboard",
  "/blog",
  "/faq",
  "/vs",
];

export const Route = createFileRoute("/api/public/hooks/warm")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const results = await Promise.all(
          WARM_URLS.map(async (path) => {
            const t0 = Date.now();
            try {
              const r = await fetch(`${origin}${path}`, {
                headers: { "user-agent": "grow-warmer/1.0" },
                redirect: "manual",
              });
              return { path, status: r.status, ms: Date.now() - t0 };
            } catch (e) {
              return {
                path,
                status: 0,
                ms: Date.now() - t0,
                error: e instanceof Error ? e.message : String(e),
              };
            }
          }),
        );
        return Response.json({
          ok: true,
          warmed: results.length,
          results,
          at: new Date().toISOString(),
        });
      },
      GET: async ({ request }) => {
        // Allow health-check GETs without warming.
        const origin = new URL(request.url).origin;
        return Response.json({ ok: true, origin, paths: WARM_URLS });
      },
    },
  },
});
