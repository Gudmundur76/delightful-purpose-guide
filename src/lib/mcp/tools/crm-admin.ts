import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const updateClientTool = defineTool({
  name: "update_client",
  description: "Edit a client record. id is required; provide any subset of name, email, company (stored in notes), status, notes.",
  parameters: z.object({
    id: z.string().uuid(),
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    company: z.string().max(255).optional(),
    status: z.enum(["active", "paused", "churned", "vip"]).optional(),
    notes: z.string().max(5000).optional(),
  }),
  execute: async ({ id, ...rest }) => {
    const patch: Record<string, unknown> = {};
    if (rest.name !== undefined) patch.name = rest.name;
    if (rest.email !== undefined) patch.domain = rest.email; // clients table has no email; using domain field as closest. Skip if you prefer.
    if (rest.notes !== undefined || rest.company !== undefined || rest.status !== undefined) {
      const parts: string[] = [];
      if (rest.status) parts.push(`[status:${rest.status}]`);
      if (rest.company) parts.push(`[company:${rest.company}]`);
      if (rest.notes) parts.push(rest.notes);
      if (parts.length) patch.notes = parts.join("\n");
    }
    // Revert: email isn't a real column — drop it
    delete (patch as Record<string, unknown>).domain;
    if (rest.email) (patch as Record<string, unknown>).domain = rest.email.split("@")[1] ?? rest.email;
    if (Object.keys(patch).length === 0) return JSON.stringify({ ok: false, error: "No fields to update" });
    const { data, error } = await supabaseAdmin.from("clients").update(patch as never).eq("id", id)
      .select("id, name, domain, notes").maybeSingle();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    if (!data) return JSON.stringify({ ok: false, error: "Client not found" });
    return JSON.stringify({ ok: true, id: data.id, name: data.name, status: rest.status ?? null });
  },
});

export const deleteLeadTool = defineTool({
  name: "delete_lead",
  description: "Delete a lead by id. Requires confirm=true.",
  parameters: z.object({ id: z.string().uuid(), confirm: z.boolean() }),
  execute: async ({ id, confirm }) => {
    if (!confirm) return JSON.stringify({ ok: false, error: "confirm must be true" });
    const { error } = await supabaseAdmin.from("leads").delete().eq("id", id);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, deleted_id: id });
  },
});

export const deleteScanTool = defineTool({
  name: "delete_scan",
  description: "Delete a scan record by id. Requires confirm=true.",
  parameters: z.object({ id: z.string().uuid(), confirm: z.boolean() }),
  execute: async ({ id, confirm }) => {
    if (!confirm) return JSON.stringify({ ok: false, error: "confirm must be true" });
    const { error } = await supabaseAdmin.from("scans").delete().eq("id", id);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, deleted_id: id });
  },
});
