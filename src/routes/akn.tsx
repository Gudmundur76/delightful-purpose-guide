import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ogImageMeta } from "@/lib/seo/og";

type Triple = {
  s: string;
  p: string;
  o: string | number | boolean;
  source: string;
  proof: string;
};

type Snapshot = { generated_at: string; triples: Triple[] };

export const Route = createFileRoute("/akn")({
  head: () => ({
    meta: [
      { title: "Agentic Knowledge Node — citation.is" },
      {
        name: "description",
        content:
          "An observer dashboard for the citation.is AKN: a real-time fact graph, MCP terminal, and verifiable triples that autonomous agents can read in one fetch.",
      },
      { property: "og:title", content: "Agentic Knowledge Node — citation.is" },
      {
        property: "og:description",
        content:
          "Headless agentic protocol v4.0 — RAG-optimized context, semantic triples, and an MCP interface for OpenAI Operator, Perplexity Sonar, and Claude.",
      },
      ...ogImageMeta({
        title: "Agentic Knowledge Node",
        kicker: "citation.is",
        sub: "Headless agentic protocol v4.0 — a verifiable fact graph plus MCP for autonomous agents.",
      }),
    ],
    links: [{ rel: "canonical", href: "https://citation.is/akn" }],
  }),
  component: AknPage,
});

function AknPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/public/v1/context?format=json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Snapshot;
        if (!cancelled) setSnapshot(data);
      } catch (e) {
        if (!cancelled) setError(String(e));
      }
    }
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        <Hero generatedAt={snapshot?.generated_at} />
        <Endpoints />
        <FactGraph triples={snapshot?.triples ?? []} error={error} />
        <AgenticTerminal />
      </main>
    </div>
  );
}

function Hero({ generatedAt }: { generatedAt?: string }) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl p-8 md:p-12">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-accent/10 via-transparent to-transparent" />
      <div className="relative">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent mb-4">
          headless agentic protocol v4.0
        </p>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
          Agentic Knowledge Node
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-6">
          The web as a verifiable fact graph. This node serves RAG-optimized context, semantic triples,
          and an MCP interface that autonomous reasoning agents (OpenAI Operator, Perplexity Sonar Pro,
          Claude Computer Use) can use directly.
        </p>
        <div className="flex flex-wrap gap-3 font-mono text-xs">
          <Pill label="status" value="live" tone="ok" />
          <Pill label="standard" value="geo-standard@2026.07" />
          <Pill
            label="snapshot"
            value={generatedAt ? new Date(generatedAt).toISOString() : "loading…"}
          />
        </div>
      </div>
    </section>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok";
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1">
      <span className="text-muted-foreground uppercase tracking-widest">{label}</span>
      <span className={tone === "ok" ? "text-accent" : "text-foreground"}>{value}</span>
    </span>
  );
}

function Endpoints() {
  const eps = [
    { path: "/api/public/v1/context", desc: "Markdown RAG context", method: "GET" },
    { path: "/api/public/v1/context?format=json", desc: "Triples (JSON-LD)", method: "GET" },
    { path: "/api/public/v1/verify?proof=…", desc: "Verify triple proof", method: "GET" },
    { path: "/.well-known/mcp.json", desc: "MCP server discovery", method: "GET" },
    { path: "/api/public/mcp", desc: "MCP JSON-RPC (read + scan)", method: "POST" },
  ];
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Headless endpoints</h2>
      <div className="grid md:grid-cols-2 gap-3 font-mono text-sm">
        {eps.map((e) => (
          <a
            key={e.path}
            href={e.path}
            className="block rounded-lg border border-border bg-card/40 backdrop-blur p-4 hover:border-accent transition-colors"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-accent text-xs">{e.method}</span>
              <span className="text-foreground break-all">{e.path}</span>
            </div>
            <div className="text-muted-foreground text-xs">{e.desc}</div>
          </a>
        ))}
      </div>
    </section>
  );
}

function FactGraph({ triples, error }: { triples: Triple[]; error: string | null }) {
  const grouped = useMemo(() => {
    const m = new Map<string, Triple[]>();
    for (const t of triples) {
      const arr = m.get(t.s) ?? [];
      arr.push(t);
      m.set(t.s, arr);
    }
    return [...m.entries()];
  }, [triples]);

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Verifiable fact graph</h2>
      {error && (
        <p className="text-sm text-destructive font-mono mb-4">failed to load: {error}</p>
      )}
      {!triples.length && !error && (
        <p className="text-sm text-muted-foreground font-mono">loading triples…</p>
      )}
      <div className="space-y-4">
        {grouped.map(([subject, ts]) => (
          <div
            key={subject}
            className="rounded-lg border border-border bg-card/40 backdrop-blur p-4"
          >
            <div className="font-mono text-xs text-accent break-all mb-3">{subject}</div>
            <ul className="space-y-2">
              {ts.map((t) => (
                <li key={t.proof} className="font-mono text-xs">
                  <span className="text-muted-foreground">{t.p}</span>
                  <span className="text-foreground"> → </span>
                  <span className="text-foreground">{String(t.o)}</span>
                  <div className="text-[10px] text-muted-foreground mt-1 break-all">
                    proof <code className="text-accent">{t.proof}</code> ·{" "}
                    <a href={t.source} className="hover:text-accent underline">
                      source
                    </a>{" "}
                    ·{" "}
                    <Link
                      to="/api/public/v1/verify"
                      search={{ proof: t.proof } as never}
                      className="hover:text-accent underline"
                    >
                      verify
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function AgenticTerminal() {
  const [body, setBody] = useState<string>(
    JSON.stringify(
      { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} },
      null,
      2,
    ),
  );
  const [resp, setResp] = useState<string>("");
  const [busy, setBusy] = useState(false);

  async function send() {
    setBusy(true);
    setResp("");
    try {
      const res = await fetch("/api/public/mcp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json, text/event-stream",
        },
        body,
      });
      const txt = await res.text();
      setResp(`HTTP ${res.status}\n\n${txt}`);
    } catch (e) {
      setResp(String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Agentic terminal</h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
        Direct JSON-RPC against the MCP endpoint. Try{" "}
        <code className="font-mono text-accent">tools/list</code> to enumerate, then{" "}
        <code className="font-mono text-accent">tools/call</code> with{" "}
        <code className="font-mono text-accent">scan_url</code> to run the public scanner.
      </p>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-border bg-card/40 backdrop-blur p-3">
          <div className="font-mono text-xs text-muted-foreground mb-2">POST /api/public/mcp</div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            spellCheck={false}
            className="w-full h-72 bg-background/60 border border-border rounded p-3 font-mono text-xs text-foreground focus:outline-none focus:border-accent"
          />
          <button
            onClick={send}
            disabled={busy}
            className="mt-3 px-4 py-2 rounded bg-accent text-accent-foreground font-mono text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50"
          >
            {busy ? "sending…" : "send"}
          </button>
        </div>
        <div className="rounded-lg border border-border bg-card/40 backdrop-blur p-3">
          <div className="font-mono text-xs text-muted-foreground mb-2">response</div>
          <pre className="w-full h-72 overflow-auto bg-background/60 border border-border rounded p-3 font-mono text-xs text-foreground whitespace-pre-wrap break-words">
            {resp || "—"}
          </pre>
        </div>
      </div>
    </section>
  );
}
