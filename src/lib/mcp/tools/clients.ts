import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listClientsTool = defineTool({
  name: "list_clients",
  description: "List CRM clients with id, name, slug, domain, notes, created_at.",
  parameters: z.object({
    search: z.string().max(200).optional().describe("Match against name/slug/domain"),
    limit: z.number().int().min(1).max(100).default(50),
  }),
  execute: async ({ search, limit }) => {
    let q = supabaseAdmin
      .from("clients")
      .select("id, name, slug, domain, notes, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (search) q = q.or(`name.ilike.%${search}%,slug.ilike.%${search}%,domain.ilike.%${search}%`);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, clients: data }, null, 2);
  },
});

export const createClientTool = defineTool({
  name: "create_client",
  description: "Create a new CRM client. Slug must be unique.",
  parameters: z.object({
    name: z.string().min(1).max(200),
    slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "lowercase, digits, hyphens"),
    domain: z.string().max(255).optional(),
    notes: z.string().max(4000).optional(),
    created_by: z.string().uuid().describe("UUID of admin user creating this client"),
  }),
  execute: async ({ name, slug, domain, notes, created_by }) => {
    const { data, error } = await supabaseAdmin
      .from("clients")
      .insert({ name, slug, domain, notes, created_by })
      .select("id, name, slug, created_at")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, client: data }, null, 2);
  },
});
