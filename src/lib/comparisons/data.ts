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
];

export function getComparison(slug: string): Comparison | undefined {
  return COMPARISONS.find((c) => c.slug === slug);
}

export function getAllComparisons(): Comparison[] {
  return COMPARISONS;
}
