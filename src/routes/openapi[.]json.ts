import { createFileRoute } from "@tanstack/react-router";

// Convention alias: agents probe /openapi.json at the site root.
// Redirect to the versioned spec.
export const Route = createFileRoute("/openapi.json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        return Response.redirect(`${url.origin}/api/public/v1/openapi.json`, 308);
      },
    },
  },
});
