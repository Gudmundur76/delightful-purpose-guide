-- ============================================================
-- Auto-Fix Intervention Layer
-- ============================================================

-- Enum types
DO $$ BEGIN
  CREATE TYPE public.intervention_kind AS ENUM ('schema', 'llms_txt', 'robots_txt');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.intervention_status AS ENUM ('drafted', 'approved', 'live', 'rejected', 'superseded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.intervention_trigger AS ENUM ('auto_ccs_drop', 'manual', 'scheduled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.intervention_delivery_method AS ENUM ('snippet', 'wp_plugin', 'llms_txt_proxy');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- intervention_sites
-- ============================================================
CREATE TABLE IF NOT EXISTS public.intervention_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  domain TEXT NOT NULL,
  install_token UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  wp_api_key TEXT,
  auto_fire_enabled BOOLEAN NOT NULL DEFAULT true,
  notify_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_user_id, domain)
);

CREATE INDEX IF NOT EXISTS idx_intervention_sites_owner ON public.intervention_sites(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_intervention_sites_domain ON public.intervention_sites(domain);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.intervention_sites TO authenticated;
GRANT ALL ON public.intervention_sites TO service_role;

ALTER TABLE public.intervention_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own sites" ON public.intervention_sites
  FOR SELECT TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Owners insert own sites" ON public.intervention_sites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners update own sites" ON public.intervention_sites
  FOR UPDATE TO authenticated USING (auth.uid() = owner_user_id) WITH CHECK (auth.uid() = owner_user_id);
CREATE POLICY "Owners delete own sites" ON public.intervention_sites
  FOR DELETE TO authenticated USING (auth.uid() = owner_user_id);
CREATE POLICY "Service role manages sites" ON public.intervention_sites
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_intervention_sites_updated
  BEFORE UPDATE ON public.intervention_sites
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- interventions
-- ============================================================
CREATE TABLE IF NOT EXISTS public.interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.intervention_sites(id) ON DELETE CASCADE,
  kind public.intervention_kind NOT NULL,
  status public.intervention_status NOT NULL DEFAULT 'drafted',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  preview_text TEXT,
  triggered_by public.intervention_trigger NOT NULL DEFAULT 'manual',
  ccs_before SMALLINT,
  ccs_after SMALLINT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  went_live_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_interventions_site ON public.interventions(site_id);
CREATE INDEX IF NOT EXISTS idx_interventions_status ON public.interventions(status);
CREATE INDEX IF NOT EXISTS idx_interventions_kind_status ON public.interventions(kind, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.interventions TO authenticated;
GRANT ALL ON public.interventions TO service_role;

ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own interventions" ON public.interventions
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.intervention_sites s WHERE s.id = site_id AND s.owner_user_id = auth.uid())
  );
CREATE POLICY "Owners insert own interventions" ON public.interventions
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM public.intervention_sites s WHERE s.id = site_id AND s.owner_user_id = auth.uid())
  );
CREATE POLICY "Owners update own interventions" ON public.interventions
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.intervention_sites s WHERE s.id = site_id AND s.owner_user_id = auth.uid())
  );
CREATE POLICY "Owners delete own interventions" ON public.interventions
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM public.intervention_sites s WHERE s.id = site_id AND s.owner_user_id = auth.uid())
  );
CREATE POLICY "Service role manages interventions" ON public.interventions
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_interventions_updated
  BEFORE UPDATE ON public.interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- intervention_deliveries
-- ============================================================
CREATE TABLE IF NOT EXISTS public.intervention_deliveries (
  id BIGSERIAL PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES public.intervention_sites(id) ON DELETE CASCADE,
  intervention_id UUID REFERENCES public.interventions(id) ON DELETE SET NULL,
  delivery_method public.intervention_delivery_method NOT NULL,
  user_agent TEXT,
  ip TEXT,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_deliveries_site ON public.intervention_deliveries(site_id, delivered_at DESC);

GRANT SELECT ON public.intervention_deliveries TO authenticated;
GRANT ALL ON public.intervention_deliveries TO service_role;

ALTER TABLE public.intervention_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own deliveries" ON public.intervention_deliveries
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.intervention_sites s WHERE s.id = site_id AND s.owner_user_id = auth.uid())
  );
CREATE POLICY "Service role manages deliveries" ON public.intervention_deliveries
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- intervention_audit
-- ============================================================
CREATE TABLE IF NOT EXISTS public.intervention_audit (
  id BIGSERIAL PRIMARY KEY,
  intervention_id UUID NOT NULL REFERENCES public.interventions(id) ON DELETE CASCADE,
  from_status public.intervention_status,
  to_status public.intervention_status NOT NULL,
  actor_user_id UUID,
  actor_label TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_intervention ON public.intervention_audit(intervention_id, created_at DESC);

GRANT SELECT ON public.intervention_audit TO authenticated;
GRANT ALL ON public.intervention_audit TO service_role;

ALTER TABLE public.intervention_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners view own audit" ON public.intervention_audit
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.interventions i
      JOIN public.intervention_sites s ON s.id = i.site_id
      WHERE i.id = intervention_id AND s.owner_user_id = auth.uid()
    )
  );
CREATE POLICY "Service role manages audit" ON public.intervention_audit
  FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- Audit trigger: log status changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_intervention_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.intervention_audit (intervention_id, from_status, to_status, actor_label)
    VALUES (NEW.id, NULL, NEW.status, 'system');
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.intervention_audit (intervention_id, from_status, to_status, actor_user_id, notes)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.approved_by, NEW.rejection_reason);
    RETURN NEW;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_interventions_audit
  AFTER INSERT OR UPDATE OF status ON public.interventions
  FOR EACH ROW EXECUTE FUNCTION public.log_intervention_status_change();
