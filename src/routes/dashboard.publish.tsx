import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { callTool } from "@/lib/dashboard/mcp-client";

export const Route = createFileRoute("/dashboard/publish")({
  component: PublishPage,
});

// ───────────────────────────── shared bits ─────────────────────────────

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
      <pre className="p-4 font-mono text-xs whitespace-pre-wrap break-all text-foreground/90 max-h-72 overflow-auto">
        {value}
      </pre>
    </div>
  );
}

function SectionHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className="mb-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
        // {kicker}
      </div>
      <h2 className="font-extrabold text-2xl uppercase tracking-tighter">{title}</h2>
    </header>
  );
}

function ErrLine({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <p className="font-mono text-xs text-destructive mt-2">// ERR · {msg}</p>;
}

// ───────────────────────────── llms.txt ─────────────────────────────

type LlmsResp = { ok: boolean; bytes?: number; content?: string };
type PublishResp = {
  ok: boolean;
  host: string;
  deploy?: {
    path: string;
    target_url: string;
    recommended_headers: Record<string, string>;
  };
  artifact?: { bytes: number; lines: number; has_h1_title: boolean; content: string };
};

function LlmsTxtCard() {
  const [siteName, setSiteName] = useState("");
  const [domain, setDomain] = useState("");
  const [tagline, setTagline] = useState("");
  const [pagesText, setPagesText] = useState("Home | https://example.com\nPricing | https://example.com/pricing");
  const [generated, setGenerated] = useState<string>("");
  const [publish, setPublish] = useState<PublishResp | null>(null);
  const [busy, setBusy] = useState<"gen" | "pub" | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function generate() {
    setBusy("gen");
    setErr(null);
    setPublish(null);
    try {
      const pages = pagesText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((l) => {
          const [title, url] = l.split("|").map((s) => s?.trim());
          return { title: title ?? "Untitled", url: url ?? "" };
        })
        .filter((p) => p.url);
      const r = await callTool<LlmsResp>("generate_llms_txt", {
        site_name: siteName.trim(),
        domain: domain.trim(),
        tagline: tagline.trim() || undefined,
        pages,
      });
      setGenerated(r.content ?? "");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function pushLive() {
    if (!generated.trim() || !domain.trim()) return;
    setBusy("pub");
    setErr(null);
    try {
      const r = await callTool<PublishResp>("publish_llms_txt", {
        host: domain.trim(),
        content: generated,
      });
      setPublish(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="border border-border p-6 bg-card/30">
      <SectionHeader kicker="LLMS.TXT" title="Generate & publish" />
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <input
          value={siteName}
          onChange={(e) => setSiteName(e.target.value)}
          placeholder="site name"
          className="bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
        />
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="domain (e.g. grow.contact)"
          className="bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
        />
      </div>
      <input
        value={tagline}
        onChange={(e) => setTagline(e.target.value)}
        placeholder="tagline (optional)"
        className="w-full bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent mb-3"
      />
      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        // PAGES · one per line · "title | url"
      </label>
      <textarea
        value={pagesText}
        onChange={(e) => setPagesText(e.target.value)}
        rows={5}
        className="w-full bg-background border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent mb-3"
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={busy !== null || !siteName.trim() || !domain.trim()}
          className="bg-accent text-accent-foreground font-bold uppercase tracking-tighter px-5 py-2 hover:opacity-90 disabled:opacity-50"
        >
          {busy === "gen" ? "GENERATING…" : "GENERATE →"}
        </button>
        <button
          type="button"
          onClick={pushLive}
          disabled={busy !== null || !generated.trim()}
          className="border border-accent text-accent font-bold uppercase tracking-tighter px-5 py-2 hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
        >
          {busy === "pub" ? "PUBLISHING…" : "PUBLISH BUNDLE →"}
        </button>
      </div>
      <ErrLine msg={err} />

      {generated && (
        <div className="mt-4">
          <CopyBox label="LLMS.TXT CONTENT" value={generated} />
        </div>
      )}
      {publish?.deploy && (
        <div className="mt-4 space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            // DEPLOY TARGET
          </div>
          <div className="border border-border bg-background p-3 font-mono text-xs">
            <div>
              <span className="text-muted-foreground">URL:</span>{" "}
              <a href={publish.deploy.target_url} target="_blank" rel="noreferrer" className="text-accent underline break-all">
                {publish.deploy.target_url}
              </a>
            </div>
            <div className="mt-1">
              <span className="text-muted-foreground">SIZE:</span> {publish.artifact?.bytes ?? 0}b · {publish.artifact?.lines ?? 0} lines · H1:{" "}
              {publish.artifact?.has_h1_title ? "yes" : "no"}
            </div>
            <div className="mt-1 text-muted-foreground">HEADERS:</div>
            {Object.entries(publish.deploy.recommended_headers).map(([k, v]) => (
              <div key={k} className="ml-2">
                {k}: <span className="text-foreground">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

// ───────────────────────────── schema push ─────────────────────────────

type SchemaResp = { ok: boolean; snippet?: string; placement?: string };

function SchemaCard() {
  const [host, setHost] = useState("");
  const [type, setType] = useState("Organization");
  const [dataText, setDataText] = useState(
    '{\n  "name": "Acme",\n  "url": "https://acme.com",\n  "logo": "https://acme.com/logo.png"\n}',
  );
  const [resp, setResp] = useState<SchemaResp | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setErr(null);
    setResp(null);
    try {
      let parsed: Record<string, unknown>;
      try {
        parsed = JSON.parse(dataText);
      } catch {
        throw new Error("data must be valid JSON");
      }
      const r = await callTool<SchemaResp>("push_schema", {
        host: host.trim(),
        type: type.trim(),
        data: parsed,
      });
      setResp(r);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border border-border p-6 bg-card/30">
      <SectionHeader kicker="SCHEMA.ORG" title="Push JSON-LD" />
      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <input
          value={host}
          onChange={(e) => setHost(e.target.value)}
          placeholder="host"
          className="bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
        />
        <input
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="@type (e.g. Organization)"
          className="bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
        />
      </div>
      <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
        // FIELDS · JSON object
      </label>
      <textarea
        value={dataText}
        onChange={(e) => setDataText(e.target.value)}
        rows={6}
        className="w-full bg-background border border-border px-3 py-2 font-mono text-xs focus:outline-none focus:border-accent mb-3"
      />
      <button
        type="button"
        onClick={run}
        disabled={busy || !host.trim() || !type.trim()}
        className="bg-accent text-accent-foreground font-bold uppercase tracking-tighter px-5 py-2 hover:opacity-90 disabled:opacity-50"
      >
        {busy ? "BUILDING…" : "BUILD SNIPPET →"}
      </button>
      <ErrLine msg={err} />
      {resp?.snippet && (
        <div className="mt-4 space-y-2">
          <CopyBox label="PASTE-READY SNIPPET" value={resp.snippet} />
          {resp.placement && (
            <p className="font-mono text-[11px] text-muted-foreground">// {resp.placement}</p>
          )}
        </div>
      )}
    </section>
  );
}

// ───────────────────────────── scheduled scans ─────────────────────────────

type ScheduledScan = {
  id: string;
  host: string;
  url: string;
  cadence: string;
  active: boolean;
  next_run_at: string;
  last_run_at?: string | null;
  notes?: string | null;
};

function ScheduleCard() {
  const [url, setUrl] = useState("");
  const [cadence, setCadence] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [items, setItems] = useState<ScheduledScan[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    try {
      const r = await callTool<{ items: ScheduledScan[] }>("list_scheduled_scans", {
        active_only: true,
        limit: 50,
      });
      setItems(r.items ?? []);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function schedule() {
    if (!url.trim()) return;
    setBusy(true);
    setErr(null);
    try {
      await callTool("schedule_scan", { url: url.trim(), cadence, start_now: true });
      setUrl("");
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id: string) {
    try {
      await callTool("cancel_scheduled_scan", { id });
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <section className="border border-border p-6 bg-card/30">
      <SectionHeader kicker="SCANS · CRON" title="Schedule a recurring scan" />
      <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 mb-3">
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent"
        />
        <select
          value={cadence}
          onChange={(e) => setCadence(e.target.value as typeof cadence)}
          className="bg-background border border-border px-3 py-2 font-mono text-sm focus:outline-none focus:border-accent uppercase"
        >
          <option value="daily">daily</option>
          <option value="weekly">weekly</option>
          <option value="monthly">monthly</option>
        </select>
        <button
          type="button"
          onClick={schedule}
          disabled={busy || !url.trim()}
          className="bg-accent text-accent-foreground font-bold uppercase tracking-tighter px-5 py-2 hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "QUEUING…" : "SCHEDULE →"}
        </button>
      </div>
      <ErrLine msg={err} />

      <div className="mt-4 border border-border">
        <div className="px-4 py-2 border-b border-border font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          // ACTIVE QUEUE
        </div>
        {items === null && (
          <div className="p-4 font-mono text-xs text-muted-foreground">// LOADING…</div>
        )}
        {items && items.length === 0 && (
          <div className="p-4 font-mono text-xs text-muted-foreground">// QUEUE EMPTY · AGENTS RUNNING</div>
        )}
        {items && items.length > 0 && (
          <ul className="divide-y divide-border">
            {items.map((s) => (
              <li key={s.id} className="p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-mono text-sm truncate">{s.url}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                    {s.cadence} · next {new Date(s.next_run_at).toISOString().slice(0, 16).replace("T", " ")}Z
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => cancel(s.id)}
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-destructive"
                >
                  CANCEL
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

// ───────────────────────────── page ─────────────────────────────

function PublishPage() {
  return (
    <div className="space-y-10">
      <header>
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
          // PUBLISH · CLOSE THE LOOP
        </div>
        <h1 className="font-extrabold text-4xl sm:text-5xl uppercase tracking-tighter">
          Ship to live
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-2 max-w-2xl">
          // Generate, push, and schedule. Three writes that close the read-only gap.
        </p>
      </header>

      <LlmsTxtCard />
      <SchemaCard />
      <ScheduleCard />
    </div>
  );
}
