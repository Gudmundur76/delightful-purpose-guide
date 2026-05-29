import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// In-Worker memo cache. Cuts SSR TTFB for marketing pages from
// ~1.5s (cold Supabase round-trip) to <50ms on warm isolates.
// 5-minute TTL keeps content edits visible quickly enough.
const TTL_MS = 5 * 60 * 1000;
const memo = new Map<string, { at: number; value: unknown }>();

async function cached<T>(key: string, loader: () => Promise<T>): Promise<T> {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.value as T;
  const value = await loader();
  memo.set(key, { at: Date.now(), value });
  return value;
}

export const getFaqItemsFn = createServerFn({ method: "GET" }).handler(async () => {
  return cached("faq_items", async () => {
    const { data } = await supabaseAdmin
      .from("faq_items")
      .select("id, question, answer, order_index")
      .eq("active", true)
      .order("order_index", { ascending: true });
    return (data ?? []) as Array<{ id: string; question: string; answer: string; order_index: number }>;
  });
});

export const getPageContentFn = createServerFn({ method: "GET" })
  .inputValidator((page: string) => page)
  .handler(async ({ data }) => {
    return cached(`site_content:${data}`, async () => {
      const { data: rows } = await supabaseAdmin
        .from("site_content")
        .select("field, value")
        .eq("page", data);
      const fields: Record<string, string> = {};
      for (const r of rows ?? []) fields[r.field] = r.value;
      return fields;
    });
  });

export const getPricingTiersFn = createServerFn({ method: "GET" }).handler(async () => {
  return cached("pricing_tiers", async () => {
    const { data } = await supabaseAdmin
      .from("products")
      .select("slug, name, display_price, display_label, features, highlight, visible_on_homepage, price_cents, currency")
      .eq("active", true)
      .eq("visible_on_homepage", true);
    return (data ?? []) as Array<{
      slug: string; name: string; display_price: string | null; display_label: string | null;
      features: string[]; highlight: boolean; visible_on_homepage: boolean;
      price_cents: number; currency: string;
    }>;
  });
});
