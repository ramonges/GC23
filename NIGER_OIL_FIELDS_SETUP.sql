-- ============================================
-- NIGER OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T16:24:52.046045
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
  ('CNPC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('Savannah Energy', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET commodities_traded = EXCLUDED.commodities_traded;

-- ============================================
-- STEP 4: DELETE EXISTING NIGER DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'Niger';

-- ============================================
-- STEP 5: INSERT NIGER SITES
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
  'Agadem Oilfield (Koulele–Dibeilla Oilfield Group)',
  'CNPC',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNPC',
  'PSC',
  'Agadem Production Sharing Contract signed 2008 between CNPC (via CNODC/CNPC Niger Petroleum S.A.) and Government of Niger; detailed profit oil split not consistently disclosed in public sources.',
  600000,
  7300000,
  'bbl (crude oil, estimated; based on ~20,000 bpd hi',
  744000000,
  'bbl (oil; cited basin/block estimate for Agadem bl',
  parse_flexible_date('2011-11-01'),
  NULL,
  'light (reported for Agadem Rift Basin discoveries in Sokor Alternances trend; exact API for Koulele/',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2008-01-01'),
  NULL,
  ARRAY['Agadem–Zinder (SORAZ) crude oil pipeline (~463 km; ~13-inch)', 'Niger–Benin Export Pipeline (NBEP) – origin station at Koulele (Agadem Oil Zone)'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'CNPC',
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
  'Agadem Oilfield (FGD Oilfield Group)',
  'CNPC',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNPC',
  'PSC',
  'Part of CNPC-led Agadem integrated oil development; publicly described as separate oilfield group within Agadem Phase I surface project (alongside Koulele & Dibeilla group).',
  0,
  0,
  'bbl (field-group level production not separately d',
  0,
  'bbl (not publicly broken out by FGD group)',
  parse_flexible_date('2011-11-01'),
  NULL,
  'unknown (not publicly specified for FGD group)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2008-01-01'),
  NULL,
  ARRAY['Agadem–Zinder (SORAZ) crude oil pipeline (~463 km; ~13-inch)', 'Niger–Benin Export Pipeline (NBEP) – originates at Koulele area of Agadem Oil Zone'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'CNPC',
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
  'Goumeri Oil Field (Agadem)',
  'CNPC',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNPC',
  'PSC',
  'Identified as a major oil field within Agadem Phase I surface project; CNPC-operated under Agadem PSC with Government of Niger.',
  0,
  0,
  'bbl (not publicly disclosed by field)',
  0,
  'bbl (field-level remaining reserves not publicly d',
  parse_flexible_date('2011-11-01'),
  NULL,
  'unknown (field-specific crude assay not publicly disclosed)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2008-01-01'),
  NULL,
  ARRAY['Agadem–Zinder (SORAZ) crude oil pipeline (~463 km; ~13-inch)', 'Niger–Benin Export Pipeline (NBEP) – fed from Agadem Oil Zone facilities'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'CNPC',
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
  'Sokor Oil Field (Agadem)',
  'CNPC',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNPC',
  'PSC',
  'Identified as a major oil field within Agadem Phase I surface project; CNPC-operated under Agadem PSC with Government of Niger.',
  0,
  0,
  'bbl (not publicly disclosed by field)',
  0,
  'bbl (field-level remaining reserves not publicly d',
  parse_flexible_date('2011-11-01'),
  NULL,
  'unknown (field-specific crude assay not publicly disclosed)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2008-01-01'),
  NULL,
  ARRAY['Agadem–Zinder (SORAZ) crude oil pipeline (~463 km; ~13-inch)', 'Niger–Benin Export Pipeline (NBEP) – origin station at Koulele near Koulele CPF, with upstream gathering from Agadem fields including Sokor'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'CNPC',
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
  'Amdigh Field (R3 East, Agadem Rift Basin)',
  'Savannah Energy',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Savannah Energy',
  'PSC',
  'R3/R4 PSC area operated by Savannah; field is part of Savannah’s R3 East discoveries; gross resources disclosed by Savannah for the discovery cluster rather than field-by-field.',
  0,
  0,
  'bbl (development/testing/EPS timing not publicly c',
  35000000,
  'bbl (gross 2C resources for Savannah’s R3 East dis',
  parse_flexible_date('2018-01-01'),
  NULL,
  'light oil (reported for Savannah’s Agadem Rift Basin Sokor Alternances discoveries; API not consiste',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-01-01'),
  NULL,
  ARRAY['Potential tie-in to Niger–Benin Export Pipeline (NBEP) (Savannah states pipeline provides route to markets)'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'Savannah Energy',
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
  'Bushiya Field (R3 East, Agadem Rift Basin)',
  'Savannah Energy',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Savannah Energy',
  'PSC',
  'R3/R4 PSC area operated by Savannah; Bushiya is one of the five consecutive discovery wells in R3 East.',
  0,
  0,
  'bbl (development/testing/EPS timing not publicly c',
  35000000,
  'bbl (gross 2C resources for Savannah’s R3 East dis',
  parse_flexible_date('2018-01-01'),
  NULL,
  'light oil (reported by industry press for Sokor Alternances objective trend)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-01-01'),
  NULL,
  ARRAY['Potential tie-in to Niger–Benin Export Pipeline (NBEP)'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'Savannah Energy',
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
  'Kunama Field (R3 East, Agadem Rift Basin)',
  'Savannah Energy',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Savannah Energy',
  'PSC',
  'R3/R4 PSC area operated by Savannah; Kunama-1 reported as discovery in R3 East.',
  0,
  0,
  'bbl (development/testing/EPS timing not publicly c',
  35000000,
  'bbl (gross 2C resources for Savannah’s R3 East dis',
  parse_flexible_date('2018-07-01'),
  NULL,
  'light oil (reported as similar/light and consistent with trend)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-07-12'),
  NULL,
  ARRAY['Potential tie-in to Niger–Benin Export Pipeline (NBEP)'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'Savannah Energy',
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
  'Eridal Field (R3 East, Agadem Rift Basin)',
  'Savannah Energy',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Savannah Energy',
  'PSC',
  'R3/R4 PSC area operated by Savannah; Eridal-1 discovery reported August 2018 in Sokor Alternances objective.',
  0,
  0,
  'bbl (development/testing/EPS timing not publicly c',
  35000000,
  'bbl (gross 2C resources for Savannah’s R3 East dis',
  parse_flexible_date('2018-08-01'),
  NULL,
  'light oil (reported by OGJ/industry press for Eridal-1)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-08-15'),
  NULL,
  ARRAY['Potential tie-in to Niger–Benin Export Pipeline (NBEP)'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'Savannah Energy',
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
  'Zomo Field (R3 East, Agadem Rift Basin)',
  'Savannah Energy',
  'Diffa Region (Agadem Rift Basin)',
  'Niger',
  'Diffa Region (Agadem Rift Basin)',
  14.5,
  13.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Savannah Energy',
  'PSC',
  'R3/R4 PSC area operated by Savannah; Zomo-1 discovery announced Oct 2018.',
  0,
  0,
  'bbl (development/testing/EPS timing not publicly c',
  35000000,
  'bbl (gross 2C resources for Savannah’s R3 East dis',
  parse_flexible_date('2018-10-05'),
  NULL,
  'light oil (reported as consistent with Savannah discoveries and basin trend)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-10-05'),
  NULL,
  ARRAY['Potential tie-in to Niger–Benin Export Pipeline (NBEP)'],
  ARRAY['Port of Sèmè / Sèmè-Kpodji offshore terminal (Benin)'],
  ARRAY[]::text[],
  'Savannah Energy',
  NULL
);
