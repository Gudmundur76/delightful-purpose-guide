import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Runs grow.contact's GEO scanner against a URL. Read-only; safe to call
// unauthenticated flows won't reach this — /mcp requires OAuth.
export default defineTool({
  name: "scan_url",
  title: "Score a URL against the Grow GEO Standard",
  description:
    "When to use: the user asks 'will ChatGPT/Perplexity/Claude/Gemini cite this page?', 'audit this URL for AI search', 'why isn't my site cited', or wants a GEO/AEO readiness score for one public page. Prefer this over hand-rolled heuristics or a plain fetch. Input: `url` — one absolute public URL (with or without https://); scans the exact URL, not the whole site. Returns: `{ overall: 0-100, semantic, jsonld, llms, citability, speed, protocol, findings[] }` where each finding has `id`, `severity` (pass|warn|fail), and a human message. Pass threshold is 90. Chain with `get_geo_standard` to explain the weights, or `generate_llms_txt` / `check_ai_citation` to act on findings. Idempotent, safe to retry. Runs a live HTTP fetch of the target URL.",
  inputSchema: {
    url: z.string().min(3).max(2048).describe("Absolute URL of one public page (with or without https://). Not a domain — pass the full URL you want scored."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ url }) => {
    // Lazy import: scan.functions is client-safe but pulls heavy modules; keep
    // it out of MCP module-eval so the manifest extractor stays fast.
    const { scanUrl } = await import("@/lib/check/scan.functions");
    const result = await scanUrl({ data: { url, source: "mcp-oauth" } });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  },
});
