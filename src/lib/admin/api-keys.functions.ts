import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error || !data) throw new Error("Forbidden: admin role required");
}

export interface ApiKeyRequest {
  id: string;
  email: string;
  company: string | null;
  plan: string;
  use_case: string | null;
  status: string;
  created_at: string;
  approved_at: string | null;
  notes: string | null;
}

export const listApiKeyRequests = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ requests: ApiKeyRequest[] }> => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("api_key_requests")
      .select(
        "id,email,company,plan,use_case,status,created_at,approved_at,notes",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { requests: (data ?? []) as ApiKeyRequest[] };
  });

// Generate `gk_live_<32 url-safe chars>` and return both plaintext + sha256 hash.
async function mintKey(): Promise<{ plaintext: string; hash: string; prefix: string }> {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const body = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "")
    .replace(/\//g, "")
    .replace(/=/g, "")
    .slice(0, 32);
  const plaintext = `gk_live_${body}`;
  const hashBuf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(plaintext),
  );
  const hash = Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { plaintext, hash, prefix: plaintext.slice(0, 12) };
}

export const approveApiKeyRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        requestId: z.string().uuid(),
        userId: z.string().uuid(),
        keyName: z.string().min(1).max(80).default("Analyst API"),
      })
      .parse(input),
  )
  .handler(
    async ({
      data,
      context,
    }): Promise<{
      ok: true;
      plaintext: string;
      prefix: string;
    }> => {
      await assertAdmin(context.userId);

      const { data: req, error: reqErr } = await supabaseAdmin
        .from("api_key_requests")
        .select("id,email,status")
        .eq("id", data.requestId)
        .maybeSingle();
      if (reqErr || !req) throw new Error("Request not found");
      if (req.status === "approved") throw new Error("Already approved");

      const { plaintext, hash, prefix } = await mintKey();

      const { error: insErr } = await supabaseAdmin.from("api_keys").insert({
        user_id: data.userId,
        name: data.keyName,
        key_hash: hash,
        key_prefix: prefix,
      });
      if (insErr) throw new Error(`Mint failed: ${insErr.message}`);

      const { error: updErr } = await supabaseAdmin
        .from("api_key_requests")
        .update({
          status: "approved",
          approved_by: context.userId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", data.requestId);
      if (updErr) throw new Error(`Status update failed: ${updErr.message}`);

      // Plaintext returned ONCE — never stored.
      return { ok: true, plaintext, prefix };
    },
  );

export const rejectApiKeyRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        requestId: z.string().uuid(),
        reason: z.string().max(500).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("api_key_requests")
      .update({
        status: "rejected",
        approved_by: context.userId,
        approved_at: new Date().toISOString(),
        notes: data.reason ?? null,
      })
      .eq("id", data.requestId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
