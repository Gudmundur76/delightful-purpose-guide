import { createFileRoute } from "@tanstack/react-router";
import { getCurrentStandard } from "@/lib/standard/data";

// Raw markdown of the CURRENT standard version. Stable, citable URL —
// /standard.md always points at the latest published spec. Versioned
// permalinks live at /standard/<version>.md.

export const Route = createFileRoute("/standard.md")({
  server: {
    handlers: {
      GET: async () => {
        const current = getCurrentStandard();
        return new Response(current.markdown, {
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
            "X-Standard-Version": current.buildId,
            "Link": `<https://grow.contact/standard/${current.slug}>; rel="canonical", <https://creativecommons.org/licenses/by/4.0/>; rel="license"`,
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
