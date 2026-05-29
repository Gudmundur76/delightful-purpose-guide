
-- Platform extensions for intervention_sites
ALTER TABLE public.intervention_sites
  ALTER COLUMN owner_user_id DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic','pro','enterprise')),
  ADD COLUMN IF NOT EXISTS ccs_score smallint,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  ADD COLUMN IF NOT EXISTS last_auto_fix_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_intervention_sites_status ON public.intervention_sites(status);
CREATE INDEX IF NOT EXISTS idx_intervention_sites_domain ON public.intervention_sites(domain);

-- Admins can see and manage every hosted site
CREATE POLICY "Admins view all sites"
  ON public.intervention_sites
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert sites"
  ON public.intervention_sites
  FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update sites"
  ON public.intervention_sites
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete sites"
  ON public.intervention_sites
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins view all interventions"
  ON public.interventions
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update interventions"
  ON public.interventions
  FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
