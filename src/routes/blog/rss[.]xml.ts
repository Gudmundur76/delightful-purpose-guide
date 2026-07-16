import { createFileRoute } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/blog/posts";

const BASE_URL = "https://citation.is";
const FEED_URL = `${BASE_URL}/blog/rss.xml`;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  // Defuse any embedded CDATA terminator
  return `<![CDATA[${s.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

export const Route = createFileRoute("/blog/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const posts = getAllPosts();
        const lastBuild = (posts[0]?.publishedAt
          ? new Date(posts[0].publishedAt)
          : new Date()
        ).toUTCString();

        const items = posts
          .map((p) => {
            const url = `${BASE_URL}/blog/${p.slug}`;
            const categories = p.tags
              .map((t) => `      <category>${escapeXml(t)}</category>`)
              .join("\n");
            return [
              "    <item>",
              `      <title>${escapeXml(p.title)}</title>`,
              `      <link>${url}</link>`,
              `      <guid isPermaLink="true">${url}</guid>`,
              `      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>`,
              `      <description>${cdata(p.description)}</description>`,
              categories,
              "    </item>",
            ]
              .filter(Boolean)
              .join("\n");
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Grow — Journal</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>Field notes on shipping custom websites: startup web design, SaaS landing pages, and when DIY builders stop scaling.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
