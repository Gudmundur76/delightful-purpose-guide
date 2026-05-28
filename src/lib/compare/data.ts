// Curated head-to-head comparison pairs drawn from the leaderboard.
// Each pair generates a /compare/{a}-vs-{b} page targeting the exact
// "X vs Y" agent-readability query. Pairs are picked for search intent:
// real categorical rivalries where buyers actually compare.

import { LEADERBOARD, type LeaderboardEntry } from "@/lib/leaderboard/entries";

export interface ComparePair {
  a: string; // domain
  b: string; // domain
}

// Hand-picked pairs that match real "X vs Y" queries in 2026.
export const FEATURED_PAIRS: ComparePair[] = [
  // Models
  { a: "anthropic.com", b: "openai.com" },
  { a: "mistral.ai", b: "openai.com" },
  { a: "cohere.com", b: "openai.com" },
  { a: "anthropic.com", b: "mistral.ai" },
  { a: "huggingface.co", b: "openai.com" },
  // Agents
  { a: "perplexity.ai", b: "openai.com" },
  { a: "perplexity.ai", b: "anthropic.com" },
  { a: "glean.com", b: "perplexity.ai" },
  { a: "harvey.ai", b: "glean.com" },
  // Dev tools
  { a: "cursor.com", b: "langchain.com" },
  { a: "langchain.com", b: "llamaindex.ai" },
  { a: "cursor.com", b: "anthropic.com" },
  // Infra
  { a: "vercel.com", b: "replicate.com" },
  { a: "modal.com", b: "replicate.com" },
  { a: "together.ai", b: "replicate.com" },
  { a: "pinecone.io", b: "weaviate.io" },
  { a: "modal.com", b: "vercel.com" },
  // Media models
  { a: "runwayml.com", b: "midjourney.com" },
  { a: "suno.com", b: "elevenlabs.io" },
  { a: "stability.ai", b: "midjourney.com" },
  // Cross-category
  { a: "anthropic.com", b: "perplexity.ai" },
  { a: "vercel.com", b: "modal.com" },
  { a: "huggingface.co", b: "replicate.com" },
  { a: "cursor.com", b: "openai.com" },
];

export function parsePairSlug(slug: string): { aDomain: string; bDomain: string } | null {
  const idx = slug.indexOf("-vs-");
  if (idx < 0) return null;
  const a = slug.slice(0, idx);
  const b = slug.slice(idx + 4);
  if (!a || !b) return null;
  return { aDomain: domainFromSlug(a), bDomain: domainFromSlug(b) };
}

export function pairToSlug(aDomain: string, bDomain: string): string {
  return `${slugFromDomain(aDomain)}-vs-${slugFromDomain(bDomain)}`;
}

export function slugFromDomain(d: string): string {
  return d.toLowerCase().replace(/\./g, "-");
}

export function domainFromSlug(s: string): string {
  // Reverse: known TLDs → dot
  return s.toLowerCase().replace(/-(com|ai|io|co|dev|app|net|org|tech|sh)$/, ".$1");
}

export function findEntry(domain: string): LeaderboardEntry | undefined {
  const target = domain.toLowerCase();
  return LEADERBOARD.find((e) => e.domain.toLowerCase() === target);
}

export function getFeaturedPairsWithEntries(): Array<{
  slug: string;
  a: LeaderboardEntry;
  b: LeaderboardEntry;
}> {
  return FEATURED_PAIRS.map((p) => {
    const a = findEntry(p.a);
    const b = findEntry(p.b);
    if (!a || !b) return null;
    return { slug: pairToSlug(p.a, p.b), a, b };
  }).filter(Boolean) as Array<{ slug: string; a: LeaderboardEntry; b: LeaderboardEntry }>;
}
