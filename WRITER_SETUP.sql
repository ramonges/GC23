-- ============================================================
-- Writer Credentials table + Research Articles column additions
-- Run this in Supabase SQL Editor
-- ============================================================

-- 1. Writer Credentials table
CREATE TABLE IF NOT EXISTS writer_credentials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE writer_credentials ENABLE ROW LEVEL SECURITY;

-- Allow the API to read credentials for authentication
CREATE POLICY "Allow read for auth" ON writer_credentials
  FOR SELECT USING (true);

-- Insert writer accounts
INSERT INTO writer_credentials (email, password_hash)
VALUES ('ram2315@columbia.edu', 'ram2905')
ON CONFLICT (email) DO NOTHING;

INSERT INTO writer_credentials (email, password_hash)
VALUES ('mam2684@columbia.edu', 'mam2684')
ON CONFLICT (email) DO NOTHING;


-- 2. Add new columns to research_articles (subtitle, image_url, published)
--    These are safe to run even if columns already exist (will error harmlessly).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'research_articles' AND column_name = 'subtitle'
  ) THEN
    ALTER TABLE research_articles ADD COLUMN subtitle TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'research_articles' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE research_articles ADD COLUMN image_url TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'research_articles' AND column_name = 'published'
  ) THEN
    ALTER TABLE research_articles ADD COLUMN published BOOLEAN DEFAULT true;
  END IF;
END
$$;


-- 3. Create storage bucket for article images (run manually in Supabase Dashboard > Storage)
-- Go to Storage > New Bucket > Name: "research-images" > Public: ON
-- Then add a policy: Allow all uploads for anon/authenticated
