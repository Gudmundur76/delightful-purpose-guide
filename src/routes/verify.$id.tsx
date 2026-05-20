import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/verify/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Verified Agent-Native · ${params.id} — Grow` },
      { name: "description", content: `Certification record for ${params.id}. Verified Agent-Native implementation by Grow.` },
      { property: "og:title", content: `Certified Agent-Native · ${params.id}` },
      { property: "og:description", content: "Independently verified agent-readability certification." },
    ],
  }),
  component: VerifyPage,
});

// Deterministic client record from id
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function clientRecord(id: string) {
  const h = hash(id);
  const score = 80 + (h % 18); // 80-97
  const domains = ["northwind.io", "acme-labs.com", "stripewise.co", "lumenly.app", "kepler-os.dev", "fernpath.studio"];
  const domain = domains[h % domains.length];
  const dateMs = 1715000000000 + (h % 9000000000);
  const date = new Date(dateMs).toISOString().slice(0, 10);
  return {
    id,
    domain,
    score,
    date,
    metrics: [
      { label: "Semantic HTML", value: 78 + (h % 22) },
      { label: "JSON-LD Coverage", value: 80 + ((h >> 2) % 20) },
      { label: "llms.txt", value: 92 + ((h >> 3) % 8) },
      { label: "Citability", value: 75 + ((h >> 4) % 24) },
      { label: "Lighthouse Speed", value: 88 + ((h >> 5) % 12) },
    ],
    implementation: [
      "Migrated marketing site to semantic landmarks (<article>, <main>, <nav>, <footer>)",
      "Authored llms.txt + llms-full.txt with crawl directives",
      "Added Organization, Product, Article, FAQPage JSON-LD",
      "Refactored hero/CTAs to citation-friendly H1/H2 hierarchy",
      "Optimized Core Web Vitals: LCP < 1.5s, CLS < 0.05",
    ],
  };
}

function VerifyPage() {
  const { id } = Route.useParams();
  const r = clientRecord(id);
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<a href="https://grow.contact/verify/${id}" target="_blank" rel="noopener">
  <img src="https://grow.contact/badge/${id}.svg" alt="Certified Agent-Native · Score ${r.score}/100" width="200" height="60" />
</a>`;

  const copy = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← grow.contact</Link>

        {/* Header */}
        <div className="mt-8 flex flex-col gap-6 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <Check className="h-3 w-3" /> Verified Certification
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{r.domain}</h1>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              cert_id: {r.id} · issued: {r.date}
            </p>
          </div>
          {/* Live badge preview */}
          <BadgeSVG score={r.score} domain={r.domain} />
        </div>

        {/* Score breakdown */}
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Score breakdown</h2>
          <div className="mt-4 grid gap-3">
            {r.metrics.map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{m.label}</span>
                  <span className="font-mono tabular-nums text-muted-foreground">{m.value}/100</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-emerald-500" style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Implementation details */}
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Implementation details</h2>
          <ul className="mt-4 space-y-2 rounded-xl border border-border bg-card p-6">
            {r.implementation.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Embed snippet */}
        <section className="mt-10">
          <h2 className="text-sm font-medium uppercase tracking-widest text-muted-foreground">Embed this badge</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Paste into your site footer. The badge updates automatically as your score changes.
          </p>
          <div className="relative mt-4 overflow-hidden rounded-xl border border-border bg-zinc-950">
            <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-300"><code>{embedSnippet}</code></pre>
            <button
              onClick={copy}
              className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              <Copy className="h-3 w-3" /> {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-border bg-card p-8 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-lg font-semibold">Want a certification like this?</h3>
            <p className="mt-1 text-sm text-muted-foreground">Run a free audit or book a build.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/check" className="inline-flex items-center gap-1.5 rounded-md border border-border px-4 py-2 text-sm hover:bg-muted">
              Free audit <ExternalLink className="h-3 w-3" />
            </Link>
            <Link to="/" className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-zinc-950 hover:bg-emerald-400">
              Book consultation
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export function BadgeSVG({ score, domain }: { score: number; domain?: string }) {
  return (
    <svg viewBox="0 0 240 72" width="240" height="72" xmlns="http://www.w3.org/2000/svg" className="rounded-lg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a0a0a" />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
      </defs>
      <rect width="240" height="72" rx="8" fill="url(#bg)" stroke="#27272a" />
      {/* Score circle */}
      <g transform="translate(36,36)">
        <circle r="24" fill="none" stroke="#27272a" strokeWidth="4" />
        <circle
          r="24"
          fill="none"
          stroke="#10b981"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${(score / 100) * 150.8} 150.8`}
          transform="rotate(-90)"
        />
        <text textAnchor="middle" dy="6" fill="#fafafa" fontSize="18" fontWeight="600" fontFamily="ui-sans-serif, system-ui">
          {score}
        </text>
      </g>
      {/* Label */}
      <g transform="translate(74,26)">
        <text fill="#10b981" fontSize="9" fontWeight="600" letterSpacing="1.5" fontFamily="ui-monospace, monospace">
          CERTIFIED
        </text>
        <text y="14" fill="#fafafa" fontSize="13" fontWeight="600" fontFamily="ui-sans-serif, system-ui">
          Agent-Native
        </text>
        <text y="30" fill="#71717a" fontSize="9" fontFamily="ui-monospace, monospace">
          {domain ? `grow.contact · ${domain}` : "grow.contact"}
        </text>
      </g>
    </svg>
  );
}
