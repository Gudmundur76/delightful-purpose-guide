import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { callPlatform } from "@/lib/dashboard/platform-client";

export const Route = createFileRoute("/dashboard/auto-fixes")({
  component: AutoFixesPage,
});

type Row = {
  id: string;
  site_id: string;
  kind: "schema" | "llms_txt" | "robots_txt";
  status: string;
  triggered_by: string;
  ccs_before: number | null;
  ccs_after: number | null;
  preview_text: string | null;
  created_at: string;
  intervention_sites: { domain: string };
};

const KINDS = ["", "schema", "llms_txt", "robots_txt"];
const STATUSES = ["", "drafted", "approved", "live", "rejected", "superseded"];

function AutoFixesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const r = await callPlatform<{ interventions: Row[] }>("list_interventions", {
        kind: kind || undefined,
        status: status || undefined,
      });
      setRows(r.interventions);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "load failed");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, [kind, status]);

  async function approve(id: string) {
    await callPlatform("approve_intervention", { id });
    await load();
  }
  async function reject(id: string) {
    await callPlatform("reject_intervention", { id });
    await load();
  }

  const totalImpact = rows
    .filter((r) => r.status === "live" && r.ccs_before !== null && r.ccs_after !== null)
    .reduce((s, r) => s + ((r.ccs_after ?? 0) - (r.ccs_before ?? 0)), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold uppercase tracking-tighter">// AUTO-FIXES</h1>
        <div className="font-mono text-xs text-muted-foreground">
          Total CCS impact (live): <span className="text-accent font-bold">{totalImpact >= 0 ? "+" : ""}{totalImpact}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="bg-card border border-border px-3 py-2 font-mono text-xs uppercase">
          {KINDS.map((k) => <option key={k} value={k}>{k || "all kinds"}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-card border border-border px-3 py-2 font-mono text-xs uppercase">
          {STATUSES.map((s) => <option key={s} value={s}>{s || "all statuses"}</option>)}
        </select>
      </div>

      {err && <div className="border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">{err}</div>}

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Site</th>
              <th className="px-4 py-3">Kind</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Impact</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">No interventions match filters.</td></tr>}
            {rows.map((r) => {
              const impact = r.ccs_before !== null && r.ccs_after !== null ? r.ccs_after - r.ccs_before : null;
              return (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <Link to="/dashboard/sites/$domain" params={{ domain: r.intervention_sites.domain }} className="text-accent hover:underline">
                      {r.intervention_sites.domain}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs uppercase">{r.kind.replace("_", ".")}</td>
                  <td className={`px-4 py-3 font-mono text-xs uppercase ${
                    r.status === "live" ? "text-green-500" :
                    r.status === "drafted" ? "text-yellow-500" :
                    r.status === "rejected" ? "text-destructive" : "text-muted-foreground"
                  }`}>{r.status}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.triggered_by}</td>
                  <td className="px-4 py-3 font-mono text-xs">{impact === null ? "—" : `${impact >= 0 ? "+" : ""}${impact}`}</td>
                  <td className="px-4 py-3">
                    {r.status === "drafted" && (
                      <div className="flex gap-1">
                        <button onClick={() => approve(r.id)} className="font-mono text-[10px] uppercase px-2 py-1 bg-green-500/20 text-green-500 hover:bg-green-500/30">✓</button>
                        <button onClick={() => reject(r.id)} className="font-mono text-[10px] uppercase px-2 py-1 bg-destructive/20 text-destructive hover:bg-destructive/30">✗</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
