import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const searchSchema = z.object({
  q: z.string().optional(),
});

export const Route = createFileRoute("/cite/")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "cite.grow — Who do AI search engines actually cite?" },
      {
        name: "description",
        content:
          "Search a live index of citations from ChatGPT, Perplexity, Claude, and Google AI Overviews. Ranked by real frequency.",
      },
      { property: "og:title", content: "cite.grow — Who do AI search engines actually cite?" },
      {
        property: "og:description",
        content:
          "Search a live index of citations from ChatGPT, Perplexity, Claude, and Google AI Overviews.",
      },
    ],
  }),
  component: CiteIndex,
});

const TRENDING = [
  "vector databases",
  "AI coding assistants",
  "LLM infrastructure",
  "AI observability",
  "embedding models",
  "RAG frameworks",
];

type Row = {
  domain: string;
  total_events: number;
  cited_events: number;
  cited_pct: number;
  engines_seen: number;
  last_event: string;
};

function CiteIndex() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { q } = Route.useSearch();
  const [input, setInput] = useState(q ?? "");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setInput(q ?? "");
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        let query = supabase
          .from("citation_events_24h_by_domain")
          .select("*")
          .order("total_events", { ascending: false })
          .limit(25);
        if (q && q.trim()) {
          query = query.ilike("domain", `%${q.trim()}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        if (!cancelled) setRows((data ?? []) as Row[]);
      } catch (e) {
        if (!cancelled) setErr((e as Error).message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [q]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    navigate({ search: { q: input.trim() || undefined } });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 w-full">
        <header className="mb-12 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
            cite.grow · live index
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Who do AI search engines actually cite?
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Search real citations from ChatGPT, Perplexity, Claude, and Google AI Overviews —
            ranked by frequency from the last 24 hours.
          </p>
        </header>

        <form onSubmit={submit} className="flex gap-2 max-w-2xl mx-auto mb-6">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search a domain (e.g. pinecone.io)"
            className="font-mono"
            maxLength={120}
          />
          <Button type="submit">Search</Button>
        </form>

        {!q && (
          <div className="max-w-2xl mx-auto mb-12 flex flex-wrap gap-2 justify-center">
            <span className="font-mono text-xs uppercase text-muted-foreground mr-2 self-center">
              Trending:
            </span>
            {TRENDING.map((t) => (
              <button
                key={t}
                onClick={() => navigate({ search: { q: t } })}
                className="font-mono text-xs px-3 py-1 rounded-full border border-border hover:border-accent hover:text-accent transition-colors"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        <section>
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
            {q ? `Results for "${q}"` : "Most cited (24h)"}
          </h2>
          {loading && (
            <div className="font-mono text-sm text-muted-foreground py-8">Loading…</div>
          )}
          {err && (
            <div className="font-mono text-sm text-destructive py-8">Error: {err}</div>
          )}
          {!loading && !err && rows.length === 0 && (
            <div className="font-mono text-sm text-muted-foreground py-8">
              No citations yet. The Loop is still warming up — check back shortly.
            </div>
          )}
          <ul className="divide-y divide-border border border-border rounded-lg overflow-hidden">
            {rows.map((r, i) => (
              <li key={r.domain} className="p-5 hover:bg-muted/40 transition-colors">
                <Link
                  to="/cite/$domain"
                  params={{ domain: r.domain }}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-xs text-muted-foreground w-6">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="font-semibold text-base truncate">{r.domain}</span>
                    </div>
                    <div className="font-mono text-xs text-muted-foreground ml-9">
                      {r.cited_events}/{r.total_events} cited · {r.cited_pct ?? 0}% · {r.engines_seen} engines
                    </div>
                  </div>
                  <span className="font-mono text-accent text-sm whitespace-nowrap">
                    {r.total_events} cites →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Not cited enough?{" "}
          <Link to="/why" className="text-accent hover:underline">
            Run a why.grow diagnostic →
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
