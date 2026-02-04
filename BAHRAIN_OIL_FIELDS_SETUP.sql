-- ============================================
-- BAHRAIN OIL FIELDS - TABLE MODIFICATION & DATA INSERT
-- Generated from: Bahrain_all_sites_with_coordinates.json
-- Generated date: 2026-02-01
-- ============================================

-- ============================================
-- STEP 1: MODIFY TABLE STRUCTURE (if not already done)
-- ============================================

-- Add new columns to support comprehensive oil field data (if not exists)
ALTER TABLE public.commodity_locations
  -- Production data
  ADD COLUMN IF NOT EXISTS production_monthly DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS production_yearly DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS production_unit TEXT,
  
  -- Dates
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS closing_date DATE,
  
  -- Ownership details
  ADD COLUMN IF NOT EXISTS ownership_details TEXT,
  
  -- Reserves unit
  ADD COLUMN IF NOT EXISTS reserves_unit TEXT,
  
  -- Quality specifications
  ADD COLUMN IF NOT EXISTS quality_type TEXT,
  ADD COLUMN IF NOT EXISTS quality_sulfur_content DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS quality_grade_percent DECIMAL(5, 2),
  
  -- Transaction data
  ADD COLUMN IF NOT EXISTS last_transaction_value DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS last_transaction_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS last_transaction_date DATE,
  
  -- Contract information
  ADD COLUMN IF NOT EXISTS contract_duration_years INTEGER,
  
  -- Infrastructure arrays
  ADD COLUMN IF NOT EXISTS pipelines TEXT[],
  ADD COLUMN IF NOT EXISTS ports TEXT[],
  ADD COLUMN IF NOT EXISTS rail_connections TEXT[];

-- Update operational_status check constraint to include 'active' and 'closed'
ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_operational_status_check;

ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_operational_status_check 
  CHECK (operational_status IN ('operational', 'under_construction', 'planned', 'inactive', 'depleted', 'active', 'closed'));

-- Update ownership_type check constraint (allow all variations)
ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_ownership_type_check;

ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_ownership_type_check 
  CHECK (ownership_type IN (
    'private', 'public', 'state_owned', 'joint_venture', 
    'state-owned', 
    'State-owned',
    'JV', 
    'PSC', 
    'PSC/PSA',
    'PSC/JV',
    'JV / PSC', 
    'JV/PSC',
    'PSC / JV',
    'PSC/JV',
    'JV (unitized/shared field)',
    'PSC (Production Sharing Agreement)',
    'PSC (Production Sharing Agreement) / JV with participating interests',
    'PSC / Consortium',
    'JV (50/50)',
    'JV/PSA rehabilitation (post-2009 agreement reported in secondary sources)',
    'PSA rehabilitation/development (post-2009)',
    'Risk Service Agreement (RSA)',
    'Risk Service Agreement (RSA) / JV participating interest transfer',
    'RSA / JV',
    'state-owned with service/rehabilitation agreement',
    'Exploration & development block with participating interests (details not fully disclosed in cited release)',
    'PSC/JV (Block 14 Contractor Group)',
    'JV / PSC-style partnership',
    'JV / PSC-style partnership (Sonatrach majority, foreign minority)',
    'JV / PSC (historical)',
    'JV (Sonatrach with foreign partners)',
    'JV / PSC / Unitized (multi-block)',
    'Unitized JV / PSC',
    'Production Sharing-style partnership with Sonatrach (national company)',
    'JV / Production Sharing-style partnership with Sonatrach (national company)',
    'state-owned (project history includes terminated foreign LNG development contract)',
    'JV (concession / joint participation)',
    'JV (exploration block participants)',
    'JV concession (Block 0 Association)',
    'JV (Concession/Association)',
    'JV (Block 14 contractor group / PSA-style deepwater block; concessionaire Sonangol/ANPG framework)',
    'JV (Block 14 contractor group)',
    'JV (Block 17 contractor group; concessionaire Sonangol/ANPG)',
    'JV / PSC-like block partnership (Angola ANPG concessionaire framework)',
    'JV / PSC-like deepwater block partnership (Angola concessionaire framework)',
    'JV / concession (Block 14 contractor group)',
    'unknown'
  ));

-- Update location_type check constraint
ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_location_type_check;

ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_location_type_check 
  CHECK (location_type IN ('mine', 'oil_field', 'gas_field', 'storage', 'port', 'facility', 'farm', 'processing_plant', 'oil_and_gas_field'));

-- Make latitude/longitude nullable (if not already)
ALTER TABLE public.commodity_locations
  ALTER COLUMN latitude DROP NOT NULL,
  ALTER COLUMN longitude DROP NOT NULL;

-- ============================================
-- STEP 2: HELPER FUNCTIONS
-- ============================================

