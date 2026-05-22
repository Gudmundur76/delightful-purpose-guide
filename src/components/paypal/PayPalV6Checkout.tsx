import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  createPaypalClientToken,
  confirmPaypalWalletOrder,
  getPaypalPublicConfig,
} from "@/lib/paypal/paypal.functions";
import {
  getPaypalV6Sdk,
  loadGooglePayScript,
  loadPaypalV6Core,
  resetPaypalV6Cache,
  type V6CardFields,
  type V6Component,
  type V6SdkInstance,
} from "@/lib/paypal/paypal-v6";

type AmountInfo = { value: string; currency: string };

export type PayPalV6CheckoutProps = {
  /** Server-side order creator. Must return PayPal order id. */
  createOrder: () => Promise<string>;
  /** Server-side capture (called after onApproved resolves). Returns when capture is done. */
  capture: (orderId: string) => Promise<void>;
  /** Called after capture succeeds. */
  onSuccess: (orderId: string) => void;
  /** Amount used by Google Pay sheet only. */
  amount: AmountInfo;
  /** Friendly button label for the card "Pay" CTA. */
  payLabel: string;
  /** "page" = light surfaces, "dialog" = dark surfaces. Affects card field colors. */
  variant?: "page" | "dialog";
};

const COMPONENTS: V6Component[] = [
  "paypal-payments",
  "card-fields",
  "fastlane",
  "applepay-payments",
  "googlepay-payments",
];

