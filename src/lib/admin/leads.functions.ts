import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) {
    throw new Error("Forbidden: admin role required");
  }
}

export const listScoredLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("leads")
      .select(
        "id, created_at, name, email, budget_tier, message, qualification_score, qualification_tier, qualification_reasoning, qualification_suggested_tier, auto_reply_subject, auto_reply_body, auto_replied_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      console.error("[admin/listLeads]", error);
      return { leads: [] as Array<Record<string, unknown>>, error: error.message };
    }
    return { leads: data ?? [], error: null };
  });

export const isCurrentUserAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    return { isAdmin: !!data };
  });
