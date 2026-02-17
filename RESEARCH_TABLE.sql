-- Create research_articles table
CREATE TABLE IF NOT EXISTS public.research_articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT DEFAULT '',
  content TEXT DEFAULT '',
  source_url TEXT DEFAULT '',
  category TEXT DEFAULT 'Market Analysis',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.research_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Anyone can read research articles"
  ON public.research_articles FOR SELECT
  USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can insert research articles"
  ON public.research_articles FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update research articles"
  ON public.research_articles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete research articles"
  ON public.research_articles FOR DELETE
  TO authenticated
  USING (true);

-- Also allow anon for demo purposes (remove in production)
CREATE POLICY "Anon can insert research articles"
  ON public.research_articles FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anon can update research articles"
  ON public.research_articles FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anon can delete research articles"
  ON public.research_articles FOR DELETE
  TO anon
  USING (true);
