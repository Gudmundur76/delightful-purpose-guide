import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listFaqItemsTool = defineTool({
  name: "list_faq_items",
  description: "List all FAQ items with id, question, answer, and order.",
  parameters: z.object({}),
  execute: async () => {
    const { data, error } = await supabaseAdmin
      .from("faq_items").select("id, question, answer, order_index, active")
      .order("order_index", { ascending: true });
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, items: data }, null, 2);
  },
});

export const updateFaqItemTool = defineTool({
  name: "update_faq_item",
  description: "Update a single FAQ item by id or by partial match on the question text. Change is logged.",
  parameters: z.object({
    id: z.string().uuid().optional(),
    question_match: z.string().min(2).max(255).optional(),
    question: z.string().min(1).max(500).optional(),
    answer: z.string().min(1).max(5000).optional(),
    reason: z.string().max(500).default(""),
  }),
  execute: async ({ id, question_match, question, answer, reason }) => {
    try {
      let target: { id: string; question: string; answer: string } | null = null;
      if (id) {
        const r = await supabaseAdmin.from("faq_items").select("id, question, answer").eq("id", id).maybeSingle();
        if (r.error) throw new Error(r.error.message);
        target = r.data;
      } else if (question_match) {
        const r = await supabaseAdmin.from("faq_items").select("id, question, answer").ilike("question", `%${question_match}%`).limit(1).maybeSingle();
        if (r.error) throw new Error(r.error.message);
        target = r.data;
      }
      if (!target) return JSON.stringify({ ok: false, error: "FAQ item not found" });
      const patch: { question?: string; answer?: string } = {};
      if (question !== undefined) patch.question = question;
      if (answer !== undefined) patch.answer = answer;
      if (Object.keys(patch).length === 0) return JSON.stringify({ ok: false, error: "No fields to update" });
      const { data, error } = await supabaseAdmin.from("faq_items").update(patch).eq("id", target.id).select("id, question, answer").maybeSingle();
      if (error) throw new Error(error.message);
      if (question !== undefined && question !== target.question) {
        await supabaseAdmin.from("content_edits").insert({ page: "faq", field: `question:${target.id}`, old_value: target.question, new_value: question, reason, changed_by: "mcp-agent" });
      }
      if (answer !== undefined && answer !== target.answer) {
        await supabaseAdmin.from("content_edits").insert({ page: "faq", field: `answer:${target.id}`, old_value: target.answer, new_value: answer, reason, changed_by: "mcp-agent" });
      }
      return JSON.stringify({ ok: true, ...data });
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});
