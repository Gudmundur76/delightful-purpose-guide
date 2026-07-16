import { createFileRoute } from "@tanstack/react-router";
import { POSTS } from "@/lib/blog/posts";
import { jsonResponse, optionsResponse, requireApiKey } from "@/lib/api/auth";

export const Route = createFileRoute("/api/public/v1/posts/$slug")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),
      GET: async ({ request, params }) => {
        const unauth = requireApiKey(request);
        if (unauth) return unauth;
        const post = POSTS.find((p) => p.slug === params.slug);
        if (!post) return jsonResponse({ error: "Post not found" }, 404);
        return jsonResponse({
          ...post,
          url: `https://citation.is/blog/${post.slug}`,
        });
      },
    },
  },
});
