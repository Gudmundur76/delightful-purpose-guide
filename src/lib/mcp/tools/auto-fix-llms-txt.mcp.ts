import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

export default defineTool({
  name: "auto_fix_llms_txt",
  title: "Draft llms.txt for a site",
  description:
    "When to use: `scan_url` reports the `llms` signal failing on a site the user owns, and they want a persisted, approvable fix (not just a preview — use `generate_llms_txt` for that). Discovers up to 20 public URLs via sitemap.xml (or homepage links as fallback), builds a spec-compliant llms.txt body, and drafts it as a pending intervention scoped to the signed-in user. Input: `domain` (bare host), optional `site_name` (defaults to the domain). Returns: `{ intervention_id, preview, content, install_url, install_method }`. Approve with `approve_intervention` — until then `install_url` returns nothing. Older llms_txt drafts on the same site are superseded.",
  inputSchema: {
    domain: z.string().min(3).max(253).describe("Bare domain you own or manage, e.g. `example.com`."),
    site_name: z.string().min(1).max(120).optional().describe("Optional display name for the site header. Defaults to the domain."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async ({ domain, site_name }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Unauthenticated — sign in to draft interventions." }], isError: true };
    const userId = ctx.getUserId();
    if (!userId) return { content: [{ type: "text", text: "Missing user id in token." }], isError: true };

    const { normalizeDomain, fetchTextSafe, getOrCreateSite, draftIntervention, supersedeOlder } = await import("@/lib/interventions/shared.server");

    const dom = normalizeDomain(domain);
    const sm = await fetchTextSafe(`https://${dom}/sitemap.xml`);
    let pages: string[] = [];
    if (sm.ok) {
      pages = Array.from(sm.body.matchAll(/<loc>([^<]+)<\/loc>/g)).map((m) => m[1]).slice(0, 20);
    }
    if (pages.length === 0) {
      const home = await fetchTextSafe(`https://${dom}/`);
      if (home.ok) {
        const hrefs = Array.from(home.body.matchAll(/href="(https?:\/\/[^"]+)"/g)).map((m) => m[1]);
        pages = Array.from(new Set(hrefs.filter((u) => u.includes(dom)))).slice(0, 20);
      }
    }

    const name = site_name ?? dom;
    const lines = [`# ${name}`, "", `> Auto-generated llms.txt for ${dom}`, ""];
    if (pages.length) {
      lines.push("## Pages");
      for (const url of pages) {
        const path = url.replace(/^https?:\/\/[^/]+/, "") || "/";
        lines.push(`- [${path}](${url})`);
      }
      lines.push("");
    }
    lines.push("## Site", `- Domain: https://${dom}`);
    const content = lines.join("\n");

    const site = await getOrCreateSite({ ownerUserId: userId, domain: dom });
    const preview = `llms.txt with ${pages.length} pages (${content.length} bytes)`;
    const interventionId = await draftIntervention({
      siteId: site.id, kind: "llms_txt", payload: { content, pages_count: pages.length }, previewText: preview, triggeredBy: "manual",
    });
    await supersedeOlder(site.id, "llms_txt", interventionId);

    const payload = {
      ok: true,
      intervention_id: interventionId,
      site_id: site.id,
      preview,
      content,
      install_url: `https://grow.contact/api/public/inject/${site.install_token}.llms.txt`,
      install_method: "After approval: proxy or 301 your /llms.txt to install_url, or let the WP plugin serve it virtually.",
      next: "Call `approve_intervention` with the intervention_id to make install_url live.",
    };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], structuredContent: payload };
  },
});
