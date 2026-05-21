// Static blog data. Add new posts here — they'll appear at /blog
// and at /blog/<slug> automatically.

export interface BlogPost {
  slug: string;
  title: string;
  description: string; // used as meta description + listing excerpt
  publishedAt: string; // ISO date
  readingMinutes: number;
  tags: string[];
  // Body is plain HTML-ish JSX. Keep it simple — paragraphs as strings, with
  // optional headings prefixed by "## " and lists prefixed by "- ".
  body: string;
}

export const POSTS: BlogPost[] = [
  {
    slug: "what-is-an-agent-native-website",
    title: "What Is an Agent-Native Website? A Definition for 2026",
    description:
      "Agent-native websites are built so AI agents — ChatGPT, Perplexity, Claude — can read, understand, and cite them. Here's the definition, the stack, and why it matters now.",
    publishedAt: "2026-05-20",
    readingMinutes: 7,
    tags: ["agent native website", "ai seo", "llm citation"],
    body: `An agent-native website is one engineered so AI agents — ChatGPT, Perplexity, Claude, Gemini — can parse it, understand it, and cite it back to users. It's the natural successor to "mobile-first" and "SEO-optimized." The audience expanded; the craft hasn't caught up.\n\n## The short definition\n\nAn agent-native website ships three things the average site doesn't:\n\n- **Semantic HTML** that describes meaning, not just layout — real headings, lists, articles, sections\n- **JSON-LD structured data** on every meaningful page — Organization, Article, Product, FAQPage, Service\n- **An /llms.txt file** that gives agents a clean, plain-text map of the site\n\nIf an LLM crawler can pull your page, identify the entity, and quote it without guessing — you're agent-native. If it has to render JavaScript, parse a div soup, and infer your pricing from a marketing paragraph — you're not.\n\n## Why this matters now\n\nReferral traffic patterns are shifting. ChatGPT, Perplexity, and Google's AI Overviews now answer questions inline instead of sending a click. The sites that get named in those answers are the ones agents can confidently cite. Citation is the new ranking.\n\nThis isn't speculative. Perplexity publishes its sources. ChatGPT links them when browsing. Claude cites them. Whether you show up in those citations depends almost entirely on how machine-readable your site is.\n\n## The agent-native stack\n\n- HTML: server-rendered, semantic, with a clear single H1 per page\n- Metadata: per-page title + description + OpenGraph, never one generic root tag\n- Structured data: JSON-LD for every entity type the page represents\n- /llms.txt: a markdown summary at the root, listing services, pricing, and key URLs\n- /robots.txt: explicit Allow for GPTBot, ClaudeBot, PerplexityBot, Google-Extended\n- Sitemap: accurate lastmod dates, every public route listed\n\n## What it isn't\n\nIt isn't a plugin. It isn't a template. It isn't keyword stuffing for robots. Agent-native sites read better for humans because the discipline that makes them legible to machines — clear hierarchy, plain language, structured facts — also makes them legible to readers.\n\n## How to check yours\n\nFetch your homepage with curl and read the raw HTML. If you can answer "what does this company do, what does it cost, and how do I contact them" without rendering JavaScript, an agent can too. If you can't, neither can ChatGPT.`,
  },
  {
    slug: "llms-txt-optimization-guide",
    title: "llms.txt Optimization: The Complete Guide for 2026",
    description:
      "How to write an /llms.txt file that AI agents actually use. Format, structure, what to include, and the mistakes that make agents skip your site.",
    publishedAt: "2026-05-18",
    readingMinutes: 8,
    tags: ["llms.txt optimization", "llms.txt", "ai seo"],
    body: `An /llms.txt file is a plain-text markdown summary of your site, served at the root, designed for large language models to read. Think of it as robots.txt for meaning instead of permissions. Done right, it's the single highest-leverage SEO file you'll ship in 2026.\n\n## The format\n\nllms.txt lives at https://yourdomain.com/llms.txt. It's markdown. It starts with an H1 (your site name) followed by a blockquote summary, then sections for About, Services, Pricing, Pages, and Contact. No HTML, no JavaScript, no images. Just structured text.\n\n## What to include\n\n- A blockquote summary under the H1 — agents quote this verbatim\n- Pricing in plain numbers — $2,400 not "starting at low four figures"\n- Every public URL — agents won't infer them from a sitemap\n- Contact + response time — turns citations into leads\n- A content license line — explicit permission for AI systems to cite you\n\n## What to leave out\n\n- Marketing fluff ("revolutionary," "synergy," "industry-leading")\n- Internal jargon and product codenames\n- Login URLs, admin paths, checkout success pages\n- Anything that contradicts your actual website — agents notice\n\n## Common mistakes\n\n1. Serving HTML instead of plain text — set Content-Type: text/plain or just ship a static file in /public\n2. Linking to a sitemap.xml and calling it done — sitemap is for crawlers, llms.txt is for understanding\n3. Forgetting to update it — stale pricing in llms.txt becomes wrong citations everywhere\n4. Hiding it behind auth or a CDN that requires JS — agents fetch with simple HTTP; if curl can't get it, neither can they\n\n## How to test it\n\nAsk ChatGPT: "Read https://yourdomain.com/llms.txt and summarize what this company does." If the summary matches your positioning, your file works. If it confabulates or pulls outdated info, fix the file.\n\n## The strategic point\n\nllms.txt isn't a ranking trick. It's a contract between your brand and the agents that increasingly mediate how customers find you. Sites that ship a clean llms.txt today are training the corpus of how their category gets described tomorrow.`,
  },
  {
    slug: "semantic-html-agency-why-it-matters",
    title: "Semantic HTML Is the New SEO: Why Agencies Are Rebuilding the Web",
    description:
      "Div soup is dying. Semantic HTML — real headings, articles, sections, lists — is what makes a site readable by humans, search engines, and AI agents alike.",
    publishedAt: "2026-05-15",
    readingMinutes: 6,
    tags: ["semantic website design", "semantic html", "agent native"],
    body: `Open the source of most marketing sites and you'll find a forest of div and span tags. It renders fine. It also tells crawlers and AI agents nothing about what's actually on the page. That's the bug semantic HTML fixes — and why a small wave of agencies are rebuilding sites around it.\n\n## What semantic HTML actually means\n\nIt's the difference between a styled div and an h1. Between a card div and an article. Between a wall of divs and a clear outline: header, nav, main, section, article, aside, footer.\n\nThose tags are not decoration. They're the API your site exposes to every non-human reader: screen readers, Google, ChatGPT, Perplexity. When the tags match the meaning, machines understand the page. When they don't, machines guess — and guesses don't get cited.\n\n## Why this is back\n\nFor a decade, semantic HTML was a nice-to-have because Google was good enough at inferring structure from CSS classes. AI agents are not. They tokenize raw HTML and look for landmarks. A page built on h1 → h2 → p is a clean signal. A page built on styled divs is noise.\n\nThe sites that get cited by ChatGPT, Perplexity, and Claude share a common trait: a parser can extract the structure without rendering. Semantic HTML is what makes that possible.\n\n## The semantic checklist\n\n- One h1 per page, matching the page topic\n- Headings nest correctly — no skipping from h1 to h4\n- main wraps the unique page content\n- Lists are ul or ol, not divs with bullets\n- Articles use article with a clear h2 headline\n- Forms have labels tied to inputs by for/id\n- Images have meaningful alt text — or empty alt if decorative\n\n## What an agency does differently\n\nA semantic-first agency builds the document outline before the visual design. The wireframe is an HTML tree, not a Figma frame. Tailwind classes go on top of the right element, not in place of it. The result reads as well in a browser's reader mode as it does in production.\n\nThis discipline is what separates an "agent-native" build from a pretty template. Both look fine. Only one gets cited.\n\n## The compounding return\n\nSemantic HTML pays off three times: accessibility scores rise, organic search picks up, and AI agents start naming you in answers. None of those are line items. All of them are leverage.`,
  },
  {
    slug: "startup-web-design-agency-what-to-look-for",
    title: "How to Pick a Startup Web Design Agency",
    description:
      "A founder's checklist for hiring a startup web design agency: scope, pricing, turnaround, and 5 red flags that signal scope creep.",
    publishedAt: "2026-05-12",
    readingMinutes: 6,
    tags: ["startup web design agency", "hiring", "founders"],
    body: `Most early-stage founders don't need a "branding partner." You need a site that converts, loads fast, and ships before your next investor update. Here's how to filter agencies for that reality.\n\n## The 3 questions that cut the shortlist in half\n\nBefore scheduling a single intro call, send these in an email:\n\n- What is your fixed price and turnaround for a 5-page marketing site?\n- Do you write custom code, or assemble templates in a page builder?\n- Who owns the codebase after launch?\n\nIf you get vague answers, hourly rates, or "it depends" — move on. Real productized agencies have a number and a date.\n\n## Pricing model matters more than the price\n\nHourly billing punishes you for changing your mind. Day-rate retainers punish you for being decisive. Fixed-price, scope-bounded work aligns incentives: the agency wants to ship fast, you know the bill upfront.\n\n## Red flags\n\n- A discovery phase longer than the build phase\n- No live design review until week 3\n- "We'll send a proposal next week" (next week becomes never)\n- Stock-template-looking portfolio with logo swaps\n- Refuses to commit to a launch date in writing\n\n## Green flags\n\n- Public portfolio with live URLs you can inspect\n- Lighthouse scores above 90 across the board\n- A written launch date in the SOW\n- Hands you a git repo, not a CMS login\n\n## What "48 hours" actually means\n\nA 48-hour delivery isn't a rushed build — it's a tightly scoped one. You bring brand assets and content; the agency brings a battle-tested component system. Anything outside that scope (custom illustrations, multi-language, complex CMS) gets quoted separately.\n\nIf your timeline is "this quarter," shop for monthly retainers. If your timeline is "before our launch tweet on Friday," shop productized.`,
  },
  {
    slug: "saas-website-design-conversion-essentials",
    title: "SaaS Website Design: 7 Sections That Convert",
    description:
      "A pragmatic anatomy of a high-converting SaaS website — what each section should do, what to cut, and the conversion benchmarks to beat.",
    publishedAt: "2026-05-08",
    readingMinutes: 7,
    tags: ["saas website design", "conversion", "landing pages"],
    body: `Most SaaS sites look the same because most SaaS sites get the same advice. Here's the stripped-down version: 7 sections, in order, with one job each.\n\n## 1. Hero — answer "what + who" in 3 seconds\n\nHeadline says what the product is. Subheadline says who it's for. Primary CTA goes to signup, not a demo form. If a visitor can't repeat your value prop after one scroll, the hero failed.\n\n## 2. Social proof bar — borrow credibility immediately\n\nLogos of customers, investors, or press. No testimonials yet — too early in the scroll. Greyscale, small, above the fold or right below it.\n\n## 3. The problem section — name the pain in their words\n\nOne sentence per pain point. If you're describing the persona's Monday morning, you're doing it right. If you're describing your features, restart.\n\n## 4. The product, shown not told\n\nAnnotated product screenshots or a short looping video. Real UI, real data — not Figma mockups. Each visual should map to a pain point from section 3.\n\n## 5. Features grid — but only 3-6 of them\n\nGroup features by outcome, not by module. "Ship faster" beats "CLI tool." Resist the urge to list everything; the changelog is for that.\n\n## 6. Pricing — visible, with a recommended tier\n\nHiding pricing behind "Contact sales" loses self-serve revenue. If you have to gate it, at least show starting price and what's included. Mark one tier as "Most popular" — it lifts conversion 10-30% by itself.\n\n## 7. Final CTA — single, large, unmistakable\n\nNo nav, no footer links, no "Or read our blog." One action: start trial / book demo / sign up. The footer comes after.\n\n## Benchmarks to beat\n\n- Time-to-first-meaningful-paint under 1.5s\n- Hero CTA click rate above 8%\n- Pricing-page-to-signup above 12%\n\nIf you're below any of these, the design is leaking money — not the ads.`,
  },
  {
    slug: "landing-page-design-service-vs-diy-builder",
    title: "Landing Page Service vs DIY Builder: When to Switch",
    description:
      "Webflow, Framer, and Squarespace are great — until they aren't. When DIY builders stop scaling and a landing page service pays for itself.",
    publishedAt: "2026-05-03",
    readingMinutes: 5,
    tags: ["landing page design service", "webflow", "framer", "diy"],
    body: `DIY builders are the right answer for a lot of stages. The problem is staying on them past the point where they cost you more than they save.\n\n## The honest case for DIY\n\nPre-revenue, pre-team, pre-traffic — Framer or Webflow lets you ship something today. Templates are fine. Iteration is free. Don't hire an agency to build your first landing page; you don't know what you want yet.\n\n## The signals it's time to switch\n\nYou're hitting the ceiling of DIY when:\n\n- You're paying $40-80/month per editor seat and have 3+ editors\n- Page load times are above 2.5s and you've already enabled every optimization\n- You need A/B testing the builder doesn't natively support\n- Your team spends 4+ hours per week wrestling the CMS instead of writing copy\n- You want analytics, experiments, or integrations the platform locks behind enterprise tiers\n- The brand has outgrown the template and every customization fights the editor\n\n## What a landing page design service gives you that DIY doesn't\n\nCustom code means: real performance budgets, no platform tax, full control over the DOM for SEO, and components built around your data — not your data forced into someone else's components.\n\nYou also get a designer who has shipped 50+ landing pages thinking about your funnel, instead of you guessing which template will convert.\n\n## The hybrid play\n\nKeep the marketing site on DIY for speed of iteration. Move the high-stakes conversion pages — pricing, signup, top-of-funnel ad landers — to custom code. That's where 80% of your revenue passes through, and where DIY's compromises cost the most.\n\nWhen the marketing site itself slows you down more than it speeds you up, migrate the whole thing.`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}
