import { createFileRoute } from "@tanstack/react-router";
import { buildFactGraph, triplesToMarkdown } from "@/lib/akn.server";

export const Route = createFileRoute("/api/public/v1/context")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const format = url.searchParams.get("format");
        const triples = await buildFactGraph();

        if (format === "json") {
          return Response.json(
            {
              "@context": {
                akn: "https://grow.contact/standard#",
                schema: "https://schema.org/",
                rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
              },
              generated_at: new Date().toISOString(),
              triples,
            },
            {
              headers: {
                "Cache-Control": "public, max-age=60, s-maxage=60",
                "Access-Control-Allow-Origin": "*",
                "X-AKN-Version": "4.0",
              },
            },
          );
        }

        const md = triplesToMarkdown(triples);
        return new Response(md, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=60, s-maxage=60",
            "Access-Control-Allow-Origin": "*",
            "X-AKN-Version": "4.0",
          },
        });
      },
    },
  },
});
