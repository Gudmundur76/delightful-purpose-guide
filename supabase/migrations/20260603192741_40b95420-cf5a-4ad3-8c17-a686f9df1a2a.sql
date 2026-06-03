
-- Verdict enum (Truth Desk 7-verdict set)
CREATE TYPE public.claim_verdict AS ENUM (
  'supported',
  'partially_supported',
  'contradicted',
  'ambiguous',
  'insufficient_evidence',
  'out_of_scope',
  'needs_expert_review',
  'unverified'
);

-- Extracted claims per site
CREATE TABLE public.site_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host TEXT NOT NULL,
  source_url TEXT NOT NULL,
  entity TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  verdict public.claim_verdict NOT NULL DEFAULT 'unverified',
  verdict_rationale TEXT,
  evidence_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_site_claims_host ON public.site_claims(host);
CREATE INDEX idx_site_claims_host_entity ON public.site_claims(host, entity);
CREATE INDEX idx_site_claims_verdict ON public.site_claims(verdict);

GRANT SELECT ON public.site_claims TO anon, authenticated;
GRANT ALL ON public.site_claims TO service_role;

ALTER TABLE public.site_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read site_claims" ON public.site_claims FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages site_claims" ON public.site_claims FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER trg_site_claims_updated_at
  BEFORE UPDATE ON public.site_claims
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Contradictions between pairs of claims
CREATE TABLE public.site_claim_contradictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host TEXT NOT NULL,
  entity TEXT NOT NULL,
  claim_a_id UUID NOT NULL REFERENCES public.site_claims(id) ON DELETE CASCADE,
  claim_b_id UUID NOT NULL REFERENCES public.site_claims(id) ON DELETE CASCADE,
  severity TEXT NOT NULL DEFAULT 'medium',
  rationale TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (claim_a_id, claim_b_id)
);

CREATE INDEX idx_contradictions_host ON public.site_claim_contradictions(host);
CREATE INDEX idx_contradictions_unresolved ON public.site_claim_contradictions(host) WHERE resolved_at IS NULL;

GRANT SELECT ON public.site_claim_contradictions TO anon, authenticated;
GRANT ALL ON public.site_claim_contradictions TO service_role;

ALTER TABLE public.site_claim_contradictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read contradictions" ON public.site_claim_contradictions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Service role manages contradictions" ON public.site_claim_contradictions FOR ALL TO service_role USING (true) WITH CHECK (true);
