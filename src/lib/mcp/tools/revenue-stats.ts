import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

interface OrderItem { slug?: string; name?: string; quantity?: number; price_cents?: number }

export const revenueStatsAliasTool = defineTool({
  name: "revenue_stats",
  description: "Captured-order revenue summary over the last N days: totals, per-product breakdown, per-month breakdown.",
  parameters: z.object({ window_days: z.number().int().min(1).max(365).default(30) }),
  execute: async ({ window_days }) => {
    const since = new Date(Date.now() - window_days * 86400000).toISOString();
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("total_cents, currency, status, captured_at, items")
      .eq("status", "captured")
      .gte("captured_at", since);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    const rows = data ?? [];
    const total = rows.reduce((s, r) => s + (r.total_cents ?? 0), 0);
    const count = rows.length;
    const avg = count ? Math.round(total / count) : 0;

    const byProduct = new Map<string, { slug: string; name: string; count: number; revenue_cents: number }>();
    for (const r of rows) {
      const items = (Array.isArray(r.items) ? r.items : []) as OrderItem[];
      for (const it of items) {
        const slug = it.slug ?? it.name ?? "unknown";
        const cur = byProduct.get(slug) ?? { slug, name: it.name ?? slug, count: 0, revenue_cents: 0 };
        cur.count += it.quantity ?? 1;
        cur.revenue_cents += (it.price_cents ?? 0) * (it.quantity ?? 1);
        byProduct.set(slug, cur);
      }
    }

    const byMonth = new Map<string, { month: string; revenue_cents: number; order_count: number }>();
    for (const r of rows) {
      const m = (r.captured_at ?? "").slice(0, 7);
      const cur = byMonth.get(m) ?? { month: m, revenue_cents: 0, order_count: 0 };
      cur.revenue_cents += r.total_cents ?? 0;
      cur.order_count += 1;
      byMonth.set(m, cur);
    }

    return JSON.stringify({
      ok: true,
      window_days,
      total_revenue_cents: total,
      order_count: count,
      avg_order_cents: avg,
      by_product: [...byProduct.values()].sort((a, b) => b.revenue_cents - a.revenue_cents),
      by_month: [...byMonth.values()].sort((a, b) => a.month.localeCompare(b.month)),
    }, null, 2);
  },
});
