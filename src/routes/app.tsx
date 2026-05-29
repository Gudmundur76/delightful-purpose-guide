import { createFileRoute, Link, Outlet, redirect, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Grow Monitoring — Console" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/login" });
  },
  component: AppLayout,
});

const TABS = [
  { to: "/app", label: "SITES", exact: true },
  { to: "/app/billing", label: "BILLING", exact: false },
  { to: "/app/api-keys", label: "API KEYS", exact: false },
];

function AppLayout() {
  const location = useLocation();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <div className="border-b border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            // MONITORING CONSOLE{email ? ` · ${email}` : ""}
          </p>
          <button
            type="button"
            onClick={() => supabase.auth.signOut().then(() => (window.location.href = "/"))}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent"
          >
            SIGN OUT
          </button>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const active = t.exact ? location.pathname === t.to : location.pathname.startsWith(t.to);
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`font-mono text-[11px] uppercase tracking-widest px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                  active ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                // {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
