// auto_fix_schema — crawls a page, extracts Q/A pairs via Lovable AI, drafts a FAQPage JSON-LD intervention.
import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { draftIntervention, fetchTextSafe, getOrCreateSite, normalizeDomain, supersedeOlder } from "@/lib/interventions/shared.server";

const SYSTEM = `You extract FAQ-style Q/A pairs from web page content for use in schema.org FAQPage JSON-LD. Return only questions a real user might ask, with concise factual answers grounded in the supplied content. Skip marketing fluff.`;

type Qa = { question: string; answer: string };

async function extractQas(content: string): Promise<Qa[]> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: `Extract 3-8 Q/A pairs from this page:\n\n${content.slice(0, 12_000)}` },
      ],
      tools: [{
        type: "function",
        function: {
          name: "emit_faq",
          parameters: {
            type: "object",
            additionalProperties: false,
            properties: {
              pairs: {
                type: "array",
                items: {
                  type: "object",
                  additionalProperties: false,
                  properties: { question: { type: "string" }, answer: { type: "string" } },
                  required: ["question", "answer"],
                },
              },
            },
            required: ["pairs"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "emit_faq" } },
    }),
  });
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${await res.text().catch(() => "")}`);
  const json = await res.json();
  const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) return [];
  try {
    const parsed = JSON.parse(args);
    return Array.isArray(parsed.pairs) ? parsed.pairs.slice(0, 10) : [];
  } catch {
    return [];
  }
}

function buildFaqJsonLd(pageUrl: string, qas: Qa[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: pageUrl,
    mainEntity: qas.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

export const autoFixSchemaTool = defineTool({
  name: "auto_fix_schema",
  description: "Crawls a page, extracts FAQ-style Q/A pairs via AI, and drafts a FAQPage JSON-LD intervention for approval. Returns intervention_id, preview, and install snippet.",
  parameters: z.object({
    domain: z.string().min(3).max(255),
    page_url: z.string().url().max(2048).optional(),
    owner_user_id: z.string().uuid().optional(),
  }),
  execute: async ({ domain, page_url, owner_user_id }) => {
    const dom = normalizeDomain(domain);
    const url = page_url ?? `https://${dom}/`;
    const fetched = await fetchTextSafe(url);
    if (!fetched.ok) return JSON.stringify({ ok: false, error: `fetch failed: ${fetched.status}` }, null, 2);
    // Strip HTML to text-ish.
    const text = fetched.body.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const qas = await extractQas(text);
    if (qas.length === 0) return JSON.stringify({ ok: false, error: "no Q/A pairs extracted" }, null, 2);

    const site = await getOrCreateSite({ ownerUserId: owner_user_id ?? null, domain: dom });
    const jsonld = buildFaqJsonLd(url, qas);
    const preview = `FAQPage JSON-LD with ${qas.length} questions for ${url}`;
    const interventionId = await draftIntervention({
      siteId: site.id, kind: "schema", payload: { jsonld, page_url: url }, previewText: preview, triggeredBy: "manual",
    });
    await supersedeOlder(site.id, "schema", interventionId);

    return JSON.stringify({
      ok: true,
      intervention_id: interventionId,
      site_id: site.id,
      preview,
      jsonld,
      install_snippet: `<script src="https://grow.contact/api/public/inject/${site.install_token}.js" defer></script>`,
      next: "Approve at /dashboard/interventions to go live.",
    }, null, 2);
  },
});
