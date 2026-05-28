// WebMCP — exposes grow.contact's key actions to in-browser AI agents.
// https://webmachinelearning.github.io/webmcp/
// https://developer.chrome.com/blog/webmcp-epp
//
// Registers tools via navigator.modelContext on page load. Falls back gracefully
// in browsers without WebMCP support. Supports both the current `registerTool`
// API and the earlier `provideContext` API for maximum compatibility.
import { useEffect } from "react";

type WebMcpTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
};

type ModelContext = {
  registerTool?: (tool: WebMcpTool, opts?: { signal?: AbortSignal }) => void;
  provideContext?: (ctx: { tools: WebMcpTool[] }) => void;
};

const tools: WebMcpTool[] = [
  {
    name: "analyze_url_readiness",
    description:
      "Run grow.contact's GEO/AEO agent-readiness analyzer on any public URL. Returns a score and a list of findings (missing llms.txt, schema gaps, MCP discoverability, etc.).",
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          format: "uri",
          description: "Absolute URL of the page to analyze.",
        },
      },
      required: ["url"],
    },
    execute: async ({ url }) => {
      const res = await fetch("/api/public/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      return res.json();
    },
  },
  {
    name: "get_pricing",
    description:
      "Get grow.contact's current service tiers and pricing for GEO/AEO consulting and audits.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      window.location.href = "/pricing";
      return { navigated_to: "/pricing" };
    },
  },
  {
    name: "open_contact",
    description:
      "Open the grow.contact contact form to request an engagement, API key, or MCP token.",
    inputSchema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          description: "Optional message to prefill in the contact form.",
        },
      },
    },
    execute: async ({ message }) => {
      const qs = message ? `?msg=${encodeURIComponent(String(message))}` : "";
      window.location.href = `/contact${qs}`;
      return { navigated_to: "/contact" };
    },
  },
  {
    name: "list_services",
    description:
      "List grow.contact's services (audits, implementation, advisory) with short descriptions.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      window.location.href = "/services";
      return { navigated_to: "/services" };
    },
  },
];

export function WebMcpProvider() {
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const mc = (navigator as Navigator & { modelContext?: ModelContext })
      .modelContext;
    if (!mc) return;

    const controller = new AbortController();

    // Newer API
    if (typeof mc.registerTool === "function") {
      for (const tool of tools) {
        try {
          mc.registerTool(tool, { signal: controller.signal });
        } catch {
          /* ignore registration errors */
        }
      }
    }
    // Legacy API
    else if (typeof mc.provideContext === "function") {
      try {
        mc.provideContext({ tools });
      } catch {
        /* ignore */
      }
    }

    return () => controller.abort();
  }, []);

  return null;
}
