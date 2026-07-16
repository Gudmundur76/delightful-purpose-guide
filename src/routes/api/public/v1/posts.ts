import { createFileRoute } from "@tanstack/react-router";
import { POSTS } from "@/lib/blog/posts";
import { jsonResponse, optionsResponse, requireApiKey } from "@/lib/api/auth";

export const Route = createFileRoute("/api/public/v1/posts")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async ({ request }) => {
        const unauth = requireApiKey(request);
        if (unauth) return unauth;
        const data = POSTS.map((p) => ({
          slug: p.slug,
          title: p.title,
          description: p.description,
          publishedAt: p.publishedAt,
          readingMinutes: p.readingMinutes,
          tags: p.tags,
          url: `https://citation.is/blog/${p.slug}`,
        }));
        return jsonResponse({ count: data.length, posts: data });
      },
    },
  },
});
