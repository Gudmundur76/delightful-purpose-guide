// Research hub — single index of every citable artifact grow.contact
// publishes: the quarterly report, monthly citation index, data drops,
// playbooks, and the glossary. Designed to be the page a journalist or
// AI engine lands on when looking for "GEO research".
import { createFileRoute, Link } from "@tanstack/react-router";
import { PLAYBOOKS } from "@/lib/playbooks/data";
import { DATA_DROPS } from "@/lib/data-drops/data";
import { GLOSSARY } from "@/lib/glossary/data";

export const Route = createFileRoute("/research")({
  component: ResearchHub,
  head: () => ({
    meta: [
      { title: "Research — Citation Intelligence | grow.contact" },
      {
        name: "description",
        content:
          "Quarterly report, monthly citation index, data drops, playbooks, and glossary — every citable artifact on agent-readability and AI citations in one place.",
      },
      { property: "og:title", content: "Research — grow.contact" },
      {
        property: "og:description",
        content:
          "Quarterly report, monthly citation index, playbooks, data drops, glossary.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/research" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "grow.contact Research",
          description:
            "Index of reports, data drops, playbooks, and definitions on agent-readability and AI citations.",
          url: "https://grow.contact/research",
          hasPart: [
            {
              "@type": "Report",
              name: "Q2 2026 Agent-Readability Report",
              url: "https://grow.contact/report/q2-2026",
            },
            {
              "@type": "Dataset",
              name: "Citation Index",
              url: "https://grow.contact/citation-index",
            },
          ],
        }),
      },
    ],
  }),
});

function Section({
  kicker,
  title,
  blurb,
  children,
}: {
  kicker: string;
  title: string;
  blurb: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-14">
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
        // {kicker}
      </div>
      <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground max-w-2xl mb-8">{blurb}</p>
      {children}
    </section>
  );
}

function Card({
  to,
  eyebrow,
  title,
  meta,
}: {
  to: string;
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  return (
    <Link
      to={to}
      className="block border border-border bg-card/40 p-5 hover:bg-card hover:border-accent/40 transition-colors"
    >
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
        {eyebrow}
      </div>
      <div className="font-semibold leading-snug">{title}</div>
      {meta ? (
        <div className="mt-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {meta}
        </div>
      ) : null}
    </Link>
  );
}

function ResearchHub() {
  const drops = [...DATA_DROPS].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  const playbooks = [...PLAYBOOKS].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const glossary = [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <header className="mb-12">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // research / index
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            Citation intelligence research
          </h1>
          <p className="mt-4 text-base text-muted-foreground max-w-2xl">
            Everything we publish on agent-readability and AI citations: the
            quarterly report, the live citation index, monthly data drops,
            tactical playbooks, and the definitional glossary.
          </p>
        </header>

        <Section
          kicker="flagship"
          title="Quarterly report & live index"
          blurb="The two primary artifacts journalists, analysts, and AI engines cite."
        >
          <div className="grid md:grid-cols-2 gap-4">
            <Card
              to="/report/q2-2026"
              eyebrow="Report · Q2 2026"
              title="The Agent-Readability Report"
              meta="PDF + JSON-LD · methodology open"
            />
            <Card
              to="/citation-index"
              eyebrow="Live"
              title="Citation Index — who's getting cited this month"
              meta="Updated nightly · RSS available"
            />
          </div>
        </Section>

        <Section
          kicker="data drops"
          title={`Data drops (${drops.length})`}
          blurb="Single-stat findings over the live dataset. Each one is a citable artifact with a pre-formatted APA + BibTeX line."
        >
          <div className="grid md:grid-cols-2 gap-4">
            {drops.map((d) => (
              <Card
                key={d.slug}
                to="/data-drops/$slug"
                eyebrow={`${d.category} · ${d.publishedAt}`}
                title={d.title}
              />
            ))}
          </div>
          <div className="mt-6">
            <Link
              to="/data-drops"
              className="font-mono text-[11px] uppercase tracking-widest text-accent hover:underline"
            >
              All data drops →
            </Link>
          </div>
        </Section>

        <Section
          kicker="playbooks"
          title={`Playbooks (${playbooks.length})`}
          blurb="HowTo-structured tactical guides — the exact format Perplexity and Gemini lift verbatim when answering step-by-step queries."
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {playbooks.slice(0, 12).map((p) => (
              <Card
                key={p.slug}
                to="/playbooks/$slug"
                eyebrow={`${p.category} · ${p.difficulty}`}
                title={p.title}
              />
            ))}
          </div>
          <div className="mt-6">
            <Link
              to="/playbooks"
              className="font-mono text-[11px] uppercase tracking-widest text-accent hover:underline"
            >
              All {playbooks.length} playbooks →
            </Link>
          </div>
        </Section>

        <Section
          kicker="glossary"
          title={`Glossary (${glossary.length} terms)`}
          blurb="Definitional pages with DefinedTerm JSON-LD. The lookup table AI engines reach for when disambiguating 'GEO' or 'llms.txt'."
        >
          <div className="flex flex-wrap gap-2">
            {glossary.map((g) => (
              <Link
                key={g.slug}
                to="/glossary/$term"
                className="font-mono text-[11px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-accent hover:text-accent"
              >
                {g.term}
              </Link>
            ))}
          </div>
          <div className="mt-6">
            <Link
              to="/glossary"
              className="font-mono text-[11px] uppercase tracking-widest text-accent hover:underline"
            >
              Full glossary →
            </Link>
          </div>
        </Section>

        <Section
          kicker="open data"
          title="Machine-readable feeds"
          blurb="Everything above is also a JSON or RSS endpoint. Cite the URL directly — agents will resolve it."
        >
          <div className="grid md:grid-cols-2 gap-3 font-mono text-xs">
            {[
              { label: "Leaderboard JSON", href: "/data/q2-2026/leaderboard.json" },
              { label: "Stats JSON", href: "/data/q2-2026/stats.json" },
              { label: "Claims registry JSON", href: "/data/q2-2026/claims.json" },
              { label: "RSS feed", href: "/rss.xml" },
              { label: "llms.txt", href: "/llms.txt" },
              { label: "API docs", href: "/api-docs" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="border border-border bg-card/40 px-4 py-3 hover:border-accent hover:text-accent flex items-center justify-between"
              >
                <span>{l.label}</span>
                <span className="text-muted-foreground">{l.href}</span>
              </a>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
