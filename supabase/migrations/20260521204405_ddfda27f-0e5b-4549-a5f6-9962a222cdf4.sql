DO $$
DECLARE
  v_jobid bigint;
  v_secret text := '58c18326712813a0f028650eaea4a2cf0edaba98d23f4dd95b91409833f893fb';
BEGIN
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'rescan-leaderboard-weekly';
  IF v_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_jobid);
  END IF;

  PERFORM cron.schedule(
    'rescan-leaderboard-weekly',
    '0 6 * * 1',
    format($cmd$
      SELECT net.http_post(
        url := 'https://delightful-purpose-guide.lovable.app/api/public/hooks/rescan-leaderboard',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Cron-Secret', %L
        ),
        body := '{}'::jsonb
      );
    $cmd$, v_secret)
  );
END;
$$;