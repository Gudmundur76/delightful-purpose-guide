import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { callTool } from "@/lib/dashboard/mcp-client";

export const Route = createFileRoute("/dashboard/scan")({
  component: ScanPage,
});

type ScanResult = {
  url: string;
  scan?: {
    id?: string;
    host?: string;
    overall?: number;
    semantic?: number;
    jsonld?: number;
    llms?: number;
    citability?: number;
    speed?: number;
    [k: string]: unknown;
  };
  error?: string;
  ok?: boolean;
};

type BulkResponse = { count?: number; results: ScanResult[] };

const METRICS = ["semantic", "jsonld", "llms", "citability", "speed"] as const;

function ScanPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [busy, setBusy] = useState<Record<string, string | null>>({});
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [filed, setFiled] = useState<Record<string, boolean>>({});

  async function runBulk() {
    const urls = text
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean)
      .slice(0, 10);
    if (urls.length === 0) return;
    setLoading(true);
    setErr(null);
    setResults([]);
    try {
      const r = await callTool<BulkResponse>("bulk_scan_urls", { urls });
      setResults(r.results ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function genEmail(r: ScanResult) {
    const host = r.scan?.host ?? r.url;
    setBusy((b) => ({ ...b, [r.url]: "email" }));
    try {
      const out = await callTool<{ subject?: string; body?: string; email?: string }>(
        "generate_outreach_email",
        { host, scan_id: r.scan?.id },
      );
      const body =
        (out.subject ? `Subject: ${out.subject}\n\n` : "") +
        (out.body ?? out.email ?? JSON.stringify(out, null, 2));
      setEmails((e) => ({ ...e, [r.url]: body }));
    } catch (e) {
      setEmails((s) => ({ ...s, [r.url]: `ERROR: ${e instanceof Error ? e.message : String(e)}` }));
    } finally {
      setBusy((b) => ({ ...b, [r.url]: null }));
    }
  }

  async function fileLead(r: ScanResult) {
    const host = r.scan?.host ?? r.url;
    setBusy((b) => ({ ...b, [r.url]: "lead" }));
    try {
      await callTool("submit_lead", {
        host,
        source: "dashboard-scan",
        notes: `Bulk scan from dashboard. Overall: ${r.scan?.overall ?? "n/a"}`,
      });
      setFiled((s) => ({ ...s, [r.url]: true }));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy((b) => ({ ...b, [r.url]: null }));
    }
  }

  return (
    <div className="space-y-10">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
          // BULK SCANNER
        </div>
        <h1 className="font-extrabold text-4xl sm:text-5xl uppercase tracking-tighter">
          Up to 10 URLs
        </h1>
      </header>

      <div className="border border-border p-6 bg-card/40 space-y-4">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          // URLS · ONE PER LINE
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder={"https://example.com\nhttps://acme.com"}
          className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent resize-y"
        />
        <button
          type="button"
          onClick={runBulk}
          disabled={loading || !text.trim()}
          className="bg-accent text-accent-foreground font-bold uppercase tracking-tighter px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "SCANNING…" : "BULK SCAN →"}
        </button>
        {err && <p className="font-mono text-xs text-destructive">{err}</p>}
      </div>

      <div className="space-y-4">
        {results.map((r) => (
          <div key={r.url} className="border border-border p-5 bg-card/40">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="min-w-0">
                <div className="font-mono text-xs text-muted-foreground truncate">{r.url}</div>
                <div className="font-extrabold text-2xl uppercase tracking-tighter mt-1">
                  {r.scan?.host ?? "—"}
                </div>
              </div>
              <div className="font-extrabold text-4xl tabular-nums tracking-tighter text-accent">
                {r.scan?.overall ?? "—"}
                <span className="text-muted-foreground text-base">/100</span>
              </div>
            </div>

            {r.error ? (
              <p className="font-mono text-xs text-destructive">{r.error}</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
                {METRICS.map((m) => (
                  <div key={m} className="border border-border p-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      // {m}
                    </div>
                    <div className="font-extrabold text-xl tabular-nums mt-1">
                      {(r.scan?.[m] as number) ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => genEmail(r)}
                disabled={busy[r.url] === "email"}
                className="border border-accent text-accent font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
              >
                {busy[r.url] === "email" ? "GENERATING…" : "GENERATE EMAIL →"}
              </button>
              <button
                type="button"
                onClick={() => fileLead(r)}
                disabled={busy[r.url] === "lead" || filed[r.url]}
                className="border border-border font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:border-accent hover:text-accent transition-colors disabled:opacity-50"
              >
                {filed[r.url] ? "FILED ✓" : busy[r.url] === "lead" ? "FILING…" : "FILE LEAD →"}
              </button>
            </div>

            {emails[r.url] && (
              <pre className="mt-4 bg-background border border-border p-4 font-mono text-xs whitespace-pre-wrap text-muted-foreground">
                {emails[r.url]}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
