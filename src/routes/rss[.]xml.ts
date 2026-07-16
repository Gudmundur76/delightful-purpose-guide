import { createFileRoute } from "@tanstack/react-router";
import { getAllPosts } from "@/lib/blog/posts";

const BASE_URL = "https://citation.is";
const FEED_URL = `${BASE_URL}/rss.xml`;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

export const Route = createFileRoute("/rss.xml")({
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
    <title>citation.is — Journal</title>
    <link>${BASE_URL}/blog</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>GEO guides, agent-native web patterns, and AI citation research from citation.is.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      },
    },
  },
});
