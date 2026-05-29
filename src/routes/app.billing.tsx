import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { z } from "zod";
import {
  listPlans,
  getMySubscription,
  startSubscriptionCheckout,
  confirmSubscription,
  cancelMySubscription,
} from "@/lib/monitoring/billing.functions";

const Search = z.object({
  paypal: z.enum(["success", "cancel"]).optional(),
  subscription_id: z.string().optional(),
});

export const Route = createFileRoute("/app/billing")({
  validateSearch: (s) => Search.parse(s),
  component: BillingPage,
});

function fmt(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function BillingPage() {
  const plansFn = useServerFn(listPlans);
  const subFn = useServerFn(getMySubscription);
  const startFn = useServerFn(startSubscriptionCheckout);
  const confirmFn = useServerFn(confirmSubscription);
  const cancelFn = useServerFn(cancelMySubscription);
  const qc = useQueryClient();
  const search = useSearch({ from: "/app/billing" });

  const plansQ = useQuery({ queryKey: ["billing", "plans"], queryFn: () => plansFn() });
  const subQ = useQuery({ queryKey: ["billing", "subscription"], queryFn: () => subFn() });

  const startMut = useMutation({
    mutationFn: (planId: "pro" | "team") => startFn({ data: { planId } }),
    onSuccess: (r) => { window.location.href = r.approveUrl; },
  });
  const confirmMut = useMutation({
    mutationFn: (id: string) => confirmFn({ data: { subscriptionId: id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
  });
  const cancelMut = useMutation({
    mutationFn: () => cancelFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["billing"] }),
  });

  // PayPal returns ?subscription_id=I-... on approve.
  useEffect(() => {
    if (search.paypal === "success" && search.subscription_id) {
      confirmMut.mutate(search.subscription_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.paypal, search.subscription_id]);

  const sub = subQ.data?.subscription;
  const plans = plansQ.data?.plans ?? [];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-extrabold uppercase tracking-tighter text-3xl">Billing</h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Current plan: <span className="text-accent">{sub?.plan?.name ?? "Free"}</span>
          {sub?.status ? ` · ${sub.status}` : ""}
        </p>
      </header>

      {search.paypal === "success" && (
        <div className="border border-accent/40 bg-accent/10 p-4 font-mono text-xs">
          ✓ Subscription approved. Activating…
        </div>
      )}

      {sub && sub.status === "active" && (
        <button
          type="button"
          onClick={() => { if (confirm("Cancel subscription?")) cancelMut.mutate(); }}
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
        >
          Cancel subscription
        </button>
      )}

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((p) => {
          const active = sub?.plan_id === p.id && sub.status === "active";
          const isPaid = p.id !== "free";
          return (
            <div key={p.id} className="border border-border bg-card p-6 flex flex-col">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent">// {p.id}</p>
              <h2 className="font-extrabold uppercase tracking-tighter text-2xl mt-2">{p.name}</h2>
              <p className="text-3xl font-bold mt-2">{fmt(p.price_cents)}<span className="text-sm text-muted-foreground">/mo</span></p>
              <ul className="mt-4 space-y-1 font-mono text-xs text-muted-foreground flex-1">
                <li>{p.monthly_scan_quota.toLocaleString()} scans / month</li>
                <li>{p.max_sites} monitored sites</li>
                <li>Cadence: {p.scan_interval}</li>
              </ul>
              {active ? (
                <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-accent">// CURRENT PLAN</div>
              ) : isPaid ? (
                <button
                  type="button"
                  disabled={startMut.isPending}
                  onClick={() => startMut.mutate(p.id as "pro" | "team")}
                  className="mt-6 bg-accent text-accent-foreground font-bold uppercase tracking-tighter py-3 disabled:opacity-50"
                >
                  {startMut.isPending ? "Redirecting…" : `Subscribe`}
                </button>
              ) : (
                <div className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">// FREE TIER</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
