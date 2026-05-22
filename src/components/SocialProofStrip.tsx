import { Link } from "@tanstack/react-router";

const BADGES = [
  { id: "anthropic", domain: "anthropic.com" },
  { id: "perplexity", domain: "perplexity.ai" },
  { id: "cursor", domain: "cursor.sh" },
  { id: "linear", domain: "linear.app" },
  { id: "vercel", domain: "vercel.com" },
  { id: "supabase", domain: "supabase.com" },
];

export function SocialProofStrip() {
  return (
    <section className="border-t border-border bg-card/30">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
          <div>
            <p className="font-mono text-accent text-xs mb-3 uppercase tracking-[0.2em]">
              // Optimized for these AI engines
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter uppercase">
              Built to be cited by the agent web
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-xl">
              The badges below are the AI search engines and crawlers our sites
              are optimized for — not customer logos. Every Grow build is tuned
              so ChatGPT (OAI-SearchBot), Perplexity, Claude, Google AI
              Overviews, Bing/Copilot, and Meta AI can read, parse, and cite
              your pages. The Agent Readability badge links to a live,
              re-scored verdict.
            </p>
          </div>
          <Link
            to="/badge"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            Get your badge →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {BADGES.map((b) => (
            <a
              key={b.id}
              href={`/badge/${b.id}.svg`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block border border-border bg-background p-2 hover:border-accent transition-colors"
              aria-label={`Agent readability badge for ${b.domain}`}
            >
              <img
                src={`/badge/${b.id}.svg`}
                alt={`${b.domain} agent readability badge`}
                width={240}
                height={72}
                loading="lazy"
                className="w-full h-auto block"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
