import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Generate a spec-compliant /llms.txt for any site by crawling its sitemap.
export default defineTool({
  name: "generate_llms_txt",
  title: "Generate llms.txt for a site",
  description:
    "When to use: the user asks to 'create/fix/generate an llms.txt', or `scan_url` reports the `llms` signal as failing. Discovers the site's sitemap.xml, groups public routes into sections (Docs, Blog, Product, etc.), and returns markdown ready to save as `/llms.txt` at the site root. Input: `url` — the site root or any URL on the domain (host is what matters). Returns: `{ markdown, sections[], routeCount, sitemapUrl }`. The `markdown` field is the file contents — write it verbatim to `/llms.txt`. Does not modify the target site. Follow with `scan_url` on the same host to confirm the `llms` signal now passes.",
  inputSchema: {
    url: z.string().min(3).max(2048).describe("Site root URL (with or without https://). Only the host is used — a full page URL works too."),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ url }) => {
    const { generateLlmsTxt } = await import("@/lib/tools/llms-generator.functions");
    const normalized = /^https?:\/\//.test(url) ? url : `https://${url}`;
    const result = await generateLlmsTxt({ data: { url: normalized } });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  },
});
