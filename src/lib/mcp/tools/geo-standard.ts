import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const geoStandardTool = defineTool({
  name: "get_geo_standard",
  description:
    "Returns the Grow GEO Standard (geo-standard@2026.07): the engineering contract every site must meet to be cited by AI engines. Use as build-time guidance when generating or auditing pages.",
  parameters: z.object({}),
  execute: async () => {
    return JSON.stringify(
    {
        version: "geo-standard@2026.07",
        pass_threshold: 90,
        weights: { semantic: 0.20, jsonld: 0.20, llms: 0.15, citability: 0.15, speed: 0.15, protocol: 0.15 },
        signals: {
          semantic: "Real HTML5 landmarks. One h1 per page. Lists are <ul>/<ol>.",
          jsonld: "Per-page-type schema.org JSON-LD. Validate before ship.",
          llms: "/llms.txt at root, public routes only. /llms-full.txt for docs-heavy.",
          citability: "First 50-70 words answer the page's implicit question. Numbers, dates, entities.",
          speed: "TTFB <200ms, HTML <1MB, FCP <1.5s mobile, JS <180KB gz first paint. SSR mandatory.",
          protocol: "Agent-native discovery surfaces: Link header (rel=llms/mcp/api-catalog), /.well-known/mcp.json server card, Accept: text/markdown content negotiation, Cloudflare Content-Signal in robots.txt.",
          agent_auth: "Optional bonus (0-100). Checks /auth.md, /.well-known/oauth-protected-resource (RFC 9728), /.well-known/oauth-authorization-server agent_auth block with register_uri, identity_types_supported, credential_types_supported, claim_uri, revocation_uri. Does not affect weighted overall score.",
        },
        bonus_dimensions: {
          agent_auth: {
            weight_in_overall: 0,
            description: "Agent authentication readiness — RFC 9728 OAuth metadata + /auth.md. Reported separately; does not penalize overall.",
            scoring: {
              auth_md: 25,
              oauth_protected_resource: 25,
              oauth_authorization_server_agent_auth_block: 30,
              link_headers: 10,
              uri_reachability: 10,
            },
          },
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
