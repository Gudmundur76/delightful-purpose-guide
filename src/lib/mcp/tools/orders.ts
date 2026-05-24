import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listOrdersTool = defineTool({
  name: "list_orders",
  description:
    "Admin: list recent PayPal orders. Returns id, status, total_cents, currency, customer_email, items, created_at, captured_at.",
  parameters: z.object({
    status: z.enum(["pending", "captured", "failed", "refunded"]).optional(),
    limit: z.number().int().min(1).max(100).default(25),
  }),
  execute: async ({ status, limit }) => {
    let q = supabaseAdmin
      .from("orders")
      .select("id, status, total_cents, subtotal_cents, currency, customer_email, items, paypal_order_id, created_at, captured_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (status) q = q.eq("status", status);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, orders: data }, null, 2);
  },
});

export const revenueStatsTool = defineTool({
  name: "get_revenue_stats",
  description:
    "Admin: total captured revenue and order count over the last N days, broken down by currency.",
  parameters: z.object({
    days: z.number().int().min(1).max(365).default(30),
  }),
  execute: async ({ days }) => {
    const since = new Date(Date.now() - days * 86400000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("total_cents, currency, status, captured_at")
      .eq("status", "captured")
      .gte("captured_at", since);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const by: Record<string, { count: number; total_cents: number }> = {};
    for (const r of data ?? []) {
      const row = r as { total_cents: number; currency: string };
      by[row.currency] ??= { count: 0, total_cents: 0 };
      by[row.currency].count += 1;
      by[row.currency].total_cents += row.total_cents;
    }
    return JSON.stringify({ ok: true, days, by_currency: by }, null, 2);
  },
});
