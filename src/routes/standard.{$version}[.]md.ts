import { createFileRoute } from "@tanstack/react-router";
import { getStandardVersion } from "@/lib/standard/data";

// Versioned, immutable raw markdown of a Standard release. Once
// published, the content at this URL never changes — that's the whole
// point of versioning a citable spec.

export const Route = createFileRoute("/standard/{$version}.md")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const version = getStandardVersion(params.version);
        if (!version) {
          return new Response("Not Found", { status: 404 });
        }
        return new Response(version.markdown, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            // Immutable: versioned URLs never change.
            "Cache-Control": "public, max-age=31536000, immutable",
            "X-Standard-Version": version.buildId,
            "Link": `<https://grow.contact/standard/${version.slug}>; rel="canonical", <https://creativecommons.org/licenses/by/4.0/>; rel="license"`,
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
