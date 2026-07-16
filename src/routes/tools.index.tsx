import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ogImageMeta } from "@/lib/seo/og";
import { ArrowRight, Bot, Compass, FileCode2, Gauge, ScrollText, ShieldCheck, Sparkles } from "lucide-react";

const URL_ = "https://grow.contact/tools";
const TITLE = "Free AI SEO & GEO tools — llms.txt, schema, AI visibility";
const DESC =
  "A free toolkit for getting cited by AI. Generate spec-compliant llms.txt, build JSON-LD schema, check how ChatGPT and Gemini see your site, and scan for crawler access — no signup, no upsell.";

type Tool = {
  href: string;
  title: string;
  blurb: string;
  Icon: typeof Bot;
  status?: "new" | "core";
};

const TOOLS: Tool[] = [
  {
    href: "/tools/geo-explorer",
    title: "GEO Explorer",
    blurb: "The Ubersuggest of getting cited by AI. Domain snapshot, prompt ideas, live AI SERP, and answer-first content brief — all in one page.",
    Icon: Compass,
    status: "new",
  },
  {
    href: "/check",
    title: "AI-readiness scanner",
    blurb: "Score any URL on the five signals AI engines actually read — crawler access, structure, schema, freshness, and protocol discovery.",
    Icon: Gauge,
    status: "core",
  },
  {
    href: "/tools/ai-visibility",
    title: "AI visibility checker",
    blurb: "Ask a real question to Gemini and GPT — see whether your domain shows up in the answer or gets cited. Live, per-engine.",
    Icon: Sparkles,
    status: "new",
  },
  {
    href: "/tools/llms-txt-generator",
    title: "llms.txt generator",
    blurb: "Point us at a domain. We crawl your sitemap and return a spec-compliant llms.txt, grouped by section, ready to paste at the root.",
    Icon: ScrollText,
    status: "new",
  },
  {
    href: "/tools/schema-generator",
    title: "JSON-LD schema generator",
    blurb: "Build Organization, FAQ, and Article schema in a form. Copy the JSON-LD, drop it in your <head>, done.",
    Icon: FileCode2,
    status: "new",
  },
  {
    href: "/tools/robots-checker",
    title: "robots.txt checker for AI",
    blurb: "Paste your robots.txt. See which of the 15+ AI crawlers (OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended…) you're allowing or blocking.",
    Icon: ShieldCheck,
    status: "core",
  },
  {
    href: "/mcp-server",
    title: "MCP server",
    blurb: "Connect grow.contact to ChatGPT, Claude, or Cursor as an authenticated MCP server. Run scans and lookups from your assistant.",
    Icon: Bot,
    status: "core",
  },
];

export const Route = createFileRoute("/tools/")({
  component: ToolsHub,
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
        title: "Free tools for getting cited by AI",
        kicker: "grow.contact / tools",
        sub: "AI-readiness scanner, llms.txt generator, JSON-LD builder, live AI visibility check, robots.txt checker, MCP server. All free.",
      }),
    ],
    links: [{ rel: "canonical", href: URL_ }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Free AI SEO & GEO tools by grow.contact",
          url: URL_,
          numberOfItems: TOOLS.length,
          itemListElement: TOOLS.map((t, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://grow.contact${t.href}`,
            name: t.title,
          })),
        }),
      },
    ],
  }),
});

function ToolsHub() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Free tools</p>
            <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
              A free toolkit for getting cited by AI.
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground text-lg">
              Every tool here runs in your browser or on our servers. No signup, no email wall, no
              upsell. If a competitor charges for it, we probably ship it here for free.
            </p>
            <time className="mt-4 block text-xs text-muted-foreground" dateTime="2026-07-16">
              Updated July 16, 2026
            </time>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(({ href, title, blurb, Icon, status }) => (
              <Link
                key={href}
                to={href}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition hover:border-primary/60"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="rounded-md border border-border p-2">
                      <Icon className="h-4 w-4" aria-hidden />
                    </div>
                    {status === "new" && (
                      <span className="text-[10px] uppercase tracking-widest text-primary">New</span>
                    )}
                  </div>
                  <h2 className="mt-4 text-lg font-semibold group-hover:text-primary transition-colors">
                    {title}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{blurb}</p>
                </div>
                <div className="mt-5 inline-flex items-center gap-1 text-sm text-primary">
                  Open tool <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
