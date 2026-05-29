// Public scan API. Auth: per-user API key (X-API-Key or Bearer).
// Enforces monthly quota from subscription_plans + a soft per-key rate limit.
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { hashApiKey } from "@/lib/monitoring/api-keys.functions";
import { consumeQuota } from "@/lib/monitoring/quota.server";
import { scanUrl } from "@/lib/check/scan.functions";
import { CORS_HEADERS, JSON_HEADERS, optionsResponse } from "@/lib/api/auth";
import { rateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";

const InputSchema = z.object({
  url: z.string().url().max(2048),
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

export const Route = createFileRoute("/api/public/v1/scan")({
  server: {
    handlers: {
      OPTIONS: () => optionsResponse(),
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        const bearer = auth?.toLowerCase().startsWith("bearer ")
          ? auth.slice(7).trim()
          : undefined;
        const provided = request.headers.get("x-api-key") || bearer;
        if (!provided) return json({ error: "missing_api_key" }, 401);

        const { data: key } = await supabaseAdmin
          .from("api_keys")
          .select("id,user_id,revoked_at")
          .eq("key_hash", hashApiKey(provided))
          .maybeSingle();
        if (!key || key.revoked_at) return json({ error: "invalid_api_key" }, 401);

        // Per-key soft rate limit: 30 / minute.
        if (rateLimit(`scan:${key.id}`, 30, 60_000)) {
          return new Response(
            JSON.stringify({ error: "rate_limited", retry_after_seconds: 60 }),
            { status: 429, headers: { ...JSON_HEADERS, "Retry-After": "60" } },
          );
        }

        let body: unknown;
        try { body = await request.json(); }
        catch { return json({ error: "invalid_json" }, 400); }
        const parsed = InputSchema.safeParse(body);
        if (!parsed.success) return json({ error: "invalid_input", issues: parsed.error.issues }, 400);

        let quota;
        try {
          quota = await consumeQuota(key.user_id);
        } catch (e) {
          const msg = (e as Error).message;
          if (msg.startsWith("quota_exceeded")) {
            return json({ error: "quota_exceeded", detail: msg }, 402);
          }
          throw e;
        }

        const result = await scanUrl({ data: { url: parsed.data.url, source: "api" } });

        // Log the request (best-effort).
        try {
          await supabaseAdmin.from("api_request_log").insert({
            user_id: key.user_id,
            api_key_id: key.id,
            endpoint: "/api/public/v1/scan",
            status: 200,
          });
          await supabaseAdmin
            .from("api_keys")
            .update({ last_used_at: new Date().toISOString() })
            .eq("id", key.id);
        } catch {}

        return new Response(
          JSON.stringify({
            ok: true,
            scan: result,
            quota: {
              plan: quota.plan.id,
              used: quota.used,
              limit: quota.plan.monthly_scan_quota,
              remaining: quota.remaining,
            },
          }),
          {
            status: 200,
            headers: {
              ...JSON_HEADERS,
              "X-RateLimit-Remaining": String(quota.remaining),
              "X-Quota-Plan": quota.plan.id,
            },
          },
        );
      },
    },
  },
});

// silence unused
void CORS_HEADERS;
void clientIpFromRequest;
