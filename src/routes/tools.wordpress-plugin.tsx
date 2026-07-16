import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { Download, Github, Sparkles, Bot } from "lucide-react";

const URL_ = "https://citation.is/tools/wordpress-plugin";
const TITLE = "Free WordPress plugins for AI citations — citation.is";
const DESC =
  "Two free, open-source WordPress plugins. grow-auto-fix injects JSON-LD, /llms.txt and AI robots.txt directives. grow-mcp turns your WordPress site into a Model Context Protocol server for ChatGPT, Claude, and Perplexity.";

const PLUGINS = [
  {
    slug: "grow-auto-fix",
    name: "citation.is Auto-Fix",
    version: "1.0.0",
    Icon: Sparkles,
    blurb:
      "Injects approved Schema.org JSON-LD, serves a virtual /llms.txt, and patches robots.txt with AI crawler directives — pulled every 6 hours from your citation.is dashboard.",
    features: [
      "FAQ / Product / Organization JSON-LD auto-injected into <head>",
      "Virtual /llms.txt served at your site root",
      "robots.txt patched with GPTBot, ClaudeBot, PerplexityBot, Google-Extended rules",
      "6-hour refresh + manual refresh button",
    ],
  },
  {
    slug: "grow-mcp",
    name: "citation.is MCP Server",
    version: "1.0.0",
    Icon: Bot,
    blurb:
      "Turns your WordPress site into a Model Context Protocol (MCP) server. ChatGPT, Claude, Perplexity, Cursor, and custom agents can query posts, pages, FAQs, WooCommerce products, and submit leads via JSON-RPC.",
    features: [
      "6 core tools: search_posts, get_post, list_pages, list_faqs, site_info, submit_lead",
      "WooCommerce support: list_products when active",
      "Bearer token auth for writes; optional anonymous read",
      "Discovery at /.well-known/mcp.json",
    ],
  },
];

export const Route = createFileRoute("/tools/wordpress-plugin")({
  component: WordpressPluginPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL_ },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
      ...ogImageMeta({
        title: "Free WordPress plugins for AI citations",
        kicker: "citation.is / tools",
        sub: "grow-auto-fix + grow-mcp. Open source. No signup.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "citation.is WordPress plugins",
          applicationCategory: "WordPressPlugin",
          operatingSystem: "WordPress 5.8+",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          url: URL_,
          downloadUrl: "https://citation.is/api/public/wordpress-plugin/bundle.zip",
        }),
      },
    ],
  }),
});

function WordpressPluginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-5xl px-6 py-16">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free & open source</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              WordPress plugins for the agent-web
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
              Two plugins, GPL-licensed, no signup. Install straight from your WordPress admin and
              your site starts speaking the languages AI agents actually read — Schema.org JSON-LD,
              /llms.txt, robots.txt directives, and the Model Context Protocol.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/api/public/wordpress-plugin/bundle.zip"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                <Download className="h-4 w-4" aria-hidden /> Download bundle (both plugins)
              </a>
              <a
                href="https://github.com/growcontact"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium hover:border-primary/60"
              >
                <Github className="h-4 w-4" aria-hidden /> Source on GitHub
              </a>
            </div>
            <time className="mt-4 block text-xs text-muted-foreground" dateTime="2026-07-16">
              Updated July 16, 2026 · v1.0.0 · License: GPL-2.0-or-later
            </time>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12 grid gap-6 md:grid-cols-2">
          {PLUGINS.map(({ slug, name, version, Icon, blurb, features }) => (
            <article key={slug} className="rounded-xl border border-border bg-card p-6 flex flex-col">
              <div className="flex items-center gap-3">
                <div className="rounded-md border border-border p-2">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">{name}</h2>
                  <p className="text-xs text-muted-foreground">v{version} · <code>{slug}</code></p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{blurb}</p>
              <ul className="mt-4 space-y-1.5 text-sm">
                {features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span className="text-primary" aria-hidden>·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`/api/public/wordpress-plugin/${slug}.zip`}
                className="mt-6 inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm font-medium hover:border-primary/60 self-start"
              >
                <Download className="h-4 w-4" aria-hidden /> Download {slug}.zip
              </a>
            </article>
          ))}
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-2xl font-semibold tracking-tight">Install in 60 seconds</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground list-decimal pl-5">
            <li>Download the zip above.</li>
            <li>In WordPress admin, go to <strong>Plugins → Add New → Upload Plugin</strong>.</li>
            <li>Choose the zip, click <strong>Install Now</strong>, then <strong>Activate</strong>.</li>
            <li>
              For <code>grow-auto-fix</code>: open <strong>Settings → citation.is</strong> and paste your
              install token (get one free by scanning your site at <a className="text-primary underline" href="/check">/check</a>).
              Works without a token too — it just won't pull remote fixes.
            </li>
            <li>
              For <code>grow-mcp</code>: open <strong>Settings → citation.is MCP</strong>, generate a bearer token,
              and point any MCP client at <code>/wp-json/grow-mcp/v1/mcp</code>.
            </li>
          </ol>

          <h2 className="mt-12 text-2xl font-semibold tracking-tight">License & source</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Both plugins are released under GPL-2.0-or-later, the same license as WordPress itself. Full source
            for each plugin lives at <code>wp-plugin/grow-auto-fix/</code> and <code>wp-plugin/grow-mcp/</code>
            in the citation.is repository — fork it, audit it, ship your own build.
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
