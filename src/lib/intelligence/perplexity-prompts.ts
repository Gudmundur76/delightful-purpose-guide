export interface CompetitiveIntelParams {
  /** Target company/domain to research */
  target: string;
  /** What to compare against — e.g. "citation.is" */
  versus?: string;
  /** Focus areas: product, pricing, positioning, content, citations, tech stack */
  focusAreas?: string[];
  /** Output format: "report", "matrix", "swot", "executive_summary" */
  format?: string;
  /** Maximum citations to include */
  maxCitations?: number;
  /** Date cutoff, e.g. "last 6 months" */
  recency?: string;
}

const FOCUS_AREA_DESCRIPTIONS: Record<string, string> = {
  product: "Product features, roadmap, feature gaps, and UX patterns.",
  pricing: "Pricing tiers, models (subscription vs one-off), discounts, and value props.",
  positioning: "Brand messaging, ICP, hero copy, category framing, and moat claims.",
  content: "Content strategy, blog cadence, lead magnets, SEO vs GEO play.",
  citations: "AI citation presence — Perplexity, ChatGPT, Gemini — and what schema they use.",
  "tech-stack": "MCP endpoints, llms.txt, OpenAPI, auth protocols, and edge signals.",
};

/**
 * Builds a Perplexity-ready deep-research prompt for competitive intelligence.
 * Use with model: "sonar-deep-research" for best results.
 */
export function buildPerplexityPrompt(params: CompetitiveIntelParams): string {
  const { target, versus, focusAreas, format, recency } = params;

  const focusList = (focusAreas ?? ["product", "positioning", "content", "citations", "tech-stack"])
    .map((f) => `- **${f}**: ${FOCUS_AREA_DESCRIPTIONS[f] ?? "General research."}`)
    .join("\n");

  const recencyBlock = recency
    ? `Only consider sources and developments from the ${recency}.`
    : "";

  const versusBlock = versus
    ? `Compare findings directly against **${versus}** whenever possible. Highlight where ${target} is ahead, where it is behind, and where the approaches diverge strategically.`
    : "";

  const outputFormat = format ?? "report";

  return `You are a competitive-intelligence analyst specializing in AI-native companies and Generative Engine Optimization (GEO).

## Mission
Run a deep-research competitive-intelligence sweep on **${target}**. Surface their strategy, strengths, weaknesses, and observable signals — not speculation.

## Focus Areas
${focusList}

${versusBlock}
${recencyBlock}

## Constraints
- Prioritize primary sources (their website, blog, public docs, GitHub repos, pricing pages, API specs, press releases, SEC filings if applicable).
- Cite every claim with a URL.
- Flag anything that looks like marketing fluff vs. verifiable fact.
- If data is missing, say "No public signal found" rather than inferring.

## Output Format
Provide the result as a structured **${outputFormat}** with the following sections:
1. **Executive Summary** (3 bullets max)
2. **Signal Matrix** (what they have vs. what they lack)
3. **Content & Citation Audit** (llms.txt, JSON-LD, MCP, OpenAPI, semantic HTML — score each if possible)
4. **Pricing & Positioning Map**
5. **Threat Assessment** (how they could outflank us)
6. **Recommended Response** (2–3 concrete actions we should take)

If any section has insufficient data, write "Insufficient public signal" and move on.`;
}

/** Example usage prompt for the user */
export const EXAMPLE_COMPETITOR_INTEL: CompetitiveIntelParams = {
  target: "isitagentready.com",
  versus: "citation.is",
  focusAreas: ["product", "positioning", "content", "citations", "tech-stack"],
  format: "report",
  recency: "last 6 months",
};
