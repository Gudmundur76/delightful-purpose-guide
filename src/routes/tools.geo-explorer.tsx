import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import {
  runGeoExplorer,
  type ExplorerResult,
  type PromptIdea,
  type SerpCitation,
  type DomainSnapshot,
  type ContentBrief,
} from "@/lib/tools/geo-explorer.functions";
import {
  Loader2,
  Search,
  ListOrdered,
  Globe2,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

const URL_ = "https://grow.contact/tools/geo-explorer";
const TITLE = "GEO Explorer — free Ubersuggest-for-GEO in one page";
const DESC =
  "Free GEO research tool. Score any domain's AI citation share, discover the prompts buyers ask AI, see the AI SERP live, and generate answer-first content briefs. No signup.";

export const Route = createFileRoute("/tools/geo-explorer")({
  component: GeoExplorer,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL_ },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...ogImageMeta({
        title: "GEO Explorer — free Ubersuggest for AI citations",
        kicker: "grow.contact / tools",
        sub: "Domain snapshot, prompt ideas, live AI SERP, content brief. All free.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "GEO Explorer",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: URL_,
          description: DESC,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: {
            "@type": "Organization",
            name: "grow.contact",
            url: "https://grow.contact",
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "How is GEO Explorer different from Ubersuggest?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ubersuggest tells you what people type into Google. GEO Explorer tells you what people ask ChatGPT, Perplexity, and Gemini — and which domains those AI engines actually cite in the answer. It combines a domain citation snapshot, prompt-idea generator, live AI SERP, and content-brief generator into one free tool.",
              },
            },
            {
              "@type": "Question",
              name: "Is GEO Explorer free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Fully free, no signup, no email wall. It runs on our Lovable AI Gateway with Google Gemini 2.5 Flash and web search grounding.",
              },
            },
            {
              "@type": "Question",
              name: "Does citation difficulty replace keyword difficulty?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "For AI answer engines, yes. Citation difficulty rates how dominated a prompt's answer is by incumbents like Wikipedia, Reddit, or major publishers. Prompts with high difficulty are near-impossible for a new page to break into; low-difficulty prompts are winnable this quarter.",
              },
            },
          ],
        }),
      },
    ],
  }),
});

type Mode = "domain" | "prompts" | "serp" | "brief";

const TABS: Array<{ id: Mode; label: string; Icon: typeof Search; blurb: string }> = [
  { id: "domain", label: "Domain snapshot", Icon: Globe2, blurb: "Citation share for a domain across 6 category prompts." },
  { id: "prompts", label: "Prompt ideas", Icon: ListOrdered, blurb: "12 real prompts buyers ask AI around a seed topic." },
  { id: "serp", label: "AI SERP", Icon: Search, blurb: "Which domains AI cites right now for a prompt." },
  { id: "brief", label: "Content brief", Icon: FileText, blurb: "Answer-first outline engineered for citation." },
];

