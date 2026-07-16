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
    name: "open_standard",
    description:
      "Open the Agent-Native Web Standard — the free, open specification behind grow.contact's scoring.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      window.location.href = "/standard";
      return { navigated_to: "/standard" };
    },
  },
  {
    name: "open_scanner",
    description:
      "Open the free grow.contact scanner to score any URL against the Agent-Native Web Standard.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Optional URL to pre-fill in the scanner." },
      },
    },
    execute: async ({ url }) => {
      const qs = url ? `?url=${encodeURIComponent(String(url))}` : "";
      window.location.href = `/check${qs}`;
      return { navigated_to: "/check" };
    },
  },
  {
    name: "open_leaderboard",
    description:
      "Open the live leaderboard of audited sites scored against the Agent-Native Web Standard.",
    inputSchema: { type: "object", properties: {} },
    execute: async () => {
      window.location.href = "/leaderboard";
      return { navigated_to: "/leaderboard" };
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
