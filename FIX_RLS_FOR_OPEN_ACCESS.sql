-- ============================================
-- FIX ROW LEVEL SECURITY FOR OPEN ACCESS
-- ============================================
-- This allows unauthenticated users to read commodity_locations
-- since the platform is now open access

-- Drop the existing policy that requires authentication
DROP POLICY IF EXISTS "Authenticated users can read commodity locations" ON public.commodity_locations;

-- Create a new policy that allows anyone to read commodity locations
CREATE POLICY "Anyone can read commodity locations" ON public.commodity_locations
  FOR SELECT USING (true);

-- Also update refineries table if it exists (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'refineries') THEN
    DROP POLICY IF EXISTS "Authenticated users can read refineries" ON public.refineries;
    CREATE POLICY "Anyone can read refineries" ON public.refineries
      FOR SELECT USING (true);
  END IF;
END $$;
