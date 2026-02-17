-- ============================================================
-- Create the research-images storage bucket
-- Run this in Supabase SQL Editor
-- ============================================================

-- Create a public bucket for article images
INSERT INTO storage.buckets (id, name, public)
VALUES ('research-images', 'research-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read images (public)
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'research-images');

-- Allow anyone to upload images
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'research-images');

-- Allow anyone to update their uploads
CREATE POLICY "Allow updates" ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'research-images');

-- Allow anyone to delete images
CREATE POLICY "Allow deletes" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'research-images');
