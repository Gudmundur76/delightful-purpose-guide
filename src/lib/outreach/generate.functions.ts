import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { scanUrl, type ScanMetric } from "@/lib/check/scan.functions";
import { rateLimit, clientIpFromRequest } from "@/lib/api/rate-limit";

const InputSchema = z.object({
  url: z.string().min(3).max(2048),
  recipientName: z.string().max(120).optional(),
  recipientCompany: z.string().max(160).optional(),
  senderName: z.string().min(1).max(120),
  tone: z.enum(["direct", "warm", "playful"]).default("direct"),
});

export type OutreachResult =
  | {
      ok: true;
      url: string;
      overall: number;
      worstMetrics: Array<{ label: string; score: number; summary: string }>;
      subject: string;
      body: string;
      model: string;
    }
  | {
      ok: false;
      error: string;
    };

const SYSTEM_PROMPT = `You are a senior B2B cold-email writer for grow.contact, a boutique agency that fixes "agent-readability" (how well a website is parsed by ChatGPT, Perplexity, Claude, etc.).

Output rules — STRICT:
- Return ONLY a JSON object with keys: "subject", "body". No prose, no markdown, no code fences.
- subject: under 55 chars, lowercase-first, no clickbait, no emojis.
- body: 90–140 words, plain text with \\n line breaks, 3 short paragraphs:
  1. one specific observation from the audit (cite the worst metric by name and a fact),
  2. one sentence on why that matters for LLM citations / agent traffic,
  3. a soft CTA — offer a free 20-min teardown call. Sign as the sender.
- Never invent numbers. Use only the provided audit data.
- No "I hope this finds you well", no "circling back", no hype words.`;

async function callLovableAI(payload: object): Promise<{ subject: string; body: string }> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content?.trim() ?? "";
  // Strip possible code fences
  const cleaned = content.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let parsed: { subject?: unknown; body?: unknown };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned non-JSON output");
  }
  if (typeof parsed.subject !== "string" || typeof parsed.body !== "string") {
    throw new Error("AI output missing subject/body");
  }
  return { subject: parsed.subject, body: parsed.body };
}

export const generateOutreach = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<OutreachResult> => {
    try {
      // Per-IP rate limit — generation calls a paid AI API. 3 per 10 minutes.
      try {
        const req = getRequest();
        const ip = clientIpFromRequest(req);
        if (rateLimit(`outreach:${ip}`, 3, 10 * 60_000)) {
          return { ok: false, error: "Rate limited — try again in a few minutes." };
        }
      } catch {
        // ignore — fall through if request context unavailable
      }

      const scan = await scanUrl({ data: { url: data.url } });
      if (!scan.ok) {
        return { ok: false, error: `Scan failed: ${scan.error}` };
      }

      const worst = [...scan.metrics]
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map((m: ScanMetric) => ({
          label: m.label,
          score: m.score,
          summary: m.summary,
          topDetail: m.details[0] ?? "",
        }));

      const auditFacts = {
        url: scan.url,
        overallScore: scan.overall,
        worstMetrics: worst,
      };

      const userPrompt = `Recipient: ${data.recipientName || "there"}${data.recipientCompany ? ` at ${data.recipientCompany}` : ""}.
Sender: ${data.senderName}.
Tone: ${data.tone}.

Audit JSON:
${JSON.stringify(auditFacts, null, 2)}

Write the cold email as instructed.`;

      const model = "google/gemini-2.5-flash";
      const ai = await callLovableAI({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      });

      return {
        ok: true,
        url: scan.url,
        overall: scan.overall,
        worstMetrics: worst.map((w) => ({ label: w.label, score: w.score, summary: w.summary })),
        subject: ai.subject,
        body: ai.body,
        model,
      };
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : "Generation failed" };
    }
  });
