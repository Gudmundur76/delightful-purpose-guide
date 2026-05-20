import { useState } from "react";

type TabKey = "html" | "schema" | "performance" | "agent";

const TABS: { key: TabKey; label: string; method: string }[] = [
  { key: "html", label: "HTML", method: "GET" },
  { key: "schema", label: "Schema", method: "GET" },
  { key: "performance", label: "Performance", method: "GET" },
  { key: "agent", label: "Agent", method: "GET" },
];

const HTML_CODE = `<!-- Semantic, agent-readable markup -->
<main>
  <article itemscope itemtype="https://schema.org/Product">
    <header>
      <h1 itemprop="name">Vector — Embeddings API</h1>
      <p itemprop="description">Low-latency vector search…</p>
    </header>
    <section aria-labelledby="features">
      <h2 id="features">Features</h2>
      <ul>
        <li>p95 &lt; 12ms cold start</li>
        <li>OpenAI-compatible endpoint</li>
      </ul>
    </section>
    <footer>
      <nav aria-label="Breadcrumb">
        <ol>…</ol>
      </nav>
    </footer>
  </article>
</main>`;

const SCHEMA_CODE = `{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Vector — Embeddings API",
  "brand": { "@type": "Brand", "name": "Grow" },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "USD",
    "price": "0.0001",
    "priceSpecification": { "unitText": "per 1k tokens" }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "284"
  }
}`;

const AGENT_CODE = `# llms.txt
# https://grow.contact/llms.txt
# parsed in 18ms · 1.2 KB

> Grow ships agent-native marketing sites for AI/ML
> startups, agent platforms, and developer tools.

## Services
- /services/landing      — 48h fixed-price landing
- /services/docs-site    — agent-readable docs
- /services/api-pages    — schema-rich API pages

## Endpoints
- /api/public/v1/openapi.json
- /api/public/v1/docs
- /api/readiness  →  {"status":"agent-ready","score":85}

## Contact
hello@grow.contact`;

const PERF_METRICS = [
  { label: "Lighthouse", value: "96", unit: "/100", good: true },
  { label: "LCP", value: "1.1", unit: "s", good: true },
  { label: "CLS", value: "0.02", unit: "", good: true },
  { label: "TBT", value: "40", unit: "ms", good: true },
  { label: "INP", value: "118", unit: "ms", good: true },
  { label: "TTFB", value: "180", unit: "ms", good: true },
];

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="rounded-md border border-border bg-[#0a0a0a] overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 bg-card/50">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {lang}
        </span>
      </div>
      <pre className="font-mono text-[11px] sm:text-[12px] leading-relaxed p-3 sm:p-5 overflow-x-auto text-foreground/90">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function TechSpecs() {
  const [tab, setTab] = useState<TabKey>("html");

  return (
    <section className="border-t border-border py-16 sm:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h4 className="font-mono text-xs uppercase text-accent mb-3">
              // Technical Specifications
            </h4>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">
              Inspect the output
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl">
              Every Grow site ships structured for humans and parseable by LLMs. Here's what actually goes on the wire.
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground break-all">
            GET /api/public/v1/specs · 200 OK
          </span>
        </div>

        {/* Tab bar */}
        <div role="tablist" className="flex border-b border-border overflow-x-auto">
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.key)}
                className={`relative px-5 py-3 font-mono text-[11px] uppercase tracking-widest transition-colors whitespace-nowrap cursor-pointer ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="text-accent mr-2">{t.method}</span>
                {t.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-px h-px bg-accent" />
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid lg:grid-cols-3 gap-6">
          {/* Sidebar meta */}
          <aside className="lg:col-span-1 space-y-3 font-mono text-[11px]">
            {tab === "html" && (
              <MetaList
                items={[
                  ["tags", "<main>, <article>, <nav>, <section>"],
                  ["aria", "labelledby, label, current"],
                  ["microdata", "itemscope, itemprop"],
                  ["size", "8.4 KB gzipped"],
                ]}
              />
            )}
            {tab === "schema" && (
              <MetaList
                items={[
                  ["format", "JSON-LD"],
                  ["types", "Product, Organization, FAQPage"],
                  ["validation", "schema.org · passing"],
                  ["size", "1.8 KB"],
                ]}
              />
            )}
            {tab === "performance" && (
              <MetaList
                items={[
                  ["runner", "Lighthouse 12 · mobile"],
                  ["network", "4G throttled"],
                  ["cpu", "4x slowdown"],
                  ["region", "edge · global"],
                ]}
              />
            )}
            {tab === "agent" && (
              <MetaList
                items={[
                  ["spec", "llms.txt v0.2"],
                  ["parse time", "18ms"],
                  ["bytes", "1.2 KB"],
                  ["citations", "ChatGPT, Perplexity, Claude"],
                ]}
              />
            )}
          </aside>

          <div className="lg:col-span-2">
            {tab === "html" && <CodeBlock code={HTML_CODE} lang="html" />}
            {tab === "schema" && <CodeBlock code={SCHEMA_CODE} lang="json" />}
            {tab === "agent" && <CodeBlock code={AGENT_CODE} lang="text" />}
            {tab === "performance" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PERF_METRICS.map((m) => (
                  <div
                    key={m.label}
                    className="rounded-md border border-border bg-card/40 p-5"
                  >
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {m.label}
                    </p>
                    <p className="font-mono text-3xl text-foreground mt-2 tabular-nums">
                      {m.value}
                      <span className="text-base text-muted-foreground ml-0.5">
                        {m.unit}
                      </span>
                    </p>
                    <p className="font-mono text-[10px] uppercase text-accent mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                      good
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetaList({ items }: { items: [string, string][] }) {
  return (
    <ul className="rounded-md border border-border bg-card/40 divide-y divide-border">
      {items.map(([k, v]) => (
        <li key={k} className="flex justify-between gap-3 px-4 py-3">
          <span className="text-muted-foreground uppercase tracking-widest text-[10px]">
            {k}
          </span>
          <span className="text-foreground text-right">{v}</span>
        </li>
      ))}
    </ul>
  );
}
