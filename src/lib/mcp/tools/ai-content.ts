import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

const MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-pro",
  "google/gemini-2.5-flash-lite",
  "openai/gpt-5-mini",
  "openai/gpt-5",
  "openai/gpt-5-nano",
] as const;

export const aiCompleteTool = defineTool({
  name: "ai_complete",
  description:
    "Generate text via the Lovable AI Gateway (no extra API key required). Use for content drafts, summaries, tagline ideas. Returns the assistant message.",
  parameters: z.object({
    prompt: z.string().min(1).max(8000),
    system: z.string().max(2000).optional(),
    model: z.enum(MODELS).default("google/gemini-2.5-flash"),
    max_tokens: z.number().int().min(16).max(4000).default(800),
  }),
  execute: async ({ prompt, system, model, max_tokens }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return JSON.stringify({ ok: false, error: "LOVABLE_API_KEY not configured" });
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          max_tokens,
          messages: [
            ...(system ? [{ role: "system", content: system }] : []),
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        return JSON.stringify({ ok: false, status: res.status, error: text.slice(0, 500) });
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const content = data.choices?.[0]?.message?.content ?? "";
      return JSON.stringify({ ok: true, model, content }, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});

export const draftBlogPostTool = defineTool({
  name: "draft_blog_post",
  description:
    "Generate a long-form blog post draft (markdown-ish, ~700-1200 words) on a topic, tuned for grow.contact's GEO/AI-readability voice. Returns title, description, tags, body — paste-ready for src/lib/blog/posts.ts.",
  parameters: z.object({
    topic: z.string().min(3).max(300),
    target_keywords: z.array(z.string().max(80)).max(8).default([]),
  }),
  execute: async ({ topic, target_keywords }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return JSON.stringify({ ok: false, error: "LOVABLE_API_KEY not configured" });
    const system =
      "You write for grow.contact, a GEO (Generative Engine Optimization) consultancy. Voice: direct, technical, opinionated, no marketing fluff. Output STRICT JSON only — no markdown fence, no preface — with keys: title (string, <=70 chars), description (string, <=160 chars), tags (string[] of 3-5 lowercase short phrases), body (string, 700-1200 words, plain text with '## ' headings and '- ' lists, escape newlines as \\n).";
    const user = `Topic: ${topic}\nTarget keywords: ${target_keywords.join(", ") || "(none)"}\nReturn JSON only.`;
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          max_tokens: 3500,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!res.ok) return JSON.stringify({ ok: false, status: res.status, error: (await res.text()).slice(0, 500) });
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = data.choices?.[0]?.message?.content ?? "";
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      try {
        const parsed = JSON.parse(cleaned);
        return JSON.stringify({ ok: true, draft: parsed }, null, 2);
      } catch {
        return JSON.stringify({ ok: true, raw: cleaned });
      }
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});
