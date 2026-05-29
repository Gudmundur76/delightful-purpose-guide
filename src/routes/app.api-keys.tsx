import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listApiKeys, createApiKey, revokeApiKey } from "@/lib/monitoring/api-keys.functions";

export const Route = createFileRoute("/app/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const listFn = useServerFn(listApiKeys);
  const createFn = useServerFn(createApiKey);
  const revokeFn = useServerFn(revokeApiKey);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ["api-keys"], queryFn: () => listFn() });

  const [name, setName] = useState("");
  const [justCreated, setJustCreated] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: () => createFn({ data: { name } }),
    onSuccess: (r) => {
      setJustCreated(r.secret);
      setName("");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });
  const revokeMut = useMutation({
    mutationFn: (id: string) => revokeFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["api-keys"] }),
  });

  if (isLoading) return <p className="font-mono text-xs">loading…</p>;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-extrabold uppercase tracking-tighter text-3xl">API Keys</h1>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          Use with <code className="text-accent">POST /api/public/v1/scan</code> · header{" "}
          <code className="text-accent">X-API-Key</code> or <code className="text-accent">Authorization: Bearer …</code>
        </p>
      </header>

      <form
        onSubmit={(e) => { e.preventDefault(); if (name.trim()) createMut.mutate(); }}
        className="border border-border bg-card p-6 flex gap-3 items-end"
      >
        <div className="flex-1">
          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Production server"
            className="mt-1 w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          disabled={createMut.isPending || !name.trim()}
          className="bg-accent text-accent-foreground font-bold uppercase tracking-tighter px-6 py-3 disabled:opacity-50"
        >
          {createMut.isPending ? "Creating…" : "Create key"}
        </button>
      </form>

      {justCreated && (
        <div className="border border-accent/40 bg-accent/10 p-4 space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">// Save this key — it will not be shown again</p>
          <code className="block bg-background border border-border p-3 break-all font-mono text-xs">{justCreated}</code>
          <button
            type="button"
            onClick={() => { navigator.clipboard.writeText(justCreated); }}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            Copy
          </button>
        </div>
      )}

      <section>
        {(data?.keys.length ?? 0) === 0 ? (
          <p className="font-mono text-xs text-muted-foreground">No API keys yet.</p>
        ) : (
          <table className="w-full border border-border bg-card text-sm">
            <thead className="bg-background/40">
              <tr className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="p-3">Name</th>
                <th className="p-3">Prefix</th>
                <th className="p-3">Last used</th>
                <th className="p-3">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {data?.keys.map((k) => (
                <tr key={k.id} className="border-t border-border">
                  <td className="p-3 font-bold">{k.name}</td>
                  <td className="p-3 font-mono text-xs">{k.key_prefix}…</td>
                  <td className="p-3 font-mono text-xs">{k.last_used_at ? new Date(k.last_used_at).toLocaleString() : "never"}</td>
                  <td className="p-3 font-mono text-xs">{k.revoked_at ? "revoked" : "active"}</td>
                  <td className="p-3 text-right">
                    {!k.revoked_at && (
                      <button
                        type="button"
                        onClick={() => { if (confirm("Revoke this key?")) revokeMut.mutate(k.id); }}
                        className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
                      >
                        Revoke
                      </button>
                    )}
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
