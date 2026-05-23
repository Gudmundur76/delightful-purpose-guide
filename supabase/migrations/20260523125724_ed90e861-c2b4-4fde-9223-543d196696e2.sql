-- Fix leads table: restrict to authenticated only
DROP POLICY IF EXISTS "Anyone can submit a lead" ON public.leads;
CREATE POLICY "Team members can view leads"
ON public.leads FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members can insert leads"
ON public.leads FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);

-- Fix report_requests table: restrict to authenticated only
DROP POLICY IF EXISTS "Anyone can request a report" ON public.report_requests;
CREATE POLICY "Team members can view report requests"
ON public.report_requests FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team members can insert report requests"
ON public.report_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
