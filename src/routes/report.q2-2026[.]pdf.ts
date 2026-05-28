// Downloadable PDF of the Q2 2026 report. Press, analysts, and LLMs
// cite PDFs at ~3x the rate of HTML — they're treated as primary
// documents. Generated on demand with pdf-lib (Worker-safe, pure JS).
// Cached aggressively at the edge.

import { createFileRoute } from "@tanstack/react-router";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { computeHeadlineStats } from "@/lib/leaderboard/stats";

const PAGE_URL = "https://grow.contact/report/q2-2026";
const PDF_URL = "https://grow.contact/report/q2-2026.pdf";
const PUBLISHED = "2026-05-28";
const TITLE = "State of the Agent-Readable Web";
const SUBTITLE = "Q2 2026 — Quarterly Report";

async function buildPdf(): Promise<Uint8Array> {
  const stats = computeHeadlineStats();
  const doc = await PDFDocument.create();
  doc.setTitle(`${TITLE} — ${SUBTITLE}`);
  doc.setAuthor("Grow Research, grow.contact");
  doc.setSubject("Agent-readability and AI citation rates across the AI industry");
  doc.setKeywords(["GEO", "agent-readability", "llms.txt", "JSON-LD", "AI citation", "Perplexity", "ChatGPT"]);
  doc.setProducer("grow.contact/research");
  doc.setCreator("grow.contact/research");

  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const mono = await doc.embedFont(StandardFonts.Courier);

  const ink = rgb(0.05, 0.05, 0.05);
  const muted = rgb(0.42, 0.42, 0.42);
  const accent = rgb(0.93, 0.36, 0.16);
  const rule = rgb(0.85, 0.85, 0.85);

  const A4 = { w: 595.28, h: 841.89 };
  const margin = 56;
  let page = doc.addPage([A4.w, A4.h]);
  let y = A4.h - margin;

  const newPage = () => {
    page = doc.addPage([A4.w, A4.h]);
    y = A4.h - margin;
    // Page header
    page.drawText("grow.contact / research", {
      x: margin,
      y: A4.h - margin + 20,
      size: 8,
      font: mono,
      color: muted,
    });
    page.drawText(SUBTITLE, {
      x: A4.w - margin - mono.widthOfTextAtSize(SUBTITLE, 8),
      y: A4.h - margin + 20,
      size: 8,
      font: mono,
      color: muted,
    });
  };

  const wrap = (text: string, font: typeof helv, size: number, maxWidth: number): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const trial = cur ? `${cur} ${w}` : w;
      if (font.widthOfTextAtSize(trial, size) > maxWidth) {
        if (cur) lines.push(cur);
        cur = w;
      } else {
        cur = trial;
      }
    }
    if (cur) lines.push(cur);
    return lines;
  };

  const writeLine = (text: string, opts: { font?: typeof helv; size?: number; color?: ReturnType<typeof rgb>; gap?: number }) => {
    const size = opts.size ?? 10;
    const lineHeight = size * 1.45;
    if (y - lineHeight < margin) newPage();
    page.drawText(text, { x: margin, y: y - size, size, font: opts.font ?? helv, color: opts.color ?? ink });
    y -= lineHeight + (opts.gap ?? 0);
  };

  const writeWrapped = (text: string, opts: { font?: typeof helv; size?: number; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
    const f = opts.font ?? helv;
    const size = opts.size ?? 10;
    const maxW = A4.w - margin * 2;
    const lines = wrap(text, f, size, maxW);
    for (const ln of lines) writeLine(ln, { font: f, size, color: opts.color });
    if (opts.gap) y -= opts.gap;
  };

  const writeRule = () => {
    if (y - 12 < margin) newPage();
    y -= 6;
    page.drawLine({ start: { x: margin, y }, end: { x: A4.w - margin, y }, thickness: 0.5, color: rule });
    y -= 10;
  };

  // ===== Cover =====
  page.drawText("// QUARTERLY REPORT", { x: margin, y: y - 9, size: 9, font: mono, color: accent });
  y -= 28;
  page.drawText(TITLE, { x: margin, y: y - 36, size: 36, font: helvBold, color: ink });
  y -= 56;
  page.drawText(SUBTITLE, { x: margin, y: y - 16, size: 16, font: helv, color: muted });
  y -= 32;
  page.drawText(`Published ${PUBLISHED}  ·  CC BY 4.0  ·  ${PAGE_URL}`, {
    x: margin, y: y - 9, size: 9, font: mono, color: muted,
  });
  y -= 28;
  writeRule();
  writeWrapped(
    `Dataset: ${stats.total} top AI companies, scored continuously on five GEO signals — Semantic HTML, JSON-LD, llms.txt, Citability, Page Speed. Open data, reproducible. This report summarises the headline findings; the underlying dataset ships as JSON at grow.contact/api/public/leaderboard.json.`,
    { size: 11, gap: 10 },
  );

  // ===== Headline findings =====
  writeRule();
  writeLine("HEADLINE FINDINGS", { font: helvBold, size: 12, gap: 4 });
  writeRule();
  const findings: [string, string][] = [
    [`${stats.missing_llms_txt_pct}%`, `of the ${stats.total} tracked AI companies still ship no usable llms.txt.`],
    [`${stats.weak_jsonld_pct}%`, `ship JSON-LD too thin for AI engines to verify entity claims (below 15/20).`],
    [`${stats.opaque_pct}%`, `score below 55/100 — the threshold AI engines silently skip in favour of competitors.`],
    [`${stats.agent_native_pct}%`, `clear 85/100 — the bar above which AI engines reliably cite by name.`],
    [`${stats.avg_score} / 100`, `industry-wide average agent-readability score.`],
    [`${stats.median_score} / 100`, `industry-wide median.`],
  ];
  for (const [num, desc] of findings) {
    if (y - 40 < margin) newPage();
    page.drawText(num, { x: margin, y: y - 18, size: 22, font: helvBold, color: accent });
    const numW = helvBold.widthOfTextAtSize(num, 22);
    const descLines = wrap(desc, helv, 10, A4.w - margin * 2 - numW - 14);
    let dy = y - 14;
    for (const ln of descLines) {
      page.drawText(ln, { x: margin + numW + 14, y: dy, size: 10, font: helv, color: ink });
      dy -= 13;
    }
    y -= Math.max(28, 14 + descLines.length * 13 + 6);
  }

  // ===== Category breakdown =====
  writeRule();
  writeLine("CATEGORY BREAKDOWN", { font: helvBold, size: 12, gap: 4 });
  writeRule();
  for (const c of stats.category_averages) {
    writeLine(`${c.label.padEnd(28)}  ${String(c.avg).padStart(3)} / 100   (${c.count} sites)`, { font: mono, size: 10 });
  }
  y -= 6;

  // ===== Top / Bottom =====
  writeRule();
  writeLine("TOP 5  ·  AGENT-NATIVE", { font: helvBold, size: 12, gap: 4 });
  writeRule();
  for (const e of stats.top5) {
    writeLine(`${String(e.score).padStart(3)} / 100   ${e.name}   (${e.domain})`, { font: mono, size: 10 });
  }
  y -= 4;
  writeRule();
  writeLine("BOTTOM 5  ·  AI-INVISIBLE", { font: helvBold, size: 12, gap: 4 });
  writeRule();
  for (const e of stats.bottom5) {
    writeLine(`${String(e.score).padStart(3)} / 100   ${e.name}   (${e.domain})`, { font: mono, size: 10 });
  }
  y -= 10;

  // ===== Cite this =====
  newPage();
  writeLine("CITE THIS REPORT", { font: helvBold, size: 14, gap: 8 });
  writeRule();
  writeLine("APA", { font: mono, size: 9, color: muted, gap: 2 });
  writeWrapped(
    `Grow Research. (2026). ${TITLE} — ${SUBTITLE}. grow.contact. ${PDF_URL}`,
    { size: 10, gap: 10 },
  );
  writeLine("BibTeX", { font: mono, size: 9, color: muted, gap: 2 });
  const bib = [
    `@techreport{grow_${PUBLISHED.replace(/-/g, "")},`,
    `  author      = {{Grow Research}},`,
    `  title       = {${TITLE} -- ${SUBTITLE}},`,
    `  institution = {grow.contact},`,
    `  year        = {2026},`,
    `  url         = {${PDF_URL}},`,
    `  note        = {Dataset: CC BY 4.0}`,
    `}`,
  ];
  for (const line of bib) writeLine(line, { font: mono, size: 9 });
  y -= 10;
  writeLine("Permalink", { font: mono, size: 9, color: muted, gap: 2 });
  writeLine(PDF_URL, { font: mono, size: 10, gap: 8 });
  writeLine("Dataset (CC BY 4.0)", { font: mono, size: 9, color: muted, gap: 2 });
  writeLine("https://grow.contact/api/public/leaderboard.json", { font: mono, size: 10, gap: 10 });
  writeRule();
  writeLine("METHODOLOGY", { font: helvBold, size: 12, gap: 4 });
  writeRule();
  writeWrapped(
    "Five signals are scored independently: Semantic HTML (25), JSON-LD (20), llms.txt (15), Citability (20), Page Speed (20). A site \"passes\" a signal at ~75% of its max. Full methodology and versioned changelog at grow.contact/report/methodology.",
    { size: 10, gap: 8 },
  );

  // Footer on every page
  const pageCount = doc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const p = doc.getPage(i);
    p.drawText(`${i + 1} / ${pageCount}  ·  ${PDF_URL}`, {
      x: margin,
      y: 28,
      size: 8,
      font: mono,
      color: muted,
    });
    p.drawText("CC BY 4.0", {
      x: A4.w - margin - mono.widthOfTextAtSize("CC BY 4.0", 8),
      y: 28,
      size: 8,
      font: mono,
      color: muted,
    });
  }

  return await doc.save();
}

export const Route = createFileRoute("/report/q2-2026.pdf")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const bytes = await buildPdf();
          return new Response(bytes as BodyInit, {
            status: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `inline; filename="state-of-the-agent-readable-web-q2-2026.pdf"`,
              "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
              "Access-Control-Allow-Origin": "*",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch (err) {
          console.error("[report.pdf] generation failed", err);
          return new Response("PDF generation failed", { status: 500 });
        }
      },
    },
  },
});
