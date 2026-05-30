
ALTER TABLE public.intervention_sites
  ADD COLUMN IF NOT EXISTS citation_gap numeric,
  ADD COLUMN IF NOT EXISTS report_unlocked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS report_unlocked_at timestamptz,
  ADD COLUMN IF NOT EXISTS report_email text;
