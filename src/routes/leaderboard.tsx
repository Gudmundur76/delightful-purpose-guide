import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { CitationSnippet } from "@/components/CitationSnippet";
import {
  getCitationIndex,
  type CitationIndexRow,
} from "@/lib/leaderboard/companies.functions";

const CATEGORY_LABELS: Record<string, string> = {
  infra: "Infrastructure",
  models: "Models",
  agents: "Agents",
  devtools: "Dev Tools",
  data: "Data",
  security: "Security",
  robotics: "Robotics",
  biotech: "Biotech",
};

const SORT_KEYS = [
  "rank",
  "name",
  "category",
  "overall_ccs",
  "citation_probability",
  "total_citations",
  "perplexity_share",
  "chatgpt_share",
  "claude_share",
  "google_aio_share",
] as const;
type SortKey = (typeof SORT_KEYS)[number];

const searchSchema = z.object({
  cat: z.string().catch("all"),
  sort: z.enum(SORT_KEYS).catch("citation_probability"),
  dir: z.enum(["asc", "desc"]).catch("desc"),
});

const citationIndexQuery = queryOptions({
  queryKey: ["citation-index"],
  queryFn: () => getCitationIndex(),
});

export const Route = createFileRoute("/leaderboard")({
  validateSearch: searchSchema,
  loader: ({ context }) => context.queryClient.ensureQueryData(citationIndexQuery),
  component: LeaderboardPage,
  head: () => ({
    meta: [
      { title: "Citation Intelligence Index — Who Gets Cited By AI | grow.contact" },
      {
        name: "description",
        content:
          "Live ranking of AI companies by Citation Probability across Perplexity, ChatGPT, Claude, and Google AI Overviews. Sortable, filterable, open dataset.",
      },
      { property: "og:title", content: "Citation Intelligence Index — Who Gets Cited By AI" },
      {
        property: "og:description",
        content:
          "The Crunchbase of the AI citation economy. Sortable index of AI companies by Citation Probability, CCS, and platform-by-platform share of voice.",
      },
      { property: "og:url", content: "https://grow.contact/leaderboard" },
      ...ogImageMeta({
        title: "Citation Intelligence Index — Who Gets Cited By AI",
        kicker: "grow.contact",
        sub: "Live ranking of AI companies by Citation Probability across Perplexity, ChatGPT, Claude, and Google AI Overviews.",
      }),
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/leaderboard" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Dataset",
          name: "Citation Intelligence Index",
          description:
            "Live benchmark of AI companies scored on Citation Probability and how often they appear in ChatGPT, Perplexity, Claude, and Google AI Overviews.",
          url: "https://grow.contact/leaderboard",
          license: "https://creativecommons.org/licenses/by/4.0/",
          creator: { "@type": "Organization", name: "grow.contact", url: "https://grow.contact" },
          distribution: [
            {
              "@type": "DataDownload",
              encodingFormat: "application/json",
              contentUrl: "https://grow.contact/api/public/leaderboard.json",
            },
          ],
          variableMeasured: [
            "Citation Probability",
            "Canonical Citation Score",
            "Perplexity share",
            "ChatGPT share",
            "Claude share",
            "Google AIO share",
          ],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is the Citation Intelligence Index?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "A live ranking of AI companies by how often they are cited by Perplexity, ChatGPT, Claude, and Google AI Overviews. Each company gets a Citation Probability score (0–100) and a Canonical Citation Score (CCS) covering canonicity, precedent, authority, verifiability, commentary, and information gain.",
              },
            },
            {
              "@type": "Question",
              name: "How often is the index updated?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Scores recompute as new citations are ingested. The headline table shows the latest snapshot per company, with a 30-day citation roll-up and a stable/rising/falling volatility badge.",
              },
            },
            {
              "@type": "Question",
              name: "Can I download the dataset?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. The full index is available at /api/public/leaderboard.json under CC BY 4.0 attribution.",
              },
            },
          ],
        }),
      },
    ],
  }),
});

function tierForCCS(score: number) {
  if (score >= 85) return { label: "AGENT-NATIVE", className: "text-accent border-accent" };
  if (score >= 70) return { label: "READABLE", className: "text-foreground border-foreground/40" };
  if (score >= 55) return { label: "PARTIAL", className: "text-muted-foreground border-border" };
  return { label: "OPAQUE", className: "text-destructive border-destructive/60" };
}

