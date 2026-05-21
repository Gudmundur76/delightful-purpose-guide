import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart, formatMoney } from "@/lib/cart/CartContext";
import { PayPalCheckout } from "@/components/PayPalCheckout";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Grow" },
      { name: "description", content: "Secure checkout for Grow services. PayPal & card accepted." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutInner,
});

function CheckoutInner() {
  const cart = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <header className="mb-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // checkout
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter">
            Review & pay
          </h1>
        </header>

        {cart.items.length === 0 ? (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground mb-4">Your cart is empty.</p>
            <Link
              to="/products"
              className="inline-flex bg-accent text-accent-foreground font-bold px-5 py-3 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
            >
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-10">
            <section>
              <h2 className="font-extrabold uppercase tracking-tighter text-2xl mb-4">
                Order Summary
              </h2>
              <ul className="border border-border bg-card divide-y divide-border">
                {cart.items.map((i) => (
                  <li
                    key={i.product.id}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="font-bold truncate">{i.product.name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <button
                          type="button"
                          onClick={() => cart.setQty(i.product.id, i.qty - 1)}
                          className="w-7 h-7 border border-border hover:border-accent text-sm"
                          aria-label="Decrease"
                        >
                          −
                        </button>
                        <span className="font-mono text-sm w-6 text-center">{i.qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.setQty(i.product.id, i.qty + 1)}
                          className="w-7 h-7 border border-border hover:border-accent text-sm"
                          aria-label="Increase"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => cart.remove(i.product.id)}
                          className="ml-2 text-xs text-muted-foreground hover:text-destructive uppercase tracking-widest font-mono"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <span className="font-mono font-bold whitespace-nowrap">
                      {formatMoney(i.product.price_cents * i.qty, i.product.currency)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex justify-between items-baseline border-t border-border pt-4">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Total
                </span>
                <span className="font-extrabold text-2xl">
                  {formatMoney(cart.subtotalCents, cart.currency)}
                </span>
              </div>
            </section>

            <section>
              <PayPalCheckout />
            </section>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
