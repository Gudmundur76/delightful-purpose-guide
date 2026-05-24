import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const tableRowCountsTool = defineTool({
  name: "table_row_counts",
  description:
    "Row counts for all main tables (scans, leads, orders, products, clients, projects, reviews, report_requests, email_send_log, suppressed_emails, user_roles). Quick database health snapshot.",
  parameters: z.object({}),
  execute: async () => {
    const tables = [
      "scans", "leads", "orders", "products", "clients", "projects",
      "reviews", "report_requests", "email_send_log", "suppressed_emails", "user_roles", "payments",
    ] as const;
    const counts: Record<string, number | string> = {};
    await Promise.all(
      tables.map(async (t) => {
        const { count, error } = await supabaseAdmin.from(t).select("*", { count: "exact", head: true });
        counts[t] = error ? `error: ${error.message}` : count ?? 0;
      }),
    );
    return JSON.stringify({ ok: true, counts }, null, 2);
  },
});

export const recentActivityForHostTool = defineTool({
  name: "recent_activity_for_host",
  description:
    "All recent activity tied to a host: scans, report_requests, and any leads/orders whose email domain matches. Useful when researching a prospect mid-conversation.",
  parameters: z.object({
    host: z.string().min(3).max(255),
    days: z.number().int().min(1).max(180).default(60),
  }),
  execute: async ({ host, days }) => {
    const clean = host.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();
    const since = new Date(Date.now() - days * 86_400_000).toISOString();
    const [scans, reports, leads, orders] = await Promise.all([
      supabaseAdmin.from("scans").select("id, scanned_at, url, overall").eq("host", clean).gte("scanned_at", since).order("scanned_at", { ascending: false }).limit(20),
      supabaseAdmin.from("report_requests").select("id, created_at, url, email, score").ilike("url", `%${clean}%`).gte("created_at", since).limit(20),
      supabaseAdmin.from("leads").select("id, created_at, name, email, qualification_tier").ilike("email", `%@${clean}`).gte("created_at", since).limit(20),
      supabaseAdmin.from("orders").select("id, created_at, customer_email, total_cents, status").ilike("customer_email", `%@${clean}`).gte("created_at", since).limit(20),
    ]);
    return JSON.stringify(
      {
        ok: true,
        host: clean,
        days,
        scans: scans.data ?? [],
        report_requests: reports.data ?? [],
        leads: leads.data ?? [],
        orders: orders.data ?? [],
      },
      null,
      2,
    );
  },
});
