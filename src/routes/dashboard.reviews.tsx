import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { callTool } from "@/lib/dashboard/mcp-client";

export const Route = createFileRoute("/dashboard/reviews")({
  component: ReviewsPage,
});

type Review = {
  id: string;
  project_id?: string | null;
  preview_url?: string | null;
  notes?: string | null;
  submitted_by?: string | null;
  created_at: string;
};

function ReviewsPage() {
  const [items, setItems] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const r = await callTool<{ reviews: Review[] }>("list_pending_reviews", { limit: 50 });
      setItems(r.reviews ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(id: string, status: "approved" | "rejected") {
    setBusy(id);
    try {
      await callTool("update_review_status", { id, status });
      setItems((xs) => xs.filter((x) => x.id !== id));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-10">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
          // REVIEW QUEUE
        </div>
        <h1 className="font-extrabold text-4xl sm:text-5xl uppercase tracking-tighter">
          Pending agent work
        </h1>
      </header>

      {err && (
        <div className="border border-destructive/40 bg-destructive/10 p-4 font-mono text-xs text-destructive">
          {err}
        </div>
      )}

      {loading ? (
        <div className="font-mono text-xs text-muted-foreground">// LOADING…</div>
      ) : items.length === 0 ? (
        <div className="border border-border p-10 text-center bg-card/40">
          <div className="font-mono text-xs uppercase tracking-widest text-accent">
            // QUEUE EMPTY · AGENTS RUNNING
          </div>
        </div>
      ) : (
        <div className="border border-border divide-y divide-border bg-card/40">
          {items.map((r) => (
            <div key={r.id} className="p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  // {r.project_id ?? r.id.slice(0, 8)}
                </div>
                <div className="font-extrabold uppercase tracking-tighter text-lg truncate">
                  {r.preview_url ?? "(no preview)"}
                </div>
                {r.notes && (
                  <div className="font-mono text-xs text-muted-foreground mt-1 line-clamp-2">
                    {r.notes}
                  </div>
                )}
                <div className="font-mono text-[10px] text-muted-foreground mt-1 tabular-nums">
                  {new Date(r.created_at).toLocaleString()} · {r.submitted_by ?? "unknown"}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => decide(r.id, "approved")}
                  disabled={busy === r.id}
                  className="bg-accent text-accent-foreground font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:opacity-90 disabled:opacity-50"
                >
                  APPROVE
                </button>
                <button
                  type="button"
                  onClick={() => decide(r.id, "rejected")}
                  disabled={busy === r.id}
                  className="border border-destructive text-destructive font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-destructive hover:text-destructive-foreground transition-colors disabled:opacity-50"
                >
                  REJECT
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
