CREATE POLICY "Anon can submit report requests"
ON public.report_requests
FOR INSERT
TO anon
WITH CHECK (
  source = 'check'
  AND length(email) BETWEEN 3 AND 255
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(url) BETWEEN 1 AND 2048
  AND (score IS NULL OR (score >= 0 AND score <= 100))
);

GRANT INSERT ON public.report_requests TO anon;