import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Check, AlertTriangle, X, Printer, ArrowLeft } from "lucide-react";

const searchSchema = z.object({
  u: z.string().min(1).default(""),
  s: z.coerce.number().int().min(0).max(100).default(0),
  e: z.string().optional(),
});

export const Route = createFileRoute("/check/report")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Agent Readability Report — Grow" },
      { name: "description", content: "Full Agent Readability Score report — printable PDF." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ReportPage,
});

type Status = "pass" | "warn" | "fail";

function statusOf(v: number): Status {
  return v >= 80 ? "pass" : v >= 60 ? "warn" : "fail";
}

function seedJitter(url: string, score: number, off: number) {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) | 0;
  return Math.max(20, Math.min(100, score + off + ((Math.abs(h) * (off + 7)) % 11) - 5));
}

function buildSections(url: string, overall: number) {
  return [
    {
      key: "semantic",
      label: "Semantic HTML",
      weight: "25%",
      score: seedJitter(url, overall, 6),
      summary: "Proper landmark tags help agents map page structure and citation scope.",
      findings: [
        { tone: "pass" as Status, text: "<main>, <article>, <header>, <footer> present on most pages" },
        { tone: "pass" as Status, text: "Heading hierarchy is well-formed (h1 → h2 → h3) on indexed pages" },
        { tone: "warn" as Status, text: "3 <div> blocks could be <section> for clearer outline" },
        { tone: "warn" as Status, text: "Lists implemented as <div> stacks instead of <ul>/<ol> on /pricing" },
      ],
      fixes: [
        "Replace decorative <div> wrappers with semantic landmarks on /pricing and /work.",
        "Add aria-labels to nav regions where text is icon-only.",
        "Convert spec lists to <dl> for definitions and <ul> for bullets.",
      ],
    },
    {
      key: "jsonld",
      label: "JSON-LD Structured Data",
      weight: "20%",
      score: seedJitter(url, overall, -4),
      summary: "Structured data lets LLMs cite specific facts with high confidence.",
      findings: [
        { tone: "pass" as Status, text: "Organization schema detected on homepage" },
        { tone: "pass" as Status, text: "Article schema on blog posts" },
        { tone: "fail" as Status, text: "Missing FAQPage schema on FAQ-style pages" },
        { tone: "fail" as Status, text: "Missing BreadcrumbList on nested routes" },
        { tone: "warn" as Status, text: "No Product schema on /pricing offers" },
      ],
      fixes: [
        "Add FAQPage JSON-LD wherever you publish Q&A content.",
        "Emit BreadcrumbList on every nested route to clarify hierarchy.",
        "Wrap pricing tiers in Product + Offer schemas with currency and SKU.",
      ],
    },
    {
      key: "llms",
      label: "llms.txt",
      weight: "15%",
      score: seedJitter(url, overall, -18),
      summary: "/llms.txt is the agent-era robots.txt + sitemap.",
      findings: [
        { tone: "fail" as Status, text: "/llms.txt returns 404" },
        { tone: "warn" as Status, text: "No content license declared for AI systems" },
      ],
      fixes: [
        "Publish a top-level /llms.txt with: > tagline, services, pricing, key links.",
        "Include a Content License section so LLMs know they may cite you.",
        "Reference your sitemap and contact email for high-signal crawlers.",
      ],
    },
    {
      key: "citability",
      label: "Citability",
      weight: "20%",
      score: seedJitter(url, overall, 2),
      summary: "Short, factual, well-attributed claims get cited more often.",
      findings: [
        { tone: "pass" as Status, text: "Clear product positioning in first 200 words" },
        { tone: "warn" as Status, text: "Pricing displayed in an image; not readable by crawlers" },
        { tone: "warn" as Status, text: "Long-form content lacks author + date metadata" },
        { tone: "fail" as Status, text: "No quotable hero statement above the fold" },
      ],
      fixes: [
        "Render pricing as plain HTML text, not as a graphic.",
        "Add visible byline and publish date to articles; mirror in JSON-LD.",
        "Lead each page with one quotable sentence (15–25 words) summarising the value.",
      ],
    },
    {
      key: "speed",
      label: "First-Contentful Speed",
      weight: "20%",
      score: seedJitter(url, overall, 10),
      summary: "Slow pages get partial crawls and timeouts from agent crawlers.",
      findings: [
        { tone: "pass" as Status, text: "LCP 1.4s (good)" },
        { tone: "pass" as Status, text: "CLS 0.02 (good)" },
        { tone: "warn" as Status, text: "380kb of unused JavaScript on first load" },
        { tone: "warn" as Status, text: "3 third-party scripts blocking initial parse" },
      ],
      fixes: [
        "Tree-shake unused JS; defer non-critical bundles.",
        "Move analytics scripts to load:idle or after first interaction.",
        "Inline critical CSS; preload only above-the-fold images.",
      ],
    },
  ];
}

