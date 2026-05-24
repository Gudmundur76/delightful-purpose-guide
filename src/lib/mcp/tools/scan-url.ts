import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { scanUrl } from "@/lib/check/scan.functions";

export const scanUrlTool = defineTool({
  name: "scan_url",
  description:
    "Run a live GEO (Generative Engine Optimization) scan on any URL. Returns overall score plus 5 metrics: semantic, jsonld, llms, citability, speed. Persisted to the scans table.",
  parameters: z.object({
    url: z.string().min(3).max(2048).describe("URL to scan (with or without https://)"),
    source: z.string().max(40).optional().describe("Caller tag, e.g. 'claude', 'agent'"),
  }),
  execute: async ({ url, source }) => {
    const result = await scanUrl({ data: { url, source: source ?? "mcp" } });
    return JSON.stringify(result, null, 2);
  },
});
