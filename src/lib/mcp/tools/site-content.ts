import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function logEdit(page: string, field: string, oldVal: string | null, newVal: string, reason: string | null) {
  await supabaseAdmin.from("content_edits").insert({
    page, field, old_value: oldVal, new_value: newVal, reason, changed_by: "mcp-agent",
  });
}

async function upsertField(page: string, field: string, value: string, reason: string | null) {
  const { data: existing } = await supabaseAdmin
    .from("site_content").select("value").eq("page", page).eq("field", field).maybeSingle();
  const oldVal = existing?.value ?? null;
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ page, field, value }, { onConflict: "page,field" });
  if (error) throw new Error(error.message);
  await logEdit(page, field, oldVal, value, reason);
}

export const updatePageContentTool = defineTool({
  name: "update_page_content",
  description: "Update a text field on any page of the site. Stored in site_content; change is logged to content_edits.",
  parameters: z.object({
    page: z.string().min(1).max(64),
    field: z.string().min(1).max(128),
    value: z.string().max(20000),
    reason: z.string().max(500).default(""),
  }),
  execute: async ({ page, field, value, reason }) => {
    try {
      await upsertField(page, field, value, reason || null);
      return JSON.stringify({ ok: true, page, field, updated_value: value });
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});

export const updateHeroTool = defineTool({
  name: "update_hero",
  description: "Update the homepage hero (headline, subheadline, cta_text). All fields optional; only provided fields change.",
  parameters: z.object({
    headline: z.string().max(500).optional(),
    subheadline: z.string().max(1000).optional(),
    cta_text: z.string().max(120).optional(),
    reason: z.string().max(500).default(""),
  }),
  execute: async ({ headline, subheadline, cta_text, reason }) => {
    try {
      const updated: Record<string, string> = {};
      if (headline !== undefined) { await upsertField("home", "hero_headline", headline, reason || null); updated.headline = headline; }
      if (subheadline !== undefined) { await upsertField("home", "hero_subheadline", subheadline, reason || null); updated.subheadline = subheadline; }
      if (cta_text !== undefined) { await upsertField("home", "cta_label", cta_text, reason || null); updated.cta_text = cta_text; }
      return JSON.stringify({ ok: true, updated });
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});

export const getPageContentTool = defineTool({
  name: "get_page_content",
  description: "Read all editable content fields for a page from site_content.",
  parameters: z.object({ page: z.string().min(1).max(64) }),
  execute: async ({ page }) => {
    const { data, error } = await supabaseAdmin
      .from("site_content").select("field, value").eq("page", page);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const fields: Record<string, string> = {};
    for (const row of data ?? []) fields[row.field] = row.value;
    return JSON.stringify({ ok: true, page, fields }, null, 2);
  },
});
