
-- site_content
CREATE TABLE public.site_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  field text NOT NULL,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page, field)
);
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read site content" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Service role manages site content" ON public.site_content FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- faq_items
CREATE TABLE public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active FAQs" ON public.faq_items FOR SELECT USING (active = true);
CREATE POLICY "Service role manages FAQs" ON public.faq_items FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- blog_posts
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  excerpt text,
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  reading_minutes integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read published posts" ON public.blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Service role manages posts" ON public.blog_posts FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- content_edits
CREATE TABLE public.content_edits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text,
  field text,
  old_value text,
  new_value text,
  reason text,
  changed_by text DEFAULT 'mcp-agent',
  changed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.content_edits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages content edits" ON public.content_edits FOR ALL USING (auth.role() = 'service_role') WITH CHECK (auth.role() = 'service_role');

-- products display columns
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS display_price text,
  ADD COLUMN IF NOT EXISTS display_label text,
  ADD COLUMN IF NOT EXISTS features text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS highlight boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS visible_on_homepage boolean NOT NULL DEFAULT true;

-- updated_at triggers
CREATE TRIGGER trg_site_content_updated BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_faq_items_updated BEFORE UPDATE ON public.faq_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_blog_posts_updated BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
