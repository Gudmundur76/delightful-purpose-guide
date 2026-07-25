import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAllPosts } from "@/lib/blog/posts";
import { getAllComparisons } from "@/lib/comparisons/data";
import { GLOSSARY } from "@/lib/glossary/data";
import { CRAWLERS } from "@/lib/crawlers/data";
import { PLAYBOOKS } from "@/lib/playbooks/data";
import { getFeaturedPairsWithEntries } from "@/lib/compare/data";
import { getAllDataDrops } from "@/lib/data-drops/data";
import { LEADERBOARD } from "@/lib/leaderboard/entries";
import { STAT_MICROPOSTS } from "@/lib/stats/microposts";



const BASE_URL = "https://grow.contact";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = getAllPosts();
        const today = new Date().toISOString().slice(0, 10);

        const entries: SitemapEntry[] = [
          { path: "/", lastmod: today, changefreq: "weekly", priority: "1.0" },
          { path: "/standard", lastmod: "2026-05-22", changefreq: "monthly", priority: "0.9" },
          { path: "/standard.md", lastmod: "2026-05-22", changefreq: "monthly", priority: "0.6" },

          { path: "/check", lastmod: today, changefreq: "monthly", priority: "0.9" },
          { path: "/badge", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/faq", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/cookies", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/login", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/privacy", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/terms", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/api-docs", lastmod: today, changefreq: "monthly", priority: "0.5" },
          { path: "/cli", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/status", lastmod: today, changefreq: "weekly", priority: "0.4" },
          { path: "/llms", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/unsubscribe", lastmod: today, changefreq: "yearly", priority: "0.3" },
          { path: "/vs", lastmod: today, changefreq: "monthly", priority: "0.8" },

          { path: "/glossary", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/crawlers", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/stats", lastmod: today, changefreq: "weekly", priority: "0.9" },
          { path: "/trust", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/leaderboard", lastmod: today, changefreq: "weekly", priority: "0.9" },
          { path: "/playground", lastmod: today, changefreq: "weekly", priority: "0.9" },
          { path: "/extension", lastmod: today, changefreq: "monthly", priority: "0.9" },
          { path: "/v-score", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/citation-index", lastmod: today, changefreq: "weekly", priority: "0.7" },
          { path: "/mcp-server", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/mcp", changefreq: "monthly", priority: "0.6" },
          { path: "/mcp-protected-resource", changefreq: "monthly", priority: "0.3" },
          { path: "/openapi.json", changefreq: "monthly", priority: "0.4" },
          { path: "/.well-known/agent-card.json", changefreq: "monthly", priority: "0.3" },
          { path: "/research", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/for-agents", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/for-analysts", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/why", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/akn", lastmod: today, changefreq: "monthly", priority: "0.6" },




          { path: "/blog", lastmod: today, changefreq: "weekly", priority: "0.8" },
          { path: "/integrations", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/rss.xml", lastmod: today, changefreq: "weekly", priority: "0.4" },
          { path: "/blog/rss.xml", lastmod: today, changefreq: "weekly", priority: "0.4" },
          { path: "/research/rss.xml", lastmod: today, changefreq: "weekly", priority: "0.4" },
          { path: "/leaderboard/rss.xml", lastmod: today, changefreq: "daily", priority: "0.5" },
          { path: "/playbooks", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/compare", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/tools", lastmod: today, changefreq: "weekly", priority: "0.9" },
          { path: "/tools/robots-checker", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/tools/llms-txt-generator", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/tools/schema-generator", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/tools/ai-visibility", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/report/q2-2026", lastmod: today, changefreq: "monthly", priority: "0.9" },
          { path: "/report/q2-2026.pdf", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/report/methodology", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/report/press", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/about/author/grow-research", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/data-drops", lastmod: today, changefreq: "weekly", priority: "0.8" },
          ...getAllDataDrops().map<SitemapEntry>((d) => ({
            path: `/data-drops/${d.slug}`,
            lastmod: d.publishedAt,
            changefreq: "monthly",
            priority: "0.7",
          })),

          ...PLAYBOOKS.map<SitemapEntry>((p) => ({
            path: `/playbooks/${p.slug}`,
            lastmod: p.updatedAt,
            changefreq: "monthly",
            priority: "0.7",
          })),
          ...getFeaturedPairsWithEntries().map<SitemapEntry>((p) => ({
            path: `/compare/${p.slug}`,
            lastmod: today,
            changefreq: "monthly",
            priority: "0.6",
          })),
          ...GLOSSARY.map<SitemapEntry>((t) => ({
            path: `/glossary/${t.slug}`,
            lastmod: today,
            changefreq: "monthly",
            priority: "0.6",
          })),
          ...CRAWLERS.map<SitemapEntry>((c) => ({
            path: `/crawlers/${c.slug}`,
            lastmod: today,
            changefreq: "monthly",
            priority: "0.7",
          })),
          { path: "/sop", lastmod: today, changefreq: "monthly", priority: "0.5" },
          { path: "/auth.md", lastmod: today, changefreq: "monthly", priority: "0.3" },
          { path: "/llms-full.txt", lastmod: today, changefreq: "weekly", priority: "0.4" },
          { path: "/.well-known/api-catalog", lastmod: today, changefreq: "monthly", priority: "0.3" },
          { path: "/.well-known/http-message-signatures-directory", lastmod: today, changefreq: "monthly", priority: "0.3" },
          { path: "/.well-known/jwks.json", lastmod: today, changefreq: "monthly", priority: "0.3" },
          { path: "/.well-known/mcp.json", lastmod: today, changefreq: "monthly", priority: "0.3" },
          { path: "/.well-known/oauth-authorization-server", lastmod: today, changefreq: "monthly", priority: "0.3" },
          { path: "/.well-known/oauth-protected-resource", lastmod: today, changefreq: "monthly", priority: "0.3" },
          ...getAllComparisons()
            .filter((c) => c.slug !== "webflow" && c.slug !== "framer")
            .map<SitemapEntry>((c) => ({
              path: `/vs/${c.slug}`,
              lastmod: today,
              changefreq: "monthly",
              priority: "0.8",
            })),
          ...posts.map<SitemapEntry>((p) => ({
            path: `/blog/${p.slug}`,
            lastmod: p.publishedAt,
            changefreq: "monthly",
            priority: "0.7",
          })),
          ...STAT_MICROPOSTS.map<SitemapEntry>((m) => ({
            path: `/stats/${m.slug}`,
            lastmod: m.updatedAt ?? m.publishedAt,
            changefreq: "monthly",
            priority: "0.8",
          })),
          ...LEADERBOARD.map<SitemapEntry>((e) => ({
            path: `/verify/${e.domain}`,
            lastmod: today,
            changefreq: "weekly",
            priority: "0.6",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
