import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listApiKeyRequests,
  approveApiKeyRequest,
  rejectApiKeyRequest,
  type ApiKeyRequest,
} from "@/lib/admin/api-keys.functions";

export const Route = createFileRoute("/admin/api-keys")({
  head: () => ({
    meta: [
      { title: "Admin · API key requests — Grow" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw redirect({ to: "/login" });
  },
  component: AdminApiKeysPage,
});

type IssuedKey = { requestId: string; plaintext: string; email: string };

function statusBadge(s: string) {
  const base = "px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest border";
  if (s === "approved") return `${base} border-emerald-500/60 text-emerald-600 bg-emerald-500/10`;
  if (s === "rejected") return `${base} border-destructive/60 text-destructive bg-destructive/10`;
  return `${base} border-accent/60 text-accent bg-accent/10`;
}

function AdminApiKeysPage() {
  const fetchRequests = useServerFn(listApiKeyRequests);
  const approve = useServerFn(approveApiKeyRequest);
  const reject = useServerFn(rejectApiKeyRequest);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["admin", "api-key-requests"],
    queryFn: () => fetchRequests(),
  });

  const [issued, setIssued] = useState<IssuedKey | null>(null);
  const [working, setWorking] = useState<string | null>(null);
  const [filter, setFilter] = useState<"pending" | "all">("pending");

  const requests: ApiKeyRequest[] = data?.requests ?? [];
  const filtered =
    filter === "pending"
      ? requests.filter((r) => r.status === "pending")
      : requests;

  async function handleApprove(req: ApiKeyRequest) {
    const userId = window.prompt(
      `Approve ${req.email}.\n\nPaste the Supabase user_id this key belongs to:`,
    );
    if (!userId) return;
    setWorking(req.id);
    try {
      const res = await approve({
        data: { requestId: req.id, userId, keyName: `${req.plan} · ${req.email}` },
      });
      setIssued({ requestId: req.id, plaintext: res.plaintext, email: req.email });
      await refetch();
    } catch (e) {
      alert(`Failed: ${(e as Error).message}`);
    } finally {
      setWorking(null);
    }
  }

  async function handleReject(req: ApiKeyRequest) {
    const reason = window.prompt(`Reject ${req.email}? Reason (optional):`);
    if (reason === null) return;
    setWorking(req.id);
    try {
      await reject({ data: { requestId: req.id, reason: reason || undefined } });
      await refetch();
    } finally {
      setWorking(null);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-1">
              // ADMIN · API KEY REQUESTS
            </p>
            <h1 className="text-2xl font-extrabold tracking-tighter">Issue analyst keys</h1>
          </div>
          <Link to="/admin/leads" className="font-mono text-xs text-muted-foreground hover:text-accent">
            ← back to admin
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {issued && (
          <div className="border border-emerald-500/60 bg-emerald-500/10 rounded p-4 space-y-2">
            <div className="font-mono text-xs uppercase tracking-widest text-emerald-700">
              KEY MINTED · COPY NOW · CANNOT BE SHOWN AGAIN
            </div>
            <div className="text-sm">For: <span className="font-semibold">{issued.email}</span></div>
            <code className="block bg-background border border-border rounded px-3 py-2 font-mono text-sm break-all">
              {issued.plaintext}
            </code>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(issued.plaintext)}
                className="font-mono text-xs px-3 py-1.5 bg-accent text-accent-foreground rounded hover:opacity-90"
              >
                Copy
              </button>
              <button
                type="button"
                onClick={() => setIssued(null)}
                className="font-mono text-xs px-3 py-1.5 border border-border rounded hover:bg-muted"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {(["pending", "all"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`font-mono text-xs px-3 py-1.5 border rounded ${
                filter === f
                  ? "bg-accent text-accent-foreground border-accent"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {f} ({f === "pending" ? requests.filter((r) => r.status === "pending").length : requests.length})
            </button>
          ))}
        </div>

        {isLoading && <p className="font-mono text-sm text-muted-foreground">Loading…</p>}
        {error && (
          <p className="font-mono text-sm text-destructive">
            Error: {(error as Error).message}
          </p>
        )}

        {!isLoading && filtered.length === 0 && (
          <p className="font-mono text-sm text-muted-foreground py-8">
            // no {filter === "pending" ? "pending" : ""} requests
          </p>
        )}

        <div className="space-y-3">
          {filtered.map((req) => (
            <div
              key={req.id}
              className="border border-border rounded p-4 bg-card/40 grid md:grid-cols-[1fr_auto] gap-4"
            >
              <div className="space-y-2 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{req.email}</span>
                  <span className={statusBadge(req.status)}>{req.status}</span>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {req.plan}
                  </span>
                </div>
                {req.company && (
                  <div className="font-mono text-xs text-muted-foreground">
                    {req.company}
                  </div>
                )}
                {req.use_case && (
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {req.use_case}
                  </div>
                )}
                <div className="font-mono text-[10px] text-muted-foreground">
                  {new Date(req.created_at).toLocaleString()}
                </div>
              </div>
              {req.status === "pending" && (
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={working === req.id}
                    onClick={() => handleApprove(req)}
                    className="font-mono text-xs px-3 py-2 bg-accent text-accent-foreground rounded hover:opacity-90 disabled:opacity-50"
                  >
                    {working === req.id ? "…" : "Approve & mint key"}
                  </button>
                  <button
                    type="button"
                    disabled={working === req.id}
                    onClick={() => handleReject(req)}
                    className="font-mono text-xs px-3 py-2 border border-border rounded hover:bg-muted disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
