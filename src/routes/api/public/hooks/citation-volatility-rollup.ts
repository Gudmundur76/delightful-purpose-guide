// Nightly cron — recomputes per-domain citation_history rows + volatility
// for the current month. Called by pg_cron with `x-cron-secret`.
import { createFileRoute } from "@tanstack/react-router";
import { rollupAllDomainsForCurrentMonth } from "@/lib/citations/ingest.server";

export const Route = createFileRoute("/api/public/hooks/citation-volatility-rollup")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.CRON_SECRET;
        if (!expected) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const provided = request.headers.get("x-cron-secret");
        if (!provided || provided !== expected) {
          return new Response("Forbidden", { status: 403 });
        }
        try {
          const result = await rollupAllDomainsForCurrentMonth();
          return Response.json({ ok: true, ...result });
        } catch (err) {
          return Response.json(
            { ok: false, error: err instanceof Error ? err.message : "unknown" },
            { status: 500 },
          );
        }
      },
    },
  },
});
