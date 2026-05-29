import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpDown, AlertTriangle, Filter } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { TruthBadge } from "@/components/verifier/TruthBadge";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { CONTRADICTIONS_DATA } from "@/lib/verifier/mock";
import type { Contradiction } from "@/lib/verifier/mock";

const TITLE = "Contradictions — The Verifier";
const DESC = "Where AI company claims conflict — side-by-side comparisons with confidence scores.";

type SortKey = "confidence" | "category";
type ConfidenceLevel = "all" | "high" | "medium" | "low";

const CATEGORIES = ["all", "performance", "pricing", "scalability", "market"];

function getConfidenceLevel(c: number): "high" | "medium" | "low" {
  if (c >= 80) return "high";
  if (c >= 60) return "medium";
  return "low";
}

export const Route = createFileRoute("/verifier/contradictions")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      ...ogImageMeta({ title: "Contradictions", kicker: "The Verifier", sub: DESC }),
    ],
  }),
  component: ContradictionsPage,
});

function ContradictionsPage() {
  const [category, setCategory] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceLevel>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "confidence",
    dir: "desc",
  });

  const filtered = useMemo(() => {
    const base = CONTRADICTIONS_DATA.filter((c) => {
      const matchesCategory = category === "all" || c.category === category;
      const matchesCompany =
        !companySearch ||
        c.company_a.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.company_b.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.domain_a.toLowerCase().includes(companySearch.toLowerCase()) ||
        c.domain_b.toLowerCase().includes(companySearch.toLowerCase());
      const level = getConfidenceLevel(c.confidence);
      const matchesConfidence = confidenceFilter === "all" || level === confidenceFilter;
      return matchesCategory && matchesCompany && matchesConfidence;
    });
    const sorted = [...base].sort((a, b) => {
      const m = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "confidence") return (a.confidence - b.confidence) * m;
      return a.category.localeCompare(b.category) * m;
    });
    return sorted;
  }, [category, companySearch, confidenceFilter, sort]);

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10 sm:py-14">
        <Link
          to="/verifier"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
        >
          ← Back to Verifier
        </Link>

        <header className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            // contradictions
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">Contradictions</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">{DESC}</p>
        </header>

        {/* Filters */}
        <section className="mt-8 flex flex-col lg:flex-row items-start lg:items-center gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  category === cat
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card text-muted-foreground border-border hover:border-accent hover:text-accent",
                )}
              >
                {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:flex-initial">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Filter by company…"
                value={companySearch}
                onChange={(e) => setCompanySearch(e.target.value)}
                className="pl-9 w-full lg:w-56 text-sm"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "high", "medium", "low"] as ConfidenceLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setConfidenceFilter(level)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-widest border transition-colors",
                    confidenceFilter === level
                      ? "bg-accent/20 text-accent border-accent/50"
                      : "bg-card text-muted-foreground border-border hover:border-accent/50",
                  )}
                >
                  {level === "all" ? "All" : level}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <SortMini label="Confidence" active={sort.key === "confidence"} dir={sort.dir} onClick={() => toggleSort("confidence")} />
              <SortMini label="Category" active={sort.key === "category"} dir={sort.dir} onClick={() => toggleSort("category")} />
            </div>
          </div>
        </section>

        {/* Card grid */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          {filtered.length === 0 ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground">
              No contradictions match this filter.
            </div>
          ) : (
            filtered.map((c) => <ContradictionCard key={c.id} contradiction={c} />)
          )}
        </section>

        <p className="mt-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
          Showing {filtered.length} of {CONTRADICTIONS_DATA.length} contradictions · Powered by grow.contact
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function ContradictionCard({ contradiction: c }: { contradiction: Contradiction }) {
  const level = getConfidenceLevel(c.confidence);
  const levelColor =
    level === "high"
      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
      : level === "medium"
      ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
      : "bg-rose-500/15 text-rose-400 border-rose-500/30";

  return (
    <article className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 flex-1">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-amber-400">
              {c.category}
            </span>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest",
              levelColor,
            )}
          >
            {level} · {c.confidence}%
          </span>
        </div>

        <div className="space-y-3">
          <ClaimSide company={c.company_a} domain={c.domain_a} claim={c.claim_a} />
          <div className="flex items-center justify-center">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
              vs
            </span>
          </div>
          <ClaimSide company={c.company_b} domain={c.domain_b} claim={c.claim_b} />
        </div>

        <div className="mt-4 rounded-md bg-muted/20 border border-border px-3 py-2.5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
            // analysis
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed">{c.analysis}</p>
        </div>
      </div>
    </article>
  );
}

function ClaimSide({ company, domain, claim }: { company: string; domain: string; claim: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-sm font-semibold">{company}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{domain}</span>
      </div>
      <blockquote className="font-mono text-[12px] leading-relaxed text-foreground/90">
        "{claim}"
      </blockquote>
    </div>
  );
}

function SortMini({
  label,
  active,
  dir,
  onClick,
}: {
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-mono uppercase tracking-widest transition-colors",
        active
          ? "bg-accent/20 text-accent border-accent/50"
          : "bg-card text-muted-foreground border-border hover:border-accent/50",
      )}
    >
      {label}
      <ArrowUpDown className={cn("h-3 w-3", active && dir === "asc" && "rotate-180")} />
    </button>
  );
}
