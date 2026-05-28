
CREATE TABLE public.client_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  toolkit TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  connection_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (client_id, toolkit)
);

CREATE INDEX idx_client_integrations_client ON public.client_integrations (client_id);
CREATE INDEX idx_client_integrations_toolkit_status ON public.client_integrations (toolkit, status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_integrations TO authenticated;
GRANT ALL ON public.client_integrations TO service_role;

ALTER TABLE public.client_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view integrations"
  ON public.client_integrations FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can insert integrations"
  ON public.client_integrations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can update integrations"
  ON public.client_integrations FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Team members can delete integrations"
  ON public.client_integrations FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Service role manages integrations"
  ON public.client_integrations FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER update_client_integrations_updated_at
  BEFORE UPDATE ON public.client_integrations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
