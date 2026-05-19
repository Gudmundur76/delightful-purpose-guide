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
    slug: "startup-web-design-agency-what-to-look-for",
    title: "How to Pick a Startup Web Design Agency",
    description:
      "A founder's checklist for hiring a startup web design agency: scope, pricing model, turnaround, and the 5 red flags that signal a 6-week project becoming a 6-month one.",
    publishedAt: "2026-05-12",
    readingMinutes: 6,
    tags: ["startup web design agency", "hiring", "founders"],
    body: `Most early-stage founders don't need a "branding partner." You need a site that converts, loads fast, and ships before your next investor update. Here's how to filter agencies for that reality.\n\n## The 3 questions that cut the shortlist in half\n\nBefore scheduling a single intro call, send these in an email:\n\n- What is your fixed price and turnaround for a 5-page marketing site?\n- Do you write custom code, or assemble templates in a page builder?\n- Who owns the codebase after launch?\n\nIf you get vague answers, hourly rates, or "it depends" — move on. Real productized agencies have a number and a date.\n\n## Pricing model matters more than the price\n\nHourly billing punishes you for changing your mind. Day-rate retainers punish you for being decisive. Fixed-price, scope-bounded work aligns incentives: the agency wants to ship fast, you know the bill upfront.\n\n## Red flags\n\n- A discovery phase longer than the build phase\n- No live design review until week 3\n- "We'll send a proposal next week" (next week becomes never)\n- Stock-template-looking portfolio with logo swaps\n- Refuses to commit to a launch date in writing\n\n## Green flags\n\n- Public portfolio with live URLs you can inspect\n- Lighthouse scores above 90 across the board\n- A written launch date in the SOW\n- Hands you a git repo, not a CMS login\n\n## What "48 hours" actually means\n\nA 48-hour delivery isn't a rushed build — it's a tightly scoped one. You bring brand assets and content; the agency brings a battle-tested component system. Anything outside that scope (custom illustrations, multi-language, complex CMS) gets quoted separately.\n\nIf your timeline is "this quarter," shop for monthly retainers. If your timeline is "before our launch tweet on Friday," shop productized.`,
  },
  {
    slug: "saas-website-design-conversion-essentials",
    title: "SaaS Website Design: The 7 Sections That Actually Convert",
    description:
      "A pragmatic anatomy of a high-converting SaaS website — what each section should do, what to cut, and the conversion benchmarks to beat.",
    publishedAt: "2026-05-08",
    readingMinutes: 7,
    tags: ["saas website design", "conversion", "landing pages"],
    body: `Most SaaS sites look the same because most SaaS sites get the same advice. Here's the stripped-down version: 7 sections, in order, with one job each.\n\n## 1. Hero — answer "what + who" in 3 seconds\n\nHeadline says what the product is. Subheadline says who it's for. Primary CTA goes to signup, not a demo form. If a visitor can't repeat your value prop after one scroll, the hero failed.\n\n## 2. Social proof bar — borrow credibility immediately\n\nLogos of customers, investors, or press. No testimonials yet — too early in the scroll. Greyscale, small, above the fold or right below it.\n\n## 3. The problem section — name the pain in their words\n\nOne sentence per pain point. If you're describing the persona's Monday morning, you're doing it right. If you're describing your features, restart.\n\n## 4. The product, shown not told\n\nAnnotated product screenshots or a short looping video. Real UI, real data — not Figma mockups. Each visual should map to a pain point from section 3.\n\n## 5. Features grid — but only 3-6 of them\n\nGroup features by outcome, not by module. "Ship faster" beats "CLI tool." Resist the urge to list everything; the changelog is for that.\n\n## 6. Pricing — visible, with a recommended tier\n\nHiding pricing behind "Contact sales" loses self-serve revenue. If you have to gate it, at least show starting price and what's included. Mark one tier as "Most popular" — it lifts conversion 10-30% by itself.\n\n## 7. Final CTA — single, large, unmistakable\n\nNo nav, no footer links, no "Or read our blog." One action: start trial / book demo / sign up. The footer comes after.\n\n## Benchmarks to beat\n\n- Time-to-first-meaningful-paint under 1.5s\n- Hero CTA click rate above 8%\n- Pricing-page-to-signup above 12%\n\nIf you're below any of these, the design is leaking money — not the ads.`,
  },
  {
    slug: "landing-page-design-service-vs-diy-builder",
    title: "Landing Page Design Service vs DIY Builder: When to Switch",
    description:
      "Webflow, Framer, and Squarespace are great — until they aren't. A clear-eyed look at when DIY page builders stop scaling and a landing page design service pays for itself.",
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
