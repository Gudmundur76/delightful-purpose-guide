-- ============================================================
-- Citation Intelligence Platform — Phase 1 schema
-- ============================================================

-- 1. companies ------------------------------------------------
CREATE TABLE public.companies (
  domain TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  logo_url TEXT,
  github_url TEXT,
  g2_url TEXT,
  stackoverflow_tag TEXT,
  description TEXT,
  claimed_by_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companies TO anon;
GRANT SELECT, UPDATE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Companies are public" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Authenticated users can claim unowned companies" ON public.companies
  FOR UPDATE TO authenticated
  USING (claimed_by_user_id IS NULL OR claimed_by_user_id = auth.uid())
  WITH CHECK (claimed_by_user_id = auth.uid());
CREATE POLICY "Service role manages companies" ON public.companies FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_companies_category ON public.companies(category);

-- 2. company_scores -------------------------------------------
CREATE TABLE public.company_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL REFERENCES public.companies(domain) ON DELETE CASCADE,
  scan_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  overall_ccs SMALLINT NOT NULL,
  canonical SMALLINT NOT NULL DEFAULT 0,
  precedent SMALLINT NOT NULL DEFAULT 0,
  authority SMALLINT NOT NULL DEFAULT 0,
  verifiability SMALLINT NOT NULL DEFAULT 0,
  commentary SMALLINT NOT NULL DEFAULT 0,
  information_gain SMALLINT NOT NULL DEFAULT 0,
  citation_probability SMALLINT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.company_scores TO anon, authenticated;
GRANT ALL ON public.company_scores TO service_role;
ALTER TABLE public.company_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Scores are public" ON public.company_scores FOR SELECT USING (true);
CREATE POLICY "Service role writes scores" ON public.company_scores FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE INDEX idx_company_scores_domain_date ON public.company_scores(domain, scan_date DESC);

-- 3. citations ------------------------------------------------
CREATE TABLE public.citations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL REFERENCES public.companies(domain) ON DELETE CASCADE,
  ai_engine TEXT NOT NULL,
  query_category TEXT,
  query_text TEXT,
  cited_url TEXT,
  position SMALLINT,
  confidence NUMERIC(4,3),
  cited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.citations TO anon, authenticated;
GRANT ALL ON public.citations TO service_role;
ALTER TABLE public.citations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Citations are public" ON public.citations FOR SELECT USING (true);
CREATE POLICY "Service role writes citations" ON public.citations FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE INDEX idx_citations_domain_date ON public.citations(domain, cited_at DESC);
CREATE INDEX idx_citations_engine ON public.citations(ai_engine, cited_at DESC);

-- 4. citation_history -----------------------------------------
CREATE TABLE public.citation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL REFERENCES public.companies(domain) ON DELETE CASCADE,
  month DATE NOT NULL,
  total_citations INTEGER NOT NULL DEFAULT 0,
  perplexity_share NUMERIC(5,2) NOT NULL DEFAULT 0,
  chatgpt_share NUMERIC(5,2) NOT NULL DEFAULT 0,
  claude_share NUMERIC(5,2) NOT NULL DEFAULT 0,
  google_aio_share NUMERIC(5,2) NOT NULL DEFAULT 0,
  volatility TEXT NOT NULL DEFAULT 'stable',
  UNIQUE (domain, month)
);
GRANT SELECT ON public.citation_history TO anon, authenticated;
GRANT ALL ON public.citation_history TO service_role;
ALTER TABLE public.citation_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "History is public" ON public.citation_history FOR SELECT USING (true);
CREATE POLICY "Service role writes history" ON public.citation_history FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE INDEX idx_citation_history_month ON public.citation_history(month DESC);

-- 5. authority_signals ----------------------------------------
CREATE TABLE public.authority_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL REFERENCES public.companies(domain) ON DELETE CASCADE,
  scan_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  g2_reviews INTEGER DEFAULT 0,
  github_stars INTEGER DEFAULT 0,
  stackoverflow_questions INTEGER DEFAULT 0,
  news_mentions INTEGER DEFAULT 0,
  reddit_mentions INTEGER DEFAULT 0,
  backlinks INTEGER DEFAULT 0
);
GRANT SELECT ON public.authority_signals TO anon, authenticated;
GRANT ALL ON public.authority_signals TO service_role;
ALTER TABLE public.authority_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authority signals public" ON public.authority_signals FOR SELECT USING (true);
CREATE POLICY "Service role writes authority" ON public.authority_signals FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE INDEX idx_authority_domain_date ON public.authority_signals(domain, scan_date DESC);

-- 6. content_analysis -----------------------------------------
CREATE TABLE public.content_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL REFERENCES public.companies(domain) ON DELETE CASCADE,
  scan_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  factual_density NUMERIC(5,2) DEFAULT 0,
  freshness_days INTEGER DEFAULT 0,
  expert_signals INTEGER DEFAULT 0,
  qa_blocks INTEGER DEFAULT 0,
  comparison_tables INTEGER DEFAULT 0,
  video_count INTEGER DEFAULT 0
);
GRANT SELECT ON public.content_analysis TO anon, authenticated;
GRANT ALL ON public.content_analysis TO service_role;
ALTER TABLE public.content_analysis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Content analysis public" ON public.content_analysis FOR SELECT USING (true);
CREATE POLICY "Service role writes content analysis" ON public.content_analysis FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE INDEX idx_content_domain_date ON public.content_analysis(domain, scan_date DESC);

-- 7. certifications -------------------------------------------
CREATE TABLE public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL REFERENCES public.companies(domain) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  issued_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  badge_url TEXT,
  paypal_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.certifications TO anon;
