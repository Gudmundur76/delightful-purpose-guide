import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { computeHeadlineStats } from "@/lib/leaderboard/stats";

const PAGE_URL = "https://grow.contact/report/press";

export const Route = createFileRoute("/report/press")({
  component: PressPage,
  loader: () => ({ stats: computeHeadlineStats() }),
  head: () => ({
    meta: [
      { title: "Press Kit — State of the Agent-Readable Web | Grow" },
      { name: "description", content: "Press kit for the grow.contact quarterly agent-readability report. Pull quotes, downloadable charts, logo pack, author bio, and direct media contact." },
      { property: "og:title", content: "Press Kit — State of the Agent-Readable Web" },
      { property: "og:description", content: "Pull quotes, charts, logo pack, and media contact for the grow.contact agent-readability research." },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
});

function PressPage() {
  const { stats } = Route.useLoaderData();

  const quotes = [
    `${stats.missing_llms_txt_pct}% of the top ${stats.total} AI companies still ship no usable llms.txt — the cheapest GEO win on the agent-native web.`,
    `${stats.opaque_pct}% of AI companies score below the threshold AI engines will cite by name.`,
    `Only ${stats.agent_native_pct}% of AI companies clear the agent-native bar — meaning the rest are effectively invisible to ChatGPT, Perplexity, and Claude.`,
    `When the AI industry's own marketing sites can't be cited by AI, the upside for the first competitor to fix it is asymmetric.`,
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <nav className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/report/q2-2026" className="hover:text-foreground">Report</Link>
          <span className="mx-2">/</span>
          <span className="text-accent">Press</span>
        </nav>

        <header className="mb-10 pb-6 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">// Press Kit</p>
          <h1 className="text-4xl font-bold mb-4">Press kit</h1>
          <p className="text-lg text-muted-foreground">
            Everything needed to cite the State of the Agent-Readable Web report.
            All assets and figures are CC BY 4.0 — use freely with attribution
            to grow.contact.
          </p>
        </header>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Media contact</h2>
          <div className="border border-border bg-card p-5 font-mono text-sm space-y-2">
            <p><span className="text-muted-foreground">Author:</span> Gudmundur Eyberg Kristjansson</p>
            <p><span className="text-muted-foreground">Email:</span> <a href="mailto:hello@grow.contact" className="text-accent hover:underline">hello@grow.contact</a></p>
            <p><span className="text-muted-foreground">Response time:</span> within 24 hours, weekdays</p>
            <p><span className="text-muted-foreground">Topics:</span> GEO, agent-native web, AI citation rates, llms.txt, AI crawlers</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Pull quotes</h2>
          <ul className="space-y-3">
            {quotes.map((q, i) => (
              <li key={i} className="border-l-2 border-accent pl-4 py-2 italic select-all">
                "{q}"
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">Attribution: grow.contact, State of the Agent-Readable Web Q2 2026 (CC BY 4.0).</p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Headline statistics</h2>
          <div className="border border-border bg-card divide-y divide-border">
            {stats.citable_headlines.map((line: string, i: number) => (
              <p key={i} className="p-4 text-sm select-all">{line}</p>
            ))}
          </div>


          <p className="mt-3 text-xs text-muted-foreground">
            All figures derive from the open dataset at <a href="/api/public/leaderboard.json" className="text-accent hover:underline">/api/public/leaderboard.json</a>.
            Re-verify any number by re-scoring its source row at <Link to="/check" className="text-accent hover:underline">/check</Link>.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Author bio</h2>
          <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
            <p><strong className="text-foreground">Short (50 words):</strong> Gudmundur Eyberg Kristjansson is the founder of grow.contact, an agent-native web agency that builds fixed-price, 48-hour marketing sites engineered for AI citation. The quarterly State of the Agent-Readable Web report is the firm's primary research output, drawing on an open dataset of {stats.total} AI companies.</p>
            <p><strong className="text-foreground">Long (120 words):</strong> Gudmundur Eyberg Kristjansson runs grow.contact, the GEO and agent-native web agency that built and maintains the open Agent Readability Leaderboard — currently scoring {stats.total} AI-industry companies across five signals (Semantic HTML, JSON-LD, llms.txt, Citability, Page Speed). The firm publishes a quarterly report and monthly data drops on AI-citation readiness, all under CC BY 4.0. Prior work covers fixed-price launch builds for AI startups (Tier 01 $2,400 / 48h, Tier 02 $4,800 / 5d), the free <code>/check</code> scanner, and an open-source CLI for CI-integrated agent-readability scoring. Based in Iceland; clients across the US and EU.</p>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Downloadable assets</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="/api/public/leaderboard.json" className="text-accent hover:underline">Full dataset (JSON, CC BY 4.0)</a>
              <span className="text-muted-foreground"> — {stats.total} rows, five signal scores per row.</span>
            </li>
            <li>
              <Link to="/report/q2-2026" className="text-accent hover:underline">Q2 2026 report (web)</Link>
              <span className="text-muted-foreground"> — canonical citation URL.</span>
            </li>
            <li>
              <Link to="/report/methodology" className="text-accent hover:underline">Methodology</Link>
              <span className="text-muted-foreground"> — scoring formula, weights, limitations.</span>
            </li>
            <li>
              <Link to="/data-drops" className="text-accent hover:underline">Data drops feed</Link>
              <span className="text-muted-foreground"> — monthly single-stat findings.</span>
            </li>
            <li>
              <a href="/rss.xml" className="text-accent hover:underline">RSS feed</a>
              <span className="text-muted-foreground"> — drops + reports as they publish.</span>
            </li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4">Suggested topics for interviews</h2>
          <ul className="list-disc list-inside space-y-1 text-foreground">
            <li>Why {stats.opaque_pct}% of the AI industry's own marketing sites can't be cited by AI engines</li>
            <li>The OAI-SearchBot vs GPTBot confusion that silently kills ChatGPT citations</li>
            <li>llms.txt: the cheapest GEO win and why most companies skip it</li>
            <li>What changes when AI engines become the primary source of inbound traffic</li>
            <li>How AI engines decide which competitor to cite when both rank similarly</li>
          </ul>
        </section>

        <footer className="pt-8 border-t border-border text-sm text-muted-foreground">
          <p>
            Press inquiries: <a href="mailto:hello@grow.contact" className="text-accent hover:underline">hello@grow.contact</a>.
            All figures sourced from the open dataset, CC BY 4.0.
          </p>
        </footer>
      </main>
      <SiteFooter />
    </div>
  );
}
