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

-- Ownership type constraint (includes all variations from all countries)
ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_ownership_type_check 
  CHECK (ownership_type IN (
    'private', 'public', 'state_owned', 'joint_venture',
    'Concession / JV (percentages known)',
    'Concession/JV with state participation',
    'Concession/legacy arrangements (details not reliably available in public sources)',
    'Exploration & development block with participating interests (details not fully disclosed in cited release)',
    'Exploration license with SNH back-in right',
    'JV',
    'JV (50/50 via BSP)',
    'JV (50/50)',
    'JV (Block 14 contractor group / PSA-style deepwater block; concessionaire Sonangol/ANPG framework)',
    'JV (Block 14 contractor group)',
    'JV (Block 17 contractor group; concessionaire Sonangol/ANPG)',
    'JV (Concession/Association)',
    'JV (Sonatrach with foreign partners)',
    'JV (concession / joint participation)',
    'JV (concession)',
    'JV (exploration block participants)',
    'JV (state-Shell)',
    'JV (state/Shell via BSP)',
    'JV (unitized/shared field)',
    'JV / Association (SNH-Perenco)',
    'JV / PSC',
    'JV / PSC (historical)',
    'JV / PSC / Unitized (multi-block)',
    'JV / PSC-like block partnership (Angola ANPG concessionaire framework)',
    'JV / PSC-like deepwater block partnership (Angola concessionaire framework)',
    'JV / PSC-style partnership',
    'JV / PSC-style partnership (Sonatrach majority, foreign minority)',
    'JV / PSC-style permit with state participation',
    'JV / Production Sharing-style partnership with Sonatrach (national company)',
    'JV / concession (Block 14 contractor group)',
    'JV concession (Block 0 Association)',
    'JV with state participation',
    'JV/PSA rehabilitation (post-2009 agreement reported in secondary sources)',
    'JV/PSC',
    'JV/PSC with state participation',
    'JV/association with NOC (not fully disclosed)',
    'License (100% participation stake reported)',
    'PSA rehabilitation/development (post-2009)',
    'PSC',
    'PSC (100%)',
    'PSC (Production Sharing Agreement)',
    'PSC (Production Sharing Agreement) / JV with participating interests',
    'PSC (Production Sharing Contract)',
    'PSC (exploration)',
    'PSC (private operator under state PSC)',
    'PSC / Consortium',
    'PSC / JV',
    'PSC / JV (state-owned + foreign partner)',
    'PSC / consortium (JV)',
    'PSC / contract with foreign operator',
    'PSC / intended JV (50/50 JVC planned)',
    'PSC / state–foreign partnership (exact equity not consistently disclosed publicly)',
    'PSC/JV',
    'PSC/JV (Block 14 Contractor Group)',
    'PSC/JV (not fully disclosed)',
    'PSC/JV with state participation',
    'PSC/PSA',
    'Permit/PSC with state participation',
    'Private (Perenco) / JV with state partner',
    'Private (marketing/lifting system)',
    'Production Sharing-style partnership with Sonatrach (national company)',
    'RSA / JV',
    'Risk Service Agreement (RSA)',
    'Risk Service Agreement (RSA) / JV participating interest transfer',
    'State-owned',
    'State-owned / JV (legacy consortium interests)',
    'State–foreign partnership (upstream not consistently disclosed publicly)',
    'State–foreign partnership / JV participation reported (CNPC + SHT)',
    'Unitized JV / PSC',
    'state-owned',
    'state-owned (project history includes terminated foreign LNG development contract)',
    'state-owned with service/rehabilitation agreement',
    'unknown'
  ));

-- Operational status constraint (with all variations)
ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_operational_status_check 
  CHECK (operational_status IN ('active', 'inactive', 'closed', 'construction', 'planned', 'suspended', 'decommissioned', 'Active', 'Inactive', 'Closed', 'operational', 'producing'));

-- Location type constraint (with all variations)
ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_location_type_check 
  CHECK (location_type IN ('mine', 'oil_field', 'gas_field', 'storage', 'port', 'facility', 'farm', 'processing_plant', 'oil_and_gas_field', 'refinery', 'terminal', 'pipeline', 'well'));

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
