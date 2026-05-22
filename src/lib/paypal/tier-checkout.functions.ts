import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  paypalCreateOrder,
  paypalCaptureOrder,
  formatPayPalAmount,
} from "./paypal.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const TIERS = {
  fix: {
    name: "GEO Fix Pack — 24h remediation",
    displayName: "GEO Fix Pack",
    amountCents: 49900,
    deliveryHours: 24,
  },
  starter: {
    name: "Starter — 48h build",
    displayName: "Starter",
    amountCents: 240000,
    deliveryHours: 48,
  },
  growth: {
    name: "Growth — 5-day build",
    displayName: "Growth",
    amountCents: 480000,
    deliveryHours: 24 * 5,
  },
} as const;

export type TierKey = keyof typeof TIERS;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const WEBHOOK_URL = "https://grow.contact/api/webhooks/payment";

/**
 * Fire-and-forget POST to the payment webhook. Never throws — failures are
 * logged but must not block the payment flow. Aborts after 5 seconds.
 */
function notifyPaymentWebhook(payload: Record<string, unknown>): void {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5_000);

  fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .then((res) => {
      if (!res.ok) {
        console.error(
          `Payment webhook returned non-OK: ${res.status} ${res.statusText}`,
        );
      }
    })
    .catch((err) => {
      console.error("Payment webhook failed:", err);
    })
    .finally(() => clearTimeout(timer));
}

export const createTierOrder = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        tier: z.enum(["fix", "starter", "growth"]),
        leadId: z.string().regex(UUID_RE).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const tier = TIERS[data.tier];
    const currency = "USD";
    const paypal = await paypalCreateOrder({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: data.tier,
          custom_id: data.leadId ?? "",
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
        customerName: z.string().trim().max(200).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const result = await paypalCaptureOrder(data.orderId);

    // SECURITY: derive tier from the server-set reference_id on the PayPal
    // order, NOT from any client-supplied value. Prevents an attacker from
    // paying Starter and being credited for Growth.
    const derivedTierKey = result.referenceId as TierKey | undefined;
    if (!derivedTierKey || !(derivedTierKey in TIERS)) {
      throw new Error(
        `Capture rejected: PayPal order has unknown reference_id "${result.referenceId ?? ""}"`,
      );
    }
    const tier = TIERS[derivedTierKey];
    const isCompleted = result.status.toUpperCase() === "COMPLETED";
    const email = result.email ?? null;
    const amount = tier.amountCents / 100;

    // Pull lead_id back from PayPal's custom_id (set in createTierOrder).
    // Validate as UUID before trusting it as a foreign key.
    const rawCustomId = result.customId?.trim();
    const leadId =
      rawCustomId && UUID_RE.test(rawCustomId) ? rawCustomId : null;

    // Record the payment
    const { data: payment, error: payErr } = await supabaseAdmin
      .from("payments")
      .insert({
        order_id: data.orderId,
        amount,
        tier: derivedTierKey,
        lead_id: leadId,
        customer_email: email,
        customer_name: data.customerName ?? null,
        status: isCompleted ? "paid" : result.status.toLowerCase(),
        paid_at: isCompleted ? new Date().toISOString() : null,
      })
      .select("id, paid_at, status")
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
        lead_id: leadId,
        client_email: email,
        client_name: data.customerName ?? null,
        tier: derivedTierKey,
        budget: amount,
        status: "deposit_paid",
        start_date: now.toISOString(),
        target_delivery: target.toISOString(),
      });
      if (projErr) {
        console.error("Failed to insert project row", projErr);
      }

      // Fire-and-forget webhook notification.
      notifyPaymentWebhook({
        event: "payment.captured",
        payment_id: payment.id,
        order_id: data.orderId,
        amount,
        tier: tier.displayName,
        lead_id: leadId,
        customer_email: email,
        customer_name: data.customerName ?? null,
        status: "paid",
        paid_at: payment.paid_at ?? new Date().toISOString(),
      });
    }

    return {
      orderId: data.orderId,
      status: result.status,
      email,
    };
  });
