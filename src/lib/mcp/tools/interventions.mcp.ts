import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

// Shared: load pending interventions for the signed-in user, or verify ownership of one.
async function loadOwnedIntervention(userId: string, interventionId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("interventions")
    .select("id, site_id, kind, status, preview_text, payload, intervention_sites!inner(owner_user_id, domain, install_token)")
    .eq("id", interventionId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return { notFound: true as const };
  // supabase returns joined row as object (not array) when inner join is 1:1
  const site = data.intervention_sites as unknown as { owner_user_id: string | null; domain: string; install_token: string };
  if (site?.owner_user_id !== userId) return { forbidden: true as const };
  return { ok: true as const, row: data, site };
}

function unauth() {
  return { content: [{ type: "text" as const, text: "Unauthenticated — sign in to manage interventions." }], isError: true as const };
}


export const listPendingInterventionsTool = defineTool({
  name: "list_pending_interventions",
  title: "List your pending intervention drafts",
  description:
    "When to use: user asks 'what fixes are ready?', 'show pending changes', or before calling `approve_intervention` so the agent knows which IDs exist. Returns only the signed-in user's drafts (status = 'drafted'), never other users'. No input. Returns: `{ count, items: [{ id, site_id, domain, kind, preview_text, created_at }] }`. Safe to poll — read-only.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauth();
    const userId = ctx.getUserId();
    if (!userId) return { content: [{ type: "text", text: "Missing user id." }], isError: true };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("interventions")
      .select("id, site_id, kind, preview_text, created_at, intervention_sites!inner(domain, owner_user_id)")
      .eq("status", "drafted")
      .eq("intervention_sites.owner_user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const items = (data ?? []).map((r) => ({
      id: r.id,
      site_id: r.site_id,
      domain: (r.intervention_sites as unknown as { domain: string }).domain,
      kind: r.kind,
      preview_text: r.preview_text,
      created_at: r.created_at,
    }));
    const payload = { count: items.length, items };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], structuredContent: payload };
  },
});

export const approveInterventionTool = defineTool({
  name: "approve_intervention",
  title: "Approve a drafted intervention",
  description:
    "When to use: user says 'approve fix X', 'ship it', or after they've reviewed a draft returned by `list_pending_interventions` / `auto_fix_*`. Flips the intervention from `drafted` to `approved` and sets `went_live_at`. Only the intervention's owner can approve. Input: `intervention_id` (uuid). Returns: `{ ok, id, kind, status, went_live_at, install_hint }`. After approval, the snippet at `/api/public/inject/{token}.js` (or the WP plugin) begins serving the payload. This is a WRITE — requires OAuth and ownership. Not idempotent past the first call.",
  inputSchema: {
    intervention_id: z.string().uuid().describe("UUID of a drafted intervention you own (returned by list_pending_interventions or any auto_fix_* tool)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ intervention_id }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauth();
    const userId = ctx.getUserId();
    if (!userId) return { content: [{ type: "text", text: "Missing user id." }], isError: true };

    const guard = await loadOwnedIntervention(userId, intervention_id);
    if ("notFound" in guard) return { content: [{ type: "text", text: "Intervention not found." }], isError: true };
    if ("forbidden" in guard) return { content: [{ type: "text", text: "Forbidden — you do not own this intervention." }], isError: true };
    if (guard.row.status !== "drafted") {
      return { content: [{ type: "text", text: `Cannot approve: status is '${guard.row.status}', expected 'drafted'.` }], isError: true };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("interventions")
      .update({ status: "approved", approved_by: userId, approved_at: now, went_live_at: now })
      .eq("id", intervention_id)
      .select("id, kind, status, went_live_at")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };

    const hint = guard.row.kind === "robots_txt"
      ? "robots.txt is not injectable client-side — paste `payload.recommended` into your server robots.txt, or install the WP plugin."
      : `Live at https://grow.contact/api/public/inject/${guard.site.install_token}${guard.row.kind === "llms_txt" ? ".llms.txt" : ".js"}`;
    const payload = { ok: true, ...data, install_hint: hint };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], structuredContent: payload };
  },
});

export const rejectInterventionTool = defineTool({
  name: "reject_intervention",
  title: "Reject a drafted intervention",
  description:
    "When to use: user says 'reject fix X', 'discard', or the draft is wrong. Flips a `drafted` intervention to `rejected` with an optional reason. Only the owner can reject. Input: `intervention_id` (uuid), `reason` (optional string ≤ 500 chars, stored on the row and in audit log). Returns: `{ ok, id, status, rejection_reason }`. WRITE — requires OAuth and ownership.",
  inputSchema: {
    intervention_id: z.string().uuid().describe("UUID of a drafted intervention you own."),
    reason: z.string().max(500).optional().describe("Optional short reason, shown in the audit log."),
  },
  annotations: { readOnlyHint: false, destructiveHint: true, openWorldHint: false },
  handler: async ({ intervention_id, reason }, ctx: ToolContext) => {
    if (!ctx.isAuthenticated()) return unauth();
    const userId = ctx.getUserId();
    if (!userId) return { content: [{ type: "text", text: "Missing user id." }], isError: true };

    const guard = await loadOwnedIntervention(userId, intervention_id);
    if ("notFound" in guard) return { content: [{ type: "text", text: "Intervention not found." }], isError: true };
    if ("forbidden" in guard) return { content: [{ type: "text", text: "Forbidden — you do not own this intervention." }], isError: true };
    if (guard.row.status !== "drafted") {
      return { content: [{ type: "text", text: `Cannot reject: status is '${guard.row.status}'.` }], isError: true };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("interventions")
      .update({ status: "rejected", rejection_reason: reason ?? null })
      .eq("id", intervention_id)
      .select("id, status, rejection_reason")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const payload = { ok: true, ...data };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], structuredContent: payload };
  },
});
