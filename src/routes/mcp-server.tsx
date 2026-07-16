import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { InstallSnippets } from "@/components/playground/InstallSnippets";
import { TOOLS } from "@/lib/playground/catalog";
import { ogImageMeta } from "@/lib/seo/og";

const TITLE = "MCP Server — grow-contact-mcp v2.0 (docs & install)";
const DESC =
  "Our public MCP server gives any agent client 90+ tools over Streamable HTTP with OAuth + Bearer auth. Discoverable at /.well-known/mcp.json. Install in Claude, ChatGPT, n8n, or any MCP-compatible client in about a minute.";
const URL = "https://citation.is/mcp";

const ENDPOINTS = [
  { method: "POST", path: "/api/public/mcp", note: "JSON-RPC over Streamable HTTP. Bearer auth." },
  { method: "GET", path: "/.well-known/mcp.json", note: "Discovery card. No auth." },
  { method: "GET", path: "/.well-known/mcp/server-card.json", note: "Full server card (MCP 2025-06-18). No auth." },
  { method: "GET", path: "/.well-known/oauth-protected-resource", note: "OAuth resource metadata." },
  { method: "GET", path: "/.well-known/oauth-authorization-server", note: "OAuth server metadata." },
  { method: "POST", path: "/api/public/oauth/token", note: "Exchange credentials for an MCP_SECRET." },
];

export const Route = createFileRoute("/mcp-server")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
      { property: "og:type", content: "website" },
      ...ogImageMeta({
        title: "MCP Server Docs — v2.0",
        kicker: "citation.is",
        sub: "90+ agent-native tools. OAuth + Bearer. Streamable HTTP.",
      }),
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: TITLE,
          description: DESC,
          url: URL,
          author: { "@type": "Organization", name: "citation.is" },
        }),
      },
    ],
  }),
  component: McpDocsPage,
});

function McpDocsPage() {
  const byCategory = TOOLS.reduce<Record<string, typeof TOOLS>>((acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  }, {});

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
              /mcp · grow-contact-mcp v2.0.0 · streamable http
            </div>
            <h1 className="font-extrabold uppercase tracking-tighter text-4xl sm:text-6xl lg:text-7xl leading-[0.9] max-w-4xl">
              MCP server docs.
              <br />
              <span className="text-muted-foreground">Live and battle-tested.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
              {TOOLS.length} tools your agent can call directly — scoring sites, fetching scans, drafting leads, and more.
              OAuth + Bearer auth, discoverable via{" "}
              <a href="/.well-known/mcp.json" className="text-accent hover:underline">/.well-known/mcp.json</a>.
              Kick the tires in the{" "}
              <Link to="/playground" className="text-accent hover:underline">browser playground</Link>{" "}
              before you install.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 font-mono text-[10px] uppercase tracking-widest">
              <a href="#install" className="px-3 py-1.5 border border-accent text-accent hover:bg-accent hover:text-background transition-colors">Install →</a>
              <a href="#endpoints" className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground">Endpoints</a>
              <a href="#tools" className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground">Tools</a>
              <a href="#auth" className="px-3 py-1.5 border border-border text-muted-foreground hover:text-foreground">Auth</a>
            </div>
          </div>
        </section>

        {/* Install */}
        <section id="install" className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl mb-2">Install</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Pick your client. Replace <code className="font-mono text-foreground">YOUR_MCP_SECRET</code> with a token from{" "}
              <a href="#auth" className="text-accent hover:underline">OAuth</a>.
            </p>
            <InstallSnippets />
          </div>
        </section>

        {/* Endpoints */}
        <section id="endpoints" className="border-b border-border bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl mb-8">Endpoints</h2>
            <div className="border border-border bg-card">
              <table className="w-full font-mono text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left uppercase tracking-widest text-[10px] text-muted-foreground">
                    <th className="px-4 py-3 w-20">Method</th>
                    <th className="px-4 py-3">Path</th>
                    <th className="px-4 py-3 hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {ENDPOINTS.map((e) => (
                    <tr key={e.path} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 text-accent">{e.method}</td>
                      <td className="px-4 py-3 text-foreground break-all">{e.path}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{e.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Auth */}
        <section id="auth" className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl mb-8">Auth</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-border p-6 bg-card">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">Option A · Bearer</div>
                <h3 className="font-bold text-lg mb-2">Static MCP_SECRET</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send <code className="font-mono text-foreground">Authorization: Bearer YOUR_MCP_SECRET</code> on every
                  POST. Compared in constant time on the server.
                </p>
                <pre className="font-mono text-xs bg-muted/30 p-3 overflow-x-auto">POST /api/public/mcp
Authorization: Bearer ***
Content-Type: application/json
Accept: application/json, text/event-stream</pre>
              </div>
              <div className="border border-border p-6 bg-card">
                <div className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">Option B · OAuth 2.1</div>
                <h3 className="font-bold text-lg mb-2">Standards-based</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Discover at <code className="font-mono text-foreground">/.well-known/oauth-authorization-server</code>,
                  exchange creds at <code className="font-mono text-foreground">/api/public/oauth/token</code>, use the
                  returned token as Bearer.
                </p>
                <pre className="font-mono text-xs bg-muted/30 p-3 overflow-x-auto">POST /api/public/oauth/token
grant_type=client_credentials
&client_id=...
&client_secret=...</pre>
              </div>
            </div>
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="border-b border-border bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
              <div>
                <h2 className="font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl">Tools</h2>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  {TOOLS.length} tools across {Object.keys(byCategory).length} categories.{" "}
                  Try public-safe ones live in the{" "}
                  <Link to="/playground" className="text-accent hover:underline">playground</Link>.
                </p>
              </div>
              <Link
                to="/playground"
                className="px-4 py-2 border border-accent text-accent hover:bg-accent hover:text-background transition-colors font-mono text-[11px] uppercase tracking-widest"
              >
                Open Playground →
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(byCategory).map(([cat, list]) => (
                <div key={cat} className="border border-border bg-card">
                  <header className="px-5 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold uppercase tracking-tighter">{cat}</h3>
                    <span className="font-mono text-[10px] text-muted-foreground">{list.length} tools</span>
                  </header>
                  <ul className="divide-y divide-border">
                    {list.map((t) => (
                      <li key={t.name} className="px-5 py-3 flex items-start gap-3">
                        <code className="font-mono text-xs text-accent shrink-0 mt-0.5">{t.name}</code>
                        <span className="text-sm text-muted-foreground">{t.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Spec */}
        <section className="border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
            <h2 className="font-extrabold uppercase tracking-tighter text-3xl sm:text-4xl mb-4">Spec compliance</h2>
            <ul className="space-y-2 text-sm text-muted-foreground max-w-3xl">
              <li>· MCP protocol <span className="text-foreground font-mono">2025-06-18</span> (Streamable HTTP transport).</li>
              <li>· JSON-RPC 2.0. POST only — GET/DELETE return 405.</li>
              <li>· Required headers: <code className="font-mono text-foreground">Accept: application/json, text/event-stream</code>.</li>
              <li>· Server card published at <a href="/.well-known/mcp/server-card.json" className="text-accent hover:underline">/.well-known/mcp/server-card.json</a>.</li>
              <li>· Discovery via <code className="font-mono text-foreground">Link</code> header with <code className="font-mono text-foreground">rel="mcp"</code> on every HTML response.</li>
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
