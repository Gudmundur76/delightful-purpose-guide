// Mock data for The Verifier — replace with real API/Supabase queries later.
// Shape mirrors the planned claims/contradictions/evidence_chains tables.

export type TruthLabel = "verified" | "partial" | "unverifiable";

export interface Claim {
  id: string;
  domain: string;
  company_name: string;
  claim_text: string;
  claim_category: string;
  truth_score: number;
  truth_label: TruthLabel;
  source_url: string;
  methodology_notes?: string;
  reproducible: boolean;
  evidence?: EvidenceLink[];
  scan_date?: string;
}

export interface EvidenceLink {
  source_url: string;
  source_type: "docs" | "benchmark" | "github" | "blog" | "third-party";
  excerpt: string;
}

export interface Contradiction {
  id: string;
  domain_a: string;
  domain_b: string;
  company_a: string;
  company_b: string;
  claim_a: string;
  claim_b: string;
  category: string;
  analysis: string;
  confidence: number;
}

export const TRENDING_QUERIES = [
  "Best vector database 2026",
  "Claude vs GPT-5 reasoning",
  "Is Pinecone's latency true?",
  "Cheapest LLM API",
  "Fastest embeddings model",
];

export const VERIFIER_STATS = {
  companies: 390,
  claims: 2400,
  verified: 847,
  contradictions: 12,
};

// --- Search result mock: "What is the best vector database?" ---

export const SEARCH_RESULT = {
  query: "What is the best vector database?",
  answer:
    "There is no single 'best' vector database — performance depends on workload. Weaviate publishes the lowest reproducible p99 latency (8ms) on the ANN-Benchmarks suite [1]. Pinecone advertises 12ms but does not publish a reproducible methodology [2]. Qdrant leads on cost-per-million-queries with open-source self-hosting [3]. For most teams in 2026, Weaviate offers the strongest verifiable performance claims, while Qdrant wins on price transparency.",
  claims: [
    {
      id: "c-w-1",
      domain: "weaviate.io",
      company_name: "Weaviate",
      claim_text: "Achieves p99 query latency of 8ms on the ANN-Benchmarks SIFT-1M dataset.",
      claim_category: "performance",
      truth_score: 92,
      truth_label: "verified" as TruthLabel,
      source_url: "https://weaviate.io/blog/ann-benchmarks-2026",
      methodology_notes: "Reproducible script published, hardware specified.",
      reproducible: true,
    },
    {
      id: "c-p-1",
      domain: "pinecone.io",
      company_name: "Pinecone",
      claim_text: "World's fastest vector database at 12ms p99 latency.",
      claim_category: "performance",
      truth_score: 41,
      truth_label: "unverifiable" as TruthLabel,
      source_url: "https://www.pinecone.io/learn/performance",
      methodology_notes: "No dataset, hardware, or methodology disclosed.",
      reproducible: false,
    },
    {
      id: "c-q-1",
      domain: "qdrant.tech",
      company_name: "Qdrant",
      claim_text: "Lowest cost per million queries among managed vector DBs ($0.04).",
      claim_category: "pricing",
      truth_score: 78,
      truth_label: "verified" as TruthLabel,
      source_url: "https://qdrant.tech/benchmarks/",
      methodology_notes: "Pricing pulled from public price sheet; benchmark spec provided.",
      reproducible: true,
    },
    {
      id: "c-c-1",
      domain: "chroma.com",
      company_name: "Chroma",
      claim_text: "Embedded mode handles 10M vectors on a single laptop.",
      claim_category: "scalability",
      truth_score: 67,
      truth_label: "verified" as TruthLabel,
      source_url: "https://docs.trychroma.com/benchmarks",
      methodology_notes: "Verified on M2 MacBook Pro, 32GB. Throughput degrades above 8M.",
      reproducible: true,
    },
    {
      id: "c-m-1",
      domain: "milvus.io",
      company_name: "Milvus",
      claim_text: "Scales to 1 billion vectors with sub-100ms recall.",
      claim_category: "scalability",
      truth_score: 71,
      truth_label: "partial" as TruthLabel,
      source_url: "https://milvus.io/docs/benchmark.md",
      methodology_notes: "Benchmark uses 8-node cluster; single-node numbers not provided.",
      reproducible: false,
    },
  ] as Claim[],
  contradiction: {
    id: "contra-fastest-vdb",
    domain_a: "pinecone.io",
    domain_b: "weaviate.io",
    company_a: "Pinecone",
    company_b: "Weaviate",
    claim_a: "12ms p99 latency — world's fastest vector database.",
    claim_b: "8ms p99 latency on ANN-Benchmarks SIFT-1M.",
    category: "performance",
    analysis:
      "Both companies claim to be the fastest. Only Weaviate's claim is verifiable — they publish dataset, hardware, and a reproducible script. Pinecone's 12ms figure has no methodology attached and could not be reproduced.",
    confidence: 88,
  } as Contradiction,
  related: [
    "Which vector DB has the best recall@10?",
    "Is Pinecone serverless cheaper than Weaviate?",
    "Open-source vs managed vector databases — what's the real cost?",
  ],
};

