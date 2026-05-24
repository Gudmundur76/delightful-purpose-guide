import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const upsertProductTool = defineTool({
  name: "upsert_product",
  description: "Create or update a product by slug. Price is in cents.",
  parameters: z.object({
    slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/),
    name: z.string().min(1).max(200),
    description: z.string().max(4000).optional(),
    price_cents: z.number().int().min(0).max(10_000_000),
    currency: z.string().length(3).default("USD"),
    image_url: z.string().url().max(2048).optional(),
    active: z.boolean().default(true),
  }),
  execute: async (input) => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .upsert(input, { onConflict: "slug" })
      .select("id, slug, name, price_cents, currency, active")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, product: data }, null, 2);
  },
});

export const setProductActiveTool = defineTool({
  name: "set_product_active",
  description: "Activate or deactivate a product by slug (controls public visibility).",
  parameters: z.object({
    slug: z.string().min(1).max(120),
    active: z.boolean(),
  }),
  execute: async ({ slug, active }) => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ active })
      .eq("slug", slug)
      .select("slug, active")
      .single();
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, product: data }, null, 2);
  },
});
