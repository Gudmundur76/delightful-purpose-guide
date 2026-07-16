import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Live check: is a domain cited by AI engines for a given query?
export default defineTool({
  name: "check_ai_citation",
  title: "Check AI citation",
  description:
    "Ask Gemini 2.5 Flash a real buyer query and report whether the given domain is cited, plus the actual answer and citations. Use to measure real AI visibility for a URL.",
  inputSchema: {
    domain: z.string().min(3).max(253).describe("Domain to check (e.g. example.com)"),
    query: z.string().min(3).max(280).describe("A real user query the domain should be cited for"),
  },
  annotations: { readOnlyHint: true, openWorldHint: true },
  handler: async ({ domain, query }) => {
    const { checkAiVisibility } = await import("@/lib/tools/ai-visibility.functions");
    const result = await checkAiVisibility({ data: { domain, query } });
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      structuredContent: result as unknown as Record<string, unknown>,
    };
  },
});
