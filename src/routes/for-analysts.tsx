import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ogImageMeta } from "@/lib/seo/og";

const TITLE = "For Analysts — the structured dataset for AI company discovery";
const DESC =
  "390+ AI companies scored for citation readiness, authority, and verifiability. REST API used by Silobreaker, Visvo, and other intelligence platforms.";

export const Route = createFileRoute("/for-analysts")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      ...ogImageMeta({ title: TITLE, description: DESC, kicker: "FOR ANALYSTS" }),
    ],
  }),
  component: ForAnalystsPage,
});

const PLATFORMS = ["Silobreaker", "Visvo", "Egerin", "Jamasp", "Findelio"];

const FEATURES = [
  {
    title: "CCS Scores",
    body: "Citation Corpus Score — 0–100, predictive of AI citation frequency across major engines.",
  },
  {
    title: "Authority Signals",
    body: "GitHub stars, G2 reviews, news mentions, Stack Overflow questions — raw and normalized.",
  },
  {
    title: "Citation Frequency",
    body: "Who gets cited by ChatGPT, Perplexity, Claude, and Google AI Overviews. Updated every 15 minutes.",
  },
  {
    title: "Truth Verification",
    body: "Which company claims are verified, partial, or unverifiable — with engine-level contradiction detection.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$499",
    cadence: "/mo",
    calls: "1,000 API calls / mo",
    companies: "5 tracked companies",
    refresh: "Weekly data refresh",
  },
  {
    name: "Pro",
    price: "$1,999",
    cadence: "/mo",
    calls: "10,000 API calls / mo",
    companies: "25 tracked companies",
    refresh: "Daily data refresh",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    calls: "Unlimited API calls",
    companies: "Unlimited companies",
    refresh: "Real-time + webhooks",
  },
];

function ForAnalystsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-16 md:py-24 space-y-16">
        {/* Hero */}
        <section>
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // for-analysts@2026.05
          </div>
          <h1 className="font-extrabold text-4xl md:text-5xl tracking-tighter mb-5">
            The structured dataset for AI company discovery.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            Intelligence platforms already index us. 390+ AI companies scored
            for citation readiness, authority, and verifiability. Updated in
            real time.
          </p>

          <div className="flex flex-wrap gap-2 mt-8">
            {PLATFORMS.map((name) => (
              <span
                key={name}
                className="px-3 py-1 border border-border bg-card text-xs font-mono uppercase tracking-wider"
              >
                Indexed by {name}
              </span>
            ))}
          </div>
        </section>

        {/* Features */}
        <section>
          <h2 className="font-bold text-2xl mb-6 tracking-tight">
            What you get
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-5 border-border bg-card/40">
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section>
          <h2 className="font-bold text-2xl mb-6 tracking-tight">Pricing</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {PLANS.map((plan) => (
              <Card
                key={plan.name}
                className={`p-6 border ${
                  plan.highlight
                    ? "border-accent shadow-lg"
                    : "border-border bg-card/40"
                }`}
              >
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <p className="text-3xl font-extrabold tracking-tight my-2">
                  {plan.price}
                  <span className="text-base font-normal text-muted-foreground">
                    {plan.cadence}
                  </span>
                </p>
                <ul className="text-sm space-y-1.5 text-muted-foreground mt-4">
                  <li>{plan.calls}</li>
                  <li>{plan.companies}</li>
                  <li>{plan.refresh}</li>
                  <li>CSV + JSON export</li>
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA / form */}
        <section className="border border-border bg-card/40 p-6 md:p-10">
          <APIKeyRequestForm />
        </section>

        {/* Sample request */}
        <section>
          <h2 className="font-bold text-2xl mb-4 tracking-tight">
            Sample request
          </h2>
          <pre className="bg-card/60 border border-border p-4 font-mono text-xs overflow-x-auto">
{`curl https://grow.contact/api/public/v1/companies/anthropic.com \\
  -H "Authorization: Bearer YOUR_API_KEY"

{
  "domain": "anthropic.com",
  "ccs": 87,
  "authority": { "github_stars": 4200, "news_mentions": 312 },
  "citations": { "chatgpt": 0.71, "gemini": 0.54, "perplexity": 0.62 },
  "verified_claims": 18,
  "contradictions_24h": 0
}`}
          </pre>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function APIKeyRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const form = e.currentTarget;
      const fd = new FormData(form);
      const payload = {
        email: String(fd.get("email") || ""),
        company: String(fd.get("company") || ""),
        plan: String(fd.get("plan") || "starter"),
        use_case: String(fd.get("use_case") || ""),
        website: String(fd.get("website") || ""), // honeypot
      };
      const res = await fetch("/api/public/v1/api-key-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Something went wrong");
      }
      setSubmitted(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
          // request received
        </div>
        <p className="text-lg font-medium">
          We'll review and send your API key within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="max-w-lg mx-auto space-y-4">
      <h3 className="font-bold text-xl text-center tracking-tight">
        Request API Access
      </h3>
      <Input name="email" type="email" placeholder="you@company.com" required />
      <Input name="company" placeholder="Company name" required />
      <select
        name="plan"
        defaultValue="pro"
        className="w-full h-10 px-3 border border-border bg-background text-sm rounded-md"
      >
        <option value="starter">Starter — $499/mo</option>
        <option value="pro">Pro — $1,999/mo</option>
        <option value="enterprise">Enterprise — Custom</option>
      </select>
      <Textarea
        name="use_case"
        placeholder="What will you use the data for? (optional)"
        rows={3}
      />
      {/* honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />
      {error && (
        <p className="text-sm text-destructive font-mono">{error}</p>
      )}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? "Submitting…" : "Request API Key"}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Manual review. We reply within 24 hours.
      </p>
    </form>
  );
}
