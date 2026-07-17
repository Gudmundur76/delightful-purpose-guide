import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "auto_fix_schema",
  title: "Draft FAQPage JSON-LD for a page",
  description:
    "When to use: `scan_url` reports the `jsonld` signal failing, or the user asks to 'add schema/FAQ markup' to a specific page. Crawls the page, extracts 3-8 real Q/A pairs via Gemini, and drafts a FAQPage JSON-LD block as a pending intervention scoped to the signed-in user. Input: `domain` (bare host, required), `page_url` (absolute URL, optional — defaults to the domain root). Returns: `{ intervention_id, preview, jsonld, install_snippet, next }`. The draft is NOT live — the user must call `approve_intervention` or click Approve in /dashboard/interventions. Idempotent per (site, kind): older drafts of the same kind are auto-superseded. Requires OAuth (401 otherwise).",
  inputSchema: {
    domain: z.string().min(3).max(253).describe("Bare domain you own or manage, e.g. `example.com`. No scheme, no path."),
    page_url: z.string().url().max(2048).optional().describe("Optional absolute URL of the page to extract FAQ pairs from. Defaults to `https://{domain}/`."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async ({ domain, page_url }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Unauthenticated — sign in to draft interventions." }], isError: true };
    }
    const userId = ctx.getUserId();
    if (!userId) return { content: [{ type: "text", text: "Missing user id in token." }], isError: true };

    const [{ normalizeDomain, fetchTextSafe, getOrCreateSite, draftIntervention, supersedeOlder }] = await Promise.all([
      import("@/lib/interventions/shared.server"),
    ]);

    const dom = normalizeDomain(domain);
    const url = page_url ?? `https://${dom}/`;
    const fetched = await fetchTextSafe(url);
    if (!fetched.ok) {
      return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: `fetch failed: ${fetched.status}` }) }], isError: true };
    }
    const text = fetched.body
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { content: [{ type: "text", text: "LOVABLE_API_KEY not configured." }], isError: true };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "Extract FAQ Q/A pairs from web content for schema.org FAQPage JSON-LD. Real user questions only, factual answers grounded in the content. No marketing fluff." },
          { role: "user", content: `Extract 3-8 Q/A pairs from this page:\n\n${text.slice(0, 12_000)}` },
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
    if (!res.ok) {
      return { content: [{ type: "text", text: `AI gateway ${res.status}` }], isError: true };
    }
    const json = await res.json();
    const args = json?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    let qas: { question: string; answer: string }[] = [];
    try {
      const parsed = JSON.parse(args ?? "{}");
      qas = Array.isArray(parsed.pairs) ? parsed.pairs.slice(0, 10) : [];
    } catch { /* noop */ }
    if (qas.length === 0) {
      return { content: [{ type: "text", text: JSON.stringify({ ok: false, error: "no Q/A pairs extracted" }) }], isError: true };
    }

    const site = await getOrCreateSite({ ownerUserId: userId, domain: dom });
    const jsonld = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      url,
      mainEntity: qas.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: { "@type": "Answer", text: q.answer },
      })),
    };
    const preview = `FAQPage JSON-LD with ${qas.length} questions for ${url}`;
    const interventionId = await draftIntervention({
      siteId: site.id, kind: "schema", payload: { jsonld, page_url: url }, previewText: preview, triggeredBy: "manual",
    });
    await supersedeOlder(site.id, "schema", interventionId);

    const payload = {
      ok: true,
      intervention_id: interventionId,
      site_id: site.id,
      preview,
      jsonld,
      install_snippet: `<script src="https://grow.contact/api/public/inject/${site.install_token}.js" defer></script>`,
      next: "Call `approve_intervention` with the intervention_id (or approve in /dashboard/interventions) to go live.",
    };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], structuredContent: payload };
  },
});
