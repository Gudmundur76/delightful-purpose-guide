import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { z } from "zod";
import { getScanDiff } from "@/lib/check/history.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

const searchSchema = z.object({
  a: z.string().uuid(),
  b: z.string().uuid(),
});

export const Route = createFileRoute("/history/$host/diff")({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => ({ a: search.a, b: search.b }),
  loader: ({ deps }) => getScanDiff({ data: { aId: deps.a, bId: deps.b } }),
  head: ({ params }) => ({
    meta: [
      { title: `Scan diff — ${params.host} | Grow` },
      { name: "description", content: `Side-by-side comparison of two Agent Readability scans for ${params.host}.` },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DiffPage,
});

function DiffPage() {
  const data = Route.useLoaderData();
  const { host } = Route.useParams();

  if (!data.ok || !data.metrics || !data.a || !data.b) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <SiteHeader />
        <main className="max-w-3xl mx-auto px-6 py-20 w-full flex-1">
          <h1 className="text-3xl font-extrabold tracking-tighter uppercase mb-4">Diff unavailable</h1>
          <p className="text-muted-foreground">{data.error ?? "Could not load these scans."}</p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const { a, b, metrics, summary } = data;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-6 py-12 w-full flex-1">
        <Link
          to="/history/$host"
          params={{ host }}
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground inline-flex items-center gap-2 mb-8"
        >
          <ArrowLeft className="w-3 h-3" /> back to history
        </Link>

        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
          BEFORE → AFTER · {host}
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-10">
          Scan diff
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-10">
          <ScanCard label="Before" url={a.url} date={a.scanned_at} />
          <ArrowRight className="w-6 h-6 text-muted-foreground hidden md:block mx-auto" />
          <ScanCard label="After" url={b.url} date={b.scanned_at} />
        </div>

        {summary && summary.length > 0 && (
          <div className="border border-accent/40 bg-accent/5 rounded p-6 mb-10">
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
              What changed
            </div>
            <ul className="space-y-2">
              {summary.map((s, i) => (
                <li key={i} className="text-sm">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="border border-border rounded overflow-x-auto">
          <table className="w-full">
            <thead className="bg-card">
              <tr className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="text-left p-4">Metric</th>
                <th className="text-right p-4">Before</th>
                <th className="text-right p-4">After</th>
                <th className="text-right p-4">Δ</th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((m) => {
                const tone =
                  m.delta > 0 ? "text-accent" : m.delta < 0 ? "text-red-500" : "text-muted-foreground";
                const sign = m.delta > 0 ? "+" : "";
                return (
                  <tr key={m.key} className="border-t border-border">
                    <td className="p-4 font-semibold">{m.label}</td>
                    <td className="p-4 text-right font-mono">{m.a}</td>
                    <td className="p-4 text-right font-mono">{m.b}</td>
                    <td className={`p-4 text-right font-mono font-bold ${tone}`}>
                      {sign}
                      {m.delta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function ScanCard({ label, url, date }: { label: string; url: string; date: string }) {
  return (
    <div className="border border-border rounded p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </div>
      <div className="font-mono text-xs truncate mb-1">{url}</div>
      <div className="font-mono text-xs text-muted-foreground">
        {new Date(date).toLocaleString()}
      </div>
    </div>
  );
}
