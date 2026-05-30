import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const Schema = z.object({
  email: z.string().trim().email().max(255),
  company: z.string().trim().max(255).optional().default(""),
  plan: z.enum(["starter", "pro", "enterprise"]),
  use_case: z.string().trim().max(2000).optional().default(""),
  website: z.string().max(0).optional(), // honeypot
});

const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  );
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/v1/api-key-requests")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: corsHeaders }),
      POST: async ({ request }) => {
        try {
          const ip = getClientIp(request);
          if (rateLimited(ip)) {
            return new Response(
              JSON.stringify({ error: "Too many requests" }),
              {
                status: 429,
                headers: {
                  "Content-Type": "application/json",
                  "Retry-After": "60",
                  ...corsHeaders,
                },
              },
            );
          }

          const json = await request.json().catch(() => null);
          const parsed = Schema.safeParse(json);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({
                error: "Invalid input",
                details: parsed.error.flatten(),
              }),
              {
                status: 400,
                headers: { "Content-Type": "application/json", ...corsHeaders },
              },
            );
          }

          // Honeypot — pretend success
          if (parsed.data.website && parsed.data.website.length > 0) {
            return new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          const { email, company, plan, use_case } = parsed.data;

          const { error } = await supabaseAdmin
            .from("api_key_requests")
            .insert({
              email,
              company: company || null,
              plan,
              use_case: use_case || null,
              status: "pending",
            });

          if (error) {
            console.error("api_key_requests insert failed", error);
            return new Response(
              JSON.stringify({ error: "Could not save request" }),
              {
                status: 500,
                headers: {
                  "Content-Type": "application/json",
                  ...corsHeaders,
                },
              },
            );
          }

          // Also drop into leads so it shows up in the admin lead feed.
          await supabaseAdmin.from("leads").insert({
            email,
            name: company || email,
            message: `API access request (${plan}): ${use_case || "no use case provided"}`,
            budget_tier:
              plan === "enterprise"
                ? "tier_03"
                : plan === "pro"
                  ? "tier_02"
                  : "tier_01",
            source: "for-analysts",
          });

          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (err) {
          console.error("api-key-requests handler error", err);
          return new Response(
            JSON.stringify({ error: "Internal error" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            },
          );
        }
      },
    },
  },
});
