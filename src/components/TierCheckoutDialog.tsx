import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import {
  createTierOrder,
  captureTierOrder,
  type TierKey,
} from "@/lib/paypal/tier-checkout.functions";
import { PayPalV6Checkout } from "@/components/paypal/PayPalV6Checkout";

type Props = {
  open: boolean;
  onClose: () => void;
  tier: TierKey;
  tierName: string;
  priceDisplay: string;
  /** Optional lead UUID — forwarded to PayPal so the payment links back to the brief. */
  leadId?: string;
};

const TIER_AMOUNTS: Record<TierKey, string> = {
  starter: "2400.00",
  growth: "4800.00",
};

export function TierCheckoutDialog({
  open,
  onClose,
  tier,
  tierName,
  priceDisplay,
  leadId,
}: Props) {
  const createOrderFn = useServerFn(createTierOrder);
  const captureFn = useServerFn(captureTierOrder);
  const navigate = useNavigate();

  const [success, setSuccess] = useState(false);

  // reset success state when dialog opens fresh
  useEffect(() => {
    if (open) setSuccess(false);
  }, [open]);

  async function createOrder(): Promise<string> {
    const res = await createOrderFn({ data: { tier, leadId } });
    return res.orderId;
  }

  async function capture(orderId: string): Promise<void> {
    await captureFn({ data: { orderId } });
  }

  function handleSuccess(orderId: string) {
    setSuccess(true);
    onClose();
    navigate({ to: "/checkout/success", search: { order: orderId } });
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center bg-black/80 p-0 sm:p-4 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md border border-border bg-card text-foreground my-auto max-h-dvh sm:max-h-[calc(100dvh-2rem)] overflow-y-auto"
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
          {success ? (
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
              <PayPalV6Checkout
                key={`${tier}-${open ? "open" : "closed"}`}
                createOrder={createOrder}
                capture={capture}
                onSuccess={handleSuccess}
                amount={{ value: TIER_AMOUNTS[tier], currency: "USD" }}
                payLabel={`Pay ${priceDisplay}`}
                variant="dialog"
              />
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                By paying you agree to our{" "}
                <a href="/terms" className="underline hover:text-foreground">Terms</a>,{" "}
                <a href="/refund" className="underline hover:text-foreground">Refund Policy</a> and{" "}
                <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>. A receipt is emailed on capture.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
