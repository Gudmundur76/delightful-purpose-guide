import { createFileRoute } from "@tanstack/react-router";
import { archiveStats } from "@/lib/seo/archives/q2-2026";

const PAYLOAD = JSON.stringify(archiveStats(), null, 2);

export const Route = createFileRoute("/data/q2-2026/stats.json")({
  server: {
    handlers: {
      GET: async () =>
        new Response(PAYLOAD, {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=31536000, immutable",
            "x-content-type-options": "nosniff",
          },
        }),
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
