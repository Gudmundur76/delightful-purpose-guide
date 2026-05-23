import { createFileRoute } from "@tanstack/react-router";
import { getOverviewStats } from "@/lib/check/stats.functions";

export const Route = createFileRoute("/api/public/stats/overview")({
  server: {
    handlers: {
      GET: async () => {
        const stats = await getOverviewStats();
        return Response.json(stats, {
          headers: {
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
