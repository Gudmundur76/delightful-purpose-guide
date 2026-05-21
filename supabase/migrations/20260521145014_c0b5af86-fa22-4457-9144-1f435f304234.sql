CREATE TABLE public.report_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  url TEXT NOT NULL,
  score INTEGER,
  source TEXT NOT NULL DEFAULT 'check',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.report_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can request a report"
  ON public.report_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE INDEX report_requests_email_idx ON public.report_requests (email);
CREATE INDEX report_requests_created_at_idx ON public.report_requests (created_at DESC);