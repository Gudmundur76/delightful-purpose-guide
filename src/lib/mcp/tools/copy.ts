import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

const COPY: Record<string, { headline: string; sub: string; bullets?: string[]; cta?: string }> = {
  hero: {
    headline: "Get found by AI.",
    sub: "Generative Engine Optimization for sites that need to rank in ChatGPT, Claude, Perplexity, and Gemini — not just Google.",
    cta: "Scan your site →",
  },
  pricing: {
    headline: "Fixed price. 48-hour turnaround.",
    sub: "One scan. One fix sprint. One re-score guarantee. No retainers, no surprises.",
    bullets: [
      "Starter — single page, all five signals fixed",
      "Studio — full site, JSON-LD + llms.txt + semantic pass",
      "Scale — ongoing monthly re-scoring + content ops",
    ],
  },
  check: {
    headline: "Agent Readability Score.",
    sub: "Five signals, one number. Semantic HTML, JSON-LD, llms.txt, citability, first-contentful speed.",
    cta: "Scan now →",
  },
  about: {
    headline: "Built by operators, not consultants.",
    sub: "We ship the fixes ourselves. Re-score guarantee or your money back.",
  },
  cta: {
    headline: "Ready to be cited by AI?",
    sub: "48-hour fix sprint. Fixed price. Re-score guaranteed.",
    cta: "Book a scan →",
  },
};

export const copyTool = defineTool({
  name: "get_copy",
  description:
    "Returns approved marketing copy for a section of citation.is. Use to keep messaging consistent across pages and agent-generated sites. Valid sections: hero, pricing, check, about, cta.",
  parameters: z.object({
    section: z
      .enum(["hero", "pricing", "check", "about", "cta"])
      .describe("Which section's copy to return."),
  }),
  execute: async ({ section }) => {
    return JSON.stringify(COPY[section], null, 2);
  },
});
