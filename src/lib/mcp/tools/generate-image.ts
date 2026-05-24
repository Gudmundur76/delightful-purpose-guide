import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const generateImageTool = defineTool({
  name: "generate_image",
  description:
    "Generate an image via Lovable AI Gateway (Gemini image models). Returns base64 PNG data URL. Use for hero art, og:image, blog covers.",
  parameters: z.object({
    prompt: z.string().min(3).max(2000),
    model: z
      .enum(["google/gemini-2.5-flash-image", "google/gemini-3.1-flash-image-preview", "google/gemini-3-pro-image-preview"])
      .default("google/gemini-2.5-flash-image"),
  }),
  execute: async ({ prompt, model }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return JSON.stringify({ ok: false, error: "LOVABLE_API_KEY not configured" });
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          modalities: ["image", "text"],
        }),
      });
      if (!res.ok) return JSON.stringify({ ok: false, status: res.status, error: (await res.text()).slice(0, 500) });
      const data = (await res.json()) as {
        choices?: { message?: { images?: { image_url?: { url?: string } }[]; content?: string } }[];
      };
      const url = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      return JSON.stringify({ ok: true, model, image_data_url: url ?? null, note: url ? null : "No image returned" }, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});
