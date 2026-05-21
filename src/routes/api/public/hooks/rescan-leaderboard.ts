// Weekly cron — rescans every leaderboard domain so the public scoreboard
// stays fresh. Public route (no auth header required) — but kept defensive
// with a small batch size and timeout per site.
import { createFileRoute } from "@tanstack/react-router";
import { LEADERBOARD } from "@/lib/leaderboard/entries";
import { scanUrl } from "@/lib/check/scan.functions";

export const Route = createFileRoute("/api/public/hooks/rescan-leaderboard")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Shared-secret check — caller (pg_cron) must send X-Cron-Secret.
        const expected = process.env.CRON_SECRET;
        if (!expected) {
          console.error("[rescan-leaderboard] CRON_SECRET not configured");
          return new Response("Server misconfigured", { status: 500 });
        }
        const provided = request.headers.get("x-cron-secret");
        if (!provided || provided !== expected) {
          return new Response("Forbidden", { status: 403 });
        }

        const results: Array<{ domain: string; ok: boolean; score?: number; error?: string }> = [];



        // Cap to avoid worker timeouts. Cron can call again next week.
        const targets = LEADERBOARD.slice(0, 30);

        for (const entry of targets) {
          try {
            const r = await scanUrl({
              data: { url: `https://${entry.domain}`, source: "rescan" },
            });
            if (r.ok) {
              results.push({ domain: entry.domain, ok: true, score: r.overall });
            } else {
              results.push({ domain: entry.domain, ok: false, error: r.error });
            }
          } catch (err) {
            results.push({
              domain: entry.domain,
              ok: false,
              error: err instanceof Error ? err.message : "unknown",
            });
          }
        }

        return new Response(
          JSON.stringify({
            ok: true,
            ran: results.length,
            succeeded: results.filter((r) => r.ok).length,
            results,
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        );
      },
    },
  },
});
