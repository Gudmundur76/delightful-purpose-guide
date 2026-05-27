// Public analyze endpoint: thin wrapper around scanUrl that reshapes the
// internal ScanResult into a stable external schema.
//
// POST /api/public/v1/analyze
// Headers: X-API-Key: <PUBLIC_API_KEY>  (or Authorization: Bearer <key>)
// Body:    { "url": "https://example.com" }
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { jsonResponse, optionsResponse, requireApiKey } from "@/lib/api/auth";
import { clientIpFromRequest, rateLimit } from "@/lib/api/rate-limit";
import { scanUrl, type ScanMetric, type ScanMetricKey, type ScanResult } from "@/lib/check/scan.functions";

const InputSchema = z.object({
  url: z.string().trim().min(3).max(2048),
});

const SIGNAL_WEIGHTS: Record<ScanMetricKey, number> = {
  semantic: 20,
  jsonld: 20,
  llms: 15,
  citability: 15,
  speed: 15,
  protocol: 15,
};

const SIGNAL_KEY_MAP: Record<ScanMetricKey, string> = {
  semantic: "semantic_html",
  jsonld: "json_ld",
  llms: "llms_txt",
  citability: "citability",
  speed: "speed",
  protocol: "protocol_discovery",
};

function gradeFor(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function summaryFor(score: number): string {
  if (score >= 90) return "Excellent agent-native site — LLMs and AI agents can read and cite this page with confidence.";
  if (score >= 75) return "Solid agent readability with a few opportunities to improve structure or metadata.";
  if (score >= 60) return "Partially agent-ready. Several signals need work before LLMs will reliably cite this page.";
  return "Weak agent readability. Major gaps in semantic structure, metadata, or content substance.";
}

function reshape(result: Extract<ScanResult, { ok: true }>) {
  const signals: Record<string, { score: number; weight: number; status: string; summary: string; findings: string[] }> = {};
  for (const m of result.metrics) {
    signals[SIGNAL_KEY_MAP[m.key]] = {
      score: m.score,
      weight: SIGNAL_WEIGHTS[m.key],
      status: m.status,
      summary: m.summary,
      findings: m.details,
    };
  }
  return {
    url: result.url,
    final_url: result.finalUrl,
    score: result.overall,
    grade: gradeFor(result.overall),
    signals,
    summary: summaryFor(result.overall),
    checked_at: result.fetchedAt,
  };
}

export const Route = createFileRoute("/api/public/v1/analyze")({
  server: {
    handlers: {
      OPTIONS: async () => optionsResponse(),

      POST: async ({ request }) => {
        const unauth = requireApiKey(request);
        if (unauth) return unauth;

        // Per-IP rate limit: 20 requests / minute. scanUrl makes outbound HTTP
        // calls so abuse risk is real even with a valid API key.
        const ip = clientIpFromRequest(request);
        if (rateLimit(`analyze:${ip}`, 20, 60_000)) {
          return jsonResponse({ error: "Rate limit exceeded" }, 429);
        }

        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON body" }, 400);
        }
        const parsed = InputSchema.safeParse(json);
        if (!parsed.success) {
          return jsonResponse(
            { error: "Invalid input", details: parsed.error.flatten() },
            400,
          );
        }

        try {
          const result = await scanUrl({
            data: { url: parsed.data.url, source: "api_v1" },
          });
          if (!result.ok) {
            return jsonResponse({ error: result.error, url: result.url }, 422);
          }
          return jsonResponse(reshape(result), 200);
        } catch (err) {
          console.error("analyze POST failed", err);
          return jsonResponse({ error: "Analysis failed" }, 500);
        }
      },
    },
  },
});
