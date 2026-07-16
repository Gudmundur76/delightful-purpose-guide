import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import {
  runPromptCloud,
  type PromptCloud,
  type PromptFormat,
  type CloudPrompt,
} from "@/lib/tools/prompt-cloud.functions";
import { Loader2, Cloud, Download, Zap, TrendingUp } from "lucide-react";

const URL_ = "https://grow.contact/tools/prompt-cloud";
const TITLE = "Prompt Cloud — the AnswerThePublic for AI citations";
const DESC =
  "Free. Expand any seed into 40 real prompts buyers type into ChatGPT, Perplexity, Claude and Gemini — with intent, format, citation difficulty, and the incumbent domain to displace. CSV export, no signup.";

export const Route = createFileRoute("/tools/prompt-cloud")({
  component: PromptCloudPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL_ },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...ogImageMeta({
        title: "Prompt Cloud",
        kicker: "grow.contact / tools",
        sub: "The AnswerThePublic replacement for the AI-cited web.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Prompt Cloud",
          applicationCategory: "SEOApplication",
          operatingSystem: "Any",
          url: URL_,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description: DESC,
        }),
      },
    ],
  }),
});

const FORMAT_LABEL: Record<PromptFormat, string> = {
  question: "Questions",
  comparison: "Comparisons",
  preposition: "Prepositions",
  vs: "Head-to-head (vs)",
  listicle: "Listicles",
  "how-to": "How-to",
  definition: "Definitions",
};

const FORMAT_ORDER: PromptFormat[] = [
  "question",
  "comparison",
  "vs",
  "listicle",
  "how-to",
  "preposition",
  "definition",
];

function difficultyColor(d: number) {
  if (d <= 33) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (d <= 66) return "bg-amber-500/15 text-amber-400 border-amber-500/30";
  return "bg-rose-500/15 text-rose-400 border-rose-500/30";
}

function toCsv(cloud: PromptCloud): string {
  const header = ["prompt", "format", "intent", "difficulty", "incumbent", "angle"].join(",");
  const rows = cloud.prompts.map((p) =>
    [p.prompt, p.format, p.intent, p.difficulty, p.incumbent, p.angle]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header, ...rows].join("\n");
}

