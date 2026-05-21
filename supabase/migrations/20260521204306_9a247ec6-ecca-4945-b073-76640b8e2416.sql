CREATE POLICY "Service role can read report requests"
ON public.report_requests
FOR SELECT
TO public
USING (auth.role() = 'service_role');