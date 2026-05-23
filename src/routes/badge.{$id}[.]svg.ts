import { createFileRoute } from "@tanstack/react-router";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function recordFor(id: string) {
  const h = hash(id);
  const score = 80 + (h % 18);
  const domains = ["northwind.io", "acme-labs.com", "stripewise.co", "lumenly.app", "kepler-os.dev", "fernpath.studio"];
  return { score, domain: domains[h % domains.length] };
}

function svg(score: number, domain: string) {
  const dash = (score / 100) * 150.8;
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
    <circle r="24" fill="none" stroke="#10b981" stroke-width="4" stroke-linecap="round" stroke-dasharray="${dash} 150.8" transform="rotate(-90)"/>
    <text text-anchor="middle" dy="6" fill="#fafafa" font-size="18" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">${score}</text>
  </g>
  <g transform="translate(74,26)">
    <text fill="#10b981" font-size="9" font-weight="600" letter-spacing="1.5" font-family="ui-monospace,monospace">CERTIFIED</text>
    <text y="14" fill="#fafafa" font-size="13" font-weight="600" font-family="ui-sans-serif,system-ui,sans-serif">Agent-Native</text>
    <text y="30" fill="#71717a" font-size="9" font-family="ui-monospace,monospace">grow.contact · ${domain}</text>
  </g>
</svg>`;
}

export const Route = createFileRoute("/badge/{$id}.svg")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = params.id;
        const { score, domain } = recordFor(id);
        return new Response(svg(score, domain), {
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
