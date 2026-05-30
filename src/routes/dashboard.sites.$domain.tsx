import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { callPlatform } from "@/lib/dashboard/platform-client";
import { callTool } from "@/lib/dashboard/mcp-client";

export const Route = createFileRoute("/dashboard/sites/$domain")({
  component: SiteDetail,
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
  auto_fire_enabled: boolean;
};

type Intervention = {
  id: string;
  kind: "schema" | "llms_txt" | "robots_txt";
  status: string;
  triggered_by: string;
  ccs_before: number | null;
  ccs_after: number | null;
  preview_text: string | null;
  created_at: string;
};

type CitationEvt = { queried_at: string; engine: string; domain_was_cited: boolean; cited_position: number | null };

function scoreColor(s: number | null) {
  if (s === null) return "text-muted-foreground";
  if (s >= 70) return "text-green-500";
  if (s >= 50) return "text-yellow-500";
  return "text-destructive";
}

function SiteDetail() {
  const { domain } = Route.useParams();
  const [site, setSite] = useState<Site | null>(null);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [citations, setCitations] = useState<CitationEvt[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [running, setRunning] = useState<string | null>(null);

  async function load() {
    try {
      const [s, i, c] = await Promise.all([
        callPlatform<{ site: Site | null }>("get_site", { domain }),
        callPlatform<{ interventions: Intervention[] }>("site_interventions", { domain }),
        callPlatform<{ events: CitationEvt[] }>("site_citations", { domain, days: 30 }),
      ]);
      setSite(s.site);
      setInterventions(i.interventions);
      setCitations(c.events);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "load failed");
    }
  }
  useEffect(() => { void load(); }, [domain]);

  async function runAutoFix(kind: "schema" | "llms_txt" | "robots_txt") {
    setRunning(kind);
    setErr(null);
    try {
      const tool = kind === "schema" ? "auto_fix_schema" : kind === "llms_txt" ? "auto_fix_llms_txt" : "auto_fix_robots_txt";
      await callTool(tool, { domain });
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "auto-fix failed");
    } finally {
      setRunning(null);
    }
  }

  async function approve(id: string) {
    await callPlatform("approve_intervention", { id });
    await load();
  }
  async function reject(id: string) {
    await callPlatform("reject_intervention", { id });
    await load();
  }
  async function toggleAutoFire() {
    if (!site) return;
    await callPlatform("update_site", { id: site.id, patch: { auto_fire_enabled: !site.auto_fire_enabled } });
    await load();
  }

  if (!site && !err) return <div className="font-mono text-xs text-muted-foreground">Loading…</div>;

  // Group citations by day, count cited
  const dayMap: Record<string, { total: number; cited: number }> = {};
  for (const c of citations) {
    const day = c.queried_at.slice(0, 10);
    if (!dayMap[day]) dayMap[day] = { total: 0, cited: 0 };
    dayMap[day].total++;
    if (c.domain_was_cited) dayMap[day].cited++;
  }
  const days = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b));
  const maxCited = Math.max(1, ...days.map(([, v]) => v.cited));

  return (
    <div className="space-y-8">
      <div>
        <Link to="/dashboard/sites" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent">
          ← back to sites
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tighter mt-2">{domain}</h1>
        {err && <p className="mt-2 font-mono text-xs text-destructive">{err}</p>}
      </div>

      {site && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">CCS SCORE</div>
            <div className={`text-6xl font-extrabold tracking-tighter ${scoreColor(site.ccs_score)}`}>
              {site.ccs_score ?? "—"}
            </div>
            <div className="mt-3 h-2 bg-muted">
              <div
                className={`h-full ${site.ccs_score && site.ccs_score >= 70 ? "bg-green-500" : site.ccs_score && site.ccs_score >= 50 ? "bg-yellow-500" : "bg-destructive"}`}
                style={{ width: `${site.ccs_score ?? 0}%` }}
              />
            </div>
          </div>
          <div className="border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">PLAN · STATUS</div>
            <div className="text-2xl font-bold uppercase">{site.plan}</div>
            <div className="font-mono text-xs text-muted-foreground mt-1">{site.status}</div>
            <button
              onClick={toggleAutoFire}
              className="mt-3 font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
            >
              auto-fire: {site.auto_fire_enabled ? "ON" : "OFF"} · toggle
            </button>
          </div>
          <div className="border border-border bg-card p-6">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">INSTALL</div>
            <code className="font-mono text-[10px] break-all text-foreground block mb-3">{site.install_token}</code>
            <div className="space-y-2 font-mono text-[10px] text-muted-foreground">
              <div>
                <span className="text-foreground">snippet:</span>{" "}
                <code>&lt;script src="/api/public/inject/{site.install_token}.js" async&gt;&lt;/script&gt;</code>
              </div>
              <div>
                <a
                  href={`/api/public/wp-plugin/${site.install_token}.zip`}
                  className="inline-block mt-2 border border-accent text-accent px-3 py-1.5 uppercase tracking-widest hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  ↓ Download WordPress plugin
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Citation trend */}
      <div className="border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">CITATIONS · 30D</div>
          <div className="font-mono text-xs text-muted-foreground">
            {citations.filter((c) => c.domain_was_cited).length}/{citations.length} cited
          </div>
        </div>
        {days.length === 0 ? (
          <div className="font-mono text-xs text-muted-foreground py-8 text-center">No citation events yet.</div>
        ) : (
          <div className="flex items-end gap-1 h-32">
            {days.map(([day, v]) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-1" title={`${day}: ${v.cited}/${v.total}`}>
                <div className="w-full bg-accent" style={{ height: `${(v.cited / maxCited) * 100}%` }} />
                <div className="font-mono text-[8px] text-muted-foreground">{day.slice(5)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Run auto-fix */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tighter mb-3">// RUN AUTO-FIX</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["schema", "llms_txt", "robots_txt"] as const).map((k) => (
            <button
              key={k}
              onClick={() => runAutoFix(k)}
              disabled={running === k}
              className="border border-border bg-card hover:border-accent p-4 text-left transition-colors disabled:opacity-50"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent">{k.replace("_", ".")}</div>
              <div className="text-sm font-bold mt-1">{running === k ? "Running…" : "Draft fix →"}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Intervention timeline */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tighter mb-3">// AUTO-FIX LOG</h2>
        <div className="border border-border bg-card divide-y divide-border">
          {interventions.length === 0 && (
            <div className="p-4 font-mono text-xs text-muted-foreground">No interventions yet.</div>
          )}
          {interventions.map((iv) => (
            <div key={iv.id} className="p-4 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest">
                  <span className="text-accent">{iv.kind.replace("_", ".")}</span>
                  <span className={
                    iv.status === "live" ? "text-green-500" :
                    iv.status === "drafted" ? "text-yellow-500" :
                    iv.status === "rejected" ? "text-destructive" :
                    "text-muted-foreground"
                  }>{iv.status}</span>
                  <span className="text-muted-foreground">{iv.triggered_by}</span>
                  <span className="text-muted-foreground">{new Date(iv.created_at).toLocaleString()}</span>
                </div>
                {iv.preview_text && (
                  <p className="mt-2 text-sm text-muted-foreground truncate">{iv.preview_text}</p>
                )}
              </div>
              {iv.status === "drafted" && (
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => approve(iv.id)} className="font-mono text-[10px] uppercase px-3 py-1 bg-green-500/20 text-green-500 hover:bg-green-500/30">Approve</button>
                  <button onClick={() => reject(iv.id)} className="font-mono text-[10px] uppercase px-3 py-1 bg-destructive/20 text-destructive hover:bg-destructive/30">Reject</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
