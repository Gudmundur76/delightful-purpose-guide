
CREATE TABLE public.scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  host text NOT NULL,
  overall smallint NOT NULL CHECK (overall >= 0 AND overall <= 100),
  semantic smallint NOT NULL CHECK (semantic >= 0 AND semantic <= 100),
  jsonld smallint NOT NULL CHECK (jsonld >= 0 AND jsonld <= 100),
  llms smallint NOT NULL CHECK (llms >= 0 AND llms <= 100),
  citability smallint NOT NULL CHECK (citability >= 0 AND citability <= 100),
  speed smallint NOT NULL CHECK (speed >= 0 AND speed <= 100),
  source text NOT NULL DEFAULT 'check',
  scanned_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX scans_host_scanned_at_idx ON public.scans (host, scanned_at DESC);
CREATE INDEX scans_scanned_at_idx ON public.scans (scanned_at DESC);

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Scans are publicly readable"
  ON public.scans FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Service role can insert scans"
  ON public.scans FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');
