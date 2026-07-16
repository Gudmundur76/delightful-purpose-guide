// Research RSS — aggregates every citable research artifact (quarterly
// report, data drops, playbooks, glossary) so AI search engines and
// citation crawlers can subscribe to the freshness clock in one feed.
import { createFileRoute } from "@tanstack/react-router";
import { DATA_DROPS } from "@/lib/data-drops/data";
import { PLAYBOOKS } from "@/lib/playbooks/data";
import { GLOSSARY } from "@/lib/glossary/data";
import { ARCHIVE_KEY, ARCHIVE_LABEL, ARCHIVE_PUBLISHED } from "@/lib/seo/archives/q2-2026";

const BASE_URL = "https://grow.contact";
const FEED_URL = `${BASE_URL}/research/rss.xml`;

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

interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string; // ISO date
  category: string;
}

export const Route = createFileRoute("/research/rss.xml")({
  server: {
    handlers: {
      GET: async () => {
        const items: FeedItem[] = [
          {
            title: `${ARCHIVE_LABEL} Agent-Readability Report`,
            link: `${BASE_URL}/report/${ARCHIVE_KEY}`,
            description:
              "Quarterly snapshot of agent-readability scores, citation patterns, and AI-engine adoption across the tracked dataset.",
            pubDate: ARCHIVE_PUBLISHED,
            category: "Report",
          },
          ...DATA_DROPS.map((d) => ({
            title: d.title,
            link: `${BASE_URL}/data-drops/${d.slug}`,
            description: d.headline,
            pubDate: d.publishedAt,
            category: "Data Drop",
          })),
          ...PLAYBOOKS.map((p) => ({
            title: p.title,
            link: `${BASE_URL}/playbooks/${p.slug}`,
            description: p.short,
            pubDate: p.updatedAt || p.publishedAt,
            category: "Playbook",
          })),
          ...GLOSSARY.map((g) => ({
            title: `Glossary — ${g.term}`,
            link: `${BASE_URL}/glossary/${g.slug}`,
            description: g.short,
            pubDate: ARCHIVE_PUBLISHED,
            category: "Glossary",
          })),
        ].sort((a, b) => (a.pubDate < b.pubDate ? 1 : -1));

        const lastBuild = new Date(items[0]?.pubDate ?? Date.now()).toUTCString();

        const itemsXml = items
          .map((it) =>
            [
              "    <item>",
              `      <title>${escapeXml(it.title)}</title>`,
              `      <link>${it.link}</link>`,
              `      <guid isPermaLink="true">${it.link}</guid>`,
              `      <pubDate>${new Date(it.pubDate).toUTCString()}</pubDate>`,
              `      <category>${escapeXml(it.category)}</category>`,
              `      <description>${cdata(it.description)}</description>`,
              "    </item>",
            ].join("\n"),
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Grow — Research</title>
    <link>${BASE_URL}/research</link>
    <atom:link href="${FEED_URL}" rel="self" type="application/rss+xml" />
    <description>Quarterly reports, data drops, playbooks, and glossary updates on agent-readability and AI citations.</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
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
