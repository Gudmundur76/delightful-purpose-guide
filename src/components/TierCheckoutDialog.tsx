import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  createTierOrder,
  captureTierOrder,
  type TierKey,
} from "@/lib/paypal/tier-checkout.functions";
import { getPaypalPublicConfig } from "@/lib/paypal/paypal.functions";

type PayPalNamespace = {
  Buttons: (opts: unknown) => { render: (sel: string | HTMLElement) => Promise<void> };
  CardFields: (opts: unknown) => {
    isEligible: () => boolean;
    NameField: () => { render: (sel: string | HTMLElement) => Promise<void> };
    NumberField: () => { render: (sel: string | HTMLElement) => Promise<void> };
    ExpiryField: () => { render: (sel: string | HTMLElement) => Promise<void> };
    CVVField: () => { render: (sel: string | HTMLElement) => Promise<void> };
    submit: () => Promise<void>;
  };
};

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

let sdkLoadingPromise: Promise<PayPalNamespace> | null = null;

function loadPaypalSdk(clientId: string, currency: string): Promise<PayPalNamespace> {
  if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkLoadingPromise) return sdkLoadingPromise;

  sdkLoadingPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      "client-id": clientId,
      currency,
      components: "buttons,card-fields",
      intent: "capture",
    });
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.onload = () => {
      if (window.paypal) resolve(window.paypal);
      else reject(new Error("PayPal SDK failed to initialize"));
    };
    script.onerror = () => reject(new Error("Could not load PayPal SDK"));
    document.head.appendChild(script);
  });

  return sdkLoadingPromise;
}

type Props = {
  open: boolean;
  onClose: () => void;
  tier: TierKey;
  tierName: string;
  priceDisplay: string;
};

export function TierCheckoutDialog({
  open,
  onClose,
  tier,
  tierName,
  priceDisplay,
}: Props) {
  const createOrderFn = useServerFn(createTierOrder);
  const captureFn = useServerFn(captureTierOrder);
  const getConfig = useServerFn(getPaypalPublicConfig);

  const [status, setStatus] = useState<"loading" | "ready" | "error" | "success">(
    "loading",
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cardEligible, setCardEligible] = useState(false);

  const buttonsRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLDivElement>(null);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvvRef = useRef<HTMLDivElement>(null);
  const cardFieldsInstance = useRef<ReturnType<PayPalNamespace["CardFields"]> | null>(
    null,
  );
  const mountedRef = useRef(false);

  useEffect(() => {
    if (!open || mountedRef.current) return;
    mountedRef.current = true;
    let cancelled = false;

    async function init() {
      try {
        const config = await getConfig();
        if (!config.clientId) {
          throw new Error(
            "PayPal is not configured. Add PAYPAL_CLIENT_ID in backend secrets.",
          );
        }
        const paypal = await loadPaypalSdk(config.clientId, config.currency);
        if (cancelled) return;

        async function createOrder(): Promise<string> {
          const res = await createOrderFn({ data: { tier } });
          return res.orderId;
        }

        async function onApprove(data: { orderID: string }) {
          setSubmitting(true);
          try {
            await captureFn({ data: { orderId: data.orderID } });
            setStatus("success");
            setSubmitting(false);
          } catch (e) {
            console.error(e);
            setError("Try again or contact hello@grow.contact");
            setSubmitting(false);
          }
        }

        function onError(err: unknown) {
          console.error("PayPal error", err);
          setError("Try again or contact hello@grow.contact");
          setSubmitting(false);
        }

        if (buttonsRef.current) {
          await paypal
            .Buttons({
              style: { layout: "vertical", shape: "rect", color: "white" },
              createOrder,
              onApprove,
              onError,
              onCancel: () => setSubmitting(false),
            })
            .render(buttonsRef.current);
        }

        const cardFields = paypal.CardFields({
          createOrder,
          onApprove,
          onError,
          style: {
            input: {
              "font-size": "15px",
              color: "#ffffff",
              "font-family": "ui-monospace, monospace",
            },
            ".invalid": { color: "#ef4444" },
          },
        });

        if (cardFields.isEligible()) {
          setCardEligible(true);
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
          cardFieldsInstance.current = cardFields;
        }

        if (!cancelled) setStatus("ready");
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Could not load payment. Try again or contact hello@grow.contact",
          );
          setStatus("error");
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [open, tier, createOrderFn, captureFn, getConfig]);

  // Reset on close so dialog can re-init for a different tier
  useEffect(() => {
    if (!open) {
      mountedRef.current = false;
      cardFieldsInstance.current = null;
      setStatus("loading");
      setError(null);
      setCardEligible(false);
      setSubmitting(false);
    }
  }, [open]);

  async function submitCard() {
    if (!cardFieldsInstance.current || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await cardFieldsInstance.current.submit();
    } catch (e) {
      console.error(e);
      setError("Try again or contact hello@grow.contact");
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md border border-border bg-card text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          ✕ ESC
        </button>

        <div className="border-b border-border p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
            // {tier === "starter" ? "Tier 01" : "Tier 02"} — Secure checkout
          </p>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-extrabold uppercase tracking-tighter">
              {tierName}
            </h2>
            <span className="text-2xl font-bold tracking-tighter">{priceDisplay}</span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {status === "success" ? (
            <div className="space-y-3 py-6 text-center">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
                // Confirmed
              </p>
              <p className="text-lg font-bold">Payment successful!</p>
              <p className="text-sm text-muted-foreground">
                48h build starts now. Check your email for next steps.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 inline-flex w-full justify-center bg-foreground text-background font-mono text-[11px] uppercase tracking-widest px-5 py-3 hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              {status === "loading" && (
                <div className="p-4 border border-border bg-muted/20 font-mono text-xs text-muted-foreground">
                  Loading secure payment…
                </div>
              )}

              {error && (
                <div className="p-3 border border-destructive/40 bg-destructive/10 text-destructive text-sm">
                  {error}
                </div>
              )}

              <div
                ref={buttonsRef}
                className={status === "ready" ? "" : "hidden"}
              />

              {cardEligible && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      Or pay by card
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-3">
                    <Field label="Cardholder name" innerRef={cardNameRef} />
                    <Field label="Card number" innerRef={cardNumberRef} />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Expiry" innerRef={cardExpiryRef} />
                      <Field label="CVV" innerRef={cardCvvRef} />
                    </div>
                    <button
                      type="button"
                      onClick={submitCard}
                      disabled={submitting}
                      className="w-full bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? "Processing…" : `Pay ${priceDisplay}`}
                    </button>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground text-center">
                      PCI-DSS handled by PayPal — card data never touches this site
                    </p>
                    <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                      By paying you agree to our{" "}
                      <a href="/terms" className="underline hover:text-foreground">Terms</a>,{" "}
                      <a href="/refund" className="underline hover:text-foreground">Refund Policy</a> and{" "}
                      <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>. A receipt is emailed on capture.
                    </p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
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
