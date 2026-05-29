// PayPal Billing Subscriptions REST helpers. Server-only.

function baseUrl(): string {
  const env = (process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase();
  return env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

async function token(): Promise<string> {
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

export async function createBillingSubscription(args: {
  planId: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
}): Promise<{ id: string; approveUrl: string }> {
  const t = await token();
  const res = await fetch(`${baseUrl()}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `sub-${args.userId}-${Date.now()}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify({
      plan_id: args.planId,
      custom_id: args.userId,
      application_context: {
        brand_name: "Grow",
        user_action: "SUBSCRIBE_NOW",
        return_url: args.returnUrl,
        cancel_url: args.cancelUrl,
      },
    }),
  });
  const data = await res.json() as {
    id?: string;
    links?: Array<{ rel: string; href: string }>;
    message?: string;
  };
  if (!res.ok || !data.id) throw new Error(`paypal subscription ${res.status} ${data.message ?? ""}`);
  const approve = data.links?.find((l) => l.rel === "approve")?.href;
  if (!approve) throw new Error("no approve link returned");
  return { id: data.id, approveUrl: approve };
}

export async function getBillingSubscription(subId: string): Promise<{
  id: string;
  status: string;
  plan_id: string;
  billing_info?: { next_billing_time?: string };
}> {
  const t = await token();
  const res = await fetch(`${baseUrl()}/v1/billing/subscriptions/${encodeURIComponent(subId)}`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`get subscription ${res.status}`);
  return data as { id: string; status: string; plan_id: string; billing_info?: { next_billing_time?: string } };
}

export async function cancelBillingSubscription(subId: string, reason = "User requested cancellation"): Promise<void> {
  const t = await token();
  const res = await fetch(
    `${baseUrl()}/v1/billing/subscriptions/${encodeURIComponent(subId)}/cancel`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    },
  );
  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`cancel subscription ${res.status} ${text}`);
  }
}
