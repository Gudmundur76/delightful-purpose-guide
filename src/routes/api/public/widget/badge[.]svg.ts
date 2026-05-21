// Live embeddable Agent Readability badge.
// Usage: <img src="https://grow.contact/api/public/widget/badge.svg?url=acme.ai">
//
// Looks up the most recent scan for the host. If none exists, runs a fresh
// scan inline (so first-paint never returns a blank). Cached for 1h.
import { createFileRoute } from "@tanstack/react-router";
import { fetchLatestScanForHost } from "@/lib/check/scans.server";
import { scanUrl } from "@/lib/check/scan.functions";

function normalizeHost(input: string): string | null {
  try {
    const withProto = /^https?:\/\//i.test(input) ? input : `https://${input}`;
    return new URL(withProto).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
}

function badgeSvg(score: number, host: string): string {
  const safeHost = escapeXml(host.slice(0, 32));
  const dash = (score / 100) * 150.8;
  const color = score >= 85 ? "#10b981" : score >= 70 ? "#eab308" : "#ef4444";
  const tag = score >= 85 ? "CERTIFIED" : score >= 70 ? "VERIFIED" : "AUDITED";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 72" width="240" height="72" role="img" aria-label="Agent Readability ${score} of 100">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
  </defs>
  <a href="https://grow.contact/check?u=${encodeURIComponent(host)}" target="_blank">
    <rect width="240" height="72" rx="8" fill="url(#bg)" stroke="#27272a"/>
    <g transform="translate(36,36)">
      <circle r="24" fill="none" stroke="#27272a" stroke-width="4"/>
      <circle r="24" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-dasharray="${dash} 150.8" transform="rotate(-90)"/>
      <text text-anchor="middle" dy="6" fill="#fafafa" font-size="18" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">${score}</text>
    </g>
    <g transform="translate(74,26)">
      <text fill="${color}" font-size="9" font-weight="600" letter-spacing="1.5" font-family="ui-monospace,monospace">${tag}</text>
      <text y="14" fill="#fafafa" font-size="13" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">Agent-Native</text>
      <text y="30" fill="#71717a" font-size="9" font-family="ui-monospace,monospace">grow.contact · ${safeHost}</text>
    </g>
  </a>
</svg>`;
}

function errorSvg(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 72" width="240" height="72">
  <rect width="240" height="72" rx="8" fill="#0a0a0a" stroke="#27272a"/>
  <text x="120" y="40" text-anchor="middle" fill="#ef4444" font-size="11" font-family="ui-monospace,monospace">${escapeXml(message)}</text>
</svg>`;
}

export const Route = createFileRoute("/api/public/widget/badge.svg")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = url.searchParams.get("url") || url.searchParams.get("u") || "";
        const host = normalizeHost(raw);
        const headers = {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=3600",
          "Access-Control-Allow-Origin": "*",
        } as const;

        if (!host) {
          return new Response(errorSvg("?url=yoursite.com required"), { status: 400, headers });
        }

        let latest = await fetchLatestScanForHost(host);

        if (!latest) {
          try {
            const r = await scanUrl({
              data: { url: `https://${host}`, source: "badge" },
            });
            if (r.ok) {
              latest = {
                id: "fresh",
                url: r.finalUrl,
                host,
                overall: r.overall,
                scanned_at: r.fetchedAt,
              };
            }
          } catch {
            // fall through to error svg
          }
        }

        if (!latest) {
          return new Response(errorSvg("scan unavailable"), { status: 502, headers });
        }

        return new Response(badgeSvg(latest.overall, host), { status: 200, headers });
      },
    },
  },
});
