SELECT cron.unschedule('capture-citations-15min');
SELECT cron.schedule(
  'capture-citations-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://project--fe0719fd-8a73-47fd-82c4-676843f17c94.lovable.app/api/public/hooks/capture-citations',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5dnhzcmtpa2lweXJtZ2N1aXBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNjMyODEsImV4cCI6MjA5NDczOTI4MX0.SqfqOnP1o9AuDlJAIRIwsV9qcoD-419E7TvvH4I-rb0'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  ) AS request_id;
  $$
);