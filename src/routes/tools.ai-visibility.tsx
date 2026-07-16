import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { checkAiVisibility, type EngineResult } from "@/lib/tools/ai-visibility.functions";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

const URL_ = "https://citation.is/tools/ai-visibility";
const TITLE = "Free AI visibility checker — does ChatGPT and Gemini cite you?";
const DESC =
  "Ask a real buyer question. We query Gemini (web-grounded) and GPT and tell you whether your domain shows up in the answer or gets cited. Free, live, per-engine, no signup.";

export const Route = createFileRoute("/tools/ai-visibility")({
  component: AiVisibility,
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
        title: "Does ChatGPT and Gemini cite you?",
        kicker: "citation.is / tools",
        sub: "Free live AI visibility check. Ask a real buyer question — see which engines mention your domain in the answer.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
  }),
});

function AiVisibility() {
  const [domain, setDomain] = useState("");
  const [query, setQuery] = useState("");
  const runFn = useServerFn(checkAiVisibility);
  const mut = useMutation({
    mutationFn: async (input: { domain: string; query: string }) => runFn({ data: input }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim() || !query.trim()) return;
    mut.mutate({ domain: domain.trim(), query: query.trim() });
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
              AI visibility checker
            </h1>
            <p className="mt-3 text-muted-foreground max-w-2xl">
              Ask a real question. We forward it to Gemini (web-grounded) and GPT, then tell you
              which engines mention your domain — or cite it — in the answer.
            </p>

            <form onSubmit={submit} className="mt-6 grid gap-3">
              <input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="your-domain.com"
                aria-label="Your domain"
                className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. best free llms.txt generator"
                aria-label="Query to test"
                className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={mut.isPending}
                className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Run check
              </button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              Live queries take 5–20 seconds. No signup. No history stored per session.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-10">
          {mut.isError && (
            <p className="text-sm text-destructive">Request failed. Try again in a moment.</p>
          )}

          {data && (
            <div className="space-y-5">
              <div className="rounded-md border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Query:</span>{" "}
                    <span className="font-medium">{data.query}</span>
                    <span className="mx-2 text-muted-foreground">·</span>
                    <span className="text-muted-foreground">Domain:</span>{" "}
                    <span className="font-medium">{data.domain}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold">{data.score}</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      cite score
                    </div>
                  </div>
                </div>
              </div>

              {data.results.map((r: EngineResult) => (
                <div key={r.engine} className="rounded-md border border-border bg-card p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{r.engine}</h3>
                    <span
                      className={`inline-flex items-center gap-1 text-xs ${
                        r.cited ? "text-primary" : "text-muted-foreground"
                      }`}
                    >
                      {r.cited ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Cited · {r.mentions} mention(s)
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3.5 w-3.5" /> Not cited
                        </>
                      )}
                    </span>
                  </div>
                  {r.error ? (
                    <p className="mt-2 text-xs text-destructive">{r.error}</p>
                  ) : (
                    <>
                      <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                        {r.answer.slice(0, 900)}
                        {r.answer.length > 900 ? "…" : ""}
                      </p>
                      {r.citations.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            Sources returned
                          </p>
                          <ul className="mt-1 space-y-1">
                            {r.citations.slice(0, 8).map((c: string) => (
                              <li key={c} className="text-xs break-all">
                                <a
                                  href={c}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {c}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
