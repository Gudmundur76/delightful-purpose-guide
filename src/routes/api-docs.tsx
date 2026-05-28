import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/api-docs")({
  component: ApiDocsPage,
  head: () => ({
    meta: [
      { title: "API Documentation — Grow" },
      {
        name: "description",
        content:
          "Grow Public API v1 documentation. Endpoints for posts, leads, and scores. Authenticate with X-API-Key.",
      },
      { property: "og:title", content: "API Documentation — Grow" },
      {
        property: "og:description",
        content:
          "Grow Public API v1 documentation. Endpoints for posts, leads, and scores.",
      },
      { property: "og:url", content: "https://grow.contact/api-docs" },
      { property: "og:image", content: "https://grow.contact/api/public/widget/og.svg?kicker=Grow&title=API%20Documentation%20%E2%80%94%20Grow&sub=Grow%20Public%20API%20v1%20documentation.%20Endpoints%20for%20posts%2C%20leads%2C%20and%20scores.%20Authenticate%20with%20X-API-Key." },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "API Documentation — Grow" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "https://grow.contact/api/public/widget/og.svg?kicker=Grow&title=API%20Documentation%20%E2%80%94%20Grow&sub=Grow%20Public%20API%20v1%20documentation.%20Endpoints%20for%20posts%2C%20leads%2C%20and%20scores.%20Authenticate%20with%20X-API-Key." },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/api-docs" }],
  }),
});

interface Endpoint {
  method: "GET" | "POST";
  path: string;
  description: string;
  exampleRequest?: string;
  exampleResponse?: string;
}

const ENDPOINTS: Endpoint[] = [
  {
    method: "GET",
    path: "/api/public/v1/posts",
    description: "List all journal posts.",
    exampleRequest: `curl -X GET "https://grow.contact/api/public/v1/posts" \\
  -H "X-API-Key: your_api_key_here"`,
    exampleResponse: `{
  "posts": [
    {
      "slug": "agent-native-design",
      "title": "Designing for Agents, Not Just Humans",
      "excerpt": "Why structured data matters in the agent era.",
      "published_at": "2026-05-18T00:00:00Z"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/public/v1/posts/{slug}",
    description: "Fetch a single post by slug.",
    exampleRequest: `curl -X GET "https://grow.contact/api/public/v1/posts/agent-native-design" \\
  -H "X-API-Key: your_api_key_here"`,
    exampleResponse: `{
  "slug": "agent-native-design",
  "title": "Designing for Agents, Not Just Humans",
  "content": "...",
  "published_at": "2026-05-18T00:00:00Z"
}`,
  },
  {
    method: "GET",
    path: "/api/public/v1/leads",
    description: "List recent leads (most recent first). Optional query: ?limit=50",
    exampleRequest: `curl -X GET "https://grow.contact/api/public/v1/leads?limit=10" \\
  -H "X-API-Key: your_api_key_here"`,
    exampleResponse: `{
  "leads": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "budget_tier": "enterprise",
      "message": "Looking for a devtool hub.",
      "created_at": "2026-05-20T10:00:00Z"
    }
  ]
}`,
  },
  {
    method: "POST",
    path: "/api/public/v1/leads",
    description: "Create a lead. Body: { name, email, budget_tier, message }",
    exampleRequest: `curl -X POST "https://grow.contact/api/public/v1/leads" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your_api_key_here" \\
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "budget_tier": "enterprise",
    "message": "Looking for a devtool hub."
  }'`,
    exampleResponse: `{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "budget_tier": "enterprise",
  "created_at": "2026-05-20T10:00:00Z"
}`,
  },
];

function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="font-extrabold tracking-tighter text-xl uppercase">
              GROW_
            </span>
            <span className="font-mono text-[10px] font-medium px-2 py-1 border border-border text-muted-foreground tracking-tight uppercase">
              API Docs
            </span>
          </Link>
          <Link
            to="/"
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; Home
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Hero */}
        <section className="mb-16">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
            // Developers
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tighter uppercase mb-4">
            Public API v1
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl">
            Programmatic access to journal posts and leads. All endpoints return JSON and require
            authentication via an API key header.
          </p>
        </section>

        {/* Authentication */}
        <section className="mb-16 border border-border bg-card p-6 md:p-8">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent mb-4">
            // Authentication
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            Every request must include your API key in one of the following headers:
          </p>
          <ul className="space-y-2 mb-4 font-mono text-xs">
            <li className="flex items-start gap-3">
              <span className="text-accent mt-0.5">&rarr;</span>
              <code className="bg-muted px-2 py-1 rounded text-foreground">
                X-API-Key: your_api_key_here
              </code>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-accent mt-0.5">&rarr;</span>
              <code className="bg-muted px-2 py-1 rounded text-foreground">
                Authorization: Bearer your_api_key_here
              </code>
            </li>
          </ul>
          <p className="text-xs text-muted-foreground">
            No key? Contact{" "}
            <span className="text-accent select-all">hello@grow.contact</span>{" "}
            to request access.
          </p>
        </section>

        {/* Endpoints */}
        <section className="space-y-10">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-accent">
            // Endpoints
          </h2>
          {ENDPOINTS.map((ep) => (
            <article
              key={ep.path}
              className="border border-border bg-card overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-3 px-5 py-4 md:px-6 md:py-5 border-b border-border bg-muted/20">
                <span
                  className={`font-mono text-[10px] uppercase tracking-widest px-2 py-1 border ${
                    ep.method === "GET"
                      ? "border-emerald-400/30 text-emerald-400 bg-emerald-400/10"
                      : "border-amber-400/30 text-amber-400 bg-amber-400/10"
                  }`}
                >
                  {ep.method}
                </span>
                <code className="font-mono text-sm text-foreground break-all">
                  {ep.path}
                </code>
              </div>
              <div className="px-5 py-4 md:px-6 md:py-5 space-y-4">
                <p className="text-sm text-muted-foreground">{ep.description}</p>

                {ep.exampleRequest && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      // Request
                    </p>
                    <pre className="bg-background border border-border p-4 overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
                      <code>{ep.exampleRequest}</code>
                    </pre>
                  </div>
                )}

                {ep.exampleResponse && (
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                      // Response
                    </p>
                    <pre className="bg-background border border-border p-4 overflow-x-auto font-mono text-xs leading-relaxed text-foreground">
                      <code>{ep.exampleResponse}</code>
                    </pre>
                  </div>
                )}
              </div>
            </article>
          ))}
        </section>

        {/* OpenAPI */}
        <section className="mt-16 border border-accent/40 bg-accent/5 p-8 md:p-10 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-accent mb-3">
            // Machine Readable
          </p>
          <h3 className="text-xl md:text-2xl font-extrabold tracking-tighter uppercase mb-3">
            OpenAPI 3.1 Spec
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
            Download the full OpenAPI spec to import into Postman, Insomnia, or generate client SDKs.
          </p>
          <a
            href="/api/public/v1/openapi.json"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-5 py-3 uppercase tracking-tighter text-xs hover:bg-foreground hover:text-background transition-colors"
          >
            Download openapi.json
            <span className="font-mono text-[10px]">&rarr;</span>
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            &copy; 2026 GROW STUDIO
          </span>
          <Link
            to="/status"
            className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors"
          >
            System Status
          </Link>
        </div>
      </footer>
    </div>
  );
}
