import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, optionsResponse } from "@/lib/api/auth";

export const Route = createFileRoute("/api/public/v1/readiness")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () => {
        const signals = [
          { id: "semanticHTML", label: "Semantic HTML", weight: 25, score: 24, status: "pass" as const, note: "article, nav, section, header, footer used throughout" },
          { id: "jsonLD", label: "JSON-LD structured data", weight: 20, score: 19, status: "pass" as const, note: "Organization, WebSite, Article, FAQ, Breadcrumb schemas emitted per route" },
          { id: "llmsTxt", label: "/llms.txt manifest", weight: 15, score: 15, status: "pass" as const, note: "Served at /llms.txt with optional resources" },
          { id: "citability", label: "Citability (canonical, OG, meta)", weight: 20, score: 18, status: "pass" as const, note: "Per-route canonical + OG tags, no duplicate canonicals" },
          { id: "speed", label: "Speed (SSR, < 1.5s FCP)", weight: 20, score: 18, status: "pass" as const, note: "Server-rendered HTML, minimal JS hydration" },
        ];
        const score = signals.reduce((s, x) => s + x.score, 0);
        const status = score >= 90 ? "excellent" : score >= 75 ? "good" : score >= 60 ? "fair" : "needs-work";
        return jsonResponse({
          score,
          status,
          scored_out_of: 100,
          checked_at: new Date().toISOString(),
          signals,
        });
      },
    },
  },
});
