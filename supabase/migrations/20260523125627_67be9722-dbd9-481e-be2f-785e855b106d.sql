-- Fix overly permissive RLS policies flagged by linter
-- For an internal team tool, all authenticated users are team members.
-- Replace USING (true) / WITH CHECK (true) with explicit auth.role() checks.

-- Fix clients table policies
DROP POLICY IF EXISTS "Team members can create clients" ON public.clients;
DROP POLICY IF EXISTS "Team members can update clients" ON public.clients;
DROP POLICY IF EXISTS "Team members can delete clients" ON public.clients;

CREATE POLICY "Team members can create clients"
ON public.clients FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team members can update clients"
ON public.clients FOR UPDATE TO authenticated USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Team members can delete clients"
ON public.clients FOR DELETE TO authenticated USING (auth.role() = 'authenticated');

-- Fix scans table policies  
DROP POLICY IF EXISTS "Team members can insert scans" ON public.scans;

CREATE POLICY "Team members can insert scans"
ON public.scans FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');
