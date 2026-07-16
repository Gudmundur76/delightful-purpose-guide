import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const recentScansTool = defineTool({
  name: "list_recent_scans",
  description:
    "List the most recent GEO scans across all hosts (or filter by host). Returns id, url, host, overall + 5 sub-scores, scanned_at.",
  parameters: z.object({
    host: z.string().max(255).optional().describe("Optional host filter, e.g. 'grow.contact'"),
    limit: z.number().int().min(1).max(50).default(10),
  }),
  execute: async ({ host, limit }) => {
    let q = supabaseAdmin
      .from("scans")
      .select("id, url, host, overall, semantic, jsonld, llms, citability, speed, scanned_at, source")
      .order("scanned_at", { ascending: false })
      .limit(limit);
    if (host) q = q.eq("host", host);
    const { data, error } = await q;
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, scans: data }, null, 2);
  },
});
