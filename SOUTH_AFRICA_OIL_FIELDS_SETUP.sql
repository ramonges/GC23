-- ============================================
-- SOUTH AFRICA OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T16:24:52.051136
-- Total sites: 4
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
  IF date_text IS NULL OR date_text = '' THEN RETURN NULL; END IF;
  IF date_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RETURN date_text::DATE; END IF;
  IF date_text ~ '^[0-9]{4}-[0-9]{2}$' THEN RETURN (date_text || '-01')::DATE; END IF;
  IF date_text ~ '^[0-9]{4}$' THEN RETURN (date_text || '-01-01')::DATE; END IF;
  RETURN NULL;
EXCEPTION WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 3: INSERT COMPANIES
-- ============================================

INSERT INTO public.companies (name, type, headquarters_country, commodities_traded)
VALUES
  ('PetroSA', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET commodities_traded = EXCLUDED.commodities_traded;

-- ============================================
-- STEP 4: DELETE EXISTING SOUTH AFRICA DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'South Africa';

-- ============================================
-- STEP 5: INSERT SOUTH AFRICA SITES
-- ============================================

INSERT INTO public.commodity_locations (
  title, owner, address, country, region, latitude, longitude,
  commodity_type, commodity_name, location_type, operational_status,
  operator, ownership_type, ownership_details,
  production_monthly, production_yearly, production_unit,
  estimated_reserves, reserves_unit, start_date, closing_date,
  quality_type, api_gravity, quality_sulfur_content, grade,
  last_transaction_value, last_transaction_currency, last_transaction_date,
  contract_duration_years, pipelines, ports, rail_connections, company, additional_info
) VALUES (
  'Oribi Oil Field (E-BT)',
  'PetroSA',
  'Western Cape (offshore, Bredasdorp Basin / Outeniqua region)',
  'South Africa',
  'Western Cape (offshore, Bredasdorp Basin / Outeniqua region)',
  -35.0,
  21.0,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'closed',
  'PetroSA',
  'state-owned',
  'Reported as PetroSA-owned/operated in later years; early development cited 80% Soekor (operator) / 20% Energy Africa Bredasdorp (Pty) Ltd (historical).',
  0,
  0,
  'bbl',
  0,
  'bbl (remaining)',
  parse_flexible_date('1997-01-01'),
  parse_flexible_date('2015-06-01'),
  'light sweet crude',
  42,
  0.1212,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY['Mossel Bay (FPSO lay-up/operations support)', 'Cape Town (FPSO inspections/recertification support - historical)'],
  ARRAY[]::text[],
  'PetroSA',
  NULL
);

INSERT INTO public.commodity_locations (
  title, owner, address, country, region, latitude, longitude,
  commodity_type, commodity_name, location_type, operational_status,
  operator, ownership_type, ownership_details,
  production_monthly, production_yearly, production_unit,
  estimated_reserves, reserves_unit, start_date, closing_date,
  quality_type, api_gravity, quality_sulfur_content, grade,
  last_transaction_value, last_transaction_currency, last_transaction_date,
  contract_duration_years, pipelines, ports, rail_connections, company, additional_info
) VALUES (
  'Oryx Oil Field',
  'PetroSA',
  'Western Cape (offshore, Bredasdorp Basin / Outeniqua region)',
  'South Africa',
  'Western Cape (offshore, Bredasdorp Basin / Outeniqua region)',
  -35.1,
  21.1,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'closed',
  'PetroSA',
  'state-owned',
  'Operated by PetroSA; commonly developed/produced as the combined Oribi/Oryx project using the Orca FPSO.',
  0,
  0,
  'bbl',
  0,
  'bbl (remaining)',
  parse_flexible_date('1997-01-01'),
  parse_flexible_date('2015-06-01'),
  'light sweet crude (reported as ''Oribi crude'' qualities often referenced for the combined stream)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY['Mossel Bay (FPSO lay-up/operations support)', 'Cape Town (FPSO inspections/recertification support - historical)'],
  ARRAY[]::text[],
  'PetroSA',
  NULL
);

INSERT INTO public.commodity_locations (
  title, owner, address, country, region, latitude, longitude,
  commodity_type, commodity_name, location_type, operational_status,
  operator, ownership_type, ownership_details,
  production_monthly, production_yearly, production_unit,
  estimated_reserves, reserves_unit, start_date, closing_date,
  quality_type, api_gravity, quality_sulfur_content, grade,
  last_transaction_value, last_transaction_currency, last_transaction_date,
  contract_duration_years, pipelines, ports, rail_connections, company, additional_info
) VALUES (
  'Sable Oil Field (Block 9)',
  'PetroSA',
  'Western Cape (offshore, Bredasdorp Basin / Outeniqua region)',
  'South Africa',
  'Western Cape (offshore, Bredasdorp Basin / Outeniqua region)',
  -35.2,
  21.2,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'closed',
  'PetroSA',
  'JV',
  'PetroSA 60% (operator); Pioneer Natural Resources 40% (historical partner).',
  0,
  0,
  'bbl',
  0,
  'bbl (remaining)',
  parse_flexible_date('2003-08-01'),
  parse_flexible_date('2008-09-01'),
  'unknown (public sources commonly describe as crude oil; detailed API not consistently published in o',
  NULL,
  NULL,
  NULL,
  52000000,
  'USD',
  parse_flexible_date('2012-08-21'),
  NULL,
  ARRAY[]::text[],
  ARRAY['Saldanha Bay', 'Cape Town', 'Durban'],
  ARRAY[]::text[],
  'PetroSA',
  NULL
);

INSERT INTO public.commodity_locations (
  title, owner, address, country, region, latitude, longitude,
  commodity_type, commodity_name, location_type, operational_status,
  operator, ownership_type, ownership_details,
  production_monthly, production_yearly, production_unit,
  estimated_reserves, reserves_unit, start_date, closing_date,
  quality_type, api_gravity, quality_sulfur_content, grade,
  last_transaction_value, last_transaction_currency, last_transaction_date,
  contract_duration_years, pipelines, ports, rail_connections, company, additional_info
) VALUES (
  'Sable Oil Field (E-BD / E-CE reservoirs)',
  'PetroSA',
  'Offshore South Coast (Bredasdorp Basin, offshore Western Cape)',
  'South Africa',
  'Offshore South Coast (Bredasdorp Basin, offshore Western Cape)',
  -35.2,
  21.2,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'closed',
  'PetroSA',
  'JV',
  'PetroSA 60% (operator) and Pioneer Natural Resources 40% (working interest) reported in multiple sources.',
  0,
  0,
  'bbl',
  0,
  'bbl (remaining)',
  parse_flexible_date('2003-08-01'),
  parse_flexible_date('2008-01-01'),
  'crude oil (API not found in accessible public sources)',
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
  'PetroSA',
  NULL
);
