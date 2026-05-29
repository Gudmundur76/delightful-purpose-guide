// Shared helpers for the Auto-Fix Intervention Layer.
// Server-only: never import from client code.
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type InterventionKind = "schema" | "llms_txt" | "robots_txt";
export type InterventionStatus = "drafted" | "approved" | "live" | "rejected" | "superseded";
export type InterventionTrigger = "auto_ccs_drop" | "manual" | "scheduled";

export function normalizeDomain(input: string): string {
  return input.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
}

/**
 * Find or create the intervention_site row for (owner, domain).
 * If ownerUserId is null (e.g. MCP/system-triggered with no auth), reuse an existing
 * site for the domain or create an unowned placeholder.
 */
export async function getOrCreateSite(opts: {
  ownerUserId: string | null;
  domain: string;
  notifyEmail?: string | null;
}): Promise<{ id: string; install_token: string; owner_user_id: string | null }> {
  const domain = normalizeDomain(opts.domain);

  if (opts.ownerUserId) {
    const { data: existing } = await supabaseAdmin
      .from("intervention_sites")
      .select("id, install_token, owner_user_id")
      .eq("owner_user_id", opts.ownerUserId)
      .eq("domain", domain)
      .maybeSingle();
    if (existing) return existing;

    const { data: created, error } = await supabaseAdmin
      .from("intervention_sites")
      .insert({ owner_user_id: opts.ownerUserId, domain, notify_email: opts.notifyEmail ?? null })
      .select("id, install_token, owner_user_id")
      .single();
    if (error) throw new Error(`getOrCreateSite: ${error.message}`);
    return created;
  }

  // System path — first site for this domain wins.
  const { data: any } = await supabaseAdmin
    .from("intervention_sites")
    .select("id, install_token, owner_user_id")
    .eq("domain", domain)
    .limit(1)
    .maybeSingle();
  if (any) return any;
  throw new Error("No site exists for domain and no owner provided");
}

export async function draftIntervention(opts: {
  siteId: string;
  kind: InterventionKind;
  payload: Record<string, unknown>;
  previewText?: string;
  triggeredBy: InterventionTrigger;
  ccsBefore?: number | null;
}): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("interventions")
    .insert({
      site_id: opts.siteId,
      kind: opts.kind,
      status: "drafted",
      payload: opts.payload,
      preview_text: opts.previewText ?? null,
      triggered_by: opts.triggeredBy,
      ccs_before: opts.ccsBefore ?? null,
    })
    .select("id")
    .single();
  if (error) throw new Error(`draftIntervention: ${error.message}`);
  return data.id;
}

/** Mark older drafted/approved interventions of the same kind as superseded. */
export async function supersedeOlder(siteId: string, kind: InterventionKind, exceptId: string) {
  await supabaseAdmin
    .from("interventions")
    .update({ status: "superseded" })
    .eq("site_id", siteId)
    .eq("kind", kind)
    .in("status", ["drafted", "approved", "live"])
    .neq("id", exceptId);
}

export async function fetchTextSafe(url: string, timeoutMs = 8000): Promise<{ ok: boolean; status: number; body: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "User-Agent": "grow.contact-auto-fix/1.0" } });
    const body = await res.text();
    return { ok: res.ok, status: res.status, body: body.slice(0, 200_000) };
  } catch {
    return { ok: false, status: 0, body: "" };
  } finally {
    clearTimeout(t);
  }
}