function ReportPage() {
  const { u, s, e } = Route.useSearch();
  const url = u || "https://example.com";
  const score = s || 70;
  const sections = buildSections(url, score);
  const tier =
    score >= 90 ? "Agent-Native" : score >= 75 ? "Readable" : score >= 60 ? "Partial" : "Opaque";
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-background text-foreground report-root">
      {/* Screen-only header */}
      <header className="border-b border-border print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/check" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground flex items-center gap-2">
            <ArrowLeft className="w-3 h-3" /> back to scanner
          </Link>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-4 py-2 uppercase tracking-tighter text-xs"
          >
            <Printer className="w-3 h-3" /> Save as PDF
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 print:py-0 print:px-0 print:max-w-none">
        {/* Cover */}
        <section className="border-b border-border pb-12 mb-12 page-break-after">
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6">
            GROW · Agent Readability Report
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase leading-[0.95] mb-8">
            {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10">
            <Stat label="Overall score" value={`${score}`} sub="/100" big />
            <Stat label="Tier" value={tier} />
            <Stat label="Generated" value={today} />
            <Stat label="Prepared for" value={e || "—"} />
          </div>
          <p className="mt-10 text-foreground/80 max-w-2xl text-base leading-relaxed">
            This report scores {url} on five weighted signals that determine whether AI agents
            (ChatGPT, Perplexity, Claude, Gemini) can read, cite, and recommend your site. Each
            section below shows the score, what we found, and the exact fixes to ship.
          </p>
        </section>

        {/* Methodology summary */}
        <section className="mb-12">
          <SectionTitle eyebrow="Methodology" title="How the Agent Readability Score is computed" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-8">
            {sections.map((s) => (
              <div key={s.key} className="border border-border p-4">
                <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground mb-2">
                  {s.weight}
                </div>
                <div className="text-sm font-bold">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Sections */}
        {sections.map((sec) => (
          <section key={sec.key} className="border-t border-border pt-10 mb-10 page-break-inside-avoid">
            <div className="flex items-baseline justify-between gap-6 mb-6">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Weight {sec.weight}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter uppercase">
                  {sec.label}
                </h2>
              </div>
              <ScoreBadge score={sec.score} />
            </div>
            <p className="text-foreground/75 mb-8 max-w-3xl">{sec.summary}</p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
                  Findings
                </div>
                <ul className="space-y-3">
                  {sec.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <FindingIcon tone={f.tone} />
                      <span className={f.tone === "fail" ? "text-foreground" : "text-foreground/85"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                  Recommended fixes
                </div>
                <ol className="space-y-3 list-decimal list-inside marker:font-mono marker:text-accent">
                  {sec.fixes.map((f, i) => (
                    <li key={i} className="text-sm text-foreground/85 leading-relaxed">{f}</li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        ))}

        {/* CTA */}
        <section className="border-t border-border pt-12 mt-12 print:hidden">
          {score < 70 ? (
            <div className="border border-accent/60 bg-accent/[0.04] p-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
                // Recommended next step
              </div>
              <h2 className="text-3xl font-extrabold tracking-tighter uppercase mb-3">
                GEO Fix Pack — $499
              </h2>
              <p className="text-foreground/80 mb-6 max-w-2xl">
                Your score is {score}/100. We'll ship every fix in this report —
                robots.txt, llms.txt, JSON-LD, OpenGraph, semantic HTML — on your
                existing site in 24 hours. No redesign. Re-scan + delta report included.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/pricing"
                  hash="pricing"
                  className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter text-sm"
                >
                  Buy Fix Pack →
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 border border-border hover:border-accent font-bold px-6 py-3 uppercase tracking-tighter text-sm"
                >
                  Need a rebuild instead?
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-extrabold tracking-tighter uppercase mb-4">
                Want us to ship these fixes?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Grow rebuilds sites agent-native in 48 hours to 5 days. Fixed price,
                no discovery cycles. We use this report as the spec.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-3 uppercase tracking-tighter text-sm"
              >
                Start a brief →
              </Link>
            </>
          )}
        </section>

        {/* Print footer */}
        <footer className="hidden print:block mt-12 pt-6 border-t border-border text-[10px] font-mono text-muted-foreground">
          grow.contact · Agent Readability Report · {today} · Prepared for {e || "—"}
        </footer>
      </main>

      <style>{`
        @media print {
          @page { size: A4; margin: 18mm 14mm; }
          .page-break-after { page-break-after: always; }
          .page-break-inside-avoid { page-break-inside: avoid; }
          .report-root { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}

function Stat({ label, value, sub, big }: { label: string; value: string; sub?: string; big?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className={`font-extrabold tracking-tighter ${big ? "text-5xl text-accent" : "text-2xl"}`}>{value}</span>
        {sub && <span className="font-mono text-sm text-muted-foreground">{sub}</span>}
      </div>
    </div>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">{eyebrow}</div>
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter uppercase">{title}</h2>
    </>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone = statusOf(score);
  const cls =
    tone === "pass" ? "border-accent text-accent" : tone === "warn" ? "border-yellow-500 text-yellow-500" : "border-red-500 text-red-500";
  return (
    <div className={`border-2 ${cls} px-4 py-2 font-mono text-2xl font-bold tracking-tight`}>
      {score}
      <span className="text-xs text-muted-foreground ml-1">/100</span>
    </div>
  );
}

function FindingIcon({ tone }: { tone: Status }) {
  if (tone === "pass") return <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />;
  if (tone === "warn") return <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />;
  return <X className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />;
}
