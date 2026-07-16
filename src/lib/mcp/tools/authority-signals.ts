import { defineTool } from "mcp-tanstack-start";
import { z } from "zod";

// Pre-collected G2 data for known AI companies. Unknown domains return null.
const G2_SEED: Record<string, { review_count: number | null; rating: number | null; category: string | null }> = {
  "anthropic.com": { review_count: 308, rating: 4.6, category: "AI Chatbots" },
  "openai.com": { review_count: 1000, rating: 4.7, category: "AI Chatbots" },
  "ai.meta.com": { review_count: 3, rating: 4.7, category: "AI" },
  "x.ai": { review_count: 16, rating: 4.4, category: "AI Chatbots" },
  "deepseek.com": { review_count: 14, rating: 4.6, category: "AI Chatbots" },
  "cursor.com": { review_count: 100, rating: 4.8, category: "AI Coding Assistants" },
  "vercel.com": { review_count: 128, rating: 4.7, category: "Cloud Platform" },
  "replicate.com": { review_count: 1, rating: 5.0, category: "ML" },
  "langchain.com": { review_count: 40, rating: 4.7, category: "AI Infrastructure" },
  "llamaindex.ai": { review_count: 2, rating: 4.8, category: "AI Infrastructure" },
  "huggingface.co": { review_count: 5, rating: 4.9, category: "ML" },
  "elevenlabs.io": { review_count: 1136, rating: 4.5, category: "Text-to-Speech" },
  "pinecone.io": { review_count: 39, rating: 4.5, category: "Vector Database" },
  "weaviate.io": { review_count: 29, rating: 4.6, category: "Vector Database" },
  "qdrant.tech": { review_count: 12, rating: 4.5, category: "Vector Database" },
  "chroma.com": { review_count: 6, rating: 4.2, category: "Vector Database" },
  "milvus.io": { review_count: 65, rating: 4.7, category: "Vector Database" },
  "supabase.com": { review_count: 42, rating: 4.7, category: "Backend-as-a-Service" },
  "neon.tech": { review_count: 4, rating: 4.8, category: "Database" },
  "snyk.io": { review_count: 134, rating: 4.5, category: "Security" },
  "datadoghq.com": { review_count: 859, rating: 4.4, category: "Observability" },
  "posthog.com": { review_count: 1040, rating: 4.5, category: "Product Analytics" },
  "amplitude.com": { review_count: 3673, rating: 4.5, category: "Product Analytics" },
  "grafana.com": { review_count: 159, rating: 4.5, category: "Observability" },
  "honeycomb.io": { review_count: 19, rating: 4.7, category: "Observability" },
  "arize.com": { review_count: 28, rating: 4.2, category: "AI Observability" },
  "braintrust.dev": { review_count: 685, rating: 4.4, category: "AI Platform" },
};

// Normalization constants — global maxes from the 50-company dataset.
const MAX_STARS = 884_648;
const MAX_FORKS = 149_891;
const MAX_REPOS = 1_181;
const MAX_NEWS = 2_500;
const MAX_HN = 1_443;
const MAX_SO = 12_055;
const MAX_G2 = 3_673;

const normalize = (val: number | null | undefined, max: number): number => {
  if (!val || max === 0) return 0;
  return Math.min(100, Math.max(0, (val / max) * 100));
};

export function calculateAuthorityScore(opts: {
  githubStars: number;
  githubForks: number;
  githubRepos: number;
  soQuestions: number | null;
  hnSubmissions: number | null;
  g2Reviews: number | null;
  g2Rating: number | null;
  newsMentions: number | null;
}): number {
  const starsScore = normalize(opts.githubStars, MAX_STARS);
  const forksScore = normalize(opts.githubForks, MAX_FORKS);
  const reposScore = normalize(opts.githubRepos, MAX_REPOS);
  const newsScore = normalize(opts.newsMentions, MAX_NEWS);
  const hnScore = normalize(opts.hnSubmissions, MAX_HN);
  const soScore = normalize(opts.soQuestions, MAX_SO);
  const g2CountScore = normalize(opts.g2Reviews, MAX_G2);
  const g2RatingScore = opts.g2Rating ? (opts.g2Rating / 5) * 100 : 0;

  const githubScore = starsScore * 0.5 + forksScore * 0.3 + reposScore * 0.2;
  const score =
    githubScore * 0.3 +
    newsScore * 0.25 +
    hnScore * 0.2 +
    soScore * 0.15 +
    g2CountScore * 0.05 +
    g2RatingScore * 0.05;
  return Math.round(score * 100) / 100;
}

const UA = { "User-Agent": "grow.contact-mcp/1.0" };

async function safeFetch(url: string, init?: RequestInit): Promise<Response | null> {
  try {
    const res = await fetch(url, { ...init, headers: { ...UA, ...(init?.headers ?? {}) } });
    return res;
  } catch {
    return null;
  }
}

async function findGithubOrg(domain: string, hint?: string): Promise<string | null> {
  if (hint) return hint;
  const guess = domain.replace(/\.(com|io|ai|co|dev|app|org|net|xyz|so|sh|tech)$/i, "");
  const res = await safeFetch(`https://api.github.com/orgs/${guess}`);
  if (res?.ok) return guess;
  const search = await safeFetch(
    `https://api.github.com/search/users?q=${encodeURIComponent(guess)}+type:org&per_page=1`,
  );
  if (!search?.ok) return null;
  const data = (await search.json()) as { items?: Array<{ login: string }> };
  return data.items?.[0]?.login ?? null;
}

