import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";

const searchSchema = z.object({ token: z.string().optional() });

export const Route = createFileRoute("/unsubscribe")({
  validateSearch: searchSchema,
  component: UnsubscribePage,
});

type Status = "loading" | "ready" | "already" | "invalid" | "submitting" | "done" | "error";

function UnsubscribePage() {
  const { token } = useSearch({ from: "/unsubscribe" });
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/email/unsubscribe?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus("invalid");
          return;
        }
        if (data.valid) setStatus("ready");
        else if (data.reason === "already_unsubscribed") setStatus("already");
        else setStatus("invalid");
      } catch {
        setStatus("error");
      }
    })();
  }, [token]);

  async function confirm() {
    if (!token) return;
    setStatus("submitting");
    try {
      const res = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (data.success) setStatus("done");
      else if (data.reason === "already_unsubscribed") setStatus("already");
      else setStatus("error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="max-w-md w-full border border-border bg-card p-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent mb-4">
          // GROW_ // Unsubscribe
        </p>
        {status === "loading" && <p className="text-sm text-muted-foreground">Validating token…</p>}
        {status === "ready" && (
          <>
            <h1 className="text-2xl font-extrabold uppercase tracking-tighter mb-4">
              Unsubscribe from Grow emails?
            </h1>
            <p className="text-sm text-muted-foreground mb-8">
              You will no longer receive transactional updates from us. You can resubscribe by submitting another brief.
            </p>
            <button
              onClick={confirm}
              className="w-full py-4 bg-foreground text-background font-bold uppercase tracking-tighter hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Confirm Unsubscribe
            </button>
          </>
        )}
        {status === "submitting" && <p className="text-sm">Processing…</p>}
        {status === "done" && (
          <>
            <h1 className="text-2xl font-extrabold uppercase tracking-tighter mb-3">Unsubscribed.</h1>
            <p className="text-sm text-muted-foreground">You won't receive further emails.</p>
          </>
        )}
        {status === "already" && (
          <>
            <h1 className="text-2xl font-extrabold uppercase tracking-tighter mb-3">Already unsubscribed.</h1>
            <p className="text-sm text-muted-foreground">This address is no longer on our list.</p>
          </>
        )}
        {status === "invalid" && (
          <>
            <h1 className="text-2xl font-extrabold uppercase tracking-tighter mb-3">Invalid link.</h1>
            <p className="text-sm text-muted-foreground">This unsubscribe link is missing or expired.</p>
          </>
        )}
        {status === "error" && (
          <>
            <h1 className="text-2xl font-extrabold uppercase tracking-tighter mb-3">Something went wrong.</h1>
            <p className="text-sm text-muted-foreground">Please try again in a moment.</p>
          </>
        )}
      </div>
    </div>
  );
}
