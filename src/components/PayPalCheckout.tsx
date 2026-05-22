import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import {
  createPaypalOrder,
  capturePaypalOrder,
  getPaypalPublicConfig,
} from "@/lib/paypal/paypal.functions";
import { useCart, formatMoney } from "@/lib/cart/CartContext";

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

export function PayPalCheckout() {
  const cart = useCart();
  const navigate = useNavigate();
  const createOrderFn = useServerFn(createPaypalOrder);
  const captureFn = useServerFn(capturePaypalOrder);
  const getConfig = useServerFn(getPaypalPublicConfig);

  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [cardEligible, setCardEligible] = useState(false);

  const buttonsRef = useRef<HTMLDivElement>(null);
  const cardNameRef = useRef<HTMLDivElement>(null);
  const cardNumberRef = useRef<HTMLDivElement>(null);
  const cardExpiryRef = useRef<HTMLDivElement>(null);
  const cardCvvRef = useRef<HTMLDivElement>(null);
  const cardFieldsInstance = useRef<ReturnType<PayPalNamespace["CardFields"]> | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    let cancelled = false;

    async function init() {
      try {
        const config = await getConfig();
        if (!config.clientId) {
          throw new Error("PayPal is not configured. Add PAYPAL_CLIENT_ID.");
        }
        const paypal = await loadPaypalSdk(config.clientId, config.currency).catch(
          (e) => {
            throw new Error(
              `Could not load PayPal SDK (env: ${config.environment}, client-id ends in …${config.clientId!.slice(-6)}). ` +
                `Most likely PAYPAL_CLIENT_ID doesn't match PAYPAL_ENVIRONMENT=${config.environment}. ` +
                `Other causes: ad/tracker blocker on paypal.com, or invalid client ID. ` +
                `Underlying: ${e instanceof Error ? e.message : String(e)}`,
            );
          },
        );
        if (cancelled) return;

        const itemsPayload = () =>
          cart.items.map((i) => ({ productId: i.product.id, qty: i.qty }));

        async function createOrder(): Promise<string> {
          const res = await createOrderFn({ data: { items: itemsPayload() } });
          return res.orderId;
        }

        async function onApprove(data: { orderID: string }) {
          setSubmitting(true);
          try {
            const result = await captureFn({ data: { orderId: data.orderID } });
            cart.clear();
            navigate({
              to: "/checkout/success",
              search: { order: result.orderId },
            });
          } catch (e) {
            setError(e instanceof Error ? e.message : "Capture failed");
            setSubmitting(false);
          }
        }

        function onError(err: unknown) {
          console.error("PayPal error", err);
          setError("Payment could not be completed. Please try again.");
          setSubmitting(false);
        }

        // Smart buttons
        if (buttonsRef.current) {
          await paypal
            .Buttons({
              style: { layout: "vertical", shape: "rect" },
              createOrder,
              onApprove,
              onError,
              onCancel: () => setSubmitting(false),
            })
            .render(buttonsRef.current);
        }

        // Hosted card fields
        const cardFields = paypal.CardFields({
          createOrder,
          onApprove,
          onError,
          style: {
            input: { "font-size": "16px", color: "#0f172a" },
          },
        });

        if (cardFields.isEligible()) {
          setCardEligible(true);
          await Promise.all([
            cardNameRef.current &&
              cardFields.NameField().render(cardNameRef.current),
            cardNumberRef.current &&
              cardFields.NumberField().render(cardNumberRef.current),
            cardExpiryRef.current &&
              cardFields.ExpiryField().render(cardExpiryRef.current),
            cardCvvRef.current &&
              cardFields.CVVField().render(cardCvvRef.current),
          ]);
          cardFieldsInstance.current = cardFields;
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

  async function submitCard() {
    if (!cardFieldsInstance.current || submitting) return;
    setError(null);
    setSubmitting(true);
    try {
      await cardFieldsInstance.current.submit();
      // onApprove handles the rest
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Card payment failed. Check your details.",
      );
      setSubmitting(false);
    }
  }

  const totalLabel = formatMoney(cart.subtotalCents, cart.currency);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-extrabold uppercase tracking-tighter text-2xl mb-1">
          Payment Method
        </h2>
        <p className="text-sm text-muted-foreground">
          Secure checkout. Card data is handled by PayPal — never stored on this site.
        </p>
      </div>

      {status === "loading" && (
        <div className="p-6 border border-border bg-muted/30 text-sm text-muted-foreground font-mono">
          Loading secure payment…
        </div>
      )}

      {error && (
        <div className="p-4 border border-destructive/40 bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div
        ref={buttonsRef}
        className={status === "ready" ? "" : "hidden"}
        id="paypal-button-container"
      />

      {cardEligible && (
        <>
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Or pay by card
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-3">
            <FieldShell label="Cardholder name" innerRef={cardNameRef} />
            <FieldShell label="Card number" innerRef={cardNumberRef} />
            <div className="grid grid-cols-2 gap-3">
              <FieldShell label="Expiry" innerRef={cardExpiryRef} />
              <FieldShell label="CVV" innerRef={cardCvvRef} />
            </div>
            <button
              type="button"
              onClick={submitCard}
              disabled={submitting || cart.items.length === 0}
              className="w-full bg-foreground text-background font-bold px-6 py-4 uppercase tracking-tighter text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Processing…" : `Pay ${totalLabel}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function FieldShell({
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
