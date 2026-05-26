import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const updatePricingDisplayTool = defineTool({
  name: "update_pricing_display",
  description: "Update homepage display settings on a product (display_price, display_label, features, highlight, visible_on_homepage).",
  parameters: z.object({
    slug: z.string().min(1).max(128),
    display_price: z.string().max(64).optional(),
    display_label: z.string().max(128).optional(),
    features: z.array(z.string().min(1).max(255)).max(20).optional(),
    highlight: z.boolean().optional(),
    visible_on_homepage: z.boolean().optional(),
  }),
  execute: async ({ slug, ...rest }) => {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(rest)) if (v !== undefined) patch[k] = v;
    if (Object.keys(patch).length === 0) return JSON.stringify({ ok: false, error: "No fields to update" });
    const { data, error } = await supabaseAdmin.from("products").update(patch as never).eq("slug", slug)
      .select("slug, display_price, display_label, features, highlight, visible_on_homepage").maybeSingle();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    if (!data) return JSON.stringify({ ok: false, error: "Product not found" });
    return JSON.stringify({ ok: true, ...data });
  },
});
