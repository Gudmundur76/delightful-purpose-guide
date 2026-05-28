import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  disconnectIntegration,
  initiateConnection,
  listClientsForIntegrations,
  listIntegrations,
  refreshConnectionStatus,
  type IntegrationStatusRow,
} from "@/lib/composio/integrations.functions";

export const Route = createFileRoute("/integrations")({
  component: IntegrationsPage,
  head: () => ({
    meta: [
      { title: "Integrations — GROW_" },
      { name: "description", content: "Connect client tools via Composio." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/integrations" }],
  }),
});

type Client = { id: string; name: string; slug: string; domain: string | null };

function StatusPill({ status }: { status: IntegrationStatusRow["status"] }) {
  const styles: Record<IntegrationStatusRow["status"], string> = {
    active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    pending: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    error: "border-red-500/40 bg-red-500/10 text-red-300",
    not_connected: "border-border bg-card/40 text-muted-foreground",
  };
  const label: Record<IntegrationStatusRow["status"], string> = {
    active: "CONNECTED",
    pending: "PENDING",
    error: "ERROR",
    not_connected: "NOT CONNECTED",
  };
  return (
    <span
      className={`inline-block border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${styles[status]}`}
    >
      {label[status]}
    </span>
  );
}

function IntegrationsPage() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [activeClientId, setActiveClientId] = useState<string | null>(null);
  const [rows, setRows] = useState<IntegrationStatusRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Auth gate
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (cancelled) return;
      if (error || !data.user) {
        navigate({ to: "/login", search: { redirect: "/integrations" } as never });
        return;
      }
      setAuthChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  // Load clients once authed
  useEffect(() => {
    if (!authChecked) return;
    listClientsForIntegrations()
      .then((c) => {
        setClients(c as Client[]);
        if (c.length > 0) setActiveClientId(c[0].id);
      })
      .catch((e) => setErr(String(e?.message ?? e)));
  }, [authChecked]);

  const loadStatus = useCallback(
    async (clientId: string) => {
      setErr(null);
      try {
        const list = await listIntegrations({ data: { clientId } });
        setRows(list);
      } catch (e) {
        setErr(String((e as Error)?.message ?? e));
      }
    },
    [],
  );

  // Load status when client changes
  useEffect(() => {
    if (activeClientId) loadStatus(activeClientId);
  }, [activeClientId, loadStatus]);

  // Refresh pending rows on focus (after OAuth round-trip)
  useEffect(() => {
    const onFocus = () => {
      if (!activeClientId) return;
      Promise.all(
        rows
          .filter((r) => r.status === "pending")
          .map((r) =>
            refreshConnectionStatus({ data: { clientId: activeClientId, toolkit: r.toolkit } }),
          ),
      )
        .then(() => loadStatus(activeClientId))
        .catch(() => undefined);
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [activeClientId, rows, loadStatus]);

  const handleConnect = async (toolkit: string) => {
    if (!activeClientId) return;
    setBusy(toolkit);
    setErr(null);
    try {
      const { redirectUrl } = await initiateConnection({
        data: { clientId: activeClientId, toolkit },
      });
      if (redirectUrl) window.location.href = redirectUrl;
      else await loadStatus(activeClientId);
    } catch (e) {
      setErr(String((e as Error)?.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  const handleDisconnect = async (toolkit: string) => {
    if (!activeClientId) return;
    setBusy(toolkit);
    try {
      await disconnectIntegration({ data: { clientId: activeClientId, toolkit } });
      await loadStatus(activeClientId);
    } catch (e) {
      setErr(String((e as Error)?.message ?? e));
    } finally {
      setBusy(null);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Checking session…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
            // settings / composio
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Client Integrations
          </h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
            Connect each client's accounts via Composio's managed OAuth. Connected accounts power
            outreach sequences, CRM sync, score alerts, and the agent action endpoint.
          </p>
        </header>

        {clients.length === 0 ? (
          <div className="border border-border bg-card/40 p-6 font-mono text-xs text-muted-foreground">
            No clients found. Create a client first.
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center gap-3">
              <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Client
              </label>
              <select
                value={activeClientId ?? ""}
                onChange={(e) => setActiveClientId(e.target.value)}
                className="bg-card/60 border border-border px-3 py-2 text-sm font-mono"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.domain ? ` — ${c.domain}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {err ? (
              <div className="mb-6 border border-red-500/40 bg-red-500/10 text-red-200 p-4 font-mono text-xs">
                {err}
              </div>
            ) : null}

            <div className="grid gap-4">
              {rows.map((r) => {
                const connected = r.status === "active";
                const isBusy = busy === r.toolkit;
                return (
                  <div
                    key={r.toolkit}
                    className="border border-border bg-card/40 p-5 flex items-start justify-between gap-6"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-base font-semibold">{r.name}</h2>
                        <StatusPill status={r.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{r.purpose}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {connected ? (
                        <button
                          type="button"
                          onClick={() => handleDisconnect(r.toolkit)}
                          disabled={isBusy}
                          className="font-mono text-[11px] uppercase tracking-widest border border-border px-3 py-2 hover:bg-card disabled:opacity-50"
                        >
                          {isBusy ? "…" : "Disconnect"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleConnect(r.toolkit)}
                          disabled={isBusy}
                          className="font-mono text-[11px] uppercase tracking-widest border border-accent text-accent px-3 py-2 hover:bg-accent hover:text-background disabled:opacity-50"
                        >
                          {isBusy ? "…" : r.status === "pending" ? "Resume" : "Connect"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
