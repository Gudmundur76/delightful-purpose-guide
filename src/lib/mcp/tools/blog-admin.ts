import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function findPost(id?: string, slug?: string) {
  if (id) {
    const r = await supabaseAdmin.from("blog_posts").select("*").eq("id", id).maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  }
  if (slug) {
    const r = await supabaseAdmin.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  }
  return null;
}

export const listBlogDraftsTool = defineTool({
  name: "list_blog_drafts",
  description: "List all unpublished blog post drafts.",
  parameters: z.object({}),
  execute: async () => {
    const { data, error } = await supabaseAdmin
      .from("blog_posts").select("id, title, slug, created_at, excerpt")
      .eq("published", false).order("created_at", { ascending: false });
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, drafts: data }, null, 2);
  },
});

export const updateBlogPostTool = defineTool({
  name: "update_blog_post",
  description: "Edit a blog post by id or slug. All editable fields optional.",
  parameters: z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(1).max(255).optional(),
    title: z.string().min(1).max(500).optional(),
    body: z.string().max(200000).optional(),
    excerpt: z.string().max(2000).optional(),
    tags: z.array(z.string().min(1).max(64)).max(20).optional(),
    published: z.boolean().optional(),
  }),
  execute: async ({ id, slug, title, body, excerpt, tags, published }) => {
    try {
      const post = await findPost(id, slug);
      if (!post) return JSON.stringify({ ok: false, error: "Post not found" });
      const patch: Record<string, unknown> = {};
      if (title !== undefined) patch.title = title;
      if (body !== undefined) patch.body = body;
      if (excerpt !== undefined) patch.excerpt = excerpt;
      if (tags !== undefined) patch.tags = tags;
      if (published !== undefined) {
        patch.published = published;
        if (published && !post.published_at) patch.published_at = new Date().toISOString();
      }
      const { data, error } = await supabaseAdmin.from("blog_posts").update(patch as never).eq("id", post.id).select("id, slug, title, published").maybeSingle();
      if (error) throw new Error(error.message);
      return JSON.stringify({ ok: true, ...data });
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});

export const publishBlogPostTool = defineTool({
  name: "publish_blog_post",
  description: "Publish a draft blog post by id or slug.",
  parameters: z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(1).max(255).optional(),
  }),
  execute: async ({ id, slug }) => {
    try {
      const post = await findPost(id, slug);
      if (!post) return JSON.stringify({ ok: false, error: "Post not found" });
      const now = new Date().toISOString();
      const { data, error } = await supabaseAdmin.from("blog_posts")
        .update({ published: true, published_at: post.published_at ?? now })
        .eq("id", post.id).select("id, slug, title, published_at").maybeSingle();
      if (error) throw new Error(error.message);
      return JSON.stringify({ ok: true, ...data });
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});

export const deleteBlogPostTool = defineTool({
  name: "delete_blog_post",
  description: "Permanently delete a blog post. Requires confirm=true.",
  parameters: z.object({
    id: z.string().uuid(),
    confirm: z.boolean(),
  }),
  execute: async ({ id, confirm }) => {
    if (!confirm) return JSON.stringify({ ok: false, error: "confirm must be true" });
    const { error } = await supabaseAdmin.from("blog_posts").delete().eq("id", id);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, deleted_id: id });
  },
});
