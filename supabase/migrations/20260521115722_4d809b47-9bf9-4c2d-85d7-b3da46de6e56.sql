
CREATE TABLE public.payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  amount decimal,
  tier text,
  customer_email text,
  customer_name text,
  status text NOT NULL DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES public.payments(id) ON DELETE SET NULL,
  client_name text,
  client_email text,
  tier text,
  budget decimal,
  status text NOT NULL DEFAULT 'deposit_paid',
  start_date timestamptz,
  target_delivery timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_payments_lead_id ON public.payments(lead_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_projects_lead_id ON public.projects(lead_id);
CREATE INDEX idx_projects_payment_id ON public.projects(payment_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages payments"
  ON public.payments FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role manages projects"
  ON public.projects FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
