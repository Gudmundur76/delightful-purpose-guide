import { createFileRoute } from "@tanstack/react-router";
import { runDueMonitoredSites } from "@/lib/monitoring/run-monitor.server";

export const Route = createFileRoute("/api/public/hooks/run-monitored-sites")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.CRON_SECRET;
        if (!expected) {
          return new Response("Server misconfigured", { status: 500 });
        }
        const provided =
          request.headers.get("x-cron-secret") ??
          request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
          "";
        if (provided !== expected) {
          return new Response("Forbidden", { status: 403 });
        }
        try {
          const result = await runDueMonitoredSites(25);
          return Response.json({ success: true, ...result });
        } catch (e) {
          return Response.json(
            { success: false, error: (e as Error).message },
            { status: 500 },
          );
        }
      },
    },
  },
});
