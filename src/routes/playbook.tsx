import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/playbook")({
  head: () => ({
    meta: [
      { title: "The 12-Week Agent-Native SEO Playbook — Grow" },
      {
        name: "description",
        content:
          "Our 12-week content calendar for AI startups: the exact keywords, post titles, and channel plays we use to earn LLM citations from ChatGPT, Perplexity, and Claude.",
      },
      { property: "og:title", content: "The 12-Week Agent-Native SEO Playbook — Grow" },
      {
        property: "og:description",
        content: "12 weeks of keywords, post titles, and channels for earning LLM citations.",
      },
      { property: "og:url", content: "https://grow.contact/playbook" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/playbook" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "The 12-Week Agent-Native SEO Playbook",
          author: { "@type": "Organization", name: "Grow" },
          publisher: { "@type": "Organization", name: "Grow" },
          datePublished: "2026-05-21",
          description:
            "12-week content calendar for AI startups targeting LLM citation.",
        }),
      },
    ],
  }),
  component: PlaybookPage,
});

type Week = {
  week: number;
  theme: string;
  keyword: string;
  intent: "informational" | "commercial" | "transactional";
  difficulty: "low" | "mid" | "high";
  post: string;
  channel: string;
};

const WEEKS: Week[] = [
  {
    week: 1,
    theme: "Define the category",
    keyword: "what is an agent-native website",
    intent: "informational",
    difficulty: "low",
    post: "What Is an Agent-Native Website? A Definition for 2026",
    channel: "Hacker News Show HN + dev.to crosspost",
  },
  {
    week: 2,
    theme: "Own the file format",
    keyword: "what is an llms.txt file",
    intent: "informational",
    difficulty: "low",
    post: "llms.txt Optimization: The Complete Guide for 2026",
    channel: "r/LocalLLM + Twitter thread",
  },
  {
    week: 3,
    theme: "Tactical how-to",
    keyword: "how to make a website ai-readable",
    intent: "informational",
    difficulty: "mid",
    post: "How to Make a Website AI-Readable: A 2026 Step-by-Step",
    channel: "GitHub repo (template) + README link back",
  },
  {
    week: 4,
    theme: "Schema authority",
    keyword: "best json-ld schema for saas",
    intent: "commercial",
    difficulty: "mid",
    post: "Best JSON-LD Schema for SaaS: Copy-Paste Templates",
    channel: "Indie Hackers + Schema.org community post",
  },
  {
    week: 5,
    theme: "GEO category page",
    keyword: "generative engine optimization",
    intent: "commercial",
    difficulty: "high",
    post: "Generative Engine Optimization (GEO) for AI Startups",
    channel: "AI newsletter syndication (Ben's Bites, TLDR AI)",
  },
  {
    week: 6,
    theme: "Comparison capture",
    keyword: "webflow vs custom code for ai startups",
    intent: "commercial",
    difficulty: "mid",
    post: "/vs/webflow — Webflow vs Grow",
    channel: "Outbound to Webflow-frustrated founders on X",
  },
  {
    week: 7,
    theme: "Persona content",
    keyword: "marketing site for ai startup",
    intent: "commercial",
    difficulty: "mid",
    post: "The Marketing Site Anatomy for AI Startups (Annotated Teardowns)",
    channel: "LinkedIn long-form + side-by-side screenshots",
  },
  {
    week: 8,
    theme: "Tool launch",
    keyword: "agent readability checker",
    intent: "transactional",
    difficulty: "low",
    post: "Launch: Free Agent Readability Checker (/check)",
    channel: "Product Hunt + Hacker News Show HN",
  },
  {
    week: 9,
    theme: "Citation case study",
    keyword: "how to get cited by chatgpt",
    intent: "informational",
    difficulty: "high",
    post: "How We Got Cited by ChatGPT, Perplexity, and Claude in 30 Days",
    channel: "Twitter thread with receipts (screenshots of citations)",
  },
  {
    week: 10,
    theme: "Open-source play",
    keyword: "mcp server template",
    intent: "informational",
    difficulty: "mid",
    post: "Ship a Marketing-Ready MCP Server: A Template",
    channel: "GitHub release + MCP server registry submission",
  },
  {
    week: 11,
    theme: "Pricing transparency",
    keyword: "ai startup website cost",
    intent: "transactional",
    difficulty: "mid",
    post: "What an AI Startup Marketing Site Actually Costs in 2026",
    channel: "Indie Hackers + outbound to seed founders",
  },
  {
    week: 12,
    theme: "Annual report",
    keyword: "state of agent-native web 2026",
    intent: "informational",
    difficulty: "high",
    post: "State of the Agent-Native Web 2026 (with leaderboard data)",
    channel: "Press push: TechCrunch, The Information, Stratechery",
  },
];

