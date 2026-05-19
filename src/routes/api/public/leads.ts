import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendTransactionalEmailInternal } from "@/lib/email/send-internal";

const LeadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  budget_tier: z.enum(["tier_01", "tier_02", "tier_03"]),
  message: z.string().trim().min(1).max(2000),
});

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
          const json = await request.json();
          const parsed = LeadSchema.safeParse(json);
          if (!parsed.success) {
            return new Response(
              JSON.stringify({ error: "Invalid input", details: parsed.error.flatten() }),
              { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } },
            );
          }

          const { data: inserted, error } = await supabaseAdmin
            .from("leads")
            .insert(parsed.data)
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
          const data = parsed.data;
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

          return new Response(JSON.stringify({ success: true }), {
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
