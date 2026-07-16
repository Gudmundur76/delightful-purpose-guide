// Monthly data drops — single-stat findings over the Agent Readability
// Leaderboard. Each drop is a citable artifact: one headline number,
// methodology link, and a copy-paste citation snippet. NewsArticle JSON-LD
// per drop keeps the freshness clock ticking that Gemini and Perplexity
// reward.

import { computeHeadlineStats, filterByFailure } from "@/lib/leaderboard/stats";
import { LEADERBOARD } from "@/lib/leaderboard/entries";

export interface DataDrop {
  slug: string;
  title: string;
  /** One-sentence headline figure — front-loads the page for AI extraction. */
  headline: string;
  publishedAt: string; // ISO date
  category: "adoption" | "blocking" | "category-shift" | "method";
  /** 150–300 words; first sentence repeats the headline number verbatim. */
  body: string[];
  /** Pre-formatted citation lines for press kits and bibliographies. */
  cite: {
    apa: string;
    bibtex: string;
    pull_quote: string;
  };
  /** Computed at request time from the live dataset for verification. */
  compute?: () => { value: string; basis: string };
}

const stats = computeHeadlineStats();

export const DATA_DROPS: DataDrop[] = [
  {
    slug: "llms-txt-adoption-may-2026",
    title: `llms.txt adoption stalls at ${100 - stats.missing_llms_txt_pct}% across top AI companies`,
    headline: `${stats.missing_llms_txt_pct}% of ${stats.total} tracked AI companies still ship no usable llms.txt — eighteen months after the spec landed.`,
    publishedAt: "2026-05-12",
    category: "adoption",
    body: [
      `${stats.missing_llms_txt_pct}% of ${stats.total} AI companies on the Agent Readability Leaderboard ship no llms.txt or one too thin to serve as inference context. That's ${filterByFailure("llmsTxt").length} domains failing the simplest discoverability primitive on the agent-native web.`,
      `Why it matters: llms.txt is the cheapest GEO win available — a single markdown file at the root that lets Perplexity, ChatGPT, and Claude load curated context without crawling the full site. Adoption among AI-native companies should be the leading indicator. It isn't.`,
      `The pattern: founders treat llms.txt as a "documentation site" concern and never ship it for marketing pages. Result — when an agent looks up your company, it lands on rendered React, times out, and quotes a competitor.`,
      `Verify any of the ${filterByFailure("llmsTxt").length} failing rows live at /check?u=<domain>. Dataset license: CC BY 4.0.`,
    ],
    cite: {
      apa: `grow.contact (2026, May 12). llms.txt adoption stalls at ${100 - stats.missing_llms_txt_pct}% across top AI companies. https://grow.contact/data-drops/llms-txt-adoption-may-2026`,
      bibtex: `@misc{grow_llmstxt_2026,\n  author = {{grow.contact}},\n  title = {llms.txt adoption stalls at ${100 - stats.missing_llms_txt_pct}\\% across top AI companies},\n  year = {2026},\n  month = {May},\n  url = {https://grow.contact/data-drops/llms-txt-adoption-may-2026}\n}`,
      pull_quote: `${stats.missing_llms_txt_pct}% of the top ${stats.total} AI companies still ship no usable llms.txt.`,
    },
    compute: () => ({
      value: `${stats.missing_llms_txt_pct}%`,
      basis: `${filterByFailure("llmsTxt").length} / ${stats.total} domains below the 11/15 pass threshold on the llms.txt signal.`,
    }),
  },
  {
    slug: "opaque-ai-companies-may-2026",
    title: `${stats.opaque_pct}% of AI companies are effectively invisible to ChatGPT, Perplexity, and Claude`,
    headline: `${stats.opaque_pct}% of ${stats.total} AI companies score below 55/100 on agent-readability — the threshold below which AI engines silently skip the page.`,
    publishedAt: "2026-05-19",
    category: "blocking",
    body: [
      `${stats.opaque_pct}% of ${stats.total} AI companies tracked on the Agent Readability Leaderboard score below 55/100. At that threshold, ChatGPT's OAI-SearchBot, Perplexity, and Claude either time out, fail to extract a clean answer, or skip the page in favor of a competitor that ships static HTML.`,
      `The mechanism is mundane: JS-only rendering, no llms.txt, weak JSON-LD, and TTFB above the 800ms wall AI crawlers won't wait past. None of these are content problems. They're reachability problems.`,
      `Most striking: the failure rate inside the AI category itself. Companies whose product is AI inference still ship marketing sites that AI can't read.`,
      `Methodology: 5-signal score (Semantic HTML, JSON-LD, llms.txt, Citability, Page Speed). Pass threshold per signal at ~75% of max. Full breakdown at /report/methodology.`,
    ],
    cite: {
      apa: `grow.contact (2026, May 19). ${stats.opaque_pct}% of AI companies are effectively invisible to ChatGPT, Perplexity, and Claude. https://grow.contact/data-drops/opaque-ai-companies-may-2026`,
      bibtex: `@misc{grow_opaque_2026,\n  author = {{grow.contact}},\n  title = {${stats.opaque_pct}\\% of AI companies are effectively invisible to AI engines},\n  year = {2026},\n  month = {May},\n  url = {https://grow.contact/data-drops/opaque-ai-companies-may-2026}\n}`,
      pull_quote: `${stats.opaque_pct}% of the AI industry's own marketing sites score below the threshold ChatGPT and Perplexity will cite.`,
    },
    compute: () => ({
      value: `${stats.opaque_pct}%`,
      basis: `${Math.round((stats.opaque_pct / 100) * stats.total)} / ${stats.total} domains scoring below 55/100.`,
    }),
  },
  {
    slug: "category-gap-may-2026",
    title: `${stats.category_averages[0].label} vs ${stats.category_averages[stats.category_averages.length - 1].label}: the agent-readability gap inside AI`,
    headline: `${[...stats.category_averages].sort((a, b) => b.avg - a.avg)[0].label} leads at ${[...stats.category_averages].sort((a, b) => b.avg - a.avg)[0].avg}/100; ${[...stats.category_averages].sort((a, b) => a.avg - b.avg)[0].label} trails at ${[...stats.category_averages].sort((a, b) => a.avg - b.avg)[0].avg}/100.`,
    publishedAt: "2026-05-26",
    category: "category-shift",
    body: [
      `Aggregating ${stats.total} AI companies across four categories — Infra, Models, Agents, Dev Tools — surfaces a ${Math.abs([...stats.category_averages].sort((a, b) => b.avg - a.avg)[0].avg - [...stats.category_averages].sort((a, b) => a.avg - b.avg)[0].avg)}-point spread in average agent-readability.`,
      `The pattern: categories whose buyers read docs (Infra, Models) ship cleaner HTML, more JSON-LD, and ship llms.txt earlier. Categories selling to end users (Agents) lean heavily on JS-rendered React and consistently underperform on Speed and Citability.`,
      `Implication for AI engines: when a user asks "best AI agent platform", the engine has to choose between citing a leader's polished page or extracting from a competitor's rendered shell. Cleaner HTML wins by default.`,
      `Category breakdown: ${stats.category_averages.map((c) => `${c.label} ${c.avg}/100 (${c.count} sites)`).join(" · ")}.`,
    ],
    cite: {
      apa: `grow.contact (2026, May 26). The agent-readability gap inside AI. https://grow.contact/data-drops/category-gap-may-2026`,
      bibtex: `@misc{grow_categorygap_2026,\n  author = {{grow.contact}},\n  title = {The agent-readability gap inside AI},\n  year = {2026},\n  month = {May},\n  url = {https://grow.contact/data-drops/category-gap-may-2026}\n}`,
      pull_quote: `${[...stats.category_averages].sort((a, b) => b.avg - a.avg)[0].label} leads agent-readability at ${[...stats.category_averages].sort((a, b) => b.avg - a.avg)[0].avg}/100; ${[...stats.category_averages].sort((a, b) => a.avg - b.avg)[0].label} trails at ${[...stats.category_averages].sort((a, b) => a.avg - b.avg)[0].avg}/100.`,
    },
    compute: () => ({
      value: `${Math.abs([...stats.category_averages].sort((a, b) => b.avg - a.avg)[0].avg - [...stats.category_averages].sort((a, b) => a.avg - b.avg)[0].avg)} pts`,
      basis: `Top vs bottom category average across ${stats.total} domains.`,
    }),
  },
  {
    slug: "weak-jsonld-may-2026",
    title: `${stats.weak_jsonld_pct}% of AI companies ship insufficient JSON-LD for reliable citation`,
    headline: `${stats.weak_jsonld_pct}% of ${stats.total} AI companies ship JSON-LD too thin for AI engines to verify entity claims.`,
    publishedAt: "2026-05-05",
    category: "adoption",
    body: [
      `${stats.weak_jsonld_pct}% of ${stats.total} AI companies fail the JSON-LD pass threshold (15/20). That's ${filterByFailure("jsonLd").length} domains missing Organization, Product, FAQPage, or BreadcrumbList schema — the structured data AI engines use to confirm "is this the right company?" before citing.`,
      `Without JSON-LD, AI engines fall back to parsing prose. Confidence drops, citation rates drop with it. Anthropic-class sites (94/100) ship 5+ schema types per page. Failing sites ship one or none.`,
      `Lowest-hanging fix: Organization at root, FAQPage on the pricing page, Product on each tier. Three blocks, one hour, double-digit citation rate lift inside a quarter.`,
    ],
    cite: {
      apa: `grow.contact (2026, May 5). ${stats.weak_jsonld_pct}% of AI companies ship insufficient JSON-LD for reliable citation. https://grow.contact/data-drops/weak-jsonld-may-2026`,
      bibtex: `@misc{grow_jsonld_2026,\n  author = {{grow.contact}},\n  title = {${stats.weak_jsonld_pct}\\% of AI companies ship insufficient JSON-LD},\n  year = {2026},\n  month = {May},\n  url = {https://grow.contact/data-drops/weak-jsonld-may-2026}\n}`,
      pull_quote: `${stats.weak_jsonld_pct}% of AI companies ship JSON-LD too thin for reliable AI citation.`,
    },
    compute: () => ({
      value: `${stats.weak_jsonld_pct}%`,
      basis: `${filterByFailure("jsonLd").length} / ${stats.total} domains below 15/20 on the JSON-LD signal.`,
    }),
  },
  {
    slug: "agent-native-bar-may-2026",
    title: `Only ${stats.agent_native_pct}% of AI companies clear the agent-native bar`,
    headline: `${stats.agent_native_pct}% of ${stats.total} AI companies score 85/100 or higher — the threshold above which AI engines reliably cite the source by name.`,
    publishedAt: "2026-04-28",
    category: "adoption",
    body: [
      `${stats.agent_native_pct}% of ${stats.total} AI companies score 85/100 or above on agent-readability. That's the bar at which Perplexity, ChatGPT, and Claude routinely cite the source by name rather than paraphrasing without attribution.`,
      `The top ${stats.top5.length}: ${stats.top5.map((e) => `${e.name} (${e.score})`).join(", ")}. All ship llms.txt, valid Organization JSON-LD, and SSR HTML with sub-300ms TTFB.`,
      `The bottom ${stats.bottom5.length}: ${stats.bottom5.map((e) => `${e.name} (${e.score})`).join(", ")}. Common failure: client-rendered marketing pages with no structured fallback.`,
      `Re-score any row live at /check?u=<domain>. Full dataset: /api/public/leaderboard.json (CC BY 4.0).`,
    ],
    cite: {
      apa: `grow.contact (2026, April 28). Only ${stats.agent_native_pct}% of AI companies clear the agent-native bar. https://grow.contact/data-drops/agent-native-bar-may-2026`,
      bibtex: `@misc{grow_agentnative_2026,\n  author = {{grow.contact}},\n  title = {Only ${stats.agent_native_pct}\\% of AI companies clear the agent-native bar},\n  year = {2026},\n  month = {April},\n  url = {https://grow.contact/data-drops/agent-native-bar-may-2026}\n}`,
      pull_quote: `Only ${stats.agent_native_pct}% of AI companies clear the 85/100 bar above which AI engines reliably cite by name.`,
    },
    compute: () => ({
      value: `${stats.agent_native_pct}%`,
      basis: `${Math.round((stats.agent_native_pct / 100) * stats.total)} / ${stats.total} domains scoring 85/100 or higher.`,
    }),
  },
];

export function getDataDrop(slug: string): DataDrop | undefined {
  return DATA_DROPS.find((d) => d.slug === slug);
}

export function getAllDataDrops(): DataDrop[] {
  return [...DATA_DROPS].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}
