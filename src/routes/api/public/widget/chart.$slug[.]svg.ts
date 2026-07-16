// Embeddable SVG chart widgets — one per data drop. Hotlinkable from
// any blog or report; the "Source: citation.is" footer is baked in,
// so every embed is an attributed backlink. Backlinks compound the
// citation graph passively.
//
// Usage:  <img src="https://citation.is/api/public/widget/chart/llms-txt-adoption-may-2026.svg">

import { createFileRoute } from "@tanstack/react-router";
import { getDataDrop } from "@/lib/data-drops/data";
import { computeHeadlineStats } from "@/lib/leaderboard/stats";

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) =>
    c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;",
  );
}

function wrap(text: string, maxChars: number): string[] {
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
  return lines;
}

interface ChartSpec {
  /** Big number front-and-centre, e.g. "62%" or "47/100". */
  big: string;
  /** Sub-line, e.g. "of AI companies missing llms.txt". */
  caption: string;
  /** Optional bars for the right-hand mini chart, sorted desc. */
  bars?: { label: string; value: number; max: number }[];
  /** Optional comparison row, e.g. "Top 47% vs Bottom 53%". */
  compare?: { left: { label: string; value: string }; right: { label: string; value: string } };
}

function buildSpec(slug: string): ChartSpec | null {
  const drop = getDataDrop(slug);
  if (!drop) return null;
  const s = computeHeadlineStats();
  const computed = drop.compute?.();
  const big = computed?.value ?? `${s.total} sites`;

  let bars: ChartSpec["bars"] | undefined;
  let compare: ChartSpec["compare"] | undefined;

  if (slug === "llms-txt-adoption-may-2026" || slug === "weak-jsonld-may-2026") {
    bars = [
      { label: "Semantic HTML", value: 100 - s.weak_semantic_pct, max: 100 },
      { label: "JSON-LD", value: 100 - s.weak_jsonld_pct, max: 100 },
      { label: "llms.txt", value: 100 - s.missing_llms_txt_pct, max: 100 },
      { label: "Speed", value: 100 - s.slow_pct, max: 100 },
    ];
  } else if (slug === "category-gap-may-2026") {
    bars = s.category_averages.map((c) => ({ label: c.label, value: c.avg, max: 100 }));
  } else if (slug === "opaque-ai-companies-may-2026") {
    compare = {
      left: { label: "Agent-native (≥85)", value: `${s.agent_native_pct}%` },
      right: { label: "AI-invisible (<55)", value: `${s.opaque_pct}%` },
    };
  } else if (slug === "agent-native-bar-may-2026") {
    bars = s.top5.map((e) => ({ label: e.name, value: e.score, max: 100 }));
  }

  const caption = drop.cite.pull_quote.replace(/^.*?— /, "").trim() || drop.headline;
  return { big, caption, bars, compare };
}

