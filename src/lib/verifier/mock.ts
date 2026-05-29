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
}

export interface Contradiction {
  id: string;
  domain_a: string;
  domain_b: string;
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