function GeoExplorer() {
  const [mode, setMode] = useState<Mode>("domain");
  const [domain, setDomain] = useState("");
  const [seed, setSeed] = useState("");
  const [prompt, setPrompt] = useState("");
  const [category, setCategory] = useState("");

  const runFn = useServerFn(runGeoExplorer);
  type ExplorerInput = Parameters<typeof runGeoExplorer>[0]["data"];
  const mut = useMutation({
    mutationFn: (input: ExplorerInput) => runFn({ data: input }),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "domain" && domain.trim()) {
      mut.mutate({ mode: "domain", domain: domain.trim(), category: category.trim() || undefined });
    } else if (mode === "prompts" && seed.trim()) {
      mut.mutate({ mode: "prompts", seed: seed.trim() });
    } else if (mode === "serp" && prompt.trim()) {
      mut.mutate({ mode: "serp", prompt: prompt.trim() });
    } else if (mode === "brief" && prompt.trim()) {
      mut.mutate({ mode: "brief", prompt: prompt.trim(), domain: domain.trim() || undefined });
    }
  };

  const data = mut.data;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-14">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free tool · New</p>
            <h1 className="mt-3 text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
              GEO Explorer — the Ubersuggest of getting cited by AI.
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
              Ubersuggest tells you what people type into Google. GEO Explorer tells you what people
              ask ChatGPT, Perplexity, and Gemini — and which domains those engines actually cite in
              the answer. Four modules, one page, no signup.
            </p>
            <time className="mt-3 block text-xs text-muted-foreground" dateTime="2026-07-17">
              Updated July 17, 2026
            </time>
          </div>
        </section>

        <section className="border-b border-border bg-card/40">
          <div className="mx-auto max-w-6xl px-6">
            <nav className="flex flex-wrap gap-1 -mb-px" aria-label="GEO Explorer modules">
              {TABS.map(({ id, label, Icon }) => {
                const active = mode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setMode(id);
                      mut.reset();
                    }}
                    className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm transition ${
                      active
                        ? "border-primary text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {label}
                  </button>
                );
              })}
            </nav>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-10">
          <p className="text-sm text-muted-foreground max-w-2xl">
            {TABS.find((t) => t.id === mode)?.blurb}
          </p>

          <form onSubmit={submit} className="mt-6 grid gap-3 max-w-3xl">
            {mode === "domain" && (
              <>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="your-domain.com"
                  aria-label="Domain to analyse"
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Optional: category (e.g. 'headless CMS for developers')"
                  aria-label="Category hint"
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </>
            )}
            {mode === "prompts" && (
              <input
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                placeholder="seed topic — e.g. 'llms.txt' or 'agent-native website'"
                aria-label="Seed topic"
                className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}
            {mode === "serp" && (
              <input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A real prompt — e.g. 'best free llms.txt generator'"
                aria-label="Prompt"
                className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
              />
            )}
            {mode === "brief" && (
              <>
                <input
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Target AI prompt — e.g. 'how to make a site cited by ChatGPT'"
                  aria-label="Target prompt"
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="Optional: your domain (used for tone)"
                  aria-label="Publishing domain"
                  className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </>
            )}
            <button
              type="submit"
              disabled={mut.isPending}
              className="inline-flex w-fit items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
            >
              {mut.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ArrowRight className="h-4 w-4" aria-hidden />}
              Run
            </button>
            <p className="text-xs text-muted-foreground">
              Live queries take 10-40 seconds. Domain snapshot runs 6 AI queries and takes longest.
            </p>
          </form>

          <div className="mt-10">
            {mut.isError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                {(mut.error as Error)?.message || "Request failed. Try again in a moment."}
              </div>
            )}

            {data?.mode === "domain" && <DomainView data={data.data} />}
            {data?.mode === "prompts" && <PromptsView data={data.data} seed={data.seed} />}
            {data?.mode === "serp" && (
              <SerpView prompt={data.prompt} engineAnswer={data.engineAnswer} citations={data.citations} />
            )}
            {data?.mode === "brief" && <BriefView data={data.data} prompt={data.prompt} />}
          </div>
        </section>

        <section className="border-t border-border bg-card/30">
          <div className="mx-auto max-w-6xl px-6 py-12 grid gap-8 md:grid-cols-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Why not Ubersuggest?
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Ubersuggest indexes Google. 48% of Google queries now show AI Overviews, and 83% of
                AI citations come from URLs outside Google's top 10. A keyword-volume tool measures
                a shrinking surface.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                What we measure instead
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Citation share, prompt-level difficulty, the actual AI SERP (which domains a live
                engine cites), and an answer-first content brief. All grounded in the same signals
                LLMs weight most: first-30% answer position, freshness, entity depth.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                The rest of the toolkit
              </h2>
              <ul className="mt-3 space-y-1 text-sm">
                <li><a className="text-primary hover:underline" href="/check">/check</a> — AI-readiness scanner (5 signals, 100-point score)</li>
                <li><a className="text-primary hover:underline" href="/tools/ai-visibility">AI visibility checker</a></li>
                <li><a className="text-primary hover:underline" href="/tools/llms-txt-generator">llms.txt generator</a></li>
                <li><a className="text-primary hover:underline" href="/tools/schema-generator">JSON-LD builder</a></li>
                <li><a className="text-primary hover:underline" href="/tools/robots-checker">robots.txt for AI</a></li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

// ---- Sub-views --------------------------------------------------------------

function ScoreBadge({ value, unit }: { value: number; unit?: string }) {
  return (
    <div className="text-right">
      <div className="text-3xl font-semibold">
        {value}
        {unit ? <span className="text-base text-muted-foreground">{unit}</span> : null}
      </div>
    </div>
  );
}

