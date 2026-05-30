import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/why")({
  component: WhyPage,
  head: () => ({
    meta: [
      { title: "Why doesn't ChatGPT cite you? — why.grow" },
      { name: "description", content: "Free diagnostic: find out why AI search engines ignore your site, and the 3 highest-impact fixes." },
      { property: "og:title", content: "Why doesn't ChatGPT cite you?" },
      { property: "og:description", content: "Free AI citation diagnostic for your domain." },
      ...ogImageMeta({ title: "Why doesn't ChatGPT cite you?", kicker: "why.grow", sub: "Free AI citation diagnostic" }),
    ],
  }),
});

type Problem = { issue: string; impact: string; fix: string; effort: string };
type Preview = {
  domain: string;
  ccs_score: number | null;
  category?: string;
  category_average?: number;
  gap?: string;
  citations_24h?: number;
  preview_problems?: Problem[];
  message?: string;
  cta?: string;
  cta_url?: string;
};

function WhyPage() {
  const [domain, setDomain] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPreview = async () => {
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/why-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim() }),
      });
      if (!res.ok) throw new Error("Scan failed");
      setPreview(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="max-w-2xl mx-auto pt-20 pb-10 px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Why doesn't ChatGPT cite you?
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            We track AI search engines across 66+ companies. Find out why they ignore your domain — and the 3 highest-impact fixes.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); runPreview(); }}
            className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
          >
            <Input
              placeholder="anthropic.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="flex-1"
              aria-label="Domain"
            />
            <Button type="submit" disabled={loading || !domain.trim()}>
              {loading ? "Analyzing…" : "Get my report"}
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-3">{error}</p>}
        </section>

        {preview && (
          <section className="max-w-2xl mx-auto px-4 pb-20">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{preview.domain}</h2>
                <span
                  className={
                    "text-3xl font-bold " +
                    (preview.ccs_score == null
                      ? "text-muted-foreground"
                      : preview.ccs_score >= 70
                      ? "text-emerald-600"
                      : preview.ccs_score >= 50
                      ? "text-amber-600"
                      : "text-destructive")
                  }
                >
                  {preview.ccs_score ?? "?"}/100
                </span>
              </div>

              {preview.ccs_score != null ? (
                <>
                  <div className="mb-6 text-sm text-muted-foreground space-y-1">
                    <p>
                      Category: {preview.category} (avg {preview.category_average}){" "}
                      <span className={preview.gap?.startsWith("+") ? "text-emerald-600" : "text-destructive"}>
                        {preview.gap}
                      </span>
                    </p>
                    <p>Citations captured (24h): <strong>{preview.citations_24h}</strong></p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <h3 className="font-semibold text-destructive">Top problems</h3>
                    {preview.preview_problems?.map((p, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <span className="text-destructive font-bold">!</span>
                        <div className="text-sm">
                          <p className="font-medium">{p.issue}</p>
                          <p className="text-muted-foreground">
                            Impact: {p.impact} · Fix: {p.fix} · Effort: {p.effort}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!preview.preview_problems || preview.preview_problems.length === 0) && (
                      <p className="text-sm text-muted-foreground">Your site looks healthy. Unlock the full report for engine-specific gaps.</p>
                    )}
                  </div>

                  <UnlockGate domain={preview.domain} />
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">{preview.message}</p>
                  {preview.cta_url && (
                    <Button asChild>
                      <Link to={preview.cta_url}>{preview.cta}</Link>
                    </Button>
                  )}
                </div>
              )}
            </Card>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

function UnlockGate({ domain }: { domain: string }) {
  const [email, setEmail] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const unlock = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/public/why-unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, email }),
      });
      if (res.ok) setUnlocked(true);
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) {
    return (
      <div className="text-center py-4 border-t">
        <p className="text-emerald-700 font-medium mb-4">Report unlocked.</p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button asChild>
            <a href={`/why/${domain}`}>View full report</a>
          </Button>
          <Button asChild variant="outline">
            <a href="https://calendly.com/grow-contact/intro" target="_blank" rel="noopener noreferrer">
              Book strategy call
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t pt-6">
      <h3 className="font-semibold mb-2">Unlock the full 6-section report</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Authority breakdown, engine-specific fixes, competitor comparison, and a ranked fix list.
      </p>
      <form
        onSubmit={(e) => { e.preventDefault(); unlock(); }}
        className="flex flex-col sm:flex-row gap-2"
      >
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="flex-1"
        />
        <Button type="submit" disabled={loading || !email}>
          {loading ? "Unlocking…" : "Unlock for free"}
        </Button>
      </form>
    </div>
  );
}
