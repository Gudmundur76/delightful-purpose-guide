import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { getCompanyIntelligence } from "@/lib/intelligence/company.functions";

export const getCompanyProfileTool = defineTool({
  name: "get_company_profile",
  description:
    "Fetch the full Citation Intelligence profile for a company by domain — the same payload that powers /verify/$id pages. Includes company info, latest 6-signal CCS scores (overall_ccs, citation_probability, authority, verifiability, precedent, commentary, information_gain, canonical), last 12 months of citation_history, recent citations, authority_signals (GitHub/G2/SO/news), content_analysis, and category peers.",
  parameters: z.object({
    domain: z
      .string()
      .min(3)
      .max(253)
      .describe("Company domain, e.g. anthropic.com (case-insensitive, scheme stripped)"),
  }),
  execute: async ({ domain }) => {
    const normalized = domain
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .replace(/\/.*$/, "");
    try {
      const { intelligence } = await getCompanyIntelligence({ data: { domain: normalized } });
      if (!intelligence) {
        return JSON.stringify({ ok: false, error: `No company profile for "${normalized}"`, domain: normalized });
      }
      return JSON.stringify({ ok: true, data: intelligence, generated_at: new Date().toISOString() }, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : "Unknown error" });
    }
  },
});
