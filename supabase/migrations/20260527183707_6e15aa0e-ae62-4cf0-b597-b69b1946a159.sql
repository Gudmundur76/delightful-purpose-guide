
CREATE TABLE public.content_briefs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site TEXT NOT NULL,
  title TEXT NOT NULL,
  topic TEXT,
  intent TEXT,
  audience TEXT,
  keywords TEXT[] NOT NULL DEFAULT '{}',
  content_type TEXT,
  target_word_count INTEGER,
  status TEXT NOT NULL DEFAULT 'open',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_briefs TO authenticated;
GRANT ALL ON public.content_briefs TO service_role;
ALTER TABLE public.content_briefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can view briefs" ON public.content_briefs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team can insert briefs" ON public.content_briefs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Team can update briefs" ON public.content_briefs FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Team can delete briefs" ON public.content_briefs FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role manages briefs" ON public.content_briefs FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

CREATE TABLE public.content_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brief_id UUID REFERENCES public.content_briefs(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  body_html TEXT NOT NULL DEFAULT '',
  seo_score SMALLINT,
  geo_score SMALLINT,
  aeo_score SMALLINT,
  overall_score SMALLINT,
  checks JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft',
  scheduled_for TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_drafts TO authenticated;
GRANT ALL ON public.content_drafts TO service_role;
ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can view drafts" ON public.content_drafts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team can insert drafts" ON public.content_drafts FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Team can update drafts" ON public.content_drafts FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Team can delete drafts" ON public.content_drafts FOR DELETE TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Service role manages drafts" ON public.content_drafts FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE INDEX idx_content_drafts_brief ON public.content_drafts(brief_id);
CREATE INDEX idx_content_drafts_status ON public.content_drafts(status);

CREATE TABLE public.agent_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_type TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output JSONB,
  status TEXT NOT NULL DEFAULT 'queued',
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT ON public.agent_runs TO authenticated;
GRANT ALL ON public.agent_runs TO service_role;
ALTER TABLE public.agent_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team can view agent runs" ON public.agent_runs FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY "Team can insert agent runs" ON public.agent_runs FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Service role manages agent runs" ON public.agent_runs FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');
CREATE INDEX idx_agent_runs_type_status ON public.agent_runs(agent_type, status);

CREATE TRIGGER trg_content_briefs_updated_at BEFORE UPDATE ON public.content_briefs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_content_drafts_updated_at BEFORE UPDATE ON public.content_drafts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
