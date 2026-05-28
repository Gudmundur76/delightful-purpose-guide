// RFC 9727 API Catalog — application/linkset+json
// Lets AI agents discover the public API's OpenAPI spec, docs and health endpoint.
import { createFileRoute } from "@tanstack/react-router";

const BASE = "https://grow.contact";

const linkset = {
  linkset: [
    {
      anchor: `${BASE}/api/public/v1/`,
      "service-desc": [
        {
          href: `${BASE}/api/public/v1/openapi.json`,
          type: "application/openapi+json",
        },
      ],
      "service-doc": [
        {
          href: `${BASE}/api-docs`,
          type: "text/html",
        },
      ],
      "service-meta": [
        {
          href: `${BASE}/api/public/v1/`,
          type: "application/json",
        },
      ],
      status: [
        {
          href: `${BASE}/api/public/v1/readiness`,
          type: "application/json",
        },
      ],
    },
    {
      anchor: `${BASE}/api/public/mcp`,
      "service-desc": [
        {
          href: `${BASE}/.well-known/mcp/server-card.json`,
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: `${BASE}/api-docs`,
          type: "text/html",
        },
      ],
      ],
    },
    {
      anchor: `${BASE}/api/public/oauth/token`,
      "service-desc": [
        {
          href: `${BASE}/.well-known/oauth-authorization-server`,
          type: "application/json",
        },
      ],
      "service-doc": [
        {
          href: `${BASE}/auth.md`,
          type: "text/markdown",
        },
      ],
    },
  ],
};

export const Route = createFileRoute("/.well-known/api-catalog")({
  server: {
    handlers: {
      GET: async () =>
        new Response(JSON.stringify(linkset, null, 2), {
          status: 200,
          headers: {
            "Content-Type": "application/linkset+json",
            "Cache-Control": "public, max-age=300, s-maxage=3600",
            "Access-Control-Allow-Origin": "*",
          },
        }),
    },
  },
});
