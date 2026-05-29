DROP POLICY IF EXISTS "Team members can view report requests" ON public.report_requests;

CREATE POLICY "Admins can view report requests"
ON public.report_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));