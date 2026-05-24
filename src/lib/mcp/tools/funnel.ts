import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const updateLeadTierTool = defineTool({
  name: "update_lead_tier",
  description:
    "Promote/demote a lead's qualification_tier with a reason. Lighter than requalify_lead — no score change required. Use to walk leads through the funnel (cold → warm → hot → paid).",
  parameters: z.object({
    lead_id: z.string().uuid(),
    tier: z.enum(["hot", "warm", "cold", "spam", "paid"]),
    reason: z.string().min(1).max(1000),
  }),
  execute: async ({ lead_id, tier, reason }) => {
    const { data, error } = await supabaseAdmin
      .from("leads")
      .update({ qualification_tier: tier, qualification_reasoning: reason })
      .eq("id", lead_id)
      .select("id, email, qualification_tier, qualification_reasoning")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, lead: data }, null, 2);
  },
});

export const createInvoiceTool = defineTool({
  name: "create_invoice",
  description:
    "Create a pending order (invoice) for a customer. Persists to the orders table with status='pending'. Use after a lead converts and you need to bill them.",
  parameters: z.object({
    customer_email: z.string().email(),
    amount_cents: z.number().int().min(100).max(10_000_000),
    currency: z.string().length(3).default("USD"),
    description: z.string().min(1).max(500),
    sku: z.string().max(80).optional(),
  }),
  execute: async ({ customer_email, amount_cents, currency, description, sku }) => {
    const items = [{ sku: sku ?? "custom", description, price_cents: amount_cents, qty: 1 }];
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_email,
        currency: currency.toUpperCase(),
        subtotal_cents: amount_cents,
        total_cents: amount_cents,
        items,
        status: "pending",
      })
      .select("id, customer_email, total_cents, currency, status, created_at")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, invoice: data }, null, 2);
  },
});
