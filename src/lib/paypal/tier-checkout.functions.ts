import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  paypalCreateOrder,
  paypalCaptureOrder,
  formatPayPalAmount,
} from "./paypal.server";

const TIERS = {
  starter: { name: "Starter — 48h build", amountCents: 240000 },
  growth: { name: "Growth — 5-day build", amountCents: 480000 },
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
    z.object({ orderId: z.string().min(5).max(64) }).parse(input),
  )
  .handler(async ({ data }) => {
    const result = await paypalCaptureOrder(data.orderId);
    return {
      orderId: data.orderId,
      status: result.status,
      email: result.email ?? null,
    };
  });
