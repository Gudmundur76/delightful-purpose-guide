// auto_fix_robots_txt — diffs the current robots.txt against the grow-standard §4 matrix and drafts a fix.
import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { draftIntervention, fetchTextSafe, getOrCreateSite, normalizeDomain, supersedeOlder } from "@/lib/interventions/shared.server";

// Search/citation bots that MUST be allowed per grow-standard §4.
const REQUIRED_ALLOW = ["Googlebot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot", "bingbot", "FacebookBot"];

function diffBots(current: string): { missing: string[]; blocked: string[] } {
  const lines = current.split("\n").map((l) => l.trim());
  const blocked: string[] = [];
  const allowed = new Set<string>();
  let currentAgent: string | null = null;
  for (const line of lines) {
    if (/^User-agent:/i.test(line)) {
      currentAgent = line.split(":")[1]?.trim() ?? null;
    } else if (currentAgent && /^Disallow:\s*\/\s*$/i.test(line)) {
      if (REQUIRED_ALLOW.some((b) => b.toLowerCase() === currentAgent!.toLowerCase()) || currentAgent === "*") {
        blocked.push(currentAgent);
      }
    } else if (currentAgent && /^Allow:/i.test(line)) {
      allowed.add(currentAgent);
    }
  }
  const missing = REQUIRED_ALLOW.filter((b) => !allowed.has(b) && !allowed.has("*"));
  return { missing, blocked: Array.from(new Set(blocked)) };
}

function buildRecommended(current: string): string {
  const block = [
    "",
    "# grow.contact: AI search & citation crawlers",
    ...REQUIRED_ALLOW.flatMap((b) => [`User-agent: ${b}`, "Allow: /", ""]),
  ].join("\n");
  return current.trim() + "\n" + block;
}

export const autoFixRobotsTxtTool = defineTool({
  name: "auto_fix_robots_txt",
  description: "Fetches a site's robots.txt, diffs it against the grow-standard required-allow matrix (Googlebot, OAI-SearchBot, PerplexityBot, ClaudeBot, bingbot, FacebookBot), and drafts a fix.",
  parameters: z.object({
    domain: z.string().min(3).max(255),
    owner_user_id: z.string().uuid().optional(),
  }),
  execute: async ({ domain, owner_user_id }) => {
    const dom = normalizeDomain(domain);
    const fetched = await fetchTextSafe(`https://${dom}/robots.txt`);
    const current = fetched.ok ? fetched.body : "User-agent: *\nAllow: /\n";
    const { missing, blocked } = diffBots(current);

    if (missing.length === 0 && blocked.length === 0) {
      return JSON.stringify({ ok: true, no_fix_needed: true, current }, null, 2);
    }

    const recommended = buildRecommended(current);
    const site = await getOrCreateSite({ ownerUserId: owner_user_id ?? null, domain: dom });
    const preview = `robots.txt fix: add ${missing.length} missing allow rules${blocked.length ? `, unblock ${blocked.length}` : ""}`;
    const interventionId = await draftIntervention({
      siteId: site.id,
      kind: "robots_txt",
      payload: { current, recommended, missing, blocked },
      previewText: preview,
      triggeredBy: "manual",
    });
    await supersedeOlder(site.id, "robots_txt", interventionId);

    return JSON.stringify({
      ok: true,
      intervention_id: interventionId,
      site_id: site.id,
      preview,
      missing,
      blocked,
      current,
      recommended,
      install_method: "robots.txt cannot be injected client-side. Use the WP plugin, or paste the recommended block into your robots.txt manually.",
    }, null, 2);
  },
});
