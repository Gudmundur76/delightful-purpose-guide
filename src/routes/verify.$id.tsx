import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Check, ExternalLink, Copy, RefreshCw } from "lucide-react";
import { useState } from "react";
import { getVerifyRecord } from "@/lib/check/verify.functions";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verified Agent-Native · ${params.id} — Grow` },
      {
        name: "description",
        content: `Live agent-readability verdict for ${params.id}. Last score, score history, and per-signal breakdown. Re-scored on demand.`,
      },
      { property: "og:title", content: `Certified Agent-Native · ${params.id}` },
      {
        property: "og:description",
        content: "Independently verified, continuously re-scored agent-readability verdict.",
      },
      { property: "og:url", content: `https://grow.contact/verify/${params.id}` },
    ],
    links: [{ rel: "canonical", href: `https://grow.contact/verify/${params.id}` }],
  }),
  loader: async ({ params }) => {
    const { record } = await getVerifyRecord({ data: { host: params.id } });
    if (!record) throw notFound();
    return { record };
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

const METRIC_LABELS: Record<keyof RecordMetrics, string> = {
  semantic: "Semantic HTML",
  jsonld: "JSON-LD Schema",
  llms: "llms.txt",
  citability: "Citability",
  speed: "Speed",
};

type RecordMetrics = {
  semantic: number;
  jsonld: number;
  llms: number;
  citability: number;
  speed: number;
};

function gradeFor(score: number) {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function VerifyPage() {
  const { id } = Route.useParams();
  const { record } = Route.useLoaderData();
  const [copied, setCopied] = useState(false);

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

        {/* Header */}
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

        {/* Score breakdown */}
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
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${v}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* History */}
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

        {/* Embed */}
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

        {/* CTA */}
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