GRANT SELECT, INSERT, UPDATE ON public.certifications TO authenticated;
GRANT ALL ON public.certifications TO service_role;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Active certifications are public" ON public.certifications
  FOR SELECT USING (status = 'active' OR auth.uid() = user_id OR auth.role() = 'service_role');
CREATE POLICY "Users create own certifications" ON public.certifications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own certifications" ON public.certifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service role manages certifications" ON public.certifications FOR ALL
  USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE TRIGGER certifications_updated_at BEFORE UPDATE ON public.certifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_certifications_domain ON public.certifications(domain);
CREATE INDEX idx_certifications_user ON public.certifications(user_id);

-- ============================================================
-- Seed top companies (~30 flagship rows)
-- ============================================================
INSERT INTO public.companies (domain, name, category) VALUES
  ('anthropic.com','Anthropic','models'),
  ('openai.com','OpenAI','models'),
  ('perplexity.ai','Perplexity','agents'),
  ('mistral.ai','Mistral','models'),
  ('cohere.com','Cohere','models'),
  ('cursor.com','Cursor','devtools'),
  ('vercel.com','Vercel','infra'),
  ('replicate.com','Replicate','infra'),
  ('langchain.com','LangChain','devtools'),
  ('huggingface.co','Hugging Face','models'),
  ('modal.com','Modal','infra'),
  ('elevenlabs.io','ElevenLabs','models'),
  ('together.ai','Together AI','infra'),
  ('llamaindex.ai','LlamaIndex','devtools'),
  ('pinecone.io','Pinecone','infra'),
  ('weaviate.io','Weaviate','infra'),
  ('runwayml.com','Runway','models'),
  ('suno.com','Suno','models'),
  ('midjourney.com','Midjourney','models'),
  ('character.ai','Character.AI','agents'),
  ('glean.com','Glean','agents'),
  ('harvey.ai','Harvey','agents'),
  ('crusoe.ai','Crusoe','infra'),
  ('vast.ai','Vast.ai','infra'),
  ('fireworks.ai','Fireworks AI','infra'),
  ('cerebras.ai','Cerebras','infra'),
  ('sambanova.ai','SambaNova','infra'),
  ('groq.com','Groq','infra'),
  ('baseten.co','Baseten','infra'),
  ('coreweave.com','CoreWeave','infra')
ON CONFLICT (domain) DO NOTHING;

-- Seed initial company_scores derived from existing leaderboard values
INSERT INTO public.company_scores (domain, overall_ccs, canonical, precedent, authority, verifiability, commentary, information_gain, citation_probability) VALUES
  ('anthropic.com',94,92,88,95,90,85,82,78),
  ('openai.com',91,90,92,98,82,80,75,82),
  ('perplexity.ai',89,88,90,87,86,78,80,75),
  ('mistral.ai',87,86,75,82,84,72,70,62),
  ('cohere.com',86,85,72,78,82,70,68,58),
  ('cursor.com',85,84,80,80,78,75,72,65),
  ('vercel.com',84,88,82,88,76,82,70,68),
  ('replicate.com',83,82,70,75,80,68,72,55),
  ('langchain.com',82,80,78,85,76,80,68,62),
  ('huggingface.co',81,80,85,90,75,75,72,70),
  ('modal.com',80,80,65,72,78,65,68,52),
  ('elevenlabs.io',79,78,72,76,75,68,65,58),
  ('together.ai',78,77,68,72,74,65,62,50),
  ('llamaindex.ai',77,76,72,78,72,72,65,55),
  ('pinecone.io',76,76,68,74,72,68,62,52),
  ('weaviate.io',75,75,65,70,72,65,60,48),
  ('runwayml.com',73,72,75,78,68,65,62,55),
  ('suno.com',71,70,72,68,65,60,58,50),
  ('midjourney.com',68,65,80,82,60,58,55,52),
  ('character.ai',67,66,70,72,62,60,55,48),
  ('glean.com',66,65,55,68,68,55,52,38),
  ('harvey.ai',64,63,52,65,65,52,48,35),
  ('crusoe.ai',83,82,60,65,78,58,55,42),
  ('vast.ai',90,89,68,72,85,65,62,48),
  ('fireworks.ai',89,88,70,75,82,68,65,52),
  ('cerebras.ai',86,84,72,78,78,68,65,55),
  ('sambanova.ai',86,85,65,72,80,62,58,45),
  ('groq.com',57,56,75,82,52,72,60,55),
  ('baseten.co',72,71,55,62,68,55,52,38),
  ('coreweave.com',69,68,72,80,62,68,60,52);

-- Seed citation_history for current month
INSERT INTO public.citation_history (domain, month, total_citations, perplexity_share, chatgpt_share, claude_share, google_aio_share, volatility)
SELECT
  cs.domain,
  date_trunc('month', now())::date,
  GREATEST(10, (cs.citation_probability * 4))::int AS total_citations,
  ROUND((30 + (random() * 20))::numeric, 2) AS perplexity_share,
  ROUND((25 + (random() * 20))::numeric, 2) AS chatgpt_share,
  ROUND((15 + (random() * 15))::numeric, 2) AS claude_share,
  ROUND((10 + (random() * 15))::numeric, 2) AS google_aio_share,
  CASE WHEN cs.citation_probability > 65 THEN 'rising'
       WHEN cs.citation_probability < 45 THEN 'falling'
       ELSE 'stable' END AS volatility
FROM public.company_scores cs
ON CONFLICT (domain, month) DO NOTHING;