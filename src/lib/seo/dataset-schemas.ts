// JSON Schema (Draft 2020-12) definitions for the public Verifiability Layer
// datasets. One schema per dataset shape; live and archive payloads both
// validate against the same schema (archive endpoints add `frozen` + `as_of`
// fields, which are documented here as optional).
//
// Served at:
//   /api/public/data/schemas/claims.schema.json
//   /api/public/data/schemas/stats.schema.json
//   /api/public/data/schemas/leaderboard.schema.json

export const SCHEMA_BASE = "https://citation.is/api/public/data/schemas";

export const CLAIMS_SCHEMA_URL = `${SCHEMA_BASE}/claims.schema.json`;
export const STATS_SCHEMA_URL = `${SCHEMA_BASE}/stats.schema.json`;
export const LEADERBOARD_SCHEMA_URL = `${SCHEMA_BASE}/leaderboard.schema.json`;

const COMMON_META = {
  generated_at: { type: "string", format: "date-time" },
  date_modified: { type: "string", format: "date" },
  standard: { type: "string", examples: ["geo-standard@2026.07"] },
  license: { type: "string", format: "uri" },
  attribution: { type: "string" },
  // Archive-only envelope fields — present on /data/q2-2026/*.json
  frozen: { type: "boolean" },
  as_of: { type: "string", format: "date" },
  archive: { type: "string", examples: ["q2-2026"] },
  live_url: { type: "string", format: "uri" },
  archive_q2_2026: { type: "string", format: "uri" },
} as const;

export const CLAIMS_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: CLAIMS_SCHEMA_URL,
  title: "citation.is verifiable claims registry",
  description:
    "Machine-readable registry of every visible statistic on citation.is. Each claim has a stable id matching an in-page anchor (e.g. #home-stat-83) and resolves to a source URL.",
  type: "object",
  required: ["standard", "license", "claims"],
  properties: {
    ...COMMON_META,
    docs: { type: "string", format: "uri" },
    count: { type: "integer", minimum: 0 },
    claims: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "value", "label", "source", "date_observed", "page_anchors"],
        properties: {
          id: {
            type: "string",
            pattern: "^[a-z0-9-]+$",
            description: "Stable fragment id; matches <VerifiabilityBadge id> on the page.",
          },
          value: { type: "string", description: "Rendered value, e.g. \"83%\" or \"4.3×\"." },
          label: { type: "string" },
          source: { type: "string" },
          source_url: { type: "string", format: "uri" },
          context: { type: "string" },
          date_observed: { type: "string", format: "date" },
          unit: {
            type: "string",
            enum: ["PERCENT", "RATIO", "COUNT", "CURRENCY_USD", "SECONDS", "DAYS"],
          },
          page_anchors: {
            type: "array",
            items: { type: "string", format: "uri" },
            minItems: 1,
          },
        },
        additionalProperties: false,
      },
    },
  },
  additionalProperties: true,
} as const;

