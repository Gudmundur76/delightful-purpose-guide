import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Generate a spec-compliant /llms.txt for any site by crawling its sitemap.
export default defineTool({
  name: "generate_llms_txt",
  title: "Generate llms.txt",
  description:
    "Generate a spec-compliant /llms.txt for any public site. Discovers the sitemap, groups public routes, and returns markdown ready to drop at the site root.",
  inputSchema: {
    url: z.string().min(3).max(2048).describe("Root URL of the site (with or without https://)"),
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
