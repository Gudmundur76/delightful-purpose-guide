import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const generateLlmsTxtTool = defineTool({
  name: "generate_llms_txt",
  description:
    "Generate a /llms.txt file for a site from a name, tagline, and key URLs. Returns paste-ready markdown text following the llms.txt convention.",
  parameters: z.object({
    site_name: z.string().min(1).max(120),
    tagline: z.string().min(1).max(280),
    domain: z.string().min(3).max(255),
    pages: z
      .array(z.object({ title: z.string().max(120), url: z.string().url().max(2048), summary: z.string().max(280).optional() }))
      .max(40)
      .default([]),
    pricing: z.array(z.object({ tier: z.string().max(80), price: z.string().max(80), includes: z.string().max(280) })).max(10).default([]),
    contact_email: z.string().email().optional(),
  }),
  execute: async ({ site_name, tagline, domain, pages, pricing, contact_email }) => {
    const lines: string[] = [];
    lines.push(`# ${site_name}`, "");
    lines.push(`> ${tagline}`, "");
    if (pricing.length) {
      lines.push("## Pricing");
      for (const p of pricing) lines.push(`- ${p.tier} — ${p.price} — ${p.includes}`);
      lines.push("");
    }
    if (pages.length) {
      lines.push("## Pages");
      for (const p of pages) lines.push(`- [${p.title}](${p.url})${p.summary ? `: ${p.summary}` : ""}`);
      lines.push("");
    }
    lines.push("## Site");
    lines.push(`- Domain: https://${domain.replace(/^https?:\/\//, "")}`);
    if (contact_email) lines.push(`- Contact: ${contact_email}`);
    const content = lines.join("\n");
    return JSON.stringify({ ok: true, bytes: content.length, content }, null, 2);
  },
});