-- Helper function to parse date strings
CREATE OR REPLACE FUNCTION parse_site_date(date_str TEXT)
RETURNS DATE AS $$
BEGIN
  IF date_str IS NULL OR date_str = 'unknown' OR date_str = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN date_str::DATE;
  EXCEPTION WHEN OTHERS THEN
    IF date_str ~ '^\d{4}$' THEN
      RETURN (date_str || '-01-01')::DATE;
    END IF;
    IF date_str ~ '^\d{4}-\d{2}$' THEN
      RETURN (date_str || '-01')::DATE;
    END IF;
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to extract primary company name from operator string
CREATE OR REPLACE FUNCTION extract_primary_company(operator_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF operator_text IS NULL OR operator_text = '' THEN
    RETURN NULL;
  END IF;
  
  IF operator_text ILIKE '%Saudi Aramco%' OR operator_text ILIKE '%Aramco%' THEN
    RETURN 'Saudi Aramco';
  END IF;
  IF operator_text ILIKE '%Bapco%' THEN
    RETURN 'Bapco Energies';
  END IF;
  IF operator_text ILIKE '%BP%' THEN
    RETURN 'BP';
  END IF;
  IF operator_text ILIKE '%Total%' OR operator_text ILIKE '%TotalEnergies%' THEN
    RETURN 'TotalEnergies';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert/update companies from operators
INSERT INTO public.companies (name, type, headquarters_country, commodities_traded)
VALUES
  ('Saudi Aramco', 'producer', 'Saudi Arabia', ARRAY['Crude Oil', 'Natural Gas']),
  ('Bapco Energies', 'producer', 'Bahrain', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;

-- Delete existing Bahrain entries to avoid duplicates
DELETE FROM public.commodity_locations WHERE country = 'Bahrain';

-- Insert all Bahrain sites
INSERT INTO public.commodity_locations (
  title,
  owner,
  address,
  country,
  region,
  latitude,
  longitude,
  commodity_type,
  commodity_name,
  location_type,
  operational_status,
  operator,
  ownership_type,
  ownership_details,
  production_monthly,
  production_yearly,
  production_unit,
  current_production,
  reserves_estimate,
  reserves_unit,
  start_date,
  closing_date,
  api_gravity,
  quality_type,
  quality_sulfur_content,
  grade,
  last_transaction_value,
  last_transaction_currency,
  last_transaction_date,
  contract_duration_years,
  pipelines,
  ports,
  rail_connections,
  company,
  additional_info
) VALUES
(
  'Abu Safah (Abu Saafa / Abu Sa''fah) Oil Field',
  'Saudi Aramco',
  'Offshore Bahrain (Arabian Gulf; shared Bahrain–Saudi Arabia waters), Bahrain',
  'Bahrain',
  'Offshore Bahrain (Arabian Gulf; shared Bahrain–Saudi Arabia waters)',
  26.975,
  50.5522,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Saudi Aramco',
  'JV (unitized/shared field)',
  'Joint Bahrain–Saudi field (widely reported as 50/50); Saudi Aramco operates; Bahrain’s equity crude marketed by Bapco (Bapco Refining) as agent for Government of Bahrain.',
  4500000,
  54750000,
  'barrels (Bahrain equity share marketed by Bahrain; field gross capacity ~300,000 bpd, Bahrain equity ~150,000 bpd)',
  54750000,
  1023180000,
  'barrels (remaining recoverable crude oil & condensate; 2023)',
  parse_site_date('1966'),
  NULL,
  29,
  'sour medium crude',
  2.85,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['(historical/legacy) Undersea pipeline connection to Bahrain (Sitra refinery) referenced in public sources; specific line name not consistently disclosed'],
  ARRAY['Ras Tanura Terminal (Saudi Arabia)'],
  ARRAY[]::TEXT[],
  'Saudi Aramco',
  '{"source": "Bahrain_all_sites.json", "generated_date": "2026-01-21 22:33:09"}'::JSONB
),
(
  'Bahrain Field (Awali Field)',
  'Bapco Upstream (Bapco Energies)',
  'Southern Governorate (Awali region), Bahrain',
  'Bahrain',
  'Southern Governorate (Awali region)',
  26.0333,
  50.532,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Bapco Upstream (Bapco Energies)',
  'state-owned',
  'Bahrain government via Bapco Energies (Bapco Upstream; formerly Tatweer Petroleum).',
  1290000,
  15480000,
  'barrels (crude+condensate)',
  15480000,
  0,
  'barrels (remaining, not publicly disclosed)',
  parse_site_date('1932'),
  NULL,
  NULL,
  'mixed (field produces crude and condensate; includes multiple reservoirs)',
  NULL,
  NULL,
  500000000,
  'USD',
  parse_site_date('2024-08-13'),
  NULL,
  ARRAY['Awali field gathering system (multiple flowlines; specific line names not publicly disclosed)', 'Crude transfer lines to Sitra refining/export area (Bapco facilities; specific line names not publicly disclosed)'],
  ARRAY['Sitra (Bapco/Bahrain Petroleum Company export/refinery terminal area)'],
  ARRAY[]::TEXT[],
  'Bapco Energies',
  '{"source": "Bahrain_all_sites.json", "generated_date": "2026-01-21 22:33:09"}'::JSONB
)
;

-- Clean up helper functions
DROP FUNCTION IF EXISTS parse_site_date(TEXT);
DROP FUNCTION IF EXISTS extract_primary_company(TEXT);

-- Create indexes for better query performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_commodity_locations_start_date ON public.commodity_locations(start_date);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_production_yearly ON public.commodity_locations(production_yearly);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_operator ON public.commodity_locations(operator);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_status ON public.commodity_locations(operational_status);

-- Update companies RLS policy for open access
DROP POLICY IF EXISTS "Authenticated users can read companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can read companies" ON public.companies;
CREATE POLICY "Anyone can read companies" ON public.companies
  FOR SELECT USING (true);

-- Verification query
SELECT COUNT(*) as total_bahrain_sites, 
       COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as sites_with_coordinates,
       COUNT(CASE WHEN operational_status = 'active' THEN 1 END) as active_sites,
       COUNT(CASE WHEN operational_status != 'active' THEN 1 END) as inactive_sites
FROM public.commodity_locations 
WHERE country = 'Bahrain';