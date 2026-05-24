import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listAdminsTool = defineTool({
  name: "list_admins",
  description: "List all users with the 'admin' role (user_id + created_at).",
  parameters: z.object({}),
  execute: async () => {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, created_at")
      .eq("role", "admin")
      .order("created_at", { ascending: false });
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, admins: data }, null, 2);
  },
});

export const grantRoleTool = defineTool({
  name: "grant_role",
  description: "Grant a role (admin | moderator | user) to a user_id. Idempotent — duplicates are ignored.",
  parameters: z.object({
    user_id: z.string().uuid(),
    role: z.enum(["admin", "moderator", "user"]),
  }),
  execute: async ({ user_id, role }) => {
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id, role }, { onConflict: "user_id,role" });
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, user_id, role }, null, 2);
  },
});

export const revokeRoleTool = defineTool({
  name: "revoke_role",
  description: "Revoke a role from a user_id.",
  parameters: z.object({
    user_id: z.string().uuid(),
    role: z.enum(["admin", "moderator", "user"]),
  }),
  execute: async ({ user_id, role }) => {
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", user_id)
      .eq("role", role);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, user_id, role, revoked: true }, null, 2);
  },
});
