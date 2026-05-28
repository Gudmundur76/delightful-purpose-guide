import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CRAWLERS } from "@/lib/crawlers/data";
import { useMemo, useState } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Copy } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

const URL_ = "https://grow.contact/tools/robots-checker";
const TITLE = "robots.txt Checker for AI Crawlers — Free Tool";
const DESC =
  "Paste your robots.txt — get back which AI engines can cite you. Checks ChatGPT, Perplexity, Claude, Google AI Overviews, Bing Copilot, and Meta AI. No signup.";

const SAMPLE = `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /\n\nSitemap: https://example.com/sitemap.xml\n`;

export const Route = createFileRoute("/tools/robots-checker")({
  component: RobotsChecker,
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
        title: "robots.txt Checker for AI Crawlers — Free Tool",
        kicker: "Grow",
        sub: "Paste your robots.txt — get back which AI engines can cite you. Checks ChatGPT, Perplexity, Claude, Google AI Overviews, Bing Copilot, and Meta AI. No signup.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "@id": URL_,
          name: "robots.txt Checker for AI Crawlers",
          description: DESC,
          url: URL_,
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Any (web)",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
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
              name: "Does blocking GPTBot stop ChatGPT from citing my site?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "No. GPTBot is OpenAI's training-data crawler. ChatGPT Search uses OAI-SearchBot — a separate user-agent. Blocking GPTBot has zero effect on ChatGPT citations. Blocking OAI-SearchBot silently kills them.",
              },
            },
            {
              "@type": "Question",
              name: "Which AI bots should I allow?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Allow OAI-SearchBot (ChatGPT), ChatGPT-User (user fetches), PerplexityBot, Perplexity-User, ClaudeBot, Claude-SearchBot, Googlebot (AI Overviews), bingbot (Copilot), and FacebookBot (Meta AI). These are the citation-side bots.",
              },
            },
          ],
        }),
      },
    ],
  }),
});

interface Rule {
  agent: string; // lowercased token
  allow: boolean; // final verdict — true = can crawl /
}

function parseRobots(txt: string): Rule[] {
  const rules: Rule[] = [];
  let currentAgents: string[] = [];
  let buffer: { agents: string[]; disallowRoot: boolean } | null = null;

  const flush = () => {
    if (!buffer) return;
    for (const a of buffer.agents) {
      rules.push({ agent: a, allow: !buffer.disallowRoot });
    }
  };

  const lines = txt.split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.replace(/#.*$/, "").trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.+)$/);
    if (!m) continue;
    const key = m[1].toLowerCase();
    const val = m[2].trim();
    if (key === "user-agent") {
      if (buffer && buffer.agents.length && buffer.disallowRoot !== undefined && currentAgents.length === 0) {
        flush();
        buffer = null;
      }
      currentAgents.push(val.toLowerCase());
      if (!buffer) buffer = { agents: currentAgents, disallowRoot: false };
      else buffer.agents = currentAgents;
    } else if (key === "disallow") {
      if (!buffer) buffer = { agents: currentAgents, disallowRoot: false };
      if (val === "/" || val === "*") buffer.disallowRoot = true;
      currentAgents = [];
    } else if (key === "allow") {
      if (!buffer) buffer = { agents: currentAgents, disallowRoot: false };
      // Explicit Allow: / overrides
      if (val === "/") buffer.disallowRoot = false;
      currentAgents = [];
    } else {
      // Sitemap, Crawl-delay etc — terminator for current block
      currentAgents = [];
    }
  }
  flush();
  return rules;
}

function verdictFor(bot: string, rules: Rule[]): "allow" | "block" | "default" {
  const b = bot.toLowerCase();
  const direct = rules.find((r) => r.agent === b);
  if (direct) return direct.allow ? "allow" : "block";
  const wildcard = rules.find((r) => r.agent === "*");
  if (wildcard) return wildcard.allow ? "default" : "block";
  return "allow"; // no rules = allow
}

