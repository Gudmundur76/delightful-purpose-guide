import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Live check: is a domain cited by AI engines for a given query?
export default defineTool({
  name: "check_ai_citation",
  title: "Check whether an AI engine cites a domain",
  description:
    "When to use: the user asks 'does ChatGPT/Perplexity/Gemini cite my site for X?', 'am I visible in AI search for this query?', or you need real-world proof of visibility (not just an on-page score — use `scan_url` for that). Runs a live grounded Gemini 2.5 Flash query and inspects the returned citations. Input: `domain` (bare hostname, e.g. `example.com` — no scheme, no path) and `query` (a real buyer prompt like 'best free llms.txt generator', not a keyword). Returns: `{ cited: boolean, position?: number, answer: string, citations: [{ domain, url, title }] }`. Costs one model call per invocation, so batch related queries by calling once per query, not per keyword variant. Not idempotent — grounded results drift day to day.",
  inputSchema: {
    domain: z.string().min(3).max(253).describe("Bare domain to look for in the citation list, e.g. `example.com`. Do not include https:// or a path."),
    query: z.string().min(3).max(280).describe("A real user prompt — full natural-language question, not a keyword. Example: 'what is the best free tool to check if AI cites my website?'"),
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
