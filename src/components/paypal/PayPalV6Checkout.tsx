import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  createPaypalClientToken,
  confirmPaypalWalletOrder,
  getPaypalPublicConfig,
} from "@/lib/paypal/paypal.functions";
import {
  loadGooglePayScript,
  loadPaypalSdk,
  resetPaypalSdkCache,
  type PayPalCardFieldsInstance,
  type V6Component,
} from "@/lib/paypal/paypal-v6";

type AmountInfo = { value: string; currency: string };

export type PayPalV6CheckoutProps = {
  createOrder: () => Promise<string>;
  capture: (orderId: string) => Promise<void>;
  onSuccess: (orderId: string) => void;
  amount: AmountInfo;
  payLabel: string;
  variant?: "page" | "dialog";
};

const COMPONENTS: V6Component[] = [
  "buttons",
  "card-fields",
  "fastlane",
  "applepay",
  "googlepay",
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
  // Fallback for accounts without ACDC (inline CardFields). When CardFields
  // isn't eligible, we render PayPal's hosted card button which works on any
  // standard PayPal account but opens a popup overlay.
  const [cardButtonEligible, setCardButtonEligible] = useState(false);

  const cardNameRef = useRef<HTMLDivElement>(null);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvvRef = useRef<HTMLDivElement>(null);
  const appleBtnRef = useRef<HTMLDivElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const cardBtnRef = useRef<HTMLDivElement>(null);

  const cardFieldsRef = useRef<PayPalCardFieldsInstance | null>(null);
  const mountedRef = useRef(false);

  const createOrderRef = useRef(createOrder);
  const captureRef = useRef(capture);
  const onSuccessRef = useRef(onSuccess);
  createOrderRef.current = createOrder;
  captureRef.current = capture;
  onSuccessRef.current = onSuccess;

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    // NOTE: do NOT use a cancellation flag tied to effect cleanup. React 18
    // Strict Mode double-invokes effects in dev — the first cleanup would
    // flip `cancelled=true` before async init resolves, and the guarded
    // re-run wouldn't restart it, leaving status stuck on "loading".
    const cancelled = false;



    async function init() {
      try {
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

        const paypal = await loadPaypalSdk({
          clientId: config.clientId,
          clientToken,
          components: COMPONENTS,
          currency: amount.currency || config.currency,
        });
        if (cancelled) return;

        const onApproveCommon = async (data: { orderID: string }) => {
          setSubmitting(true);
          try {
            await captureRef.current(data.orderID);
            onSuccessRef.current(data.orderID);
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







        // ---- Card fields (inline ACDC) --------------------------------
        let cardFieldsEligible = false;
        if (paypal.CardFields) {
          const inputColor = variant === "dialog" ? "#ffffff" : "#0f172a";
          const cardFields = paypal.CardFields({
            createOrder: () => createOrderRef.current(),
            onApprove: onApproveCommon,
            onError: onErrorCommon,
            style: {
              input: { "font-size": "16px", color: inputColor },
              ".invalid": { color: "#ef4444" },
            },
          });
          if (cardFields.isEligible()) {
            cardFieldsEligible = true;
            setCardEligible(true);
            cardFieldsRef.current = cardFields;
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

        // ---- Card button fallback (hosted card popup) -----------------
        // Only render when inline CardFields aren't available — keeps the
        // checkout functional on PayPal accounts without ACDC enabled.
        if (!cardFieldsEligible && paypal.Buttons) {
          const cardFunding = paypal.FUNDING?.CARD ?? "card";
          if (paypal.isFundingEligible?.(cardFunding) !== false) {
            const cardButtons = paypal.Buttons({
              fundingSource: cardFunding,
              style: {
                layout: "vertical",
                shape: "rect",
                color: "black",
                label: "pay",
              },
              createOrder: () => createOrderRef.current(),
              onApprove: onApproveCommon,
              onCancel: () => setSubmitting(false),
              onError: onErrorCommon,
            });
            if (cardButtons.isEligible()) {
              setCardButtonEligible(true);
              queueMicrotask(() => {
                if (cardBtnRef.current) {
                  cardButtons.render(cardBtnRef.current).catch((e) =>
                    console.warn("PayPal Card button render failed", e),
                  );
                }
              });
            }
          }
        }


        // ---- Apple Pay --------------------------------------------------
        if (
          paypal.Applepay &&
          typeof window !== "undefined" &&
          window.ApplePaySession?.canMakePayments?.()
        ) {
          try {
            const apple = paypal.Applepay();
            const cfg = await apple.config();
            if (cfg.isEligible) {
              setAppleEligible(true);
              queueMicrotask(() => {
                const host = appleBtnRef.current;
                if (!host) return;
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
                    const orderId = await createOrderRef.current();
                    const result = await apple.confirmOrder({
                      orderId,
                      token: cfg,
                    });
                    if (
                      result.status === "APPROVED" ||
                      result.status === "COMPLETED"
                    ) {
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
          } catch (e) {
            console.warn("Apple Pay setup failed", e);
          }
        }

        // ---- Google Pay -------------------------------------------------
        if (paypal.Googlepay && config.googleMerchantId) {
          try {
            await loadGooglePayScript();
            const google = paypal.Googlepay();
            const gpConfig = await google.config();
            if (gpConfig.isEligible && window.google?.payments?.api?.PaymentsClient) {
              setGoogleEligible(true);
              const PaymentsClient = window.google.payments.api.PaymentsClient;
              const paymentsClient = new PaymentsClient({
                environment: config.environment === "live" ? "PRODUCTION" : "TEST",
                paymentDataCallbacks: {
                  onPaymentAuthorized: async (paymentData: {
                    paymentMethodData: unknown;
                  }) => {
                    try {
                      const orderId = await createOrderRef.current();
                      const result = await google.confirmOrder({
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
                      apiVersion: gpConfig.apiVersion,
                      apiVersionMinor: gpConfig.apiVersionMinor,
                      allowedPaymentMethods: gpConfig.allowedPaymentMethods,
                      merchantInfo: gpConfig.merchantInfo,
                      transactionInfo: {
                        countryCode: gpConfig.countryCode || "US",
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
          } catch (e) {
            console.warn("Google Pay setup failed", e);
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
      // no-op: mountedRef guard prevents double-init under Strict Mode
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      resetPaypalSdkCache();
    };
  }, []);

  void confirmWalletFn;

  async function submitCard() {
    if (!cardFieldsRef.current || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await cardFieldsRef.current.submit();
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

      {/* Wallets — fully inline */}
      <div ref={appleBtnRef} aria-label="Apple Pay" style={{ display: appleEligible ? undefined : "none" }} />
      <div ref={googleBtnRef} aria-label="Google Pay" style={{ display: googleEligible ? undefined : "none" }} />

      {/* Card fields — fully inline, hosts always mounted, UI hidden until eligible */}
      <div style={{ display: cardEligible ? undefined : "none" }}>
        {(appleEligible || googleEligible) && (
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-border" />
            <span className={`font-mono text-[10px] ${dividerLabel}`}>
              Or pay by card
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        )}

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
      </div>

      {/* Card button fallback — wrapped in bespoke branded card */}
      <div style={{ display: cardButtonEligible ? undefined : "none" }}>
        <div className="border border-border bg-card p-5 space-y-4">
          {/* Header lockup */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-accent shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span className="font-mono text-[11px] uppercase tracking-widest text-foreground font-bold">
                Secure checkout
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Visa */}
              <div className="w-8 h-5 rounded-sm bg-white flex items-center justify-center">
                <svg viewBox="0 0 48 32" className="w-6 h-4">
                  <rect width="48" height="32" rx="3" fill="#1A1F71" />
                  <path d="M19.2 21.5l2.4-14h3.8l-2.4 14H19.2zM33.4 8.9c-.7-.3-1.8-.5-3.2-.5-3.5 0-6 1.8-6 4.3 0 1.9 1.8 2.9 3.1 3.5 1.4.7 1.9 1.1 1.9 1.7 0 .9-1.2 1.4-2.3 1.4-1.5 0-2.3-.2-3.5-.7l-.5-.2-.5 3c.9.4 2.5.7 4.2.7 3.7 0 6.1-1.8 6.1-4.5 0-1.5-1-2.4-3-3.3-1.2-.6-2-.9-2-1.6 0-.5.6-1.1 1.9-1.1 1.2 0 2.1.3 2.8.5l.4.2.4-2.9zM42.6 8.9c-1.5 0-2.6.6-3.2 1.7l-.1.2-.1-.2-.9-1.5h-2.7c.1.4.3 1.1.3 1.7l1.2 7.3h3.5l-1.6-7.5c.5-.3 1.1-.4 1.7-.4.5 0 1 .1 1.3.2l.6-3.2c-.2-.1-.7-.3-1.9-.3h-.1zM15.1 8.9l-3.4 9.1.4-1.7-1.3-6.2c-.2-.7-.6-1.1-1.2-1.2H7.3l-.1.4c1.4.3 2.4.8 3.2 1.5l1.7 7.7h3.6l5.3-9.1h-3.6l-.3.1z" fill="white" />
                </svg>
              </div>
              {/* Mastercard */}
              <div className="w-8 h-5 rounded-sm bg-white flex items-center justify-center">
                <svg viewBox="0 0 48 32" className="w-6 h-4">
                  <rect width="48" height="32" rx="3" fill="white" />
                  <circle cx="18" cy="16" r="9" fill="#EB001B" />
                  <circle cx="30" cy="16" r="9" fill="#F79E1B" />
                  <path d="M24 9.5a9 9 0 0 0 0 13 9 9 0 0 0 0-13z" fill="#FF5F00" />
                </svg>
              </div>
              {/* Amex */}
              <div className="w-8 h-5 rounded-sm bg-white flex items-center justify-center">
                <svg viewBox="0 0 48 32" className="w-6 h-4">
                  <rect width="48" height="32" rx="3" fill="#016FD0" />
                  <path d="M4 10h7.5l2.5 3.5L16.5 10H24v12h-5.5v-7l-3 7h-3l-3-7v7H4V10zm28 0h6l4 12h-6l-.5-1.5h-4L31 22h-6l4-12zm2.5 3.5l-1.5 5h3l-1.5-5z" fill="white" />
                </svg>
              </div>
            </div>
          </div>

          {/* PayPal card button mount */}
          <div ref={cardBtnRef} aria-label="Debit or Credit Card" />

          {/* Trust strip */}
          <div className="flex items-center justify-center gap-2 pt-1 border-t border-border">
            <svg className="w-3 h-3 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              256-bit SSL · PayPal protected · No account needed
            </span>
          </div>
        </div>
      </div>
      {cardButtonEligible && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center -mt-3 hidden">
          Card checkout opens in a secure PayPal window — no PayPal account needed
        </p>
      )}

      {status === "ready" && !appleEligible && !googleEligible && !cardEligible && !cardButtonEligible && (
        <div className="p-3 border border-destructive/40 bg-destructive/10 text-destructive text-sm">
          No payment methods are available in this environment. Please contact us to complete your purchase.
        </div>
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
