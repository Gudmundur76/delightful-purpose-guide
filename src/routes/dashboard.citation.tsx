import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { callTool } from "@/lib/dashboard/mcp-client";

export const Route = createFileRoute("/dashboard/citation")({
  component: CitationPage,
});

type ModelResult = {
  model: string;
  mentioned: boolean;
  answer?: string;
  matches?: string[];
  error?: string;
};

type CitationResponse = {
  host: string;
  query: string;
  results?: ModelResult[];
  models?: ModelResult[];
  any_mentioned?: boolean;
  [k: string]: unknown;
};

type HistoryItem = {
  at: string;
  host: string;
  query: string;
  response: CitationResponse;
};

const HISTORY_KEY = "dashboard_citation_history";

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 10)));
}

function CitationPage() {
  const [host, setHost] = useState("grow.contact");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<CitationResponse | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function run() {
    if (!query.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const r = await callTool<CitationResponse>("check_ai_citation", {
        host: host.trim(),
        query: query.trim(),
      });
      setResult(r);
      const next = [
        { at: new Date().toISOString(), host: host.trim(), query: query.trim(), response: r },
        ...history,
      ].slice(0, 10);
      setHistory(next);
      saveHistory(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const models = result?.results ?? result?.models ?? [];

  return (
    <div className="space-y-10">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
          // AI CITATION MONITOR
        </div>
        <h1 className="font-extrabold text-4xl sm:text-5xl uppercase tracking-tighter">
          Does AI say your name?
        </h1>
        <p className="mt-3 font-mono text-xs text-muted-foreground max-w-2xl">
          // Probes Gemini and GPT with your query. Reports which models mention your host.
        </p>
      </header>

      <div className="border border-border p-6 bg-card/40 space-y-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            // QUERY
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            rows={3}
            placeholder="best generative engine optimization agency"
            className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent resize-none"
          />
        </div>
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            // HOST
          </label>
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <button
          type="button"
          onClick={run}
          disabled={loading || !query.trim()}
          className="bg-accent text-accent-foreground font-bold uppercase tracking-tighter px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "PROBING…" : "CHECK CITATION →"}
        </button>
        {err && <p className="font-mono text-xs text-destructive">{err}</p>}
      </div>

      {result && (
        <section className="space-y-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            // RESULTS · {models.length} MODELS
          </div>
          {models.map((m, i) => (
            <div key={i} className="border border-border p-5 bg-card/40">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs uppercase tracking-widest text-foreground">
                  {m.model}
                </span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 ${
                    m.mentioned
                      ? "bg-accent text-accent-foreground"
                      : "border border-border text-muted-foreground"
                  }`}
                >
                  {m.mentioned ? "MENTIONED" : "NOT MENTIONED"}
                </span>
              </div>
              {m.error && (
                <p className="font-mono text-xs text-destructive">{m.error}</p>
              )}
              {m.answer && (
                <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {m.answer}
                </p>
              )}
              {m.matches && m.matches.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {m.matches.map((mt, j) => (
                    <span
                      key={j}
                      className="font-mono text-[10px] uppercase border border-accent/40 text-accent px-2 py-1"
                    >
                      {mt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      <section>
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
          // RUN HISTORY · LAST {history.length}
        </div>
        <div className="border border-border divide-y divide-border bg-card/20">
          {history.length === 0 && (
            <div className="p-4 font-mono text-xs text-muted-foreground">// NO RUNS YET</div>
          )}
          {history.map((h, i) => {
            const ms = h.response.results ?? h.response.models ?? [];
            const hits = ms.filter((m) => m.mentioned).length;
            return (
              <button
                type="button"
                key={i}
                onClick={() => {
                  setHost(h.host);
                  setQuery(h.query);
                  setResult(h.response);
                }}
                className="w-full text-left px-4 py-3 flex items-center gap-4 font-mono text-xs hover:bg-card/60 transition-colors"
              >
                <span className="text-accent tabular-nums min-w-[40px]">
                  {hits}/{ms.length}
                </span>
                <span className="flex-1 truncate text-foreground">{h.query}</span>
                <span className="text-muted-foreground hidden sm:inline">{h.host}</span>
                <span className="text-muted-foreground tabular-nums hidden sm:inline">
                  {new Date(h.at).toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
