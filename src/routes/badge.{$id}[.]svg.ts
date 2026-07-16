import { createFileRoute } from "@tanstack/react-router";
import { fetchLatestScoreByHost, normalizeHost } from "@/lib/check/verify.server";

function svg(score: number | null, domain: string) {
  const display = score ?? 0;
  const color = score == null ? "#71717a" : score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const label = score == null ? "UNSCORED" : "CERTIFIED";
  const dash = ((score ?? 0) / 100) * 150.8;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 72" width="240" height="72">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
  </defs>
  <rect width="240" height="72" rx="8" fill="url(#bg)" stroke="#27272a"/>
  <g transform="translate(36,36)">
    <circle r="24" fill="none" stroke="#27272a" stroke-width="4"/>
    <circle r="24" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${dash} 150.8" transform="rotate(-90)"/>
    <text text-anchor="middle" dy="6" fill="#fafafa" font-size="18" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">${score ?? "—"}</text>
  </g>
  <g transform="translate(74,26)">
    <text fill="${color}" font-size="9" font-weight="600" letter-spacing="1.5" font-family="ui-monospace,monospace">${label}</text>
    <text y="14" fill="#fafafa" font-size="13" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">Agent-Native</text>
    <text y="30" fill="#71717a" font-size="9" font-family="ui-monospace,monospace">citation.is · ${domain}</text>
  </g>
</svg>`;
}

export const Route = createFileRoute("/badge/{$id}.svg")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const host = normalizeHost(params.id);
        const score = await fetchLatestScoreByHost(host);
        return new Response(svg(score, host || params.id), {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, s-maxage=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
