-- 24h per-domain citation rollup
CREATE OR REPLACE VIEW public.citation_events_24h_by_domain AS
SELECT
  domain_queried AS domain,
  COUNT(*)::int AS total_events,
  SUM(CASE WHEN domain_was_cited THEN 1 ELSE 0 END)::int AS cited_events,
  ROUND(
    100.0 * SUM(CASE WHEN domain_was_cited THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
    2
  ) AS cited_pct,
  COUNT(DISTINCT engine)::int AS engines_seen,
  AVG(latency_ms)::int AS avg_latency_ms,
  MIN(queried_at) AS first_event,
  MAX(queried_at) AS last_event
FROM public.citation_events
WHERE queried_at > now() - interval '24 hours'
GROUP BY domain_queried;

-- 24h per-engine totals
CREATE OR REPLACE VIEW public.citation_events_24h_by_engine AS
SELECT
  engine,
  COUNT(*)::int AS total_events,
  COUNT(DISTINCT domain_queried)::int AS unique_domains,
  SUM(CASE WHEN domain_was_cited THEN 1 ELSE 0 END)::int AS cited_events,
  ROUND(
    100.0 * SUM(CASE WHEN domain_was_cited THEN 1 ELSE 0 END) / NULLIF(COUNT(*), 0),
    2
  ) AS cited_pct,
  AVG(latency_ms)::int AS avg_latency_ms
FROM public.citation_events
WHERE queried_at > now() - interval '24 hours'
GROUP BY engine;

-- 14-day daily trend per engine
CREATE OR REPLACE VIEW public.citation_events_daily_14d AS
SELECT
  date_trunc('day', queried_at)::date AS day,
  engine,
  COUNT(*)::int AS total_events,
  SUM(CASE WHEN domain_was_cited THEN 1 ELSE 0 END)::int AS cited_events
FROM public.citation_events
WHERE queried_at > now() - interval '14 days'
GROUP BY date_trunc('day', queried_at)::date, engine
ORDER BY day DESC, engine;

GRANT SELECT ON public.citation_events_24h_by_domain TO anon, authenticated, service_role;
GRANT SELECT ON public.citation_events_24h_by_engine TO anon, authenticated, service_role;
GRANT SELECT ON public.citation_events_daily_14d TO anon, authenticated, service_role;