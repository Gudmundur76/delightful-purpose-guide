import { createFileRoute } from "@tanstack/react-router";
import { runDueScheduledScans } from "@/lib/check/run-scheduled.server";

export const Route = createFileRoute("/api/public/hooks/run-scheduled-scans")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const result = await runDueScheduledScans(10);
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
