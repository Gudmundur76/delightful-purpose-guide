ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS qualification_score integer,
  ADD COLUMN IF NOT EXISTS qualification_tier text CHECK (qualification_tier IN ('cold','warm','hot')),
  ADD COLUMN IF NOT EXISTS qualification_reasoning text,
  ADD COLUMN IF NOT EXISTS qualification_suggested_tier text CHECK (qualification_suggested_tier IN ('starter','growth','enterprise')),
  ADD COLUMN IF NOT EXISTS auto_replied_at timestamptz,
  ADD COLUMN IF NOT EXISTS auto_reply_subject text,
  ADD COLUMN IF NOT EXISTS auto_reply_body text;

CREATE INDEX IF NOT EXISTS idx_leads_qualification_tier ON public.leads(qualification_tier);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- Service role needs read/update for the scoring backend
DROP POLICY IF EXISTS "Service role can read leads" ON public.leads;
CREATE POLICY "Service role can read leads"
  ON public.leads FOR SELECT
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can update leads" ON public.leads;
CREATE POLICY "Service role can update leads"
  ON public.leads FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');