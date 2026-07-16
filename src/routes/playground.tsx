import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ToolCatalog } from "@/components/playground/ToolCatalog";
import { ScanRunner } from "@/components/playground/ScanRunner";
import { McpRunner } from "@/components/playground/McpRunner";
import { InstallSnippets } from "@/components/playground/InstallSnippets";
import { TOOLS } from "@/lib/playground/catalog";
import { ogImageMeta } from "@/lib/seo/og";

const TITLE = "AEO Tool & LLM SEO Checker — citation.is Playground";
const DESC =
  "Free AEO tool and LLM SEO checker: scan any URL for ChatGPT, Perplexity, Claude, and Google AI Overviews readiness. Run 90+ MCP tools in the browser — validate JSON-LD, llms.txt, semantic HTML, and edge caching.";
const URL = "https://citation.is/playground";

export const Route = createFileRoute("/playground")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      ...ogImageMeta({
        title: "AEO Tool & LLM SEO Checker",
        kicker: "Grow Playground",
        sub: "Scan any URL for ChatGPT, Perplexity, Claude, and Google AI Overviews readiness. 90+ MCP tools in the browser.",
      }),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "citation.is MCP Playground",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Web",
          description: DESC,
          url: URL,
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          featureList: [
            "90+ MCP tools",
            "OAuth + Bearer auth",
            "Streamable HTTP transport",
            "Public REST + JSON-RPC endpoints",
            "Discoverable via /.well-known/mcp.json",
          ],
        }),
      },
    ],
  }),
  component: PlaygroundPage,
});

function PlaygroundPage() {
  const safeCount = TOOLS.filter((t) => t.publicSafe).length;
  return (
    <>
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-gradient-to-b from-background to-background/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              /playground · grow-contact-mcp v2.0.0
            </div>
            <h1 className="font-extrabold uppercase tracking-tighter text-4xl sm:text-6xl lg:text-7xl leading-[0.9] max-w-4xl">
              Run our MCP tools.
              <br />
              <span className="text-muted-foreground">No install needed.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
              {TOOLS.length} agent-native tools — {safeCount} runnable here without an
              account. Plug the rest into Claude, ChatGPT, n8n, or any MCP client in
              under 60 seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest">
              <span className="px-3 py-1.5 border border-border text-muted-foreground">
                Streamable HTTP
              </span>
              <span className="px-3 py-1.5 border border-border text-muted-foreground">
                JSON-RPC 2.0
              </span>
              <span className="px-3 py-1.5 border border-border text-muted-foreground">
                OAuth 2.0
              </span>
              <span className="px-3 py-1.5 border border-accent/40 text-accent bg-accent/5">
                /.well-known/mcp.json
              </span>
            </div>
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <header className="mb-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                01 · Try it
              </div>
              <h2 className="mt-2 font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl">
                Live: scan any URL
              </h2>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Hits <code className="font-mono text-xs">/api/public/v1/analyze</code> —
                the same endpoint Claude and ChatGPT call. Full GEO score in under 3
                seconds.
              </p>
            </header>
            <ScanRunner />
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <header className="mb-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                01b · Agentic playground
              </div>
              <h2 className="mt-2 font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl">
                Call any MCP tool
              </h2>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Browser-native JSON-RPC runner. Paste your{" "}
                <code className="font-mono text-xs">MCP_SECRET</code> once, pick a tool,
                edit the arguments, and watch the live response. Same wire format Claude
                and ChatGPT use over <code className="font-mono text-xs">/api/public/mcp</code>.
              </p>
            </header>
            <McpRunner />
          </div>
        </section>

        <section className="border-b border-border bg-card/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <header className="mb-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                02 · Connect
              </div>
              <h2 className="mt-2 font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl">
                Install in your client
              </h2>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Copy-paste config for the major MCP clients. Get your{" "}
                <code className="font-mono text-xs">MCP_SECRET</code> by{" "}
                <a href="/login" className="text-accent underline underline-offset-4">
                  signing in
                </a>{" "}
                or via the OAuth endpoint.
              </p>
            </header>
            <InstallSnippets />
          </div>
        </section>

        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <header className="mb-8">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                03 · Browse
              </div>
              <h2 className="mt-2 font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl">
                Full tool catalog
              </h2>
              <p className="mt-2 text-muted-foreground max-w-2xl">
                Every tool exposed by the server. <span className="text-accent">public</span>{" "}
                = runnable unauthenticated. <span className="text-foreground">auth</span> =
                mutating, requires Bearer token.
              </p>
            </header>
            <ToolCatalog />
          </div>
        </section>

        <section>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="grid sm:grid-cols-3 gap-6 font-mono text-xs">
              <a
                href="/.well-known/mcp.json"
                className="block p-5 border border-border hover:border-accent transition-colors"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Discovery
                </div>
                <div className="font-bold text-foreground">/.well-known/mcp.json</div>
                <div className="mt-2 text-muted-foreground text-[11px]">
                  Auto-discovery for MCP clients
                </div>
              </a>
              <a
                href="/api/public/v1/openapi.json"
                className="block p-5 border border-border hover:border-accent transition-colors"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  REST
                </div>
                <div className="font-bold text-foreground">/api/public/v1/openapi.json</div>
                <div className="mt-2 text-muted-foreground text-[11px]">
                  OpenAPI 3.1 spec for Custom GPTs
                </div>
              </a>
              <a
                href="/llms.txt"
                className="block p-5 border border-border hover:border-accent transition-colors"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Agents
                </div>
                <div className="font-bold text-foreground">/llms.txt</div>
                <div className="mt-2 text-muted-foreground text-[11px]">
                  Site index for LLM training & retrieval
                </div>
              </a>
              <Link
                to="/guide/generative-engine-optimization"
                className="block p-5 border border-border hover:border-accent transition-colors"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Guide
                </div>
                <div className="font-bold text-foreground">GEO vs SEO</div>
                <div className="mt-2 text-muted-foreground text-[11px]">
                  What moves AI citations and how it differs from traditional SEO
                </div>
              </Link>
              <Link
                to="/guide/aeo-vs-geo-vs-seo"
                className="block p-5 border border-border hover:border-accent transition-colors"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Guide
                </div>
                <div className="font-bold text-foreground">AEO vs GEO vs SEO</div>
                <div className="mt-2 text-muted-foreground text-[11px]">
                  Side-by-side comparison of the three optimization disciplines
                </div>
              </Link>
              <Link
                to="/guide/llms-txt"
                className="block p-5 border border-border hover:border-accent transition-colors"
              >
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                  Guide
                </div>
                <div className="font-bold text-foreground">llms.txt Spec</div>
                <div className="mt-2 text-muted-foreground text-[11px]">
                  Complete spec, examples, and validation instructions
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
