import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpDown, Download, Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { TruthBadge } from "@/components/verifier/TruthBadge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { LEADERBOARD_DATA, LEADERBOARD_CATEGORIES, VERIFIER_STATS } from "@/lib/verifier/mock";

const TITLE = "Truth Leaderboard — The Verifier";
const DESC = "AI companies ranked by verified claims, contradictions, and reproducibility.";

type SortKey = "truth_score" | "claims_analyzed" | "verified" | "unverifiable" | "contradictions";

export const Route = createFileRoute("/verifier/leaderboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      ...ogImageMeta({ title: "Truth Leaderboard", kicker: "The Verifier", sub: DESC }),
    ],
  }),
  component: LeaderboardPage,
});

function LeaderboardPage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "truth_score",
    dir: "desc",
  });

  const filtered = useMemo(() => {
    const base = LEADERBOARD_DATA.filter((c) => {
      const matchesCategory = category === "All" || c.category === category;
      const matchesSearch =
        !search ||
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.domain.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    const sorted = [...base].sort((a, b) => {
      const m = sort.dir === "asc" ? 1 : -1;
      return (a[sort.key] - b[sort.key]) * m;
    });
    return sorted;
  }, [category, search, sort]);

  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        acc.companies += 1;
        acc.claims += c.claims_analyzed;
        acc.verified += c.verified;
        acc.contradictions += c.contradictions;
        return acc;
      },
      { companies: 0, claims: 0, verified: 0, contradictions: 0 },
    );
  }, [filtered]);

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
            // truth leaderboard
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-2">
            Truth Leaderboard
          </h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            {DESC}
          </p>
        </header>

        {/* Stats bar */}
        <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Companies" value={totals.companies} />
          <Stat label="Claims" value={totals.claims.toLocaleString()} />
          <Stat label="Verified" value={totals.verified} tone="emerald" />
          <Stat label="Contradictions" value={totals.contradictions} tone="amber" />
        </section>

        {/* Filters */}
        <section className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <Tabs value={category} onValueChange={setCategory}>
            <TabsList className="flex-wrap h-auto">
              {LEADERBOARD_CATEGORIES.map((cat) => (
                <TabsTrigger key={cat} value={cat} className="text-xs">
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-56"
              />
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Upgrade to Pro for CSV/JSON export</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </section>

        {/* Table */}
        <section className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Company</TableHead>
                  <TableHead className="hidden sm:table-cell w-28">Category</TableHead>
                  <TableHead className="w-28 text-right">
                    <SortButton label="Truth" active={sort.key === "truth_score"} dir={sort.dir} onClick={() => toggleSort("truth_score")} />
                  </TableHead>
                  <TableHead className="w-24 text-right hidden md:table-cell">
                    <SortButton label="Claims" active={sort.key === "claims_analyzed"} dir={sort.dir} onClick={() => toggleSort("claims_analyzed")} />
                  </TableHead>
                  <TableHead className="w-24 text-right hidden lg:table-cell">
                    <SortButton label="Verified" active={sort.key === "verified"} dir={sort.dir} onClick={() => toggleSort("verified")} />
                  </TableHead>
                  <TableHead className="w-28 text-right hidden lg:table-cell">
                    <SortButton label="Unverifiable" active={sort.key === "unverifiable"} dir={sort.dir} onClick={() => toggleSort("unverifiable")} />
                  </TableHead>
                  <TableHead className="w-24 text-right">
                    <SortButton label="Contra." active={sort.key === "contradictions"} dir={sort.dir} onClick={() => toggleSort("contradictions")} />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                      No companies match this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((entry) => (
                    <TableRow key={entry.domain}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div
                            aria-hidden
                            className="h-8 w-8 rounded-md bg-gradient-to-br from-accent/30 to-accent/10 border border-border grid place-items-center text-xs font-bold text-accent shrink-0"
                          >
                            {entry.name.slice(0, 1)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{entry.name}</p>
                            <p className="font-mono text-[10px] text-muted-foreground truncate">
                              {entry.domain}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
                        {entry.category}
                      </TableCell>
                      <TableCell className="text-right">
                        <TruthBadge score={entry.truth_score} size="sm" />
                      </TableCell>
                      <TableCell className="text-right hidden md:table-cell font-mono text-xs tabular-nums text-muted-foreground">
                        {entry.claims_analyzed}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell font-mono text-xs tabular-nums text-emerald-400">
                        {entry.verified}
                      </TableCell>
                      <TableCell className="text-right hidden lg:table-cell font-mono text-xs tabular-nums text-rose-400">
                        {entry.unverifiable}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums text-amber-400">
                        {entry.contradictions}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        <p className="mt-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">
          Showing {filtered.length} of {LEADERBOARD_DATA.length} companies · Powered by grow.contact
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "emerald" | "rose" | "amber";
}) {
  const color =
    tone === "emerald"
      ? "text-emerald-400"
      : tone === "rose"
      ? "text-rose-400"
      : tone === "amber"
      ? "text-amber-400"
      : "text-foreground";
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={cn("font-mono text-2xl font-bold tabular-nums mt-1", color)}>{value}</p>
    </div>
  );
}

function SortButton({
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
        "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest transition-colors",
        active ? "text-accent" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
      <ArrowUpDown className={cn("h-3 w-3", active && dir === "asc" && "rotate-180")} />
    </button>
  );
}
