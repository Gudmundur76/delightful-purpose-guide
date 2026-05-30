DROP POLICY IF EXISTS "Team members can view scans" ON public.scans;
CREATE POLICY "Owners view own scans" ON public.scans FOR SELECT TO authenticated USING (created_by = auth.uid());

DROP POLICY IF EXISTS "Team members can view scheduled scans" ON public.scheduled_scans;
CREATE POLICY "Owners view own scheduled scans" ON public.scheduled_scans FOR SELECT TO authenticated USING (created_by = auth.uid());