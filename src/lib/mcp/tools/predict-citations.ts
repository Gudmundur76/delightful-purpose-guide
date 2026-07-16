import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { gatherAuthoritySignals } from "./authority-signals";

function normalizeDomain(input: string): string {
  return input.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateWordCount(html: string): number {
  return stripHtml(html).split(/\s+/).filter(Boolean).length;
}

function countNumbersInText(text: string): number {
  const matches = text.match(/\d+\.?\d*%?|\$\d+|\d+\.\d+/g) || [];
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return wordCount > 0 ? Math.round((matches.length / wordCount) * 1000) : 0;
}

function first100WordsAnswerFormat(text: string): boolean {
  const first100 = text.split(/\s+/).slice(0, 100).join(" ");
  return (
    /^(\w+\s+){1,5}(is|are|provides|builds|creates|offers|makes)\b/i.test(first100) ||
    /^(\w+\s+){1,8}(AI|platform|tool|service|API|software)/i.test(first100)
  );
}

function extractJsonLdTypes(html: string): string[] {
  const types = new Set<string>();
  const scripts = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of scripts) {
    try {
      const json = JSON.parse(m[1]);
      const collect = (node: unknown) => {
        if (!node) return;
        if (Array.isArray(node)) return node.forEach(collect);
        if (typeof node === "object") {
          const t = (node as { "@type"?: string | string[] })["@type"];
          if (typeof t === "string") types.add(t);
          else if (Array.isArray(t)) t.forEach((x) => types.add(x));
          Object.values(node as Record<string, unknown>).forEach(collect);
        }
      };
      collect(json);
    } catch {
      // ignore parse errors
    }
  }
  return Array.from(types);
}

export function calculateContentQualityScore(html: string): number {
  const types = extractJsonLdTypes(html);
  const hasFaq = types.includes("FAQPage");
  const hasHowto = types.includes("HowTo");
  const hasProduct = types.includes("Product");
  const hasOrg = types.includes("Organization");

  const text = stripHtml(html);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const comparisonTableCount = (html.match(/<table/gi) || []).length;
  const hasVideo = /<video|<iframe[^>]+youtube|embed.*video/gi.test(html);
  const hasTestimonials = /testimonial|".*".*CEO|".*".*founder/gi.test(html);
  const factualDensity = countNumbersInText(text);
  const hasQABlocks = hasFaq || /faq|Q&A|frequently asked/gi.test(html);
  const answerFormat = first100WordsAnswerFormat(text);

  let score = 0;
  score += hasFaq ? 25 : 0;
  score += hasHowto ? 15 : 0;
  score += hasProduct ? 15 : 0;
  score += hasOrg ? 10 : 0;
  score += Math.min(comparisonTableCount * 15, 30);
  score += hasQABlocks ? 10 : 0;
  score += answerFormat ? 15 : 0;
  score += Math.min(factualDensity * 2, 30);
  score += hasVideo ? 10 : 0;
  score += hasTestimonials ? 10 : 0;
  score += Math.min(wordCount / 30, 25);

  return Math.min(100, Math.round(score * 100) / 100);
}

export function calculateInformationGainScore(opts: {
  hasDocsFolder: boolean;
  readmeLength: number;
  html: string;
}): number {
  const hasVideo = /<video|<iframe[^>]+youtube/gi.test(opts.html);
  const wordCount = estimateWordCount(opts.html);
  const docsLinksCount = (opts.html.match(/docs\.|documentation|api-reference|developers|guides/gi) || []).length;
  const readmeScore = Math.min((opts.readmeLength / 3000) * 100, 100);
  const docsScore = opts.hasDocsFolder ? 20 : 0;
  const videoScore = hasVideo ? 15 : 0;
  const depthScore = Math.min(docsLinksCount * 10, 40);
  const contentScore = Math.min(wordCount / 50, 25);
  const infoGain =
    readmeScore * 0.4 + docsScore * 0.2 + videoScore * 0.15 + depthScore * 0.15 + contentScore * 0.1;
  return Math.min(100, Math.round(infoGain * 100) / 100);
}

export function calculatePredictiveCCS(
  technical: number,
  authority: number,
  contentQuality: number,
  informationGain: number,
): number {
  const ccs = technical * 0.1 + authority * 0.5 + contentQuality * 0.25 + informationGain * 0.15;
  return Math.round(ccs * 100) / 100;
}

