// Admin platform API — bearer-token gated dispatcher for the
// Self-Healing Website Platform dashboard. Reuses the MCP_SECRET so the
// existing dashboard.tsx passphrase unlocks both surfaces.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { normalizeDomain } from "@/lib/interventions/shared.server";

type Action =
  | { action: "stats" }
  | { action: "list_sites" }
  | { action: "get_site"; domain: string }
  | { action: "add_site"; domain: string; owner_email?: string; plan?: string }
  | { action: "update_site"; id: string; patch: Record<string, unknown> }
  | { action: "site_citations"; domain: string; days?: number }
  | { action: "site_interventions"; domain: string }
  | { action: "list_interventions"; status?: string; kind?: string; site_id?: string }
  | { action: "approve_intervention"; id: string }
  | { action: "reject_intervention"; id: string; reason?: string };

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

async function handle(body: Action) {
  switch (body.action) {
    case "stats": {
      const [{ count: siteCount }, { data: sites }, { count: fixCount }, { data: trend }] = await Promise.all([
        supabaseAdmin.from("intervention_sites").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("intervention_sites").select("ccs_score"),
        supabaseAdmin
          .from("interventions")
          .select("id", { count: "exact", head: true })
          .gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString()),
        supabaseAdmin
          .from("interventions")
          .select("created_at, status")
          .gte("created_at", new Date(Date.now() - 30 * 86400_000).toISOString())
          .order("created_at", { ascending: true }),
      ]);
      const scores = (sites ?? []).map((s) => s.ccs_score).filter((n): n is number => typeof n === "number");
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
      // Bucket by day
      const buckets: Record<string, number> = {};
      for (const r of trend ?? []) {
        const day = r.created_at.slice(0, 10);
        buckets[day] = (buckets[day] ?? 0) + 1;
      }
      return json({ site_count: siteCount ?? 0, avg_ccs: avg, fixes_30d: fixCount ?? 0, trend: buckets });
    }
    case "list_sites": {
      const { data, error } = await supabaseAdmin
        .from("intervention_sites")
        .select("id, domain, plan, ccs_score, status, last_auto_fix_at, notify_email, install_token, created_at, auto_fire_enabled")
        .order("created_at", { ascending: false });
      if (error) return json({ error: error.message }, 500);
      return json({ sites: data ?? [] });
    }
    case "get_site": {
      const domain = normalizeDomain(body.domain);
      const { data, error } = await supabaseAdmin
        .from("intervention_sites")
        .select("*")
        .eq("domain", domain)
        .maybeSingle();
      if (error) return json({ error: error.message }, 500);
      return json({ site: data });
    }
    case "add_site": {
      const domain = normalizeDomain(body.domain);
      if (!domain) return json({ error: "domain required" }, 400);
      const { data, error } = await supabaseAdmin
        .from("intervention_sites")
        .insert({
          domain,
          owner_user_id: null,
          notify_email: body.owner_email ?? null,
          plan: body.plan ?? "basic",
        })
        .select("*")
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ site: data });
    }
    case "update_site": {
      const { data, error } = await supabaseAdmin
        .from("intervention_sites")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update(body.patch as any)
        .eq("id", body.id)
        .select("*")
        .single();
      if (error) return json({ error: error.message }, 400);
      return json({ site: data });
    }
    case "site_citations": {
      const domain = normalizeDomain(body.domain);
      const days = body.days ?? 30;
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      const { data, error } = await supabaseAdmin
        .from("citation_events")
        .select("queried_at, engine, domain_was_cited, cited_position")
        .eq("domain_queried", domain)
        .gte("queried_at", since)
        .order("queried_at", { ascending: true });
      if (error) return json({ error: error.message }, 500);
      return json({ events: data ?? [] });
    }
    case "site_interventions": {
      const domain = normalizeDomain(body.domain);
      const { data: site } = await supabaseAdmin
        .from("intervention_sites")
        .select("id")
        .eq("domain", domain)
        .maybeSingle();
      if (!site) return json({ interventions: [] });
      const { data, error } = await supabaseAdmin
        .from("interventions")
        .select("id, kind, status, triggered_by, ccs_before, ccs_after, preview_text, created_at, approved_at, went_live_at, rejection_reason")
        .eq("site_id", site.id)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) return json({ error: error.message }, 500);
      return json({ interventions: data ?? [] });
    }
    case "list_interventions": {
      let q = supabaseAdmin
        .from("interventions")
        .select("id, site_id, kind, status, triggered_by, ccs_before, ccs_after, preview_text, created_at, intervention_sites!inner(domain)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (body.status) q = q.eq("status", body.status as "drafted" | "approved" | "live" | "rejected" | "superseded");
      if (body.kind) q = q.eq("kind", body.kind as "schema" | "llms_txt" | "robots_txt");
      if (body.site_id) q = q.eq("site_id", body.site_id);
      const { data, error } = await q;
      if (error) return json({ error: error.message }, 500);
      return json({ interventions: data ?? [] });
    }
    case "approve_intervention": {
      const { data, error } = await supabaseAdmin
        .from("interventions")
        .update({ status: "live", approved_at: new Date().toISOString(), went_live_at: new Date().toISOString() })
        .eq("id", body.id)
        .select("site_id")
        .single();
      if (error) return json({ error: error.message }, 400);
      if (data?.site_id) {
        await supabaseAdmin
          .from("intervention_sites")
          .update({ last_auto_fix_at: new Date().toISOString() })
          .eq("id", data.site_id);
      }
      return json({ ok: true });
    }
    case "reject_intervention": {
      const { error } = await supabaseAdmin
        .from("interventions")
        .update({ status: "rejected", rejection_reason: body.reason ?? null })
        .eq("id", body.id);
      if (error) return json({ error: error.message }, 400);
      return json({ ok: true });
    }
    default:
      return json({ error: "unknown action" }, 400);
  }
}

export const Route = createFileRoute("/api/public/admin/platform")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
        const expected = process.env.MCP_SECRET || process.env.ADMIN_API_KEY;
        if (!token || !expected || token !== expected) {
          return json({ error: "unauthorized" }, 401);
        }
        let body: Action;
        try {
          body = await request.json();
        } catch {
          return json({ error: "invalid json" }, 400);
        }
        try {
          return await handle(body);
        } catch (e) {
          return json({ error: e instanceof Error ? e.message : "unknown error" }, 500);
        }
      },
      GET: () => json({ error: "method not allowed" }, 405),
    },
  },
});
