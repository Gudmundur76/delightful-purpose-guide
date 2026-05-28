// Generic dynamic OG image (1200x630 SVG). Any leaf route can wire
// this as its og:image / twitter:image with a unique title + kicker so
// social previews never inherit the home page's image.
//
// Usage:
//   /api/public/widget/og.svg?title=How%20to%20...&kicker=Journal
//
// Crawlers (Slack/Twitter/Facebook/Telegram/Discord/LinkedIn) accept SVG.

import { createFileRoute } from "@tanstack/react-router";

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
}

function wrap(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > maxChars) {
      if (cur) lines.push(cur);
      cur = w;
    } else cur = (cur ? cur + " " : "") + w;
  }
  if (cur) lines.push(cur);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].replace(/[\s\W]+$/, "") + "…";
    return kept;
  }
  return lines;
}

function renderSvg(title: string, kicker: string, sub: string): string {
  const W = 1200;
  const H = 630;
  const padX = 72;
  const titleLines = wrap(title, 28, 4);
  const subLines = sub ? wrap(sub, 60, 2) : [];

  const titleSvg = titleLines
    .map(
      (ln, i) =>
        `<text x="${padX}" y="${230 + i * 84}" font-family="ui-sans-serif,system-ui,-apple-system,sans-serif" font-size="76" font-weight="800" letter-spacing="-2.5" fill="#fafafa">${escapeXml(ln)}</text>`,
    )
    .join("");

  const subSvg = subLines
    .map(
      (ln, i) =>
        `<text x="${padX}" y="${H - 132 + i * 30}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="22" fill="#a1a1aa">${escapeXml(ln)}</text>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.7">
      <stop offset="0%" stop-color="#ee5d3a" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ee5d3a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- Kicker -->
  <text x="${padX}" y="118" font-family="ui-monospace,monospace" font-size="20" letter-spacing="3" fill="#ee5d3a">// ${escapeXml(kicker.toUpperCase())}</text>

  <!-- Title -->
  ${titleSvg}

  <!-- Sub -->
  ${subSvg}

  <!-- Footer -->
  <line x1="${padX}" y1="${H - 72}" x2="${W - padX}" y2="${H - 72}" stroke="#27272a" stroke-width="1"/>
  <text x="${padX}" y="${H - 36}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="22" font-weight="800" letter-spacing="-0.5" fill="#fafafa">GROW_</text>
  <text x="${padX + 100}" y="${H - 36}" font-family="ui-monospace,monospace" font-size="18" fill="#71717a">agent-native websites · grow.contact</text>
  <text x="${W - padX}" y="${H - 36}" font-family="ui-monospace,monospace" font-size="18" fill="#10b981" text-anchor="end">● Lighthouse 98/100</text>
</svg>`;
}

export const Route = createFileRoute("/api/public/widget/og.svg")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const title = (url.searchParams.get("title") ?? "Agent-Native Websites").slice(0, 200);
        const kicker = (url.searchParams.get("kicker") ?? "Grow").slice(0, 40);
        const sub = (url.searchParams.get("sub") ?? "").slice(0, 240);
        return new Response(renderSvg(title, kicker, sub), {
          status: 200,
          headers: {
            "Content-Type": "image/svg+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
});
