import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function complete(model: string, system: string, user: string, max_tokens = 1200) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      max_tokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

export const aiCompleteWithContextTool = defineTool({
  name: "ai_complete_with_context",
  description:
    "Reason over citation.is's own data: pulls recent scans, leads, orders and (optionally) a target host's trend, then runs an LLM with that context. Use for 'what should I do about X?' style questions where the agent should think with the data, not just generate.",
  parameters: z.object({
    prompt: z.string().min(5).max(2000),
    host: z.string().max(255).optional(),
    include: z
      .array(z.enum(["recent_scans", "recent_leads", "recent_orders", "host_trend"]))
      .default(["recent_scans", "recent_leads"]),
    model: z.enum(["google/gemini-2.5-pro", "google/gemini-2.5-flash", "openai/gpt-5", "openai/gpt-5-mini"]).default("google/gemini-2.5-pro"),
  }),
  execute: async ({ prompt, host, include, model }) => {
    const ctx: Record<string, unknown> = {};
    if (include.includes("recent_scans")) {
      const { data } = await supabaseAdmin
        .from("scans")
        .select("host, overall, scanned_at")
        .order("scanned_at", { ascending: false })
        .limit(20);
      ctx.recent_scans = data;
    }
    if (include.includes("recent_leads")) {
      const { data } = await supabaseAdmin
        .from("leads")
        .select("email, budget_tier, qualification_tier, qualification_score, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      ctx.recent_leads = data;
    }
    if (include.includes("recent_orders")) {
      const { data } = await supabaseAdmin
        .from("orders")
        .select("customer_email, total_cents, currency, status, created_at")
        .order("created_at", { ascending: false })
        .limit(20);
      ctx.recent_orders = data;
    }
    if (include.includes("host_trend") && host) {
      const clean = host.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();
      const since = new Date(Date.now() - 90 * 86400000).toISOString();
      const { data } = await supabaseAdmin
        .from("scans")
        .select("scanned_at, overall")
        .eq("host", clean)
        .gte("scanned_at", since)
        .order("scanned_at", { ascending: true });
      ctx.host_trend = { host: clean, points: data };
    }
    const system =
      "You are an analyst for citation.is (a GEO consultancy). Reason over the JSON context provided. Cite specific rows when making claims. Be concise, direct, opinionated.";
    const user = `Context (JSON):\n${JSON.stringify(ctx).slice(0, 12_000)}\n\nQuestion: ${prompt}`;
    try {
      const answer = await complete(model, system, user, 1600);
      return JSON.stringify({ ok: true, model, context_keys: Object.keys(ctx), answer }, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});
