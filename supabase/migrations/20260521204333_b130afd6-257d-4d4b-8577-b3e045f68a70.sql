DO $$
DECLARE
  v_jobid bigint;
  v_secret text;
BEGIN
  -- Pull the cron secret from Vault if present; otherwise generate + store one.
  SELECT decrypted_secret INTO v_secret
  FROM vault.decrypted_secrets
  WHERE name = 'cron_rescan_secret';

  IF v_secret IS NULL THEN
    v_secret := encode(gen_random_bytes(32), 'hex');
    PERFORM vault.create_secret(v_secret, 'cron_rescan_secret', 'Shared secret for /api/public/hooks/rescan-leaderboard');
  END IF;

  -- Remove the old (unauthenticated) job if present.
  SELECT jobid INTO v_jobid FROM cron.job WHERE jobname = 'rescan-leaderboard-weekly';
  IF v_jobid IS NOT NULL THEN
    PERFORM cron.unschedule(v_jobid);
  END IF;

  -- Reschedule with X-Cron-Secret header.
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