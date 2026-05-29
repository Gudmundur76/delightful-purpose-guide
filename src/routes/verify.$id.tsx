import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ExternalLink, Copy, RefreshCw, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState } from "react";
import { getVerifyRecord } from "@/lib/check/verify.functions";
import {
  getCompanyIntelligence,
  type CompanyIntelligence,
} from "@/lib/intelligence/company.functions";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params, loaderData }) => {
    const intel = (loaderData as { intelligence?: CompanyIntelligence | null } | undefined)
      ?.intelligence;
    const name = intel?.company.name ?? params.id;
    const prob = intel?.score?.citation_probability ?? null;
    const ccs = intel?.score?.overall_ccs ?? null;
    const title = intel
      ? `${name} — Citation Intelligence · CCS ${ccs}/100 · Grow`
      : `Verified Agent-Native · ${params.id} — Grow`;
    const description = intel
      ? `${name} citation profile across Perplexity, ChatGPT, Claude and Google AI Overviews. CCS ${ccs}/100, citation probability ${prob}%. Live monthly tracking.`
      : `Live agent-readability verdict for ${params.id}. Last score, score history, and per-signal breakdown. Re-scored on demand.`;

    const faqJsonLd = intel
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: `How often is ${name} cited by AI search engines?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${name} has a citation probability of ${prob}% across Perplexity, ChatGPT, Claude, and Google AI Overviews based on the latest scan.`,
              },
            },
            {
              "@type": "Question",
              name: `What is ${name}'s Citation Confidence Score (CCS)?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: `${name} scores ${ccs}/100 on the Citation Confidence Score, which weighs authority, verifiability, precedent, commentary, information gain, and canonical structure.`,
              },
            },
            {
              "@type": "Question",
              name: `Which AI engine cites ${name} most?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: "See the platform-share breakdown on this page — citations are tracked monthly across Perplexity, ChatGPT, Claude, and Google AI Overviews.",
              },
            },
            {
              "@type": "Question",
              name: `Is ${name} citation trend rising or falling?`,
              acceptedAnswer: {
                "@type": "Answer",
                text: "The 12-month citation history chart on this page shows the volatility classification (rising, stable, or falling) recomputed monthly.",
              },
            },
            {
              "@type": "Question",
              name: "How is this data collected?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Citations are ingested from automated probes against public AI search APIs and AI Overviews, deduplicated by canonical URL, and rolled up monthly.",
              },
            },
          ],
        }
      : null;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `https://grow.contact/verify/${params.id}` },
        { property: "og:type", content: "article" },
        ...(intel?.company.logo_url
          ? [{ property: "og:image", content: intel.company.logo_url }]
          : []),
      ],
      links: [{ rel: "canonical", href: `https://grow.contact/verify/${params.id}` }],
      scripts: faqJsonLd
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify(faqJsonLd),
            },
          ]
        : [],
    };
  },
  loader: async ({ params }) => {
    const host = params.id.toLowerCase();
    const [{ intelligence }, recordRes] = await Promise.all([
      getCompanyIntelligence({ data: { domain: host } }),
      getVerifyRecord({ data: { host } }).catch(() => ({ record: null })),
    ]);
    if (!intelligence && !recordRes?.record) throw notFound();
    return { intelligence, record: recordRes?.record ?? null };
  },
  notFoundComponent: NotFoundView,
  errorComponent: ({ error, reset }) => (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Verdict unavailable</h1>
        <p className="text-sm text-muted-foreground mb-6">{error.message}</p>
        <button onClick={reset} className="rounded-md border border-border px-4 py-2 text-sm">
          Retry
        </button>
      </div>
    </div>
  ),
  component: VerifyPage,
});

