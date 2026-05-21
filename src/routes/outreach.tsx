import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Copy, Check } from "lucide-react";
import { generateOutreach, type OutreachResult } from "@/lib/outreach/generate.functions";

export const Route = createFileRoute("/outreach")({
  head: () => ({
    meta: [
      { title: "Outreach Generator — Grow" },
      { name: "description", content: "Scan a prospect URL and draft a personalized cold email referencing their agent-readability gaps." },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: OutreachPage,
});

function OutreachPage() {
  const run = useServerFn(generateOutreach);
  const [url, setUrl] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [senderName, setSenderName] = useState("");
  const [tone, setTone] = useState<"direct" | "warm" | "playful">("direct");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !senderName.trim()) return;
    setState("loading");
    setResult(null);
    try {
      const r = await run({
        data: {
          url: url.trim(),
          recipientName: recipientName.trim() || undefined,
          recipientCompany: recipientCompany.trim() || undefined,
          senderName: senderName.trim(),
          tone,
        },
      });
      setResult(r);
      setState(r.ok ? "done" : "error");
    } catch (err) {
      setResult({ ok: false, error: err instanceof Error ? err.message : "Failed" });
      setState("error");
    }
  };

  const copy = (text: string, key: "subject" | "body") => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-mono text-sm text-accent">grow/</Link>
          <Link to="/" className="font-mono text-xs text-muted-foreground hover:text-foreground">← back</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="font-mono text-xs text-accent mb-3">OUTREACH GENERATOR · INTERNAL</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">
            Audit a prospect. Draft the email.
          </h1>
          <p className="text-muted-foreground max-w-2xl">
            Paste a prospect URL. We scan their agent-readability, then a model writes a personalized cold email referencing their lowest-scoring gaps.
          </p>
        </div>

        <form onSubmit={submit} className="grid md:grid-cols-2 gap-4 mb-10">
          <Field label="prospect_url *">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://acme.ai" required className={inputCls} />
          </Field>
          <Field label="sender_name *">
            <input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Alex from Grow" required className={inputCls} />
          </Field>
          <Field label="recipient_name">
            <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Jordan" className={inputCls} />
          </Field>
          <Field label="recipient_company">
            <input value={recipientCompany} onChange={(e) => setRecipientCompany(e.target.value)} placeholder="Acme AI" className={inputCls} />
          </Field>
          <Field label="tone">
            <select value={tone} onChange={(e) => setTone(e.target.value as typeof tone)} className={inputCls}>
              <option value="direct">direct</option>
              <option value="warm">warm</option>
              <option value="playful">playful</option>
            </select>
          </Field>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={state === "loading" || !url.trim() || !senderName.trim()}
              className="w-full rounded-md bg-accent text-accent-foreground font-mono text-sm px-6 py-3 hover:opacity-90 transition disabled:opacity-40 inline-flex items-center justify-center gap-2"
            >
              {state === "loading" ? <><Loader2 className="w-4 h-4 animate-spin" /> scanning + drafting…</> : "generate"}
            </button>
          </div>
        </form>

        {state === "error" && result && !result.ok && (
          <div className="rounded-md border border-red-500/40 bg-red-500/5 p-4 font-mono text-sm text-red-500">
            ! {result.error}
          </div>
        )}

        {state === "done" && result && result.ok && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-xl border border-border bg-card p-6 grid md:grid-cols-[140px_1fr] gap-6 items-center">
              <div className="text-center">
                <div className="text-5xl font-semibold font-mono text-accent">{result.overall}</div>
                <div className="text-xs font-mono text-muted-foreground mt-1">/ 100</div>
              </div>
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-2">WORST METRICS · USED AS HOOKS</div>
                <ul className="space-y-1 text-sm">
                  {result.worstMetrics.map((w) => (
                    <li key={w.label} className="flex items-baseline gap-3">
                      <span className="font-mono text-xs text-muted-foreground w-10">{w.score}</span>
                      <span className="font-medium">{w.label}</span>
                      <span className="text-muted-foreground text-xs">— {w.summary}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-accent/40 bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="font-mono text-xs text-muted-foreground">SUBJECT</div>
                <CopyBtn copied={copied === "subject"} onClick={() => copy(result.subject, "subject")} />
              </div>
              <div className="px-5 py-4 font-mono text-sm">{result.subject}</div>
            </div>

            <div className="rounded-xl border border-accent/40 bg-card overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <div className="font-mono text-xs text-muted-foreground">BODY</div>
                <CopyBtn copied={copied === "body"} onClick={() => copy(result.body, "body")} />
              </div>
              <pre className="px-5 py-4 font-sans text-sm whitespace-pre-wrap leading-relaxed">{result.body}</pre>
            </div>

            <div className="text-xs font-mono text-muted-foreground">
              model: {result.model} · always review before sending
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-card px-4 py-3 font-mono text-sm outline-none focus:border-accent transition-colors";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="font-mono text-xs text-muted-foreground mb-1.5">{label}</div>
      {children}
    </label>
  );
}

function CopyBtn({ copied, onClick }: { copied: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 font-mono text-[11px] hover:border-accent transition"
    >
      {copied ? <><Check className="w-3 h-3 text-accent" /> copied</> : <><Copy className="w-3 h-3" /> copy</>}
    </button>
  );
}
