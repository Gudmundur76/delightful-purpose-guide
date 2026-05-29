import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "node:crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("api_keys")
      .select("id,name,key_prefix,last_used_at,revoked_at,created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    return { keys: data ?? [] };
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ name: z.string().min(1).max(80) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const raw = `grw_live_${randomBytes(24).toString("base64url")}`;
    const prefix = raw.slice(0, 12);
    const key_hash = hashApiKey(raw);
    const { data: row, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        user_id: context.userId,
        name: data.name,
        key_prefix: prefix,
        key_hash,
      })
      .select("id,name,key_prefix,created_at")
      .single();
    if (error) throw new Error(error.message);
    // Raw key is only ever returned once.
    return { key: row, secret: raw };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("api_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
