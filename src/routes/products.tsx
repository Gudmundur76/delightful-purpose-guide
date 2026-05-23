import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listProducts } from "@/lib/paypal/paypal.functions";
import { useCart, formatMoney, type Product } from "@/lib/cart/CartContext";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Shop — Grow" },
      { name: "description", content: "Browse Grow services and packages. Secure checkout with PayPal." },
      { property: "og:title", content: "Shop — Grow" },
      { property: "og:description", content: "Services and packages available for purchase." },
      { property: "og:url", content: "https://grow.contact/products" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/products" }],
  }),
  component: ProductsPage,
});

function ProductsPage() {
  const fn = useServerFn(listProducts);
  const { data, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: () => fn(),
  });
  const cart = useCart();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <header className="mb-12 flex items-end justify-between gap-6 flex-wrap">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
              // shop
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter">
              Services & packages
            </h1>
          </div>
          {cart.count > 0 && (
            <Link
              to="/checkout"
              className="bg-accent text-accent-foreground font-bold px-5 py-3 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors"
            >
              Cart ({cart.count}) → Checkout
            </Link>
          )}
        </header>

        {isLoading && <p className="text-muted-foreground font-mono text-sm">Loading…</p>}
        {error && (
          <p className="text-destructive font-mono text-sm">
            Could not load products.
          </p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.products.map((p) => (
            <ProductCard key={p.id} product={p as Product} />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const inCart = cart.items.find((i) => i.product.id === product.id);
  return (
    <article className="border border-border bg-card p-6 flex flex-col gap-4 hover:border-accent transition-colors">
      <div>
        <h2 className="font-extrabold uppercase tracking-tighter text-xl mb-2">
          {product.name}
        </h2>
        {product.description && (
          <p className="text-sm text-muted-foreground">{product.description}</p>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between">
        <span className="font-mono text-lg font-bold">
          {formatMoney(product.price_cents, product.currency)}
        </span>
        <button
          type="button"
          onClick={() => cart.add(product)}
          className="bg-foreground text-background text-xs font-bold px-4 py-2 uppercase tracking-tighter hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          {inCart ? `In cart (${inCart.qty})` : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
