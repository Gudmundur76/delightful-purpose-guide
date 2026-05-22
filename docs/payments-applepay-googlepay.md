# Enabling Apple Pay & Google Pay (PayPal v6)

The site is wired for Apple Pay and Google Pay via the PayPal v6 Web SDK,
but each requires one-time setup outside the codebase. Until that's done,
both buttons are correctly hidden by the SDK's eligibility check.

## Apple Pay

1. **Register `grow.contact` in PayPal**
   - Sandbox: <https://www.sandbox.paypal.com/businessmanage/applePay>
   - Live: <https://www.paypal.com/businessmanage/applePay>
   - Click "Add a new domain" → `grow.contact` (and `www.grow.contact`).

2. **Download the domain-association file** PayPal gives you.

3. **Place it in the repo** at
   `public/.well-known/apple-developer-merchantid-domain-association`
   (no file extension). It must be reachable at
   `https://grow.contact/.well-known/apple-developer-merchantid-domain-association`.

4. Click **Verify** in the PayPal dashboard. Once verified, the Apple Pay
   button appears automatically on Safari (macOS/iOS) for users with a card
   in Wallet.

## Google Pay

1. **Enable Google Pay** in your PayPal dashboard:
   - Sandbox: <https://www.sandbox.paypal.com/businessmanage/preferences/googlePay>
   - Live: <https://www.paypal.com/businessmanage/preferences/googlePay>

2. Copy your **Google Pay merchant ID** from the dashboard.

3. Add it as a backend secret named `PAYPAL_GOOGLE_MERCHANT_ID`
   (Lovable Cloud → Backend → Secrets).

4. Republish. The Google Pay button appears for Chrome users with a card
   linked to their Google account.

## Verifying it works

- Open `/checkout` (with an item in cart) in Safari on macOS → Apple Pay
  button should render under "Other ways to pay".
- Open the same page in Chrome with a Google account that has a card →
  Google Pay button should render.
- If a button is missing, open DevTools console — the v6 SDK logs the
  reason (domain not verified, merchant ID missing, unsupported browser,
  no eligible card).
