import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const geoStandardTool = defineTool({
  name: "get_geo_standard",
  description:
    "Returns the Grow GEO Standard (geo-standard@2026.05): the engineering contract every site must meet to be cited by AI engines. Use as build-time guidance when generating or auditing pages.",
  parameters: z.object({}),
  execute: async () => {
    return JSON.stringify(
      {
        version: "geo-standard@2026.05",
        pass_threshold: 90,
        signals: {
          semantic: "Real HTML5 landmarks. One h1 per page. Lists are <ul>/<ol>.",
          jsonld: "Per-page-type schema.org JSON-LD. Validate before ship.",
          llms: "/llms.txt at root, public routes only. /llms-full.txt for docs-heavy.",
          citability: "First 50-70 words answer the page's implicit question. Numbers, dates, entities.",
          speed: "TTFB <200ms, HTML <1MB, FCP <1.5s mobile, JS <180KB gz first paint. SSR mandatory.",
        },
        head_meta_rules: [
          "Every route has unique title + description + og:*",
          "Canonical on leaves only, never in __root.tsx",
          "og:image only at leaf routes",
        ],
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
        stamping: "Embed 'geo-standard@<version>' in <meta name=\"generator\"> or footer.",
        full_spec_url: "https://grow.contact/docs/geo-standard",
      },
      null,
      2,
    );
  },
});