// --- Company profile mock: weaviate.io ---

export const COMPANY_PROFILE = {
  domain: "weaviate.io",
  name: "Weaviate",
  tagline: "Open-source vector database for AI-native applications.",
  truth_score: 89,
  stats: {
    total: 24,
    verified: 18,
    unverifiable: 4,
    contradictions: 2,
  },
  score_history: [
    { date: "Mar 01", score: 71 },
    { date: "Mar 15", score: 74 },
    { date: "Apr 01", score: 78 },
    { date: "Apr 15", score: 80 },
    { date: "May 01", score: 83 },
    { date: "May 15", score: 85 },
    { date: "May 29", score: 89 },
  ],
  claims: [
    {
      id: "w-1",
      domain: "weaviate.io",
      company_name: "Weaviate",
      claim_text: "8ms p99 query latency on ANN-Benchmarks SIFT-1M.",
      claim_category: "performance",
      truth_score: 92,
      truth_label: "verified" as TruthLabel,
      source_url: "https://weaviate.io/blog/ann-benchmarks-2026",
      methodology_notes: "Reproducible benchmark script published with hardware spec.",
      reproducible: true,
      scan_date: "2026-05-22",
      evidence: [
        {
          source_url: "https://github.com/weaviate/weaviate-benchmarking",
          source_type: "github" as const,
          excerpt: "Public benchmark harness with Docker setup, dataset loader, and result CSVs.",
        },
        {
          source_url: "https://ann-benchmarks.com/",
          source_type: "third-party" as const,
          excerpt: "Independent ANN-Benchmarks results corroborate sub-10ms p99 on SIFT-1M.",
        },
      ],
    },
    {
      id: "w-2",
      domain: "weaviate.io",
      company_name: "Weaviate",
      claim_text: "Fully open source under BSD-3 license.",
      claim_category: "licensing",
      truth_score: 100,
      truth_label: "verified" as TruthLabel,
      source_url: "https://github.com/weaviate/weaviate/blob/main/LICENSE",
      methodology_notes: "License file present in repo root.",
      reproducible: true,
      scan_date: "2026-05-20",
    },
    {
      id: "w-3",
      domain: "weaviate.io",
      company_name: "Weaviate",
      claim_text: "Supports hybrid search (vector + keyword BM25) out of the box.",
      claim_category: "features",
      truth_score: 95,
      truth_label: "verified" as TruthLabel,
      source_url: "https://weaviate.io/developers/weaviate/search/hybrid",
      methodology_notes: "Documented API; reproduced in test environment.",
      reproducible: true,
      scan_date: "2026-05-18",
    },
    {
      id: "w-4",
      domain: "weaviate.io",
      company_name: "Weaviate",
      claim_text: "Scales linearly to 10 billion vectors on managed cloud.",
      claim_category: "scalability",
      truth_score: 58,
      truth_label: "partial" as TruthLabel,
      source_url: "https://weaviate.io/pricing",
      methodology_notes: "Largest published reference customer is at 2.3B vectors. 10B is theoretical.",
      reproducible: false,
      scan_date: "2026-05-15",
    },
    {
      id: "w-5",
      domain: "weaviate.io",
      company_name: "Weaviate",
      claim_text: "SOC 2 Type II certified.",
      claim_category: "compliance",
      truth_score: 88,
      truth_label: "verified" as TruthLabel,
      source_url: "https://weaviate.io/security",
      methodology_notes: "Certificate dated 2025-11; renewal in progress.",
      reproducible: true,
      scan_date: "2026-05-10",
    },
    {
      id: "w-6",
      domain: "weaviate.io",
      company_name: "Weaviate",
      claim_text: "Zero-downtime upgrades across all tiers.",
      claim_category: "operations",
      truth_score: 34,
      truth_label: "unverifiable" as TruthLabel,
      source_url: "https://weaviate.io/blog/zero-downtime",
      methodology_notes: "Free tier excluded per fine print; claim doesn't hold universally.",
      reproducible: false,
      scan_date: "2026-05-05",
    },
    {
      id: "w-7",
      domain: "weaviate.io",
      company_name: "Weaviate",
      claim_text: "Native support for 12 embedding providers including OpenAI, Cohere, and Voyage.",
      claim_category: "integrations",
      truth_score: 96,
      truth_label: "verified" as TruthLabel,
      source_url: "https://weaviate.io/developers/weaviate/modules",
      methodology_notes: "All 12 modules verified in source tree.",
      reproducible: true,
      scan_date: "2026-05-02",
    },
  ] as Claim[],
  qa: [
    {
      q: "Is Weaviate actually the fastest vector database?",
      a: "On the SIFT-1M benchmark with the configurations they publish, yes — 8ms p99 is reproducible. On other datasets and workloads, results vary.",
    },
    {
      q: "Can I self-host Weaviate in production?",
      a: "Yes. The core is BSD-3 licensed and runs in Docker or Kubernetes. The managed cloud adds SLAs and zero-downtime upgrades on paid tiers.",
    },
    {
      q: "How does Weaviate compare to Pinecone on cost?",
      a: "Weaviate's serverless tier is roughly 30% cheaper at 100M vectors based on public pricing. Pinecone wins below 1M vectors on the starter plan.",
    },
    {
      q: "Does Weaviate support hybrid search natively?",
      a: "Yes. Hybrid (vector + BM25) is a first-class API and one of their strongest verified claims.",
    },
    {
      q: "Is the 10 billion vector scale claim true?",
      a: "Partially. It's architecturally possible but the largest publicly referenced deployment is 2.3B vectors. Treat the 10B number as a ceiling, not a track record.",
    },
  ],
};

