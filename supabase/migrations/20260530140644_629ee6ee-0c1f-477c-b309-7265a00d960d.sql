
-- API key access requests (lead-gen for /for-analysts page)
CREATE TABLE public.api_key_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  company text,
  plan text NOT NULL CHECK (plan IN ('starter','pro','enterprise')),
  use_case text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  approved_at timestamptz,
  approved_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_key_requests TO authenticated;
GRANT ALL ON public.api_key_requests TO service_role;

ALTER TABLE public.api_key_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages api key requests"
ON public.api_key_requests FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Admins view api key requests"
ON public.api_key_requests FOR SELECT TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_api_key_requests_status ON public.api_key_requests(status, created_at DESC);


-- Platform crawl tracking (Silobreaker, Visvo, etc. crawling grow.contact)
CREATE TABLE public.platform_crawls (
  id bigserial PRIMARY KEY,
  referrer_domain text NOT NULL,
  crawled_path text NOT NULL,
  user_agent text,
  ip_hash text,
  crawled_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_crawls TO anon, authenticated;
GRANT ALL ON public.platform_crawls TO service_role;

ALTER TABLE public.platform_crawls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform crawls are public"
ON public.platform_crawls FOR SELECT
USING (true);

CREATE POLICY "Service role manages platform crawls"
ON public.platform_crawls FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE INDEX idx_platform_crawls_referrer ON public.platform_crawls(referrer_domain, crawled_at DESC);
CREATE INDEX idx_platform_crawls_path ON public.platform_crawls(crawled_path);

-- 24h aggregate view for dashboard
CREATE VIEW public.platform_crawls_24h
WITH (security_invoker=on)
AS
SELECT
  referrer_domain,
  COUNT(*) AS crawls_24h,
  COUNT(DISTINCT crawled_path) AS unique_paths,
  MAX(crawled_at) AS last_seen,
  (
    SELECT crawled_path
    FROM public.platform_crawls pc2
    WHERE pc2.referrer_domain = pc1.referrer_domain
      AND pc2.crawled_at > now() - interval '24 hours'
    GROUP BY crawled_path
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ) AS top_path
FROM public.platform_crawls pc1
WHERE crawled_at > now() - interval '24 hours'
GROUP BY referrer_domain
ORDER BY crawls_24h DESC;
