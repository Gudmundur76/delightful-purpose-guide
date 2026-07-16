import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Runs grow.contact's GEO scanner against a URL. Read-only; safe to call
// unauthenticated flows won't reach this — /mcp requires OAuth.
export default defineTool({
  name: "scan_url",
  title: "Scan URL",
  description:
    "Run a live GEO (Generative Engine Optimization) scan on any URL. Returns overall score plus metrics for semantic, jsonld, llms, citability, and speed.",
  inputSchema: {
    url: z.string().min(3).max(2048).describe("URL to scan (with or without https://)"),
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
