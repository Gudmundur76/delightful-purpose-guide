import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { listScoredLeads } from "@/lib/admin/leads.functions";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [
      { title: "Admin · Leads — Grow" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
  },
  component: AdminLeadsPage,
});

type TierFilter = "all" | "hot" | "warm" | "cold" | "unscored";

function tierBadge(tier: string | null) {
  const base = "px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border";
  if (tier === "hot") return `${base} border-accent text-accent bg-accent/10`;
  if (tier === "warm") return `${base} border-yellow-500/60 text-yellow-600 bg-yellow-500/10`;
  if (tier === "cold") return `${base} border-border text-muted-foreground`;
  return `${base} border-dashed border-border text-muted-foreground`;
}

function AdminLeadsPage() {
  const fetchLeads = useServerFn(listScoredLeads);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "leads"],
    queryFn: () => fetchLeads(),
  });
  const [filter, setFilter] = useState<TierFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const leads = (data?.leads ?? []) as Array<{
    id: string;
    created_at: string;
    name: string;
    email: string;
    budget_tier: string;
    message: string;
    qualification_score: number | null;
    qualification_tier: string | null;
    qualification_reasoning: string | null;
    qualification_suggested_tier: string | null;
    auto_reply_subject: string | null;
    auto_reply_body: string | null;
    auto_replied_at: string | null;
  }>;

  const filtered = leads.filter((l) => {
    if (filter === "all") return true;
    if (filter === "unscored") return !l.qualification_tier;
    return l.qualification_tier === filter;
  });

  const counts = {
    all: leads.length,
    hot: leads.filter((l) => l.qualification_tier === "hot").length,
    warm: leads.filter((l) => l.qualification_tier === "warm").length,
    cold: leads.filter((l) => l.qualification_tier === "cold").length,
    unscored: leads.filter((l) => !l.qualification_tier).length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              // Admin · Leads
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase">
              Inbox
            </h1>
          </div>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← Site
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "hot", "warm", "cold", "unscored"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest border transition-colors ${
                filter === t
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t} · {counts[t]}
            </button>
          ))}
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-auto px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-border text-muted-foreground hover:text-foreground"
          >
            ↻ Refresh
          </button>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {error && (
          <p className="text-accent">
            Could not load leads. You may not have admin access.
          </p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="text-muted-foreground">No leads in this view.</p>
        )}

        <ul className="divide-y divide-border border border-border">
          {filtered.map((l) => {
            const open = expanded === l.id;
            return (
              <li key={l.id} className="bg-card">
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : l.id)}
                  className="w-full text-left px-4 py-4 flex items-start gap-4 hover:bg-muted/30"
                >
                  <div className="w-12 text-center">
                    <div className="text-2xl font-extrabold tabular-nums tracking-tighter">
                      {l.qualification_score ?? "—"}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold tracking-tight">{l.name}</span>
                      <span className="text-xs text-muted-foreground truncate">
                        {l.email}
                      </span>
                      <span className={tierBadge(l.qualification_tier)}>
                        {l.qualification_tier ?? "unscored"}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {l.message}
                    </p>
                  </div>
                  <div className="text-right shrink-0 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {new Date(l.created_at).toLocaleDateString()}
                  </div>
                </button>

                {open && (
                  <div className="px-4 pb-5 pt-1 grid sm:grid-cols-2 gap-4 border-t border-border bg-muted/10">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        // Their message
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{l.message}</p>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-4 mb-1">
                        // Self-reported budget
                      </p>
                      <p className="text-sm">{l.budget_tier}</p>
                      {l.qualification_reasoning && (
                        <>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-4 mb-1">
                            // AI reasoning
                          </p>
                          <p className="text-sm">{l.qualification_reasoning}</p>
                        </>
                      )}
                      {l.qualification_suggested_tier && (
                        <>
                          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-4 mb-1">
                            // Suggested tier
                          </p>
                          <p className="text-sm font-bold">
                            {l.qualification_suggested_tier}
                          </p>
                        </>
                      )}
                    </div>
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                        // Auto-reply sent
                      </p>
                      {l.auto_replied_at ? (
                        <>
                          <p className="text-xs text-muted-foreground mb-2">
                            {new Date(l.auto_replied_at).toLocaleString()}
                          </p>
                          <p className="text-sm font-bold mb-2">
                            {l.auto_reply_subject}
                          </p>
                          <p className="text-sm whitespace-pre-wrap">
                            {l.auto_reply_body}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No auto-reply on file.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
