// Public snippet endpoint — returns a self-executing JS payload that injects
// approved schema/JSON-LD interventions into the host site's <head>.
// URL: /api/public/inject/{token}.js
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function jsResponse(body: string, status = 200) {
  return new Response(body, {
    status,
    headers: {
      ...CORS,
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  });
}

export const Route = createFileRoute("/api/public/inject/$token")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ params, request }) => {
        const raw = params.token;
        // Accept "{uuid}.js" or "{uuid}"; strip extension.
        const token = raw.replace(/\.js$/, "");
        if (!/^[0-9a-f-]{36}$/i.test(token)) {
          return jsResponse("/* grow.contact: invalid token */", 400);
        }

        const { data: site } = await supabaseAdmin
          .from("intervention_sites")
          .select("id")
          .eq("install_token", token)
          .maybeSingle();
        if (!site) return jsResponse("/* grow.contact: unknown site */", 404);

        // Approved schema interventions only (snippet is client-side; robots/llms_txt are not injectable).
        const { data: rows } = await supabaseAdmin
          .from("interventions")
          .select("id, kind, payload")
          .eq("site_id", site.id)
          .eq("kind", "schema")
          .in("status", ["approved", "live"])
          .order("created_at", { ascending: false })
          .limit(20);

        const blocks: unknown[] = [];
        for (const r of rows ?? []) {
          const p = r.payload as { jsonld?: unknown } | null;
          if (p?.jsonld) blocks.push(p.jsonld);
          // Mark as live on first delivery.
          await supabaseAdmin.from("interventions").update({ status: "live", went_live_at: new Date().toISOString() }).eq("id", r.id).eq("status", "approved");
        }

        // Log delivery (fire-and-forget; don't block response).
        await supabaseAdmin.from("intervention_deliveries").insert({
          site_id: site.id,
          intervention_id: rows?.[0]?.id ?? null,
          delivery_method: "snippet",
          user_agent: request.headers.get("user-agent")?.slice(0, 500) ?? null,
          ip: request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        });

        const payload = JSON.stringify(blocks);
        const js = `/* grow.contact auto-fix */
(function(){try{var blocks=${payload};for(var i=0;i<blocks.length;i++){var s=document.createElement('script');s.type='application/ld+json';s.setAttribute('data-grow-auto-fix','1');s.text=JSON.stringify(blocks[i]);document.head.appendChild(s);}}catch(e){}})();`;
        return jsResponse(js);
      },
    },
  },
});
