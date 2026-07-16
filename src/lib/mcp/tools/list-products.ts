import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const listProductsTool = defineTool({
  name: "list_products",
  description:
    "List active citation.is products with slug, name, price (cents + currency), description, image. Use when generating pricing pages or quoting customers.",
  parameters: z.object({}),
  execute: async () => {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("slug, name, description, price_cents, currency, image_url")
      .eq("active", true)
      .order("price_cents", { ascending: true });
    if (error) return JSON.stringify({ ok: false, error: error.message });
    return JSON.stringify({ ok: true, products: data }, null, 2);
  },
});
