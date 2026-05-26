import { createFileRoute } from "@tanstack/react-router";
import { getOverviewStats } from "@/lib/check/stats.functions";

export const Route = createFileRoute("/api/public/stats/overview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const days = Math.min(365, Math.max(1, Number(url.searchParams.get("days") ?? 7)));
        const stats = await getOverviewStats({ data: { days } });
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
