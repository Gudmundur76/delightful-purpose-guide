SELECT cron.unschedule('run-monitored-sites') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'run-monitored-sites');

SELECT cron.schedule(
  'run-monitored-sites',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--fe0719fd-8a73-47fd-82c4-676843f17c94.lovable.app/api/public/hooks/run-monitored-sites',
    headers := '{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dnhzcmtpa2lweXJtZ2N1aXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjMyODEsImV4cCI6MjA5NDczOTI4MX0.SqfqOnP1o9AuDlJAIRIwsV9qcoD-419E7TvvH4I-rb0"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);