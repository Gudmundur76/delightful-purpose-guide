// Server-only PayPal REST API helpers. Never import from client code.

export function formatPayPalAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}


function getBaseUrl(): string {
  const env = (process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase();
  return env === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error("PayPal credentials are not configured on the server.");
  }
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.token;
  }
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${getBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

/**
 * Generate a short-lived, browser-safe client token used by the PayPal v6
 * Web SDK. Required for Fastlane, vaulting, and recommended for Apple/Google
 * Pay. The token expires after ~15 minutes and is bound to the requesting
 * domain.
 */
export async function paypalCreateClientToken(): Promise<{
  clientToken: string;
  expiresIn: number;
}> {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/v1/identity/generate-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept-Language": "en_US",
    },
    body: "{}",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal client-token failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    client_token?: string;
    expires_in?: number;
  };
  if (!data.client_token) {
    throw new Error("PayPal client-token response missing client_token");
  }
  return { clientToken: data.client_token, expiresIn: data.expires_in ?? 3600 };
}


export async function paypalCreateOrder(payload: unknown): Promise<{
  id: string;
  status: string;
  raw: unknown;
}> {
  const token = await getAccessToken();
  const res = await fetch(`${getBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { id?: string; status?: string; message?: string };
  if (!res.ok || !data.id) {
    throw new Error(
      `PayPal create order failed: ${res.status} ${data.message ?? JSON.stringify(data)}`,
    );
  }
  return { id: data.id, status: data.status ?? "CREATED", raw: data };
}

/**
 * Confirm a payment source on an existing order. Used by Apple Pay and
 * Google Pay flows where the wallet returns an encrypted payment token that
 * must be attached before capture.
 */
export async function paypalConfirmOrder(
  orderId: string,
  paymentSource: Record<string, unknown>,
): Promise<{ status: string; raw: unknown }> {
  const token = await getAccessToken();
  const res = await fetch(
    `${getBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/confirm-payment-source`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payment_source: paymentSource }),
    },
  );
  const data = (await res.json()) as { status?: string; message?: string };
  if (!res.ok || !data.status) {
    throw new Error(
      `PayPal confirm failed: ${res.status} ${data.message ?? JSON.stringify(data)}`,
    );
  }
  return { status: data.status, raw: data };
}

export async function paypalCaptureOrder(orderId: string): Promise<{
  status: string;
  email?: string;
  referenceId?: string;
  customId?: string;
  raw: unknown;
}> {
  const token = await getAccessToken();
  const res = await fetch(
    `${getBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );
  const data = (await res.json()) as {
    status?: string;
    message?: string;
    payer?: { email_address?: string };
    purchase_units?: Array<{
      reference_id?: string;
      custom_id?: string;
      payments?: { captures?: Array<{ custom_id?: string }> };
    }>;
  };
  if (!res.ok || !data.status) {
    throw new Error(
      `PayPal capture failed: ${res.status} ${data.message ?? JSON.stringify(data)}`,
    );
  }
  const pu = data.purchase_units?.[0];
  const customId = pu?.custom_id ?? pu?.payments?.captures?.[0]?.custom_id;
  return {
    status: data.status,
    email: data.payer?.email_address,
    referenceId: pu?.reference_id,
    customId,
    raw: data,
  };
}
