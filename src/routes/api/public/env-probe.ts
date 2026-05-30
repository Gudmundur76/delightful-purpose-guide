import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/env-probe")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          has_CRON_SECRET: !!process.env.CRON_SECRET,
          has_SUPABASE_PUBLISHABLE_KEY: !!process.env.SUPABASE_PUBLISHABLE_KEY,
          has_SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
          has_SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          has_LOVABLE_API_KEY: !!process.env.LOVABLE_API_KEY,
          pk_len: process.env.SUPABASE_PUBLISHABLE_KEY?.length ?? 0,
          pk_tail: process.env.SUPABASE_PUBLISHABLE_KEY?.slice(-6) ?? null,
          cs_len: process.env.CRON_SECRET?.length ?? 0,
          cs_tail: process.env.CRON_SECRET?.slice(-6) ?? null,
        });
      },
    },
  },
});