async function fetchGithub(org: string) {
  const orgRes = await safeFetch(`https://api.github.com/orgs/${org}`);
  if (!orgRes?.ok) return null;
  const orgData = (await orgRes.json()) as { public_repos?: number };
  const totalRepos = orgData.public_repos ?? 0;
  // Sample top repos by stars (first page = up to 100)
  const reposRes = await safeFetch(
    `https://api.github.com/orgs/${org}/repos?per_page=100&sort=updated`,
  );
  let stars = 0;
  let forks = 0;
  let primaryLanguage: string | null = null;
  const langCounts: Record<string, number> = {};
  if (reposRes?.ok) {
    const repos = (await reposRes.json()) as Array<{
      stargazers_count: number;
      forks_count: number;
      language: string | null;
    }>;
    for (const r of repos) {
      stars += r.stargazers_count ?? 0;
      forks += r.forks_count ?? 0;
      if (r.language) langCounts[r.language] = (langCounts[r.language] ?? 0) + 1;
    }
    primaryLanguage =
      Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  }
  return {
    org_url: `https://github.com/${org}`,
    total_stars: stars,
    total_forks: forks,
    total_repos: totalRepos,
    primary_language: primaryLanguage,
    has_docs_folder: false, // expensive to detect; left false in v1
    stars_percentile: Math.round((stars / MAX_STARS) * 100 * 100) / 100,
  };
}

async function fetchStackOverflow(name: string) {
  const tag = name.replace(/\s+/g, "-").toLowerCase();
  const res = await safeFetch(
    `https://api.stackexchange.com/2.3/tags/${encodeURIComponent(tag)}/info?site=stackoverflow`,
  );
  if (!res?.ok) return { tag: null, count: null };
  const data = (await res.json()) as { items?: Array<{ count: number; name: string }> };
  const item = data.items?.[0];
  return item ? { tag: item.name, count: item.count } : { tag: null, count: null };
}

async function fetchHackerNews(domain: string): Promise<number | null> {
  const since = Math.floor(Date.now() / 1000) - 365 * 24 * 3600;
  const res = await safeFetch(
    `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(domain)}&numericFilters=created_at_i>${since}&hitsPerPage=0`,
  );
  if (!res?.ok) return null;
  const data = (await res.json()) as { nbHits?: number };
  return data.nbHits ?? null;
}

async function fetchNewsMentions(name: string): Promise<number | null> {
  const res = await safeFetch(
    `https://news.google.com/rss/search?q=${encodeURIComponent(name)}+when:1y&hl=en-US&gl=US&ceid=US:en`,
  );
  if (!res?.ok) return null;
  const xml = await res.text();
  const matches = xml.match(/<item>/g);
  return matches ? matches.length : 0;
}

function normalizeDomain(input: string): string {
  return input.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

export async function gatherAuthoritySignals(domain: string, githubOrg?: string) {
  const d = normalizeDomain(domain);
  const name = d.split(".")[0];
  const [orgLogin, so, hn, news] = await Promise.all([
    findGithubOrg(d, githubOrg),
    fetchStackOverflow(name),
    fetchHackerNews(d),
    fetchNewsMentions(name),
  ]);
  const github = orgLogin
    ? await fetchGithub(orgLogin)
    : {
        org_url: null as string | null,
        total_stars: 0,
        total_forks: 0,
        total_repos: 0,
        primary_language: null as string | null,
        has_docs_folder: false,
        stars_percentile: 0,
      };
  const g2 = G2_SEED[d] ?? { review_count: null, rating: null, category: null };
  const authority_score = calculateAuthorityScore({
    githubStars: github?.total_stars ?? 0,
    githubForks: github?.total_forks ?? 0,
    githubRepos: github?.total_repos ?? 0,
    soQuestions: so.count,
    hnSubmissions: hn,
    g2Reviews: g2.review_count,
    g2Rating: g2.rating,
    newsMentions: news,
  });
  return {
    domain: d,
    authority_score,
    github: github ?? null,
    community: {
      stackoverflow_tag: so.tag,
      stackoverflow_questions: so.count,
      hackernews_submissions_12m: hn,
    },
    reviews: {
      g2_url: g2.review_count ? `https://www.g2.com/search?query=${encodeURIComponent(name)}` : null,
      g2_review_count: g2.review_count,
      g2_rating: g2.rating,
      g2_category: g2.category,
    },
    media: { news_mentions_12m: news },
    scored_at: new Date().toISOString(),
  };
}

export const checkAuthoritySignalsTool = defineTool({
  name: "check_authority_signals",
  description:
    "Fetch and compute authority signals (GitHub, Stack Overflow, Hacker News, G2, news) for a domain. Returns an authority_score (0-100) — the #1 predictor of AI citation frequency. No paid API keys required.",
  parameters: z.object({
    domain: z.string().min(3).max(255).describe("Domain, e.g. anthropic.com"),
    github_org: z.string().optional().describe("Optional GitHub org login (skips search)"),
  }),
  execute: async ({ domain, github_org }) => {
    const result = await gatherAuthoritySignals(domain, github_org);
    return JSON.stringify(result, null, 2);
  },
});
