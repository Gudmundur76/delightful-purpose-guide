import { createFileRoute } from "@tanstack/react-router";
import { TOOLS_CATALOG } from "@/lib/tools-catalog";

const ORIGIN = "https://grow.contact";

function payload() {
  return {
    name: "grow.contact free tool catalog",
    description:
      "Free tools and machine-callable endpoints for getting cited by AI engines (ChatGPT, Perplexity, Claude, Gemini). No signup, no paid tier.",
    license: "free",
    updated: new Date().toISOString().slice(0, 10),
    mcp: {
      endpoint: `${ORIGIN}/mcp`,
      install: "npx @grow-contact/cli mcp",
      auth: "oauth2",
    },
    discovery: {
      llms_txt: `${ORIGIN}/llms.txt`,
      agent_card: `${ORIGIN}/.well-known/agent-card.json`,
      openapi: `${ORIGIN}/api/public/v1/openapi.json`,
    },
    tools: TOOLS_CATALOG.map((t) => ({
      id: t.id,
      name: t.title,
      description: t.blurb,
      url: `${ORIGIN}${t.href}`,
      api: t.api ? `${ORIGIN}${t.api}` : null,
      mcp_tool: t.mcpTool ?? null,
      input: t.input ?? null,
      output: t.output ?? null,
      price: "free",
    })),
  };
}

export const Route = createFileRoute("/api/public/tools.json")({
  server: {
    handlers: {
      GET: () =>
        new Response(JSON.stringify(payload(), null, 2), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "access-control-allow-origin": "*",
            "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
        }),
    },
  },
});
