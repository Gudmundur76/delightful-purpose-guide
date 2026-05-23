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
  const [paypalEligible, setPaypalEligible] = useState(false);
  const [cardButtonEligible, setCardButtonEligible] = useState(false);

  const paypalBtnRef = useRef<HTMLDivElement>(null);
  const cardBtnRef = useRef<HTMLDivElement>(null);
  const appleBtnRef = useRef<HTMLDivElement>(null);
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLDivElement>(null);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvvRef = useRef<HTMLDivElement>(null);

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

        // ---- Debit or Credit Card button (guest checkout) — shown first as default ---
        if (paypal.Buttons) {
          const cardFunding = paypal.FUNDING?.CARD ?? "card";
          if (paypal.isFundingEligible?.(cardFunding) !== false) {
            const cardButtons = paypal.Buttons({
              fundingSource: cardFunding,
              style: {
                layout: "vertical",
                shape: "rect",
                color: "black",
                label: "checkout",
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

        // ---- PayPal / Pay Later buttons --------------------------------
        if (paypal.Buttons) {
          const buttons = paypal.Buttons({
            style: {
              layout: "vertical",
              shape: "rect",
              color: "gold",
              label: "paypal",
            },
            createOrder: () => createOrderRef.current(),
            onApprove: onApproveCommon,
            onCancel: () => setSubmitting(false),
            onError: onErrorCommon,
          });
          if (buttons.isEligible()) {
            setPaypalEligible(true);
            queueMicrotask(() => {
              if (paypalBtnRef.current) {
                buttons.render(paypalBtnRef.current).catch((e) =>
                  console.warn("PayPal Buttons render failed", e),
                );
              }
            });
          }
        }

        // ---- Card fields (inline ACDC) --------------------------------
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
      cancelled = true;
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

      {/* Debit or Credit Card button (guest checkout) — shown first as default */}
      <div ref={cardBtnRef} aria-label="Debit or Credit Card" style={{ display: cardButtonEligible ? undefined : "none" }} />
      {cardButtonEligible && (
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center -mt-3 mb-2">
          Opens PayPal's secure guest checkout — you can pay with any card without a PayPal account
        </p>
      )}

      {/* Standard PayPal button */}
      <div ref={paypalBtnRef} aria-label="PayPal" style={{ display: paypalEligible ? undefined : "none" }} />
      <div ref={appleBtnRef} aria-label="Apple Pay" style={{ display: appleEligible ? undefined : "none" }} />
      <div ref={googleBtnRef} aria-label="Google Pay" style={{ display: googleEligible ? undefined : "none" }} />

      {/* Card fields — hosts always mounted, UI hidden until eligible */}
      <div style={{ display: cardEligible ? undefined : "none" }}>
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className={`font-mono text-[10px] ${dividerLabel}`}>
            Or pay by card
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="space-y-3 mt-5">
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

      {status === "ready" && !paypalEligible && !cardButtonEligible && !appleEligible && !googleEligible && !cardEligible && (
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