export const STATS_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: STATS_SCHEMA_URL,
  title: "citation.is Agent Readability — headline stats",
  description:
    "Pre-computed citable statistics derived from the Agent Readability Leaderboard. Percentages are integers 0–100.",
  type: "object",
  required: ["standard", "license", "stats", "sample_size"],
  properties: {
    ...COMMON_META,
    methodology_url: { type: "string", format: "uri" },
    sample_size: { type: "integer", minimum: 0 },
    stats: {
      type: "object",
      required: [
        "total",
        "avg_score",
        "median_score",
        "agent_native_pct",
        "opaque_pct",
        "missing_llms_txt_pct",
        "weak_jsonld_pct",
        "weak_semantic_pct",
        "slow_pct",
        "category_averages",
        "top5",
        "bottom5",
        "citable_headlines",
      ],
      properties: {
        total: { type: "integer", minimum: 0 },
        avg_score: { type: "integer", minimum: 0, maximum: 100 },
        median_score: { type: "integer", minimum: 0, maximum: 100 },
        agent_native_pct: { type: "integer", minimum: 0, maximum: 100 },
        opaque_pct: { type: "integer", minimum: 0, maximum: 100 },
        missing_llms_txt_pct: { type: "integer", minimum: 0, maximum: 100 },
        weak_jsonld_pct: { type: "integer", minimum: 0, maximum: 100 },
        weak_semantic_pct: { type: "integer", minimum: 0, maximum: 100 },
        slow_pct: { type: "integer", minimum: 0, maximum: 100 },
        category_averages: {
          type: "array",
          items: {
            type: "object",
            required: ["category", "label", "avg", "count"],
            properties: {
              category: { type: "string", enum: ["infra", "models", "agents", "devtools"] },
              label: { type: "string" },
              avg: { type: "integer", minimum: 0, maximum: 100 },
              count: { type: "integer", minimum: 0 },
            },
            additionalProperties: false,
          },
        },
        top5: { type: "array", items: { $ref: "#/$defs/entryRef" }, maxItems: 5 },
        bottom5: { type: "array", items: { $ref: "#/$defs/entryRef" }, maxItems: 5 },
        citable_headlines: { type: "array", items: { type: "string" } },
      },
      additionalProperties: false,
    },
  },
  $defs: {
    entryRef: {
      type: "object",
      required: ["name", "domain", "score"],
      properties: {
        name: { type: "string" },
        domain: { type: "string" },
        score: { type: "integer", minimum: 0, maximum: 100 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: true,
} as const;

export const LEADERBOARD_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: LEADERBOARD_SCHEMA_URL,
  title: "citation.is Agent Readability Leaderboard",
  description:
    "Ranked list of AI companies scored on the geo-standard signals: semantic HTML, JSON-LD, llms.txt, citability, and first-byte speed.",
  type: "object",
  required: ["standard", "license", "entries", "counts"],
  properties: {
    ...COMMON_META,
    methodology_url: { type: "string", format: "uri" },
    headline_stats: { type: "object" },
    categories: {
      type: "object",
      patternProperties: {
        "^(infra|models|agents|devtools)$": { type: "string" },
      },
      additionalProperties: false,
    },
    counts: {
      type: "object",
      required: ["total"],
      properties: {
        total: { type: "integer", minimum: 0 },
        returned: { type: "integer", minimum: 0 },
        infra: { type: "integer", minimum: 0 },
        models: { type: "integer", minimum: 0 },
        agents: { type: "integer", minimum: 0 },
        devtools: { type: "integer", minimum: 0 },
      },
      additionalProperties: true,
    },
    entries: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "domain", "category", "score", "signals"],
        properties: {
          rank: { type: "integer", minimum: 1 },
          name: { type: "string" },
          domain: { type: "string" },
          category: { type: "string", enum: ["infra", "models", "agents", "devtools"] },
          score: { type: "integer", minimum: 0, maximum: 100 },
          signals: {
            type: "object",
            required: ["semantic", "json_ld", "llms_txt", "citability", "speed"],
            properties: {
              semantic: { type: "integer", minimum: 0, maximum: 25 },
              json_ld: { type: "integer", minimum: 0, maximum: 20 },
              llms_txt: { type: "integer", minimum: 0, maximum: 15 },
              citability: { type: "integer", minimum: 0, maximum: 20 },
              speed: { type: "integer", minimum: 0, maximum: 20 },
            },
            additionalProperties: false,
          },
          verify_url: { type: "string", format: "uri" },
          badge_url: { type: "string", format: "uri" },
        },
        additionalProperties: true,
      },
    },
  },
  additionalProperties: true,
} as const;

export const SCHEMA_REGISTRY = {
  claims: {
    url: CLAIMS_SCHEMA_URL,
    schema: CLAIMS_SCHEMA,
    title: "Verifiable claims registry",
  },
  stats: {
    url: STATS_SCHEMA_URL,
    schema: STATS_SCHEMA,
    title: "Headline stats",
  },
  leaderboard: {
    url: LEADERBOARD_SCHEMA_URL,
    schema: LEADERBOARD_SCHEMA,
    title: "Agent Readability Leaderboard",
  },
} as const;

export function schemaResponse(schema: object): Response {
  return new Response(JSON.stringify(schema, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/schema+json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
    },
  });
}
