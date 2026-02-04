-- ============================================
-- UGANDA OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T16:24:52.054866
-- Total sites: 24
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
  ('CNOOC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('TotalEnergies', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET commodities_traded = EXCLUDED.commodities_traded;

-- ============================================
-- STEP 4: DELETE EXISTING UGANDA DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'Uganda';

-- ============================================
-- STEP 5: INSERT UGANDA SITES
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
  'Kingfisher Field (Kingfisher Development Area, KFDA)',
  'CNOOC',
  'Kikuube District (Western Region; Lake Albert shore)',
  'Uganda',
  'Kikuube District (Western Region; Lake Albert shore)',
  1.0,
  30.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNOOC',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TotalEnergies E&P Uganda (TEPU) 56.67%; CNOOC Uganda (CUL) 28.33%; UNOC 15%',
  0,
  0,
  'barrels (planned/at-plateau 40,000 bopd CPF capaci',
  186000000,
  'barrels (recoverable resources, MMbbl)',
  parse_flexible_date('2025-10-01'),
  NULL,
  'medium-light, waxy crude',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Kingfisher feeder pipeline (10-inch; ~48 km) to Kabaale (Hoima) delivery point', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'CNOOC',
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
  'Jobi-Rii Field (Tilenga Project)',
  'TotalEnergies',
  'Nwoya District / Buliisa District (North of Lake Albert region; River Nile/Victoria Nile area)',
  'Uganda',
  'Nwoya District / Buliisa District (North of Lake Albert region; River Nile/Victoria Nile area)',
  1.8,
  31.3,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TEPU 56.67%; CNOOC Uganda Limited 28.33%; UNOC 15%',
  0,
  0,
  'barrels (part of Tilenga; peak project capacity 19',
  0,
  'barrels (not field-disclosed in public sources)',
  parse_flexible_date('2025-10-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95-96 km) from Tilenga CPF (Buliisa) to Kabaale (Hoima) / EACOP pumping station', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Gunya Field (Tilenga Project)',
  'TotalEnergies',
  'Buliisa District / Nwoya District (Albertine Graben)',
  'Uganda',
  'Buliisa District / Nwoya District (Albertine Graben)',
  1.7,
  31.25,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TEPU 56.67%; CNOOC Uganda Limited 28.33%; UNOC 15%',
  0,
  0,
  'barrels (part of Tilenga; peak project capacity 19',
  0,
  'barrels (not field-disclosed in public sources)',
  parse_flexible_date('2025-10-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95-96 km) from Tilenga CPF (Buliisa) to Kabaale (Hoima) / EACOP pumping station', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Ngiri Field (Tilenga Project)',
  'TotalEnergies',
  'Buliisa District / Nwoya District (Albertine Graben)',
  'Uganda',
  'Buliisa District / Nwoya District (Albertine Graben)',
  1.75,
  31.3,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TEPU 56.67%; CNOOC Uganda Limited 28.33%; UNOC 15%',
  0,
  0,
  'barrels (part of Tilenga; peak project capacity 19',
  0,
  'barrels (not field-disclosed in public sources)',
  parse_flexible_date('2025-10-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95-96 km) from Tilenga CPF (Buliisa) to Kabaale (Hoima) / EACOP pumping station', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Kasamene–Wahrindi Field (Tilenga Project)',
  'TotalEnergies',
  'Buliisa District (Albertine Graben)',
  'Uganda',
  'Buliisa District (Albertine Graben)',
  1.6,
  31.2,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TEPU 56.67%; CNOOC Uganda Limited 28.33%; UNOC 15%',
  0,
  0,
  'barrels (part of Tilenga; peak project capacity 19',
  0,
  'barrels (Tilenga project recoverable resources rep',
  parse_flexible_date('2025-10-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95-96 km) from Tilenga CPF (Buliisa) to Kabaale (Hoima) / EACOP pumping station', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Kigogole–Ngara Field (Tilenga Project)',
  'TotalEnergies',
  'Buliisa District (Albertine Graben)',
  'Uganda',
  'Buliisa District (Albertine Graben)',
  1.55,
  31.15,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TEPU 56.67%; CNOOC Uganda Limited 28.33%; UNOC 15%',
  0,
  0,
  'barrels (part of Tilenga; peak project capacity 19',
  0,
  'barrels (not field-disclosed in public sources)',
  parse_flexible_date('2025-10-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95-96 km) from Tilenga CPF (Buliisa) to Kabaale (Hoima) / EACOP pumping station', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Nsoga Field (Tilenga Project)',
  'TotalEnergies',
  'Buliisa District (Albertine Graben)',
  'Uganda',
  'Buliisa District (Albertine Graben)',
  1.45,
  31.05,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TEPU 56.67%; CNOOC Uganda Limited 28.33%; UNOC 15%',
  0,
  0,
  'barrels (part of Tilenga; peak project capacity 19',
  0,
  'barrels (not field-disclosed in public sources)',
  parse_flexible_date('2025-10-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95-96 km) from Tilenga CPF (Buliisa) to Kabaale (Hoima) / EACOP pumping station', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Ngara Field (Albertine Graben; Production Licence; later-phase development)',
  'TotalEnergies',
  'Buliisa District (Albertine Graben)',
  'Uganda',
  'Buliisa District (Albertine Graben)',
  1.5,
  31.1,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TEPU 56.67%; CNOOC Uganda Limited 28.33%; UNOC 15%',
  0,
  0,
  'barrels (planned; not yet producing)',
  0,
  'barrels (not publicly field-disclosed)',
  parse_flexible_date('2030-01-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline to Kabaale (Hoima) export hub (project infrastructure)', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Ngege Field (Albertine Graben; Production Licence; later-phase development)',
  'TotalEnergies',
  'Buliisa District (Albertine Graben)',
  'Uganda',
  'Buliisa District (Albertine Graben)',
  1.4,
  31.0,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV / PSC-style upstream joint venture under Production Licence',
  'TEPU 56.67%; CNOOC Uganda Limited 28.33%; UNOC 15%',
  0,
  0,
  'barrels (planned; not yet producing)',
  0,
  'barrels (not publicly field-disclosed)',
  parse_flexible_date('2030-01-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline to Kabaale (Hoima) export hub (project infrastructure)', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Mputa Field (Albertine Graben; Production Licence; later-phase tie-in to Kingfisher system)',
  'CNOOC',
  'Hoima District (Albertine Graben)',
  'Uganda',
  'Hoima District (Albertine Graben)',
  1.0,
  30.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNOOC',
  'JV / PSC-style upstream joint venture under Production Licence',
  'Common Uganda upstream JV interests widely reported as TEPU 56.67%; CUL 28.33%; UNOC 15% (field-specific breakdown not confirmed in public sources for Mputa)',
  0,
  0,
  'barrels (planned; not yet producing)',
  0,
  'barrels (not publicly field-disclosed)',
  parse_flexible_date('2030-01-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Connection/tie-in planned to Kingfisher CPF and feeder pipeline system to Kabaale (Hoima) delivery point', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'CNOOC',
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
  'Nzizi Field (Albertine Graben; Production Licence; later-phase tie-in to Kingfisher system)',
  'CNOOC',
  'Hoima District (Albertine Graben)',
  'Uganda',
  'Hoima District (Albertine Graben)',
  1.0,
  30.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNOOC',
  'JV / PSC-style upstream joint venture under Production Licence',
  'Common Uganda upstream JV interests widely reported as TEPU 56.67%; CUL 28.33%; UNOC 15% (field-specific breakdown not confirmed in public sources for Nzizi)',
  0,
  0,
  'barrels (planned; not yet producing)',
  0,
  'barrels (not publicly field-disclosed)',
  parse_flexible_date('2030-01-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Connection/tie-in planned to Kingfisher CPF and feeder pipeline system to Kabaale (Hoima) delivery point', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'CNOOC',
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
  'Waraga Field (Albertine Graben; Production Licence; later-phase tie-in to Kingfisher system)',
  'CNOOC',
  'Hoima District (Albertine Graben)',
  'Uganda',
  'Hoima District (Albertine Graben)',
  1.0,
  30.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNOOC',
  'JV / PSC-style upstream joint venture under Production Licence',
  'Common Uganda upstream JV interests widely reported as TEPU 56.67%; CUL 28.33%; UNOC 15% (field-specific breakdown not confirmed in public sources for Waraga)',
  0,
  0,
  'barrels (planned; not yet producing)',
  0,
  'barrels (not publicly field-disclosed)',
  parse_flexible_date('2030-01-01'),
  NULL,
  'medium-light, waxy crude (Lake Albert blend typical)',
  30,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Connection/tie-in planned to Kingfisher CPF and feeder pipeline system to Kabaale (Hoima) delivery point', 'East African Crude Oil Pipeline (EACOP) (heated) via Kabaale export hub'],
  ARRAY['Tanga Port (Chongoleani peninsula), Tanzania (via EACOP)'],
  ARRAY[]::text[],
  'CNOOC',
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
  'Jobi-Rii Oilfield (Tilenga Project)',
  'TotalEnergies',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  'Uganda',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  1.8,
  31.3,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV under Production Licences (PSC-style upstream JV)',
  'TEPU 56.67%; CNOOC Uganda Ltd 28.33%; UNOC 15%',
  2100000,
  25550000,
  'bbl (estimated plateau share; ~70,000 bpd as publi',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2026-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95 km) to EACOP Pump Station 1 (PS1)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Ngiri Oilfield (Tilenga Project)',
  'TotalEnergies',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  'Uganda',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  1.75,
  31.3,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV under Production Licences (PSC-style upstream JV)',
  'TEPU 56.67%; CNOOC Uganda Ltd 28.33%; UNOC 15%',
  1500000,
  18250000,
  'bbl (estimated plateau share; ~50,000 bpd as publi',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2026-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95 km) to EACOP Pump Station 1 (PS1)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Gunya Oilfield (Tilenga Project)',
  'TotalEnergies',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  'Uganda',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  1.7,
  31.25,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV under Production Licences (PSC-style upstream JV)',
  'TEPU 56.67%; CNOOC Uganda Ltd 28.33%; UNOC 15%',
  300000,
  3650000,
  'bbl (best-estimate; field-level public production ',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2026-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95 km) to EACOP Pump Station 1 (PS1)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Kasamene-Wahrindi Oilfield (Tilenga Project)',
  'TotalEnergies',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  'Uganda',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  1.6,
  31.2,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV under Production Licences (PSC-style upstream JV)',
  'TEPU 56.67%; CNOOC Uganda Ltd 28.33%; UNOC 15%',
  697500,
  8486875,
  'bbl (estimated plateau share; Kasamene ~20,000 bpd',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2026-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95 km) to EACOP Pump Station 1 (PS1)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Kigogole-Ngara Oilfield (Tilenga Project)',
  'TotalEnergies',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  'Uganda',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  1.55,
  31.15,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV under Production Licences (PSC-style upstream JV)',
  'TEPU 56.67%; CNOOC Uganda Ltd 28.33%; UNOC 15%',
  300000,
  3650000,
  'bbl (best-estimate; field-level public production ',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2026-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95 km) to EACOP Pump Station 1 (PS1)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Nsoga Oilfield (Tilenga Project)',
  'TotalEnergies',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  'Uganda',
  'Buliisa/Nwoya (Albertine Graben, Lake Albert region)',
  1.45,
  31.05,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV under Production Licences (PSC-style upstream JV)',
  'TEPU 56.67%; CNOOC Uganda Ltd 28.33%; UNOC 15%',
  600000,
  7300000,
  'bbl (estimated plateau share; ~20,000 bpd as publi',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2026-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tilenga feeder pipeline (~95 km) to EACOP Pump Station 1 (PS1)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Kingfisher Oilfield (Kingfisher Development Area, KFDA)',
  'CNOOC',
  'Kikuube District (Albertine Graben, Lake Albert region)',
  'Uganda',
  'Kikuube District (Albertine Graben, Lake Albert region)',
  1.0,
  30.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNOOC',
  'JV under Production Licences (PSC-style upstream JV)',
  'TEPU 56.67%; CNOOC Uganda Ltd 28.33%; UNOC 15% (PAU states TEPU is majority PI; CNOOC is operator for KFDA)',
  1200000,
  14600000,
  'bbl (plateau assumption: 40,000 bopd CPF capacity)',
  186000000,
  'bbl (recoverable resources for KFDA)',
  parse_flexible_date('2026-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Kingfisher feeder pipeline (10-inch, ~48 km) to Kabaale Delivery Point', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'CNOOC',
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
  'Mputa Oilfield (future tie-in; Production Licence)',
  'CNOOC',
  'Albertine Graben, Lake Albert region',
  'Uganda',
  'Albertine Graben, Lake Albert region',
  1.3,
  30.95,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNOOC',
  'JV under Production Licences (PSC-style upstream JV)',
  'Commonly reported JV structure in Lake Albert upstream: TEPU 56.67%; CNOOC 28.33%; UNOC 15% (field-level specifics not consistently disclosed)',
  135000,
  1642500,
  'bbl (best-estimate from published expectation ~4,5',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2031-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tie-in to upstream gathering system to EACOP (planned)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'CNOOC',
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
  'Waraga Oilfield (future tie-in; Production Licence)',
  'CNOOC',
  'Albertine Graben, Lake Albert region',
  'Uganda',
  'Albertine Graben, Lake Albert region',
  1.2,
  30.85,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNOOC',
  'JV under Production Licences (PSC-style upstream JV)',
  'Commonly reported JV structure in Lake Albert upstream: TEPU 56.67%; CNOOC 28.33%; UNOC 15% (field-level specifics not consistently disclosed)',
  135000,
  1642500,
  'bbl (best-estimate from published expectation ~4,5',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2031-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tie-in to upstream gathering system to EACOP (planned)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'CNOOC',
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
  'Nzizi Oil & Gas Field (future tie-in; Production Licence)',
  'CNOOC',
  'Albertine Graben, Lake Albert region',
  'Uganda',
  'Albertine Graben, Lake Albert region',
  1.25,
  30.9,
  'Energy',
  'Oil & Gas',
  'oil_field',
  'active',
  'CNOOC',
  'JV under Production Licences (PSC-style upstream JV)',
  'Commonly reported JV structure in Lake Albert upstream: TEPU 56.67%; CNOOC 28.33%; UNOC 15% (field-level specifics not consistently disclosed)',
  9000,
  109500,
  'bbl (best-estimate from published expectation ~300',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2031-06-30'),
  NULL,
  'Waxy crude and associated gas (public reporting notes gas at Nzizi; detailed crude specs not consist',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tie-in to upstream gathering system to EACOP (planned)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'CNOOC',
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
  'Ngara Oilfield (future tie-in; Production Licence)',
  'TotalEnergies',
  'Albertine Graben, Lake Albert region',
  'Uganda',
  'Albertine Graben, Lake Albert region',
  1.5,
  31.1,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV under Production Licences (PSC-style upstream JV)',
  'Commonly reported JV structure in Lake Albert upstream: TEPU 56.67%; CNOOC 28.33%; UNOC 15% (field-level specifics not consistently disclosed)',
  22500,
  273750,
  'bbl (best-estimate from published expectation ~750',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2031-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tie-in to upstream gathering system to EACOP (planned)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'TotalEnergies',
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
  'Ngege Oilfield (future tie-in; Production Licence)',
  'TotalEnergies',
  'Albertine Graben, Lake Albert region',
  'Uganda',
  'Albertine Graben, Lake Albert region',
  1.4,
  31.0,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'TotalEnergies',
  'JV under Production Licences (PSC-style upstream JV)',
  'Commonly reported JV structure in Lake Albert upstream: TEPU 56.67%; CNOOC 28.33%; UNOC 15% (field-level specifics not consistently disclosed)',
  97500,
  1186250,
  'bbl (best-estimate from published expectation ~3,2',
  1400000000,
  'bbl (recoverable; Uganda total estimate used as fi',
  parse_flexible_date('2031-06-30'),
  NULL,
  'Waxy crude (heated export required)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2022-02-01'),
  25,
  ARRAY['Tie-in to upstream gathering system to EACOP (planned)', 'East African Crude Oil Pipeline (EACOP) 1,443 km heated pipeline to Tanzania'],
  ARRAY['Port of Tanga (Tanzania) - EACOP export terminal'],
  ARRAY[]::text[],
  'TotalEnergies',
  NULL
);
