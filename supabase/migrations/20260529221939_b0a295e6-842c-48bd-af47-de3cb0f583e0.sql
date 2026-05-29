-- Citation events: raw event stream for AI engine citation tracking
CREATE TABLE public.citation_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  domain_queried text NOT NULL,
  engine text NOT NULL,
  model_version text NOT NULL,
  prompt_template_id text NOT NULL,
  prompt_text text NOT NULL,
  response_text text,
  response_hash text,
  cited_domains text[] DEFAULT '{}'::text[],
  cited_urls text[] DEFAULT '{}'::text[],
  domain_was_cited boolean NOT NULL DEFAULT false,
  cited_position smallint,
  latency_ms integer,
  tokens_in integer,
  tokens_out integer,
  error text,
  queried_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.citation_events TO anon;
GRANT SELECT ON public.citation_events TO authenticated;
GRANT ALL ON public.citation_events TO service_role;

ALTER TABLE public.citation_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Citation events are public"
ON public.citation_events FOR SELECT
USING (true);

CREATE POLICY "Service role writes citation events"
ON public.citation_events FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

CREATE INDEX idx_citation_events_domain_time ON public.citation_events (domain_queried, queried_at DESC);
CREATE INDEX idx_citation_events_engine_time ON public.citation_events (engine, queried_at DESC);
CREATE INDEX idx_citation_events_cited ON public.citation_events (domain_queried, queried_at DESC) WHERE domain_was_cited = true;

-- Cursor to round-robin through domains across cron invocations
CREATE TABLE public.citation_capture_cursor (
  id smallint PRIMARY KEY DEFAULT 1,
  last_domain text,
  last_run_at timestamptz,
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO public.citation_capture_cursor (id) VALUES (1) ON CONFLICT DO NOTHING;

GRANT SELECT ON public.citation_capture_cursor TO authenticated;
GRANT ALL ON public.citation_capture_cursor TO service_role;
ALTER TABLE public.citation_capture_cursor ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cursor readable" ON public.citation_capture_cursor FOR SELECT USING (true);
CREATE POLICY "Service role manages cursor" ON public.citation_capture_cursor FOR ALL
USING (auth.role() = 'service_role'::text) WITH CHECK (auth.role() = 'service_role'::text);