-- Remove public-facing access to the base table so paypal_subscription_id
-- can never be enumerated by anon/authenticated visitors.
DROP POLICY IF EXISTS "Active certifications are public" ON public.certifications;

-- Owner-only access to the base table (full row, including paypal_subscription_id).
CREATE POLICY "Owners view own certifications"
ON public.certifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public-safe view that excludes the sensitive paypal_subscription_id column.
CREATE OR REPLACE VIEW public.certifications_public
WITH (security_invoker = on) AS
SELECT
  id,
  user_id,
  domain,
  status,
  badge_url,
  issued_at,
  expires_at,
  created_at,
  updated_at
FROM public.certifications
WHERE status = 'active';

-- Allow anon/authenticated to read the safe view; base table stays locked down.
GRANT SELECT ON public.certifications_public TO anon, authenticated;