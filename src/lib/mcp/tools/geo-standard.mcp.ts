import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Canonical Grow GEO Standard — build-time spec for agent-cited websites.
export default defineTool({
  name: "get_geo_standard",
  title: "Fetch the Grow GEO Standard spec",
  description:
    "When to use: BEFORE recommending fixes, explaining a `scan_url` score, or writing robots.txt / llms.txt / JSON-LD for a site that should be cited by ChatGPT, Perplexity, Claude, or Gemini. This is the authoritative contract — do not invent thresholds or bot rules from memory. No input. Returns: `{ version, pass_threshold: 90, weights, signals, robots_rules (allow-list of citation bots, opt-in block-list of training-only bots), preflight checklist, full_spec_url }`. Idempotent, cacheable per session — call once per task, then reuse.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const spec = {
      version: "geo-standard@2026.07",
      pass_threshold: 90,
      weights: { semantic: 0.2, jsonld: 0.2, llms: 0.15, citability: 0.15, speed: 0.15, protocol: 0.15 },
      signals: {
        semantic: "Real HTML5 landmarks. One h1 per page. Lists are <ul>/<ol>.",
        jsonld: "Per-page-type schema.org JSON-LD. Validate before ship.",
        llms: "/llms.txt at root, public routes only. /llms-full.txt for docs-heavy sites.",
        citability: "First 50-70 words answer the page's implicit question. Numbers, dates, entities.",
        speed: "TTFB <200ms, HTML <1MB, FCP <1.5s mobile, JS <180KB gz first paint. SSR mandatory.",
        protocol:
          "Agent-native discovery: Link header (rel=llms/mcp/api-catalog), /.well-known/mcp.json server card, /.well-known/agent-card.json, Accept: text/markdown negotiation, Content-Signal in robots.txt.",
      },
      robots_rules: {
        allow_search_and_citation: ["Googlebot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot", "bingbot", "FacebookBot"],
        block_only_if_opted_out_of_training: ["GPTBot", "Google-Extended", "anthropic-ai", "Meta-ExternalAgent", "CCBot"],
      },
      preflight: [
        "robots.txt not blocking citation bots",
        "No WAF challenge to bot UAs",
        "curl -A 'GPTBot' returns 200",
        "JS-disabled HTML still contains core content",
      ],
      full_spec_url: "https://grow.contact/docs/geo-standard",
    };
    return {
      content: [{ type: "text", text: JSON.stringify(spec, null, 2) }],
      structuredContent: spec,
    };
  },
});
