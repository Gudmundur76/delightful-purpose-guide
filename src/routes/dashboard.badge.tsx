import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { callTool } from "@/lib/dashboard/mcp-client";

export const Route = createFileRoute("/dashboard/badge")({
  component: BadgePage,
});

type BadgeResponse = {
  host: string;
  score?: number;
  badge_url?: string;
  svg_url?: string;
  html?: string;
  markdown?: string;
  [k: string]: unknown;
};

function CopyBox({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="border border-border bg-card/40">
      <div className="px-4 py-2 border-b border-border flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          // {label}
        </span>
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="font-mono text-[10px] uppercase tracking-widest text-accent hover:underline"
        >
          {copied ? "COPIED ✓" : "COPY"}
        </button>
      </div>
      <pre className="p-4 font-mono text-xs whitespace-pre-wrap break-all text-foreground/90 max-h-64 overflow-auto">
        {value}
      </pre>
    </div>
  );
}

function BadgePage() {
  const [host, setHost] = useState("citation.is");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<BadgeResponse | null>(null);

  async function run() {
    if (!host.trim()) return;
    setLoading(true);
    setErr(null);
    setData(null);
    try {
      const r = await callTool<BadgeResponse>("generate_badge_embed", { host: host.trim() });
      setData(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const svgUrl = data?.svg_url ?? data?.badge_url;

  return (
    <div className="space-y-10">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
          // BADGE GENERATOR
        </div>
        <h1 className="font-extrabold text-4xl sm:text-5xl uppercase tracking-tighter">
          Embed your score
        </h1>
      </header>

      <div className="border border-border p-6 bg-card/40 space-y-4">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          // DOMAIN
        </label>
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent"
        />
        <button
          type="button"
          onClick={run}
          disabled={loading || !host.trim()}
          className="bg-accent text-accent-foreground font-bold uppercase tracking-tighter px-6 py-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "GENERATING…" : "GENERATE BADGE →"}
        </button>
        {err && <p className="font-mono text-xs text-destructive">{err}</p>}
      </div>

      {data && (
        <section className="space-y-6">
          <div className="border border-border p-8 bg-card/40 flex flex-col sm:flex-row items-center gap-8">
            <div className="font-extrabold text-7xl tabular-nums tracking-tighter text-accent">
              {data.score ?? 100}
              <span className="text-muted-foreground text-3xl">/100</span>
            </div>
            <div className="flex-1 flex justify-center">
              {svgUrl ? (
                <img
                  src={svgUrl}
                  alt={`${data.host} score badge`}
                  className="max-h-24"
                />
              ) : (
                <div className="font-mono text-xs text-muted-foreground">
                  // NO PREVIEW URL RETURNED
                </div>
              )}
            </div>
          </div>

          {data.html && <CopyBox label="HTML" value={data.html} />}
          {data.markdown && <CopyBox label="MARKDOWN" value={data.markdown} />}
        </section>
      )}
    </div>
  );
}
