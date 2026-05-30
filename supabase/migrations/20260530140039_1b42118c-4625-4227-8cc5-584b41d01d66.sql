DROP VIEW IF EXISTS public.citation_disagreements_24h;

CREATE VIEW public.citation_disagreements_24h
WITH (security_invoker=on) AS
WITH per_engine AS (
  SELECT
    ce.domain_queried,
    ce.engine,
    BOOL_OR(ce.domain_was_cited) AS cited_target,
    ARRAY_AGG(DISTINCT cd) FILTER (WHERE cd IS NOT NULL) AS cited_domains
  FROM public.citation_events ce
  LEFT JOIN LATERAL UNNEST(ce.cited_domains) AS cd ON TRUE
  WHERE ce.queried_at > now() - interval '24 hours'
    AND ce.error IS NULL
  GROUP BY ce.domain_queried, ce.engine
),
pairs AS (
  SELECT
    a.domain_queried,
    a.engine AS engine_a,
    b.engine AS engine_b,
    a.cited_target AS a_cites_target,
    b.cited_target AS b_cites_target,
    a.cited_domains AS a_domains,
    b.cited_domains AS b_domains,
    CASE
      WHEN a.cited_domains IS NULL OR b.cited_domains IS NULL THEN 0::float
      WHEN cardinality(a.cited_domains) = 0 AND cardinality(b.cited_domains) = 0 THEN 1.0::float
      ELSE (
        cardinality(
          ARRAY(SELECT UNNEST(a.cited_domains) INTERSECT SELECT UNNEST(b.cited_domains))
        )::float /
        GREATEST(1, cardinality(
          ARRAY(SELECT UNNEST(a.cited_domains) UNION SELECT UNNEST(b.cited_domains))
        ))::float
      )
    END AS domain_overlap
  FROM per_engine a
  JOIN per_engine b
    ON a.domain_queried = b.domain_queried
   AND a.engine < b.engine
)
SELECT
  domain_queried,
  engine_a,
  engine_b,
  a_cites_target,
  b_cites_target,
  ROUND(((1.0 - domain_overlap) * 100)::numeric, 1) AS disagreement_pct,
  a_domains AS domains_a,
  b_domains AS domains_b,
  CASE
    WHEN a_cites_target IS DISTINCT FROM b_cites_target THEN 'high'
    WHEN domain_overlap < 0.3 THEN 'medium'
    ELSE 'low'
  END AS severity,
  now() AS calculated_at
FROM pairs
WHERE domain_overlap < 0.5 OR (a_cites_target IS DISTINCT FROM b_cites_target)
ORDER BY
  CASE WHEN a_cites_target IS DISTINCT FROM b_cites_target THEN 0 ELSE 1 END,
  (1.0 - domain_overlap) DESC;

GRANT SELECT ON public.citation_disagreements_24h TO anon, authenticated, service_role;