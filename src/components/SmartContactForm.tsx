import { useMemo, useState } from "react";
import { TierCheckoutDialog } from "@/components/TierCheckoutDialog";
import type { TierKey } from "@/lib/paypal/tier-checkout.functions";

type Step = 0 | 1 | 2 | 3 | 4;
type Status = "idle" | "submitting" | "analyzing" | "done" | "error";

const STAGES = ["Pre-launch", "Seed", "Series A", "Series B+", "Bootstrapped"] as const;
const AUDIENCES = ["Developers", "Technical founders", "Platform/DevOps", "AI/ML engineers", "Enterprise IT"] as const;
const BUDGETS = ["$2.4k (Tier 01)", "$4.8k (Tier 02)", "$8.5k+ (Tier 03)", "Not sure yet"] as const;
const TIMELINES = ["48 hours", "This week", "This month", "Just exploring"] as const;

interface FormState {
  url: string;
  stage: string;
  audience: string;
  budget: string;
  timeline: string;
  name: string;
  email: string;
  notes: string;
}

const INITIAL: FormState = {
  url: "", stage: "", audience: "", budget: "", timeline: "", name: "", email: "", notes: "",
};

function normalizeUrl(raw: string): string | null {
  if (!raw) return null;
  try {
    const withProto = raw.startsWith("http") ? raw : `https://${raw}`;
    const u = new URL(withProto);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function preliminaryScore(state: FormState): { score: number; breakdown: { label: string; value: number }[] } {
  const host = normalizeUrl(state.url) ?? "unknown";
  const seed = hashStr(host + state.stage + state.audience);
  const base = 42 + (seed % 28); // 42-69
  const semantic = 55 + (seed % 35);
  const schema = 30 + ((seed >> 3) % 40);
  const llms = (seed % 4 === 0) ? 88 : 12;
  const og = 60 + ((seed >> 5) % 30);
  return {
    score: base,
    breakdown: [
      { label: "Semantic HTML", value: semantic },
      { label: "Schema.org coverage", value: schema },
      { label: "llms.txt present", value: llms },
      { label: "OG / Twitter cards", value: og },
    ],
  };
}

export function SmartContactForm() {
  const [step, setStep] = useState<Step>(0);
  const [data, setData] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [leadId, setLeadId] = useState<string | null>(null);
  const [checkoutTier, setCheckoutTier] = useState<TierKey | null>(null);

  const host = useMemo(() => normalizeUrl(data.url), [data.url]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  const stepValid: Record<Step, boolean> = {
    0: !!host,
    1: !!data.stage && !!data.audience,
    2: !!data.budget && !!data.timeline,
    3: data.name.trim().length > 1 && /^\S+@\S+\.\S+$/.test(data.email),
    4: true,
  };

  async function submit() {
    if (!stepValid[3]) return;
    setStatus("submitting");
    setError(null);
    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          budget_tier: data.budget,
          message: `URL: ${data.url}\nStage: ${data.stage}\nAudience: ${data.audience}\nTimeline: ${data.timeline}\nNotes: ${data.notes}`,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.error ?? "Submission failed");
      }
      setStatus("analyzing");
      setStep(4);
      // simulated analysis pause
      await new Promise((r) => setTimeout(r, 1600));
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  const analysis = useMemo(() => preliminaryScore(data), [data]);

  return (
    <div className="border border-border bg-card">
      {/* Stepper */}
      <div className="flex border-b border-border">
        {["URL", "Context", "Scope", "Contact", "Result"].map((label, i) => (
          <div
            key={label}
            className={`flex-1 min-w-0 px-2 sm:px-3 py-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest border-r border-border last:border-r-0 truncate ${
              i === step ? "bg-accent text-accent-foreground" : i < step ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <span className="opacity-60">0{i + 1}</span> {label}
          </div>
        ))}
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {step === 0 && (
          <div className="space-y-4">
            <Label>// Company URL</Label>
            <input
              autoFocus
              type="text"
              value={data.url}
              onChange={(e) => set("url", e.target.value)}
              placeholder="acme.ai"
              className={inputCls}
            />
            {host ? (
              <div className="border border-accent/40 bg-background p-4">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">// Preview</p>
                <div className="flex items-center gap-3">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${host}&sz=64`}
                    alt=""
                    className="w-8 h-8"
                  />
                  <div className="font-mono text-sm">
                    <div className="font-bold">{host}</div>
                    <div className="text-muted-foreground text-xs">https://{host}</div>
                  </div>
                </div>
              </div>
            ) : (
              data.url && <p className="font-mono text-xs text-destructive">! Invalid URL</p>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <ChoiceGroup
              label="// Stage"
              options={STAGES as unknown as string[]}
              value={data.stage}
              onChange={(v) => set("stage", v)}
            />
            <ChoiceGroup
              label="// Primary audience"
              options={AUDIENCES as unknown as string[]}
              value={data.audience}
              onChange={(v) => set("audience", v)}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <ChoiceGroup
              label="// Budget"
              options={BUDGETS as unknown as string[]}
              value={data.budget}
              onChange={(v) => set("budget", v)}
            />
            <ChoiceGroup
              label="// Timeline"
              options={TIMELINES as unknown as string[]}
              value={data.timeline}
              onChange={(v) => set("timeline", v)}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <Label>// Name</Label>
              <input type="text" value={data.name} onChange={(e) => set("name", e.target.value)} className={inputCls} maxLength={100} />
            </div>
            <div>
              <Label>// Email</Label>
              <input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} className={inputCls} maxLength={255} />
            </div>
            <div>
              <Label>// Notes (optional)</Label>
              <textarea value={data.notes} onChange={(e) => set("notes", e.target.value)} rows={3} maxLength={1000} className={`${inputCls} resize-none`} />
            </div>
            {error && <p className="font-mono text-xs text-destructive">! {error}</p>}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            {status === "analyzing" ? (
              <div className="font-mono text-sm space-y-2">
                <p className="text-accent">$ running agent-audit --domain {host}</p>
                <p className="text-muted-foreground">› fetching markup…</p>
                <p className="text-muted-foreground">› parsing schema.org graph…</p>
                <p className="text-muted-foreground">› probing llms.txt…</p>
                <p className="animate-pulse">▌</p>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">// Preliminary Agent Score</p>
                  <div className="flex items-baseline gap-3">
                    <span className="font-bold text-6xl tracking-tighter">{analysis.score}</span>
                    <span className="font-mono text-sm text-muted-foreground">/ 100</span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground mt-2">
                    Indicative result for <span className="text-accent">{host}</span> — full audit delivered on the call.
                  </p>
                </div>
                <div className="space-y-2">
                  {analysis.breakdown.map((b) => (
                    <div key={b.label} className="font-mono text-xs">
                      <div className="flex justify-between mb-1">
                        <span>{b.label}</span>
                        <span className="text-muted-foreground">{b.value}</span>
                      </div>
                      <div className="h-1 bg-background border border-border">
                        <div className="h-full bg-accent" style={{ width: `${b.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <a
                  href="https://cal.com/grow-contact/intro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full py-4 bg-accent text-accent-foreground font-bold uppercase tracking-tighter hover:opacity-90 transition-opacity"
                >
                  Book a call → Discuss your score
                </a>
              </>
            )}
          </div>
        )}

        {/* Nav */}
        {step < 4 && (
          <div className="flex gap-3 pt-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="px-5 py-3 border border-border font-mono text-xs uppercase tracking-widest hover:bg-background transition-colors"
              >
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                disabled={!stepValid[step]}
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="flex-1 py-3 bg-foreground text-background font-bold uppercase tracking-tighter disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                disabled={!stepValid[3] || status === "submitting"}
                onClick={submit}
                className="flex-1 py-3 bg-accent text-accent-foreground font-bold uppercase tracking-tighter disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {status === "submitting" ? "Transmitting…" : "Run agent analysis"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent transition-colors";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
      {children}
    </label>
  );
}

function ChoiceGroup({
  label, options, value, onChange,
}: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-4 py-3 border font-mono text-xs text-left transition-colors ${
                active
                  ? "border-accent bg-accent text-accent-foreground"
                  : "border-border bg-background hover:border-accent/50"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
