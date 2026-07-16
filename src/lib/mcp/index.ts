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
  version: "1.1.0",
  instructions:
    "grow.contact — free infrastructure for AI search visibility. Tools: `ping` (connectivity), `scan_url` (score any URL against the Grow GEO Standard), `get_geo_standard` (fetch the canonical build spec), `generate_llms_txt` (build a spec-compliant llms.txt from any sitemap), `check_ai_citation` (measure whether a domain is cited by Gemini for a real query). All read-only. OAuth via Supabase.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [pingTool, scanUrlTool, geoStandardTool, generateLlmsTxtTool, checkAiCitationTool],
});
