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
    "Ask LLMs whether a host/brand is cited. If query is omitted, runs 3 auto-generated queries about the host. Returns per-query/per-model presence.",
  parameters: z.object({
    host: z.string().min(3).max(255).describe("Domain or brand, e.g. grow.contact"),
    query: z.string().min(3).max(500).optional().describe("Optional. If omitted, 3 default queries are run."),
    models: z
      .array(z.enum(["google/gemini-2.5-flash", "google/gemini-2.5-pro", "openai/gpt-5-mini", "openai/gpt-5"]))
      .max(4)
      .default(["google/gemini-2.5-flash", "openai/gpt-5-mini"]),
  }),
  execute: async ({ host, query, models }) => {
    const bare = host.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const queries = query
      ? [query]
      : [
          `${bare} what do they do`,
          `${bare} services and pricing`,
          bare.includes("grow.contact") ? "best agent-native website agency" : `best alternatives to ${bare}`,
        ];
    const needles = [host, bare, bare.split(".")[0]].map((n) => n.toLowerCase()).filter(Boolean);

    const citations = await Promise.all(
      queries.map(async (q) => {
        const perModel = await Promise.all(
          models.map(async (model) => {
            try {
              const answer = await askModel(
                model,
                "You answer factually using your training knowledge. Cite specific brands or websites when relevant. Be concise.",
                q,
              );
              const lower = answer.toLowerCase();
              const cited = needles.some((n) => lower.includes(n));
              return { model, cited, excerpt: answer.slice(0, 280) };
            } catch (err) {
              return { model, cited: false, error: err instanceof Error ? err.message : String(err) };
            }
          }),
        );
        const cited = perModel.some((r) => r.cited);
        return {
          query: q,
          cited,
          source: perModel.find((r) => r.cited)?.model ?? null,
          excerpt: perModel.find((r) => r.cited)?.excerpt ?? perModel[0]?.excerpt ?? "",
          per_model: perModel,
        };
      }),
    );
    return JSON.stringify({ ok: true, host, citations }, null, 2);
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
