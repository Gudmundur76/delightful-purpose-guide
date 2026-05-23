import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const searchSchema = z.object({
  order: z.string().optional(),
});

export const Route = createFileRoute("/checkout/success")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Order confirmed — Grow" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { order } = Route.useSearch();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
          // confirmed
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold uppercase tracking-tighter mb-4">
          Payment received
        </h1>
        <p className="text-muted-foreground mb-2">
          Thank you — your order is confirmed and we'll be in touch shortly.
        </p>
        {order && (
          <p className="font-mono text-xs text-muted-foreground mb-8">
            Order reference: <span className="text-foreground">{order}</span>
          </p>
        )}
        <Link
          to="/"
          className="inline-flex bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}
