import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const Route = createFileRoute("/sop")({
  head: () => ({
    meta: [
      { title: "Internal SOP — 48h Upgrade Fulfillment" },
      { name: "robots", content: "noindex,nofollow" },
      { name: "description", content: "Internal fulfillment SOP. Do not share." },
    ],
  }),
  component: SopPage,
});

function H2({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2
      id={id}
      className="text-2xl md:text-3xl font-extrabold tracking-tighter uppercase mt-16 mb-4 scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function H3({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg md:text-xl font-bold tracking-tight mt-8 mb-3 text-accent">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-4">{children}</p>;
}

function UL({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc pl-6 space-y-1.5 text-sm md:text-base text-muted-foreground mb-4 marker:text-accent">
      {children}
    </ul>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="overflow-x-auto my-6 border border-border rounded-lg">
      <table className="w-full text-sm">
        <thead className="bg-card/50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="text-left font-mono text-[10px] uppercase tracking-widest text-accent px-4 py-3 border-b border-border"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 align-top text-muted-foreground">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SopPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="border-b border-border">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <div className="mb-12 pb-8 border-b border-border">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-3">
              // Internal — Do Not Share
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter uppercase mb-6">
              48-Hour Upgrade — Fulfillment SOP
            </h1>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground space-y-1">
              <p>Owner: Delivery Lead</p>
              <p>Version: 1.0 — May 2026</p>
              <p>Goal: Ship every 48h engagement on time, consistent quality, zero scope creep.</p>
            </div>
          </div>

          <H2 id="definitions">0. Definitions</H2>
          <UL>
            <li><strong className="text-foreground">T0</strong> — the moment the kickoff checklist is 100% complete. The 48-hour clock starts here, not at contract signature.</li>
            <li><strong className="text-foreground">Build window</strong> — T0 → T0 + 48h. Two contiguous business days.</li>
            <li><strong className="text-foreground">Polish window</strong> — one 4-hour revision block within 5 business days of delivery.</li>
            <li><strong className="text-foreground">Tier 01 / 02 / 03</strong> — Launch Page ($2.4k) / Marketing Site ($4.8k) / Devtool Hub ($8.5k).</li>
          </UL>

          <H2 id="pipeline">1. Pipeline Stages</H2>
          <pre className="font-mono text-xs md:text-sm bg-card/40 border border-border rounded-lg p-4 overflow-x-auto my-4">
{`Lead → Qualify → Scope Call → Contract → Kickoff (T0) →
Build (48h) → QA → Deliver → Polish (4h) → Handover → 14-day Warranty`}
          </pre>
          <P>Every stage has a defined entry condition, exit condition, owner, and artifact.</P>

          <H2 id="stages">2. Stage Details</H2>

          <H3>2.1 Qualify (≤ 24h after inbound)</H3>
          <UL>
            <li><strong className="text-foreground">Owner:</strong> Founder / sales</li>
            <li><strong className="text-foreground">Entry:</strong> New row in <code className="text-accent">leads</code> table or <code className="text-accent">/check</code> scan with email captured.</li>
            <li>Auto-reply fires via <code className="text-accent">lead-auto-reply</code>.</li>
            <li>Score: budget tier present? AI/devtool/agent ICP? Live URL?</li>
            <li>If hot (tier_02+ and ICP match), trigger <code className="text-accent">lead-hot-notification</code>.</li>
            <li><strong className="text-foreground">Exit:</strong> Lead tagged <code className="text-accent">qualified</code> or <code className="text-accent">disqualified</code>.</li>
          </UL>

          <H3>2.2 Scope Call (30 min, Cal.com)</H3>
          <UL>
            <li>5 min — confirm ICP fit, current pain.</li>
            <li>10 min — walk the readiness report (score + top 3 gaps).</li>
            <li>10 min — propose tier + name a kickoff date.</li>
            <li>5 min — answer pricing/process Qs; send contract link before hangup.</li>
            <li><strong className="text-foreground">Exit:</strong> Contract sent or explicit no.</li>
          </UL>

          <H3>2.3 Contract & Payment</H3>
          <P>
            PayPal checkout at <code className="text-accent">/checkout</code>. No design work begins before payment clears for tier_01/02. Tier_03 may start at 50% deposit. Exit: PayPal webhook → <code className="text-accent">orders</code> row.
          </P>

          <H3>2.4 Kickoff — Pre-T0 Checklist</H3>
          <P>
            The 48-hour clock does <strong className="text-foreground">NOT</strong> start until every blocking box below is checked. Single biggest predictor of on-time delivery.
          </P>
          <Table
            headers={["#", "Item", "Source", "Blocking?"]}
            rows={[
              ["1", "Final copy (hero, sections, FAQ, footer)", "Client Google Doc", <span className="text-accent">Yes</span>],
              ["2", "Brand assets (logo SVG, hexes, fonts)", "Client upload", <span className="text-accent">Yes</span>],
              ["3", "3–5 reference sites", "Scope call notes", <span className="text-accent">Yes</span>],
              ["4", "Hosting target + DNS access (or staging consent)", "Client", <span className="text-accent">Yes</span>],
              ["5", "Domain decision (final or temporary)", "Client", "No (warn)"],
              ["6", "Analytics + form destinations", "Client", "No"],
              ["7", "Legal pages (or use template)", "Client", "No"],
            ]}
          />
          <P>
            Send the <strong className="text-foreground">Kickoff Pack</strong> email the moment payment clears. Chase missing items every 24h. <strong className="text-foreground">Do not start building partial scope</strong> — that is how 48h slips to 96h. Exit: checklist complete → <code className="text-accent">orders.kickoff_at = now()</code> → T0 starts.
          </P>

          <H3>2.5 Build Window — Phase A (Hours 0–6): Architecture</H3>
          <UL>
            <li>Create repo from <code className="text-accent">grow-template-tier-{`{01|02|03}`}</code>.</li>
            <li>Draft route map and <code className="text-accent">head()</code> metadata for every route.</li>
            <li>Stub <code className="text-accent">llms.txt</code>, <code className="text-accent">robots.txt</code>, <code className="text-accent">sitemap.xml</code>, <code className="text-accent">rss.xml</code>.</li>
            <li>JSON-LD: Organization, WebSite, Service minimum; add Product, FAQPage, BreadcrumbList per tier.</li>
            <li><strong className="text-foreground">Checkpoint:</strong> <code className="text-accent">bun run build</code> is green.</li>
          </UL>

          <H3>Phase B (Hours 6–24): Design + Build</H3>
          <UL>
            <li>Hero + 1 hero variant (A/B switch, off by default).</li>
            <li>Section order: hero → social proof → core value → features → pricing/CTA → FAQ → footer.</li>
            <li>Copy lives in route files or <code className="text-accent">src/content/</code>, never inline.</li>
            <li>Semantic tokens only. No hex in components.</li>
            <li><strong className="text-foreground">Checkpoint at hour 24:</strong> every section visible desktop + mobile, no Lorem.</li>
          </UL>

          <H3>Phase C (Hours 24–40): Agent-Readiness Pass</H3>
          <P>This is the differentiator. Do not skip.</P>
          <UL>
            <li>Single <code className="text-accent">&lt;h1&gt;</code> per route, semantic <code className="text-accent">section</code>/<code className="text-accent">article</code>/<code className="text-accent">nav</code>.</li>
            <li>JSON-LD validates with zero errors.</li>
            <li><code className="text-accent">llms.txt</code> summarizes site purpose + key URLs.</li>
            <li>OpenGraph 1200×630 per route; <code className="text-accent">twitter:card = summary_large_image</code>.</li>
            <li>Canonical tag on every route.</li>
            <li><code className="text-accent">sitemap.xml</code> includes every public route with <code className="text-accent">lastmod</code>.</li>
            <li>Lighthouse mobile: SEO ≥ 95, A11y ≥ 95, Perf ≥ 85.</li>
            <li>Internal <code className="text-accent">/check</code> score ≥ 85 on staged URL.</li>
          </UL>

          <H3>Phase D (Hours 40–48): QA + Deploy</H3>
          <UL>
            <li><code className="text-accent">bun run build</code> — zero warnings.</li>
            <li>Click every CTA, form, external link (new tab + <code className="text-accent">rel="noopener"</code>).</li>
            <li>Test forms end-to-end: Supabase row + confirmation email + hot-lead ping.</li>
            <li>Real-device test: iPhone Safari + Android Chrome.</li>
            <li>Deploy to client host. Verify DNS, SSL, www redirect.</li>
            <li>Verify analytics fires on production.</li>
            <li><strong className="text-foreground">Exit:</strong> Live URL, all green, <code className="text-accent">orders.delivered_at</code> logged.</li>
          </UL>

          <H3>2.6 Delivery Email (T0 + 48h sharp)</H3>
          <UL>
            <li>Live URL.</li>
            <li>GitHub repo invite.</li>
            <li>Loom walkthrough ≤ 5 min: edit copy, deploy, forms, analytics.</li>
            <li>Polish Form (Typeform/Cal) — deadline: 5 business days.</li>
            <li>Warranty terms (14 days, genuine bugs only).</li>
          </UL>

          <H3>2.7 Polish Window (one 4-hour block)</H3>
          <P>
            Collect <strong className="text-foreground">ALL</strong> revision notes in writing BEFORE the block starts. No live "while you're in there" additions. Out of scope (quote separately): new sections, new routes, copy rewrites &gt; 30%, new integrations, new design directions. Exit: client sign-off OR auto-close at day 5 of silence.
          </P>

          <H3>2.8 14-Day Warranty</H3>
          <P>
            Free: genuine bugs, broken links, regressions caused by us. Not free: new requests, content changes, third-party breakage. Log every fix in <code className="text-accent">orders.warranty_log</code>.
          </P>

          <H2 id="quality">3. Quality Bars (non-negotiable)</H2>
          <P>A build cannot ship unless ALL are true:</P>
          <UL>
            <li><code className="text-accent">bun run build</code> passes, zero TS errors.</li>
            <li>Internal <code className="text-accent">/check</code> score ≥ 85.</li>
            <li>Lighthouse mobile: SEO ≥ 95, A11y ≥ 95, Perf ≥ 85.</li>
            <li>No <code className="text-accent">console.error</code> in production.</li>
            <li>Every route: unique <code className="text-accent">&lt;title&gt;</code> and meta description &lt; 160 chars.</li>
            <li>Every image has <code className="text-accent">alt</code>. Every input has <code className="text-accent">&lt;label&gt;</code>.</li>
            <li>No <code className="text-accent">localhost</code>, <code className="text-accent">lorem</code>, <code className="text-accent">placeholder</code>, <code className="text-accent">TODO</code> in shipped HTML.</li>
          </UL>

          <H2 id="raci">4. Roles & RACI</H2>
          <Table
            headers={["Activity", "Founder", "Builder", "Ops"]}
            rows={[
              ["Qualify lead", "A/R", "—", "C"],
              ["Scope call", "A/R", "C", "—"],
              ["Contract + invoice", "A", "—", "R"],
              ["Kickoff pack", "A", "C", "R"],
              ["Build (48h)", "C", "A/R", "—"],
              ["QA pass", "A", "R", "—"],
              ["Deploy", "C", "A/R", "—"],
              ["Delivery email", "A", "C", "R"],
              ["Polish block", "C", "A/R", "—"],
              ["Warranty", "C", "A/R", "—"],
            ]}
          />
          <p className="text-xs text-muted-foreground mb-4">R = responsible, A = accountable, C = consulted.</p>

          <H2 id="tooling">5. Tooling — Where Things Live</H2>
          <Table
            headers={["Concern", "Tool / Location"]}
            rows={[
              ["Leads, orders, scans", "Supabase (leads, orders, scans)"],
              ["Payments", "PayPal — /checkout"],
              ["Calls", "Cal.com — cal.com/grow-contact/intro"],
              ["Email", "Server routes under /lovable/email/*"],
              ["Internal templates", "grow-template-tier-{01|02|03} repos"],
              ["Site QA", "/check + Lighthouse CI"],
              ["Deploys", "Client hosting; we hold no prod secrets"],
            ]}
          />

          <H2 id="failures">6. Failure Modes & Mitigations</H2>
          <Table
            headers={["Failure", "Cause", "Mitigation"]}
            rows={[
              ["48h slips", "Started without full kickoff pack", "Refuse to start T0; document gating items"],
              ["Polish balloons", "No written revision list", "Force Typeform submission before block"],
              ["Client ghosts mid-build", "No async checkpoint", "Send hour-24 preview link + Loom"],
              ["Warranty abuse", "'Bug' is a new feature", "Refer to written warranty terms"],
              ["Copy rewrites loop", "Copy not signed off at kickoff", "Mark copy FINAL in writing before T0"],
              ["Lighthouse regresses on deploy", "Client host config differs", "Deploy then re-run Lighthouse on prod"],
            ]}
          />

          <H2 id="retro">7. Continuous Improvement</H2>
          <P>
            After every project: 15-minute retro logged in <code className="text-accent">retros/YYYY-MM-DD-{`{client}`}.md</code>. Anything that slipped goes into either the kickoff checklist (client input), the QA checklist (build miss), or this SOP (process gap). Bump the version number at the top whenever the process changes.
          </P>

          <div className="mt-16 pt-8 border-t border-border font-mono text-xs text-muted-foreground">
            <p>Source: <code className="text-accent">docs/sop-48h-upgrade.md</code></p>
            <p>This page is <code className="text-accent">noindex</code> and not linked from public nav.</p>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
