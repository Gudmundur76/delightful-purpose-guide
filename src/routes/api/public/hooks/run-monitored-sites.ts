import { createFileRoute } from "@tanstack/react-router";
import { runDueMonitoredSites } from "@/lib/monitoring/run-monitor.server";

export const Route = createFileRoute("/api/public/hooks/run-monitored-sites")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Accept the anon publishable key (cron pattern) OR CRON_SECRET.
        const provided =
          request.headers.get("apikey") ??
          request.headers.get("x-cron-secret") ??
          "";
        const expected = [
          process.env.SUPABASE_PUBLISHABLE_KEY,
          process.env.CRON_SECRET,
        ].filter(Boolean) as string[];
        if (!expected.includes(provided)) {
          return new Response("Unauthorized", { status: 401 });
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
