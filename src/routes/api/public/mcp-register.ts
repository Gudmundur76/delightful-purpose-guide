// POST /api/public/mcp-register
// Called by the grow-mcp WordPress plugin to register a site's MCP endpoint
// with the grow.contact platform. Auth: install_token (UUID) matches a row in
// intervention_sites. No PII returned.
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const Body = z.object({
  install_token: z.string().regex(/^[0-9a-f-]{36}$/i),
  mcp_endpoint: z.string().url().max(500),
  discovery_url: z.string().url().max(500).optional(),
  site_url: z.string().url().max(500).optional(),
  tools_count: z.number().int().min(0).max(500).optional(),
  plugin_version: z.string().max(32).optional(),
});

export const Route = createFileRoute("/api/public/mcp-register")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        let parsed;
        try {
          parsed = Body.parse(await request.json());
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_payload" }), {
            status: 400,
            headers: { ...CORS, "Content-Type": "application/json" },
          });
        }

        const { data: site } = await supabaseAdmin
          .from("intervention_sites")
          .select("id")
          .eq("install_token", parsed.install_token)
          .maybeSingle();
        if (!site) {
          return new Response(JSON.stringify({ ok: false, error: "unknown_site" }), {
            status: 404,
            headers: { ...CORS, "Content-Type": "application/json" },
          });
        }

        const now = new Date().toISOString();
        await supabaseAdmin
          .from("intervention_sites")
          .update({
            mcp_endpoint: parsed.mcp_endpoint,
            mcp_registered_at: now,
            mcp_last_seen_at: now,
            mcp_tools_count: parsed.tools_count ?? null,
          })
          .eq("id", site.id);

        return new Response(JSON.stringify({ ok: true, registered_at: now }), {
          status: 200,
          headers: { ...CORS, "Content-Type": "application/json" },
        });
      },
    },
  },
});
