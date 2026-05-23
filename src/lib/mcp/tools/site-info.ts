import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const siteInfoTool = defineTool({
  name: "site_info",
  description:
    "Get high-level info about grow.contact (name, tagline, key URLs). Useful as build-time context.",
  parameters: z.object({}),
  execute: async () => {
    return JSON.stringify(
      {
        name: "grow.contact",
        tagline: "Generative Engine Optimization — get found by AI",
        urls: {
          home: "https://grow.contact",
          pricing: "https://grow.contact/pricing",
          check: "https://grow.contact/check",
          api_docs: "https://grow.contact/api-docs",
        },
      },
      null,
      2,
    );
  },
});
