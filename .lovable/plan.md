## Goal

Replace the v5 PayPal integration in `PayPalCheckout.tsx` (cart checkout) and `TierCheckoutDialog.tsx` (tier upsell) with a single v6 implementation that scaffolds every globally-available payment method.

## Scope: which methods, and what works out of the box

| Method | Component | Works immediately? |
|---|---|---|
| PayPal wallet | `paypal-payments` | Yes |
| Pay Later (UK/DE/FR/ES/IT/AU/US/…) | `paypal-payments` | Yes — auto-shown to eligible buyers |
| Cards (inline) | `card-fields` | Yes |
| Fastlane (guest checkout) | `fastlane` | Yes for US/CA buyers; otherwise hidden by eligibility |
| Apple Pay | `applepay-payments` | **Needs domain registration in PayPal + `/.well-known/apple-developer-merchantid-domain-association` file** — button stays hidden until done |
| Google Pay | `googlepay-payments` | **Needs Google Pay merchant ID + PayPal merchant config** — button stays hidden until done |
| Venmo | — | Skipped (US-only) |

Apple Pay & Google Pay are scaffolded with eligibility gates (`sdkInstance.findEligibleMethods()`), so they render nothing until you complete domain setup. No broken buttons.

## Server-side changes

**1. New server fn: `createPaypalClientToken`** in `src/lib/paypal/paypal.functions.ts`
- POSTs to `/v1/oauth2/token` with `response_type=client_token`
- Returns short-lived (15min), domain-bound token for browser
- Required by v6 SDK for Fastlane/vaulting; also used by Apple/Google Pay flows

**2. Add `paypalConfirmOrder` helper** in `paypal.server.ts`
- Used by Apple Pay / Google Pay flows: `POST /v2/checkout/orders/{id}/confirm-payment-source` before capture

**3. `getPaypalPublicConfig`** — extended to also return `environment` + `merchantId` (placeholder for Google Pay)

No changes to `createPaypalOrder` / `capturePaypalOrder` — order lifecycle unchanged.

## Client-side changes

**1. New shared module: `src/lib/paypal/paypal-v6.ts`**
- Loads `https://www.paypal.com/sdk/js/v6/core` once (idempotent)
- Exports `getPaypalV6Sdk()` that returns a memoised `sdkInstance` from `createInstance({ clientId, components: [...], pageType: 'checkout' })`
- Components requested: `["paypal-payments","card-fields","fastlane","applepay-payments","googlepay-payments"]`
- TS types for the v6 namespace (minimal hand-rolled — v6 types aren't stable yet)

**2. New shared component: `src/components/paypal/PayPalV6Checkout.tsx`**
- Props: `createOrder: () => Promise<string>`, `onApproved: (orderId) => void`, `amount: { value, currency }`, `variant: "page" | "dialog"`
- Renders, gated by eligibility:
  - PayPal/Pay Later button (via `createPayPalOneTimePaymentSession`)
  - Card Fields (Name/Number/Expiry/CVV + Pay button)
  - Fastlane email lookup + checkout flow
  - Apple Pay button (`createApplePayOneTimePaymentSession`) — hidden if ineligible
  - Google Pay button (`createGooglePayOneTimePaymentSession`) — hidden if ineligible; loads `https://pay.google.com/gp/p/js/pay.js` on demand
- Loading, error, and submitting states preserved from current UI
- Apple/Google Pay use the confirm-then-capture pattern; PayPal/Card/Fastlane use the existing capture flow

**3. Rewrite `PayPalCheckout.tsx`** — thin wrapper that wires cart's `createPaypalOrder` to the shared component, navigates to `/checkout/success` on approval.

**4. Rewrite `TierCheckoutDialog.tsx`** — thin wrapper that wires tier `createTierOrder` to the shared component, sets internal `success` state on approval.

## What stays the same

- Order DB rows (`orders` table), `capturePaypalOrder`, success/email flows
- All existing UI shell (dialog frame, page layout, styling)
- `PAYPAL_CLIENT_ID` + `PAYPAL_CLIENT_SECRET` + `PAYPAL_ENVIRONMENT` secrets
- `PayPalCheckout` and `TierCheckoutDialog` exports — no caller changes

## What you'll need to do later for Apple/Google Pay

I'll add a brief `docs/payments-applepay-googlepay.md` with the exact steps:
- Apple: register `grow.contact` in PayPal dashboard → upload domain-association file to `public/.well-known/`
- Google: configure Google Pay merchant in PayPal dashboard, set `PAYPAL_GOOGLE_MERCHANT_ID` secret

## Verification

- `code--exec` build + lint
- Manual: visit `/checkout` and the tier dialog in sandbox; PayPal/Card buttons should render; Apple/Google buttons should be absent (correctly, until domain setup).

## Files touched

- new: `src/lib/paypal/paypal-v6.ts`
- new: `src/components/paypal/PayPalV6Checkout.tsx`
- new: `docs/payments-applepay-googlepay.md`
- edited: `src/lib/paypal/paypal.functions.ts` (add `createPaypalClientToken`, extend config)
- edited: `src/lib/paypal/paypal.server.ts` (add `paypalConfirmOrder`, client-token helper)
- rewritten: `src/components/PayPalCheckout.tsx`
- rewritten: `src/components/TierCheckoutDialog.tsx`
