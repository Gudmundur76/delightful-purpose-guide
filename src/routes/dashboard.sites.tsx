import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { callPlatform } from "@/lib/dashboard/platform-client";

export const Route = createFileRoute("/dashboard/sites")({
  component: SitesPage,
});

type Site = {
  id: string;
  domain: string;
  plan: string;
  ccs_score: number | null;
  status: string;
  last_auto_fix_at: string | null;
  notify_email: string | null;
  install_token: string;
  created_at: string;
  auto_fire_enabled: boolean;
};

function scoreColor(s: number | null) {
  if (s === null) return "text-muted-foreground";
  if (s >= 70) return "text-green-500";
  if (s >= 50) return "text-yellow-500";
  return "text-destructive";
}

function SitesPage() {
  const [sites, setSites] = useState<Site[]>([]);
  const [stats, setStats] = useState<{ site_count: number; avg_ccs: number | null; fixes_30d: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPlan, setNewPlan] = useState("basic");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const [s, st] = await Promise.all([
        callPlatform<{ sites: Site[] }>("list_sites"),
        callPlatform<{ site_count: number; avg_ccs: number | null; fixes_30d: number }>("stats"),
      ]);
      setSites(s.sites);
      setStats(st);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "load failed");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { void load(); }, []);

  async function addSite(e: FormEvent) {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setSubmitting(true);
    setErr(null);
    try {
      await callPlatform("add_site", { domain: newDomain.trim(), owner_email: newEmail.trim() || undefined, plan: newPlan });
      setNewDomain(""); setNewEmail(""); setNewPlan("basic"); setShowAdd(false);
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "add failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Overview cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="HOSTED SITES" value={stats?.site_count ?? "—"} />
        <StatCard label="AVG CCS" value={stats?.avg_ccs ?? "—"} accent={scoreColor(stats?.avg_ccs ?? null)} />
        <StatCard label="AUTO-FIXES · 30D" value={stats?.fixes_30d ?? "—"} />
      </div>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold uppercase tracking-tighter">// SITES</h1>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest px-4 py-2 hover:opacity-90"
        >
          {showAdd ? "× CANCEL" : "+ ADD SITE"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addSite} className="border border-border bg-card p-6 space-y-4">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Domain</label>
            <input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              required
              className="w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Owner email</label>
              <input
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="optional"
                className="w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Plan</label>
              <select
                value={newPlan}
                onChange={(e) => setNewPlan(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
              >
                <option value="basic">basic</option>
                <option value="pro">pro</option>
                <option value="enterprise">enterprise</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest px-4 py-2 hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "ADDING…" : "ADD SITE →"}
          </button>
        </form>
      )}

      {err && <div className="border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">{err}</div>}

      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">CCS</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Auto-Fix</th>
              <th className="px-4 py-3">Auto-Fire</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">Loading…</td></tr>
            )}
            {!loading && sites.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center font-mono text-xs text-muted-foreground">No sites yet. Add one above.</td></tr>
            )}
            {sites.map((s) => (
              <tr
                key={s.id}
                onClick={() => navigate({ to: "/dashboard/sites/$domain", params: { domain: s.domain } })}
                className="border-t border-border hover:bg-muted/20 cursor-pointer"
              >
                <td className="px-4 py-3 font-mono">{s.domain}</td>
                <td className={`px-4 py-3 font-mono font-bold ${scoreColor(s.ccs_score)}`}>{s.ccs_score ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-xs uppercase">{s.plan}</td>
                <td className="px-4 py-3 font-mono text-xs uppercase">{s.status}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {s.last_auto_fix_at ? new Date(s.last_auto_fix_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{s.auto_fire_enabled ? "ON" : "OFF"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        // <Link to="/dashboard/auto-fixes" className="text-accent hover:underline">View all auto-fixes →</Link>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string | null; accent?: string }) {
  return (
    <div className="border border-border bg-card p-5">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className={`text-3xl font-extrabold tracking-tighter ${accent ?? ""}`}>{value ?? "—"}</div>
    </div>
  );
}
