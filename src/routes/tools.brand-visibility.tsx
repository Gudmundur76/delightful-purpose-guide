import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { auditBrandVisibility, type BrandVisibilityReport } from "@/lib/tools/brand-visibility.functions";
import { Loader2, Search, CheckCircle2, XCircle } from "lucide-react";

const URL_ = "https://citation.is/tools/brand-visibility";
const TITLE = "Brand visibility in AI answers — free audit across ChatGPT, Gemini & Perplexity";
const DESC =
  "Enter a domain. We derive the buyer questions AI assistants get in your category, run them across Gemini and GPT, and tell you your visibility %, average rank, and who's beating you. Free, no signup.";

export const Route = createFileRoute("/tools/brand-visibility")({
  component: BrandVisibilityPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL_ },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...ogImageMeta({
        title: "Are you cited by ChatGPT & Gemini?",
        kicker: "citation.is / tools",
        sub: "Free domain-only visibility audit. 8 real buyer prompts × 2 engines.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
  }),
});

function Bar({ pct }: { pct: number }) {
  const color = pct >= 60 ? "bg-green-500" : pct >= 30 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
      <div className={`h-full ${color}`} style={{ width: `${Math.max(2, pct)}%` }} />
    </div>
  );
}

function BrandVisibilityPage() {
  const audit = useServerFn(auditBrandVisibility);
  const [domain, setDomain] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const mut = useMutation({
    mutationFn: async (d: string) => audit({ data: { domain: d } }) as Promise<BrandVisibilityReport>,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim().length < 3) return;
    setExpanded(null);
    mut.mutate(domain.trim());
  };

  const r = mut.data;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-14">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free tool</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">Brand visibility in AI answers</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
              Enter your domain. We figure out what people actually ask AI assistants in your category, run those
              prompts across Gemini and GPT, and show you your visibility %, average rank, and who's showing up
              instead of you.
            </p>

            <form onSubmit={submit} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
                <input
                  type="text"
                  inputMode="url"
                  autoComplete="off"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="yourbrand.com"
                  className="w-full rounded-md border border-border bg-card pl-10 pr-3 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={mut.isPending || domain.trim().length < 3}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {mut.isPending ? "Auditing…" : "Check visibility"}
              </button>
            </form>
            {mut.isPending && (
              <p className="mt-3 text-xs text-muted-foreground">
                Deriving 8 buyer prompts, then running 16 live AI calls in parallel. ~15–25 seconds.
              </p>
            )}
            {mut.error && (
              <p className="mt-3 text-sm text-red-500">
                {mut.error instanceof Error ? mut.error.message : "Something went wrong."}
              </p>
            )}
          </div>
        </section>

        {r && (
          <section className="mx-auto max-w-5xl px-6 py-10">
            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Visibility</p>
                <p className="mt-2 text-3xl font-semibold">{r.visibility}%</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  cited in {r.perPrompt.filter((p) => p.cited).length} / {r.perPrompt.length} prompts
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Avg rank</p>
                <p className="mt-2 text-3xl font-semibold">{r.avgRank ?? "—"}</p>
                <p className="mt-1 text-xs text-muted-foreground">position when listed</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Runs cited</p>
                <p className="mt-2 text-3xl font-semibold">
                  {r.citedRuns}<span className="text-lg text-muted-foreground">/{r.totalRuns}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">across {r.engines.length} engines</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Topic</p>
                <p className="mt-2 text-base font-semibold leading-tight">{r.topic}</p>
                <p className="mt-1 text-xs text-muted-foreground break-all">{r.domain}</p>
              </div>
            </div>

            {/* Per-prompt table */}
            <div className="mt-8 rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-lg font-semibold">Per-prompt results</h2>
                <p className="text-xs text-muted-foreground mt-1">Click a row to see the raw AI answer per engine.</p>
              </div>
              <div className="divide-y divide-border">
                {r.perPrompt.map((p, i) => {
                  const open = expanded === i;
                  return (
                    <div key={p.prompt}>
                      <button
                        type="button"
                        onClick={() => setExpanded(open ? null : i)}
                        className="w-full text-left px-5 py-3 flex items-center gap-3 hover:bg-muted/40"
                      >
                        <span className="w-4 shrink-0" aria-hidden>
                          {p.cited ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </span>
                        <span className="flex-1 text-sm">{p.prompt}</span>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {p.bestRank ? `#${p.bestRank}` : p.cited ? "mentioned" : "not cited"}
                        </span>
                        <Bar pct={p.cited ? 100 : 0} />
                      </button>
                      {open && (
                        <div className="px-5 pb-5 pt-2 space-y-3 bg-muted/20">
                          {p.engines.map((e) => (
                            <details key={e.engine} className="rounded-md border border-border bg-card p-3">
                              <summary className="cursor-pointer text-xs font-medium">
                                {e.engine} · {e.cited ? `cited${e.rank ? ` at #${e.rank}` : ""}` : "not cited"}
                                {e.error ? <span className="text-red-500"> · {e.error}</span> : null}
                              </summary>
                              <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground max-h-64 overflow-auto">
                                {e.answer || "(empty)"}
                              </pre>
                            </details>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Competitors */}
            {r.topCompetitors.length > 0 && (
              <div className="mt-8 rounded-xl border border-border bg-card p-5">
                <h2 className="text-lg font-semibold">Who's showing up instead of you</h2>
                <p className="text-xs text-muted-foreground mt-1">Domains cited by the AI answers across all prompts.</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {r.topCompetitors.map((c) => (
                    <li key={c.domain} className="rounded-full border border-border bg-background px-3 py-1 text-xs">
                      <span className="font-medium">{c.domain}</span>
                      <span className="ml-2 text-muted-foreground">×{c.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-6 text-xs text-muted-foreground">
              Checked <time dateTime={r.checkedAt}>{new Date(r.checkedAt).toLocaleString()}</time>. Results are live —
              engines change hourly, so audit weekly to track movement.
            </p>
          </section>
        )}

        {!r && !mut.isPending && (
          <section className="mx-auto max-w-5xl px-6 py-10">
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                Try <code className="rounded bg-muted px-1.5 py-0.5">vanta.com</code>,{" "}
                <code className="rounded bg-muted px-1.5 py-0.5">xometry.com</code>, or your own domain.
              </p>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
