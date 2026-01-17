-- ============================================
-- FIX RLS POLICY FOR DATA SCRAPER
-- ============================================
-- Run this SQL in your Supabase SQL Editor to allow the scraper to insert data

-- Allow service role and authenticated users to insert commodity locations
CREATE POLICY "Service role can insert commodity locations" ON public.commodity_locations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can insert commodity locations" ON public.commodity_locations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Verify the policies
SELECT * FROM pg_policies WHERE tablename = 'commodity_locations';