type Likelihood = "very-high" | "high" | "medium" | "low" | "very-low";
const bucket = (s: number): Likelihood => {
  if (s >= 70) return "very-high";
  if (s >= 50) return "high";
  if (s >= 35) return "medium";
  if (s >= 20) return "low";
  return "very-low";
};

function getEngineLikelihood(ccs: number, technical: number, authority: number, content: number) {
  return {
    chatgpt: bucket(ccs * 1.0),
    perplexity: bucket(ccs * 0.95 + content * 0.05),
    claude: bucket(ccs * 0.9 + content * 0.08 + technical * 0.02),
    google_aio: bucket(ccs * 0.85 + technical * 0.1 + authority * 0.05),
  };
}

function generateTopFixes(t: number, a: number, c: number, i: number): string[] {
  const fixes = [
    { score: t, message: `Fix technical foundation (score: ${t}/100)` },
    { score: a, message: `Build authority signals — GitHub, community, PR (score: ${a}/100)` },
    { score: c, message: `Add FAQ schema, comparison tables, fact-dense content (score: ${c}/100)` },
    { score: i, message: `Expand documentation depth, README, tutorials (score: ${i}/100)` },
  ].sort((x, y) => x.score - y.score);
  const weights = [0.5, 0.25, 0.15];
  return fixes.slice(0, 3).map((f, idx) => {
    const gain = Math.round((100 - f.score) * weights[idx]);
    return `${idx + 1}. ${f.message} — estimated +${gain} CCS points`;
  });
}

async function fetchHtml(domain: string): Promise<string> {
  try {
    const res = await fetch(`https://${domain}`, {
      headers: { "User-Agent": "citation.is-mcp/1.0 (+https://citation.is)" },
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  }
}

async function fetchTechnicalScore(domain: string): Promise<number> {
  // Lightweight proxy: re-uses public scan endpoint pattern.
  // For v1 we derive a quick technical score from the homepage HTML.
  const html = await fetchHtml(domain);
  if (!html) return 0;
  let score = 0;
  if (/<title>[^<]+<\/title>/i.test(html)) score += 15;
  if (/<meta[^>]+name=["']description["']/i.test(html)) score += 15;
  if (/application\/ld\+json/i.test(html)) score += 20;
  if (/<meta[^>]+property=["']og:/i.test(html)) score += 10;
  if (/<link[^>]+rel=["']canonical["']/i.test(html)) score += 10;
  if (/<h1[\s>]/i.test(html)) score += 10;
  if (/<html[^>]+lang=/i.test(html)) score += 5;
  if (/sitemap\.xml/i.test(html)) score += 5;
  if (/<img[^>]+alt=/i.test(html)) score += 10;
  return Math.min(100, score);
}

export const predictCitationsTool = defineTool({
  name: "predict_citations",
  description:
    "Predict AI citation likelihood using the Citation Corpus Score (CCS v1) — a weighted composite of technical (10%), authority (50%), content quality (25%), and information gain (15%) signals. Returns per-engine likelihood (chatgpt, perplexity, claude, google_aio) and top 3 actionable fixes.",
  parameters: z.object({
    domain: z.string().min(3).max(255),
    include_breakdown: z.boolean().optional().default(true),
  }),
  execute: async ({ domain }) => {
    const d = normalizeDomain(domain);
    const [authoritySignals, html, technical] = await Promise.all([
      gatherAuthoritySignals(d),
      fetchHtml(d),
      fetchTechnicalScore(d),
    ]);
    const content_quality = calculateContentQualityScore(html);
    const information_gain = calculateInformationGainScore({
      hasDocsFolder: authoritySignals.github?.has_docs_folder ?? false,
      readmeLength: 0,
      html,
    });
    const authority = authoritySignals.authority_score;
    const ccs = calculatePredictiveCCS(technical, authority, content_quality, information_gain);
    const result = {
      domain: d,
      ccs_v1: ccs,
      formula_version: "v1-predictive-2026-05" as const,
      weights_used: { technical: 0.1, authority: 0.5, content_quality: 0.25, information_gain: 0.15 },
      scores: { technical, authority, content_quality, information_gain },
      engine_likelihood: getEngineLikelihood(ccs, technical, authority, content_quality),
      top_fixes: generateTopFixes(technical, authority, content_quality, information_gain),
      scored_at: new Date().toISOString(),
    };
    return JSON.stringify(result, null, 2);
  },
});
