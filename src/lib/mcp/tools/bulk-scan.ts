import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { scanUrl } from "@/lib/check/scan.functions";

export const bulkScanTool = defineTool({
  name: "bulk_scan_urls",
  description:
    "Run GEO scans against up to 10 URLs in sequence. Persists each to the scans table. Returns array of {url, overall, sub-scores, error?}.",
  parameters: z.object({
    urls: z.array(z.string().min(3).max(2048)).min(1).max(10),
    source: z.string().max(40).default("mcp-bulk"),
  }),
  execute: async ({ urls, source }) => {
    const results = [];
    for (const url of urls) {
      try {
        const r = await scanUrl({ data: { url, source } });
        results.push({ url, ok: true, ...r });
      } catch (err) {
        results.push({ url, ok: false, error: err instanceof Error ? err.message : String(err) });
      }
    }
    return JSON.stringify({ ok: true, count: results.length, results }, null, 2);
  },
});
