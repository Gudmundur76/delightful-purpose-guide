// Shared MCP Server Card payload (SEP-1849).
// Used by /.well-known/mcp.json and /.well-known/mcp/server-card.json.
export const serverCard = {
  $schema:
    "https://modelcontextprotocol.io/schemas/2025-06-18/server-card.json",
  name: "grow-contact-mcp",
  serverInfo: {
    name: "grow-contact-mcp",
    version: "2.0.0",
  },
  description:
    "MCP server for grow.contact — 90+ tools for site editing, GEO scoring against the Grow GEO Standard, lead/CRM admin, blog & FAQ admin, AI content generation, scan trends, and analytics.",
  vendor: {
    name: "grow.contact",
    url: "https://grow.contact",
  },
  documentation: "https://grow.contact/api-docs",
  transport: {
    type: "streamable-http",
    endpoint: "https://grow.contact/api/public/mcp",
    methods: ["POST"],
  },
  endpoints: [
    {
      protocol: "mcp-streamable-http",
      url: "https://grow.contact/api/public/mcp",
    },
  ],
  capabilities: {
    tools: true,
    resources: false,
    prompts: false,
  },
  auth: {
    type: "bearer",
    header: "Authorization",
    scheme: "Bearer",
    description:
      "Request an MCP token via https://grow.contact/contact. Tokens are scoped per-integration.",
  },
  authentication: {
    type: "bearer",
    header: "Authorization",
    scheme: "Bearer",
    description:
      "Request an MCP token via https://grow.contact/contact. Tokens are scoped per-integration.",
  },
  contact: {
    url: "https://grow.contact/contact",
  },
  license: "https://grow.contact/terms",
} as const;
