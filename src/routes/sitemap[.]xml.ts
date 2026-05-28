import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { getAllPosts } from "@/lib/blog/posts";
import { getAllComparisons } from "@/lib/comparisons/data";
import { GLOSSARY } from "@/lib/glossary/data";
import { CRAWLERS } from "@/lib/crawlers/data";


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
          { path: "/work", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/services", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/pricing", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/products", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/process", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/contact", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/check", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/badge", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/faq", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/checkout", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/cookies", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/login", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/privacy", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/refund", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/terms", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/api-docs", lastmod: today, changefreq: "monthly", priority: "0.5" },
          { path: "/cli", lastmod: today, changefreq: "monthly", priority: "0.7" },
          { path: "/status", lastmod: today, changefreq: "weekly", priority: "0.4" },
          { path: "/llms", lastmod: today, changefreq: "monthly", priority: "0.4" },
          { path: "/unsubscribe", lastmod: today, changefreq: "yearly", priority: "0.3" },
          { path: "/vs", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/playbook", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/outreach", lastmod: today, changefreq: "monthly", priority: "0.6" },
          { path: "/glossary", lastmod: today, changefreq: "monthly", priority: "0.8" },
          { path: "/crawlers", lastmod: today, changefreq: "monthly", priority: "0.8" },
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
