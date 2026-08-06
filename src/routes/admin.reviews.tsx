import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listReviews,
  decideReview,
  type ReviewRow,
} from "@/lib/admin/reviews.functions";

export const Route = createFileRoute("/admin/reviews")({
  head: () => ({
    meta: [
      { title: "Admin · Reviews — Grow" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login", search: { redirect: window.location.pathname } as never });
  },
  component: AdminReviewsPage,
});

type Filter = "pending" | "approved" | "rejected" | "all";

function statusBadge(status: string) {
  const base =
    "px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border";
  if (status === "pending")
    return `${base} border-yellow-500/60 text-yellow-500 bg-yellow-500/10`;
  if (status === "approved")
    return `${base} border-accent text-accent bg-accent/10`;
  if (status === "rejected")
    return `${base} border-destructive text-destructive bg-destructive/10`;
  return `${base} border-border text-muted-foreground`;
}

function AdminReviewsPage() {
  const fetchReviews = useServerFn(listReviews);
  const decide = useServerFn(decideReview);
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: () => fetchReviews(),
  });
  const [filter, setFilter] = useState<Filter>("pending");
  const [busyId, setBusyId] = useState<string | null>(null);

  const reviews: ReviewRow[] = data?.reviews ?? [];
  const filtered =
    filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    all: reviews.length,
  };

  async function handleDecide(
    id: string,
    status: "approved" | "rejected",
  ) {
    const note = window.prompt(`Optional note for ${status}:`, "") ?? "";
    setBusyId(id);
    try {
      await decide({
        data: { id, status, review_notes: note || undefined },
      });
      await qc.invalidateQueries({ queryKey: ["admin", "reviews"] });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-accent">
              // ADMIN //
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight uppercase mt-1">
              Review queue
            </h1>
            <p className="text-sm text-muted-foreground mt-2 font-mono">
              Agent-submitted previews awaiting human approval.
            </p>
          </div>
          <Link
            to="/admin/leads"
            className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            → Leads
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["pending", "approved", "rejected", "all"] as Filter[]).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 text-xs font-mono uppercase tracking-widest border ${
                filter === k
                  ? "border-accent text-accent bg-accent/10"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {k} ({counts[k]})
            </button>
          ))}
        </div>

        {isLoading && (
          <p className="font-mono text-sm text-muted-foreground">Loading…</p>
        )}
        {error && (
          <p className="font-mono text-sm text-destructive">
            {(error as Error).message}
          </p>
        )}

        <div className="space-y-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="border border-border bg-card p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={statusBadge(r.status)}>{r.status}</span>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                    {r.submitted_by && (
                      <span className="text-[10px] font-mono text-muted-foreground">
                        by {r.submitted_by}
                      </span>
                    )}
                  </div>
                  <h2 className="text-sm font-mono mt-2 break-all">
                    {r.project_id}
                  </h2>
                  <a
                    href={r.preview_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-accent hover:underline break-all"
                  >
                    {r.preview_url} →
                  </a>
                  {r.notes && (
                    <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">
                      {r.notes}
                    </p>
                  )}
                  {r.review_notes && (
                    <p className="text-xs font-mono text-muted-foreground mt-3 border-l-2 border-border pl-3">
                      // REVIEWER: {r.review_notes}
                    </p>
                  )}
                </div>
                {r.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleDecide(r.id, "approved")}
                      className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-accent text-accent hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleDecide(r.id, "rejected")}
                      className="px-3 py-1.5 text-xs font-mono uppercase tracking-widest border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </article>
          ))}
          {!isLoading && filtered.length === 0 && (
            <p className="font-mono text-sm text-muted-foreground py-12 text-center border border-dashed border-border">
              // NO {filter.toUpperCase()} REVIEWS
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
