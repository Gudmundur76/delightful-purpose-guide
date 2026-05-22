// PayPal Web SDK v6 loader + minimal hand-rolled types.
// v6 ships a small core script with no client-id in the URL; the app then
// initialises an SDK instance with createInstance({ clientId | clientToken,
// components: [...] }).

export type V6Component =
  | "paypal-payments"
  | "venmo-payments"
  | "paypal-guest-payments"
  | "paypal-messages"
  | "card-fields"
  | "fastlane"
  | "googlepay-payments"
  | "applepay-payments";

export type OnApproveData = { orderId: string };

export interface V6Eligibility {
  isEligible: (method: string) => boolean;
}

export interface V6CardFields {
  isEligible: () => boolean;
  NameField: () => { render: (sel: string | HTMLElement) => Promise<void> };
  NumberField: () => { render: (sel: string | HTMLElement) => Promise<void> };
  ExpiryField: () => { render: (sel: string | HTMLElement) => Promise<void> };
  CVVField: () => { render: (sel: string | HTMLElement) => Promise<void> };
  submit: () => Promise<void>;
}

export interface V6PayPalSession {
  start: (
    opts: { presentationMode?: "auto" | "popup" | "modal" },
    createOrder: () => Promise<{ orderId: string }>,
  ) => Promise<void>;
}

export interface V6AppleSession {
  config: () => Promise<{
    merchantCapabilities: string[];
    supportedNetworks: string[];
    countryCode: string;
  }>;
  validateMerchant: (opts: {
    validationUrl: string;
    displayName: string;
  }) => Promise<unknown>;
  confirmOrder: (opts: {
    orderId: string;
    token: unknown;
    billingContact?: unknown;
    shippingContact?: unknown;
  }) => Promise<{ status: string }>;
}

export interface V6GoogleSession {
  getConfig: () => Promise<{
    allowedPaymentMethods: unknown[];
    apiVersion: number;
    apiVersionMinor: number;
    isEligible: boolean;
    merchantInfo: { merchantId: string; merchantName: string };
    countryCode: string;
  }>;
  confirmOrder: (opts: {
    orderId: string;
    paymentMethodData: unknown;
  }) => Promise<{ status: string }>;
}

export interface V6SdkInstance {
  findEligibleMethods: (opts?: { currency?: string }) => Promise<V6Eligibility>;
  createPayPalOneTimePaymentSession: (handlers: {
    onApprove: (data: OnApproveData) => void | Promise<void>;
    onCancel?: () => void;
    onError?: (err: unknown) => void;
  }) => V6PayPalSession;
  createApplePayOneTimePaymentSession?: (handlers: {
    onApprove: (data: OnApproveData) => void | Promise<void>;
    onError?: (err: unknown) => void;
  }) => V6AppleSession;
  createGooglePayOneTimePaymentSession?: (handlers: {
    onApprove: (data: OnApproveData) => void | Promise<void>;
    onError?: (err: unknown) => void;
  }) => V6GoogleSession;
  createCardFields?: (opts: {
    createOrder: () => Promise<string>;
    onApprove: (data: OnApproveData) => void | Promise<void>;
    onError?: (err: unknown) => void;
    style?: Record<string, unknown>;
  }) => V6CardFields;
}

export interface V6Namespace {
  createInstance: (opts: {
    clientId?: string;
    clientToken?: string;
    components: V6Component[];
    locale?: string;
    pageType?: "checkout" | "product-details" | "cart" | "mini-cart" | "home";
  }) => Promise<V6SdkInstance>;
}

declare global {
  interface Window {
    google?: { payments?: { api?: { PaymentsClient: new (cfg: unknown) => unknown } } };
    ApplePaySession?: { canMakePayments: () => boolean };
  }
}

function getPaypalGlobal(): V6Namespace | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { paypal?: V6Namespace }).paypal;
}

const V6_SDK_URL = "https://www.paypal.com/sdk/js/v6/core";
const GOOGLE_PAY_URL = "https://pay.google.com/gp/p/js/pay.js";

let corePromise: Promise<V6Namespace> | null = null;
let instancePromise: Promise<V6SdkInstance> | null = null;
let googlePayPromise: Promise<void> | null = null;

export function loadPaypalV6Core(): Promise<V6Namespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  const existingGlobal = getPaypalGlobal();
  if (existingGlobal && typeof existingGlobal.createInstance === "function") {
    return Promise.resolve(existingGlobal);
  }
  if (corePromise) return corePromise;

  corePromise = new Promise<V6Namespace>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${V6_SDK_URL}"]`,
    );
    const onLoad = () => {
      const pp = getPaypalGlobal();
      if (pp && typeof pp.createInstance === "function") {
        resolve(pp);
      } else {
        corePromise = null;
        reject(
          new Error(
            "PayPal v6 SDK loaded but createInstance is unavailable. Check network/blockers.",
          ),
        );
      }
    };
    const onError = () => {
      corePromise = null;
      reject(
        new Error(
          "Could not load PayPal SDK. This is usually an ad/tracker blocker on paypal.com or a network block. Disable blockers for this site and try again.",
        ),
      );
    };
    if (existing) {
      existing.addEventListener("load", onLoad);
      existing.addEventListener("error", onError);
      return;
    }
    const script = document.createElement("script");
    script.src = V6_SDK_URL;
    script.async = true;
    script.onload = onLoad;
    script.onerror = onError;
    document.head.appendChild(script);
  });

  return corePromise;
}

export async function getPaypalV6Sdk(opts: {
  clientId: string;
  clientToken?: string;
  components: V6Component[];
  locale?: string;
}): Promise<V6SdkInstance> {
  if (instancePromise) return instancePromise;
  const core = await loadPaypalV6Core();
  instancePromise = core
    .createInstance({
      clientId: opts.clientToken ? undefined : opts.clientId,
      clientToken: opts.clientToken,
      components: opts.components,
      pageType: "checkout",
      locale: opts.locale,
    })
    .catch((e) => {
      instancePromise = null;
      throw e;
    });
  return instancePromise;
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

export function resetPaypalV6Cache() {
  instancePromise = null;
}
