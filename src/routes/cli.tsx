import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cli")({
  component: CliPage,
  head: () => ({
    meta: [
      { title: "grow CLI — Agent-Readiness Scanner for Your Terminal" },
      {
        name: "description",
        content:
          "Score any URL against the Grow GEO Standard from your terminal. Zero-dep Node CLI, CI-friendly --fail-under flag, free with an API key. npx @grow-contact/cli check <url>.",
      },
      { property: "og:title", content: "grow CLI — Agent-Readiness in your terminal" },
      {
        property: "og:description",
        content:
          "npx @grow-contact/cli check <url> — Lighthouse for AI agents. 5 signals, 0–100, CI-ready.",
      },
      { property: "og:url", content: "https://grow.contact/cli" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://grow.contact/cli" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "grow CLI",
          alternateName: "@grow-contact/cli",
          applicationCategory: "DeveloperApplication",
          operatingSystem: "Linux, macOS, Windows",
          description:
            "Command-line scanner that scores any URL against the Grow GEO Standard (5 signals, 0–100) for AI agent readability.",
          url: "https://grow.contact/cli",
          softwareVersion: "0.1.0",
          downloadUrl: "https://www.npmjs.com/package/@grow-contact/cli",
          license: "https://opensource.org/licenses/MIT",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          publisher: {
            "@type": "Organization",
            name: "grow.contact",
            url: "https://grow.contact",
          },
        }),
      },
    ],
  }),
});

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

function CliPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-12">
        <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          @grow-contact/cli · v0.1.0 · MIT
        </p>
        <h1 className="mb-4 text-4xl font-semibold tracking-tight">
          Agent-readiness in your terminal.
        </h1>
        <p className="text-lg text-muted-foreground">
          A zero-dependency Node CLI that scores any URL against the Grow GEO Standard —
          the same five signals as the public scanner at{" "}
          <Link to="/check" className="underline">/check</Link>. Pipe it into CI, gate
          deploys on agent readability, ship with confidence.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold">Run it now</h2>
        <Code>{`npx @grow-contact/cli check https://example.com`}</Code>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold">Sample output</h2>
        <Code>{`  Grow GEO Standard  ·  https://example.com
   87/100  B  Solid agent readability with a few opportunities to improve.

  ● semantic html         95 · 6/6 landmarks, single H1, alt text on all images
  ● json ld               90 · Organization + WebSite present
  ● llms txt              80 · /llms.txt found, missing 2 routes
  ● citability            85 · First 60 words answer the page's implicit question
  ● speed                 92 · TTFB 180ms, HTML 240KB
      ↳ Tip: Add a Link: </llms.txt>; rel="llms" header for faster discovery`}</Code>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold">Install globally</h2>
        <Code>{`npm i -g @grow-contact/cli
export GROW_API_KEY=...   # free key at /api-docs
grow check https://example.com`}</Code>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold">Gate deploys in CI</h2>
        <p className="mb-3 text-muted-foreground">
          Exit code 1 when the score drops below your threshold:
        </p>
        <Code>{`# .github/workflows/agent-readiness.yml
- name: Agent readiness
  run: npx @grow-contact/cli check https://example.com --fail-under 90
  env:
    GROW_API_KEY: \${{ secrets.GROW_API_KEY }}`}</Code>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold">Commands</h2>
        <div className="space-y-4">
          <div>
            <p className="font-mono text-sm">grow check &lt;url&gt; [--json] [--fail-under &lt;n&gt;]</p>
            <p className="text-sm text-muted-foreground">
              Score a URL. <code>--json</code> for machine output, <code>--fail-under</code> for CI gates.
            </p>
          </div>
          <div>
            <p className="font-mono text-sm">grow badge &lt;url&gt; [--out &lt;path&gt;]</p>
            <p className="text-sm text-muted-foreground">
              Download the SVG badge for a URL you've already scanned.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold">Why a CLI</h2>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>Same six signals as the public scanner — no second rubric to learn.</li>
          <li>Works in any CI runner with Node 18+. No browser, no Docker.</li>
          <li>MIT, zero deps, ~250 LOC. Audit it in a coffee break.</li>
          <li>When the score is low, a 48-hour fix is one click away at <Link to="/pricing" className="underline">/pricing</Link>.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Get an API key</h2>
        <p className="text-muted-foreground">
          The <code>check</code> command calls our public scanner. Grab a free key on the{" "}
          <Link to="/api-docs" className="underline">API docs page</Link>, then export it as{" "}
          <code>GROW_API_KEY</code>.
        </p>
      </section>
    </main>
  );
}
