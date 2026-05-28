import { useState } from "react";
import { Loader2, Play } from "lucide-react";

interface ScanResult {
  overall?: number;
  semantic?: number;
  jsonld?: number;
  llms?: number;
  citability?: number;
  speed?: number;
  url?: string;
  [k: string]: unknown;
}

export function ScanRunner() {
  const [url, setUrl] = useState("https://example.com");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [raw, setRaw] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setRaw("");
    const start = performance.now();
    try {
      const res = await fetch("/api/public/v1/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Source": "playground" },
        body: JSON.stringify({ url }),
      });
      const text = await res.text();
      setMs(Math.round(performance.now() - start));
      setRaw(text);
      if (!res.ok) {
        setError(`HTTP ${res.status}`);
      } else {
        try {
          const json = JSON.parse(text);
          setResult(json.data ?? json.result ?? json);
        } catch {
          setError("Invalid JSON response");
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-border bg-card/40">
      <div className="border-b border-border p-5">
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          scan_url
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 bg-background border border-border px-3 py-2.5 font-mono text-sm focus:outline-none focus:border-accent"
          />
          <button
            onClick={run}
            disabled={loading || !url}
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 uppercase tracking-tighter text-xs hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {loading ? "Running" : "Run scan"}
          </button>
        </div>
        <p className="mt-2 font-mono text-[10px] text-muted-foreground">
          Public endpoint · rate limit 20/min/IP · no auth required
        </p>
      </div>

      {(result || error) && (
        <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Result {ms !== null && <span className="text-accent">· {ms}ms</span>}
            </div>
            {error ? (
              <div className="font-mono text-sm text-destructive">{error}</div>
            ) : result ? (
              <div className="space-y-2">
                {typeof result.overall === "number" && (
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-extrabold tracking-tighter">{result.overall}</span>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      / 100
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-5 gap-2 pt-2">
                  {(["semantic", "jsonld", "llms", "citability", "speed"] as const).map((k) => (
                    <div key={k} className="border border-border p-2">
                      <div className="font-mono text-[9px] uppercase text-muted-foreground truncate">
                        {k}
                      </div>
                      <div className="font-bold text-lg">{(result[k] as number) ?? "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <div className="p-5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Raw response
            </div>
            <pre className="text-[11px] leading-relaxed font-mono text-foreground/70 max-h-64 overflow-auto whitespace-pre-wrap break-all">
              {raw}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
