import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getAllDataDrops } from "@/lib/data-drops/data";

const PAGE_URL = "https://grow.contact/data-drops";

export const Route = createFileRoute("/data-drops")({
  component: DataDropsIndex,
  loader: () => ({ drops: getAllDataDrops() }),
  head: ({ loaderData }) => {
    const count = loaderData?.drops.length ?? 0;
    return {
      meta: [
        { title: "Data Drops — Monthly Agent-Readability Findings | Grow" },
        { name: "description", content: `Monthly single-stat findings from the open Agent Readability Leaderboard. ${count} drops published. Citable, CC BY 4.0, RSS-enabled.` },
        { property: "og:title", content: "Data Drops — Monthly Agent-Readability Findings" },
        { property: "og:description", content: "One stat. One chart. One methodology link. Monthly. CC BY 4.0." },
        { property: "og:url", content: PAGE_URL },
      ],
      links: [{ rel: "canonical", href: PAGE_URL }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Data Drops",
            url: PAGE_URL,
            description: "Monthly single-stat findings on agent-readability across the AI industry.",
            isPartOf: { "@type": "WebSite", url: "https://grow.contact" },
          }),
        },
      ],
    };
  },
});

function DataDropsIndex() {
  const { drops } = Route.useLoaderData();
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-accent">Data Drops</span>
        </nav>

        <header className="mb-10 pb-6 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">// Monthly Findings</p>
          <h1 className="text-4xl font-bold mb-4">Data drops</h1>
          <p className="text-lg text-muted-foreground">
            One stat. One methodology link. One copy-paste citation. Published
            monthly between quarterly reports. Every drop is derived from the
            open Agent Readability Leaderboard.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-mono">
            <Link to="/report/q2-2026" className="border border-border px-3 py-1.5 hover:border-accent">Quarterly report →</Link>
            <Link to="/report/methodology" className="border border-border px-3 py-1.5 hover:border-accent">Methodology →</Link>
            <a href="/rss.xml" className="border border-border px-3 py-1.5 hover:border-accent">RSS feed →</a>
          </div>
        </header>

        <ul className="space-y-6">
          {drops.map((d: ReturnType<typeof getAllDataDrops>[number]) => (
            <li key={d.slug} className="border border-border bg-card p-6">
              <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                // {d.publishedAt} · {d.category}
              </p>
              <h2 className="text-xl font-bold mb-2">
                <Link to="/data-drops/$slug" params={{ slug: d.slug }} className="hover:text-accent">
                  {d.title}
                </Link>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">{d.headline}</p>
              <Link to="/data-drops/$slug" params={{ slug: d.slug }} className="font-mono text-xs text-accent hover:underline">
                Read drop →
              </Link>
            </li>
          ))}
        </ul>


      </main>
      <SiteFooter />
    </div>
  );
}
