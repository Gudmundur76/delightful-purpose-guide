import { auth, defineMcp } from "@lovable.dev/mcp-js";
import pingTool from "./tools/ping.mcp";
import scanUrlTool from "./tools/scan-url.mcp";

// The OAuth issuer MUST be the direct Supabase host, not the .lovable.cloud
// proxy — mcp-js verifies against the issuer's OpenID discovery document.
// VITE_SUPABASE_PROJECT_ID is inlined by Vite at build; the fallback keeps the
// URL well-formed during the manifest-extract eval.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "grow-contact-mcp",
  title: "citation.is MCP",
  version: "1.0.0",
  instructions:
    "citation.is's OAuth-protected MCP server. Use `ping` to verify connectivity and `scan_url` to run a live GEO readiness scan on any URL. More tools will be added as this server grows.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [pingTool, scanUrlTool],
});
