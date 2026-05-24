import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const statsTool = defineTool({
  name: "get_stats",
  description:
    "Return aggregate stats for grow.contact: total scans, total leads, pending reviews, average overall score (last 30 days).",
  parameters: z.object({}),
  execute: async () => {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const [scans, leads, reviews, recent] = await Promise.all([
      supabaseAdmin.from("scans").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("leads").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("reviews")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending"),
      supabaseAdmin
        .from("scans")
        .select("overall")
        .gte("scanned_at", since),
    ]);
    const overalls = (recent.data ?? []).map((r: { overall: number }) => r.overall);
    const avg30 =
      overalls.length > 0
        ? Math.round(overalls.reduce((a, b) => a + b, 0) / overalls.length)
        : null;
    return JSON.stringify(
      {
        total_scans: scans.count ?? 0,
        total_leads: leads.count ?? 0,
        pending_reviews: reviews.count ?? 0,
        avg_overall_score_30d: avg30,
        scans_last_30d: overalls.length,
      },
      null,
      2,
    );
  },
});
