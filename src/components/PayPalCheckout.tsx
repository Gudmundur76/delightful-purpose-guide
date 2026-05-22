import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import {
  createPaypalOrder,
  capturePaypalOrder,
} from "@/lib/paypal/paypal.functions";
import { useCart, formatMoney } from "@/lib/cart/CartContext";
import { PayPalV6Checkout } from "@/components/paypal/PayPalV6Checkout";

export function PayPalCheckout() {
  const cart = useCart();
  const navigate = useNavigate();
  const createOrderFn = useServerFn(createPaypalOrder);
  const captureFn = useServerFn(capturePaypalOrder);

  const itemsPayload = () =>
    cart.items.map((i) => ({ productId: i.product.id, qty: i.qty }));

  async function createOrder(): Promise<string> {
    const res = await createOrderFn({ data: { items: itemsPayload() } });
    return res.orderId;
  }

  async function capture(orderId: string): Promise<void> {
    await captureFn({ data: { orderId } });
  }

  function onSuccess(orderId: string) {
    cart.clear();
    navigate({ to: "/checkout/success", search: { order: orderId } });
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

      {cart.items.length === 0 ? null : (
        <PayPalV6Checkout
          createOrder={createOrder}
          capture={capture}
          onSuccess={onSuccess}
          amount={{
            value: (cart.subtotalCents / 100).toFixed(2),
            currency: cart.currency,
          }}
          payLabel={`Pay ${totalLabel}`}
          variant="page"
        />
      )}
    </div>
  );
}
