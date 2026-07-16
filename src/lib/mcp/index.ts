import { auth, defineMcp } from "@lovable.dev/mcp-js";
import pingTool from "./tools/ping.mcp";
import scanUrlTool from "./tools/scan-url.mcp";
import geoStandardTool from "./tools/geo-standard.mcp";
import generateLlmsTxtTool from "./tools/generate-llms-txt.mcp";
import checkAiCitationTool from "./tools/check-ai-citation.mcp";

// The OAuth issuer MUST be the direct Supabase host, not the .lovable.cloud
// proxy — mcp-js verifies against the issuer's OpenID discovery document.
// VITE_SUPABASE_PROJECT_ID is inlined by Vite at build; the fallback keeps the
// URL well-formed during the manifest-extract eval.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "grow-contact-mcp",
  title: "grow.contact MCP",
  version: "1.0.0",
  instructions:
    "grow.contact's OAuth-protected MCP server. Use `ping` to verify connectivity and `scan_url` to run a live GEO readiness scan on any URL. More tools will be added as this server grows.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [pingTool, scanUrlTool],
});