function DomainView({ data }: { data: DomainSnapshot }) {
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Domain</p>
            <h2 className="mt-1 text-xl font-semibold">{data.domain}</h2>
            <p className="mt-1 text-sm text-muted-foreground">Category: {data.category}</p>
          </div>
          <div>
            <ScoreBadge value={data.citationShare} unit="%" />
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-right">
              citation share
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Cited on these prompts</h3>
        <ul className="mt-3 space-y-2">
          {data.citedOn.map((row) => (
            <li key={row.prompt} className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
              <div className="flex-1">
                <div className="text-sm">{row.prompt}</div>
                {row.competitors.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Cited: {row.competitors.join(", ")}
                  </div>
                )}
              </div>
              <span className={`inline-flex items-center gap-1 text-xs shrink-0 ${row.cited ? "text-primary" : "text-muted-foreground"}`}>
                {row.cited ? (
                  <><CheckCircle2 className="h-3.5 w-3.5" /> You</>
                ) : (
                  <><XCircle className="h-3.5 w-3.5" /> Missed</>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {data.topCompetitors.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Top cited competitors</h3>
          <ul className="mt-3 space-y-2">
            {data.topCompetitors.map((c) => (
              <li key={c.domain} className="flex items-center justify-between text-sm">
                <span>{c.domain}</span>
                <span className="text-xs text-muted-foreground">{c.hits} prompt{c.hits === 1 ? "" : "s"}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.fixes.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Fixes to ship this week</h3>
          <ol className="mt-3 space-y-2 list-decimal list-inside text-sm">
            {data.fixes.map((f) => (
              <li key={f} className="text-muted-foreground"><span className="text-foreground">{f}</span></li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function difficultyClass(d: number) {
  if (d >= 70) return "bg-destructive/15 text-destructive";
  if (d >= 40) return "bg-yellow-500/15 text-yellow-500";
  return "bg-primary/15 text-primary";
}

function PromptsView({ data, seed }: { data: PromptIdea[]; seed: string }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        12 prompts around <span className="font-medium text-foreground">"{seed}"</span>. Lower
        difficulty = winnable this quarter.
      </p>
      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/70 text-left text-xs uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-2">Prompt</th>
              <th className="px-4 py-2">Intent</th>
              <th className="px-4 py-2">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.prompt} className="border-t border-border align-top">
                <td className="px-4 py-3">
                  <div>{p.prompt}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.why}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full border border-border px-2 py-0.5 text-xs capitalize">
                    {p.intent}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs ${difficultyClass(p.difficulty)}`}>
                    {p.difficulty}/100
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SerpView({ prompt, engineAnswer, citations }: { prompt: string; engineAnswer: string; citations: SerpCitation[] }) {
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Prompt</p>
        <p className="mt-1 text-sm font-medium">{prompt}</p>
      </div>
      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">AI answer (Gemini 2.5 Flash, web-grounded)</h3>
        <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">{engineAnswer}</p>
      </div>
      {citations.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Cited domains ({citations.length})</h3>
          <ul className="mt-3 space-y-2">
            {citations.map((c, i) => (
              <li key={`${c.domain}-${i}`} className="flex items-start justify-between gap-3 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                <div className="flex-1">
                  <div className="text-sm font-medium">{c.domain}</div>
                  {c.quote && <div className="mt-1 text-xs text-muted-foreground">"{c.quote}"</div>}
                </div>
                {c.url && (
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
                  >
                    Open <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function BriefView({ data, prompt }: { data: ContentBrief; prompt: string }) {
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-border bg-card p-5">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Target prompt</p>
        <p className="mt-1 text-sm font-medium">{prompt}</p>
        <h2 className="mt-4 text-xl font-semibold">{data.title}</h2>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Answer-first paragraph (40-60 words)</h3>
        <p className="mt-3 text-sm text-muted-foreground italic">{data.answerFirstParagraph}</p>
      </div>

      <div className="rounded-md border border-border bg-card p-5">
        <h3 className="text-sm font-semibold">Section outline</h3>
        <ol className="mt-3 space-y-3 list-decimal list-inside text-sm">
          {data.headings.map((h) => (
            <li key={h.text}>
              <span className="font-medium">H{h.h}: {h.text}</span>
              <div className="mt-1 ml-6 text-xs text-muted-foreground">{h.note}</div>
            </li>
          ))}
        </ol>
      </div>

      {data.faqs.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">FAQ block (ship as FAQPage JSON-LD)</h3>
          <dl className="mt-3 space-y-3 text-sm">
            {data.faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-1 text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {data.citableClaims.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">Citable claims to include</h3>
          <ul className="mt-3 space-y-1 text-sm list-disc list-inside">
            {data.citableClaims.map((c) => (
              <li key={c} className="text-muted-foreground"><span className="text-foreground">{c}</span></li>
            ))}
          </ul>
        </div>
      )}

      {data.jsonLdTypes.length > 0 && (
        <div className="rounded-md border border-border bg-card p-5">
          <h3 className="text-sm font-semibold">JSON-LD to ship</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.jsonLdTypes.map((t) => (
              <span key={t} className="inline-flex rounded-full border border-border px-2 py-0.5 text-xs">{t}</span>
            ))}
          </div>
        </div>
      )}

      {(_ = ExplorerResult, null)}
    </div>
  );
}

// Silence unused-type lint for re-exported ExplorerResult (used only by mutation type inference).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let _: unknown;
type _NoOp = ExplorerResult;
