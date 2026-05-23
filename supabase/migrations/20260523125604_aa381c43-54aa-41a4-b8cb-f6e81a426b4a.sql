-- Create clients table
CREATE TABLE public.clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    domain text,
    notes text,
    created_by uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Team members can CRUD clients
CREATE POLICY "Team members can view clients"
ON public.clients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Team members can create clients"
ON public.clients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Team members can update clients"
ON public.clients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Team members can delete clients"
ON public.clients FOR DELETE TO authenticated USING (true);

-- Add client association to scans
ALTER TABLE public.scans ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL;
ALTER TABLE public.scans ADD COLUMN created_by uuid;

-- Drop old public scan policy
DROP POLICY IF EXISTS "Scans are publicly readable" ON public.scans;

-- Team members can view all scans
CREATE POLICY "Team members can view scans"
ON public.scans FOR SELECT TO authenticated USING (true);

-- Team members can insert scans
CREATE POLICY "Team members can insert scans"
ON public.scans FOR INSERT TO authenticated WITH CHECK (true);

-- Timestamp helper
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for clients
CREATE TRIGGER update_clients_updated_at
BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
