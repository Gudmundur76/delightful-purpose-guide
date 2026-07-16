import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const generateBadgeEmbedTool = defineTool({
  name: "generate_badge_embed",
  description:
    "Return paste-ready embed snippets (HTML, Markdown, React) for the citation.is 'Agent-Ready' badge for a given host or scan id. Pulls latest score if not specified.",
  parameters: z.object({
    host: z.string().min(3).max(255).optional(),
    scan_id: z.string().uuid().optional(),
  }),
  execute: async ({ host, scan_id }) => {
    let id = scan_id;
    let resolvedHost = host;
    let score: number | null = null;
    if (scan_id) {
      const { data } = await supabaseAdmin.from("scans").select("id, host, overall").eq("id", scan_id).maybeSingle();
      if (data) {
        resolvedHost = (data as { host: string }).host;
        score = (data as { overall: number }).overall;
      }
    } else if (host) {
      const clean = host.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();
      const { data } = await supabaseAdmin
        .from("scans")
        .select("id, host, overall")
        .eq("host", clean)
        .order("scanned_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        id = (data as { id: string }).id;
        resolvedHost = (data as { host: string }).host;
        score = (data as { overall: number }).overall;
      }
    } else {
      return JSON.stringify({ ok: false, error: "Provide host or scan_id" });
    }
    if (!id) return JSON.stringify({ ok: false, error: "No scan found for host" });
    const badgeUrl = `https://citation.is/badge/${id}.svg`;
    const linkUrl = `https://citation.is/verify/${id}`;
    return JSON.stringify(
      {
        ok: true,
        host: resolvedHost,
        score,
        scan_id: id,
        embeds: {
          html: `<a href="${linkUrl}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="Agent-Ready score" /></a>`,
          markdown: `[![Agent-Ready](${badgeUrl})](${linkUrl})`,
          react: `<a href="${linkUrl}" target="_blank" rel="noopener"><img src="${badgeUrl}" alt="Agent-Ready score" /></a>`,
        },
      },
      null,
      2,
    );
  },
});

export const submitToLeaderboardTool = defineTool({
  name: "submit_to_leaderboard",
  description:
    "Register a host for inclusion in the public leaderboard. Runs a fresh scan, persists it, and returns the entry payload to merge into src/lib/leaderboard/entries.ts on next deploy.",
  parameters: z.object({
    host: z.string().min(3).max(255),
    name: z.string().min(1).max(120),
    category: z.string().max(80).default("general"),
  }),
  execute: async ({ host, name, category }) => {
    const { scanUrl } = await import("@/lib/check/scan.functions");
    const clean = host.replace(/^https?:\/\//, "").replace(/^www\./, "").toLowerCase();
    try {
      const result = (await scanUrl({ data: { url: clean, source: "leaderboard-submit" } })) as {
        scores?: { overall?: number };
        overall?: number;
      };
      const overall = result.scores?.overall ?? result.overall ?? null;
      const entry = { name, host: clean, category, overall, submitted_at: new Date().toISOString() };
      return JSON.stringify({ ok: true, entry, note: "Append to src/lib/leaderboard/entries.ts; scan persisted." }, null, 2);
    } catch (err) {
      return JSON.stringify({ ok: false, error: err instanceof Error ? err.message : String(err) });
    }
  },
});

export const wordpressPluginConfigTool = defineTool({
  name: "create_wordpress_plugin_config",
  description:
    "Generate the config snippet for the citation.is / Hermes WordPress plugin to install on a client site. Returns wp-config-style PHP and a JSON variant.",
  parameters: z.object({
    host: z.string().min(3).max(255),
    api_key: z.string().min(8).max(200).describe("Public API key for the client"),
    features: z
      .array(z.enum(["llms_txt", "jsonld_inject", "badge", "auto_scan"]))
      .default(["llms_txt", "jsonld_inject", "badge"]),
  }),
  execute: async ({ host, api_key, features }) => {
    const clean = host.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const json = {
      grow_contact: {
        host: clean,
        api_key,
        endpoint: "https://citation.is/api/public/v1",
        features,
        version: "1.0",
      },
    };
    const php = `<?php
// Add to wp-config.php (above the "stop editing" line)
define('GROW_CONTACT_HOST', '${clean}');
define('GROW_CONTACT_API_KEY', '${api_key}');
define('GROW_CONTACT_ENDPOINT', 'https://citation.is/api/public/v1');
define('GROW_CONTACT_FEATURES', '${features.join(",")}');
`;
    return JSON.stringify({ ok: true, host: clean, json_config: json, php_config: php, install: "Upload the Hermes plugin .zip, activate, then paste the PHP block into wp-config.php." }, null, 2);
  },
});
