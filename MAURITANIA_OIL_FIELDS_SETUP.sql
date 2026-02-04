-- ============================================
-- MAURITANIA OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T16:05:10.630720
-- Total sites: 9
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
  ('Not producing', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('PETRONAS', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('Tullow Oil', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;

-- ============================================
-- STEP 4: DELETE EXISTING MAURITANIA DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'Mauritania';

-- ============================================
-- STEP 5: INSERT MAURITANIA SITES
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
  'Chinguetti Oil Field',
  'PETRONAS',
  'Offshore (Mauritanian Coastal Basin)',
  'Mauritania',
  'Offshore (Mauritanian Coastal Basin)',
  19.85,
  -17.35,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'inactive',
  'PETRONAS',
  'PSC / JV',
  'Operated by Petronas Carigali Mauritania 1 (Petronas). Partners reported in public sources include SMHPM (state entity), Tullow Oil, Premier Oil, and KUFPEC (exact percentages vary by period and are not consistently disclosed in public summaries).',
  0,
  0,
  'bbl',
  53,
  'million bbl (2P estimate cited historically)',
  NULL,
  NULL,
  'crude oil (type/API not found in cited public sources)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'PETRONAS',
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
  'Tevet Field',
  'Tullow Oil',
  'Offshore (near Chinguetti area)',
  'Mauritania',
  'Offshore (near Chinguetti area)',
  19.8,
  -17.3,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'inactive',
  'Tullow Oil',
  'PSC discovery (ring-fenced under original PSC terms)',
  'Identified as a small oil discovery (~40 million barrels) and historically considered for tie-back to Chinguetti; later described as ring-fenced under original PSC terms when Mauritanian PSCs were reorganized (exact current equity not consistently published in accessible public sources).',
  0,
  0,
  'bbl',
  40,
  'million bbl (in-place/resource estimate cited by M',
  NULL,
  NULL,
  'crude oil (type/API not found in cited public sources)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Tullow Oil',
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
  'Walata Field (formerly Tiof)',
  'Tullow Oil',
  'Offshore (north of Chinguetti area)',
  'Mauritania',
  'Offshore (north of Chinguetti area)',
  20.0,
  -17.45,
  'Energy',
  'Oil & Gas',
  'offshore_field',
  'inactive',
  'Tullow Oil',
  'PSC discovery (ring-fenced under original PSC terms)',
  'Referred to as Walata (formerly Tiof) by Mauritania’s Ministry; previously appraised under operator groups including Premier/Woodside era; later described as ring-fenced under original PSC terms when Mauritanian PSCs were reorganized (exact current equity not consistently published in accessible public sources).',
  0,
  0,
  'bbl',
  280,
  'million bbl (resource estimate cited by Mauritania',
  NULL,
  NULL,
  'crude oil with associated gas (type/API not found in cited public sources)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Tullow Oil',
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
  'Banda Field (primarily gas; thin oil leg reported historically)',
  'Tullow Oil',
  'Offshore (near Nouakchott)',
  'Mauritania',
  'Offshore (near Nouakchott)',
  19.75,
  -17.25,
  'Energy',
  'Oil & Gas',
  'offshore_field',
  'inactive',
  'Tullow Oil',
  'PSC / license (gas development focus)',
  'Government sources describe Banda as a major offshore discovery (gas-focused). Public sources note Tullow as operator historically; a 2024 award for Banda & Tevet license/development is publicly described by the developer (not an oil-production project).',
  0,
  0,
  'bbl',
  0,
  'bbl (oil remaining reserves not established in pub',
  NULL,
  NULL,
  'gas-dominant discovery (oil leg mentioned historically; oil quality not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Tullow Oil',
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
  'Pelican Discovery',
  'Not producing',
  'Offshore (Mauritanian Coastal Basin)',
  'Mauritania',
  'Offshore (Mauritanian Coastal Basin)',
  19.7,
  -17.2,
  'Energy',
  'Oil & Gas',
  'offshore_field',
  'inactive',
  'Not producing',
  'exploration discovery',
  'Cited by Mauritania Ministry as a small/medium discovery; also discussed in industry press as a major non-associated gas deposit discovery (not an oil production site).',
  0,
  0,
  'bbl',
  0,
  'bbl (oil reserves not established in public source',
  NULL,
  NULL,
  'discovery (reported as gas in industry press; oil quality not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Not producing',
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
  'Cormoran Discovery',
  'Not producing',
  'Offshore (Mauritanian Coastal Basin)',
  'Mauritania',
  'Offshore (Mauritanian Coastal Basin)',
  19.65,
  -17.15,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'inactive',
  'Not producing',
  'exploration discovery',
  'Listed by Mauritania Ministry among small/medium offshore discoveries.',
  0,
  0,
  'bbl',
  0,
  'bbl (oil reserves not established in public source',
  NULL,
  NULL,
  'discovery (oil type/API not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Not producing',
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
  'Frégate Discovery',
  'Not producing',
  'Offshore (Mauritanian Coastal Basin)',
  'Mauritania',
  'Offshore (Mauritanian Coastal Basin)',
  19.6,
  -17.1,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'inactive',
  'Not producing',
  'exploration discovery',
  'Listed by Mauritania Ministry among small/medium offshore discoveries.',
  0,
  0,
  'bbl',
  0,
  'bbl (oil reserves not established in public source',
  NULL,
  NULL,
  'discovery (oil type/API not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Not producing',
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
  'Faucon Discovery',
  'Not producing',
  'Offshore (Mauritanian Coastal Basin)',
  'Mauritania',
  'Offshore (Mauritanian Coastal Basin)',
  19.55,
  -17.05,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'inactive',
  'Not producing',
  'exploration discovery',
  'Listed by Mauritania Ministry among small/medium offshore discoveries.',
  0,
  0,
  'bbl',
  0,
  'bbl (oil reserves not established in public source',
  NULL,
  NULL,
  'discovery (oil type/API not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Not producing',
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
  'Abelinda Discovery',
  'Not producing',
  'Offshore (Mauritanian Coastal Basin)',
  'Mauritania',
  'Offshore (Mauritanian Coastal Basin)',
  19.5,
  -17.0,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'inactive',
  'Not producing',
  'exploration discovery',
  'Listed by Mauritania Ministry among small/medium offshore discoveries.',
  0,
  0,
  'bbl',
  0,
  'bbl (oil reserves not established in public source',
  NULL,
  NULL,
  'discovery (oil type/API not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'Not producing',
  NULL
);