const diffColor = (d: Week["difficulty"]) =>
  d === "low" ? "text-accent" : d === "mid" ? "text-yellow-500" : "text-red-500";

const intentColor = (i: Week["intent"]) =>
  i === "informational"
    ? "border-border text-muted-foreground"
    : i === "commercial"
      ? "border-accent/40 text-accent"
      : "border-yellow-500/40 text-yellow-500";

function PlaybookPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Link to="/" className="font-mono text-sm text-accent">
            grow/
          </Link>
          <Link to="/blog" className="font-mono text-xs text-muted-foreground hover:text-foreground">
            ← back to blog
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="mb-14">
          <div className="font-mono text-xs text-accent mb-3">THE PLAYBOOK</div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-6 max-w-3xl">
            The 12-Week Agent-Native SEO Playbook
          </h1>
          <p className="text-muted-foreground max-w-2xl text-lg">
            The exact content calendar we use to earn LLM citations for AI startups. One post a
            week, one channel push, one keyword — sequenced for compounding citation in ChatGPT,
            Perplexity, and Claude.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden mb-12">
          <table className="w-full text-sm">
            <thead className="bg-[#0a0a0a] font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left py-3 px-4 w-12">Wk</th>
                <th className="text-left py-3 px-4">Theme & post</th>
                <th className="text-left py-3 px-4">Keyword</th>
                <th className="text-left py-3 px-4 w-32">Intent</th>
                <th className="text-left py-3 px-4 w-24">Difficulty</th>
                <th className="text-left py-3 px-4">Channel</th>
              </tr>
            </thead>
            <tbody>
              {WEEKS.map((w) => (
                <tr key={w.week} className="border-t border-border align-top">
                  <td className="py-4 px-4 font-mono text-accent">{w.week.toString().padStart(2, "0")}</td>
                  <td className="py-4 px-4">
                    <div className="font-medium">{w.post}</div>
                    <div className="text-xs text-muted-foreground mt-1">{w.theme}</div>
                  </td>
                  <td className="py-4 px-4 font-mono text-xs text-foreground/80">{w.keyword}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-block rounded border px-2 py-0.5 font-mono text-[10px] uppercase ${intentColor(w.intent)}`}>
                      {w.intent}
                    </span>
                  </td>
                  <td className={`py-4 px-4 font-mono text-xs ${diffColor(w.difficulty)}`}>{w.difficulty}</td>
                  <td className="py-4 px-4 text-xs text-muted-foreground">{w.channel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-xs text-accent mb-2">CADENCE</div>
            <p className="text-sm text-muted-foreground">
              One long-form post per week (1,200–2,000 words). One channel push per week. One
              outbound DM batch per fortnight. No more, no less — the constraint is the strategy.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-xs text-accent mb-2">MEASUREMENT</div>
            <p className="text-sm text-muted-foreground">
              Track keyword positions in Google + named-brand mentions in ChatGPT / Perplexity /
              Claude monthly. First unbidden citation in an LLM answer is the milestone, not
              traffic.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="font-mono text-xs text-accent mb-2">COMPOUNDING</div>
            <p className="text-sm text-muted-foreground">
              Week 12's annual report cites all 11 prior posts internally. The link graph is the
              point — LLMs reward sites that anchor their own claims.
            </p>
          </div>
        </section>

        <div className="rounded-xl border border-accent/40 bg-accent/5 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-accent mb-2">WANT THIS RUN FOR YOU?</div>
            <h3 className="text-xl font-semibold mb-1">We ship the site, the schema, and the first 3 posts.</h3>
            <p className="text-muted-foreground text-sm">
              48-hour delivery on the foundation. Then a weekly cadence you can run in-house.
            </p>
          </div>
          <Link
            to="/contact"
            className="rounded-md bg-accent text-accent-foreground font-mono text-sm px-6 py-3 hover:opacity-90 transition whitespace-nowrap"
          >
            Start a project →
          </Link>
        </div>
      </main>
    </div>
  );
}
