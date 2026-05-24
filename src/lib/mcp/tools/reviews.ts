import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listPendingReviewsTool = defineTool({
  name: "list_pending_reviews",
  description:
    "List submissions awaiting human review (from submit_for_review). Returns id, project_id, preview_url, notes, submitted_by, created_at.",
  parameters: z.object({
    limit: z.number().int().min(1).max(50).default(20),
  }),
  execute: async ({ limit }) => {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .select("id, project_id, preview_url, notes, submitted_by, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, reviews: data }, null, 2);
  },
});

export const updateReviewStatusTool = defineTool({
  name: "update_review_status",
  description:
    "Approve or reject a pending review. Status must be 'approved' or 'rejected'. Optionally include review_notes.",
  parameters: z.object({
    id: z.string().uuid().describe("Review id from list_pending_reviews."),
    status: z.enum(["approved", "rejected"]),
    review_notes: z.string().max(4000).optional(),
  }),
  execute: async ({ id, status, review_notes }) => {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .update({
        status,
        review_notes: review_notes ?? null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("id, status, reviewed_at, review_notes")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, review: data }, null, 2);
  },
});
