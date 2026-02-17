-- ============================================
-- FIX RLS: Allow public read for commodity_locations
-- ============================================
-- Run this in Supabase SQL Editor to fix the Earth Map not displaying locations
--
-- Problem: The default policy only allows authenticated users to read.
-- When users access the platform without logging in (Guest Access),
-- the anon key is used and RLS blocks the query - returning 0 rows.
--
-- Solution: Add a policy that allows public (anon) read access.

-- Add policy for public read - allows anyone to SELECT from commodity_locations
CREATE POLICY "Allow public read commodity locations" ON public.commodity_locations
  FOR SELECT USING (true);

-- Verify: After running, the Earth Map should display all locations.
-- You can keep the authenticated policy as well - both will work.
