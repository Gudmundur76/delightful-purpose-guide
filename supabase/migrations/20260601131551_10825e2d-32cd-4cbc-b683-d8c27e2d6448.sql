
ALTER TABLE public.intervention_sites
  ADD COLUMN IF NOT EXISTS mcp_endpoint text,
  ADD COLUMN IF NOT EXISTS mcp_registered_at timestamptz,
  ADD COLUMN IF NOT EXISTS mcp_tools_count integer,
  ADD COLUMN IF NOT EXISTS mcp_last_seen_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_intervention_sites_mcp_registered_at
  ON public.intervention_sites (mcp_registered_at DESC)
  WHERE mcp_endpoint IS NOT NULL;
