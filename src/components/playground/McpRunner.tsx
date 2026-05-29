// Browser-side Agentic Playground — invoke any MCP tool over JSON-RPC.
// Uses the public /api/public/mcp endpoint with a Bearer token stored in
// localStorage. Public-safe tools are surfaced as one-click presets.
import { useMemo, useState } from "react";
import { Loader2, Play, KeyRound, Check } from "lucide-react";
import { TOOLS } from "@/lib/playground/catalog";
import {
  callTool,
  getStoredSecret,
  setStoredSecret,
  clearStoredSecret,
} from "@/lib/dashboard/mcp-client";

const PRESET_ARGS: Record<string, Record<string, unknown>> = {
  scan_url: { url: "https://example.com" },
  validate_jsonld: { url: "https://example.com" },
  extract_meta_tags: { url: "https://example.com" },
  check_llms_txt: { host: "example.com" },
  get_geo_standard: {},
  get_stats: {},
  leaderboard: { limit: 10 },
  ping: {},
};

export function McpRunner() {
  const [tool, setTool] = useState<string>("scan_url");
  const [argsText, setArgsText] = useState<string>(
    JSON.stringify(PRESET_ARGS.scan_url ?? {}, null, 2),
  );
  const [secret, setSecret] = useState<string>(getStoredSecret() ?? "");
  const [secretSaved, setSecretSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ms, setMs] = useState<number | null>(null);

  const tools = useMemo(
    () => [...TOOLS].sort((a, b) => a.name.localeCompare(b.name)),
    [],
  );

  const selectTool = (name: string) => {
    setTool(name);
    const preset = PRESET_ARGS[name];
    setArgsText(JSON.stringify(preset ?? {}, null, 2));
    setResult(null);
    setError(null);
  };

  const saveSecret = () => {
    if (!secret.trim()) {
      clearStoredSecret();
      setSecretSaved(false);
      return;
    }
    setStoredSecret(secret.trim());
    setSecretSaved(true);
    setTimeout(() => setSecretSaved(false), 1500);
  };

  const run = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    const start = performance.now();
    try {
      let args: Record<string, unknown> = {};
      if (argsText.trim()) {
        try {
          args = JSON.parse(argsText);
        } catch {
          throw new Error("Arguments must be valid JSON.");
        }
      }
      const out = await callTool(tool, args);
      setMs(Math.round(performance.now() - start));
      setResult(
        typeof out === "string" ? out : JSON.stringify(out, null, 2),
      );
    } catch (e) {
      setMs(Math.round(performance.now() - start));
      setError(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  const selected = tools.find((t) => t.name === tool);

  return (
    <div className="border border-border bg-card/40">
      <div className="border-b border-border p-5 space-y-4">
        <div>
          <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            <KeyRound className="inline w-3 h-3 mr-1" />
            MCP_SECRET (stored in this browser only)
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Bearer token from /contact"
              className="flex-1 bg-background border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent"
            />
            <button
              onClick={saveSecret}
              className="inline-flex items-center gap-1.5 border border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest hover:border-accent hover:text-accent transition-colors"
            >
              {secretSaved ? <Check className="w-3 h-3" /> : null}
              {secretSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Tool
            </label>
            <select
              value={tool}
              onChange={(e) => selectTool(e.target.value)}
              className="w-full bg-background border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent"
            >
              {tools.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                  {t.publicSafe ? "  · public" : ""}
                  {t.mutates ? "  · mutates" : ""}
                </option>
              ))}
            </select>
            {selected ? (
              <p className="mt-2 font-mono text-[10px] text-muted-foreground leading-relaxed">
                {selected.description}
              </p>
            ) : null}
          </div>
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
              Arguments (JSON)
            </label>
            <textarea
              value={argsText}
              onChange={(e) => setArgsText(e.target.value)}
              rows={5}
              className="w-full bg-background border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={run}
            disabled={loading || !secret.trim()}
            className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 uppercase tracking-tighter text-xs hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {loading ? "Calling" : "tools/call"}
          </button>
          <span className="font-mono text-[10px] text-muted-foreground">
            POST /api/public/mcp · JSON-RPC 2.0
            {ms !== null ? <> · {ms}ms</> : null}
          </span>
        </div>
      </div>

      {(result || error) && (
        <div className="p-5">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            {error ? "Error" : "Result"}
          </div>
          {error ? (
            <pre className="text-xs font-mono text-destructive whitespace-pre-wrap break-all">
              {error}
            </pre>
          ) : (
            <pre className="text-[11px] leading-relaxed font-mono text-foreground/80 max-h-80 overflow-auto whitespace-pre-wrap break-all">
              {result}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
