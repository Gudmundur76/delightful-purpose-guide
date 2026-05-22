import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2 } from "lucide-react";
import { captureFreeToolLead } from "@/lib/leads/capture-free-tool.functions";

interface Props {
  source: "badge" | "leaderboard";
  context?: string;
  eyebrow: string;
  headline: string;
  sub: string;
  cta?: string;
  successText?: string;
}

export function FreeToolEmailGate({
  source,
  context,
  eyebrow,
  headline,
  sub,
  cta = "Get it →",
  successText = "Thanks — check your inbox.",
}: Props) {
  const capture = useServerFn(captureFreeToolLead);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      setState("error");
      return;
    }
    setState("saving");
    setError(null);
    try {
      const res = await capture({ data: { email: trimmed, source, context } });
      if (!res.ok) throw new Error(res.error);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setState("error");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="font-mono text-xs text-accent mb-2">{eyebrow}</div>
      <h3 className="text-xl font-semibold mb-1">{headline}</h3>
      <p className="text-sm text-muted-foreground">{sub}</p>

      {state !== "done" ? (
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3 mt-5">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={state === "saving"}
            required
            className="flex-1 rounded-md border border-border bg-background px-4 py-3 font-mono text-sm outline-none focus:border-accent transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={state === "saving"}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground text-background font-mono text-sm px-6 py-3 hover:opacity-90 transition disabled:opacity-40"
          >
            {state === "saving" ? <><Loader2 className="w-4 h-4 animate-spin" /> sending</> : cta}
          </button>
        </form>
      ) : (
        <div className="mt-5 flex items-center gap-2 rounded-md border border-accent/40 bg-accent/10 p-4 text-sm">
          <Check className="w-4 h-4 text-accent shrink-0" />
          <span>{successText}</span>
        </div>
      )}

      {state === "error" && error && (
        <div className="mt-3 text-xs font-mono text-red-500">{error}</div>
      )}
      <p className="mt-3 text-[11px] font-mono text-muted-foreground">
        No spam. One follow-up email max. Unsubscribe in a click.
      </p>
    </div>
  );
}
