import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Permanent redirect to the canonical feed location.
        return new Response(null, {
          status: 301,
          headers: { Location: "/blog/rss.xml" },
        });
      },
    },
  },
  // Should never be reached client-side; just in case.
  beforeLoad: () => {
    throw redirect({ to: "/blog" });
  },
});