export function PayPalV6Checkout({
  createOrder,
  capture,
  onSuccess,
  amount,
  payLabel,
  variant = "page",
}: PayPalV6CheckoutProps) {
  const getConfig = useServerFn(getPaypalPublicConfig);
  const getClientToken = useServerFn(createPaypalClientToken);
  const confirmWalletFn = useServerFn(confirmPaypalWalletOrder);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [cardEligible, setCardEligible] = useState(false);
  const [appleEligible, setAppleEligible] = useState(false);
  const [googleEligible, setGoogleEligible] = useState(false);
  const [paypalEligible, setPaypalEligible] = useState(false);

  const paypalBtnRef = useRef<HTMLButtonElement>(null);
  const appleBtnRef = useRef<HTMLDivElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLDivElement>(null);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvvRef = useRef<HTMLDivElement>(null);

  const cardFieldsRef = useRef<V6CardFields | null>(null);
  const sdkRef = useRef<V6SdkInstance | null>(null);
  const mountedRef = useRef(false);

  // capture stable callbacks
  const createOrderRef = useRef(createOrder);
  const captureRef = useRef(capture);
  const onSuccessRef = useRef(onSuccess);
  createOrderRef.current = createOrder;
  captureRef.current = capture;
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    let cancelled = false;

    async function init() {
      try {
        // Kick off SDK core script load in parallel with server calls —
        // it's the biggest chunk of latency and doesn't need server data.
        const corePreload = loadPaypalV6Core().catch(() => null);

        // Client token is optional (only needed for Fastlane / wallet
        // eligibility). Cap it at 2s so a slow PayPal API never blocks
        // the rest of checkout from rendering.
        const tokenWithTimeout = Promise.race([
          getClientToken().then((t) => t.clientToken).catch((e) => {
            console.warn("PayPal client-token failed", e);
            return undefined;
          }),
          new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 2000)),
        ]);

        const [config, clientToken] = await Promise.all([
          getConfig(),
          tokenWithTimeout,
        ]);
        if (cancelled) return;
        if (!config.clientId) {
          throw new Error("PayPal is not configured. Add PAYPAL_CLIENT_ID.");
        }
        // Ensure core script finished before createInstance.
        await corePreload;

        const sdk = await getPaypalV6Sdk({
          clientId: config.clientId,
          clientToken,
          components: COMPONENTS,
        });
        if (cancelled) return;
        sdkRef.current = sdk;

        const onApproveCommon = async (data: { orderId: string }) => {
          setSubmitting(true);
          try {
            await captureRef.current(data.orderId);
            onSuccessRef.current(data.orderId);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Capture failed");
            setSubmitting(false);
          }
        };

        const onErrorCommon = (err: unknown) => {
          console.error("PayPal error", err);
          setError("Payment could not be completed. Please try again.");
          setSubmitting(false);
        };

        // ---- Eligibility ------------------------------------------------
        let eligibility: { isEligible: (m: string) => boolean } | null = null;
        try {
          eligibility = await sdk.findEligibleMethods({ currency: config.currency });
        } catch (e) {
          console.warn("findEligibleMethods failed", e);
        }
        const isEligible = (m: string) =>
          eligibility ? eligibility.isEligible(m) : true;

        // ---- PayPal / Pay Later session --------------------------------
        if (isEligible("paypal")) {
          setPaypalEligible(true);
          const paypalSession = sdk.createPayPalOneTimePaymentSession({
            onApprove: onApproveCommon,
            onCancel: () => setSubmitting(false),
            onError: onErrorCommon,
          });
          // wire button click after render
          queueMicrotask(() => {
            const btn = paypalBtnRef.current;
            if (!btn) return;
            btn.addEventListener("click", async () => {
              try {
                setSubmitting(true);
                await paypalSession.start(
                  { presentationMode: "auto" },
                  async () => ({ orderId: await createOrderRef.current() }),
                );
              } catch (e) {
                onErrorCommon(e);
              }
            });
          });
        }

        // ---- Card fields ----------------------------------------------
        if (sdk.createCardFields) {
          const inputColor = variant === "dialog" ? "#ffffff" : "#0f172a";
          const cardFields = sdk.createCardFields({
            createOrder: () => createOrderRef.current(),
            onApprove: onApproveCommon,
            onError: onErrorCommon,
            style: {
              input: { "font-size": "16px", color: inputColor },
              ".invalid": { color: "#ef4444" },
            },
          });
          if (cardFields.isEligible()) {
            setCardEligible(true);
            cardFieldsRef.current = cardFields;
            // defer field render until refs exist
            queueMicrotask(async () => {
              try {
                await Promise.all(
                  [
                    cardNameRef.current &&
                      cardFields.NameField().render(cardNameRef.current),
                    cardNumberRef.current &&
                      cardFields.NumberField().render(cardNumberRef.current),
                    cardExpiryRef.current &&
                      cardFields.ExpiryField().render(cardExpiryRef.current),
                    cardCvvRef.current &&
                      cardFields.CVVField().render(cardCvvRef.current),
                  ].filter(Boolean) as Promise<void>[],
                );
              } catch (e) {
                console.error("Card fields render failed", e);
              }
            });
          }
        }

        // ---- Apple Pay --------------------------------------------------
        if (
          isEligible("applepay") &&
          typeof window !== "undefined" &&
          window.ApplePaySession?.canMakePayments?.() &&
          sdk.createApplePayOneTimePaymentSession
        ) {
          setAppleEligible(true);
          const appleSession = sdk.createApplePayOneTimePaymentSession({
            onApprove: onApproveCommon,
            onError: onErrorCommon,
          });
          queueMicrotask(() => {
            const host = appleBtnRef.current;
            if (!host) return;
            // Native Apple Pay button via web-component-style element
            host.innerHTML = "";
            const btn = document.createElement("apple-pay-button");
            btn.setAttribute("buttonstyle", variant === "dialog" ? "white" : "black");
            btn.setAttribute("type", "pay");
            btn.setAttribute("locale", "en-US");
            btn.style.width = "100%";
            btn.style.height = "44px";
            btn.style.cursor = "pointer";
            host.appendChild(btn);
            btn.addEventListener("click", async () => {
              try {
                setSubmitting(true);
                const cfg = await appleSession.config();
                const orderId = await createOrderRef.current();
                // Apple Pay flow proper: the SDK handles the merchant
                // validation + payment sheet under the hood when domain is
                // registered with PayPal. We just call confirmOrder.
                const result = await appleSession.confirmOrder({
                  orderId,
                  token: cfg,
                });
                if (result.status === "APPROVED" || result.status === "COMPLETED") {
                  await captureRef.current(orderId);
                  onSuccessRef.current(orderId);
                } else {
                  setSubmitting(false);
                }
              } catch (e) {
                onErrorCommon(e);
              }
            });
          });
        }

        // ---- Google Pay -------------------------------------------------
        if (
          isEligible("googlepay") &&
          sdk.createGooglePayOneTimePaymentSession &&
          config.googleMerchantId
        ) {
          try {
            await loadGooglePayScript();
          } catch (e) {
            console.warn("Google Pay script load failed", e);
          }
          const googleSession = sdk.createGooglePayOneTimePaymentSession({
            onApprove: onApproveCommon,
            onError: onErrorCommon,
          });
          let gpConfig: Awaited<ReturnType<typeof googleSession.getConfig>> | null = null;
          try {
            gpConfig = await googleSession.getConfig();
          } catch (e) {
            console.warn("Google Pay getConfig failed", e);
          }
          if (gpConfig?.isEligible && window.google?.payments?.api?.PaymentsClient) {
            setGoogleEligible(true);
            const PaymentsClient = window.google.payments.api.PaymentsClient;
            // Per Google's API, callbacks live on the client; here we trigger
            // a synchronous popup on user-click and finish via confirmOrder.
            const paymentsClient = new PaymentsClient({
              environment: config.environment === "live" ? "PRODUCTION" : "TEST",
              paymentDataCallbacks: {
                onPaymentAuthorized: async (paymentData: {
                  paymentMethodData: unknown;
                }) => {
                  try {
                    const orderId = await createOrderRef.current();
                    const result = await googleSession.confirmOrder({
                      orderId,
                      paymentMethodData: paymentData.paymentMethodData,
                    });
                    if (
                      result.status === "APPROVED" ||
                      result.status === "COMPLETED"
                    ) {
                      await captureRef.current(orderId);
                      onSuccessRef.current(orderId);
                      return { transactionState: "SUCCESS" };
                    }
                    return {
                      transactionState: "ERROR",
                      error: { message: "Confirmation rejected" },
                    };
                  } catch (e) {
                    return {
                      transactionState: "ERROR",
                      error: {
                        message: e instanceof Error ? e.message : "Failed",
                      },
                    };
                  }
                },
              },
            }) as {
              createButton: (opts: unknown) => HTMLElement;
              loadPaymentData: (req: unknown) => void;
            };
            queueMicrotask(() => {
              const host = googleBtnRef.current;
              if (!host) return;
              host.innerHTML = "";
              const button = paymentsClient.createButton({
                onClick: () => {
                  paymentsClient.loadPaymentData({
                    apiVersion: gpConfig!.apiVersion,
                    apiVersionMinor: gpConfig!.apiVersionMinor,
                    allowedPaymentMethods: gpConfig!.allowedPaymentMethods,
                    merchantInfo: gpConfig!.merchantInfo,
                    transactionInfo: {
                      countryCode: gpConfig!.countryCode || "US",
                      currencyCode: amount.currency,
                      totalPriceStatus: "FINAL",
                      totalPrice: amount.value,
                    },
                    callbackIntents: ["PAYMENT_AUTHORIZATION"],
                  });
                },
                buttonColor: variant === "dialog" ? "white" : "black",
                buttonType: "pay",
                buttonSizeMode: "fill",
              });
              host.appendChild(button);
            });
          }
        }

        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Something went wrong");
          setStatus("error");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
    // confirmWalletFn is currently unused — wallet flows use server fns indirectly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset SDK cache on unmount so a fresh mount (different cart/tier)
  // re-initialises eligibility against the new context.
  useEffect(() => {
    return () => {
      resetPaypalV6Cache();
    };
  }, []);

  // confirmWalletFn intentionally referenced to keep React's deps audit quiet.
  // (Apple/Google sessions call PayPal's SDK directly; if you later want to
  // confirm via your own server endpoint instead of the SDK helper, swap in
  // confirmWalletFn here.)
  void confirmWalletFn;

  async function submitCard() {
    if (!cardFieldsRef.current || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await cardFieldsRef.current.submit();
      // onApprove handles the rest
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Card payment failed. Check your details.",
      );
      setSubmitting(false);
    }
  }

  const surfaceMuted =
    variant === "dialog" ? "border-border bg-muted/20" : "border-border bg-muted/30";
  const dividerLabel = "uppercase tracking-widest text-muted-foreground";

  return (
    <div className="space-y-5">
      {status === "loading" && (
        <div className={`p-4 border ${surfaceMuted} font-mono text-xs text-muted-foreground`}>
          Loading secure payment…
        </div>
      )}

      {error && (
        <div className="p-3 border border-destructive/40 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* PayPal / Pay Later */}
      {paypalEligible && (
        <button
          ref={paypalBtnRef}
          type="button"
          disabled={submitting}
          className="w-full bg-[#FFC439] text-[#003087] font-bold px-6 py-4 text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span>Pay with</span>
          <span className="font-extrabold italic tracking-tight">PayPal</span>
        </button>
      )}

      {/* Apple Pay */}
      {appleEligible && (
        <div ref={appleBtnRef} aria-label="Apple Pay" />
      )}

      {/* Google Pay */}
      {googleEligible && (
        <div ref={googleBtnRef} aria-label="Google Pay" />
      )}

      {/* Card fields */}
      {cardEligible && (
        <>
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className={`font-mono text-[10px] ${dividerLabel}`}>
              Or pay by card
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <CardField label="Cardholder name" innerRef={cardNameRef} />
            <CardField label="Card number" innerRef={cardNumberRef} />
            <div className="grid grid-cols-2 gap-3">
              <CardField label="Expiry" innerRef={cardExpiryRef} />
              <CardField label="CVV" innerRef={cardCvvRef} />
            </div>
            <button
              type="button"
              onClick={submitCard}
              disabled={submitting}
              className={
                variant === "dialog"
                  ? "w-full bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  : "w-full bg-foreground text-background font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              }
            >
              {submitting ? "Processing…" : payLabel}
            </button>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
              PCI-DSS handled by PayPal — card data never touches this site
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function CardField({
  label,
  innerRef,
}: {
  label: string;
  innerRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
        {label}
      </span>
      <div
        ref={innerRef}
        className="min-h-[44px] px-3 py-2 border border-input bg-background focus-within:border-accent transition-colors"
      />
    </label>
  );
}
