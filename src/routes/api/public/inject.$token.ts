// Public snippet endpoint at /api/public/inject/{token}{.js|.llms.txt|.json}
// .js   → injects approved FAQPage JSON-LD into <head>
// .llms.txt → serves the approved llms.txt body for proxy
// .json → manifest for the WordPress plugin
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function resp(body: string, contentType: string, status = 200, extra: Record<string, string> = {}) {
  return new Response(body, {
    status,
    headers: {
      ...CORS,
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
      ...extra,
    },
  });
}

type SuffixKind = "js" | "llms_txt" | "manifest";
function parseToken(raw: string): { token: string; suffix: SuffixKind } | null {
  let token = raw;
  let suffix: SuffixKind = "js";
  if (token.endsWith(".llms.txt")) { token = token.slice(0, -".llms.txt".length); suffix = "llms_txt"; }
  else if (token.endsWith(".json")) { token = token.slice(0, -".json".length); suffix = "manifest"; }
  else if (token.endsWith(".js")) { token = token.slice(0, -".js".length); suffix = "js"; }
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  return { token, suffix };
}

export const Route = createFileRoute("/api/public/inject/$token")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ params, request }) => {
        const parsed = parseToken(params.token);
        if (!parsed) return resp("/* citation.is: invalid token */", "application/javascript", 400);

        const { data: site } = await supabaseAdmin
          .from("intervention_sites")
          .select("id")
          .eq("install_token", parsed.token)
          .maybeSingle();
        if (!site) return resp("/* citation.is: unknown site */", "application/javascript", 404);

        const ua = request.headers.get("user-agent")?.slice(0, 500) ?? null;
        const ip = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

        if (parsed.suffix === "llms_txt") {
          const { data: row } = await supabaseAdmin
            .from("interventions").select("id, payload")
            .eq("site_id", site.id).eq("kind", "llms_txt").in("status", ["approved", "live"])
            .order("created_at", { ascending: false }).limit(1).maybeSingle();
          await supabaseAdmin.from("intervention_deliveries").insert({ site_id: site.id, intervention_id: row?.id ?? null, delivery_method: "llms_txt_proxy", user_agent: ua, ip });
          if (!row) return resp("# citation.is: no approved llms.txt yet\n", "text/plain; charset=utf-8", 404);
          const body = ((row.payload as { content?: string } | null)?.content) ?? "";
          await supabaseAdmin.from("interventions").update({ status: "live", went_live_at: new Date().toISOString() }).eq("id", row.id).eq("status", "approved");
          return resp(body, "text/plain; charset=utf-8");
        }

        if (parsed.suffix === "manifest") {
          const { data: rows } = await supabaseAdmin
            .from("interventions").select("id, kind, payload, went_live_at, approved_at")
            .eq("site_id", site.id).in("status", ["approved", "live"])
            .order("created_at", { ascending: false }).limit(50);
          await supabaseAdmin.from("intervention_deliveries").insert({ site_id: site.id, intervention_id: rows?.[0]?.id ?? null, delivery_method: "wp_plugin", user_agent: ua, ip });
          return resp(JSON.stringify({ ok: true, interventions: rows ?? [] }), "application/json; charset=utf-8");
        }

        // default: .js snippet
        const { data: rows } = await supabaseAdmin
          .from("interventions").select("id, payload")
          .eq("site_id", site.id).eq("kind", "schema").in("status", ["approved", "live"])
          .order("created_at", { ascending: false }).limit(20);

        const blocks: unknown[] = [];
        for (const r of rows ?? []) {
          const p = r.payload as { jsonld?: unknown } | null;
          if (p?.jsonld) blocks.push(p.jsonld);
          await supabaseAdmin.from("interventions").update({ status: "live", went_live_at: new Date().toISOString() }).eq("id", r.id).eq("status", "approved");
        }
        await supabaseAdmin.from("intervention_deliveries").insert({ site_id: site.id, intervention_id: rows?.[0]?.id ?? null, delivery_method: "snippet", user_agent: ua, ip });

        const payload = JSON.stringify(blocks);
        const js = `/* citation.is auto-fix */
(function(){try{var blocks=${payload};for(var i=0;i<blocks.length;i++){var s=document.createElement('script');s.type='application/ld+json';s.setAttribute('data-grow-auto-fix','1');s.text=JSON.stringify(blocks[i]);document.head.appendChild(s);}}catch(e){}})();`;
        return resp(js, "application/javascript; charset=utf-8");
      },
    },
  },
});
