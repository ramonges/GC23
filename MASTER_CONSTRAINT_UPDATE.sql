-- ============================================
-- MASTER CONSTRAINT UPDATE FOR ALL COUNTRIES
-- Run this FIRST before running individual country SQL files
-- ============================================

-- ============================================
-- STEP 1: DROP ALL CONSTRAINTS FIRST
-- ============================================

ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_ownership_type_check;

ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_operational_status_check;

ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_location_type_check;

-- ============================================
-- STEP 2: NORMALIZE EXISTING DATA
-- ============================================

-- Normalize operational_status
UPDATE public.commodity_locations SET operational_status = 'active' WHERE operational_status IS NULL OR operational_status = '';
UPDATE public.commodity_locations SET operational_status = 'inactive' WHERE operational_status IN ('Inactive', 'shut-in', 'shut_in');
UPDATE public.commodity_locations SET operational_status = 'closed' WHERE operational_status IN ('Closed', 'abandoned', 'Abandoned');

-- Normalize location_type
UPDATE public.commodity_locations SET location_type = 'oil_field' WHERE location_type IS NULL OR location_type = '';

-- ============================================
-- STEP 3: ADD CONSTRAINTS BACK
-- ============================================

-- Ownership type constraint removed due to high data variability across countries
-- The ownership_type field now accepts any string value to accommodate 
-- the diverse ownership structures in different jurisdictions (JV, PSC, PSA, concessions, etc.)
-- Previous constraint had 70+ values and still was insufficient for new country data

-- NOTE: If you need to re-add a constraint, ensure all existing data is validated first:
-- SELECT DISTINCT ownership_type FROM public.commodity_locations ORDER BY 1;

-- Operational status constraint (with all variations)
ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_operational_status_check 
  CHECK (operational_status IN ('active', 'inactive', 'closed', 'construction', 'planned', 'suspended', 'decommissioned', 'Active', 'Inactive', 'Closed', 'operational', 'producing', 'development', 'exploration'));

-- Location type constraint (with all variations including offshore)
ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_location_type_check 
  CHECK (location_type IN ('mine', 'oil_field', 'gas_field', 'storage', 'port', 'facility', 'farm', 'processing_plant', 'oil_and_gas_field', 'refinery', 'terminal', 'pipeline', 'well', 'offshore_field', 'onshore_field'));

-- ============================================
-- STEP 4: ENSURE RLS POLICIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can read commodity_locations" ON public.commodity_locations;
CREATE POLICY "Anyone can read commodity_locations" ON public.commodity_locations
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage commodity_locations" ON public.commodity_locations;
CREATE POLICY "Service role can manage commodity_locations" ON public.commodity_locations
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- STEP 5: VERIFY
-- ============================================

SELECT 'Constraints updated successfully!' as status;
