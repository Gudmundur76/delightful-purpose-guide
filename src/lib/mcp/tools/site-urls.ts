import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

const ORIGIN = "https://grow.contact";

export const siteUrlsTool = defineTool({
  name: "get_site_urls",
  description:
    "Return canonical URLs for grow.contact surfaces: badge SVG, public widget, verify page, leaderboard JSON, OpenAPI spec, llms.txt, sitemap, RSS — for any given host or scan id.",
  parameters: z.object({
    host: z.string().min(3).max(255).optional(),
    scan_id: z.string().uuid().optional(),
  }),
  execute: async ({ host, scan_id }) => {
    const clean = host?.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return JSON.stringify(
      {
        ok: true,
        site: {
          home: ORIGIN,
          check: `${ORIGIN}/check${clean ? `?u=${encodeURIComponent(clean)}` : ""}`,
          leaderboard: `${ORIGIN}/leaderboard`,
          leaderboard_json: `${ORIGIN}/api/public/leaderboard.json`,
          openapi: `${ORIGIN}/api/public/v1/openapi.json`,
          api_root: `${ORIGIN}/api/public/v1`,
          llms_txt: `${ORIGIN}/llms.txt`,
          sitemap: `${ORIGIN}/sitemap.xml`,
          rss: `${ORIGIN}/rss.xml`,
          blog_rss: `${ORIGIN}/blog/rss.xml`,
          mcp_endpoint: `${ORIGIN}/api/public/mcp`,
        },
        host: clean
          ? {
              verify: `${ORIGIN}/verify/${clean}`,
              badge_svg: `${ORIGIN}/api/public/widget/badge.svg?u=${encodeURIComponent(clean)}`,
              embed_js: `${ORIGIN}/api/public/widget/embed.js?u=${encodeURIComponent(clean)}`,
            }
          : null,
        scan: scan_id
          ? {
              badge_svg: `${ORIGIN}/badge/${scan_id}.svg`,
              verify_page: `${ORIGIN}/verify/${scan_id}`,
            }
          : null,
      },
      null,
      2,
    );
  },
});
