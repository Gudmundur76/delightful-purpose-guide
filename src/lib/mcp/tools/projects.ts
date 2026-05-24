import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listProjectsTool = defineTool({
  name: "list_projects",
  description:
    "Admin: list active client projects (post-payment delivery). Returns id, client_name, client_email, tier, budget, status, start_date, target_delivery.",
  parameters: z.object({
    status: z.string().max(40).optional(),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  execute: async ({ status, limit }) => {
    let q = supabaseAdmin
      .from("projects")
      .select("id, client_name, client_email, tier, budget, status, start_date, target_delivery, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, projects: data }, null, 2);
  },
});

export const updateProjectStatusTool = defineTool({
  name: "update_project_status",
  description:
    "Admin: update a project's status (e.g. 'in_progress', 'delivered', 'on_hold') and optionally append notes.",
  parameters: z.object({
    id: z.string().uuid(),
    status: z.string().min(1).max(40),
    notes: z.string().max(4000).optional(),
    target_delivery: z.string().datetime().optional(),
  }),
  execute: async ({ id, status, notes, target_delivery }) => {
    const patch: { status: string; notes?: string; target_delivery?: string } = { status };
    if (notes !== undefined) patch.notes = notes;
    if (target_delivery) patch.target_delivery = target_delivery;
    const { data, error } = await supabaseAdmin
      .from("projects")
      .update(patch)
      .eq("id", id)
      .select("id, status, notes, target_delivery")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, project: data }, null, 2);
  },
});
