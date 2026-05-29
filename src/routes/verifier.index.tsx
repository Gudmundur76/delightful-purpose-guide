import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { ogImageMeta } from "@/lib/seo/og";
import { TRENDING_QUERIES, VERIFIER_STATS } from "@/lib/verifier/mock";

const TITLE = "The Verifier — Ask anything about AI companies";
const DESC = "Get verified answers about AI companies, models, and infrastructure. Every claim backed by a source.";

export const Route = createFileRoute("/verifier/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      ...ogImageMeta({ title: "The Verifier", kicker: "Verified AI answers", sub: DESC }),
    ],
  }),
  component: VerifierHome,
});

function VerifierHome() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const submit = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate({ to: "/verifier/search", search: { q: trimmed } });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24">
        <div className="w-full max-w-2xl mx-auto text-center space-y-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent">
            // THE VERIFIER · BETA
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Ask anything about AI companies.
            <span className="block text-muted-foreground font-normal mt-2">
              Get verified answers.
            </span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Every claim cross-checked against docs, benchmarks, and source code.
            No hallucinations. No marketing fluff.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(q);
            }}
            className="relative w-full"
          >
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="e.g. Which vector DB has the lowest p99 latency?"
              className="w-full h-14 rounded-full bg-card border border-border pl-14 pr-32 text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              autoFocus
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-5"
            >
              Verify
            </Button>
          </form>

          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {TRENDING_QUERIES.map((query) => (
              <button
                key={query}
                type="button"
                onClick={() => submit(query)}
                className="text-xs sm:text-sm px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent hover:text-accent-foreground hover:border-accent transition-colors text-muted-foreground"
              >
                {query}
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-border/50 mt-12">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 font-mono text-xs">
              <Stat n={VERIFIER_STATS.companies} label="companies" />
              <Stat n={VERIFIER_STATS.claims.toLocaleString()} label="claims analyzed" />
              <Stat n={VERIFIER_STATS.verified} label="verified" />
              <Stat n={VERIFIER_STATS.contradictions} label="contradictions" />
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <Link to="/verifier/leaderboard" className="hover:text-accent transition-colors">
              Truth leaderboard →
            </Link>
            <span className="opacity-30">·</span>
            <Link to="/verifier/contradictions" className="hover:text-accent transition-colors">
              Contradictions →
            </Link>
            <span className="opacity-30">·</span>
            <Link to="/leaderboard.methodology" className="hover:text-accent transition-colors">
              Methodology →
            </Link>
          </div>

          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 pt-4">
            Powered by grow.contact
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-2xl font-bold text-foreground">{n}</span>
      <span className="text-muted-foreground uppercase tracking-widest">{label}</span>
    </div>
  );
}
