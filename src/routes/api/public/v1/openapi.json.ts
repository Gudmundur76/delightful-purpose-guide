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
  },
} as const;

export const Route = createFileRoute("/api/public/v1/openapi/json")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () => jsonResponse(spec),
    },
  },
});
