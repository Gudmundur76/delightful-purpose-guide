// Shared MCP Server Card payload (SEP-1849).
// Used by /.well-known/mcp.json and /.well-known/mcp/server-card.json.
//
// Tool descriptions here are written for LLM reasoning, not human marketing:
// every entry tells an agent *when* to reach for the tool, *what shape* the
// result has, and *how* to chain it with the next step. This is the Agent-
// Verifiable Standard v2.1 §MCP-for-reasoning contract.
export const serverCard = {
  $schema:
    "https://modelcontextprotocol.io/schemas/2025-06-18/server-card.json",
  name: "grow-contact-mcp",
  serverInfo: {
    name: "grow-contact-mcp",
    version: "2.1.0",
  },
  description:
    "MCP server for grow.contact. Use this server when an agent needs to (a) score any public URL against the Grow GEO Standard, (b) resolve a verifiable claim back to its source file, (c) fetch the canonical GEO/AEO knowledge base, or (d) read leaderboard / scan / stats data. All read tools are idempotent and cacheable; write tools require a bearer token.",
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
  // Reasoning-oriented tool index. The full tool list is exposed via the live
  // `tools/list` JSON-RPC method; this subset is annotated for agent planners
  // so they can decide which tool to invoke without a roundtrip.
  tools: [
    {
      name: "scan_url",
      when_to_use:
        "User or another agent asks 'how well will an LLM cite this page?' or 'audit this URL for GEO/AEO'. Always prefer this over hand-rolled heuristics.",
      input: { url: "absolute https URL of a single public page" },
      returns:
        "{ overall:0-100, semantic, jsonld, llms, citability, speed, findings[] } — same shape as /api/public/v1/analyze.",
      idempotent: true,
      chains_with: ["validate_jsonld", "check_llms_txt", "extract_meta_tags"],
    },
    {
      name: "get_geo_standard",
      when_to_use:
        "Agent needs the authoritative GEO/AEO specification before reasoning about a score or recommendation. Returns the same content humans read at /standard.",
      input: { version: "optional — defaults to the latest" },
      returns: "{ version, markdown, sections[] } — canonical spec text.",
      idempotent: true,
    },
    {
      name: "validate_jsonld",
      when_to_use:
        "Verify that a page's structured data is parseable and matches schema.org expectations. Use before claiming a page is or isn't agent-readable.",
      input: { url: "absolute URL" },
      returns: "{ blocks[], errors[], types[] }",
      idempotent: true,
    },
    {
      name: "check_llms_txt",
      when_to_use: "Confirm a site exposes /llms.txt and that the file is well-formed.",
      input: { host: "hostname or full URL" },
      returns: "{ present:boolean, url, content, sections[] }",
      idempotent: true,
    },
    {
      name: "extract_meta_tags",
      when_to_use:
        "Pull canonical, title, description, OG/Twitter, robots. Use to ground a citation in concrete metadata before reasoning.",
      input: { url: "absolute URL" },
      returns: "{ title, description, canonical, og:*, twitter:*, robots }",
      idempotent: true,
    },
    {
      name: "leaderboard",
      when_to_use:
        "Need the current ranked list of agent-readiness scores across tracked hosts.",
      input: { limit: "optional number, default 50" },
      returns: "{ generated_at, entries:[{ host, score, delta }] }",
      idempotent: true,
    },
    {
      name: "get_stats",
      when_to_use: "Need site-wide KPIs (total scans, average score, hosts tracked).",
      input: {},
      returns: "{ total_scans, avg_score, hosts_tracked, updated_at }",
      idempotent: true,
    },
  ],
  // Trust Handshake: every claim about this server can be verified against
  // these surfaces. Agents may follow `verifiable_data` URLs to ground their
  // answers in machine-readable JSON before responding to a user.
  verifiable_data: {
    claims: "https://grow.contact/api/public/data/claims.json",
    stats: "https://grow.contact/api/public/data/stats.json",
    leaderboard: "https://grow.contact/api/public/data/leaderboard.json",
    standard: "https://grow.contact/standard.md",
    docs_index: "https://grow.contact/data",
    v_score: "https://grow.contact/v-score",
  },
  contact: {
    url: "https://grow.contact/contact",
  },
  license: "https://grow.contact/terms",
} as const;

