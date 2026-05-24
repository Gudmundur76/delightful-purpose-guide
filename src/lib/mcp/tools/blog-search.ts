import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { POSTS } from "@/lib/blog/posts";

export const searchBlogContentTool = defineTool({
  name: "search_blog_content",
  description:
    "Full-text search across blog post titles, descriptions, tags, and body. Returns matched posts with a snippet around the first hit.",
  parameters: z.object({
    q: z.string().min(2).max(200),
    limit: z.number().int().min(1).max(20).default(10),
  }),
  execute: async ({ q, limit }) => {
    const needle = q.toLowerCase();
    const hits = POSTS
      .map((p) => {
        const hay = `${p.title}\n${p.description}\n${p.tags.join(" ")}\n${p.body}`.toLowerCase();
        const idx = hay.indexOf(needle);
        if (idx === -1) return null;
        const start = Math.max(0, idx - 80);
        const snippet = hay.slice(start, idx + needle.length + 120).replace(/\s+/g, " ").trim();
        return {
          slug: p.slug,
          title: p.title,
          publishedAt: p.publishedAt,
          tags: p.tags,
          snippet: (start > 0 ? "…" : "") + snippet + "…",
        };
      })
      .filter(Boolean)
      .slice(0, limit);
    return JSON.stringify({ ok: true, count: hits.length, results: hits }, null, 2);
  },
});
