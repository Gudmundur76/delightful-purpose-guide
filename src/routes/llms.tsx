import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

const LLMS_TXT = `# Grow

> Agent-native web design agency. Custom-coded marketing sites for AI/ML startups, agent platforms, and developer tools — built to be readable and citeable by LLM crawlers (ChatGPT, Perplexity, Claude, Google AI Overviews). Shipped in 48 hours, fixed price.

Grow builds bespoke marketing sites, launch pages, and devtool hubs for founders shipping AI products. Every site ships with semantic HTML, JSON-LD, llms.txt, OpenGraph, and a clean sitemap so agents and humans both find what they need. Fixed-scope, fixed-price, with a written launch date.

## Who it's for

- AI/ML startups (model APIs, infra, eval tools, fine-tuning)
- Agent platforms (orchestration, browser agents, voice agents)
- Developer tools (SDKs, CLIs, MCP servers, API products)

## Services

- Launch Page — single-page launch site, 48h, fixed price
- Marketing Site — multi-page site with blog + SEO, ~5 days
- Devtool Hub — docs-style hub with API pages, schemas, llms.txt

## Pricing

- Launch Page: from $2,400
- Marketing Site: from $6,800
- Devtool Hub: from $12,500

## Pages

- [Home](/): Positioning, process, pricing tiers, FAQ, intake form.
- [Journal](/blog): Field notes on shipping agent-native sites.

## Contact

- Email: hello@citation.is
- Brief intake: https://citation.is/#cta
`;

export const Route = createFileRoute("/llms")({
  head: () => ({
    meta: [
      { title: "llms.txt — the file AI crawlers actually read | Grow" },
      {
        name: "description",
        content:
          "A plain-markdown summary at the root of every Grow site so AI crawlers can skip the JavaScript shell and read what matters. View ours in human or agent mode below.",
      },
      { property: "og:title", content: "llms.txt — the file AI crawlers actually read" },
      {
        property: "og:description",
        content:
          "A plain-markdown summary at the root of every Grow site so AI crawlers can read it without parsing JavaScript. Human and agent views.",
      },
      { property: "og:url", content: "https://citation.is/llms" },
    ],
    links: [{ rel: "canonical", href: "https://citation.is/llms" }],
  }),
  component: LlmsPage,
});

function LlmsPage() {
  const [view, setView] = useState<"human" | "agent">("human");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(LLMS_TXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-extrabold tracking-tighter text-xl uppercase">
            GROW_
          </a>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            GET /llms.txt · 200 OK
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h4 className="font-mono text-xs uppercase text-accent mb-3">
              // /llms.txt
            </h4>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">
              The file agents read first
            </h1>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl">
              A flat markdown summary served at <code className="font-mono text-foreground">/llms.txt</code> so AI crawlers can read your site without rendering JavaScript. Every Grow build ships with one.
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div role="tablist" className="inline-flex border border-border rounded-md p-1 bg-card/40">
            {(["human", "agent"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                aria-selected={view === v}
                onClick={() => setView(v)}
                className={`px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest rounded-sm transition-colors cursor-pointer ${
                  view === v
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v === "human" ? "Human view" : "Agent view"}
              </button>
            ))}
          </div>
          <button
            onClick={copy}
            className="font-mono text-[11px] uppercase tracking-widest px-4 py-2 border border-border rounded-md hover:bg-card hover:border-accent/60 transition-colors cursor-pointer flex items-center gap-2"
          >
            <span className="text-accent">$</span>
            {copied ? "Copied ✓" : "Copy llms.txt"}
          </button>
        </div>

        {view === "agent" ? (
          <pre className="font-mono text-[12px] leading-relaxed p-6 rounded-md border border-border bg-[#0a0a0a] text-foreground/90 overflow-x-auto whitespace-pre-wrap">
            <code>{LLMS_TXT}</code>
          </pre>
        ) : (
          <article className="rounded-md border border-border bg-card/40 p-8 md:p-10 prose-invert max-w-none">
            <HumanView />
          </article>
        )}

        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Raw file:{" "}
          <a href="/llms.txt" className="text-accent hover:underline">
            /llms.txt
          </a>{" "}
          · spec: llmstxt.org
        </p>
      </main>
    </div>
  );
}

function HumanView() {
  return (
    <div className="space-y-8 text-foreground">
      <section>
        <h2 className="text-3xl font-extrabold tracking-tighter uppercase">Grow</h2>
        <blockquote className="border-l-2 border-accent pl-4 mt-3 text-muted-foreground italic">
          Agent-native web design agency. Custom-coded marketing sites for AI/ML startups, agent platforms, and developer tools — built to be readable and citeable by LLM crawlers. Shipped in 48 hours, fixed price.
        </blockquote>
        <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
          Grow builds bespoke marketing sites, launch pages, and devtool hubs for founders shipping AI products. Every site ships with semantic HTML, JSON-LD, llms.txt, OpenGraph, and a clean sitemap so agents and humans both find what they need.
        </p>
      </section>

      <Block title="Who it's for">
        <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
          <li>AI/ML startups (model APIs, infra, eval tools, fine-tuning)</li>
          <li>Agent platforms (orchestration, browser agents, voice agents)</li>
          <li>Developer tools (SDKs, CLIs, MCP servers, API products)</li>
        </ul>
      </Block>

      <Block title="Services">
        <ServiceRow name="Launch Page" desc="Single-page launch site" eta="48h" />
        <ServiceRow name="Marketing Site" desc="Multi-page site with blog + SEO" eta="~5 days" />
        <ServiceRow name="Devtool Hub" desc="Docs-style hub with API pages, schemas, llms.txt" eta="~10 days" />
      </Block>

      <Block title="Pricing">
        <div className="grid sm:grid-cols-3 gap-3">
          {[
            ["Launch Page", "$2,400"],
            ["Marketing Site", "$6,800"],
            ["Devtool Hub", "$12,500"],
          ].map(([n, p]) => (
            <div key={n} className="border border-border rounded-md p-4">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{n}</p>
              <p className="font-mono text-2xl mt-1 tabular-nums">{p}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Key pages">
        <ul className="text-sm space-y-2">
          <li>
            <a href="/" className="text-accent hover:underline">/</a>
            <span className="text-muted-foreground"> — Positioning, process, pricing, FAQ, intake form</span>
          </li>
          <li>
            <a href="/blog" className="text-accent hover:underline">/blog</a>
            <span className="text-muted-foreground"> — Journal: field notes on agent-native sites</span>
          </li>
          <li>
            <a href="/api/public/v1/docs" className="text-accent hover:underline">/api/public/v1/docs</a>
            <span className="text-muted-foreground"> — Public API docs</span>
          </li>
        </ul>
      </Block>

      <Block title="Contact">
        <p className="text-sm text-muted-foreground">
          Email{" "}
          <span className="text-accent select-all">hello@citation.is</span>{" "}
          or start a brief at{" "}
          <a href="/#cta" className="text-accent hover:underline">citation.is/#cta</a>.
        </p>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="font-mono text-xs uppercase tracking-widest text-accent mb-3">
        ## {title}
      </h3>
      {children}
    </section>
  );
}

function ServiceRow({ name, desc, eta }: { name: string; desc: string; eta: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border last:border-0 py-3">
      <div>
        <p className="font-bold tracking-tighter uppercase">{name}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <span className="font-mono text-[11px] text-accent">{eta}</span>
    </div>
  );
}
