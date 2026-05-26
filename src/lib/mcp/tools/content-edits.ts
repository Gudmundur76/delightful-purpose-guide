import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listContentEditsTool = defineTool({
  name: "list_content_edits",
  description: "View history of content changes made via the MCP agent. Optional page filter.",
  parameters: z.object({
    page: z.string().min(1).max(64).optional(),
    limit: z.number().int().min(1).max(200).default(20),
  }),
  execute: async ({ page, limit }) => {
    let q = supabaseAdmin.from("content_edits")
      .select("id, page, field, old_value, new_value, reason, changed_by, changed_at")
      .order("changed_at", { ascending: false }).limit(limit);
    if (page) q = q.eq("page", page);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, edits: data }, null, 2);
  },
});

export const revertContentEditTool = defineTool({
  name: "revert_content_edit",
  description: "Revert a content_edits row by restoring its old_value to site_content. Requires confirm=true.",
  parameters: z.object({ id: z.string().uuid(), confirm: z.boolean() }),
  execute: async ({ id, confirm }) => {
    if (!confirm) return JSON.stringify({ ok: false, error: "confirm must be true" });
    const { data: edit, error } = await supabaseAdmin.from("content_edits").select("*").eq("id", id).maybeSingle();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    if (!edit) return JSON.stringify({ ok: false, error: "Edit not found" });
    if (!edit.page || !edit.field) return JSON.stringify({ ok: false, error: "Edit has no page/field to revert" });
    const restored = edit.old_value ?? "";
    // FAQ revert
    if (edit.page === "faq" && edit.field?.includes(":")) {
      const [kind, faqId] = edit.field.split(":");
      const patch: Record<string, string> = {};
      if (kind === "question") patch.question = restored;
      if (kind === "answer") patch.answer = restored;
      const { error: e2 } = await supabaseAdmin.from("faq_items").update(patch as never).eq("id", faqId);
      if (e2) return JSON.stringify({ ok: false, error: e2.message });
    } else {
      const { error: e2 } = await supabaseAdmin.from("site_content")
        .upsert({ page: edit.page, field: edit.field, value: restored }, { onConflict: "page,field" });
      if (e2) return JSON.stringify({ ok: false, error: e2.message });
    }
    await supabaseAdmin.from("content_edits").insert({
      page: edit.page, field: edit.field, old_value: edit.new_value, new_value: restored,
      reason: `revert of ${id}`, changed_by: "mcp-agent",
    });
    return JSON.stringify({ ok: true, reverted: { page: edit.page, field: edit.field, restored_value: restored } });
  },
});
