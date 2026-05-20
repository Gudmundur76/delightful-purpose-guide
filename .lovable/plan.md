# PayPal Advanced Checkout — Plan

## What you'll get
- A product catalog (DB-driven), a cart, and a `/checkout` page
- PayPal Smart Buttons + PayPal-hosted Card Fields (PCI-safe, no full-page redirect)
- Server-side order creation & capture with server-trusted totals
- Sandbox-first, flip to live by swapping credentials

## 1. Database (Lovable Cloud)
- `products` — `id, slug, name, description, price_cents, currency, image_url, active`
  - RLS: public read for `active = true`; no public write
- `orders` — `id, paypal_order_id, status, currency, subtotal_cents, total_cents, items jsonb, customer_email, captured_at, created_at`
  - RLS: no public read/write (service-role only via server fns)

## 2. Secrets (requested via secure form)
- `PAYPAL_CLIENT_ID` — also exposed to browser via a server fn that returns it (safe; it's public)
- `PAYPAL_CLIENT_SECRET` — server only
- `PAYPAL_ENVIRONMENT` — `sandbox` (default) or `live`
- `PAYPAL_CURRENCY` — e.g. `USD`

## 3. Server functions (`createServerFn`, all server-side)
- `getPaypalPublicConfig` → `{ clientId, currency, environment }` for SDK loader
- `createPaypalOrder({ items: [{ productId, qty }] })`
  - Loads products from DB, computes trusted totals, inserts a pending `orders` row, calls PayPal `/v2/checkout/orders` with server token, returns `{ orderId }`
- `capturePaypalOrder({ orderId })`
  - Calls PayPal `/v2/checkout/orders/{id}/capture`, updates `orders.status`, returns `{ status, orderId, confirmation }`
- `listProducts()` — public catalog

PayPal auth: helper that exchanges `CLIENT_ID:SECRET` for an OAuth token against sandbox/live base URL.

## 4. Frontend
- `/products` — grid of products, "Add to cart"
- Cart state: lightweight React context backed by `localStorage`
- Header cart icon with item count
- `/checkout` route:
  - Order summary (line items, server-verified totals shown after `createOrder`)
  - **Payment Method** section
    - PayPal Smart Buttons (`#paypal-button-container`)
    - Divider: "Or pay by card"
    - PayPal Hosted Card Fields: cardholder name, number, expiry, CVV, postal
    - "Pay $X" submit button, disabled while processing
  - States: loading SDK, submitting, success → `/checkout/success?order=...`, error, cancelled
- `/checkout/success` — confirmation page from captured order

## 5. SDK loading
Dynamically inject `https://www.paypal.com/sdk/js?client-id=…&currency=…&components=buttons,card-fields&intent=capture` once, using the client ID fetched from `getPaypalPublicConfig`.

## 6. Security
- Card data only inside PayPal-hosted iframes (Card Fields)
- All totals re-computed server-side from DB before PayPal order creation
- `CLIENT_SECRET` never imported in client code (server-only files)
- Errors logged server-side, sanitized to the browser

## 7. Out of scope (ask if you want them)
- Shipping address collection / tax / discounts
- Webhooks for async PayPal events (refunds, disputes)
- Email receipts (you have email infra — easy to wire in later)
- Admin UI to manage products (you can seed via DB for now)

## Files I'll add/modify
- `supabase/migrations/...` — `products`, `orders` tables + RLS
- `src/lib/paypal/paypal.server.ts` — token helper, API calls
- `src/lib/paypal/paypal.functions.ts` — server fns above
- `src/lib/cart/CartContext.tsx` — cart state
- `src/routes/products.tsx`
- `src/routes/checkout.tsx`
- `src/routes/checkout.success.tsx`
- `src/components/PayPalCheckout.tsx` — SDK + buttons + card fields
- Header link to cart

Ready to proceed? After you approve, I'll request the 4 PayPal secrets, then build.