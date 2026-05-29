CREATE OR REPLACE VIEW public.citation_counts_24h AS
SELECT
  domain_queried AS domain,
  engine,
  COUNT(*)::int AS events,
  COUNT(*) FILTER (WHERE domain_was_cited)::int AS cited_events,
  COUNT(*) FILTER (WHERE error IS NOT NULL)::int AS failed_events,
  AVG(latency_ms)::int AS avg_latency_ms,
  MAX(queried_at) AS last_queried_at
FROM public.citation_events
WHERE queried_at > now() - interval '24 hours'
GROUP BY domain_queried, engine;

CREATE OR REPLACE VIEW public.response_changes_24h AS
SELECT
  domain_queried AS domain,
  engine,
  prompt_template_id,
  COUNT(*)::int AS events,
  COUNT(DISTINCT response_hash)::int AS distinct_responses,
  MIN(queried_at) AS first_queried_at,
  MAX(queried_at) AS last_queried_at
FROM public.citation_events
WHERE queried_at > now() - interval '24 hours'
  AND response_hash IS NOT NULL
GROUP BY domain_queried, engine, prompt_template_id;

GRANT SELECT ON public.citation_counts_24h TO anon, authenticated, service_role;
GRANT SELECT ON public.response_changes_24h TO anon, authenticated, service_role;