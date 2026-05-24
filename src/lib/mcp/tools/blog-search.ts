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
    const phrase = q.toLowerCase().trim();
    const tokens = Array.from(new Set(phrase.split(/\s+/).filter((t) => t.length >= 2)));
    const scored = POSTS
      .map((p) => {
        const hay = `${p.title}\n${p.description}\n${p.tags.join(" ")}\n${p.body}`.toLowerCase();
        let idx = hay.indexOf(phrase);
        let score = idx !== -1 ? 100 : 0;
        if (idx === -1) {
          for (const t of tokens) {
            const i = hay.indexOf(t);
            if (i !== -1) {
              score += 10;
              if (idx === -1) idx = i;
            }
          }
        }
        if (score === 0) return null;
        const start = Math.max(0, idx - 80);
        const snippet = hay.slice(start, idx + Math.max(phrase.length, 40) + 120).replace(/\s+/g, " ").trim();
        return {
          slug: p.slug,
          title: p.title,
          publishedAt: p.publishedAt,
          tags: p.tags,
          score,
          snippet: (start > 0 ? "…" : "") + snippet + "…",
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, limit);
    return JSON.stringify({ ok: true, count: scored.length, query: q, tokens, results: scored }, null, 2);
  },
});
