import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

const searchSchema = z.object({
  q: z.string().optional().default(""),
});

export const Route = createFileRoute("/verifier/search")({
  validateSearch: searchSchema,
  head: ({ match }) => {
    const q = (match.search as { q?: string })?.q ?? "";
    const title = q ? `"${q}" — The Verifier` : "The Verifier — Search";
    return {
      meta: [
        { title },
        { name: "description", content: "Verified answers about AI companies, models, and infrastructure." },
        { property: "og:title", content: title },
        ...ogImageMeta({ title: q || "The Verifier", kicker: "Verified answer" }),
      ],
    };
  },
  component: VerifierSearch,
});

function VerifierSearch() {
  const { q } = Route.useSearch();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
        <Link
          to="/verifier"
          className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
        >
          ← Back to Verifier
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-4">
          {q || "Ask anything"}
        </h1>
        <div className="mt-10 rounded-xl border border-border bg-card p-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // COMING SOON
          </p>
          <p className="text-muted-foreground">
            Synthesis with cited claims will land next. For now, browse the{" "}
            <Link to="/verifier/leaderboard" className="text-accent hover:underline">
              truth leaderboard
            </Link>{" "}
            or explore{" "}
            <Link to="/verifier/contradictions" className="text-accent hover:underline">
              contradictions
            </Link>
            .
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
