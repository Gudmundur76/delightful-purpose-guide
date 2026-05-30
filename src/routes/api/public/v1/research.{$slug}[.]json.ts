// Public JSON endpoint for a single research artifact (data drop,
// playbook, or quarterly report). Open / no API key — designed to be
// the canonical machine-readable URL AI engines hit when citing a
// research item discovered via sitemap or RSS.
import { createFileRoute } from "@tanstack/react-router";
import { CORS_HEADERS } from "@/lib/api/auth";
import { DATA_DROPS } from "@/lib/data-drops/data";
import { PLAYBOOKS } from "@/lib/playbooks/data";
import {
  ARCHIVE_KEY,
  ARCHIVE_LABEL,
  ARCHIVE_PUBLISHED,
  archiveStats,
} from "@/lib/seo/archives/q2-2026";

const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
  ...CORS_HEADERS,
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body, null, 2), { status, headers: JSON_HEADERS });
}

export const Route = createFileRoute("/api/public/v1/research/{$slug}.json")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: CORS_HEADERS }),
      GET: async ({ params }) => {
        const slug = params.slug;

        // 1. Quarterly report
        if (slug === ARCHIVE_KEY) {
          const archive = archiveStats();
          const stats = archive.stats;
          return json({
            type: "report",
            title: `${ARCHIVE_LABEL} Agent-Readability Report`,
            slug: ARCHIVE_KEY,
            published_at: ARCHIVE_PUBLISHED,
            author: "grow.contact research",
            url: `https://grow.contact/report/${ARCHIVE_KEY}`,
            stats: [
              { stat: "Tracked companies", value: stats.total, source: "Agent-Readability Leaderboard" },
              { stat: "Missing llms.txt (%)", value: stats.missing_llms_txt_pct, source: "Agent-Readability Leaderboard" },
              { stat: "Opaque sites (%)", value: stats.opaque_pct, source: "Agent-Readability Leaderboard" },
              { stat: "Weak JSON-LD (%)", value: stats.weak_jsonld_pct, source: "Agent-Readability Leaderboard" },
            ],
            methodology: "https://grow.contact/report/methodology",
            license: "CC BY 4.0",
          });
        }

        // 2. Data drop
        const drop = DATA_DROPS.find((d) => d.slug === slug);
        if (drop) {
          return json({
            type: "data_drop",
            title: drop.title,
            slug: drop.slug,
            published_at: drop.publishedAt,
            author: "grow.contact research",
            url: `https://grow.contact/data-drops/${drop.slug}`,
            content: drop.body.map((paragraph, i) => ({
              order: i + 1,
              type: "paragraph",
              text: paragraph,
            })),
            stats: drop.compute
              ? [
                  {
                    stat: drop.headline,
                    value: drop.compute().value,
                    source: drop.compute().basis,
                  },
                ]
              : [{ stat: drop.headline, value: null, source: drop.cite.pull_quote }],
            citation: drop.cite,
            methodology: "https://grow.contact/v-score",
            license: "CC BY 4.0",
          });
        }

        // 3. Playbook
        const pb = PLAYBOOKS.find((p) => p.slug === slug);
        if (pb) {
          return json({
            type: "playbook",
            title: pb.title,
            slug: pb.slug,
            published_at: pb.publishedAt,
            updated_at: pb.updatedAt,
            author: "grow.contact research",
            url: `https://grow.contact/playbooks/${pb.slug}`,
            intent: pb.intent,
            category: pb.category,
            difficulty: pb.difficulty,
            total_time: pb.totalTime,
            content: [
              { order: 0, type: "intro", text: pb.intro },
              ...pb.steps.map((s, i) => ({
                order: i + 1,
                type: "step",
                name: s.name,
                text: s.text,
              })),
            ],
            pitfalls: pb.pitfalls,
            verify: pb.verify,
            related: pb.related,
            license: "CC BY 4.0",
          });
        }

        return json({ error: "Research item not found", slug }, 404);
      },
    },
  },
});
