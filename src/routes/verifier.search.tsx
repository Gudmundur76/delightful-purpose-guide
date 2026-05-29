import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { CitationCard } from "@/components/verifier/CitationCard";
import { ContradictionSection } from "@/components/verifier/ContradictionSection";
import { ShareButton } from "@/components/verifier/ShareButton";
import { SEARCH_RESULT } from "@/lib/verifier/mock";

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
  const navigate = useNavigate();
  const displayQuery = q || SEARCH_RESULT.query;
  const data = SEARCH_RESULT;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 sm:py-14">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <Link
            to="/verifier"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-accent transition-colors"
          >
            ← Back to Verifier
          </Link>
          <ShareButton query={displayQuery} />
        </div>

        <header className="mt-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            // verified answer
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-2">
            {displayQuery}
          </h1>
        </header>

        {/* AI answer */}
        <section className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            // synthesis · {data.claims.length} sources
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-foreground/95">
            {data.answer}
          </p>
        </section>

        {/* Citations */}
        <section className="mt-8 space-y-3">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            // citations
          </h2>
          {data.claims.map((claim, i) => (
            <CitationCard key={claim.id} claim={claim} index={i} />
          ))}
        </section>

        {/* Contradiction */}
        <div className="mt-8">
          <ContradictionSection contradiction={data.contradiction} />
        </div>

        {/* Related questions */}
        <section className="mt-10">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
            // related questions
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.related.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => navigate({ to: "/verifier/search", search: { q: r } })}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-foreground/90 hover:border-accent hover:text-accent transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
