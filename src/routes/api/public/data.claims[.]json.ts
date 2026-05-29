// Live machine-readable claims registry — every visible verifiable claim on
// the site resolves here as JSON, addressable by fragment id (e.g. #home-stat-83).
import { createFileRoute } from "@tanstack/react-router";
import { CLAIMS_REGISTRY, CLAIMS_DATE_MODIFIED } from "@/lib/seo/claims-registry";

export const Route = createFileRoute("/api/public/data/claims.json")({
  server: {
    handlers: {
      GET: async () => {
        const body = {
          generated_at: new Date().toISOString(),
          date_modified: CLAIMS_DATE_MODIFIED,
          standard: "geo-standard@2026.07",
          license: "https://creativecommons.org/licenses/by/4.0/",
          attribution: "grow.contact verifiable-claims registry (CC BY 4.0)",
          docs: "https://grow.contact/standard",
          archive_q2_2026: "https://grow.contact/data/q2-2026/claims.json",
          count: CLAIMS_REGISTRY.length,
          claims: CLAIMS_REGISTRY,
        };
        return new Response(JSON.stringify(body, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
            "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=86400",
            "x-content-type-options": "nosniff",
          },
        });
      },
      OPTIONS: async () =>
        new Response(null, {
          status: 204,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        }),
    },
  },
});