function downloadCsv(cloud: PromptCloud) {
  const blob = new Blob([toCsv(cloud)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prompt-cloud-${cloud.seed.replace(/\W+/g, "-").toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function PromptRow({ p }: { p: CloudPrompt }) {
  return (
    <li className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium leading-snug">{p.prompt}</p>
        <span
          className={`shrink-0 rounded border px-2 py-0.5 text-xs font-semibold ${difficultyColor(p.difficulty)}`}
          title="Citation difficulty (0-100). Higher = the incumbent domain is entrenched in AI answers."
        >
          {p.difficulty}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded bg-muted px-2 py-0.5 capitalize">{p.intent}</span>
        <span className="rounded bg-muted px-2 py-0.5">{FORMAT_LABEL[p.format]}</span>
        {p.incumbent && p.incumbent !== "none" && (
          <span className="rounded bg-muted px-2 py-0.5">
            Cited today: <span className="font-mono">{p.incumbent}</span>
          </span>
        )}
      </div>
      {p.angle && <p className="mt-2 text-sm text-muted-foreground">→ {p.angle}</p>}
    </li>
  );
}

function PromptCloudPage() {
  const run = useServerFn(runPromptCloud);
  const [seed, setSeed] = useState("");
  const [audience, setAudience] = useState("");

  const mut = useMutation({
    mutationFn: async () =>
      run({ data: { seed: seed.trim(), audience: audience.trim() || undefined } }),
  });

  const cloud = mut.data;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free tool</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              Prompt Cloud.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              AnswerThePublic maps Google autocomplete. Prompt Cloud maps the prompts real buyers
              type into ChatGPT, Perplexity, Claude and Gemini — with citation difficulty, the
              incumbent domain, and the angle to displace it.
            </p>

            <form
              className="mt-8 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
              onSubmit={(e) => {
                e.preventDefault();
                if (seed.trim().length >= 2) mut.mutate();
              }}
            >
              <input
                type="text"
                placeholder="Seed topic (e.g. cold plunge tub)"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                required
                minLength={2}
                maxLength={120}
                aria-label="Seed topic"
              />
              <input
                type="text"
                placeholder="Audience (optional, e.g. home-gym buyer)"
                className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                maxLength={120}
                aria-label="Audience"
              />
              <button
                type="submit"
                disabled={mut.isPending || seed.trim().length < 2}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {mut.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Mapping…
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4" /> Generate cloud
                  </>
                )}
              </button>
            </form>
            {mut.isError && (
              <p className="mt-3 text-sm text-destructive">
                {(mut.error as Error)?.message ?? "Something went wrong. Try again."}
              </p>
            )}
          </div>
        </section>

        {cloud && (
          <section className="mx-auto max-w-6xl px-6 py-10 space-y-10">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Summary for "{cloud.seed}"
                  </p>
                  <p className="mt-2 max-w-3xl text-sm leading-relaxed">{cloud.summary}</p>
                </div>
                <button
                  onClick={() => downloadCsv(cloud)}
                  className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:border-primary"
                >
                  <Download className="h-4 w-4" /> Export CSV
                </button>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Prompts mapped</p>
                  <p className="mt-1 text-2xl font-semibold">{cloud.prompts.length}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Avg. citation difficulty</p>
                  <p className="mt-1 text-2xl font-semibold">
                    {Math.round(
                      cloud.prompts.reduce((a, p) => a + p.difficulty, 0) /
                        Math.max(1, cloud.prompts.length),
                    )}
                    <span className="text-sm text-muted-foreground">/100</span>
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-xs text-muted-foreground">Quick wins (difficulty ≤ 40)</p>
                  <p className="mt-1 text-2xl font-semibold">{cloud.quickWins.length}</p>
                </div>
              </div>
            </div>

            {cloud.quickWins.length > 0 && (
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <h2 className="text-xl font-semibold">Quick wins</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  High-intent prompts where no incumbent has locked the AI answer. Ship these first.
                </p>
                <ul className="mt-4 grid gap-3 md:grid-cols-2">
                  {cloud.quickWins.map((p, i) => (
                    <PromptRow key={`qw-${i}`} p={p} />
                  ))}
                </ul>
              </div>
            )}

            {cloud.incumbentShare.length > 0 && (
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-xl font-semibold">Who AI cites today</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Domains AI engines most likely quote for these prompts right now. Displace, don't
                  join.
                </p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {cloud.incumbentShare.map((c) => (
                    <li
                      key={c.domain}
                      className="rounded-md border border-border bg-card px-3 py-1.5 text-sm"
                    >
                      <span className="font-mono">{c.domain}</span>{" "}
                      <span className="text-muted-foreground">×{c.hits}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold">Every prompt, by format</h2>
              <div className="mt-4 space-y-8">
                {FORMAT_ORDER.map((fmt) => {
                  const list = cloud.buckets[fmt] ?? [];
                  if (list.length === 0) return null;
                  return (
                    <div key={fmt}>
                      <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        {FORMAT_LABEL[fmt]} <span className="text-muted-foreground/70">({list.length})</span>
                      </h3>
                      <ul className="mt-3 grid gap-3 md:grid-cols-2">
                        {list.map((p, i) => (
                          <PromptRow key={`${fmt}-${i}`} p={p} />
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {!cloud && !mut.isPending && (
          <section className="mx-auto max-w-6xl px-6 py-14">
            <h2 className="text-xl font-semibold">Why not AnswerThePublic?</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card p-5">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  AnswerThePublic
                </p>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  <li>• Scrapes Google autocomplete.</li>
                  <li>• Shows what people typed into a search box.</li>
                  <li>• No difficulty, no incumbent, no angle.</li>
                  <li>• Free tier throttled; paid tier for more searches.</li>
                </ul>
              </div>
              <div className="rounded-lg border border-primary/40 bg-card p-5">
                <p className="text-xs uppercase tracking-widest text-primary">Prompt Cloud</p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li>• Generates the prompts buyers type into ChatGPT / Perplexity / Claude / Gemini.</li>
                  <li>• Every prompt tagged with intent, format, and citation difficulty.</li>
                  <li>• Names the domain AI cites today and the angle to displace it.</li>
                  <li>• Free, no signup, CSV export, unlimited.</li>
                </ul>
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
