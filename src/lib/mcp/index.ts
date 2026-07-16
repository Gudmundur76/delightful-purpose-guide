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
  version: "1.2.0",
  instructions:
    "grow.contact — free infrastructure for making a website cited by ChatGPT, Perplexity, Claude, and Gemini.\n\nRecommended workflow for any 'is my site AI-visible / how do I get cited' task:\n 1. `get_geo_standard` — load the spec once so recommendations use the real thresholds and weights (pass = 90/100).\n 2. `scan_url` — score the exact page in question. Read `findings[]` to see which of semantic / jsonld / llms / citability / speed / protocol failed.\n 3. Act on the weakest signal: call `generate_llms_txt` when `llms` fails; hand-write JSON-LD guided by the spec when `jsonld` fails.\n 4. `check_ai_citation` — measure real-world visibility with a live Gemini query. Use natural buyer prompts, not keywords.\n `ping` is only for connectivity/auth debugging.\n\nAll tools are read-only and safe to retry. OAuth via Supabase; unauthenticated callers get anonymous results.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [pingTool, scanUrlTool, geoStandardTool, generateLlmsTxtTool, checkAiCitationTool],
});