function NotFoundView() {
  const { id } = Route.useParams();
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          no verdict on file
        </div>
        <h1 className="text-3xl font-semibold mb-3">{id} hasn't been scanned yet</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Run a free agent-readability scan to create a permanent verdict page for this domain.
        </p>
        <Link
          to="/check"
          search={{ url: `https://${id}`, auto: true }}
          className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
        >
          Scan {id} <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

function VerifyPage() {
  const { intelligence, record } = Route.useLoaderData();
  if (intelligence) return <IntelligenceView intel={intelligence} />;
  if (record) return <ScanRecordView record={record} />;
  return <NotFoundView />;
}

// ============================================================================
// NEW: Wikipedia-style citation intelligence view
// ============================================================================
function IntelligenceView({ intel }: { intel: CompanyIntelligence }) {
  const { company, score, history, citations, authority, content, peers } = intel;

  const platformShares = history.length
    ? history[history.length - 1]
    : null;

  const volatility = platformShares?.volatility ?? "stable";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">grow.contact</Link>
          <span>/</span>
          <Link to="/leaderboard" className="hover:text-foreground">leaderboard</Link>
          <span>/</span>
          <span className="text-foreground">{company.domain}</span>
        </nav>

        {/* Hero infobox */}
        <header className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Citation Intelligence Profile · {company.category}
            </div>
            <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">
              {company.name}
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">{company.domain}</p>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground">
              {company.name} is tracked by grow.contact's Citation Intelligence Platform for
              presence across Perplexity, ChatGPT, Claude, and Google AI Overviews. Scores update
              monthly from automated citation probes and content analysis.
            </p>

            {company.github_url || company.g2_url ? (
              <div className="mt-4 flex gap-3 text-xs">
                {company.github_url && (
                  <a href={company.github_url} target="_blank" rel="noopener" className="text-accent hover:underline">
                    GitHub ↗
                  </a>
                )}
                {company.g2_url && (
                  <a href={company.g2_url} target="_blank" rel="noopener" className="text-accent hover:underline">
                    G2 ↗
                  </a>
                )}
              </div>
            ) : null}
          </div>

          <aside className="rounded-2xl border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
              Live verdict
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Stat label="CCS" value={`${score?.overall_ccs ?? 0}`} suffix="/100" />
              <Stat
                label="Citation Probability"
                value={`${score?.citation_probability ?? 0}`}
                suffix="%"
              />
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <VolatilityBadge volatility={volatility} />
              <span className="text-muted-foreground">
                Last scan {score ? new Date(score.scan_date).toISOString().slice(0, 10) : "—"}
              </span>
            </div>
            <Link
              to="/check"
              search={{ url: `https://${company.domain}`, auto: true }}
              className="mt-5 inline-flex items-center justify-center gap-1.5 w-full rounded-md bg-emerald-500 px-3 py-2 text-xs font-medium text-zinc-950 hover:bg-emerald-400"
            >
              <RefreshCw className="h-3 w-3" /> Rescan
            </Link>
          </aside>
        </header>

        {/* Score breakdown — 6 signal cards */}
        {score && (
          <section className="mt-12">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
              CCS signal breakdown
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <SignalCard label="Authority" value={score.authority} description="Domain reputation, backlinks, real-world mentions." />
              <SignalCard label="Verifiability" value={score.verifiability} description="Citations, sources, and structured evidence on-page." />
              <SignalCard label="Precedent" value={score.precedent} description="Historical citations by AI engines on this domain." />
              <SignalCard label="Commentary" value={score.commentary} description="Original analysis, expert opinion, and unique perspective." />
              <SignalCard label="Information Gain" value={score.information_gain} description="New facts an AI cannot find on other indexed pages." />
              <SignalCard label="Canonical" value={score.canonical} description="Schema, semantic HTML, and machine-readable structure." />
            </div>
          </section>
        )}

        {/* 12-month citation history chart */}
        {history.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
              12-month citation history
            </h2>
            <div className="rounded-xl border border-border bg-card p-6">
              <HistoryChart points={history} />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                <PlatformShare label="Perplexity" value={platformShares?.perplexity_share ?? 0} />
                <PlatformShare label="ChatGPT" value={platformShares?.chatgpt_share ?? 0} />
                <PlatformShare label="Claude" value={platformShares?.claude_share ?? 0} />
                <PlatformShare label="Google AIO" value={platformShares?.google_aio_share ?? 0} />
              </div>
            </div>
          </section>
        )}

        {/* Citation analysis — recent citations */}
        {citations.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
              Recent citations
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2.5">Engine</th>
                    <th className="px-4 py-2.5">Query</th>
                    <th className="px-4 py-2.5">Cited URL</th>
                    <th className="px-4 py-2.5 text-right">Pos</th>
                    <th className="px-4 py-2.5">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {citations.slice(0, 15).map((c, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="px-4 py-2.5 font-mono text-xs">{c.ai_engine}</td>
                      <td className="px-4 py-2.5 text-muted-foreground max-w-[260px] truncate">{c.query_text}</td>
                      <td className="px-4 py-2.5 max-w-[260px] truncate">
                        <a href={c.cited_url} target="_blank" rel="noopener" className="text-accent hover:underline">
                          {c.cited_url.replace(/^https?:\/\//, "")}
                        </a>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{c.position ?? "—"}</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                        {new Date(c.cited_at).toISOString().slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Content quality + authority side-by-side */}
        {(content || authority) && (
          <section className="mt-12 grid gap-6 lg:grid-cols-2">
            {content && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  Content quality
                </h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Metric label="Factual density" value={content.factual_density} suffix="/page" />
                  <Metric label="Freshness" value={content.freshness_days} suffix=" days" />
                  <Metric label="Expert signals" value={content.expert_signals} />
                  <Metric label="Q&A blocks" value={content.qa_blocks} />
                  <Metric label="Comparison tables" value={content.comparison_tables} />
                  <Metric label="Videos" value={content.video_count} />
                </dl>
              </div>
            )}
            {authority && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
                  Authority signals
                </h3>
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <Metric label="G2 reviews" value={authority.g2_reviews} />
                  <Metric label="GitHub stars" value={authority.github_stars} />
                  <Metric label="SO questions" value={authority.stackoverflow_questions} />
                  <Metric label="News mentions" value={authority.news_mentions} />
                  <Metric label="Reddit mentions" value={authority.reddit_mentions} />
                  <Metric label="Backlinks" value={authority.backlinks} />
                </dl>
              </div>
            )}
          </section>
        )}

        {/* Comparison table — peers in same category */}
        {peers.length > 0 && (
          <section className="mt-12">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
              Peers in {company.category}
            </h2>
            <div className="overflow-hidden rounded-xl border border-border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-left text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-2.5">Company</th>
                    <th className="px-4 py-2.5 text-right">CCS</th>
                    <th className="px-4 py-2.5 text-right">Cite Prob.</th>
                    <th className="px-4 py-2.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {peers.map((p) => (
                    <tr key={p.domain} className="border-t border-border/50">
                      <td className="px-4 py-2.5 font-medium">{p.name}</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{p.overall_ccs}/100</td>
                      <td className="px-4 py-2.5 text-right font-mono tabular-nums">{p.citation_probability}%</td>
                      <td className="px-4 py-2.5 text-right">
                        <Link
                          to="/verify/$id"
                          params={{ id: p.domain }}
                          className="text-xs text-accent hover:underline"
                        >
                          view ↗
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Q&A block — also feeds FAQ JSON-LD in head */}
        <section className="mt-12">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-4">
            Questions about {company.name}'s AI citations
          </h2>
          <div className="space-y-3">
            <QA
              q={`How often is ${company.name} cited by AI search engines?`}
              a={`${company.name} has a citation probability of ${score?.citation_probability ?? 0}% based on the latest monthly probes across Perplexity, ChatGPT, Claude, and Google AI Overviews.`}
            />
            <QA
              q={`What is ${company.name}'s Citation Confidence Score (CCS)?`}
              a={`${company.name} scores ${score?.overall_ccs ?? 0}/100 on the Citation Confidence Score, weighing authority, verifiability, precedent, commentary, information gain, and canonical structure.`}
            />
            <QA
              q={`Which AI engine cites ${company.name} most?`}
              a="Platform shares are shown above on the 12-month citation history chart. Each row of the recent-citations table identifies the engine that issued each citation."
            />
            <QA
              q={`Is ${company.name}'s citation trend rising or falling?`}
              a={`The current volatility classification is "${volatility}", recomputed monthly from rolling citation counts.`}
            />
            <QA
              q="How is this data collected?"
              a="Citations are ingested from automated probes against public AI search APIs and AI Overviews, deduplicated by canonical URL, and rolled up monthly into citation_history."
            />
          </div>
        </section>

        <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
          Citation Intelligence powered by grow.contact · data updated {new Date().toISOString().slice(0, 10)}
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 text-3xl font-semibold tabular-nums">
        {value}
        <span className="text-base text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-mono tabular-nums">
        {value}
        {suffix}
      </dd>
    </div>
  );
}

function SignalCard({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono tabular-nums text-muted-foreground">{value}/100</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-emerald-500" style={{ width: `${value}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function VolatilityBadge({ volatility }: { volatility: "stable" | "rising" | "falling" }) {
  const styles = {
    rising: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    falling: "border-rose-500/40 bg-rose-500/15 text-rose-300",
    stable: "border-zinc-400/40 bg-zinc-500/15 text-zinc-200",
  } as const;
  const Icon = volatility === "rising" ? TrendingUp : volatility === "falling" ? TrendingDown : Minus;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${styles[volatility]}`}>
      <Icon className="h-3 w-3" /> {volatility}
    </span>
  );
}

function PlatformShare({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/20 p-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-lg tabular-nums">{Number(value).toFixed(1)}%</div>
    </div>
  );
}

function HistoryChart({ points }: { points: { month: string; total_citations: number }[] }) {
  const w = 720;
  const h = 140;
  const pad = 8;
  const max = Math.max(1, ...points.map((p) => p.total_citations));
  const maxX = Math.max(1, points.length - 1);
  const xy = (p: { total_citations: number }, i: number) => {
    const x = pad + (i / maxX) * (w - pad * 2);
    const y = pad + (1 - p.total_citations / max) * (h - pad * 2);
    return [x, y] as const;
  };
  const path = points.map((p, i) => {
    const [x, y] = xy(p, i);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  const area = `${path} L${pad + (w - pad * 2)},${h - pad} L${pad},${h - pad} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <path d={area} fill="rgba(16,185,129,0.12)" />
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      {points.map((p, i) => {
        const [x, y] = xy(p, i);
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#10b981" />;
      })}
    </svg>
  );
}

function QA({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-xl border border-border bg-card p-4 open:bg-card">
      <summary className="cursor-pointer list-none text-sm font-medium flex items-center justify-between">
        {q}
        <span className="text-muted-foreground transition group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{a}</p>
    </details>
  );
}

// ============================================================================
// FALLBACK: existing scan-record verdict view (unchanged behaviour for
// domains not yet in the companies/intelligence dataset).
// ============================================================================
type RecordMetrics = {
  semantic: number;
  jsonld: number;
  llms: number;
  citability: number;
  speed: number;
};

const METRIC_LABELS: Record<keyof RecordMetrics, string> = {
  semantic: "Semantic HTML",
  jsonld: "JSON-LD Schema",
  llms: "llms.txt",
  citability: "Citability",
  speed: "Speed",
};

function gradeFor(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

type ScanRecord = {
  host: string;
  url: string;
  overall: number;
  metrics: RecordMetrics;
  scanned_at: string;
  total_scans: number;
  history: { scanned_at: string; overall: number }[];
};

function ScanRecordView({ record }: { record: ScanRecord }) {
  const [copied, setCopied] = useState(false);
  const id = record.host;

  const verifyUrl = `https://grow.contact/verify/${id}`;
  const badgeImg = `https://grow.contact/badge/${id}.svg`;
  const embedSnippet = `<a href="${verifyUrl}" target="_blank" rel="noopener">
  <img src="${badgeImg}" alt="Agent Readability Score — ${record.host}" width="240" height="72" />
</a>`;

  const copy = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const scannedAt = new Date(record.scanned_at);
  const grade = gradeFor(record.overall);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← grow.contact
        </Link>

        <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <Check className="h-3 w-3" /> Live agent-readability verdict
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {record.host}
            </h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              score: {record.overall}/100 ({grade}) · last scan:{" "}
              {scannedAt.toISOString().slice(0, 10)} · {record.total_scans} scan
              {record.total_scans === 1 ? "" : "s"} on file
            </p>
          </div>
          <img
            src={badgeImg}
            alt={`Agent Readability badge for ${record.host}`}
            width={240}
            height={72}
            className="rounded-lg border border-border"
          />
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Score breakdown
          </h2>
          <div className="mt-4 grid gap-3">
            {(Object.keys(METRIC_LABELS) as (keyof RecordMetrics)[]).map((k) => {
              const v = record.metrics[k];
              return (
                <div key={k} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{METRIC_LABELS[k]}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">
                      {v}/100
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-emerald-500" style={{ width: `${v}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {record.history.length > 1 && (
          <section className="mt-10">
            <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Score history
            </h2>
            <div className="mt-4 rounded-xl border border-border bg-card p-6">
              <HistorySparkline points={record.history} />
              <div className="mt-3 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>{new Date(record.history[0].scanned_at).toISOString().slice(0, 10)}</span>
                <span>{record.history.length} data points</span>
                <span>
                  {new Date(record.history[record.history.length - 1].scanned_at)
                    .toISOString()
                    .slice(0, 10)}
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Embed this badge
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste into your site footer. The badge and this page update automatically as your
            score changes.
          </p>
          <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-zinc-950">
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-50">
              <code>{embedSnippet}</code>
            </pre>
            <button
              onClick={copy}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        <section className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold">Re-score this domain</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Run a fresh scan — the result lands back on this same verdict page.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to="/check"
              search={{ url: record.url, auto: true }}
              className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400"
            >
              <RefreshCw className="h-3 w-3" /> Rescan {record.host}
            </Link>
            <Link
              to="/badge"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Get your own badge
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function HistorySparkline({
  points,
}: {
  points: { scanned_at: string; overall: number }[];
}) {
  const w = 600;
  const h = 80;
  const pad = 4;
  const maxX = Math.max(1, points.length - 1);
  const path = points
    .map((p, i) => {
      const x = pad + (i / maxX) * (w - pad * 2);
      const y = pad + (1 - p.overall / 100) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
      {points.map((p, i) => {
        const x = pad + (i / maxX) * (w - pad * 2);
        const y = pad + (1 - p.overall / 100) * (h - pad * 2);
        return <circle key={i} cx={x} cy={y} r={2.5} fill="#10b981" />;
      })}
    </svg>
  );
}
