/**
 * Single source of truth for the public tool catalog.
 * Rendered at /tools (humans) and served at /api/public/tools.json (agents).
 */

export type CatalogTool = {
  /** Stable machine id */
  id: string;
  href: string;
  title: string;
  blurb: string;
  status?: "new" | "core";
  /** Machine-callable endpoint, if any (relative) */
  api?: string;
  /** MCP tool name that performs the same job, if any */
  mcpTool?: string;
  input?: string;
  output?: string;
};

export const TOOLS_CATALOG: CatalogTool[] = [
  {
    id: "perplexity-answer-engine",
    href: "/tools/perplexity-answer-engine",
    title: "Perplexity Answer Engine",
    blurb:
      "Type any question. We simulate what Perplexity answers today, then engineer the citation-ready answer block (lead, stats, FAQ, JSON-LD) that Perplexity would pick over the incumbent — with a Pick Score.",
    status: "new",
    input: "A natural-language question plus the domain you want cited.",
    output: "Simulated current answer, engineered answer block, JSON-LD, and a Pick Score 0-100.",
  },
  {
    id: "geo-explorer",
    href: "/tools/geo-explorer",
    title: "GEO Explorer",
    blurb:
      "The Ubersuggest of getting cited by AI. Domain snapshot, prompt ideas, live AI SERP, and answer-first content brief — all in one page.",
    status: "new",
    input: "A domain.",
    output: "Readiness snapshot, prompt ideas, live AI answer view, and a content brief with required JSON-LD.",
  },
  {
    id: "prompt-cloud",
    href: "/tools/prompt-cloud",
    title: "Prompt Cloud",
    blurb:
      "The AnswerThePublic replacement for AI. Expand any seed into 40 real ChatGPT/Perplexity/Claude/Gemini prompts with intent, difficulty, and the incumbent to displace.",
    status: "new",
    input: "A seed topic.",
    output: "40 prompts tagged by intent, citation difficulty, and current incumbent.",
  },
  {
    id: "check",
    href: "/check",
    title: "AI-readiness scanner",
    blurb:
      "Score any URL on the five signals AI engines actually read — crawler access, structure, schema, freshness, and protocol discovery.",
    status: "core",
    api: "/api/public/v1/scan",
    mcpTool: "scan_url",
    input: "Any public URL.",
    output: "Score 0-100 with per-signal breakdown and prioritised fixes.",
  },
  {
    id: "ai-visibility",
    href: "/tools/ai-visibility",
    title: "AI visibility checker",
    blurb:
      "Ask a real question to Gemini and GPT — see whether your domain shows up in the answer or gets cited. Live, per-engine.",
    status: "new",
    mcpTool: "check_ai_citation",
    input: "A question and a domain.",
    output: "Per-engine answer text plus whether the domain was mentioned or cited.",
  },
  {
    id: "llms-txt-generator",
    href: "/tools/llms-txt-generator",
    title: "llms.txt generator",
    blurb:
      "Point us at a domain. We crawl your sitemap and return a spec-compliant llms.txt, grouped by section, ready to paste at the root.",
    status: "new",
    mcpTool: "generate_llms_txt",
    input: "A domain.",
    output: "A spec-compliant llms.txt file body.",
  },
  {
    id: "schema-generator",
    href: "/tools/schema-generator",
    title: "JSON-LD schema generator",
    blurb:
      "Build Organization, FAQ, and Article schema in a form. Copy the JSON-LD, drop it in your <head>, done.",
    status: "new",
    mcpTool: "draft_jsonld",
    input: "Entity type and fields.",
    output: "Valid schema.org JSON-LD.",
  },
  {
    id: "robots-checker",
    href: "/tools/robots-checker",
    title: "robots.txt checker for AI",
    blurb:
      "Paste your robots.txt. See which of the 15+ AI crawlers (OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended…) you're allowing or blocking.",
    status: "core",
    mcpTool: "draft_robots_txt",
    input: "A robots.txt body or a domain.",
    output: "Allow/block verdict for every known AI crawler.",
  },
  {
    id: "mcp-server",
    href: "/mcp-server",
    title: "MCP server",
    blurb:
      "Connect grow.contact to ChatGPT, Claude, or Cursor as an authenticated MCP server. Run scans and lookups from your assistant.",
    status: "core",
    api: "/mcp",
    input: "OAuth-authenticated MCP client.",
    output: "All grow.contact tools callable from your assistant.",
  },
  {
    id: "ai-attribution",
    href: "/tools/ai-attribution",
    title: "AI traffic attribution",
    blurb:
      "One 1 KB script tag labels every visit from ChatGPT, Perplexity, Claude, Gemini, Copilot and 7 more engines, then pushes the event into GA4, Plausible or PostHog. No cookies, MIT.",
    status: "new",
    api: "/api/public/ai-attribution.js",
    input: "A script tag on your site.",
    output: "An ai_referral event with the detected engine, pushed to your analytics.",
  },
  {
    id: "wordpress-plugin",
    href: "/tools/wordpress-plugin",
    title: "WordPress plugins",
    blurb:
      "Two free, GPL-licensed plugins: grow-auto-fix (JSON-LD + llms.txt + robots.txt) and grow-mcp (turns your site into an MCP server for ChatGPT, Claude, Perplexity). Download the zip, no signup.",
    status: "new",
    api: "/api/public/wordpress-plugin/grow-auto-fix",
    input: "A WordPress site.",
    output: "Installed plugin that writes JSON-LD, llms.txt and robots.txt automatically.",
  },
];
