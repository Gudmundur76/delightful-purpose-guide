import { Link, Outlet, createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getStoredSecret, setStoredSecret, clearStoredSecret } from "@/lib/dashboard/mcp-client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "// DASHBOARD · grow.contact" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DashboardLayout,
});

const TABS = [
  { to: "/dashboard", label: "OVERVIEW", exact: true },
  { to: "/dashboard/citation", label: "CITATION", exact: false },
  { to: "/dashboard/scan", label: "SCAN", exact: false },
  { to: "/dashboard/publish", label: "PUBLISH", exact: false },
  { to: "/dashboard/reviews", label: "REVIEWS", exact: false },
  { to: "/dashboard/badge", label: "BADGE", exact: false },
] as const;

function DashboardLayout() {
  const [authed, setAuthed] = useState(false);
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    setAuthed(!!getStoredSecret());
  }, []);

  if (!authed) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!value.trim()) return;
            setStoredSecret(value.trim());
            setAuthed(true);
            setErr(null);
          }}
          className="w-full max-w-md border border-border p-8 bg-card"
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
            // RESTRICTED · MCP CONSOLE
          </div>
          <h1 className="font-extrabold text-3xl uppercase tracking-tighter mb-6">
            Enter passphrase
          </h1>
          <input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus
            placeholder="••••••••"
            className="w-full bg-background border border-border px-4 py-3 font-mono text-sm focus:outline-none focus:border-accent"
          />
          {err && <p className="mt-3 font-mono text-xs text-destructive">{err}</p>}
          <button
            type="submit"
            className="mt-4 w-full bg-accent text-accent-foreground font-bold uppercase tracking-tighter py-3 hover:opacity-90 transition-opacity"
          >
            UNLOCK →
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-[80vh]">
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            // DASHBOARD · MCP v1.9
          </div>
          <button
            type="button"
            onClick={() => {
              clearStoredSecret();
              setAuthed(false);
              setValue("");
            }}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
          >
            LOGOUT
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const isActive = t.exact
              ? location.pathname === t.to
              : location.pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`font-mono text-[11px] uppercase tracking-widest px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                // {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </div>
    </main>
  );
}
