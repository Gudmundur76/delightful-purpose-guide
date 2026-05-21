import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  paypalCreateOrder,
  paypalCaptureOrder,
  formatPayPalAmount,
} from "./paypal.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TIERS = {
  starter: { name: "Starter — 48h build", amountCents: 240000, deliveryHours: 48 },
  growth: { name: "Growth — 5-day build", amountCents: 480000, deliveryHours: 24 * 5 },
} as const;

export type TierKey = keyof typeof TIERS;


export const createTierOrder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ tier: z.enum(["starter", "growth"]) }).parse(input),
  )
  .handler(async ({ data }) => {
    const tier = TIERS[data.tier];
    const currency = "USD";
    const paypal = await paypalCreateOrder({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: data.tier,
          description: tier.name,
          amount: {
            currency_code: currency,
            value: formatPayPalAmount(tier.amountCents),
            breakdown: {
              item_total: {
                currency_code: currency,
                value: formatPayPalAmount(tier.amountCents),
              },
            },
          },
          items: [
            {
              name: tier.name,
              quantity: "1",
              unit_amount: {
                currency_code: currency,
                value: formatPayPalAmount(tier.amountCents),
              },
            },
          ],
        },
      ],
    });
    return { orderId: paypal.id };
  });

export const captureTierOrder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        orderId: z.string().min(5).max(64),
        tier: z.enum(["starter", "growth"]),
        customerName: z.string().trim().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const tier = TIERS[data.tier];
    const result = await paypalCaptureOrder(data.orderId);
    const isCompleted = result.status.toUpperCase() === "COMPLETED";
    const email = result.email ?? null;
    const amount = tier.amountCents / 100;

    // Record the payment
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: data.orderId,
        amount,
        tier: data.tier,
        customer_email: email,
        customer_name: data.customerName ?? null,
        status: isCompleted ? "paid" : result.status.toLowerCase(),
        paid_at: isCompleted ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (payErr) {
      console.error("Failed to insert payment row", payErr);
    }

    // Kick off the project on successful payment
    if (isCompleted && payment) {
      const now = new Date();
      const target = new Date(now.getTime() + tier.deliveryHours * 3600 * 1000);
      const { error: projErr } = await supabaseAdmin.from("projects").insert({
        payment_id: payment.id,
        client_email: email,
        client_name: data.customerName ?? null,
        tier: data.tier,
        budget: amount,
        status: "deposit_paid",
        start_date: now.toISOString(),
        target_delivery: target.toISOString(),
      });
      if (projErr) {
        console.error("Failed to insert project row", projErr);
      }
    }

    return {
      orderId: data.orderId,
      status: result.status,
      email,
    };
  });

