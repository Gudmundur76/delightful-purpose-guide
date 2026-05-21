import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  paypalCreateOrder,
  paypalCaptureOrder,
  formatPayPalAmount,
} from "./paypal.server";

export const getPaypalPublicConfig = createServerFn({ method: "GET" }).handler(
  async () => {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    if (!clientId) {
      return { clientId: null, currency: "USD", environment: "sandbox" as const };
    }
    return {
      clientId,
      currency: process.env.PAYPAL_CURRENCY || "USD",
      environment:
        (process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase() === "live"
          ? ("live" as const)
          : ("sandbox" as const),
    };
  },
);

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, slug, name, description, price_cents, currency, image_url")
    .eq("active", true)
    .order("price_cents", { ascending: true });
  if (error) throw new Error(error.message);
  return { products: data ?? [] };
});

export const createPaypalOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => itemsSchema.parse(input))
  .handler(async ({ data }) => {
    const ids = data.items.map((i) => i.productId);
    const { data: products, error } = await supabaseAdmin
      .from("products")
      .select("id, name, price_cents, currency, active")
      .in("id", ids);
    if (error) throw new Error(error.message);
    if (!products || products.length === 0) {
      throw new Error("No matching products found.");
    }

    const currency = products[0].currency;
    if (!products.every((p) => p.currency === currency)) {
      throw new Error("All items must share the same currency.");
    }
    if (!products.every((p) => p.active)) {
      throw new Error("One or more items are no longer available.");
    }

    const lineItems = data.items.map((i) => {
      const p = products.find((pp) => pp.id === i.productId);
      if (!p) throw new Error(`Unknown product ${i.productId}`);
      return {
        product: p,
        qty: i.qty,
        lineCents: p.price_cents * i.qty,
      };
    });

    const subtotalCents = lineItems.reduce((s, l) => s + l.lineCents, 0);
    const totalCents = subtotalCents; // no tax/shipping in v1

    // Insert pending order row before calling PayPal
    const { data: orderRow, error: insertError } = await supabaseAdmin
      .from("orders")
      .insert({
        status: "pending",
        currency,
        subtotal_cents: subtotalCents,
        total_cents: totalCents,
        items: lineItems.map((l) => ({
          product_id: l.product.id,
          name: l.product.name,
          qty: l.qty,
          unit_price_cents: l.product.price_cents,
        })),
      })
      .select("id")
      .single();
    if (insertError || !orderRow) {
      throw new Error(insertError?.message || "Could not create order row");
    }

    try {
      const paypal = await paypalCreateOrder({
        intent: "CAPTURE",
        purchase_units: [
          {
            reference_id: orderRow.id,
            amount: {
              currency_code: currency,
              value: formatAmount(totalCents),
              breakdown: {
                item_total: {
                  currency_code: currency,
                  value: formatAmount(subtotalCents),
                },
              },
            },
            items: lineItems.map((l) => ({
              name: l.product.name.slice(0, 127),
              quantity: String(l.qty),
              unit_amount: {
                currency_code: currency,
                value: formatAmount(l.product.price_cents),
              },
            })),
          },
        ],
      });

      await supabaseAdmin
        .from("orders")
        .update({ paypal_order_id: paypal.id, status: "created" })
        .eq("id", orderRow.id);

      return { orderId: paypal.id, totalCents, currency };
    } catch (e) {
      await supabaseAdmin
        .from("orders")
        .update({ status: "failed" })
        .eq("id", orderRow.id);
      throw e;
    }
  });

export const capturePaypalOrder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ orderId: z.string().min(5).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await paypalCaptureOrder(data.orderId);

    await supabaseAdmin
      .from("orders")
      .update({
        status: result.status.toLowerCase(),
        customer_email: result.email ?? null,
        capture_payload: result.raw as never,
        captured_at: new Date().toISOString(),
      })
      .eq("paypal_order_id", data.orderId);

    return {
      orderId: data.orderId,
      status: result.status,
      email: result.email ?? null,
    };
  });
