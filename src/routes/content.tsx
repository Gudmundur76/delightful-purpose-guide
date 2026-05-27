import { Link, Outlet, createFileRoute, redirect, useLocation } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/content")({
  head: () => ({
    meta: [
      { title: "// CONTENT · grow.contact" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      throw redirect({ to: "/login", search: { redirect: location.pathname } as never });
    }
  },
  component: ContentLayout,
});

const TABS = [
  { to: "/content/briefs", label: "BRIEFS" },
  { to: "/content/drafts", label: "DRAFTS" },
  { to: "/content/calendar", label: "CALENDAR" },
];

function ContentLayout() {
  const loc = useLocation();
  return (
    <main className="min-h-[80vh] px-6 py-10 max-w-7xl mx-auto">
      <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
        // GROWCONTENT · WORKFLOW
      </div>
      <h1 className="font-extrabold text-4xl uppercase tracking-tighter mb-6">Content</h1>
      <nav className="flex gap-1 border-b border-border mb-8">
        {TABS.map((t) => {
          const active = loc.pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-widest border-b-2 -mb-px ${
                active ? "border-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>
      <Outlet />
    </main>
  );
}