function volatilityBadge(v: CitationIndexRow["volatility"]) {
  if (v === "rising") return { label: "↑ RISING", className: "text-accent border-accent/60" };
  if (v === "falling") return { label: "↓ FALLING", className: "text-destructive border-destructive/60" };
  return { label: "→ STABLE", className: "text-muted-foreground border-border" };
}

function LeaderboardPage() {
  const { cat, sort, dir } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { data } = useSuspenseQuery(citationIndexQuery);
  const allRows = data.rows;

  const [query, setQuery] = useState("");
  const [compare, setCompare] = useState<string[]>([]);

  const categories = useMemo(() => {
    const set = new Set(allRows.map((r) => r.category));
    return Array.from(set).sort();
  }, [allRows]);

  const filtered = useMemo(() => {
    let rows = allRows;
    if (cat !== "all") rows = rows.filter((r) => r.category === cat);
    const q = query.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.domain.toLowerCase().includes(q),
      );
    }
    const ranked = [...rows].map((r, i) => ({ ...r, rank: i + 1 }));
    ranked.sort((a, b) => {
      const av = (a as Record<string, unknown>)[sort];
      const bv = (b as Record<string, unknown>)[sort];
      let cmp = 0;
      if (typeof av === "number" && typeof bv === "number") cmp = av - bv;
      else cmp = String(av ?? "").localeCompare(String(bv ?? ""));
      return dir === "asc" ? cmp : -cmp;
    });
    return ranked;
  }, [allRows, cat, query, sort, dir]);

  const avgCCS = Math.round(
    filtered.reduce((s, r) => s + r.overall_ccs, 0) / Math.max(1, filtered.length),
  );
  const avgProb = Math.round(
    filtered.reduce((s, r) => s + r.citation_probability, 0) / Math.max(1, filtered.length),
  );
  const totalCites = filtered.reduce((s, r) => s + r.total_citations, 0);
  const rising = filtered.filter((r) => r.volatility === "rising").length;

  const counts: Record<string, number> = { all: allRows.length };
  for (const c of categories) counts[c] = allRows.filter((r) => r.category === c).length;

  function toggleSort(key: SortKey) {
    if (sort === key) {
      navigate({ search: (s) => ({ ...s, dir: dir === "asc" ? "desc" : "asc" }) });
    } else {
      navigate({ search: (s) => ({ ...s, sort: key, dir: "desc" }) });
    }
  }

  function toggleCompare(domain: string) {
    setCompare((cur) => {
      if (cur.includes(domain)) return cur.filter((d) => d !== domain);
      if (cur.length >= 4) return cur;
      return [...cur, domain];
    });
  }

  function downloadCSV() {
    const header = [
      "rank",
      "name",
      "domain",
      "category",
      "ccs",
      "citation_probability",
      "total_citations_30d",
      "perplexity_share",
      "chatgpt_share",
      "claude_share",
      "google_aio_share",
      "volatility",
    ].join(",");
    const lines = filtered.map((r) =>
      [
        r.rank,
        JSON.stringify(r.name),
        r.domain,
        r.category,
        r.overall_ccs,
        r.citation_probability,
        r.total_citations,
        r.perplexity_share,
        r.chatgpt_share,
        r.claude_share,
        r.google_aio_share,
        r.volatility,
      ].join(","),
    );
    const blob = new Blob([header + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "citation-intelligence-index.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
            <p className="font-mono text-accent text-xs mb-6 uppercase tracking-[0.2em]">
              // Citation Intelligence Index · live dataset · {allRows.length} companies tracked
            </p>
            <h1 className="text-4xl md:text-7xl font-extrabold tracking-tighter uppercase leading-[0.9]">
              Who gets cited
              <br />
              by ChatGPT?
            </h1>
            <p className="mt-8 max-w-2xl text-muted-foreground text-lg">
              The Citation Intelligence Index ranks AI companies by{" "}
              <strong className="text-foreground">Citation Probability</strong> — the live
              odds a Perplexity, ChatGPT, Claude, or Google AI Overviews answer cites them.
              Backed by the Canonical Citation Score (CCS) and a 30-day platform-by-platform
              share-of-voice roll-up.
            </p>

            <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border">
              <StatCell label="Sites in view" value={String(filtered.length)} />
              <StatCell label="Avg CCS" value={`${avgCCS}/100`} />
              <StatCell label="Avg citation prob" value={`${avgProb}%`} accent />
              <StatCell label="Rising 30d" value={String(rising)} />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <a
                href="/api/public/leaderboard.json"
                className="border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors uppercase tracking-widest"
              >
                GET /api/public/leaderboard.json
              </a>
              <button
                type="button"
                onClick={downloadCSV}
                className="border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors uppercase tracking-widest"
              >
                Export CSV ↓
              </button>
              <Link
                to="/leaderboard/methodology"
                className="border border-border px-3 py-1.5 hover:border-accent hover:text-accent transition-colors uppercase tracking-widest"
              >
                Methodology →
              </Link>
              <span className="uppercase tracking-widest">
                // {totalCites.toLocaleString()} citations tracked · CC BY 4.0
              </span>
            </div>
          </div>
        </section>

        {/* Citation snippet */}
        <section aria-labelledby="cite-as" className="border-b border-border bg-card/40">
          <div className="max-w-7xl mx-auto px-6 py-10">
            <h2
              id="cite-as"
              className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-5"
            >
              // Cite this dataset
            </h2>
            <CitationSnippet
              className="max-w-2xl"
              citation={{
                authors: ["grow.contact"],
                year: 2026,
                title: `Citation Intelligence Index (${allRows.length} AI companies)`,
                publisher: "grow.contact",
                url: "https://grow.contact/leaderboard",
                accessed: new Date().toISOString().slice(0, 10),
                key: "grow-citation-index",
              }}
            />
          </div>
        </section>

        {/* Filters */}
        <section
          aria-labelledby="filter-heading"
          className="border-b border-border bg-card/40 sticky top-0 z-10 backdrop-blur"
        >
          <h2 id="filter-heading" className="sr-only">
            Filter and search the citation index
          </h2>
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mr-2">
                // Category:
              </span>
              <CategoryTab cat="all" active={cat === "all"} label="All" count={counts.all} />
              {categories.map((c) => (
                <CategoryTab
                  key={c}
                  cat={c}
                  active={cat === c}
                  label={CATEGORY_LABELS[c] ?? c}
                  count={counts[c] ?? 0}
                />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="search"
                placeholder="Search company or domain…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 min-w-[200px] bg-background border border-border px-3 py-1.5 font-mono text-xs focus:border-accent outline-none"
              />
              {compare.length >= 2 ? (
                <Link
                  to="/compare"
                  search={{ domains: compare.join(",") }}
                  className="border border-accent text-accent px-3 py-1.5 font-mono text-xs uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Compare {compare.length} →
                </Link>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  // Pick 2–4 rows to compare
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Table */}
        <section aria-labelledby="ranking-heading">
          <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
            <h2 id="ranking-heading" className="sr-only">
              Ranked AI companies by citation probability
            </h2>
            <div className="border border-border bg-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-3 py-3 text-left w-10">#</th>
                    <th className="px-3 py-3 text-left w-8"></th>
                    <SortableTh label="Company" k="name" sort={sort} dir={dir} onClick={toggleSort} />
                    <SortableTh label="Category" k="category" sort={sort} dir={dir} onClick={toggleSort} />
                    <SortableTh label="CCS" k="overall_ccs" sort={sort} dir={dir} onClick={toggleSort} align="right" />
                    <SortableTh label="Cite Prob" k="citation_probability" sort={sort} dir={dir} onClick={toggleSort} align="right" />
                    <SortableTh label="30d cites" k="total_citations" sort={sort} dir={dir} onClick={toggleSort} align="right" />
                    <SortableTh label="Perp %" k="perplexity_share" sort={sort} dir={dir} onClick={toggleSort} align="right" />
                    <SortableTh label="GPT %" k="chatgpt_share" sort={sort} dir={dir} onClick={toggleSort} align="right" />
                    <SortableTh label="Claude %" k="claude_share" sort={sort} dir={dir} onClick={toggleSort} align="right" />
                    <SortableTh label="AIO %" k="google_aio_share" sort={sort} dir={dir} onClick={toggleSort} align="right" />
                    <th className="px-3 py-3 text-left">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((row) => {
                    const t = tierForCCS(row.overall_ccs);
                    const v = volatilityBadge(row.volatility);
                    const checked = compare.includes(row.domain);
                    return (
                      <tr key={row.domain} className="hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-3 font-mono text-xs tabular-nums text-muted-foreground">
                          {String(row.rank).padStart(3, "0")}
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            aria-label={`Compare ${row.name}`}
                            checked={checked}
                            onChange={() => toggleCompare(row.domain)}
                            disabled={!checked && compare.length >= 4}
                            className="accent-accent"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <Link to="/verify/$id" params={{ id: row.domain }} className="group block">
                            <div className="font-bold tracking-tighter uppercase group-hover:text-accent transition-colors">
                              {row.name}
                            </div>
                            <div className="font-mono text-[11px] text-muted-foreground mt-0.5">
                              {row.domain}
                            </div>
                          </Link>
                        </td>
                        <td className="px-3 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          {CATEGORY_LABELS[row.category] ?? row.category}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <span className={`font-mono text-xs tabular-nums px-2 py-1 border ${t.className}`}>
                            {row.overall_ccs}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-sm tabular-nums font-bold">
                          {row.citation_probability}%
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-xs tabular-nums">
                          {row.total_citations.toLocaleString()}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {row.perplexity_share.toFixed(1)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {row.chatgpt_share.toFixed(1)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {row.claude_share.toFixed(1)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-xs tabular-nums text-muted-foreground">
                          {row.google_aio_share.toFixed(1)}
                        </td>
                        <td className="px-3 py-3">
                          <span className={`font-mono text-[10px] tracking-widest px-2 py-0.5 border ${v.className}`}>
                            {v.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-3 py-12 text-center text-muted-foreground font-mono text-xs">
                        // No companies match the current filters.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>

            <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              // Citation Probability blends CCS sub-scores (canonical, precedent,
              authority, verifiability, commentary, information gain) with observed
              cite frequency across Perplexity, ChatGPT, Claude, and Google AIO.
              Click any row for the verify page.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-card">
          <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-mono text-accent text-xs mb-4 uppercase tracking-[0.2em]">
                // Is your site here?
              </p>
              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase leading-[0.95]">
                Score your site
                <br />
                in under a minute.
              </h2>
              <p className="mt-6 text-muted-foreground text-lg max-w-md">
                Free scan. CCS, citation probability, signal breakdown. See where
                you'd rank against the live Citation Intelligence Index.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link
                to="/check"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter hover:bg-foreground hover:text-background transition-colors"
              >
                Run /check
                <span className="font-mono text-xs">→</span>
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center gap-2 border border-border px-6 py-3 font-bold uppercase tracking-tighter hover:border-accent hover:text-accent transition-colors"
              >
                Rebuild agent-native
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function CategoryTab({
  cat,
  active,
  label,
  count,
}: {
  cat: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <Link
      to="/leaderboard"
      search={(s) => ({ ...s, cat })}
      className={`px-3 py-1.5 font-mono text-xs uppercase tracking-widest border transition-colors ${
        active
          ? "bg-accent text-accent-foreground border-accent"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
      }`}
    >
      {label} <span className="tabular-nums opacity-70">({count})</span>
    </Link>
  );
}

function SortableTh({
  label,
  k,
  sort,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  k: SortKey;
  sort: SortKey;
  dir: "asc" | "desc";
  onClick: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort === k;
  return (
    <th className={`px-3 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        type="button"
        onClick={() => onClick(k)}
        className={`font-mono text-[10px] uppercase tracking-widest transition-colors ${
          active ? "text-accent" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        {active ? <span className="ml-1">{dir === "asc" ? "↑" : "↓"}</span> : null}
      </button>
    </th>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-background p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        // {label}
      </div>
      <div
        className={`mt-2 text-2xl md:text-3xl font-extrabold tracking-tighter tabular-nums ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
