import { useState, type FormEvent } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { analyzeAgentView } from "@/lib/agent-view.functions";

type Result = Awaited<ReturnType<typeof analyzeAgentView>>;

function Signal({ label, pass, detail }: { label: string; pass: boolean; detail: string }) {
  return (
    <div className="border border-border p-4 bg-background">
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <span
          className={
            pass
              ? "font-mono text-xs px-2 py-0.5 bg-accent text-accent-foreground"
              : "font-mono text-xs px-2 py-0.5 bg-destructive text-destructive-foreground"
          }
        >
          {pass ? "PASS" : "FAIL"}
        </span>
      </div>
      <p className="text-sm text-foreground leading-snug">{detail}</p>
    </div>
  );
}

export function AgentViewPanel() {
  const [url, setUrl] = useState("");
  const run = useServerFn(analyzeAgentView);
  const mutation = useMutation({
    mutationFn: (target: string) => run({ data: { url: target } }),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    let target = url.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) target = `https://${target}`;
    mutation.mutate(target);
  };

  const result = mutation.data as Result | undefined;

  return (
    <section className="border-t border-border bg-card/20" aria-label="What the agent sees">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">// Live demo</p>
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-3">
          What an AI agent sees when it reads your site
        </h2>
        <p className="text-muted-foreground text-sm md:text-base mb-8 max-w-2xl">
          Three signals decide whether ChatGPT, Perplexity, Claude or Gemini cite you: structured
          data, content clarity, and a machine-readable surface. Paste any URL — we check all three.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-8">
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://your-site.com"
            className="flex-1 bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent"
            aria-label="URL to analyze"
          />
          <button
            type="submit"
            disabled={mutation.isPending || !url.trim()}
            className="bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter text-sm hover:bg-foreground hover:text-background transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Scanning…" : "See what the agent sees"}
          </button>
        </form>

        {mutation.isError && (
          <p className="text-destructive text-sm font-mono">
            Failed to analyze. {(mutation.error as Error).message}
          </p>
        )}

        {result && !result.ok && (
          <p className="text-destructive text-sm font-mono">{result.error}</p>
        )}

        {result && result.ok && (
          <div className="space-y-6">
            <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
              <p className="font-mono text-xs text-muted-foreground break-all">{result.url}</p>
              <p className="font-mono text-xs">
                <span className="text-muted-foreground">Signals passed: </span>
                <span className="text-foreground font-bold">{result.signalsPassed}/3</span>
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-px bg-border border border-border">
              <Signal
                label="1. Structured data"
                pass={result.schema.pass}
                detail={
                  result.schema.valid > 0
                    ? `${result.schema.valid} valid JSON-LD block${result.schema.valid === 1 ? "" : "s"}${result.schema.types.length ? ` (${result.schema.types.slice(0, 4).join(", ")})` : ""}.`
                    : "No valid JSON-LD found. Agents can't tell what this page is about."
                }
              />
              <Signal
                label="2. Content clarity"
                pass={result.clarity.pass}
                detail={
                  result.clarity.pass
                    ? `Score ${result.clarity.score}/100. Clear title, description, headings, and readable body.`
                    : `Score ${result.clarity.score}/100. ${result.clarity.reasons.slice(0, 2).join("; ")}.`
                }
              />
              <Signal
                label="3. Machine surface"
                pass={result.api.pass}
                detail={
                  result.api.pass
                    ? "Exposes an MCP, API catalog, or OpenAPI surface — agents can plug in."
                    : "No MCP / agent-skills / OpenAPI endpoint. Agents can read but can't act."
                }
              />
            </div>

            <details className="border border-border bg-background">
              <summary className="cursor-pointer px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                Endpoint probe ({result.endpoints.filter((e) => e.found).length}/{result.endpoints.length} found)
              </summary>
              <ul className="px-4 pb-4 space-y-1">
                {result.endpoints.map((e) => (
                  <li key={e.path} className="font-mono text-xs flex items-center gap-3">
                    <span
                      className={
                        e.found ? "text-accent w-4 inline-block" : "text-muted-foreground w-4 inline-block"
                      }
                    >
                      {e.found ? "✓" : "·"}
                    </span>
                    <span className="text-muted-foreground">{e.path}</span>
                    <span className="text-muted-foreground/60 ml-auto">
                      {e.status || "—"} {e.label}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </div>
    </section>
  );
}
