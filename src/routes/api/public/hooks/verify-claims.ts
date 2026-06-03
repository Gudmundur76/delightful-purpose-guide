// Weekly cron entrypoint — re-runs claim extraction + contradiction lint
// across every registered MCP-enabled intervention_site. Called by pg_cron.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/hooks/verify-claims")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
        const expected =
          process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
        const apikey = request.headers.get("apikey");
        if (!expected || (auth !== expected && apikey !== expected)) {
          return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Pick registered MCP sites that haven't been re-verified in 7+ days
        const cutoff = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
        const { data: sites, error } = await supabaseAdmin
          .from("intervention_sites")
          .select("id, domain, mcp_endpoint")
          .not("mcp_endpoint", "is", null)
          .limit(10);

        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        const results: Array<{ host: string; ok: boolean; note?: string }> = [];
        const mcpUrl = new URL(request.url);
        const mcpEndpoint = `${mcpUrl.protocol}//${mcpUrl.host}/api/public/mcp`;
        const mcpSecret = process.env.MCP_SECRET;
        if (!mcpSecret) {
          return new Response(JSON.stringify({ ok: false, error: "MCP_SECRET missing" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }

        for (const site of sites ?? []) {
          // Skip if recently verified
          const { data: recent } = await supabaseAdmin
            .from("site_claims")
            .select("verified_at")
            .eq("host", site.domain)
            .order("verified_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (recent?.verified_at && recent.verified_at > cutoff) {
            results.push({ host: site.domain, ok: true, note: "skipped (fresh)" });
            continue;
          }

          // Call MCP extract_and_verify_claims for the site homepage
          try {
            const url = `https://${site.domain}/`;
            const r = await fetch(mcpEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json, text/event-stream",
                Authorization: `Bearer ${mcpSecret}`,
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "tools/call",
                params: {
                  name: "extract_and_verify_claims",
                  arguments: { url, verify: true, max_claims: 12 },
                },
              }),
              signal: AbortSignal.timeout(60000),
            });
            if (!r.ok) {
              results.push({ host: site.domain, ok: false, note: `extract ${r.status}` });
              continue;
            }
            // Lint
            await fetch(mcpEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json, text/event-stream",
                Authorization: `Bearer ${mcpSecret}`,
              },
              body: JSON.stringify({
                jsonrpc: "2.0",
                id: 2,
                method: "tools/call",
                params: {
                  name: "lint_site_contradictions",
                  arguments: { host: site.domain },
                },
              }),
              signal: AbortSignal.timeout(45000),
            });
            results.push({ host: site.domain, ok: true });
          } catch (err) {
            results.push({
              host: site.domain,
              ok: false,
              note: err instanceof Error ? err.message : String(err),
            });
          }
        }

        return new Response(
          JSON.stringify({ ok: true, processed: results.length, results }, null, 2),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
});
