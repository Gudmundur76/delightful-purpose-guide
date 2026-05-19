import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, optionsResponse } from "@/lib/api/auth";

export const Route = createFileRoute("/api/public/v1/")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () =>
        jsonResponse({
          name: "Grow Public API",
          version: "v1",
          auth: "Send `X-API-Key: <your key>` header (or `Authorization: Bearer <key>`).",
          docs: {
            openapi: "/api/public/v1/openapi.json",
            swaggerUi: "/api/public/v1/docs",
          },
          endpoints: [
            { method: "GET", path: "/api/public/v1/openapi.json", description: "OpenAPI 3.1 spec (paste into Postman/Insomnia)" },
            { method: "GET", path: "/api/public/v1/docs", description: "Interactive Swagger UI" },
            { method: "GET", path: "/api/public/v1/posts", description: "List all journal posts" },
            { method: "GET", path: "/api/public/v1/posts/:slug", description: "Fetch a single post by slug" },
            { method: "GET", path: "/api/public/v1/leads?limit=50", description: "List recent leads (most recent first)" },
            { method: "POST", path: "/api/public/v1/leads", description: "Create a lead. Body: { name, email, budget_tier, message }" },
          ],
        }),
    },
  },
});
