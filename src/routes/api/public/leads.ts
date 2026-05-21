import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailInternal } from "@/lib/email/send-internal";

const LeadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  budget_tier: z.enum(["tier_01", "tier_02", "tier_03"]),
  message: z.string().trim().min(1).max(2000),
  // Honeypot — real users leave this empty. Bots tend to fill every field.
  website: z.string().max(0).optional(),
});

// Simple in-memory sliding-window rate limit per IP. Resets when the worker
// recycles, which is acceptable for an anti-spam guard on a contact form.
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

export const Route = createFileRoute("/api/public/leads")({
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
              { status: 429, headers: { "Content-Type": "application/json", "Retry-After": "60", ...corsHeaders } },
            );
          }

          const json = await request.json();
          const parsed = LeadSchema.safeParse(json);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: "Invalid input", details: parsed.error.flatten() }),
              { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
            );
          }

          // Honeypot tripped — quietly return success so bots stop retrying.
          if (parsed.data.website && parsed.data.website.length > 0) {
            return new Response(JSON.stringify({ success: true }), {
              status: 200,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            });
          }

          const { website: _hp, ...leadData } = parsed.data;

          const { data: inserted, error } = await supabaseAdmin
            .from("leads")
            .insert(leadData)
            .select("id")
            .single();
          if (error) {
            console.error("Lead insert failed:", error);
            return new Response(
              JSON.stringify({ error: "Failed to save lead" }),
              { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } },
            );
          }

          // Fire emails — failures must not break the user-facing 200.
          const leadId = inserted?.id ?? crypto.randomUUID();
          const data = leadData;
          const emailData = {
            name: data.name,
            email: data.email,
            budgetTier: data.budget_tier,
            message: data.message,
          };

          // Run both in parallel; swallow errors.
          await Promise.allSettled([
            sendTransactionalEmailInternal({
              templateName: "lead-confirmation",
              recipientEmail: data.email,
              idempotencyKey: `lead-confirm-${leadId}`,
              templateData: emailData,
            }).catch((e) => console.error("lead-confirmation send failed", e)),
            sendTransactionalEmailInternal({
              templateName: "lead-notification",
              idempotencyKey: `lead-notify-${leadId}`,
              templateData: emailData,
            }).catch((e) => console.error("lead-notification send failed", e)),
          ]);

          return new Response(JSON.stringify({ success: true, id: leadId }), {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        } catch (err) {
          console.error("Lead route error:", err);
          return new Response(JSON.stringify({ error: "Server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          });
        }
      },
    },
  },
});
