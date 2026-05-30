import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/cite/$domain")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.domain} — AI citation profile · cite.grow` },
      {
        name: "description",
        content: `Live citation profile for ${params.domain} across ChatGPT, Perplexity, Claude, and Google AI Overviews.`,
      },
      { property: "og:title", content: `${params.domain} — AI citation profile` },
      {
        property: "og:description",
        content: `How often AI search engines cite ${params.domain}, broken down by engine.`,
      },
      ...ogImageMeta({
        title: params.domain,
        kicker: "AI Citation Profile",
        sub: `How often AI engines cite ${params.domain}`,
      }),
    ],
  }),
  component: CiteProfile,
});

type Summary = {
  domain: string;
  total_events: number;
  cited_events: number;
  cited_pct: number;
  engines_seen: number;
  last_event: string | null;
};

type EngineRow = { engine: string; total: number; cited: number };

function CiteProfile() {
  const { domain } = Route.useParams();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byEngine, setByEngine] = useState<EngineRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const [sumRes, evRes] = await Promise.all([
          supabase
            .from("citation_events_24h_by_domain")
            .select("*")
            .eq("domain", domain)
            .maybeSingle(),
          supabase
            .from("citation_events")
            .select("engine, domain_was_cited")
            .eq("domain_queried", domain)
            .gte("queried_at", new Date(Date.now() - 24 * 3600 * 1000).toISOString()),
        ]);
        if (sumRes.error) throw sumRes.error;
        if (evRes.error) throw evRes.error;
        if (cancelled) return;
        setSummary(sumRes.data as Summary | null);
        const agg = new Map<string, EngineRow>();
        for (const r of (evRes.data ?? []) as Array<{ engine: string; domain_was_cited: boolean }>) {
          const cur = agg.get(r.engine) ?? { engine: r.engine, total: 0, cited: 0 };
          cur.total += 1;
          if (r.domain_was_cited) cur.cited += 1;
          agg.set(r.engine, cur);
        }
        setByEngine([...agg.values()].sort((a, b) => b.cited - a.cited));
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
  }, [domain]);

  const totalCited = byEngine.reduce((a, b) => a + b.cited, 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
        <Link to="/cite" className="font-mono text-xs text-muted-foreground hover:text-accent">
          ← cite.grow
        </Link>

        <header className="mt-6 mb-10 border-b border-border pb-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
            citation profile · last 24h
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">{domain}</h1>
          {summary && (
            <div className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
              <Stat label="Total queries" value={summary.total_events} />
              <Stat label="Cited" value={summary.cited_events} />
              <Stat label="Cited %" value={`${summary.cited_pct ?? 0}%`} />
              <Stat label="Engines" value={summary.engines_seen} />
            </div>
          )}
        </header>

        {loading && <div className="font-mono text-sm text-muted-foreground">Loading…</div>}
        {err && <div className="font-mono text-sm text-destructive">Error: {err}</div>}

        {!loading && !err && !summary && (
          <div className="font-mono text-sm text-muted-foreground py-8">
            No citation data for <span className="text-foreground">{domain}</span> in the last 24 hours.{" "}
            <Link to="/why" className="text-accent hover:underline">
              Diagnose why →
            </Link>
          </div>
        )}

        {summary && (
          <section className="mb-10">
            <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4">
              By engine
            </h2>
            <div className="space-y-3">
              {byEngine.map((e) => {
                const pct = totalCited > 0 ? Math.round((e.cited / totalCited) * 100) : 0;
                return (
                  <div key={e.engine}>
                    <div className="flex justify-between font-mono text-sm mb-1">
                      <span className="capitalize">{e.engine}</span>
                      <span className="text-muted-foreground">
                        {e.cited}/{e.total} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded overflow-hidden">
                      <div
                        className="h-full bg-accent transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              {byEngine.length === 0 && (
                <div className="font-mono text-sm text-muted-foreground">No per-engine data yet.</div>
              )}
            </div>
          </section>
        )}

        <div className="mt-12 border border-border rounded-lg p-6 bg-muted/30 flex flex-wrap gap-3 items-center justify-between">
          <div>
            <div className="font-semibold mb-1">Why isn&apos;t this domain cited more?</div>
            <div className="text-sm text-muted-foreground">
              Get a free diagnostic with the top 2 reasons in 30 seconds.
            </div>
          </div>
          <Link
            to="/why/$domain"
            params={{ domain }}
            className="font-mono text-sm px-4 py-2 rounded-md bg-accent text-accent-foreground hover:opacity-90"
          >
            Run why.grow →
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-foreground font-semibold">{value}</div>
    </div>
  );
}
