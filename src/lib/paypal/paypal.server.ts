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

export async function paypalCaptureOrder(orderId: string): Promise<{
  status: string;
  email?: string;
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
  };
  if (!res.ok || !data.status) {
    throw new Error(
      `PayPal capture failed: ${res.status} ${data.message ?? JSON.stringify(data)}`,
    );
  }
  return { status: data.status, email: data.payer?.email_address, raw: data };
}
