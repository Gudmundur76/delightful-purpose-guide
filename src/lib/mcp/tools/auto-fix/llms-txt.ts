// auto_fix_llms_txt — generates an llms.txt body and drafts it as an intervention.
import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { draftIntervention, fetchTextSafe, getOrCreateSite, normalizeDomain, supersedeOlder } from "@/lib/interventions/shared.server";

async function discoverPages(domain: string): Promise<string[]> {
  // Try sitemap.xml, then fall back to homepage links.
  const sm = await fetchTextSafe(`https://${domain}/sitemap.xml`);
  if (sm.ok) {
    const urls = Array.from(sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]);
    if (urls.length) return urls.slice(0, 20);
  }
  const home = await fetchTextSafe(`https://${domain}/`);
  if (!home.ok) return [];
  const hrefs = Array.from(home.body.matchAll(/href="(https?:\/\/[^"]+)"/g)).map((m) => m[1]);
  return Array.from(new Set(hrefs.filter((u) => u.includes(domain)))).slice(0, 20);
}

function buildLlmsTxt(siteName: string, domain: string, pages: string[]): string {
  const lines = [`# ${siteName}`, "", `> Auto-generated llms.txt for ${domain}`, ""];
  if (pages.length) {
    lines.push("## Pages");
    for (const url of pages) {
      const path = url.replace(/^https?:\/\/[^/]+/, "") || "/";
      lines.push(`- [${path}](${url})`);
    }
    lines.push("");
  }
  lines.push("## Site", `- Domain: https://${domain}`);
  return lines.join("\n");
}

export const autoFixLlmsTxtTool = defineTool({
  name: "auto_fix_llms_txt",
  description: "Discovers a site's key pages, generates an llms.txt body, and drafts it as an intervention for approval.",
  parameters: z.object({
    domain: z.string().min(3).max(255),
    site_name: z.string().min(1).max(120).optional(),
    owner_user_id: z.string().uuid().optional(),
  }),
  execute: async ({ domain, site_name, owner_user_id }) => {
    const dom = normalizeDomain(domain);
    const pages = await discoverPages(dom);
    const content = buildLlmsTxt(site_name ?? dom, dom, pages);
    const site = await getOrCreateSite({ ownerUserId: owner_user_id ?? null, domain: dom });
    const preview = `llms.txt with ${pages.length} pages (${content.length} bytes)`;
    const interventionId = await draftIntervention({
      siteId: site.id, kind: "llms_txt", payload: { content, pages_count: pages.length }, previewText: preview, triggeredBy: "manual",
    });
    await supersedeOlder(site.id, "llms_txt", interventionId);

    return JSON.stringify({
      ok: true,
      intervention_id: interventionId,
      site_id: site.id,
      preview,
      content,
      install_url: `https://citation.is/api/public/inject/${site.install_token}.llms.txt`,
      install_method: "Proxy your /llms.txt to the install_url, or have the WP plugin serve it virtually.",
    }, null, 2);
  },
});
