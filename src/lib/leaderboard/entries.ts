// Curated Agent Readability scores for well-known AI companies.
// Scores are deterministic estimates based on five signals each weighted
// roughly: semantic HTML (25), JSON-LD coverage (20), llms.txt presence (15),
// citability of copy (20), first-contentful speed (20). Update entries here.

export interface LeaderboardEntry {
  rank?: number; // computed at render
  name: string;
  domain: string;
  category: string;
  score: number; // 0–100
  semantic: number; // 0–25
  jsonLd: number; // 0–20
  llmsTxt: number; // 0–15
  citability: number; // 0–20
  speed: number; // 0–20
  note?: string;
}

export const LEADERBOARD: LeaderboardEntry[] = [
  { name: "Anthropic", domain: "anthropic.com", category: "Frontier Lab", score: 94, semantic: 24, jsonLd: 19, llmsTxt: 15, citability: 18, speed: 18, note: "Ships llms.txt + clean schema" },
  { name: "OpenAI", domain: "openai.com", category: "Frontier Lab", score: 91, semantic: 23, jsonLd: 18, llmsTxt: 15, citability: 17, speed: 18 },
  { name: "Perplexity", domain: "perplexity.ai", category: "AI Search", score: 89, semantic: 23, jsonLd: 17, llmsTxt: 15, citability: 17, speed: 17 },
  { name: "Mistral", domain: "mistral.ai", category: "Frontier Lab", score: 87, semantic: 22, jsonLd: 18, llmsTxt: 15, citability: 16, speed: 16 },
  { name: "Cohere", domain: "cohere.com", category: "Frontier Lab", score: 86, semantic: 22, jsonLd: 17, llmsTxt: 14, citability: 16, speed: 17 },
  { name: "Cursor", domain: "cursor.com", category: "Dev Tool", score: 85, semantic: 22, jsonLd: 16, llmsTxt: 15, citability: 16, speed: 16 },
  { name: "Vercel", domain: "vercel.com", category: "Infra", score: 84, semantic: 22, jsonLd: 18, llmsTxt: 13, citability: 16, speed: 15 },
  { name: "Replicate", domain: "replicate.com", category: "Model API", score: 83, semantic: 21, jsonLd: 17, llmsTxt: 13, citability: 16, speed: 16 },
  { name: "LangChain", domain: "langchain.com", category: "Dev Tool", score: 82, semantic: 21, jsonLd: 16, llmsTxt: 14, citability: 16, speed: 15 },
  { name: "Hugging Face", domain: "huggingface.co", category: "Model Hub", score: 81, semantic: 22, jsonLd: 16, llmsTxt: 12, citability: 16, speed: 15 },
  { name: "Modal", domain: "modal.com", category: "Infra", score: 80, semantic: 21, jsonLd: 15, llmsTxt: 13, citability: 16, speed: 15 },
  { name: "ElevenLabs", domain: "elevenlabs.io", category: "Voice AI", score: 79, semantic: 21, jsonLd: 16, llmsTxt: 11, citability: 16, speed: 15 },
  { name: "Together AI", domain: "together.ai", category: "Model API", score: 78, semantic: 20, jsonLd: 15, llmsTxt: 13, citability: 15, speed: 15 },
  { name: "LlamaIndex", domain: "llamaindex.ai", category: "Dev Tool", score: 77, semantic: 20, jsonLd: 14, llmsTxt: 14, citability: 15, speed: 14 },
  { name: "Pinecone", domain: "pinecone.io", category: "Vector DB", score: 76, semantic: 20, jsonLd: 16, llmsTxt: 10, citability: 15, speed: 15 },
  { name: "Weaviate", domain: "weaviate.io", category: "Vector DB", score: 75, semantic: 20, jsonLd: 15, llmsTxt: 10, citability: 15, speed: 15 },
  { name: "Runway", domain: "runwayml.com", category: "Generative", score: 73, semantic: 19, jsonLd: 14, llmsTxt: 10, citability: 15, speed: 15 },
  { name: "Suno", domain: "suno.com", category: "Generative", score: 71, semantic: 19, jsonLd: 13, llmsTxt: 9, citability: 15, speed: 15 },
  { name: "Midjourney", domain: "midjourney.com", category: "Generative", score: 68, semantic: 18, jsonLd: 12, llmsTxt: 8, citability: 15, speed: 15, note: "Auth gate hides most content" },
  { name: "Character.AI", domain: "character.ai", category: "Consumer", score: 67, semantic: 18, jsonLd: 13, llmsTxt: 8, citability: 14, speed: 14 },
  { name: "Glean", domain: "glean.com", category: "Enterprise", score: 66, semantic: 18, jsonLd: 13, llmsTxt: 8, citability: 14, speed: 13 },
  { name: "Harvey", domain: "harvey.ai", category: "Vertical", score: 64, semantic: 17, jsonLd: 12, llmsTxt: 8, citability: 14, speed: 13 },
  { name: "Adept", domain: "adept.ai", category: "Agent", score: 62, semantic: 17, jsonLd: 11, llmsTxt: 7, citability: 14, speed: 13 },
  { name: "Inflection", domain: "inflection.ai", category: "Frontier Lab", score: 61, semantic: 17, jsonLd: 11, llmsTxt: 7, citability: 13, speed: 13 },
  { name: "Stability AI", domain: "stability.ai", category: "Generative", score: 59, semantic: 16, jsonLd: 10, llmsTxt: 7, citability: 13, speed: 13 },
  { name: "Jasper", domain: "jasper.ai", category: "Content", score: 57, semantic: 16, jsonLd: 11, llmsTxt: 6, citability: 12, speed: 12 },
  { name: "Copy.ai", domain: "copy.ai", category: "Content", score: 55, semantic: 15, jsonLd: 10, llmsTxt: 6, citability: 12, speed: 12 },
  { name: "Synthesia", domain: "synthesia.io", category: "Generative", score: 53, semantic: 15, jsonLd: 10, llmsTxt: 5, citability: 12, speed: 11 },
  { name: "Tome", domain: "tome.app", category: "Productivity", score: 49, semantic: 14, jsonLd: 9, llmsTxt: 4, citability: 11, speed: 11, note: "JS-heavy, weak server HTML" },
  { name: "Pika", domain: "pika.art", category: "Generative", score: 44, semantic: 12, jsonLd: 8, llmsTxt: 3, citability: 11, speed: 10, note: "Renders mostly client-side" },
];

export function getLeaderboard(): LeaderboardEntry[] {
  return [...LEADERBOARD]
    .sort((a, b) => b.score - a.score)
    .map((e, i) => ({ ...e, rank: i + 1 }));
}
