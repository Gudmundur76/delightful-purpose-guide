import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const CreateBriefInput = z.object({
  site: z.string().trim().min(1).max(255),
  title: z.string().trim().min(1).max(300),
  topic: z.string().trim().max(500).optional().default(""),
  intent: z.string().trim().max(100).optional().default(""),
  audience: z.string().trim().max(500).optional().default(""),
  keywords: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  content_type: z.string().trim().max(80).optional().default(""),
  target_word_count: z.number().int().min(100).max(20000).optional(),
});
export type CreateBriefInput = z.infer<typeof CreateBriefInput>;

const UpdateDraftInput = z.object({
  id: z.string().uuid(),
  body_html: z.string().max(1_000_000).optional(),
  title: z.string().trim().min(1).max(300).optional(),
  seo_score: z.number().int().min(0).max(100).optional(),
  geo_score: z.number().int().min(0).max(100).optional(),
  aeo_score: z.number().int().min(0).max(100).optional(),
  overall_score: z.number().int().min(0).max(100).optional(),
  checks: z.array(z.any()).optional(),
});

const SetStatusInput = z.object({
  id: z.string().uuid(),
  status: z.enum(["draft", "in_review", "approved", "rejected", "scheduled", "published"]),
  bumpVersion: z.boolean().optional(),
  scheduled_for: z.string().datetime().optional(),
});

const CreateDraftInput = z.object({
  brief_id: z.string().uuid().optional(),
  title: z.string().trim().min(1).max(300),
  body_html: z.string().max(1_000_000).optional().default(""),
});

export const listBriefsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("content_briefs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const createBriefFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateBriefInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: brief, error } = await supabase
      .from("content_briefs")
      .insert({
        site: data.site,
        title: data.title,
        topic: data.topic || null,
        intent: data.intent || null,
        audience: data.audience || null,
        keywords: data.keywords,
        content_type: data.content_type || null,
        target_word_count: data.target_word_count ?? null,
        created_by: userId,
      })
      .select("*")
      .single();
    if (error || !brief) throw new Error(error?.message ?? "insert failed");

    await supabase.from("agent_runs").insert({
      agent_type: "content",
      input: { brief_id: brief.id },
      status: "queued",
    });

    return brief;
  });

export const listDraftsFn = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("content_drafts")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getDraftFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: draft, error } = await supabase
      .from("content_drafts")
      .select("*")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    let brief: Record<string, string | number | boolean | null | string[]> | null = null;
    if (draft?.brief_id) {
      const { data: b } = await supabase
        .from("content_briefs")
        .select("*")
        .eq("id", draft.brief_id)
        .single();
      brief = (b ?? null) as unknown as typeof brief;
    }
    return { draft, brief };
  });



export const createDraftFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CreateDraftInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: draft, error } = await supabase
      .from("content_drafts")
      .insert({
        brief_id: data.brief_id ?? null,
        title: data.title,
        body_html: data.body_html ?? "",
        created_by: userId,
      })
      .select("*")
      .single();
    if (error || !draft) throw new Error(error?.message ?? "insert failed");
    return draft;
  });

export const updateDraftFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateDraftInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { id, ...rest } = data;
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) {
      if (v !== undefined) patch[k] = v;
    }
    if (Object.keys(patch).length === 0) return { ok: true };
    const { error } = await supabase.from("content_drafts").update(patch as never).eq("id", id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setDraftStatusFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SetStatusInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "published") patch.published_at = new Date().toISOString();
    if (data.status === "scheduled" && data.scheduled_for) patch.scheduled_for = data.scheduled_for;
    if (data.bumpVersion) {
      const { data: current } = await supabase
        .from("content_drafts")
        .select("version")
        .eq("id", data.id)
        .single();
      patch.version = (current?.version ?? 1) + 1;
    }
    const { error } = await supabase.from("content_drafts").update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);

    // Composio: when a draft flips to "published", draft LinkedIn posts for
    // every client with LinkedIn connected.
    if (data.status === "published") {
      try {
        const { data: draft } = await supabase
          .from("content_drafts")
          .select("title, brief_id")
          .eq("id", data.id)
          .maybeSingle();
        const title = (draft as { title?: string } | null)?.title ?? "New post";
        const briefId = (draft as { brief_id?: string } | null)?.brief_id ?? null;
        let slug = data.id;
        if (briefId) {
          const { data: brief } = await supabase
            .from("content_briefs")
            .select("site")
            .eq("id", briefId)
            .maybeSingle();
          slug = (brief as { site?: string } | null)?.site ?? data.id;
        }
        const triggers = await import("@/lib/composio/triggers.server");
        await triggers.onPostPublished({ title, slug, excerpt: null });
      } catch (e) {
        console.error("composio onPostPublished failed", e);
      }
    }
    return { ok: true };
  });

export const listCalendarFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ year: z.number().int(), month: z.number().int().min(1).max(12) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const start = new Date(Date.UTC(data.year, data.month - 1, 1)).toISOString();
    const end = new Date(Date.UTC(data.year, data.month, 1)).toISOString();
    const { data: rows, error } = await supabase
      .from("content_drafts")
      .select("id, title, status, scheduled_for, published_at, updated_at")
      .or(
        `and(status.eq.published,published_at.gte.${start},published_at.lt.${end}),and(status.eq.scheduled,scheduled_for.gte.${start},scheduled_for.lt.${end})`,
      )
      .limit(500);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