// --- Leaderboard mock: 20 companies ---

export interface LeaderboardEntry {
  domain: string;
  name: string;
  category: string;
  truth_score: number;
  claims_analyzed: number;
  verified: number;
  unverifiable: number;
  contradictions: number;
}

export const LEADERBOARD_DATA: LeaderboardEntry[] = [
  { domain: "weaviate.io", name: "Weaviate", category: "Infrastructure", truth_score: 89, claims_analyzed: 24, verified: 18, unverifiable: 4, contradictions: 2 },
  { domain: "qdrant.tech", name: "Qdrant", category: "Infrastructure", truth_score: 84, claims_analyzed: 19, verified: 14, unverifiable: 3, contradictions: 2 },
  { domain: "pinecone.io", name: "Pinecone", category: "Infrastructure", truth_score: 52, claims_analyzed: 21, verified: 8, unverifiable: 11, contradictions: 2 },
  { domain: "milvus.io", name: "Milvus", category: "Infrastructure", truth_score: 71, claims_analyzed: 16, verified: 10, unverifiable: 4, contradictions: 2 },
  { domain: "chroma.com", name: "Chroma", category: "Infrastructure", truth_score: 76, claims_analyzed: 14, verified: 9, unverifiable: 4, contradictions: 1 },
  { domain: "anthropic.com", name: "Anthropic", category: "Models", truth_score: 82, claims_analyzed: 31, verified: 22, unverifiable: 7, contradictions: 2 },
  { domain: "openai.com", name: "OpenAI", category: "Models", truth_score: 68, claims_analyzed: 38, verified: 21, unverifiable: 13, contradictions: 4 },
  { domain: "google.com", name: "Google DeepMind", category: "Models", truth_score: 74, claims_analyzed: 29, verified: 18, unverifiable: 8, contradictions: 3 },
  { domain: "meta.ai", name: "Meta AI", category: "Models", truth_score: 61, claims_analyzed: 22, verified: 11, unverifiable: 9, contradictions: 2 },
  { domain: "cohere.com", name: "Cohere", category: "Models", truth_score: 79, claims_analyzed: 17, verified: 12, unverifiable: 4, contradictions: 1 },
  { domain: "langchain.com", name: "LangChain", category: "Agents", truth_score: 73, claims_analyzed: 15, verified: 10, unverifiable: 4, contradictions: 1 },
  { domain: "crewai.com", name: "CrewAI", category: "Agents", truth_score: 58, claims_analyzed: 12, verified: 5, unverifiable: 5, contradictions: 2 },
  { domain: "autogen.ai", name: "AutoGen", category: "Agents", truth_score: 66, claims_analyzed: 13, verified: 7, unverifiable: 4, contradictions: 2 },
  { domain: "vercel.com", name: "Vercel", category: "DevTools", truth_score: 77, claims_analyzed: 20, verified: 14, unverifiable: 4, contradictions: 2 },
  { domain: "github.com", name: "GitHub Copilot", category: "DevTools", truth_score: 70, claims_analyzed: 25, verified: 15, unverifiable: 7, contradictions: 3 },
  { domain: "snowflake.com", name: "Snowflake", category: "Data", truth_score: 81, claims_analyzed: 18, verified: 13, unverifiable: 4, contradictions: 1 },
  { domain: "databricks.com", name: "Databricks", category: "Data", truth_score: 75, claims_analyzed: 23, verified: 15, unverifiable: 6, contradictions: 2 },
  { domain: "cloudflare.com", name: "Cloudflare", category: "Security", truth_score: 86, claims_analyzed: 16, verified: 13, unverifiable: 2, contradictions: 1 },
  { domain: "crowdstrike.com", name: "CrowdStrike", category: "Security", truth_score: 78, claims_analyzed: 14, verified: 10, unverifiable: 3, contradictions: 1 },
  { domain: "boston-dynamics.com", name: "Boston Dynamics", category: "Robotics", truth_score: 72, claims_analyzed: 11, verified: 7, unverifiable: 3, contradictions: 1 },
  { domain: "insilico.ai", name: "Insilico Medicine", category: "Biotech", truth_score: 65, claims_analyzed: 9, verified: 5, unverifiable: 3, contradictions: 1 },
];

