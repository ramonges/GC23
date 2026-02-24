-- ============================================
-- BENIN OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T15:51:57.336511
-- Total sites: 2
-- ============================================

-- ============================================
-- STEP 1: SCHEMA MODIFICATIONS
-- ============================================

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='operator') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN operator TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='ownership_type') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN ownership_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='ownership_details') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN ownership_details TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='production_monthly') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN production_monthly DECIMAL(20,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='production_yearly') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN production_yearly DECIMAL(20,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='production_unit') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN production_unit TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='start_date') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN start_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='closing_date') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN closing_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='estimated_reserves') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN estimated_reserves DECIMAL(20,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='reserves_unit') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN reserves_unit TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='api_gravity') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN api_gravity DECIMAL(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='quality_type') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN quality_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='quality_sulfur_content') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN quality_sulfur_content DECIMAL(5,3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='grade') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN grade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='last_transaction_value') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN last_transaction_value DECIMAL(20,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='last_transaction_currency') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN last_transaction_currency TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='last_transaction_date') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN last_transaction_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='contract_duration_years') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN contract_duration_years INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='pipelines') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN pipelines TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='ports') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN ports TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='rail_connections') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN rail_connections TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='company') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN company TEXT;
  END IF;
END $$;

-- Make latitude/longitude nullable
ALTER TABLE public.commodity_locations
  ALTER COLUMN latitude DROP NOT NULL,
  ALTER COLUMN longitude DROP NOT NULL;

-- ============================================
-- STEP 2: HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION parse_site_date(date_text TEXT) RETURNS DATE AS $$
BEGIN
  IF date_text IS NULL OR date_text = '' OR date_text = 'unknown' OR date_text ILIKE '%unknown%' THEN
    RETURN NULL;
  END IF;
  IF date_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN
    RETURN date_text::DATE;
  END IF;
  IF date_text ~ '^[0-9]{4}-[0-9]{2}$' THEN
    RETURN (date_text || '-01')::DATE;
  END IF;
  IF date_text ~ '^[0-9]{4}$' THEN
    RETURN (date_text || '-01-01')::DATE;
  END IF;
  IF date_text ~ '^[0-9]{4}s$' THEN
    RETURN (SUBSTRING(date_text FROM 1 FOR 4) || '-01-01')::DATE;
  END IF;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 3: INSERT COMPANIES
-- ============================================


INSERT INTO public.companies (name, type, headquarters_country, commodities_traded)
VALUES
  ('Rex International', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('Saga Petroleum', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])

ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;


-- ============================================
-- STEP 4: DELETE EXISTING BENIN DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'Benin';

-- ============================================
-- STEP 5: INSERT BENIN SITES
-- ============================================

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
  estimated_reserves,
  reserves_unit,
  start_date,
  closing_date,
  quality_type,
  api_gravity,
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
  'Sèmè Field (Block 1)',
  'Rex International',
  'Littoral Department (offshore Gulf of Guinea, near Sèmè-Kraké / maritime border with Nigeria), Benin',
  'Benin',
  'Littoral Department (offshore Gulf of Guinea, near Sèmè-Kraké / maritime border with Nigeria)',
  6.25,
  2.75,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Rex International',
  'PSC (Production Sharing Contract)',
  'Working interests reported: Akrake Petroleum 76%; Government of Benin 15%; Octogone Trading / OCTOGONE E&P S.A. 9% (subject to Benin government entitlements under PSC).',
  450000,
  5475000,
  'bbl',
  10.9,
  'MMstb (2P, H6 reservoir; gross)',
  parse_site_date('1982-01-01'),
  NULL,
  'crude oil (API not found in reliable public sources for Sèmè crude)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_site_date('2023-12-01'),
  NULL,
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  'Rex International',
  '{"source": "Benin_all_sites.json", "generated_date": "2026-01-21 21:49:27"}' ::JSONB
),
(
  'Sèmè Field (historical production phase, developed by Saga Petroleum)',
  'Saga Petroleum',
  'Littoral Department (offshore Gulf of Guinea, near Sèmè-Kraké / Cotonou area), Benin',
  'Benin',
  'Littoral Department (offshore Gulf of Guinea, near Sèmè-Kraké / Cotonou area)',
  6.25,
  2.75,
  'Energy',
  'Crude Oil',
  'oil_field',
  'inactive',
  'Saga Petroleum',
  'Concession/legacy arrangements (details not reliably available in public sources)',
  'Produced ~22 million barrels between 1982 and 1998; shut-in officially December 1998 (reasons cited include low oil prices and high water production).',
  0,
  0,
  'bbl',
  0,
  'bbl',
  parse_site_date('1982-01-01'),
  parse_site_date('1998-12-01'),
  'crude oil (API not found in reliable public sources for Sèmè crude)',
  NULL,
  NULL,
  NULL,
  44.5,
  'USD',
  parse_site_date('1999-10-15'),
  NULL,
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  'Saga Petroleum',
  '{"source": "Benin_all_sites.json", "generated_date": "2026-01-21 21:49:27"}' ::JSONB
)
;


-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

SELECT COUNT(*) as total_benin_sites, 
       COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as sites_with_coordinates,
       COUNT(CASE WHEN operational_status = 'active' THEN 1 END) as active_sites,
       COUNT(CASE WHEN operational_status != 'active' THEN 1 END) as inactive_sites
FROM public.commodity_locations 
WHERE country = 'Benin';