function RobotsChecker() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);

  const rules = useMemo(() => parseRobots(input || SAMPLE), [input]);
  const isPlaceholder = !input.trim();

  const citationBots = CRAWLERS.filter((c) => c.purpose === "search" || c.purpose === "user-fetch" || c.purpose === "hybrid");
  const trainingBots = CRAWLERS.filter((c) => c.purpose === "training");

  const blockedCitation = citationBots.filter((c) => verdictFor(c.robotsToken, rules) === "block");
  const blockedTraining = trainingBots.filter((c) => verdictFor(c.robotsToken, rules) === "block");

  const recommended = `# AI citations: allow search + user-fetch bots
${citationBots.map((c) => `User-agent: ${c.robotsToken}\nAllow: /\n`).join("\n")}
# Training opt-out (does NOT affect citations)
${trainingBots.map((c) => `User-agent: ${c.robotsToken}\nDisallow: /\n`).join("\n")}
# Default policy
User-agent: *
Allow: /

Sitemap: https://yourdomain.com/sitemap.xml
`;

  const copyRecommended = async () => {
    await navigator.clipboard.writeText(recommended);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <header className="border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              // Free tool
            </p>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">
              Is your robots.txt killing AI citations?
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Paste your robots.txt. We'll tell you which AI engines can cite
              you — and which you've silently blocked. The #1 mistake: blocking{" "}
              <code className="text-foreground">GPTBot</code> thinking it stops
              ChatGPT (it doesn't — that's{" "}
              <code className="text-foreground">OAI-SearchBot</code>).
            </p>
          </div>
        </header>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-2 gap-8">
          <div>
            <label className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3 block">
              // Your robots.txt
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={SAMPLE}
              spellCheck={false}
              className="w-full h-80 bg-card border border-border p-4 font-mono text-xs leading-relaxed text-foreground resize-y focus:outline-none focus:border-accent"
            />
            {isPlaceholder && (
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                // Showing sample analysis. Paste yours to run live.
              </p>
            )}
          </div>

          <div className="space-y-6">
            <div className="border border-border p-5">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
                // Verdict
              </h2>
              {blockedCitation.length === 0 ? (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-emerald-400">All citation bots allowed</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Every AI engine that issues citations can reach your
                      site.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-destructive">
                      Blocking {blockedCitation.length} citation bot
                      {blockedCitation.length === 1 ? "" : "s"}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI engines that can't cite you:{" "}
                      <strong className="text-foreground">
                        {blockedCitation.map((b) => b.name).join(", ")}
                      </strong>
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="border border-border">
              <div className="border-b border-border p-4">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  // Citation bots
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {citationBots.map((c) => {
                  const v = verdictFor(c.robotsToken, rules);
                  return (
                    <li key={c.slug} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold truncate">{c.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate">{c.powers}</div>
                      </div>
                      {v === "block" ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-destructive shrink-0 inline-flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Blocked
                        </span>
                      ) : v === "allow" ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 shrink-0 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Allowed
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                          Default
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border border-border">
              <div className="border-b border-border p-4 flex items-center justify-between">
                <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
                  // Training-only bots
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {blockedTraining.length}/{trainingBots.length} blocked
                </span>
              </div>
              <ul className="divide-y divide-border">
                {trainingBots.map((c) => {
                  const v = verdictFor(c.robotsToken, rules);
                  return (
                    <li key={c.slug} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-bold truncate">{c.name}</div>
                        <div className="font-mono text-[10px] text-muted-foreground truncate">{c.operator}</div>
                      </div>
                      {v === "block" ? (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground shrink-0">
                          Opted out
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground shrink-0">
                          Allowed
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-border bg-muted/20 px-4 py-3 inline-flex items-start gap-2">
                <AlertTriangle className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" />
                <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                  Blocking training bots is an opt-out from model training. It
                  does <strong className="text-foreground">not</strong> affect
                  citations from any AI engine.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
                // Recommended robots.txt
              </h2>
              <button
                type="button"
                onClick={copyRecommended}
                className="inline-flex items-center gap-2 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest px-3 py-1.5"
              >
                <Copy className="w-3 h-3" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="bg-card border border-border p-4 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
              {recommended}
            </pre>
            <p className="font-mono text-[10px] text-muted-foreground mt-3">
              // Allows every citation bot. Blocks every training bot. Replace{" "}
              <code className="text-foreground">yourdomain.com</code> with
              yours.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