export const LEADERBOARD_CATEGORIES = [
  "All",
  "Infrastructure",
  "Models",
  "Agents",
  "DevTools",
  "Data",
  "Security",
  "Robotics",
  "Biotech",
];

// --- Contradictions mock: 8 entries ---

export const CONTRADICTIONS_DATA: Contradiction[] = [
  {
    id: "con-1",
    domain_a: "pinecone.io",
    domain_b: "weaviate.io",
    company_a: "Pinecone",
    company_b: "Weaviate",
    claim_a: "World's fastest vector database at 12ms p99 latency.",
    claim_b: "Achieves p99 query latency of 8ms on ANN-Benchmarks SIFT-1M.",
    category: "performance",
    analysis:
      "Both companies claim to be the fastest. Only Weaviate's claim is verifiable — they publish dataset, hardware, and a reproducible script. Pinecone's 12ms figure has no methodology attached.",
    confidence: 88,
  },
  {
    id: "con-2",
    domain_a: "openai.com",
    domain_b: "anthropic.com",
    company_a: "OpenAI",
    company_b: "Anthropic",
    claim_a: "GPT-5 achieves 92% on the MMLU-Pro benchmark.",
    claim_b: "Claude 4 achieves 94% on the MMLU-Pro benchmark.",
    category: "performance",
    analysis:
      "Both claim state-of-the-art MMLU-Pro scores. Anthropic publishes the evaluation harness and prompt template. OpenAI's score is from a press release with no reproducible details.",
    confidence: 85,
  },
  {
    id: "con-3",
    domain_a: "langchain.com",
    domain_b: "crewai.com",
    company_a: "LangChain",
    company_b: "CrewAI",
    claim_a: "The most popular open-source agent framework with 100k+ GitHub stars.",
    claim_b: "The fastest-growing agent framework, surpassing LangChain in weekly downloads.",
    category: "market",
    analysis:
      "LangChain has more total stars but CrewAI's npm weekly downloads overtook LangChain's in March 2026. Both claims are partially true depending on the metric.",
    confidence: 72,
  },
  {
    id: "con-4",
    domain_a: "meta.ai",
    domain_b: "cohere.com",
    company_a: "Meta AI",
    company_b: "Cohere",
    claim_a: "Llama 3 is the most capable openly available model at 405B parameters.",
    claim_b: "Command R+ outperforms all open-weight models on enterprise retrieval tasks.",
    category: "performance",
    analysis:
      "Meta leads on raw parameter count and general benchmarks. Cohere's Command R+ wins on RAG-specific evaluations. The 'best' depends on the use case.",
    confidence: 79,
  },
  {
    id: "con-5",
    domain_a: "snowflake.com",
    domain_b: "databricks.com",
    company_a: "Snowflake",
    company_b: "Databricks",
    claim_a: "The most efficient data warehouse for AI workloads.",
    claim_b: "3x faster than Snowflake on TPC-DS at half the cost.",
    category: "pricing",
    analysis:
      "Databricks publishes TPC-DS results with configuration details. Snowflake's claim is marketing language with no benchmark attachment.",
    confidence: 91,
  },
  {
    id: "con-6",
    domain_a: "vercel.com",
    domain_b: "github.com",
    company_a: "Vercel",
    company_b: "GitHub",
    claim_a: "Zero-config deployments with the fastest build times.",
    claim_b: "GitHub Actions builds are 40% faster than Vercel for monorepos.",
    category: "performance",
    analysis:
      "Vercel excels for Next.js single apps. GitHub Actions wins for large monorepos with caching. Both claims are true in their respective contexts.",
    confidence: 68,
  },
  {
    id: "con-7",
    domain_a: "milvus.io",
    domain_b: "qdrant.tech",
    company_a: "Milvus",
    company_b: "Qdrant",
    claim_a: "The only vector database that scales to 10 billion vectors.",
    claim_b: "Proven 5 billion vector deployments in production.",
    category: "scalability",
    analysis:
      "Milvus's 10B claim is theoretical with no public reference deployment. Qdrant's 5B is backed by a named customer case study.",
    confidence: 82,
  },
  {
    id: "con-8",
    domain_a: "google.com",
    domain_b: "openai.com",
    company_a: "Google DeepMind",
    company_b: "OpenAI",
    claim_a: "Gemini 2.5 Pro is the first model to solve IMO geometry problems.",
    claim_b: "o4-mini is the first model to achieve a gold-medal equivalent on IMO 2024.",
    category: "performance",
    analysis:
      "Google's claim refers to geometry specifically. OpenAI's claim refers to the full IMO 2024. Both are technically true but frame different achievements.",
    confidence: 75,
  },
];
