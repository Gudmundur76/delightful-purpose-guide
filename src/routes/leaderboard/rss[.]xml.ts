// Leaderboard RSS — emits the current ranked snapshot so AI search
// engines polling for fresh ranking data can pick up changes daily.
import { createFileRoute } from "@tanstack/react-router";
import { LEADERBOARD, CATEGORY_LABELS } from "@/lib/leaderboard/entries";

const BASE_URL = "https://grow.contact";
const FEED_URL = `${BASE_URL}/leaderboard/rss.xml`;

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(s: string): string {
  return `<![CDATA[${s.replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

export const Route = createFileRoute("/leaderboard/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        // Stable per-day pubDate so feed readers de-dupe across the day
        // but still see a fresh build every 24h.
        const day = new Date().toISOString().slice(0, 10);
        const pubDate = new Date(`${day}T00:00:00Z`).toUTCString();

        const ranked = [...LEADERBOARD]
          .sort((a, b) => b.score - a.score)
          .slice(0, 50)
          .map((e, i) => ({ ...e, rank: i + 1 }));

        const itemsXml = ranked
          .map((e) => {
            const link = `${BASE_URL}/verify/${e.domain}`;
            const title = `#${e.rank} ${e.name} — ${e.score}/100 (${CATEGORY_LABELS[e.category]})`;
            const desc = `${e.name} ranks #${e.rank} on the Agent-Readability Leaderboard with a score of ${e.score}/100. Semantic ${e.semantic}/25, JSON-LD ${e.jsonLd}/20, llms.txt ${e.llmsTxt}/15, citability ${e.citability}/20, speed ${e.speed}/20.${e.note ? ` ${e.note}.` : ""}`;
            return [
              "    <item>",
              `      <title>${escapeXml(title)}</title>`,
              `      <link>${link}</link>`,
              `      <guid isPermaLink="false">${link}#${day}</guid>`,
              `      <pubDate>${pubDate}</pubDate>`,
              `      <category>${escapeXml(CATEGORY_LABELS[e.category])}</category>`,
              `      <description>${cdata(desc)}</description>`,
              "    </item>",
            ].join("\n");
          })
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Grow — Agent-Readability Leaderboard</title>
    <link>${BASE_URL}/leaderboard</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>Daily snapshot of the top 50 ranked AI companies by agent-readability score.</description>
    <language>en-us</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
${itemsXml}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "Content-Type": "application/rss+xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
