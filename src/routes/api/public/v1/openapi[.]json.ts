import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, optionsResponse } from "@/lib/api/auth";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "Grow Public API",
    version: "1.0.0",
    description:
      "Read/write REST API for grow.contact journal posts and leads. All endpoints require an API key.",
  },
  servers: [{ url: "https://grow.contact/api/public/v1" }],
  security: [{ ApiKeyAuth: [] }, { BearerAuth: [] }],
  components: {
    securitySchemes: {
      ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
      BearerAuth: { type: "http", scheme: "bearer" },
    },
    schemas: {
      Post: {
        type: "object",
        properties: {
          slug: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          publishedAt: { type: "string", format: "date-time" },
          readingMinutes: { type: "integer" },
          tags: { type: "array", items: { type: "string" } },
          url: { type: "string", format: "uri" },
        },
      },
      Lead: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          budget_tier: { type: "string" },
          message: { type: "string" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      LeadInput: {
        type: "object",
        required: ["name", "email", "budget_tier", "message"],
        properties: {
          name: { type: "string", minLength: 1, maxLength: 100 },
          email: { type: "string", format: "email", maxLength: 255 },
          budget_tier: { type: "string", minLength: 1, maxLength: 50 },
          message: { type: "string", minLength: 1, maxLength: 2000 },
        },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
  paths: {
    "/": {
      get: {
        summary: "API self-documentation",
        security: [],
        responses: { "200": { description: "API info" } },
      },
    },
    "/posts": {
      get: {
        summary: "List journal posts",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    count: { type: "integer" },
                    posts: { type: "array", items: { $ref: "#/components/schemas/Post" } },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/posts/{slug}": {
      get: {
        summary: "Get a single post by slug",
        parameters: [
          { name: "slug", in: "path", required: true, schema: { type: "string" } },
        ],
        responses: {
          "200": { description: "OK", content: { "application/json": { schema: { $ref: "#/components/schemas/Post" } } } },
          "404": { description: "Not found", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/leads": {
      get: {
        summary: "List recent leads",
        parameters: [
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 200, default: 50 } },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    count: { type: "integer" },
                    leads: { type: "array", items: { $ref: "#/components/schemas/Lead" } },
                  },
                },
              },
            },
          },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
      post: {
        summary: "Create a lead",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LeadInput" } } },
        },
        responses: {
          "201": { description: "Created", content: { "application/json": { schema: { type: "object", properties: { lead: { $ref: "#/components/schemas/Lead" } } } } } },
          "400": { description: "Invalid input", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "401": { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
        },
      },
    },
    "/admin/{table}": {
      parameters: [
        { name: "table", in: "path", required: true, schema: { type: "string", enum: ["leads", "email_send_log", "email_send_state", "email_unsubscribe_tokens", "suppressed_emails"] } },
      ],
      get: {
        summary: "List rows from a whitelisted table (PostgREST-style filters)",
        description: "Filters: col=eq.value, neq, gt, gte, lt, lte, like, ilike, is.null, in.(a,b,c). Reserved: select, limit, offset, order=col.desc",
        parameters: [
          { name: "select", in: "query", schema: { type: "string", default: "*" } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 1000, default: 100 } },
          { name: "offset", in: "query", schema: { type: "integer", minimum: 0, default: 0 } },
          { name: "order", in: "query", schema: { type: "string", example: "created_at.desc" } },
        ],
        responses: { "200": { description: "OK" }, "401": { description: "Unauthorized" }, "403": { description: "Table not allowed" } },
      },
      post: {
        summary: "Insert one or many rows",
        requestBody: { required: true, content: { "application/json": { schema: { oneOf: [{ type: "object" }, { type: "array", items: { type: "object" } }] } } } },
        responses: { "201": { description: "Created" }, "400": { description: "Invalid" }, "401": { description: "Unauthorized" }, "403": { description: "Table not allowed" } },
      },
      patch: {
        summary: "Update rows matching a filter",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["match", "values"], properties: { match: { type: "object" }, values: { type: "object" } } } } } },
        responses: { "200": { description: "OK" }, "400": { description: "Invalid" }, "401": { description: "Unauthorized" }, "403": { description: "Table not allowed" } },
      },
      delete: {
        summary: "Delete rows matching a filter",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["match"], properties: { match: { type: "object" } } } } } },
        responses: { "200": { description: "OK" }, "400": { description: "Invalid" }, "401": { description: "Unauthorized" }, "403": { description: "Table not allowed" } },
      },
    },
  },
} as const;

export const Route = createFileRoute("/api/public/v1/openapi.json")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () => jsonResponse(spec),
    },
  },
});
