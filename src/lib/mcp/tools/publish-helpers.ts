import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

export const publishLlmsTxtTool = defineTool({
  name: "publish_llms_txt",
  description:
    "Validate a /llms.txt payload and return a ready-to-deploy bundle (raw content + recommended path + HTTP headers + verification probe URL). citation.is does not have FTP/SSH into client sites — this prepares the artifact for the client (or their CI) to drop in. Pair with check_llms_txt to verify post-deploy.",
  parameters: z.object({
    host: z.string().min(3).max(255),
    content: z.string().min(10).max(50_000),
  }),
  execute: async ({ host, content }) => {
    const clean = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const bytes = new TextEncoder().encode(content).length;
    const lines = content.split("\n").length;
    const hasTitle = /^#\s+\S/m.test(content);
    return JSON.stringify(
      {
        ok: true,
        host: clean,
        deploy: {
          path: "/llms.txt",
          target_url: `https://${clean}/llms.txt`,
          recommended_headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        },
        artifact: { bytes, lines, has_h1_title: hasTitle, content },
        verify_with: { tool: "check_llms_txt", args: { host: clean } },
      },
      null,
      2,
    );
  },
});

export const pushSchemaTool = defineTool({
  name: "push_schema",
  description:
    "Build a JSON-LD <script> block from a schema.org type + data and return the paste-ready HTML. Use after extract_meta_tags to fix missing structured data on a page.",
  parameters: z.object({
    host: z.string().min(3).max(255),
    type: z.string().min(2).max(80).describe("schema.org @type, e.g. Organization, Product, FAQPage"),
    data: z.record(z.string(), z.any()).describe("Schema fields excluding @context and @type"),
  }),
  execute: async ({ host, type, data }) => {
    const payload = { "@context": "https://schema.org", "@type": type, ...data };
    const json = JSON.stringify(payload, null, 2);
    const snippet = `<script type="application/ld+json">\n${json}\n</script>`;
    return JSON.stringify(
      {
        ok: true,
        host: host.replace(/^https?:\/\//, ""),
        type,
        snippet,
        placement: "Insert in <head> or end of <body>. Verify with validate_jsonld.",
        verify_with: { tool: "validate_jsonld", args: { url: `https://${host.replace(/^https?:\/\//, "")}` } },
      },
      null,
      2,
    );
  },
});
