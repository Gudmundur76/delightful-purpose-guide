import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpDown, ChevronDown } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { TruthBadge } from "@/components/verifier/TruthBadge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { COMPANY_PROFILE, type Claim, type TruthLabel } from "@/lib/verifier/mock";

export const Route = createFileRoute("/verifier/company/$domain")({
  head: ({ params }) => {
    const domain = (params as { domain?: string })?.domain ?? COMPANY_PROFILE.domain;
    const title = `${domain} — Verifier profile`;
    const desc = `Verified claims, truth score, and contradictions for ${domain}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        ...ogImageMeta({ title: domain, kicker: "Verifier profile", sub: desc }),
      ],
    };
  },
  component: CompanyPage,
});

type FilterKey = "all" | "verified" | "unverifiable" | "contradictions";
type SortKey = "score" | "category" | "label";

function CompanyPage() {
  // Mock-only: ignore params, render the weaviate.io profile fixture.
  const p = COMPANY_PROFILE;
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "score",
    dir: "desc",
  });

  const filtered = useMemo(() => {
    const base = p.claims.filter((c) => {
      if (filter === "all") return true;
      if (filter === "contradictions") return c.truth_label === "partial";
      const label: TruthLabel = filter;
      return c.truth_label === label;
    });
    const sorted = [...base].sort((a, b) => {
      const m = sort.dir === "asc" ? 1 : -1;
      if (sort.key === "score") return (a.truth_score - b.truth_score) * m;
      if (sort.key === "category") return a.claim_category.localeCompare(b.claim_category) * m;
      return a.truth_label.localeCompare(b.truth_label) * m;
    });
    return sorted;
  }, [filter, sort, p.claims]);

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" },
    );

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 sm:py-14">
        <Link
          to="/verifier"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
        >
          ← Back to Verifier
        </Link>

        {/* Hero */}
        <section className="mt-4 grid gap-6 sm:grid-cols-[1fr_auto] items-start">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
              // verifier profile
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div
                aria-hidden
                className="h-10 w-10 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 border border-border grid place-items-center font-bold text-accent"
              >
                {p.name.slice(0, 1)}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{p.name}</h1>
            </div>
            <p className="font-mono text-xs text-muted-foreground mt-1">{p.domain}</p>
            <p className="text-muted-foreground mt-3 max-w-xl">{p.tagline}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 text-center min-w-[140px]">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              truth score
            </p>
            <p className="font-mono text-4xl font-bold tabular-nums mt-1">
              {p.truth_score}
              <span className="text-base text-muted-foreground">/100</span>
            </p>
            <TruthBadge score={p.truth_score} className="mt-2" size="sm" />
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Claims" value={p.stats.total} />
          <Stat label="Verified" value={p.stats.verified} tone="emerald" />
          <Stat label="Unverifiable" value={p.stats.unverifiable} tone="rose" />
          <Stat label="Contradictions" value={p.stats.contradictions} tone="amber" />
        </section>

        {/* Score history */}
        <section className="mt-8 rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              // truth score · 90 days
            </h2>
            <span className="font-mono text-[10px] text-muted-foreground tabular-nums">
              +{p.score_history.at(-1)!.score - p.score_history[0].score} pts
            </span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={p.score_history} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  stroke="var(--border)"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  stroke="var(--border)"
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "var(--muted-foreground)" }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--accent)" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Claims table */}
        <section className="mt-10">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-lg font-semibold">Claims</h2>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="verified">Verified</TabsTrigger>
                <TabsTrigger value="unverifiable">Unverifiable</TabsTrigger>
                <TabsTrigger value="contradictions">Contradictions</TabsTrigger>
              </TabsList>
              <TabsContent value={filter} />
            </Tabs>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8" />
                  <TableHead>Claim</TableHead>
                  <TableHead className="hidden sm:table-cell w-32">
                    <SortButton label="Category" active={sort.key === "category"} dir={sort.dir} onClick={() => toggleSort("category")} />
                  </TableHead>
                  <TableHead className="w-28">
                    <SortButton label="Label" active={sort.key === "label"} dir={sort.dir} onClick={() => toggleSort("label")} />
                  </TableHead>
                  <TableHead className="w-24 text-right">
                    <SortButton label="Score" active={sort.key === "score"} dir={sort.dir} onClick={() => toggleSort("score")} />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">
                      No claims match this filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((claim) => <ClaimRow key={claim.id} claim={claim} />)
                )}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* Q&A */}
        <section className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Questions & answers</h2>
          <div className="space-y-3">
            {p.qa.map((item, i) => (
              <QaItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </section>
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
  value: number;
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

function ClaimRow({ claim }: { claim: Claim }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TableRow className="cursor-pointer" onClick={() => setOpen((o) => !o)}>
        <TableCell>
          <ChevronDown
            className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", open && "rotate-180")}
          />
        </TableCell>
        <TableCell className="font-mono text-[13px] leading-snug">{claim.claim_text}</TableCell>
        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">
          {claim.claim_category}
        </TableCell>
        <TableCell>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {claim.truth_label}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <TruthBadge score={claim.truth_score} size="sm" />
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="bg-muted/20 hover:bg-muted/20">
          <TableCell />
          <TableCell colSpan={4} className="py-4">
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                  // methodology
                </p>
                <p className="text-muted-foreground">
                  {claim.methodology_notes ?? "No methodology disclosed."}
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
                  // evidence chain
                </p>
                <a
                  href={claim.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline text-xs break-all"
                >
                  {claim.source_url}
                </a>
                {claim.evidence?.map((ev, i) => (
                  <div key={i} className="mt-2 rounded-md border border-border bg-card p-3">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {ev.source_type}
                    </p>
                    <a
                      href={ev.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:underline break-all"
                    >
                      {ev.source_url}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">{ev.excerpt}</p>
                  </div>
                ))}
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function QaItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform shrink-0", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">{a}</div>
      )}
    </div>
  );
}
