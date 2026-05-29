
-- 1. Plans catalog
CREATE TABLE public.subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  monthly_scan_quota INTEGER NOT NULL,
  max_sites INTEGER NOT NULL,
  scan_interval TEXT NOT NULL,
  paypal_plan_id TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON public.subscription_plans TO service_role;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are public" ON public.subscription_plans FOR SELECT USING (true);

INSERT INTO public.subscription_plans (id, name, price_cents, monthly_scan_quota, max_sites, scan_interval, features) VALUES
  ('free', 'Free', 0, 20, 1, 'weekly', '["1 monitored site","20 scans/month","Weekly scans","Email alert on score drop ≥5","90-day history"]'::jsonb),
  ('pro', 'Pro', 2900, 500, 10, 'daily', '["10 monitored sites","500 scans/month","Daily scans","Email + Slack/webhook alerts","Unbounded history","Public API access"]'::jsonb),
  ('team', 'Team', 9900, 2500, 50, 'hourly', '["50 monitored sites","2,500 scans/month","Hourly scans","Discord/PagerDuty alerts","5 seats","White-label PDF reports","Priority API rate limits"]'::jsonb);

-- 2. Subscriptions
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active',
  paypal_subscription_id TEXT UNIQUE,
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own subscription" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Monitored sites
CREATE TABLE public.monitored_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  last_score INTEGER,
  last_scanned_at TIMESTAMPTZ,
  alert_threshold INTEGER NOT NULL DEFAULT 5,
  alert_webhook_url TEXT,
  alert_email TEXT,
  paused BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, url)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitored_sites TO authenticated;
GRANT ALL ON public.monitored_sites TO service_role;
ALTER TABLE public.monitored_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own sites" ON public.monitored_sites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_monitored_sites_user ON public.monitored_sites(user_id);
CREATE INDEX idx_monitored_sites_scan_due ON public.monitored_sites(last_scanned_at) WHERE paused = false;
CREATE TRIGGER monitored_sites_updated_at BEFORE UPDATE ON public.monitored_sites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Quota usage (one row per user per month)
CREATE TABLE public.scan_quota_usage (
  user_id UUID NOT NULL,
  period_month DATE NOT NULL,
  scans_used INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, period_month)
);
GRANT SELECT ON public.scan_quota_usage TO authenticated;
GRANT ALL ON public.scan_quota_usage TO service_role;
ALTER TABLE public.scan_quota_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own quota" ON public.scan_quota_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. API keys
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  last_used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users CRUD own keys" ON public.api_keys FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);

-- 6. API request log (for rate limiting)
CREATE TABLE public.api_request_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  api_key_id UUID,
  endpoint TEXT NOT NULL,
  status INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_request_log TO authenticated;
GRANT ALL ON public.api_request_log TO service_role;
ALTER TABLE public.api_request_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own requests" ON public.api_request_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_api_request_log_user_time ON public.api_request_log(user_id, created_at DESC);
