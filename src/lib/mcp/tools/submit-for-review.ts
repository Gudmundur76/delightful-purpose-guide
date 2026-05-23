import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const submitForReviewTool = defineTool({
  name: "submit_for_review",
  description:
    "Submit a preview URL for human review. Use after building or updating something autonomously — a human will approve/reject in the grow.contact /admin/reviews queue before anything goes live.",
  parameters: z.object({
    project_id: z
      .string()
      .min(1)
      .max(200)
      .describe("Identifier of the calling project (e.g. Lovable project id or slug)."),
    preview_url: z
      .string()
      .url()
      .max(2000)
      .describe("Live preview URL the reviewer can open."),
    notes: z
      .string()
      .max(4000)
      .optional()
      .describe("What changed, what to look at, any context for the reviewer."),
    submitted_by: z
      .string()
      .max(200)
      .optional()
      .describe("Optional caller identity (agent name, user, etc)."),
  }),
  execute: async ({ project_id, preview_url, notes, submitted_by }) => {
    const { data, error } = await supabaseAdmin
      .from("reviews")
      .insert({ project_id, preview_url, notes, submitted_by })
      .select("id, status, created_at")
      .single();
    if (error) {
      return JSON.stringify({ ok: false, error: error.message });
    }
    return JSON.stringify({
      ok: true,
      review: data,
      message:
        "Submitted. A human will review at https://grow.contact/admin/reviews.",
    });
  },
});
