import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const siteInfoTool = defineTool({
  name: "site_info",
  description:
    "Get high-level info about citation.is (name, tagline, key URLs). Useful as build-time context.",
  parameters: z.object({}),
  execute: async () => {
    return JSON.stringify(
      {
        name: "citation.is",
        tagline: "Generative Engine Optimization — get found by AI",
        urls: {
          home: "https://citation.is",
          pricing: "https://citation.is/pricing",
          check: "https://citation.is/check",
          api_docs: "https://citation.is/api-docs",
        },
      },
      null,
      2,
    );
  },
});
