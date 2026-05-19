import { useState } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const TIERS = [
  { value: "tier_01", label: "Tier 01 — One-Pager ($2,400)" },
  { value: "tier_02", label: "Tier 02 — Full Site ($4,800)" },
  { value: "tier_03", label: "Tier 03 — Web App ($8,500+)" },
] as const;

export function LeadForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      budget_tier: String(fd.get("budget_tier") ?? ""),
      message: String(fd.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.budget_tier || !payload.message) {
      setStatus("error");
      setError("All fields are required.");
      return;
    }

    try {
      const res = await fetch("/api/public/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Submission failed");
      }
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-accent bg-card p-8">
        <p className="font-mono text-accent text-xs uppercase tracking-[0.2em] mb-3">
          // Brief Received
        </p>
        <p className="font-bold uppercase tracking-tighter text-2xl">
          We'll be in touch within 4 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          // Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={100}
          className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label htmlFor="email" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          // Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          maxLength={255}
          className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label htmlFor="budget_tier" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          // Budget Tier
        </label>
        <select
          id="budget_tier"
          name="budget_tier"
          required
          defaultValue=""
          className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent transition-colors"
        >
          <option value="" disabled>Select a tier…</option>
          {TIERS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="message" className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
          // Project Brief
        </label>
        <textarea
          id="message"
          name="message"
          required
          maxLength={2000}
          rows={5}
          className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>
      {error && (
        <p className="font-mono text-xs text-destructive uppercase tracking-tighter">
          ! {error}
        </p>
      )}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full py-4 bg-background text-foreground font-bold uppercase tracking-tighter hover:bg-card transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Transmitting…" : "Submit Project Brief"}
      </button>
    </form>
  );
}
