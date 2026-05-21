-- Add explicit service-role-only RLS policies to orders table
CREATE POLICY "Service role can read orders"
ON public.orders FOR SELECT
USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert orders"
ON public.orders FOR INSERT
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update orders"
ON public.orders FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can delete orders"
ON public.orders FOR DELETE
USING (auth.role() = 'service_role');