// PayPal Billing Subscriptions webhook handler.
// Configure in PayPal dashboard → Webhooks pointed at:
//   https://grow.contact/api/public/hooks/paypal-subscription
// Subscribe to events: BILLING.SUBSCRIPTION.ACTIVATED, .CANCELLED,
// .SUSPENDED, .EXPIRED, .UPDATED, .PAYMENT.FAILED, and
// PAYMENT.SALE.COMPLETED / PAYMENT.SALE.REFUNDED.
//
// Set PAYPAL_WEBHOOK_ID in secrets to enable signature verification.
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

function baseUrl(): string {
  const env = (process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase();
  return env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function paypalToken(): Promise<string> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("PayPal credentials missing");
  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${baseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`paypal auth ${res.status}`);
  return (await res.json() as { access_token: string }).access_token;
}

async function verifySignature(request: Request, body: string): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    console.error("[paypal-webhook] PAYPAL_WEBHOOK_ID not configured — rejecting webhook");
    return false;
  }
  const headers = request.headers;
  const required = [
    "paypal-auth-algo",
    "paypal-cert-url",
    "paypal-transmission-id",
    "paypal-transmission-sig",
    "paypal-transmission-time",
  ];
  for (const h of required) {
    if (!headers.get(h)) return false;
  }
  const t = await paypalToken();
  const res = await fetch(`${baseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      auth_algo: headers.get("paypal-auth-algo"),
      cert_url: headers.get("paypal-cert-url"),
      transmission_id: headers.get("paypal-transmission-id"),
      transmission_sig: headers.get("paypal-transmission-sig"),
      transmission_time: headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(body),
    }),
  });
  if (!res.ok) return false;
  const data = await res.json() as { verification_status?: string };
  return data.verification_status === "SUCCESS";
}

async function handleEvent(evt: {
  event_type: string;
  resource: Record<string, any>;
}) {
  const type = evt.event_type;
  const r = evt.resource ?? {};
  const subId: string | undefined = r.id ?? r.billing_agreement_id;
  if (!subId) return;

  // Look up subscription row by paypal_subscription_id.
  const { data: sub } = await supabaseAdmin
    .from("subscriptions")
    .select("id,user_id,plan_id,status")
    .eq("paypal_subscription_id", subId)
    .maybeSingle();
  if (!sub) {
    console.warn("[paypal-webhook] no subscription row for", subId, type);
    return;
  }

  const patch: {
    status?: string;
    cancelled_at?: string | null;
    current_period_end?: string | null;
  } = {};
  switch (type) {
    case "BILLING.SUBSCRIPTION.ACTIVATED":
    case "BILLING.SUBSCRIPTION.UPDATED":
    case "PAYMENT.SALE.COMPLETED":
      patch.status = "active";
      patch.cancelled_at = null;
      if (r.billing_info?.next_billing_time) {
        patch.current_period_end = r.billing_info.next_billing_time;
      }
      break;
    case "BILLING.SUBSCRIPTION.CANCELLED":
      patch.status = "cancelled";
      patch.cancelled_at = new Date().toISOString();
      break;
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      patch.status = "suspended";
      break;
    case "BILLING.SUBSCRIPTION.EXPIRED":
      patch.status = "expired";
      break;
    case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
      patch.status = "past_due";
      break;
    case "PAYMENT.SALE.REFUNDED":
      patch.status = "refunded";
      break;
    default:
      return;
  }

  await supabaseAdmin
    .from("subscriptions")
    .update(patch)
    .eq("id", sub.id);
}

export const Route = createFileRoute("/api/public/hooks/paypal-subscription")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text();
        const ok = await verifySignature(request, body);
        if (!ok) {
          return new Response("Invalid signature", { status: 401 });
        }
        let evt: { event_type: string; resource: Record<string, any> };
        try {
          evt = JSON.parse(body);
        } catch {
          return new Response("Bad JSON", { status: 400 });
        }
        try {
          await handleEvent(evt);
        } catch (e) {
          console.error("[paypal-webhook] handler error", (e as Error).message);
          return new Response("Handler error", { status: 500 });
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
