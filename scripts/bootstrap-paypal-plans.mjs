#!/usr/bin/env node
// One-time bootstrap: creates a PayPal Catalog Product + 2 Billing Plans
// (Pro $29/mo, Team $99/mo) and prints SQL to update subscription_plans.
//
// Usage:
//   PAYPAL_CLIENT_ID=... PAYPAL_CLIENT_SECRET=... \
//   PAYPAL_ENVIRONMENT=sandbox node scripts/bootstrap-paypal-plans.mjs
//
// If PG env vars (PGHOST etc.) are present, it will also write the IDs
// into the subscription_plans table directly via psql.

import { execSync } from "node:child_process";

const env = (process.env.PAYPAL_ENVIRONMENT || "sandbox").toLowerCase();
const BASE = env === "live"
  ? "https://api-m.paypal.com"
  : "https://api-m.sandbox.paypal.com";

const clientId = process.env.PAYPAL_CLIENT_ID;
const secret = process.env.PAYPAL_CLIENT_SECRET;
if (!clientId || !secret) {
  console.error("Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET in env.");
  process.exit(1);
}

async function token() {
  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`auth ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function pp(t, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${t}`,
      "Content-Type": "application/json",
      "PayPal-Request-Id": `grow-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`${path} ${res.status} ${JSON.stringify(data)}`);
  return data;
}

const t = await token();
console.log(`[paypal] env=${env} authed`);

const product = await pp(t, "/v1/catalogs/products", {
  name: "Grow Monitoring",
  description: "Grow agent-native monitoring & scanning subscription",
  type: "SERVICE",
  category: "SOFTWARE",
  home_url: "https://grow.contact/check",
});
console.log(`[paypal] product=${product.id}`);

function planBody(name, price) {
  return {
    product_id: product.id,
    name,
    description: `${name} monthly subscription`,
    status: "ACTIVE",
    billing_cycles: [{
      frequency: { interval_unit: "MONTH", interval_count: 1 },
      tenure_type: "REGULAR",
      sequence: 1,
      total_cycles: 0,
      pricing_scheme: { fixed_price: { value: price, currency_code: "USD" } },
    }],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: "CANCEL",
      payment_failure_threshold: 2,
    },
  };
}

const pro = await pp(t, "/v1/billing/plans", planBody("Grow Monitoring — Pro", "29.00"));
const team = await pp(t, "/v1/billing/plans", planBody("Grow Monitoring — Team", "99.00"));
console.log(`[paypal] pro=${pro.id} team=${team.id}`);

const sql = `
UPDATE public.subscription_plans SET paypal_plan_id = '${pro.id}' WHERE id = 'pro';
UPDATE public.subscription_plans SET paypal_plan_id = '${team.id}' WHERE id = 'team';
`.trim();

console.log("\n--- SQL ---\n" + sql + "\n-----------\n");

if (process.env.PGHOST) {
  try {
    execSync(`psql -c "${sql.replace(/"/g, '\\"')}"`, { stdio: "inherit" });
    console.log("[db] subscription_plans updated.");
  } catch (e) {
    console.error("[db] psql update failed; run the SQL manually.", e?.message);
  }
} else {
  console.log("[db] PGHOST not set — run the SQL above manually.");
}

console.log(JSON.stringify({ product_id: product.id, pro_plan_id: pro.id, team_plan_id: team.id }, null, 2));
