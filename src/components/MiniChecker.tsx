import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

export function MiniChecker() {
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    setSubmitting(true);
    navigate({ to: "/check", search: { url: trimmed, auto: true } });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 max-w-md">
      <div className="flex flex-col sm:flex-row gap-2">
        <label htmlFor="mini-checker-url" className="sr-only">
          Website URL to scan
        </label>
        <input
          id="mini-checker-url"
          type="text"
          inputMode="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yoursite.com"
          aria-label="Website URL to scan"
          required
          className="flex-1 rounded-md border border-border bg-card px-4 py-3 font-mono text-sm outline-none focus:border-accent transition-colors"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-foreground text-background font-mono text-xs uppercase tracking-widest px-5 py-3 hover:opacity-90 transition disabled:opacity-50"
        >
          {submitting ? "Checking…" : "Check score →"}
        </button>
      </div>
      <p className="mt-2 font-mono text-[11px] text-muted-foreground">
        Free instant agent-readability scan. No signup.
      </p>
    </form>
  );
}
