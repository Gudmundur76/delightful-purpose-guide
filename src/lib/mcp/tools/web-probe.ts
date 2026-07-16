import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const fetchUrlTool = defineTool({
  name: "fetch_url",
  description:
    "GET an arbitrary URL and return status, headers, and first ~20KB of body. Use for verifying that a page is SSR'd, that llms.txt is served, that JSON-LD is in the HTML, etc.",
  parameters: z.object({
    url: z.string().url().max(2048),
    max_bytes: z.number().int().min(1024).max(200_000).default(20_000),
  }),
  execute: async ({ url, max_bytes }) => {
    try {
      const res = await fetch(url, {
        redirect: "follow",
        headers: { "user-agent": "grow-contact-mcp/1.0 (+https://grow.contact)" },
        signal: AbortSignal.timeout(8000),
      });
      const text = await res.text();
      const trimmed = text.length > max_bytes ? text.slice(0, max_bytes) + `\n…[truncated ${text.length - max_bytes} bytes]` : text;
      const headers: Record<string, string> = {};
      res.headers.forEach((v, k) => (headers[k] = v));
      return JSON.stringify({ ok: true, status: res.status, final_url: res.url, headers, body: trimmed }, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});

export const checkLlmsTxtTool = defineTool({
  name: "check_llms_txt",
  description:
    "Probe a domain for /llms.txt and /robots.txt. Returns presence, content-type, byte size, and a preview. Useful for vetting prospects before outreach.",
  parameters: z.object({ host: z.string().min(3).max(255) }),
  execute: async ({ host }) => {
    const clean = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const probe = async (path: string) => {
      try {
        const res = await fetch(`https://${clean}${path}`, {
          redirect: "follow",
          headers: { "user-agent": "grow-contact-mcp/1.0" },
          signal: AbortSignal.timeout(6000),
        });
        const text = await res.text();
        return {
          path,
          status: res.status,
          content_type: res.headers.get("content-type"),
          bytes: text.length,
          preview: text.slice(0, 600),
        };
      } catch (err) {
        return { path, error: err instanceof Error ? err.message : String(err) };
      }
    };
    const [llms, robots, sitemap] = await Promise.all([probe("/llms.txt"), probe("/robots.txt"), probe("/sitemap.xml")]);
    return JSON.stringify({ ok: true, host: clean, llms_txt: llms, robots_txt: robots, sitemap_xml: sitemap }, null, 2);
  },
});
