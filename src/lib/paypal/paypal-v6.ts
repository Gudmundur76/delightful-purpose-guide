// PayPal JS SDK loader (the real, public SDK at /sdk/js).
// The previous /sdk/js/v6/core endpoint does not exist publicly (404) and
// caused "Loading secure payment…" to hang forever.
//
// We load the standard SDK with the components we need, then read APIs off
// the global `window.paypal` namespace: Buttons, CardFields, Applepay,
// Googlepay, Fastlane.

export type V6Component =
  | "buttons"
  | "card-fields"
  | "fastlane"
  | "applepay"
  | "googlepay"
  | "messages";

type CreateOrderFn = () => Promise<string>;
type OnApproveData = { orderID: string };

export interface PayPalButtonsInstance {
  isEligible: () => boolean;
  render: (sel: string | HTMLElement) => Promise<void>;
  close: () => Promise<void>;
}

export interface PayPalCardFieldsInstance {
  isEligible: () => boolean;
  NameField: (opts?: unknown) => { render: (sel: string | HTMLElement) => Promise<void> };
  NumberField: (opts?: unknown) => { render: (sel: string | HTMLElement) => Promise<void> };
  ExpiryField: (opts?: unknown) => { render: (sel: string | HTMLElement) => Promise<void> };
  CVVField: (opts?: unknown) => { render: (sel: string | HTMLElement) => Promise<void> };
  submit: (opts?: unknown) => Promise<void>;
}

export interface PayPalApplepayInstance {
  config: () => Promise<{
    isEligible: boolean;
    countryCode: string;
    currencyCode: string;
    merchantCapabilities: string[];
    supportedNetworks: string[];
  }>;
  validateMerchant: (opts: {
    validationUrl: string;
    displayName: string;
  }) => Promise<{ merchantSession: unknown }>;
  confirmOrder: (opts: {
    orderId: string;
    token: unknown;
    billingContact?: unknown;
    shippingContact?: unknown;
  }) => Promise<{ status: string }>;
}

export interface PayPalGooglepayInstance {
  config: () => Promise<{
    isEligible: boolean;
    apiVersion: number;
    apiVersionMinor: number;
    allowedPaymentMethods: unknown[];
    merchantInfo: { merchantId: string; merchantName: string };
    countryCode: string;
  }>;
  confirmOrder: (opts: {
    orderId: string;
    paymentMethodData: unknown;
  }) => Promise<{ status: string }>;
}

export interface PayPalNamespace {
  Buttons?: (opts: {
    style?: Record<string, unknown>;
    fundingSource?: string;
    createOrder?: CreateOrderFn;
    onApprove?: (data: OnApproveData) => void | Promise<void>;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }) => PayPalButtonsInstance;
  CardFields?: (opts: {
    createOrder: CreateOrderFn;
    onApprove: (data: OnApproveData) => void | Promise<void>;
    onError?: (err: unknown) => void;
    style?: Record<string, unknown>;
  }) => PayPalCardFieldsInstance;
  Applepay?: () => PayPalApplepayInstance;
  Googlepay?: () => PayPalGooglepayInstance;
  FUNDING?: Record<string, string>;
  getFundingSources?: () => string[];
  isFundingEligible?: (source: string) => boolean;
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
    google?: { payments?: { api?: { PaymentsClient: new (cfg: unknown) => unknown } } };
    ApplePaySession?: { canMakePayments: () => boolean };
  }
}

const GOOGLE_PAY_URL = "https://pay.google.com/gp/p/js/pay.js";

let sdkPromise: Promise<PayPalNamespace> | null = null;
let sdkKey: string | null = null;
let googlePayPromise: Promise<void> | null = null;

function buildSdkUrl(opts: {
  clientId: string;
  components: V6Component[];
  currency: string;
  enableFunding?: string[];
  disableFunding?: string[];
}): string {
  const params = new URLSearchParams();
  params.set("client-id", opts.clientId);
  params.set("components", opts.components.join(","));
  params.set("currency", opts.currency);
  params.set("intent", "capture");
  if (opts.enableFunding?.length) {
    params.set("enable-funding", opts.enableFunding.join(","));
  }
  if (opts.disableFunding?.length) {
    params.set("disable-funding", opts.disableFunding.join(","));
  }
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
}

export function loadPaypalSdk(opts: {
  clientId: string;
  components: V6Component[];
  currency: string;
  clientToken?: string;
  enableFunding?: string[];
  disableFunding?: string[];
}): Promise<PayPalNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));

  const rawKey = JSON.stringify({
    c: opts.clientId,
    comp: [...opts.components].sort(),
    cur: opts.currency,
    ef: opts.enableFunding ?? [],
    df: opts.disableFunding ?? [],
  });
  // Hash to a selector-safe ASCII token (raw JSON contains quotes/braces
  // that are invalid inside a CSS attribute selector).
  let h = 0;
  for (let i = 0; i < rawKey.length; i++) {
    h = (h * 31 + rawKey.charCodeAt(i)) | 0;
  }
  const key = `pp_${(h >>> 0).toString(36)}`;

  if (sdkPromise && sdkKey === key && window.paypal) {
    return sdkPromise;
  }

  sdkKey = key;
  const url = buildSdkUrl(opts);

  sdkPromise = new Promise<PayPalNamespace>((resolve, reject) => {
    // Reuse existing script tag if present.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-paypal-sdk="${key}"]`,
    );
    const onLoad = () => {
      const pp = window.paypal;
      if (pp) resolve(pp);
      else {
        sdkPromise = null;
        reject(new Error("PayPal SDK loaded but window.paypal is undefined."));
      }
    };
    const onError = () => {
      sdkPromise = null;
      reject(
        new Error(
          "Could not load PayPal SDK. Often an ad/tracker blocker on paypal.com or a network block — disable blockers and retry.",
        ),
      );
    };
    if (existing) {
      if (window.paypal) {
        resolve(window.paypal);
        return;
      }
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }
    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.setAttribute("data-paypal-sdk", key);
    if (opts.clientToken) {
      script.setAttribute("data-client-token", opts.clientToken);
    }
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);
  });

  return sdkPromise;
}

export function loadGooglePayScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.google?.payments?.api?.PaymentsClient) return Promise.resolve();
  if (googlePayPromise) return googlePayPromise;
  googlePayPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = GOOGLE_PAY_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      googlePayPromise = null;
      reject(new Error("Could not load Google Pay script"));
    };
    document.head.appendChild(script);
  });
  return googlePayPromise;
}

export function resetPaypalSdkCache() {
  sdkPromise = null;
  sdkKey = null;
}
