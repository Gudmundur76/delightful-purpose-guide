import { auth, defineMcp } from "@lovable.dev/mcp-js";
import pingTool from "./tools/ping.mcp";
import scanUrlTool from "./tools/scan-url.mcp";
import geoStandardTool from "./tools/geo-standard.mcp";
import generateLlmsTxtTool from "./tools/generate-llms-txt.mcp";
import checkAiCitationTool from "./tools/check-ai-citation.mcp";
import autoFixSchemaTool from "./tools/auto-fix-schema.mcp";
import autoFixLlmsTxtTool from "./tools/auto-fix-llms-txt.mcp";
import autoFixRobotsTxtTool from "./tools/auto-fix-robots-txt.mcp";
import {
  listPendingInterventionsTool,
  approveInterventionTool,
  rejectInterventionTool,
} from "./tools/interventions.mcp";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "grow-contact-mcp",
  title: "grow.contact MCP",
  version: "1.3.0",
  instructions:
    "grow.contact — free infrastructure for making a website cited by ChatGPT, Perplexity, Claude, and Gemini.\n\nRead tools (no login needed for `ping`):\n • `get_geo_standard` — canonical thresholds & weights. Load once per task.\n • `scan_url` — score a live page against the standard.\n • `generate_llms_txt` — preview an llms.txt for any site (no persistence).\n • `check_ai_citation` — live Gemini visibility check.\n\nAuto-Fix Intervention Layer (OAuth, scoped to the signed-in user):\n • `auto_fix_schema` — draft FAQPage JSON-LD for a page.\n • `auto_fix_llms_txt` — draft an llms.txt for a site you own.\n • `auto_fix_robots_txt` — draft a robots.txt fix against the §4 matrix.\n • `list_pending_interventions` — list your `drafted` fixes.\n • `approve_intervention` / `reject_intervention` — human-in-the-loop gate before anything ships.\n\nWorkflow: `scan_url` → weakest signal → `auto_fix_*` → `list_pending_interventions` → user confirms → `approve_intervention`. Approved payloads are served from `/api/public/inject/{token}.js|.llms.txt` or applied by the WordPress plugin. `ping` is only for connectivity/auth debugging.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    pingTool,
    scanUrlTool,
    geoStandardTool,
    generateLlmsTxtTool,
    checkAiCitationTool,
    autoFixSchemaTool,
    autoFixLlmsTxtTool,
    autoFixRobotsTxtTool,
    listPendingInterventionsTool,
    approveInterventionTool,
    rejectInterventionTool,
  ],
});

