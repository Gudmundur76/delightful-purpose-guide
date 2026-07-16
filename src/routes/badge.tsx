import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useMemo, useState } from "react";
import { Copy, Check as CheckIcon, ArrowRight } from "lucide-react";
import { ogImageMeta } from "@/lib/seo/og";

export const Route = createFileRoute("/badge")({
  component: BadgePage,
  head: () => ({
    meta: [
      { title: "Agent-Native Badge — Show Your Score | Grow" },
      {
        name: "description",
        content:
          "Embed your Agent Readability Score on your site. A live SVG badge that updates as your site improves. Free for any domain.",
      },
      { property: "og:title", content: "Show your Agent Readability Score" },
      {
        property: "og:description",
        content: "Free embeddable badge that proves your site is built for the agent era.",
      },
      { property: "og:url", content: "https://citation.is/badge" },
      ...ogImageMeta({
        title: "Agent-Native Badge — Show Your Score | Grow",
        kicker: "Grow",
        sub: "Embed your Agent Readability Score on your site. A live SVG badge that updates as your site improves. Free for any domain.",
      }),
    ],
    links: [{ rel: "canonical", href: "https://citation.is/badge" }],
  }),
});

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^a-z0-9.-]/g, "");
}

function BadgePage() {
  const [domain, setDomain] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const id = useMemo(() => slugify(domain) || "your-domain.com", [domain]);
  const badgeUrl = `https://citation.is/badge/${id}.svg`;
  const linkUrl = `https://citation.is/verify/${id}`;

  const snippets = {
    html: `<a href="${linkUrl}" target="_blank" rel="noopener">
  <img src="${badgeUrl}" alt="Agent Readability Score — ${id}" width="240" height="72" />
</a>`,
    markdown: `[![Agent Readability Score](${badgeUrl})](${linkUrl})`,
    script: `<script src="https://citation.is/api/public/widget/embed.js" async></script>
<div data-grow-badge="${id}"></div>`,
    react: `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">
  <img
    src="${badgeUrl}"
    alt="Agent Readability Score"
    width={240}
    height={72}
  />
</a>`,
  };

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-6">
              Free · Embed badge
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter uppercase leading-[0.95] mb-8">
              Prove your site is{" "}
              <span className="text-accent">agent-native</span>.
            </h1>
            <p className="text-xl text-foreground/80 max-w-3xl mb-10">
              A live SVG badge showing your Agent Readability Score. Drop it in your footer,
              README, or docs. Re-checks weekly. Always free.
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <img
                src="/badge/anthropic.com.svg"
                alt="Sample agent-native badge"
                width={240}
                height={72}
                className="border border-border"
              />
              <div className="font-mono text-xs text-muted-foreground max-w-xs">
                ← Live sample. Renders as inline SVG. No tracking, no JS, 1.2 KB.
              </div>
            </div>
          </div>
        </section>

        {/* Generator */}
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Step 1
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase mb-8">
              Enter your domain
            </h2>

            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-10">
              <div className="flex-1 flex items-center gap-2 border border-border bg-card px-4 py-3 font-mono text-sm focus-within:border-accent transition-colors">
                <span className="text-accent">›</span>
                <input
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="your-site.com"
                  className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
                />
              </div>
              <Link
                to="/check"
                className="inline-flex items-center justify-center gap-2 border border-border hover:border-accent hover:text-accent transition-colors font-bold px-5 py-3 uppercase tracking-tighter text-xs"
              >
                Rescan first
              </Link>
            </div>

            <div className="border border-border bg-card p-8 flex flex-col md:flex-row items-center gap-8">
              <img
                src={badgeUrl}
                alt={`Agent Readability Score badge for ${id}`}
                width={240}
                height={72}
                className="shrink-0"
                key={badgeUrl}
              />
              <div className="font-mono text-xs text-muted-foreground break-all">
                <div className="text-foreground mb-1">Live badge URL</div>
                {badgeUrl}
              </div>
            </div>
          </div>
        </section>

        {/* Snippets */}
        <section className="border-b border-border">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-3">
              Step 2
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tighter uppercase mb-10">
              Copy the embed
            </h2>

            <div className="space-y-6">
              <Snippet
                title="HTML"
                description="Drop into any page, footer, or marketing site."
                code={snippets.html}
                onCopy={() => copy("html", snippets.html)}
                copied={copied === "html"}
              />
              <Snippet
                title="Markdown"
                description="Perfect for GitHub READMEs and docs."
                code={snippets.markdown}
                onCopy={() => copy("md", snippets.markdown)}
                copied={copied === "md"}
              />
              <Snippet
                title="Script tag (one-liner)"
                description="Auto-detects the current domain. Drop the script anywhere, add the div where you want the badge."
                code={snippets.script}
                onCopy={() => copy("script", snippets.script)}
                copied={copied === "script"}
              />
              <Snippet
                title="React / JSX"
                description="For Next.js, TanStack, Remix, or any React app."
                code={snippets.react}
                onCopy={() => copy("react", snippets.react)}
                copied={copied === "react"}
              />
            </div>
          </div>
        </section>

        {/* Why */}
        <section className="border-b border-border bg-muted/10">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid md:grid-cols-3 gap-10">
            <Bullet
              title="Compounding social proof"
              body="Every site embedding the badge links back to citation.is with descriptive alt text — the SEO version of a customer logo wall."
            />
            <Bullet
              title="Live, not static"
              body="The badge re-renders on every request. As your score improves, every embed updates automatically."
            />
            <Bullet
              title="No tracking, no JS"
              body="Pure SVG. No cookies, no fingerprinting, no analytics calls. Safe for GDPR-strict sites."
            />
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter uppercase mb-6">
              Want a higher score?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              We rebuild sites agent-native in 48 hours. Same domain, same content, dramatically
              higher readability.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                to="/check"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-6 py-4 uppercase tracking-tighter text-sm"
              >
                Start a brief <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 border border-border hover:border-accent hover:text-accent transition-colors font-bold px-6 py-4 uppercase tracking-tighter text-sm"
              >
                See the leaderboard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Snippet({
  title,
  description,
  code,
  onCopy,
  copied,
}: {
  title: string;
  description: string;
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-accent">{title}</div>
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex items-center gap-2 border border-border hover:border-accent hover:text-accent transition-colors px-3 py-2 font-mono text-[10px] uppercase tracking-widest"
        >
          {copied ? <CheckIcon className="w-3 h-3 text-accent" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-5 py-4 font-mono text-[12px] leading-relaxed text-foreground/85 overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  );
}

function Bullet({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="text-xl font-extrabold tracking-tighter uppercase mb-3">{title}</h3>
      <p className="text-foreground/80 leading-relaxed">{body}</p>
    </div>
  );
}
