import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const REQUIRED_ALLOW = ["Googlebot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot", "bingbot", "FacebookBot"];

export default defineTool({
  name: "auto_fix_robots_txt",
  title: "Draft a robots.txt fix",
  description:
    "When to use: `scan_url` reports search/citation bots blocked, the user says 'am I blocking ChatGPT/Perplexity?', or you need to confirm the site's robots.txt matches the Grow Standard §4 matrix (Googlebot, OAI-SearchBot, PerplexityBot, ClaudeBot, bingbot, FacebookBot must be allowed). Fetches the site's live robots.txt, diffs it, and if anything is missing or blocked drafts a fix as a pending intervention scoped to the signed-in user. Input: `domain` (bare host). Returns: either `{ ok: true, no_fix_needed: true, current }` when nothing needs to change, or `{ intervention_id, preview, missing[], blocked[], current, recommended, install_method }`. robots.txt cannot be injected client-side — the recommended block must be pasted server-side or delivered via the WP plugin after approval.",
  inputSchema: {
    domain: z.string().min(3).max(253).describe("Bare domain you own or manage, e.g. `example.com`."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: true },
  handler: async ({ domain }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Unauthenticated — sign in to draft interventions." }], isError: true };
    const userId = ctx.getUserId();
    if (!userId) return { content: [{ type: "text", text: "Missing user id in token." }], isError: true };

    const { normalizeDomain, fetchTextSafe, getOrCreateSite, draftIntervention, supersedeOlder } = await import("@/lib/interventions/shared.server");

    const dom = normalizeDomain(domain);
    const fetched = await fetchTextSafe(`https://${dom}/robots.txt`);
    const current = fetched.ok ? fetched.body : "User-agent: *\nAllow: /\n";

    // Diff.
    const lines = current.split("\n").map((l) => l.trim());
    const blocked: string[] = [];
    const allowed = new Set<string>();
    let cur: string | null = null;
    for (const line of lines) {
      if (/^User-agent:/i.test(line)) cur = line.split(":")[1]?.trim() ?? null;
      else if (cur && /^Disallow:\s*\/\s*$/i.test(line)) {
        if (REQUIRED_ALLOW.some((b) => b.toLowerCase() === cur!.toLowerCase()) || cur === "*") blocked.push(cur);
      } else if (cur && /^Allow:/i.test(line)) allowed.add(cur);
    }
    const missing = REQUIRED_ALLOW.filter((b) => !allowed.has(b) && !allowed.has("*"));
    const uniqueBlocked = Array.from(new Set(blocked));

    if (missing.length === 0 && uniqueBlocked.length === 0) {
      const ok = { ok: true, no_fix_needed: true, current };
      return { content: [{ type: "text", text: JSON.stringify(ok, null, 2) }], structuredContent: ok };
    }

    const recommended = current.trim() + "\n\n" +
      ["# grow.contact: AI search & citation crawlers",
       ...REQUIRED_ALLOW.flatMap((b) => [`User-agent: ${b}`, "Allow: /", ""])].join("\n");

    const site = await getOrCreateSite({ ownerUserId: userId, domain: dom });
    const preview = `robots.txt: add ${missing.length} allow rules${uniqueBlocked.length ? `, unblock ${uniqueBlocked.length}` : ""}`;
    const interventionId = await draftIntervention({
      siteId: site.id, kind: "robots_txt",
      payload: { current, recommended, missing, blocked: uniqueBlocked },
      previewText: preview, triggeredBy: "manual",
    });
    await supersedeOlder(site.id, "robots_txt", interventionId);

    const payload = {
      ok: true, intervention_id: interventionId, site_id: site.id,
      preview, missing, blocked: uniqueBlocked, current, recommended,
      install_method: "Paste `recommended` into your robots.txt server-side, or approve to have the WP plugin apply it via the robots_txt filter.",
      next: "Call `approve_intervention` with the intervention_id, then install.",
    };
    return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }], structuredContent: payload };
  },
});
