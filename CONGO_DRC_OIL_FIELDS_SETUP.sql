-- ============================================
-- CONGO (DRC) OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T16:05:10.603228
-- Total sites: 5
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

-- ============================================
-- STEP 2: DATE PARSING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION parse_flexible_date(date_text TEXT)
RETURNS DATE AS $$
BEGIN
  IF date_text IS NULL OR date_text = '' THEN
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
  ('Perenco', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;

-- ============================================
-- STEP 4: DELETE EXISTING CONGO (DRC) DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'Congo (DRC)';

-- ============================================
-- STEP 5: INSERT CONGO (DRC) SITES
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
  'Muanda Marine (DRC Coastal Basin)',
  'Perenco',
  'Kongo Central (offshore Muanda)',
  'Congo (DRC)',
  'Kongo Central (offshore Muanda)',
  -5.93,
  12.35,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Perenco',
  'JV / concession (details not fully public)',
  'Operated by Perenco/MIOC; DRC state participation/royalty/tax regime applies; precise working interests not consistently disclosed in public sources.',
  585000,
  7117500,
  'barrels (bbl)',
  0,
  'bbl (unknown)',
  NULL,
  NULL,
  'crude oil (type not publicly specified for this concession)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Onshore export pipeline network around Muanda (names not consistently disclosed publicly)'],
  ARRAY['Muanda (export via coastal/offshore loading in the Muanda area; specific terminal name not consistently disclosed publicly)'],
  ARRAY[]::text[],
  'Perenco',
  NULL
);

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
  'GCO field (offshore DRC)',
  'Perenco',
  'Kongo Central (offshore DRC coastal basin)',
  'Congo (DRC)',
  'Kongo Central (offshore DRC coastal basin)',
  -5.9,
  12.3,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Perenco',
  'JV / concession (details not fully public)',
  'Operated by Perenco/MIOC; development drilling campaign reported (12-well program). Public sources do not provide complete partner breakdown.',
  0,
  0,
  'barrels (bbl)',
  0,
  'bbl (unknown)',
  NULL,
  NULL,
  'crude oil (type not publicly specified)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Export tied into existing Muanda-area offshore/onshore infrastructure (specific pipeline names not consistently disclosed publicly)'],
  ARRAY['Muanda area export facilities (specific terminal name not consistently disclosed publicly)'],
  ARRAY[]::text[],
  'Perenco',
  NULL
);

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
  'Lukami field (offshore DRC)',
  'Perenco',
  'Kongo Central (offshore DRC coastal basin)',
  'Congo (DRC)',
  'Kongo Central (offshore DRC coastal basin)',
  -5.88,
  12.28,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Perenco',
  'JV / concession (details not fully public)',
  'Perenco/MIOC referenced the Lukami field as an existing offshore field in the DRC coastal basin; detailed partners/percentages not broadly published.',
  0,
  0,
  'barrels (bbl)',
  0,
  'bbl (unknown)',
  NULL,
  NULL,
  'crude oil (type not publicly specified)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Tied into Muanda-area export system (specific pipeline names not consistently disclosed publicly)'],
  ARRAY['Muanda area export facilities (specific terminal name not consistently disclosed publicly)'],
  ARRAY[]::text[],
  'Perenco',
  NULL
);

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
  'Motoba field (offshore DRC)',
  'Perenco',
  'Kongo Central (offshore DRC coastal basin)',
  'Congo (DRC)',
  'Kongo Central (offshore DRC coastal basin)',
  -5.85,
  12.25,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Perenco',
  'JV / concession (details not fully public)',
  'Perenco/MIOC referenced the Motoba field as an existing offshore field in the DRC coastal basin; detailed partners/percentages not broadly published.',
  0,
  0,
  'barrels (bbl)',
  0,
  'bbl (unknown)',
  NULL,
  NULL,
  'crude oil (type not publicly specified)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Tied into Muanda-area export system (specific pipeline names not consistently disclosed publicly)'],
  ARRAY['Muanda area export facilities (specific terminal name not consistently disclosed publicly)'],
  ARRAY[]::text[],
  'Perenco',
  NULL
);

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
  'Moke-East (discovery/appraisal area, offshore DRC coastal basin)',
  'Perenco',
  'Kongo Central (offshore DRC coastal basin)',
  'Congo (DRC)',
  'Kongo Central (offshore DRC coastal basin)',
  -5.87,
  12.27,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Perenco',
  'JV / concession (details not fully public)',
  'Operated by Perenco/MIOC; reported as an exploration discovery (net oil-bearing column encountered) located between Lukami and Motoba fields; production not publicly confirmed.',
  0,
  0,
  'barrels (bbl)',
  0,
  'bbl (unknown)',
  NULL,
  NULL,
  'crude oil (type not publicly specified)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['If developed, expected tie-back to existing Muanda-area infrastructure (specific pipeline names not disclosed)'],
  ARRAY['Muanda area export facilities (specific terminal name not disclosed)'],
  ARRAY[]::text[],
  'Perenco',
  NULL
);
