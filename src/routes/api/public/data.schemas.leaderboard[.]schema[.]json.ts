import { createFileRoute } from "@tanstack/react-router";
import { LEADERBOARD_SCHEMA, schemaResponse } from "@/lib/seo/dataset-schemas";

export const Route = createFileRoute("/api/public/data/schemas/leaderboard.schema.json")({
  server: {
    handlers: {
      GET: async () => schemaResponse(LEADERBOARD_SCHEMA),
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }),
    },
  },
});
