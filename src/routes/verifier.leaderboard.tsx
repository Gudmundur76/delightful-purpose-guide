import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

const TITLE = "Truth Leaderboard — The Verifier";
const DESC = "AI companies ranked by verified claims, contradictions, and reproducibility.";

export const Route = createFileRoute("/verifier/leaderboard")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      ...ogImageMeta({ title: "Truth Leaderboard", kicker: "The Verifier", sub: DESC }),
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12">
        <Link to="/verifier" className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent">
          ← Back to Verifier
        </Link>
        <h1 className="text-3xl font-bold mt-4">Truth Leaderboard</h1>
        <p className="text-muted-foreground mt-2">{DESC}</p>
        <div className="mt-10 rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          Coming soon — ranked rows from the <code>claims</code> table.
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