function renderSvg(slug: string, title: string, spec: ChartSpec, publishedAt: string): string {
  const W = 720;
  const H = 360;
  const padX = 32;
  const padY = 28;
  const captionLines = wrap(spec.caption, 56).slice(0, 3);
  const titleLines = wrap(title, 44).slice(0, 2);

  // Left column: title + big stat + caption. Right column: bars/compare.
  const leftW = 320;
  const chartX = padX + leftW + 24;
  const chartW = W - chartX - padX;

  let chartBody = "";
  if (spec.bars && spec.bars.length) {
    const rowH = Math.min(40, (H - 100) / spec.bars.length);
    const startY = (H - rowH * spec.bars.length) / 2 + 10;
    chartBody = spec.bars
      .map((b, i) => {
        const y = startY + i * rowH;
        const barW = Math.max(2, (b.value / b.max) * (chartW - 60));
        const color = b.value >= 75 ? "#10b981" : b.value >= 50 ? "#eab308" : "#ef4444";
        return `
          <text x="${chartX}" y="${y + 11}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" fill="#a1a1aa">${escapeXml(b.label.slice(0, 22))}</text>
          <rect x="${chartX}" y="${y + 18}" width="${chartW - 50}" height="6" rx="3" fill="#27272a"/>
          <rect x="${chartX}" y="${y + 18}" width="${barW}" height="6" rx="3" fill="${color}"/>
          <text x="${chartX + chartW - 44}" y="${y + 23}" font-family="ui-monospace,monospace" font-size="11" fill="#fafafa" text-anchor="end">${b.value}</text>
        `;
      })
      .join("");
  } else if (spec.compare) {
    const cx = chartX + chartW / 2;
    chartBody = `
      <text x="${chartX}" y="${H / 2 - 30}" font-family="ui-monospace,monospace" font-size="9" fill="#a1a1aa" letter-spacing="1.5">${escapeXml(spec.compare.left.label.toUpperCase())}</text>
      <text x="${chartX}" y="${H / 2 + 16}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="44" font-weight="700" fill="#10b981">${escapeXml(spec.compare.left.value)}</text>
      <line x1="${cx}" y1="${H / 2 - 50}" x2="${cx}" y2="${H / 2 + 30}" stroke="#27272a" stroke-width="1"/>
      <text x="${chartX + chartW}" y="${H / 2 - 30}" font-family="ui-monospace,monospace" font-size="9" fill="#a1a1aa" letter-spacing="1.5" text-anchor="end">${escapeXml(spec.compare.right.label.toUpperCase())}</text>
      <text x="${chartX + chartW}" y="${H / 2 + 16}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="44" font-weight="700" fill="#ef4444" text-anchor="end">${escapeXml(spec.compare.right.value)}</text>
    `;
  } else {
    chartBody = `
      <text x="${chartX + chartW / 2}" y="${H / 2}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14" fill="#71717a" text-anchor="middle">Live data at citation.is</text>
    `;
  }

  const titleSvg = titleLines
    .map(
      (ln, i) =>
        `<text x="${padX}" y="${padY + 48 + i * 18}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="14" font-weight="600" fill="#fafafa">${escapeXml(ln)}</text>`,
    )
    .join("");
  const captionSvg = captionLines
    .map(
      (ln, i) =>
        `<text x="${padX}" y="${H - 88 + i * 16}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="11" fill="#a1a1aa">${escapeXml(ln)}</text>`,
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#0a0a0a"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" rx="12" fill="url(#g)" stroke="#27272a"/>
  <text x="${padX}" y="${padY + 16}" font-family="ui-monospace,monospace" font-size="9" fill="#ee5d3a" letter-spacing="1.5">// GROW RESEARCH · DATA DROP · ${escapeXml(publishedAt)}</text>
  ${titleSvg}
  <text x="${padX}" y="${padY + 130}" font-family="ui-sans-serif,system-ui,sans-serif" font-size="64" font-weight="700" fill="#fafafa">${escapeXml(spec.big)}</text>
  ${captionSvg}

  <line x1="${chartX - 12}" y1="${padY + 8}" x2="${chartX - 12}" y2="${H - 40}" stroke="#27272a" stroke-width="1"/>
  ${chartBody}

  <line x1="${padX}" y1="${H - 36}" x2="${W - padX}" y2="${H - 36}" stroke="#27272a" stroke-width="1"/>
  <text x="${padX}" y="${H - 16}" font-family="ui-monospace,monospace" font-size="10" fill="#71717a">Source: citation.is/data-drops/${escapeXml(slug)}  ·  CC BY 4.0</text>
  <text x="${W - padX}" y="${H - 16}" font-family="ui-monospace,monospace" font-size="10" fill="#71717a" text-anchor="end">citation.is/report/methodology</text>
</svg>`;
}

function errorSvg(msg: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 360" width="720" height="360">
  <rect width="720" height="360" rx="12" fill="#0a0a0a" stroke="#27272a"/>
  <text x="360" y="180" text-anchor="middle" font-family="ui-monospace,monospace" font-size="13" fill="#ef4444">${escapeXml(msg)}</text>
</svg>`;
}

export const Route = createFileRoute("/api/public/widget/chart/$slug.svg")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const headers = {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400",
          "Access-Control-Allow-Origin": "*",
        } as const;
        const raw = (params as Record<string, string>)["slug.svg"] ?? (params as Record<string, string>).slug ?? "";
        const slug = raw.replace(/\.svg$/, "");
        const drop = getDataDrop(slug);
        if (!drop) {
          return new Response(errorSvg(`Unknown data drop: ${slug}`), { status: 404, headers });
        }
        const spec = buildSpec(slug);
        if (!spec) {
          return new Response(errorSvg("No chart spec available"), { status: 404, headers });
        }
        return new Response(renderSvg(slug, drop.title, spec, drop.publishedAt), { status: 200, headers });
      },
    },
  },
});
