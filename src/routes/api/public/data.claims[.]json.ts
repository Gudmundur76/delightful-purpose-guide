// Live machine-readable claims registry — every visible verifiable claim on
// the site resolves here as JSON, addressable by fragment id (e.g. #home-stat-83).
import { createFileRoute } from "@tanstack/react-router";
import { CLAIMS_REGISTRY, CLAIMS_DATE_MODIFIED, withSameAs } from "@/lib/seo/claims-registry";
import { CLAIMS_SCHEMA_URL } from "@/lib/seo/dataset-schemas";
import { GITHUB_REPO_URL, BUILD_REF } from "@/lib/seo/trust-handshake";

export const Route = createFileRoute("/api/public/data/claims.json")({
  server: {
    handlers: {
      GET: async () => {
        const claims = CLAIMS_REGISTRY.map(withSameAs);
        const body = {
          $schema: CLAIMS_SCHEMA_URL,
          generated_at: new Date().toISOString(),
          date_modified: CLAIMS_DATE_MODIFIED,
          standard: "agent-verifiable-standard@2.1",
          license: "https://creativecommons.org/licenses/by/4.0/",
          attribution: "grow.contact verifiable-claims registry (CC BY 4.0)",
          docs: "https://grow.contact/data",
          archive_q2_2026: "https://grow.contact/data/q2-2026/claims.json",
          trust_handshake: {
            repository: GITHUB_REPO_URL,
            build_ref: BUILD_REF,
            description:
              "Every claim's `source_files` resolves to `same_as` GitHub blob URLs at this ref. Web → JSON-LD → Source loop is verifiable.",
          },
          count: CLAIMS_REGISTRY.length,
          claims,
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
