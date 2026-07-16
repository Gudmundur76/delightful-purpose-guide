export interface ComparisonRow {
  dimension: string;
  grow: string;
  competitor: string;
  growWins: boolean;
}

export interface Comparison {
  slug: string;
  competitor: string;
  competitorDomain: string;
  category: string;
  tagline: string;
  oneLiner: string;
  verdict: string;
  bestFor: string;
  switchIf: string[];
  stayIf: string[];
  rows: ComparisonRow[];
  faqs: { q: string; a: string }[];
}

const SHARED_TOP: Omit<ComparisonRow, "competitor" | "growWins">[] = [];
void SHARED_TOP;

export const COMPARISONS: Comparison[] = [
  {
    slug: "webflow",
    competitor: "Webflow",
    competitorDomain: "webflow.com",
    category: "Visual builder",
    tagline: "Webflow gives you a canvas. Grow gives you a site that gets cited.",
    oneLiner:
      "Webflow is a no-code visual builder that ships generic, JavaScript-heavy markup. Grow hand-codes semantic HTML that LLMs can read on the first request.",
    verdict:
      "Webflow optimises for designer flexibility. Grow optimises for agent readability and time-to-launch. If you want a site that ChatGPT and Perplexity cite by name, the underlying markup matters more than the canvas.",
    bestFor:
      "AI startups, devtools, and technical teams who care more about being cited by LLMs than about dragging boxes in a CMS.",
    switchIf: [
      "Your Webflow site renders as a wall of <div> tags with no semantic structure.",
      "You're paying for a CMS you never use because content lives in your docs or GitHub.",
      "You want JSON-LD on every page, not just the homepage.",
      "Lighthouse keeps flagging unused JavaScript above 200 KB.",
    ],
    stayIf: [
      "You need a non-technical team to edit pages weekly without engineering.",
      "Your traffic is 100% human and your funnel is paid social, not search or LLM citation.",
    ],
    rows: [
      { dimension: "Markup", grow: "Hand-coded semantic HTML (<article>, <nav>, <section>)", competitor: "Generated <div> soup with utility classes", growWins: true },
      { dimension: "JSON-LD structured data", grow: "Every page, typed and validated", competitor: "Manual embed, often only homepage", growWins: true },
      { dimension: "llms.txt", grow: "Shipped by default", competitor: "Not supported natively", growWins: true },
      { dimension: "First-contentful paint", grow: "< 1.5s, server-rendered", competitor: "2–4s, client-hydrated", growWins: true },
      { dimension: "Time to launch", grow: "48 hours (Starter), 5 days (Growth)", competitor: "2–8 weeks via agency or in-house", growWins: true },
      { dimension: "Price", grow: "$2,400 one-time", competitor: "$23–$235/mo + agency fees", growWins: true },
      { dimension: "Ongoing CMS for non-devs", grow: "Headless / Markdown", competitor: "Visual CMS, drag-and-drop", growWins: false },
      { dimension: "Designer flexibility", grow: "Bespoke per project", competitor: "Visual canvas, anyone can edit", growWins: false },
      { dimension: "Hosting included", grow: "Bring your own (Cloudflare, Vercel)", competitor: "Bundled hosting", growWins: false },
    ],
    faqs: [
      {
        q: "Can you migrate my existing Webflow site?",
        a: "Yes. Most Webflow rebuilds take 3–5 days and we preserve all content, redirects, and SEO equity. You keep your domain and analytics.",
      },
      {
        q: "Will I lose the visual editor?",
        a: "Yes — and that's the point. Content lives in Markdown or a headless CMS of your choice (Sanity, Contentful, GitHub). Most technical teams find this faster than Webflow's editor.",
      },
      {
        q: "What about the Webflow CMS?",
        a: "We map Webflow CMS collections to typed content schemas. Your editors keep working in a CMS — just one that outputs clean, semantic HTML.",
      },
    ],
  },
  {
    slug: "framer",
    competitor: "Framer",
    competitorDomain: "framer.com",
    category: "Visual builder",
    tagline: "Framer ships motion. Grow ships meaning.",
    oneLiner:
      "Framer is unmatched for designer-led animation. But under the hood it's a React app that LLMs and search crawlers see as an empty shell until JavaScript executes.",
    verdict:
      "If your conversion strategy depends on motion, hover states, and Figma-to-web fidelity, Framer wins. If it depends on getting cited by ChatGPT, Perplexity, or appearing in AI Overviews, you need server-rendered semantic HTML — which Framer does not produce.",
    bestFor:
      "Agencies and designers shipping high-motion brand sites for human audiences. Not for AI startups whose pipeline depends on LLM discovery.",
    switchIf: [
      "View-source on your Framer site shows almost no content — it's all hydrated client-side.",
      "Your blog posts aren't showing up in ChatGPT or Perplexity citations.",
      "You're getting good Lighthouse scores in the dashboard but real-user CWV are red.",
      "You want JSON-LD that Google actually crawls without JavaScript execution.",
    ],
    stayIf: [
      "Animation and brand expression are the entire pitch.",
      "Your audience finds you through Twitter, Dribbble, or paid — not search.",
    ],
    rows: [
      { dimension: "Server-rendered HTML", grow: "Full SSR, content in initial HTML", competitor: "Client-rendered, empty shell until JS runs", growWins: true },
      { dimension: "LLM crawlability", grow: "Readable by GPTBot, ClaudeBot, PerplexityBot", competitor: "Most LLM crawlers don't execute JS", growWins: true },
      { dimension: "Semantic structure", grow: "<article>, <nav>, <main> throughout", competitor: "Auto-generated <div> trees", growWins: true },
      { dimension: "llms.txt + Agent Readability Score", grow: "Built in", competitor: "Not part of the platform", growWins: true },
      { dimension: "Time to launch", grow: "48 hours – 5 days", competitor: "1–4 weeks", growWins: true },
      { dimension: "Animation polish", grow: "Custom Motion-for-React", competitor: "Best-in-class out of the box", growWins: false },
      { dimension: "Designer handoff", grow: "Code review required", competitor: "Drag-and-drop from Figma", growWins: false },
      { dimension: "Price", grow: "$2,400–$4,800 one-time", competitor: "$15–$30/mo + design time", growWins: true },
    ],
    faqs: [
      {
        q: "Framer sites score well on Lighthouse — isn't that enough?",
        a: "Lighthouse measures human user experience. It doesn't measure whether an LLM crawler can read your page without executing JavaScript. Most agent crawlers (GPTBot included) don't run JS, so client-rendered content is invisible to them.",
      },
      {
        q: "Can we keep Framer for the marketing site and use Grow for the docs?",
        a: "Yes — that's a common setup. We often build the LLM-readable layer (docs, blog, API reference) on a subdomain while Framer handles the brand site.",
      },
    ],
  },
  {
    slug: "wix-studio",
    competitor: "Wix Studio",
    competitorDomain: "wix.com",
    category: "Visual builder",
    tagline: "Wix is for everyone. Grow is for sites that need to be cited.",
    oneLiner:
      "Wix Studio is a capable no-code builder for small business sites. It's not built for the specific job of being legible to AI agents — the markup is too generic.",
    verdict:
      "For a local business or a brochure site, Wix is fine. For an AI startup, devtool, or agent platform where being named by ChatGPT is a growth channel, the markup gap is too wide.",
    bestFor:
      "Small businesses, restaurants, and portfolios. Not for technical teams whose users discover them through LLMs.",
    switchIf: [
      "You're an AI/devtool company on Wix and your brand never appears in ChatGPT answers.",
      "Your structured data is auto-generated and you can't customise per page.",
      "You're paying monthly for features (CMS, email, automations) you don't use.",
    ],
    stayIf: [
      "You need the all-in-one bundle: hosting, email, booking, CRM.",
      "You're not a technical team and don't want code in the loop.",
    ],
    rows: [
      { dimension: "Markup quality", grow: "Hand-coded, semantic", competitor: "Auto-generated, template-driven", growWins: true },
      { dimension: "JSON-LD control", grow: "Typed, per-page, validated", competitor: "Auto, limited customisation", growWins: true },
      { dimension: "Performance", grow: "Edge-rendered, <1.5s FCP", competitor: "Heavy runtime, 3–5s typical", growWins: true },
      { dimension: "Ownership", grow: "Code is yours, host anywhere", competitor: "Locked to Wix hosting", growWins: true },
      { dimension: "Built-in services", grow: "None — you compose your stack", competitor: "Email, booking, CRM, store bundled", growWins: false },
      { dimension: "Non-technical editing", grow: "Markdown or headless CMS", competitor: "Visual editor", growWins: false },
      { dimension: "Price", grow: "$2,400 one-time", competitor: "$17–$159/mo", growWins: true },
    ],
    faqs: [
      {
        q: "Can you migrate my Wix site?",
        a: "Yes. We export content, rebuild semantically, and set up 301 redirects so SEO equity transfers cleanly.",
      },
      {
        q: "What replaces Wix's built-in services?",
        a: "Email goes to Resend or Postmark, booking to Cal.com, store to Shopify or Lemon Squeezy. Each is best-in-class and you only pay for what you use.",
      },
    ],
  },
  {
    slug: "agencies",
    competitor: "Traditional Agencies",
    competitorDomain: "",
    category: "Agency",
    tagline: "Agencies sell process. Grow sells a launched site.",
    oneLiner:
      "Most agencies still scope 6–12 week engagements that ship a site optimised for humans only. Grow ships in 48 hours to 5 days and optimises for both humans and agents.",
    verdict:
      "If your project genuinely needs 12 weeks of discovery, brand work, and stakeholder alignment, hire an agency. If you need a launchable, citable site fast, that timeline is a tax — not a feature.",
    bestFor:
      "Founders and PMMs who already know what they want to ship and can't afford a quarter of agency cycles.",
    switchIf: [
      "You've been in a Notion brief for three weeks and haven't seen a wireframe.",
      "Your last agency invoice was $40k+ for a site that scores below 70 on Lighthouse.",
      "You need launch this month, not next quarter.",
      "You want a fixed price, not a T&M contract that drifts.",
    ],
    stayIf: [
      "You need brand strategy, naming, and visual identity from scratch.",
      "Your buying committee genuinely requires 4–6 stakeholder workshops.",
    ],
    rows: [
      { dimension: "Timeline", grow: "48 hours – 5 days", competitor: "6–12 weeks typical", growWins: true },
      { dimension: "Price", grow: "$2,400–$4,800 fixed", competitor: "$25k–$150k+", growWins: true },
      { dimension: "Pricing model", grow: "Fixed, paid on delivery", competitor: "T&M or milestone, scope creep risk", growWins: true },
      { dimension: "Agent readability focus", grow: "Core deliverable", competitor: "Rarely scoped", growWins: true },
      { dimension: "Brand strategy", grow: "We work from your existing brand", competitor: "Often included in scope", growWins: false },
      { dimension: "Account team", grow: "Founder-led, no PM layer", competitor: "PM + designer + dev + strategist", growWins: false },
      { dimension: "Revisions", grow: "Two rounds in scope", competitor: "Unlimited within phase", growWins: false },
    ],
    faqs: [
      {
        q: "Do you do brand strategy?",
        a: "No. We assume you have a logo, palette, type system, and voice. If you don't, hire a brand agency first — we'll build the site once that's locked.",
      },
      {
        q: "How do you ship in 48 hours when agencies take 8 weeks?",
        a: "We don't do discovery workshops, brand exploration, or 5-stakeholder review cycles. You bring a brief, we ship. The work is real engineering, not faster process.",
      },
    ],
  },
  {
    slug: "profound",
    competitor: "Profound",
    competitorDomain: "tryprofound.com",
    category: "AI visibility platform",
    tagline: "Profound tells you how you rank in ChatGPT. Grow makes you rank in ChatGPT.",
    oneLiner:
      "Profound is an analytics layer that measures your brand's share-of-voice across ChatGPT, Perplexity, and Gemini. Grow is the build shop that ships the semantic HTML, JSON-LD, and llms.txt those engines actually cite.",
    verdict:
      "These are complementary, not competitive — but if you have to pick one first, fix the site. A dashboard telling you you're invisible in ChatGPT every week doesn't move the number. Shipping a citable site does. Buy Profound after Grow, not before.",
    bestFor:
      "Teams who need a site that gets cited now, not a dashboard that confirms they aren't.",
    switchIf: [
      "Profound shows you a flat share-of-voice line and you don't know what to ship to move it.",
      "Your AI visibility budget is going to monitoring instead of the underlying markup.",
      "You want a one-time fixed-price rebuild, not a $1k+/mo SaaS contract.",
      "You're pre-PMF and need the site itself to work before measuring it.",
    ],
    stayIf: [
      "Your site is already best-in-class semantic and you need ongoing share-of-voice tracking across 50+ prompts.",
      "You have an in-house GEO team that needs weekly competitive intelligence to prioritise content.",
    ],
    rows: [
      { dimension: "What it does", grow: "Builds the site LLMs cite", competitor: "Measures whether LLMs cite you", growWins: true },
      { dimension: "Output", grow: "Shipped, hosted, semantic site", competitor: "Dashboard + weekly report", growWins: true },
      { dimension: "Time to value", grow: "48 hours — 5 days", competitor: "Instant insight, months to move the number", growWins: true },
      { dimension: "Pricing model", grow: "$2,400–$4,800 one-time", competitor: "$1k+/mo SaaS, annual contracts typical", growWins: true },
      { dimension: "Prompt-set tracking", grow: "Not included", competitor: "Core feature, 100s of prompts", growWins: false },
      { dimension: "Competitive share-of-voice", grow: "Not included", competitor: "Core feature", growWins: false },
      { dimension: "Fixes the underlying markup", grow: "Yes — that's the deliverable", competitor: "No — measurement only", growWins: true },
    ],
    faqs: [
      {
        q: "Should I use Profound and Grow together?",
        a: "Yes, in that order. Grow rebuilds the site so it's actually citable, then Profound measures the lift. Running Profound on a site that crawlers can't read just produces a flat line.",
      },
      {
        q: "Does Grow include AI visibility tracking?",
        a: "Not as a SaaS. We hand over a /check score at delivery and you can re-run it any time for free. For continuous multi-prompt tracking across engines, Profound or Peec are the right tools.",
      },
    ],
  },
  {
    slug: "rankscale",
    competitor: "Rankscale",
    competitorDomain: "rankscale.ai",
    category: "AI readiness scoring",
    tagline: "Rankscale grades your site. Grow rebuilds it.",
    oneLiner:
      "Rankscale is an audit tool that scores your site's AI readiness and hands you a remediation checklist. Grow is the team that executes that checklist — and ships the site.",
    verdict:
      "Audit tools are cheap to run and useless without execution. If your engineering team has bandwidth to act on a 40-item GEO checklist, Rankscale is fine. If they don't, you're buying a PDF that ages on a Notion page. Grow ships the fixes.",
    bestFor:
      "Founders who'd rather pay for the rebuild than for a list of things to rebuild.",
    switchIf: [
      "You ran a Rankscale audit, got a 60/100, and the list is still sitting in Linear three months later.",
      "Your eng team's roadmap is full and GEO keeps getting deprioritised.",
      "You want the score moved to 90+, not just measured.",
      "You'd rather pay once than subscribe to audits forever.",
    ],
    stayIf: [
      "You have in-house engineers who actively want a prioritised technical SEO/GEO backlog every month.",
      "Your stack is custom and you need ongoing audits as you ship new pages.",
    ],
    rows: [
      { dimension: "Deliverable", grow: "Shipped semantic site + JSON-LD + llms.txt", competitor: "Audit report + checklist", growWins: true },
      { dimension: "Execution included", grow: "Yes — we build it", competitor: "No — your team executes", growWins: true },
      { dimension: "Time from start to fixed", grow: "48 hours – 5 days", competitor: "Weeks-to-quarters depending on your eng capacity", growWins: true },
      { dimension: "Free /check scanner", grow: "Yes, unlimited at grow.contact/check", competitor: "Free tier exists, paid tiers for depth", growWins: true },
      { dimension: "Per-page deep audit", grow: "Not the product", competitor: "Core feature", growWins: false },
      { dimension: "Ongoing monitoring", grow: "Re-run /check any time", competitor: "Continuous in dashboard", growWins: false },
      { dimension: "Price", grow: "$2,400–$4,800 fixed, one-time", competitor: "Subscription", growWins: true },
    ],
    faqs: [
      {
        q: "Is /check just Rankscale?",
        a: "No. /check is a free, lighter-weight scan that gives you the five dimensions we ship against: Semantic HTML, JSON-LD, llms.txt, Citability, Speed. Rankscale goes deeper on per-page audits and continuous tracking. Different products, overlapping space.",
      },
      {
        q: "Can I send Rankscale's report to Grow and have you fix it?",
        a: "Yes. Forward the report with your brief and we'll scope a fixed-price rebuild against the gaps it flagged. Most reports collapse into a 48-hour or 5-day engagement.",
      },
    ],
  },
  {
    slug: "diy",
    competitor: "DIY (roll your own)",
    competitorDomain: "",
    category: "Build it yourself",
    tagline: "Anyone can write llms.txt. Few teams ship the whole standard.",
    oneLiner:
      "Everything Grow ships is technically free — semantic HTML, JSON-LD, llms.txt, robots.txt, edge caching. The cost isn't the code, it's the 30+ hours of engineering judgement to do it right and the 6+ weeks of revision cycles to find out you didn't.",
    verdict:
      "If you have a senior engineer with GEO experience and a free week, build it yourself. Most teams have neither, ship a half-finished version, score 65/100, and convince themselves AI traffic isn't a real channel. Grow is the shortcut: a 100/100 site delivered against a published standard.",
    bestFor:
      "Teams whose eng leads can't justify a quarter of internal time to relearn what we've already shipped 50+ times.",
    switchIf: [
      "Your team Googled \"llms.txt format\" three times this month and is still debating the spec.",
      "Your eng roadmap can't spare a week, let alone a month.",
      "You want a delivered site that scores 100/100, not a backlog ticket that says \"investigate GEO.\"",
      "You'd rather review a finished build than write the brief, hire the contractor, and QA it.",
    ],
    stayIf: [
      "You have a staff engineer with shipped GEO experience and explicit headroom for it.",
      "Your build pipeline already produces semantic SSR + per-route JSON-LD and you just need llms.txt added.",
    ],
    rows: [
      { dimension: "Total cost", grow: "$2,400–$4,800 fixed", competitor: "30–80 eng hours + opportunity cost", growWins: true },
      { dimension: "Time to live", grow: "48 hours – 5 days", competitor: "2–8 weeks typical, with revisions", growWins: true },
      { dimension: "Standard followed", grow: "geo-standard@2026.05, published", competitor: "Whatever your team decides", growWins: true },
      { dimension: "Verified score at delivery", grow: "100/100 on /check or we fix it", competitor: "Self-graded", growWins: true },
      { dimension: "Ownership of the code", grow: "You own it, host anywhere", competitor: "You own it, host anywhere", growWins: false },
      { dimension: "Internal team learns the craft", grow: "Less hands-on learning", competitor: "Deep learning by doing", growWins: false },
      { dimension: "Maintenance after launch", grow: "You maintain", competitor: "You maintain", growWins: false },
    ],
    faqs: [
      {
        q: "Can I just copy your /check criteria and build it myself?",
        a: "Yes — the standard is public at geo-standard@2026.05 and the /check scanner is free. The gap is execution: most teams stall on edge caching, per-route JSON-LD shape, and the robots.txt bot matrix. If those three sentences sound trivial to you, build it yourself.",
      },
      {
        q: "What do I actually pay you for?",
        a: "Compressed time, a published standard, and a verified score. The code is open — the judgement isn't.",
      },
    ],
  },
  {
    slug: "neil-patel-7-layer-stack",
    competitor: "Neil Patel's 7-Layer AI Visibility Stack",
    competitorDomain: "neilpatel.com",
    category: "GEO framework",
    tagline:
      "Neil Patel's stack describes the problem. The GEO Standard specifies the fix.",
    oneLiner:
      "The 7-Layer AI Visibility Stack is a useful taxonomy for what to think about. The GEO Standard is a testable engineering contract with pass thresholds, JSON-LD shapes, and a public scanner that scores you on it.",
    verdict:
      "Both frameworks agree on the substance: technical crawlability, structured data, answer-first content, and measurement. The 7-Layer Stack is agency-facing — it names layers so a strategist can talk about them. The GEO Standard is engineer-facing — every rule is testable at /check, versioned in git, and licensed CC BY 4.0. Pick the framework by who you need to convince: a stakeholder (Neil's stack) or a build team (GEO Standard).",
    bestFor:
      "Teams that want a versioned, open engineering standard they can measure against — not a slide deck.",
    switchIf: [
      "You need a testable spec with pass/fail thresholds, not a taxonomy.",
      "You want your framework score on a public scanner your CEO can run.",
      "You care about protocol discovery (MCP, agents.json, OAuth, markdown negotiation) — layer the 7-layer stack doesn't name.",
      "Your build team keeps asking 'what does this actually mean in code?'",
    ],
    stayIf: [
      "You already work with NP Digital on retainer and want a shared vocabulary with your consultant.",
      "You need agency delivery more than a framework — Neil's team ships the work; the GEO Standard is DIY.",
    ],
    rows: [
      { dimension: "Format", grow: "Open, versioned engineering spec (geo-standard@2026.05) — Markdown in git, CC BY 4.0", competitor: "Blog post + agency framework", growWins: true },
      { dimension: "Testable thresholds", grow: "Per-signal pass/fail with numeric targets", competitor: "Descriptive layers, no scoring rubric", growWins: true },
      { dimension: "Public scanner", grow: "/check scores any URL against the spec in ~10s", competitor: "Available inside NP Digital engagements", growWins: true },
      { dimension: "Number of layers / signals", grow: "6 signals: Semantic HTML, JSON-LD, llms.txt, Citability, Speed, Protocol Discovery", competitor: "7 layers: Technical SEO → Content → Structured Data → Authority → Distribution → Analytics → Measurement", growWins: false },
      { dimension: "Protocol discovery (MCP, OAuth, agents.json)", grow: "First-class signal", competitor: "Not addressed", growWins: true },
      { dimension: "Crawler matrix (search vs training bots)", grow: "Explicit §4 matrix, updated per engine", competitor: "General guidance", growWins: true },
      { dimension: "Grounded in original data", grow: "Backed by the 390-row Agent Readability Leaderboard", competitor: "Backed by NP Digital's 22-company cohort", growWins: false },
      { dimension: "Authority signals coverage", grow: "Covered under Citability, less depth than Neil's Authority layer", competitor: "Explicit Authority layer with PR / digital-PR playbook", growWins: false },
      { dimension: "Vendor lock-in", grow: "Zero — spec is CC BY 4.0, tools are free and open", competitor: "Framework is free; deep application typically routes through NP Digital services", growWins: true },
      { dimension: "Update cadence", grow: "Versioned, changelog in git", competitor: "Blog updates, no version pin", growWins: true },
    ],
    faqs: [
      {
        q: "Is the GEO Standard trying to replace Neil Patel's 7-Layer Stack?",
        a: "No. They're different artefacts. Neil's stack is a strategy taxonomy — useful for stakeholder alignment and agency conversations. The GEO Standard is an engineering contract — versioned, testable, and licensed for anyone to adopt. Most serious teams end up using both: the stack for the deck, the standard for the build.",
      },
      {
        q: "What's the biggest gap in the 7-Layer Stack that the GEO Standard closes?",
        a: "Protocol discovery. The GEO Standard treats MCP server cards, /.well-known/oauth-protected-resource, agents.json, markdown negotiation, and the Content-Signal header as a first-class signal — the frontier where citation gives way to direct agent tool use. The 7-Layer Stack doesn't name any of them yet.",
      },
      {
        q: "What does the 7-Layer Stack do better than the GEO Standard?",
        a: "Authority. Neil's Authority layer folds in digital PR, brand mentions, and third-party citations with concrete playbooks. The GEO Standard treats those under Citability but with less depth. If you need an outbound authority-building programme, borrow that layer from Neil's stack and layer it on top of GEO Standard compliance.",
      },
      {
        q: "Can I be compliant with both?",
        a: "Yes, and you should. Ship the GEO Standard as your engineering baseline (pass /check with ≥90/100), then use Neil's 7-layer taxonomy as the strategy framing when you present results upward.",
      },
      {
        q: "Where do the two frameworks actually disagree?",
        a: "On measurement. Neil's stack leans on prompt-volume analysis for prioritisation; the GEO Standard argues (with data at /stats/citation-probability-beats-prompt-volume) that citation probability beats prompt volume 4:1 as a strategy signal. Read both positions and pick the one your data supports.",
      },
    ],
  },
  {
    slug: "rover",
    competitor: "Rover (rtrvr.ai)",
    competitorDomain: "rtrvr.ai",
    category: "Agent execution runtime",
    tagline: "Rover installs a runtime. Grow ships a standard.",
    oneLiner:
      "Rover is a DOM-native SDK that site owners embed so agents can execute tasks on the site (A2W protocol, RoverBook analytics). Grow is a vendor-neutral standard (GEO Standard @2026.05) plus a free scanner, MCP server, and discovery matrix — no install required.",
    verdict:
      "Rover and Grow don't overlap head-to-head — Rover is a runtime, Grow is a standard. But they answer the same buyer question ('how do I make my site work for agents?') with opposite postures. Rover asks you to install a proprietary A2W endpoint and pay for analytics. Grow asks you to ship five open discovery signals (agent-card.json, mcp.json, llms.txt, in-page marker, visible badge) that every agent architecture already reads. Pick Rover if you want a hosted execution layer and are comfortable with a single-vendor dependency. Pick Grow if you want to be cited by ChatGPT, Perplexity, and Claude today without wiring an SDK.",
    bestFor:
      "Teams choosing between a hosted, opinionated agent runtime and a vendor-neutral engineering standard they can implement themselves in a day.",
    switchIf: [
      "You don't want a third-party JavaScript SDK loaded on every page.",
      "You need to be cited by ChatGPT, Perplexity, Claude, and Google AI today — none of which speak A2W.",
      "You want the discovery layer to be portable across vendors (agent-card.json, mcp.json, llms.txt are open specs).",
      "Your buyer asks 'is it a standard or a runtime?' and the honest answer needs to be 'standard'.",
    ],
    stayIf: [
      "You need agents to *execute* multi-step transactional workflows on your site (checkout, onboarding, form-filling) end-to-end today.",
      "You've already committed to Rover's runtime and want RoverBook's per-agent analytics.",
      "Your product is agent-executed workflows themselves, not agent-cited content.",
    ],
    rows: [
      { dimension: "Posture", grow: "Vendor-neutral engineering standard (geo-standard@2026.05)", competitor: "Proprietary runtime + SDK (@rtrvr-ai/rover)", growWins: true },
      { dimension: "License", grow: "Open — spec at /standard.md, MIT scanner", competitor: "FSL-1.1-Apache-2.0 (source-available, not OSI-approved)", growWins: true },
      { dimension: "Install required", grow: "None — five static files (agent-card.json, mcp.json, llms.txt, in-page marker, badge)", competitor: "npm i @rtrvr-ai/rover + owner install bundle + JS runtime on every page", growWins: true },
      { dimension: "Front door", grow: "Free public /check scanner scores any URL, no signup", competitor: "'Get a demo' — no public scoring tool", growWins: true },
      { dimension: "Discovery matrix", grow: "5 vendor-neutral signals, one per agent architecture (API / MCP / text / DOM / CUA)", competitor: "5 signals including proprietary /.well-known/rover-site.json", growWins: false },
      { dimension: "Agent identity", grow: "RFC 9421 HTTP Message Signatures + JWKS at /.well-known/jwks.json", competitor: "5 trust tiers (verified_signed → anonymous), RFC 9421 on roadmap", growWins: false },
      { dimension: "Execution layer", grow: "Deferred to MCP + OpenAPI (open protocols)", competitor: "A2W (proprietary, roadmap-to-IETF)", growWins: false },
      { dimension: "Per-agent analytics", grow: "Basic scan history + citation tracking", competitor: "RoverBook (11 event types, 8 agent-facing tools, per-vendor breakdown)", growWins: false },
      { dimension: "Coverage", grow: "Cited by ChatGPT, Perplexity, Claude, Google AI, Bing Copilot", competitor: "Cited by Rover-aware agents; universal only via fallbacks", growWins: true },
      { dimension: "WebBench score", grow: "N/A — not an execution benchmark", competitor: "81.4% (Rover claims #1)", growWins: false },
      { dimension: "Price", grow: "Free (scanner, standard, MCP server, WordPress plugin)", competitor: "Freemium — demo call for pricing", growWins: true },
      { dimension: "Time to compliance", grow: "1 day — copy five files, pass /check ≥90/100", competitor: "1–2 weeks — install SDK, configure shortcuts, wire discovery", growWins: true },
    ],
    faqs: [
      {
        q: "Is Rover a competitor or complementary?",
        a: "Structurally complementary, commercially adjacent. Their April 2026 protocol paper explicitly positions Rover as the execution layer that composes with MCP (Anthropic), A2A (Google), and Cloudflare's negotiation layer. The GEO Standard sits at the discovery + readability layer — a site can pass /check ≥90/100 and also embed Rover if it needs A2W execution. Most sites don't.",
      },
      {
        q: "Does the GEO Standard implement A2W?",
        a: "No. A2W is proprietary today (Rover's `POST /v1/a2w/runs` endpoint) with an IETF Internet-Draft on the roadmap. The GEO Standard defers execution to open protocols (MCP, OpenAPI, function calling) that every major agent already speaks. When A2W is standardised we'll add a signal for it — until then, embedding it means a single-vendor dependency.",
      },
      {
        q: "Rover claims 81.4% on WebBench. What's Grow's benchmark?",
        a: "Different games. WebBench measures how well an agent can complete multi-step tasks on a site. The GEO Standard measures how citation-ready a site is for text-first AI answers (ChatGPT, Perplexity, Claude, Google AI Overviews). If your KPI is 'agent executes a checkout on my site', Rover's number matters. If your KPI is 'ChatGPT cites me in an answer', /check's 100-point score matters more.",
      },
      {
        q: "Should I embed both?",
        a: "If you have a transactional flow that agents should execute (booking, checkout, onboarding), yes — Grow for discovery + citations, Rover for execution. If you're a marketing site, docs site, or content brand, Grow alone is enough and Rover's runtime is overhead.",
      },
      {
        q: "Is rtrvr.ai's /.well-known/rover-site.json a signal we should adopt?",
        a: "No. It's Rover-specific and only Rover-aware agents read it. The vendor-neutral equivalent is /.well-known/agent-card.json (A2A schema, works with any A2A/MCP client). We publish agent-card.json and score it as one of the 5 discovery matrix signals; a Rover-installed site would additionally publish rover-site.json for its own runtime.",
      },
      {
        q: "Where does Rover's thesis actually go further than ours?",
        a: "RoverBook — per-agent, per-site analytics with 11 tracked event types and per-vendor breakdowns (Anthropic vs OpenAI vs Google completion rates on your site). Nobody else has this data. If per-agent behavioural analytics are your priority, that's a real gap in the GEO Standard as it stands.",
      },
    ],
  },
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisons(): Comparison[] {
  return COMPARISONS;
}
