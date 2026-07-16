import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const brandKitTool = defineTool({
  name: "get_brand_kit",
  description:
    "Returns citation.is brand kit: colors (OKLCH), typography, tone of voice, logo URLs. Use this as build-time context so generated UIs match the brand.",
  parameters: z.object({}),
  execute: async () => {
    return JSON.stringify(
      {
        name: "citation.is",
        colors: {
          background: "oklch(0.145 0 0)",
          foreground: "oklch(0.984 0.003 247.86)",
          primary: "oklch(0.823 0.137 215.6)", // cyan
          accent: "oklch(0.823 0.137 215.6)",
          surface: "oklch(0.215 0.035 280)",
          border: "oklch(0.27 0.02 270)",
          destructive: "oklch(0.62 0.22 25)",
          hex: {
            background: "#0a0a0a",
            surface: "#1a1a2e",
            accent: "#22d3ee",
            foreground: "#f8fafc",
            warning: "#ff5722",
          },
        },
        typography: {
          display: "Inter, sans-serif",
          mono: "'JetBrains Mono', monospace",
          headings: { weight: 800, tracking: "-0.04em", case: "uppercase" },
          mono_labels: {
            weight: 500,
            tracking: "0.2em",
            case: "uppercase",
            note: "Prefix with // for system/agent labels.",
          },
        },
        tone: {
          voice: "Direct, technical, slightly brutalist. Short sentences. Zero fluff.",
          do: [
            "Lead with the outcome.",
            "Use mono labels (// LABEL //) for system/agent text.",
            "Quote concrete numbers (scores, hours, %)",
          ],
          dont: [
            "No emojis in product copy.",
            "No marketing platitudes ('seamless', 'unleash', 'revolutionary').",
            "No serif fonts.",
          ],
        },
        logo: {
          wordmark: "citation.is",
          mark_style: "monospace wordmark with trailing underscore: citation.is_",
        },
        urls: {
          home: "https://citation.is",
          pricing: "https://citation.is/pricing",
          check: "https://citation.is/check",
          api_docs: "https://citation.is/api-docs",
        },
      },
      null,
      2,
    );
  },
});
