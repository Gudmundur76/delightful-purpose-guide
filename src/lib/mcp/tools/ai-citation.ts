import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function askModel(model: string, system: string, user: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${model} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

export const checkAiCitationTool = defineTool({
  name: "check_ai_citation",
  description:
    "Ask multiple LLMs a question and check whether a target host/brand is mentioned in the answer. The only true GEO success metric — does the AI actually cite this domain when asked a relevant query? Returns per-model presence, exact mentions, and accuracy notes.",
  parameters: z.object({
    host: z.string().min(3).max(255).describe("Domain or brand to look for, e.g. grow.contact or Grow"),
    query: z.string().min(3).max(500).describe("Question to ask the LLMs"),
    models: z
      .array(z.enum(["google/gemini-2.5-flash", "google/gemini-2.5-pro", "openai/gpt-5-mini", "openai/gpt-5"]))
      .max(4)
      .default(["google/gemini-2.5-flash", "openai/gpt-5-mini"]),
  }),
  execute: async ({ host, query, models }) => {
    const needles = [host, host.replace(/^https?:\/\//, "").replace(/^www\./, ""), host.split(".")[0]]
      .map((n) => n.toLowerCase())
      .filter(Boolean);
    const results = await Promise.all(
      models.map(async (model) => {
        try {
          const answer = await askModel(
            model,
            "You answer factually using your training knowledge. Cite specific brands or websites when relevant. Be concise.",
            query,
          );
          const lower = answer.toLowerCase();
          const mentioned = needles.some((n) => lower.includes(n));
          const matches = needles.filter((n) => lower.includes(n));
          return { model, mentioned, matches, answer };
        } catch (err) {
          return { model, error: err instanceof Error ? err.message : String(err) };
        }
      }),
    );
    const cited = results.filter((r) => "mentioned" in r && r.mentioned).length;
    return JSON.stringify(
      { ok: true, host, query, citation_rate: `${cited}/${models.length}`, results },
      null,
      2,
    );
  },
});

export const getCitationSourcesTool = defineTool({
  name: "get_citation_sources",
  description:
    "Ask an LLM to enumerate the third-party sources (Reddit, Medium, docs, news) it associates with a domain. Surfaces the offsite layer that drives AI visibility.",
  parameters: z.object({ host: z.string().min(3).max(255) }),
  execute: async ({ host }) => {
    try {
      const answer = await askModel(
        "google/gemini-2.5-pro",
        "You list third-party web sources (Reddit threads, Medium posts, news articles, documentation, GitHub repos, podcasts) that you associate with a brand/domain. Output STRICT JSON: { sources: [{ type, title, url?, why }] }. No prose.",
        `Domain: ${host}. List up to 12 third-party sources you've seen reference this domain or brand.`,
      );
      const cleaned = answer.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      try {
        return JSON.stringify({ ok: true, host, ...JSON.parse(cleaned) }, null, 2);
      } catch {
        return JSON.stringify({ ok: true, host, raw: cleaned });
      }
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});
