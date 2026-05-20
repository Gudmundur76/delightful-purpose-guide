
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'USD',
  image_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active products are publicly readable"
  ON public.products FOR SELECT
  USING (active = true);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paypal_order_id text UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  currency text NOT NULL,
  subtotal_cents integer NOT NULL,
  total_cents integer NOT NULL,
  items jsonb NOT NULL,
  customer_email text,
  capture_payload jsonb,
  captured_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- No public policies — service role only.

-- Seed a few demo products
INSERT INTO public.products (slug, name, description, price_cents, currency, image_url) VALUES
  ('starter-audit', 'Starter SEO Audit', 'A focused single-page SEO audit with actionable recommendations.', 9900, 'USD', null),
  ('growth-sprint', 'Growth Sprint (2 weeks)', 'Two-week sprint: content, on-page SEO, and conversion improvements.', 149900, 'USD', null),
  ('strategy-call', 'Strategy Call (60 min)', 'One-hour strategy call with a written follow-up plan.', 24900, 'USD', null);
