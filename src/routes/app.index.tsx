import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listMonitoredSites,
  addMonitoredSite,
  deleteMonitoredSite,
  updateMonitoredSite,
} from "@/lib/monitoring/sites.functions";

export const Route = createFileRoute("/app/")({
  component: SitesPage,
});

function SitesPage() {
  const listFn = useServerFn(listMonitoredSites);
  const addFn = useServerFn(addMonitoredSite);
  const delFn = useServerFn(deleteMonitoredSite);
  const updFn = useServerFn(updateMonitoredSite);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["monitoring", "sites"],
    queryFn: () => listFn(),
  });

  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [threshold, setThreshold] = useState(5);
  const [alertEmail, setAlertEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addMut = useMutation({
    mutationFn: () => addFn({ data: {
      url, label: label || undefined,
      alert_threshold: threshold,
      alert_email: alertEmail || undefined,
    }}),
    onSuccess: () => {
      setUrl(""); setLabel(""); setAlertEmail(""); setError(null);
      qc.invalidateQueries({ queryKey: ["monitoring", "sites"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["monitoring", "sites"] }),
  });
  const togglePauseMut = useMutation({
    mutationFn: ({ id, paused }: { id: string; paused: boolean }) =>
      updFn({ data: { id, paused } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["monitoring", "sites"] }),
  });

  if (isLoading) return <p className="font-mono text-xs">loading…</p>;

  const sites = data?.sites ?? [];
  const plan = data?.plan;
  const usage = data?.usage;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-extrabold uppercase tracking-tighter text-3xl">Monitored Sites</h1>
        {plan && usage && (
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Plan: <span className="text-accent">{plan.name}</span> · {sites.length}/{plan.max_sites} sites ·{" "}
            {usage.used}/{usage.limit} scans this month · cadence {plan.scan_interval}
          </p>
        )}
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); addMut.mutate(); }}
        className="border border-border bg-card p-6 grid gap-4 sm:grid-cols-2"
      >
        <div className="sm:col-span-2">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">URL</label>
          <input
            required
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="mt-1 w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Marketing site"
            className="mt-1 w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Alert threshold (Δ score)
          </label>
          <input
            type="number" min={1} max={100}
            value={threshold}
            onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 5)}
            className="mt-1 w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Alert email (optional)</label>
          <input
            type="email"
            value={alertEmail}
            onChange={(e) => setAlertEmail(e.target.value)}
            placeholder="you@company.com"
            className="mt-1 w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
          />
        </div>
        {error && <p className="sm:col-span-2 font-mono text-xs text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={addMut.isPending}
          className="sm:col-span-2 bg-accent text-accent-foreground font-bold uppercase tracking-tighter py-3 disabled:opacity-50"
        >
          {addMut.isPending ? "Adding…" : "Add site"}
        </button>
      </form>

      <section>
        {sites.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">No monitored sites yet.</p>
        ) : (
          <table className="w-full border border-border bg-card text-sm">
            <thead className="bg-background/40">
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="p-3">URL</th>
                <th className="p-3">Score</th>
                <th className="p-3">Last scan</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {sites.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="font-bold truncate max-w-[260px]">{s.label || s.url}</div>
                    <div className="font-mono text-[10px] text-muted-foreground truncate max-w-[260px]">{s.url}</div>
                  </td>
                  <td className="p-3 font-mono">{s.last_score ?? "—"}</td>
                  <td className="p-3 font-mono text-xs">
                    {s.last_scanned_at ? new Date(s.last_scanned_at).toLocaleString() : "pending"}
                  </td>
                  <td className="p-3 font-mono text-xs">{s.paused ? "paused" : "active"}</td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => togglePauseMut.mutate({ id: s.id, paused: !s.paused })}
                      className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
                    >
                      {s.paused ? "Resume" : "Pause"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { if (confirm("Delete this site?")) delMut.mutate(s.id); }}
                      className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
