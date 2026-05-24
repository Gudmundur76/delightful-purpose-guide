import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { POSTS } from "@/lib/blog/posts";

export const listBlogPostsTool = defineTool({
  name: "list_blog_posts",
  description:
    "List all blog posts on grow.contact with slug, title, description, publishedAt, tags. Optional tag filter and text search.",
  parameters: z.object({
    tag: z.string().max(60).optional(),
    search: z.string().max(200).optional().describe("Case-insensitive match against title + description"),
    limit: z.number().int().min(1).max(100).default(50),
  }),
  execute: async ({ tag, search, limit }) => {
    let posts = POSTS.slice();
    if (tag) posts = posts.filter((p) => p.tags.includes(tag));
    if (search) {
      const q = search.toLowerCase();
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    posts = posts
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
    return JSON.stringify(
      {
        ok: true,
        count: posts.length,
        posts: posts.map(({ body: _b, ...meta }) => ({
          ...meta,
          url: `https://grow.contact/blog/${meta.slug}`,
        })),
      },
      null,
      2,
    );
  },
});

export const getBlogPostTool = defineTool({
  name: "get_blog_post",
  description:
    "Get a full blog post by slug, including body. Use to quote or summarize grow.contact content.",
  parameters: z.object({
    slug: z.string().min(1).max(200),
  }),
  execute: async ({ slug }) => {
    const post = POSTS.find((p) => p.slug === slug);
    if (!post) return JSON.stringify({ ok: false, error: "not_found" });
    return JSON.stringify(
      { ok: true, post: { ...post, url: `https://grow.contact/blog/${slug}` } },
      null,
      2,
    );
  },
});
