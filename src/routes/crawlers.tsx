import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CRAWLERS, getCrawlersByPurpose } from "@/lib/crawlers/data";
import { ArrowRight, Check, X, AlertTriangle } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

const URL = "https://grow.contact/crawlers";
const TITLE = "AI Crawler Reference — OAI-SearchBot, PerplexityBot, ClaudeBot & More";
const DESC =
  "Per-bot reference for every major AI crawler: user-agents, what they power, robots.txt recommendations, and whether blocking them affects AI citations.";

export const Route = createFileRoute("/crawlers")({
  component: CrawlersIndex,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...ogImageMeta({
        title: "AI Crawler Reference — OAI-SearchBot, PerplexityBot, ClaudeBot & More",
        kicker: "Grow",
        sub: "Per-bot reference for every major AI crawler: user-agents, what they power, robots.txt recommendations, and whether blocking them affects AI citations.",
      }),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": URL,
          name: "AI Crawler Reference",
          description: DESC,
          url: URL,
          numberOfItems: CRAWLERS.length,
          itemListElement: CRAWLERS.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://grow.contact/crawlers/${c.slug}`,
            name: c.name,
          })),
        }),
      },
    ],
  }),
});

const PURPOSE_LABELS: Record<string, string> = {
  search: "Search / Citation Bots",
  "user-fetch": "User-Initiated Fetch Bots",
  hybrid: "Hybrid (Search + General Fetch)",
  training: "Training-Only Bots",
};

const PURPOSE_INTRO: Record<string, string> = {
  search:
    "Allow these. They decide whether your site can appear in AI answer citations.",
  "user-fetch":
    "Allow these. They fire when a user pastes your URL into an AI chat — blocking creates visible UX failures.",
  hybrid:
    "Allow. These serve both live citations and tool-use fetches.",
  training:
    "Block these only if you opt out of model training. Blocking does NOT affect citations from the same vendor.",
};

const PURPOSE_ORDER: Array<keyof ReturnType<typeof getCrawlersByPurpose>> = [
  "search",
  "user-fetch",
  "hybrid",
  "training",
];

function CrawlersIndex() {
  const grouped = getCrawlersByPurpose();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <header className="border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              // Reference
            </p>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tighter uppercase mb-6">
              AI Crawler Reference
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">
              The {CRAWLERS.length} crawlers that decide whether ChatGPT,
              Perplexity, Claude, Google AI Overviews, and Microsoft Copilot
              cite your site. User-agents, recommendations, and the one
              critical distinction most sites get wrong: training bots are
              not citation bots.
            </p>
            <div className="border border-accent/40 bg-accent/5 p-4 text-sm flex gap-3">
              <AlertTriangle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <p className="text-muted-foreground">
                <span className="text-foreground font-bold">
                  Most-misconfigured bot:
                </span>{" "}
                GPTBot. Blocking it does <em>not</em> remove you from
                ChatGPT citations — those come from OAI-SearchBot, a
                separate user-agent.
              </p>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 space-y-16">
          {PURPOSE_ORDER.map((purpose) => {
            const list = grouped[purpose];
            if (!list || list.length === 0) return null;
            return (
              <section key={purpose}>
                <h2 className="font-mono text-xs uppercase tracking-widest text-accent mb-2 border-b border-border pb-3">
                  // {PURPOSE_LABELS[purpose]}
                </h2>
                <p className="text-sm text-muted-foreground mb-6 mt-3">
                  {PURPOSE_INTRO[purpose]}
                </p>
                <ul className="divide-y divide-border border-y border-border">
                  {list.map((c) => (
                    <li key={c.slug}>
                      <Link
                        to="/crawlers/$bot"
                        params={{ bot: c.slug }}
                        className="group grid sm:grid-cols-[200px_1fr_auto] gap-3 sm:gap-6 items-baseline py-5 hover:bg-muted/30 -mx-3 px-3 transition-colors"
                      >
                        <span>
                          <span className="font-bold text-lg tracking-tight group-hover:text-accent transition-colors block">
                            {c.name}
                          </span>
                          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {c.operator}
                          </span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {c.short}
                        </span>
                        <span className="shrink-0">
                          <RecommendationBadge rec={c.recommendation} />
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        <section className="border-t border-border bg-muted/20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="text-2xl font-extrabold tracking-tighter uppercase mb-4">
              Check your robots.txt
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
              Run /check on any URL and we'll flag bots you're accidentally
              blocking — the #1 reason sites are silently missing from AI
              citations.
            </p>
            <Link
              to="/check"
              className="inline-flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 uppercase tracking-tighter text-sm"
            >
              Run a free scan <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function RecommendationBadge({ rec }: { rec: string }) {
  if (rec === "allow") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1">
        <Check className="w-3 h-3" /> Allow
      </span>
    );
  }
  if (rec === "block-for-opt-out") {
    return (
      <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-yellow-400 border border-yellow-500/30 bg-yellow-500/10 px-2 py-1">
        <AlertTriangle className="w-3 h-3" /> Opt-out only
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-red-400 border border-red-500/30 bg-red-500/10 px-2 py-1">
      <X className="w-3 h-3" /> Optional block
    </span>
  );
}
