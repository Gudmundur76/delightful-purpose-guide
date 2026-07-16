import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { runPerplexityEngine } from "@/lib/tools/perplexity-engine.functions";
import { Loader2, Sparkles, Trophy, AlertTriangle, ExternalLink, Copy } from "lucide-react";

const URL_ = "https://grow.contact/tools/perplexity-answer-engine";
const TITLE = "Free Perplexity Answer Engine — write the answer Perplexity picks";
const DESC =
  "Type any question. We simulate what Perplexity would answer today, then engineer the citation-ready answer block (lead, stats, FAQ, JSON-LD) that Perplexity would pick over the incumbent — with a self-scored Perplexity Pick Score.";

export const Route = createFileRoute("/tools/perplexity-answer-engine")({
  component: Page,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL_ },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...ogImageMeta({
        title: "Write the answer Perplexity picks",
        kicker: "grow.contact / tools",
        sub: "Simulates Perplexity's current answer, then engineers a citation-ready block designed to displace the incumbent.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
  }),
});

function copy(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(text);
}

function Page() {
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("");
  const [angle, setAngle] = useState("");
  const runFn = useServerFn(runPerplexityEngine);
  const mut = useMutation({
    mutationFn: async (input: { query: string; domain?: string; angle?: string }) => runFn({ data: input }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    mut.mutate({
      query: query.trim(),
      domain: domain.trim() || undefined,
      angle: angle.trim() || undefined,
    });
  };

  const data = mut.data;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-4xl px-6 py-14">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free tool</p>
            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Perplexity Answer Engine
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              First we act as Perplexity and answer your question live. Then we engineer the
              answer block Perplexity would prefer over the incumbent — front-loaded lead,
              dated stat lines, Q/A pairs, a Reddit-style rewrite, and ready-to-paste JSON-LD —
              and score how likely Perplexity is to pick it.
            </p>

            <form onSubmit={submit} className="mt-6 grid gap-3">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. what is the best free llms.txt generator in 2026"
                aria-label="Query"
                className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Publishing domain (optional)"
                  aria-label="Domain"
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={angle}
                  onChange={(e) => setAngle(e.target.value)}
                  placeholder="Angle you want to push (optional)"
                  aria-label="Angle"
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <button
                type="submit"
                disabled={mut.isPending}
                className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Run engine
              </button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Three sequential model calls — usually 15–35 seconds. Nothing is stored.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10 space-y-8">
          {mut.isError && (
            <p className="text-sm text-destructive">
              {mut.error instanceof Error ? mut.error.message : "Request failed."}
            </p>
          )}

          {data && (
            <>
              {/* Score */}
              <div className="rounded-md border border-border bg-card p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      Perplexity Pick Score
                    </div>
                    <div className="mt-1 text-4xl font-semibold">{data.pick.score}</div>
                    <p className="mt-2 text-sm text-muted-foreground max-w-xl">{data.pick.vsIncumbent}</p>
                  </div>
                  <Trophy className="h-10 w-10 text-primary/70" />
                </div>
                {(data.pick.wins.length > 0 || data.pick.risks.length > 0) && (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Wins</div>
                      <ul className="space-y-1 text-sm">
                        {data.pick.wins.map((w) => <li key={w}>· {w}</li>)}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Risks
                      </div>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {data.pick.risks.map((r) => <li key={r}>· {r}</li>)}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Simulation */}
              <div className="rounded-md border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">What Perplexity answers right now</h2>
                  {data.simulation.incumbent && (
                    <span className="text-xs text-muted-foreground">
                      Incumbent: <span className="font-medium text-foreground">{data.simulation.incumbent}</span>
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm whitespace-pre-wrap text-muted-foreground">
                  {data.simulation.answer}
                </p>
                {data.simulation.citations.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Sources</div>
                    <ul className="space-y-1">
                      {data.simulation.citations.map((c) => (
                        <li key={c.domain} className="text-xs break-all">
                          {c.url ? (
                            <a href={c.url} target="_blank" rel="noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                              {c.domain} <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span>{c.domain}</span>
                          )}
                          {c.quote && <span className="text-muted-foreground"> — “{c.quote}”</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Engineered answer */}
              <div className="rounded-md border border-primary/30 bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-primary">Engineered answer block</div>
                    <h2 className="mt-1 text-lg font-semibold">{data.engineered.title}</h2>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed"><strong>Lead (40–60 words).</strong> {data.engineered.answerFirst}</p>

                {data.engineered.statLines.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Stat lines</div>
                    <ul className="space-y-1 text-sm">
                      {data.engineered.statLines.map((s, i) => (
                        <li key={i}>· {s.stat} <span className="text-muted-foreground">— {s.source} ({s.date})</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                {data.engineered.bullets.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Key bullets</div>
                    <ul className="space-y-1 text-sm">
                      {data.engineered.bullets.map((b, i) => <li key={i}>· {b}</li>)}
                    </ul>
                  </div>
                )}

                {data.engineered.faqs.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">FAQs</div>
                    <dl className="space-y-3">
                      {data.engineered.faqs.map((f, i) => (
                        <div key={i}>
                          <dt className="text-sm font-medium">{f.q}</dt>
                          <dd className="text-sm text-muted-foreground">{f.a}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {data.engineered.redditRewrite && (
                  <div className="mt-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      Reddit-style rewrite (Perplexity cites Reddit ~24% of the time)
                    </div>
                    <p className="text-sm whitespace-pre-wrap text-muted-foreground">{data.engineered.redditRewrite}</p>
                  </div>
                )}

                {data.engineered.jsonLd && (
                  <div className="mt-5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">JSON-LD (paste in &lt;head&gt;)</div>
                      <button
                        onClick={() => copy(data.engineered.jsonLd)}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <Copy className="h-3 w-3" /> Copy
                      </button>
                    </div>
                    <pre className="text-[11px] bg-muted/40 border border-border rounded p-3 overflow-x-auto">
                      {data.engineered.jsonLd}
                    </pre>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground">
                Generated {new Date(data.generatedAt).toLocaleString()}.
              </p>
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
