CREATE TABLE public.scheduled_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host TEXT NOT NULL,
  url TEXT NOT NULL,
  cadence TEXT NOT NULL CHECK (cadence IN ('daily','weekly','monthly')),
  next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_run_at TIMESTAMPTZ,
  last_scan_id UUID,
  active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_scheduled_scans_due ON public.scheduled_scans (next_run_at) WHERE active = true;
CREATE INDEX idx_scheduled_scans_host ON public.scheduled_scans (host);

ALTER TABLE public.scheduled_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view scheduled scans"
  ON public.scheduled_scans FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can create scheduled scans"
  ON public.scheduled_scans FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can update scheduled scans"
  ON public.scheduled_scans FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Service role manages scheduled scans"
  ON public.scheduled_scans FOR ALL TO public USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_scheduled_scans_updated_at
  BEFORE UPDATE ON public.scheduled_scans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();