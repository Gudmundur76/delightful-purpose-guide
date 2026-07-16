import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const searchScansTool = defineTool({
  name: "search_scans",
  description:
    "Search scans by URL substring. Returns matching scans ordered by most recent.",
  parameters: z.object({
    url_contains: z.string().min(2).max(255),
    limit: z.number().int().min(1).max(50).default(20),
  }),
  execute: async ({ url_contains, limit }) => {
    const { data, error } = await supabaseAdmin
      .from("scans")
      .select("id, url, host, overall, semantic, jsonld, llms, citability, speed, scanned_at, source")
      .ilike("url", `%${url_contains}%`)
      .order("scanned_at", { ascending: false })
      .limit(limit);
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, scans: data }, null, 2);
  },
});

export const listReportRequestsTool = defineTool({
  name: "list_report_requests",
  description:
    "Admin: list email addresses that requested full GEO reports via /check. Returns id, url, email, score, source, created_at.",
  parameters: z.object({
    limit: z.number().int().min(1).max(100).default(25),
    min_score: z.number().int().min(0).max(100).optional(),
  }),
  execute: async ({ limit, min_score }) => {
    let q = supabaseAdmin
      .from("report_requests")
      .select("id, url, email, score, source, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (typeof min_score === "number") q = q.gte("score", min_score);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, count: data?.length ?? 0, requests: data }, null, 2);
  },
});

export const suppressEmailTool = defineTool({
  name: "suppress_email",
  description:
    "Add an email to the suppression list so we never send to it again (bounces, complaints, unsubscribes).",
  parameters: z.object({
    email: z.string().email().max(320),
    reason: z.enum(["bounce", "complaint", "unsubscribe", "manual"]),
    metadata: z.record(z.string(), z.unknown()).optional(),
  }),
  execute: async ({ email, reason, metadata }) => {
    const { data, error } = await supabaseAdmin
      .from("suppressed_emails")
      .insert({ email: email.toLowerCase(), reason, metadata: (metadata ?? null) as never })
      .select("id, email, reason, created_at")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, suppression: data }, null, 2);
  },
});

export const activityFeedTool = defineTool({
  name: "get_activity_feed",
  description:
    "Combined recent activity across citation.is: latest scans, leads, orders, reviews. Great for a daily ops summary.",
  parameters: z.object({
    limit_per_type: z.number().int().min(1).max(20).default(5),
  }),
  execute: async ({ limit_per_type }) => {
    const [scans, leads, orders, reviews] = await Promise.all([
      supabaseAdmin.from("scans").select("id, url, overall, scanned_at").order("scanned_at", { ascending: false }).limit(limit_per_type),
      supabaseAdmin.from("leads").select("id, name, email, qualification_tier, created_at").order("created_at", { ascending: false }).limit(limit_per_type),
      supabaseAdmin.from("orders").select("id, status, total_cents, currency, customer_email, created_at").order("created_at", { ascending: false }).limit(limit_per_type),
      supabaseAdmin.from("reviews").select("id, project_id, status, preview_url, created_at").order("created_at", { ascending: false }).limit(limit_per_type),
    ]);
    return JSON.stringify(
      {
        ok: true,
        scans: scans.data ?? [],
        leads: leads.data ?? [],
        orders: orders.data ?? [],
        reviews: reviews.data ?? [],
      },
      null,
      2,
    );
  },
});
