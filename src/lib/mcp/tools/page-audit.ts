import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const validateJsonLdTool = defineTool({
  name: "validate_jsonld",
  description:
    "Fetch a URL, extract every <script type=\"application/ld+json\"> block, parse them, and report which are valid JSON, their @type, and any errors. Critical for GEO audits.",
  parameters: z.object({ url: z.string().url().max(2048) }),
  execute: async ({ url }) => {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "grow-contact-mcp/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      const blocks: { index: number; ok: boolean; type?: string | string[]; error?: string; preview: string }[] = [];
      const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let m: RegExpExecArray | null;
      let i = 0;
      while ((m = re.exec(html)) !== null) {
        const raw = m[1].trim();
        try {
          const parsed = JSON.parse(raw);
          blocks.push({
            index: i++,
            ok: true,
            type: parsed["@type"] ?? parsed["@graph"]?.map((g: { "@type"?: string }) => g["@type"]),
            preview: raw.slice(0, 200),
          });
        } catch (err) {
          blocks.push({
            index: i++,
            ok: false,
            error: err instanceof Error ? err.message : String(err),
            preview: raw.slice(0, 200),
          });
        }
      }
      return JSON.stringify({ ok: true, url, status: res.status, count: blocks.length, blocks }, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});

export const extractMetaTagsTool = defineTool({
  name: "extract_meta_tags",
  description:
    "Fetch a URL and extract <title>, meta description, canonical, all og:* and twitter:* tags, h1s, and language. Useful for GEO + SEO audits.",
  parameters: z.object({ url: z.string().url().max(2048) }),
  execute: async ({ url }) => {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "grow-contact-mcp/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      const html = await res.text();
      const pick = (re: RegExp) => html.match(re)?.[1]?.trim() ?? null;
      const pickAll = (re: RegExp) => {
        const out: Record<string, string> = {};
        let m: RegExpExecArray | null;
        while ((m = re.exec(html)) !== null) out[m[1].toLowerCase()] = m[2];
        return out;
      };
      const h1s: string[] = [];
      const h1re = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
      let hm: RegExpExecArray | null;
      while ((hm = h1re.exec(html)) !== null) h1s.push(hm[1].replace(/<[^>]+>/g, "").trim());
      const result = {
        url,
        status: res.status,
        title: pick(/<title[^>]*>([\s\S]*?)<\/title>/i),
        description: pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i),
        canonical: pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i),
        lang: pick(/<html[^>]+lang=["']([^"']+)/i),
        og: pickAll(/<meta[^>]+property=["']og:([^"']+)["'][^>]+content=["']([^"']+)/gi),
        twitter: pickAll(/<meta[^>]+name=["']twitter:([^"']+)["'][^>]+content=["']([^"']+)/gi),
        h1_count: h1s.length,
        h1s: h1s.slice(0, 5),
        bytes: html.length,
      };
      return JSON.stringify({ ok: true, ...result }, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});
