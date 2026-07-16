import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import {
  CLAIMS_SCHEMA_URL,
  STATS_SCHEMA_URL,
  LEADERBOARD_SCHEMA_URL,
} from "@/lib/seo/dataset-schemas";
import { ogImageMeta } from "@/lib/seo/og";


const DATASETS = [
  {
    key: "claims",
    title: "Verifiable claims registry",
    live: "/api/public/data/claims.json",
    archive: "/data/q2-2026/claims.json",
    schema: CLAIMS_SCHEMA_URL,
    schemaPath: "/api/public/data/schemas/claims.schema.json",
    cache: "max-age=300, s-maxage=900, stale-while-revalidate=86400",
    shape:
      "Array of claim objects keyed by stable fragment id (e.g. home-stat-83). Each claim maps a visible value on the site to a source URL, observation date, and the page anchors where it renders.",
    sample: `{
  "$schema": "${CLAIMS_SCHEMA_URL}",
  "standard": "geo-standard@2026.07",
  "license": "https://creativecommons.org/licenses/by/4.0/",
  "count": 11,
  "claims": [
    {
      "id": "home-stat-83",
      "value": "83%",
      "label": "Share of AI Overview citations from pages outside the organic top 10",
      "source": "BrightEdge AI Overview tracking study, 2025",
      "source_url": "https://www.brightedge.com/resources/research-reports/ai-overviews",
      "date_observed": "2025-12-01",
      "unit": "PERCENT",
      "page_anchors": ["https://citation.is/#home-stat-83"]
    }
  ]
}`,
  },
  {
    key: "stats",
    title: "Headline stats",
    live: "/api/public/data/stats.json",
    archive: "/data/q2-2026/stats.json",
    schema: STATS_SCHEMA_URL,
    schemaPath: "/api/public/data/schemas/stats.schema.json",
    cache: "max-age=300, s-maxage=900, stale-while-revalidate=86400",
    shape:
      "Recomputes on every request from the live Agent Readability Leaderboard. All percentages are integers 0–100; scores are integers 0–100.",
    sample: `{
  "$schema": "${STATS_SCHEMA_URL}",
  "sample_size": 390,
  "stats": {
    "total": 390,
    "avg_score": 62,
    "median_score": 64,
    "agent_native_pct": 18,
    "opaque_pct": 23,
    "missing_llms_txt_pct": 71,
    "weak_jsonld_pct": 44,
    "top5": [{ "name": "Anthropic", "domain": "anthropic.com", "score": 94 }],
    "citable_headlines": ["71% of 390 AI companies are missing or under-serving llms.txt."]
  }
}`,
  },
  {
    key: "leaderboard",
    title: "Agent Readability Leaderboard",
    live: "/api/public/data/leaderboard.json",
    archive: "/data/q2-2026/leaderboard.json",
    schema: LEADERBOARD_SCHEMA_URL,
    schemaPath: "/api/public/data/schemas/leaderboard.schema.json",
    cache: "max-age=300, s-maxage=900, stale-while-revalidate=86400",
    shape:
      "Ranked entries with the five geo-standard sub-signals. Supports ?category=infra|models|agents|devtools and ?limit=1..1000.",
    sample: `{
  "$schema": "${LEADERBOARD_SCHEMA_URL}",
  "counts": { "total": 390, "returned": 390 },
  "entries": [
    {
      "rank": 1,
      "name": "Anthropic",
      "domain": "anthropic.com",
      "category": "models",
      "score": 94,
      "signals": { "semantic": 24, "json_ld": 19, "llms_txt": 15, "citability": 18, "speed": 18 },
      "verify_url": "https://citation.is/verify/anthropic.com",
      "badge_url": "https://citation.is/badge/anthropic.com.svg"
    }
  ]
}`,
  },
] as const;

export const Route = createFileRoute("/data/")({
  head: () => ({
    meta: [
      { title: "Public data API — citation.is Verifiability Layer" },
      {
        name: "description",
        content:
          "Open JSON endpoints and JSON Schemas for the citation.is verifiable claims, headline stats, and Agent Readability Leaderboard. CC BY 4.0.",
      },
      { property: "og:title", content: "Public data API — citation.is Verifiability Layer" },
      {
        property: "og:description",
        content:
          "Three live JSON endpoints plus frozen Q2 2026 archives, each backed by a JSON Schema. Licensed CC BY 4.0.",
      },
      ...ogImageMeta({
        title: "Public data API",
        kicker: "Verifiability Layer",
        sub: "Open JSON endpoints + schemas, CC BY 4.0",
      }),
    ],
    links: [{ rel: "canonical", href: "https://citation.is/data" }],
  }),

  component: DataDocsPage,
});

function DataDocsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="container mx-auto max-w-5xl px-4 py-16 md:py-24">
        <header className="mb-12 border-b border-border pb-10">
          <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Verifiability Layer
          </p>
          <h1 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight">
            Public data API
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
            Three open JSON endpoints back every visible statistic on citation.is. Each
            response carries an inline <code className="font-mono text-sm">$schema</code> URL
            and validates against a published JSON Schema (Draft 2020-12). All datasets are
            released under{" "}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="underline underline-offset-4 hover:text-foreground"
            >
              CC BY 4.0
            </a>
            .
          </p>
          <ul className="mt-6 flex flex-wrap gap-2 text-sm">
            {DATASETS.map((d) => (
              <li key={d.key}>
                <a
                  href={`#${d.key}`}
                  className="rounded-full border border-border px-3 py-1 hover:bg-muted"
                >
                  {d.title}
                </a>
              </li>
            ))}
            <li>
              <Link
                to="/standard"
                className="rounded-full border border-border px-3 py-1 hover:bg-muted"
              >
                geo-standard@2026.07
              </Link>
            </li>
          </ul>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold tracking-tight">Quickstart</h2>
          <p className="mt-3 text-muted-foreground">
            Every dataset is a single <code className="font-mono">GET</code> with no auth
            required. CORS is open (<code className="font-mono">*</code>). Responses are
            cached at the edge so AI crawlers get sub-100ms TTFB.
          </p>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <code>{`# Live verifiable claims
curl https://citation.is/api/public/data/claims.json

# Headline stats (re-derived per request)
curl https://citation.is/api/public/data/stats.json

# Leaderboard, filtered + paginated
curl 'https://citation.is/api/public/data/leaderboard.json?category=models&limit=25'

# Validate against schema
curl https://citation.is/api/public/data/schemas/claims.schema.json | jq .`}</code>
          </pre>
        </section>

        {DATASETS.map((d) => (
          <section key={d.key} id={d.key} className="mb-14 scroll-mt-24">
            <h2 className="text-2xl font-semibold tracking-tight">{d.title}</h2>
            <p className="mt-3 text-muted-foreground">{d.shape}</p>

            <dl className="mt-6 grid grid-cols-1 gap-3 text-sm md:grid-cols-[10rem_1fr]">
              <dt className="font-medium text-muted-foreground">Live</dt>
              <dd>
                <a className="font-mono underline underline-offset-4" href={d.live}>
                  {d.live}
                </a>
              </dd>
              <dt className="font-medium text-muted-foreground">Q2 2026 archive</dt>
              <dd>
                <a className="font-mono underline underline-offset-4" href={d.archive}>
                  {d.archive}
                </a>{" "}
                <span className="text-muted-foreground">
                  (frozen, <code>immutable</code> cache)
                </span>
              </dd>
              <dt className="font-medium text-muted-foreground">JSON Schema</dt>
              <dd>
                <a className="font-mono underline underline-offset-4" href={d.schemaPath}>
                  {d.schemaPath}
                </a>
              </dd>
              <dt className="font-medium text-muted-foreground">Cache</dt>
              <dd>
                <code className="font-mono">{d.cache}</code>
              </dd>
              <dt className="font-medium text-muted-foreground">License</dt>
              <dd>
                <a
                  className="underline underline-offset-4"
                  href="https://creativecommons.org/licenses/by/4.0/"
                >
                  CC BY 4.0
                </a>
              </dd>
            </dl>

            <h3 className="mt-6 text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Sample response
            </h3>
            <pre className="mt-2 overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-relaxed">
              <code>{d.sample}</code>
            </pre>
          </section>
        ))}

        <section className="mb-14">
          <h2 className="text-2xl font-semibold tracking-tight">Versioning & stability</h2>
          <ul className="mt-4 space-y-3 text-muted-foreground">
            <li>
              <strong className="text-foreground">Stable identifiers.</strong> Claim{" "}
              <code>id</code> values never change once published; they double as page
              anchors (e.g. <code>#home-stat-83</code>).
            </li>
            <li>
              <strong className="text-foreground">Additive schemas.</strong> New fields may
              be added without a version bump. Removed or renamed fields trigger a new
              <code> standard</code> tag (e.g. <code>geo-standard@2026.07</code> →{" "}
              <code>2027.01</code>).
            </li>
            <li>
              <strong className="text-foreground">Archives are immutable.</strong> Anything
              under <code>/data/&lt;quarter&gt;/</code> is frozen at publication and served
              with a one-year <code>immutable</code> cache.
            </li>
            <li>
              <strong className="text-foreground">Attribution.</strong> When citing,
              include the source URL and{" "}
              <code>“citation.is Agent Readability — CC BY 4.0”</code>.
            </li>
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
