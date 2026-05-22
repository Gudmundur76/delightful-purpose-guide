import { useState } from "react";
import { Link } from "@tanstack/react-router";


const LLMS_PREVIEW = `# Grow
> Agent-native web design agency.
## Services
- Launch Page — 48h, fixed price
- Marketing Site — ~5 days
- Devtool Hub — docs + API pages
## Contact
hello@grow.contact`;

const AUDIT_PREVIEW = `$ agent-readability audit https://example.com
[OK]    semantic HTML — 92/100
[WARN]  missing JSON-LD Product schema
[OK]    llms.txt found at root
[FAIL]  OpenGraph image — 1200×630 required
[WARN]  sitemap.xml missing lastmod

Score: 67/100  (needs work)`;

const SCHEMA_DIFF = `{
-  "@type": "WebPage",
-  "name": "Home"
+  "@type": "Product",
+  "name": "Nimbus Agents",
+  "offers": {
+    "@type": "Offer",
+    "price": "49.00",
+    "priceCurrency": "USD"
+  },
+  "aggregateRating": {
+    "@type": "AggregateRating",
+    "ratingValue": "4.8",
+    "reviewCount": "127"
+  }
}`;

const SERVICES = [
  {
    title: "Agent-Native Website Build",
    subtitle: "Custom-coded, LLM-readable",
    body: "Semantic HTML, JSON-LD, llms.txt, OpenGraph, sitemap. Shipped in 48 hours with a fixed price and a written launch date.",
    preview: LLMS_PREVIEW,
    lang: "markdown",
    cta: "View Build Specs →",
    href: "/services",
  },
  {
    title: "Agent Readability Audit",
    subtitle: "Score + fix-list in minutes",
    body: "Run your site through ChatGPT, Perplexity, Claude, and Google AI Overviews. Get a scored report with exact fixes.",
    preview: AUDIT_PREVIEW,
    lang: "bash",
    cta: "Audit Your Site →",
    href: "/check",
  },
  {
    title: "Schema Optimization",
    subtitle: "JSON-LD that agents trust",
    body: "Upgrade generic WebPage markup to Product, Organization, and FAQ schemas that LLM crawlers cite and summarize.",
    preview: SCHEMA_DIFF,
    lang: "diff",
    cta: "See Before / After →",
    href: "/playbook",
  },
];


export function Services() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section className="scroll-mt-20 border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="mb-12">
          <p className="font-mono text-xs uppercase text-accent mb-3 tracking-widest">
            // Services
          </p>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter uppercase">
            What we ship
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <div
              key={s.title}
              className={`rounded-xl border transition-all duration-300 overflow-hidden flex flex-col
                ${hovered === i
                  ? "border-accent shadow-[0_0_0_1px_rgba(34,211,238,0.3)] bg-card/60"
                  : "border-border bg-card/30"
                }`}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Terminal Header */}
              <div className="px-4 py-3 border-b border-border flex items-center gap-2 bg-[#0a0a0a]/80">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                <span className="ml-auto font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {s.lang}
                </span>
              </div>

              {/* Preview */}
              <div className="p-5 bg-[#0a0a0a] overflow-x-auto flex-1">
                {s.lang === "markdown" ? (
                  <div className="font-mono text-[11px] leading-relaxed text-foreground/80 space-y-3">
                    <h4 className="text-base font-extrabold tracking-tight text-foreground">
                      Grow
                    </h4>
                    <p className="text-accent italic border-l-2 border-accent/60 pl-2">
                      Agent-native web design agency.
                    </p>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                        Services
                      </p>
                      <ul className="space-y-1 list-none">
                        <li className="flex gap-2">
                          <span className="text-accent">–</span>
                          <span><span className="text-foreground">Launch Page</span> — 48h, fixed price</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-accent">–</span>
                          <span><span className="text-foreground">Marketing Site</span> — ~5 days</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-accent">–</span>
                          <span><span className="text-foreground">Devtool Hub</span> — docs + API pages</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
                        Contact
                      </p>
                      <a href="mailto:hello@grow.contact" className="text-accent hover:text-foreground transition-colors">
                        hello@grow.contact
                      </a>
                    </div>
                  </div>
                ) : (
                  <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-foreground/80">
                    <code>{s.preview}</code>
                  </pre>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 border-t border-border">
                <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-2">
                  {s.subtitle}
                </p>
                <h3 className="text-xl font-extrabold tracking-tighter uppercase mb-3">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                  {s.body}
                </p>
                <Link
                  to={s.href}
                  className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-accent hover:text-foreground transition-colors group"
                >
                  {s.cta}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
