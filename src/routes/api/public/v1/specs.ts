import { createFileRoute } from "@tanstack/react-router";
import { jsonResponse, optionsResponse } from "@/lib/api/auth";

export const Route = createFileRoute("/api/public/v1/specs")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async () =>
        jsonResponse({
          product: "Grow",
          tagline: "Agent-native websites for AI startups",
          updated_at: new Date().toISOString(),
          stack: {
            framework: "TanStack Start v1 (React 19)",
            rendering: "SSR + selective hydration",
            bundler: "Vite 7",
            runtime: "Cloudflare Workers (nodejs_compat)",
            styling: "Tailwind CSS v4",
            database: "Postgres (managed, edge-replicated)",
          },
          performance: {
            firstContentfulPaint: "< 1.5s",
            largestContentfulPaint: "< 2.0s",
            cumulativeLayoutShift: "< 0.05",
            timeToInteractive: "< 2.5s",
            javascriptBudgetKb: 180,
          },
          agentReadability: {
            semanticHtml: true,
            jsonLdPerRoute: true,
            llmsTxt: "/llms.txt",
            rssFeed: "/blog/rss.xml",
            sitemap: "/sitemap.xml",
            openApi: "/api/public/v1/openapi.json",
            swaggerUi: "/api/public/v1/docs",
          },
          schemas: ["Organization", "WebSite", "Article", "BlogPosting", "FAQPage", "BreadcrumbList", "Product", "HowTo"],
          delivery: {
            starter: { timeline: "48 hours", price_usd: 2400 },
            growth: { timeline: "5 days", price_usd: 6800 },
          },
          contact: { email: "hello@grow.contact", url: "https://grow.contact/contact" },
        }),
    },
  },
});
