-- ============================================
-- SUDAN OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T16:24:52.052889
-- Total sites: 20
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
  ('2B', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('CNPC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('DPOC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('GPOC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('Red', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('Sudd', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('WNPOC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET commodities_traded = EXCLUDED.commodities_traded;

-- ============================================
-- STEP 4: DELETE EXISTING SUDAN DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'Sudan';

-- ============================================
-- STEP 5: INSERT SUDAN SITES
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
  'Heglig (Higlig) Oil Field',
  'GPOC',
  'West Kordofan (near Abyei area)',
  'Sudan',
  'West Kordofan (near Abyei area)',
  10.0068,
  29.39859,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (consortium)',
  'GPOC/GNPOC consortium: CNPC 40%, Petronas 30%, ONGC Videsh 25%, Nilepet/Sudapet 5% (varies by jurisdiction/asset)',
  0,
  0,
  'bbl (not consistently disclosed field-level; Hegli',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1996-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline (Unity/Heglig to Khartoum to Port Sudan export system)'],
  ARRAY['Port Sudan (crude export terminal/refinery complex)'],
  ARRAY[]::text[],
  'GPOC',
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
  'Unity Oil Field',
  'GPOC',
  'Unity State (Rubkona County; Ruweng/Unity area)',
  'Sudan',
  'Unity State (Rubkona County; Ruweng/Unity area)',
  9.4776,
  29.67463,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (consortium)',
  'GPOC consortium: CNPC 40%, Petronas 30%, ONGC Videsh 25%, Nilepet 5%',
  0,
  0,
  'bbl (field-level current varies; reported ~15,000 ',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline (via Heglig/Unity system to Khartoum and Port Sudan)'],
  ARRAY['Port Sudan (crude export terminal/refinery complex)'],
  ARRAY[]::text[],
  'GPOC',
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
  'Bamboo Oil Field',
  '2B',
  'West Kordofan (near Al Muglad)',
  'Sudan',
  'West Kordofan (near Al Muglad)',
  9.7,
  29.4,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  '2B',
  'unknown/PSC-JV (not consistently disclosed publicly)',
  'Reported operated by 2B OPCO; block-level partners not consistently disclosed in open sources',
  210000,
  2555000,
  'bbl (approx from ~7,000 bpd reported)',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline system (via Heglig processing/export corridor)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  '2B',
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
  'Toma South Oil Field',
  'GPOC',
  'Unity State (near Bentiu/Unity operations area)',
  'Sudan',
  'Unity State (near Bentiu/Unity operations area)',
  9.80528,
  29.58139,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (consortium)',
  'GPOC consortium: CNPC 40%, Petronas 30%, ONGC Videsh 25%, Nilepet 5%',
  0,
  0,
  'bbl (not consistently disclosed field-level)',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline system (Unity/Heglig to Khartoum to Port Sudan)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  'GPOC',
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
  'Munga Oil Field',
  'GPOC',
  'Unity State (Block 1/2/4 area)',
  'Sudan',
  'Unity State (Block 1/2/4 area)',
  9.5,
  29.6,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (consortium)',
  'GPOC consortium: CNPC 40%, Petronas 30%, ONGC Videsh 25%, Nilepet 5%',
  0,
  0,
  'bbl (not consistently disclosed field-level)',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline system (Unity/Heglig to Khartoum to Port Sudan)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  'GPOC',
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
  'El Toor Oil Field',
  'GPOC',
  'Unity State (Block 1/2/4 area)',
  'Sudan',
  'Unity State (Block 1/2/4 area)',
  9.55,
  29.55,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (consortium)',
  'GPOC consortium: CNPC 40%, Petronas 30%, ONGC Videsh 25%, Nilepet 5%',
  0,
  0,
  'bbl (not consistently disclosed field-level)',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline system (Unity/Heglig to Khartoum to Port Sudan)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  'GPOC',
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
  'El Noor Oil Field',
  'GPOC',
  'Unity State (Block 1/2/4 area)',
  'Sudan',
  'Unity State (Block 1/2/4 area)',
  9.6,
  29.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (consortium)',
  'GPOC consortium: CNPC 40%, Petronas 30%, ONGC Videsh 25%, Nilepet 5%',
  0,
  0,
  'bbl (not consistently disclosed field-level)',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline system (Unity/Heglig to Khartoum to Port Sudan)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  'GPOC',
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
  'Diffra Oil Field',
  'GPOC',
  'Unity State (Block 4 area)',
  'Sudan',
  'Unity State (Block 4 area)',
  9.65,
  29.45,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (consortium)',
  'GPOC consortium: CNPC 40%, Petronas 30%, ONGC Videsh 25%, Nilepet 5%',
  0,
  0,
  'bbl (not consistently disclosed field-level)',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline system (Unity/Heglig to Khartoum to Port Sudan)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  'GPOC',
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
  'Neem (NEEM) Oil Field',
  'GPOC',
  'Unity State (Block 4 area)',
  'Sudan',
  'Unity State (Block 4 area)',
  9.7,
  29.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (consortium)',
  'GPOC consortium: CNPC 40%, Petronas 30%, ONGC Videsh 25%, Nilepet 5%',
  0,
  0,
  'bbl (not consistently disclosed field-level)',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Greater Nile Oil Pipeline system (Unity/Heglig to Khartoum to Port Sudan)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  'GPOC',
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
  'Thar Jath Oil Field (Block 5A)',
  'WNPOC',
  'Unity State (Block 5A)',
  'Sudan',
  'Unity State (Block 5A)',
  9.3,
  29.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'WNPOC',
  'PSC/JV (contractor group)',
  'Block 5A contractors reported historically: Petronas, ONGC Videsh, Sudapet/Nilepet (exact % varies by period/source); WNPOC was reported as Petronas/Sudapet JV in some periods',
  0,
  0,
  'bbl (initially ~20,000 bpd; plans stated up to 60,',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('2006-06-29'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  311000000,
  'USD',
  parse_flexible_date('2005-01-01'),
  NULL,
  ARRAY['Thar Jath to Heglig pump station pipeline (~172 km)', 'Greater Nile Oil Pipeline (Heglig/Unity to Khartoum to Port Sudan)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  'WNPOC',
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
  'Mala Oil Field (Block 5A)',
  'WNPOC',
  'Unity State (Block 5A)',
  'Sudan',
  'Unity State (Block 5A)',
  9.35,
  29.75,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'WNPOC',
  'PSC/JV (contractor group)',
  'Block 5A contractors reported historically: Petronas, ONGC Videsh, Sudapet/Nilepet (exact % varies by period/source)',
  0,
  0,
  'bbl (not consistently disclosed field-level)',
  0,
  'bbl (not reliably disclosed for field)',
  parse_flexible_date('2006-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  33.9,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Block 5A export line to GNPOC/GPOC system (via Heglig/Unity corridor)', 'Greater Nile Oil Pipeline (to Port Sudan)'],
  ARRAY['Port Sudan (export)'],
  ARRAY[]::text[],
  'WNPOC',
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
  'Fula Oil Field / Fula Complex (Block 6)',
  'CNPC',
  'Kordofan (northwest Muglad Basin; Block 6)',
  'Sudan',
  'Kordofan (northwest Muglad Basin; Block 6)',
  12.0,
  27.0,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'CNPC',
  'JV / concession',
  'Block 6 equity reported: CNPC 95%, Sudapet 5%',
  1650000,
  20075000,
  'bbl (approx from ~55,000 bpd reported for 2011; cu',
  745000000,
  'bbl',
  parse_flexible_date('2004-03-01'),
  NULL,
  'Fula blend (highly acidic crude)',
  21.0,
  0.14,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Block 6 (Fula) pipeline to Khartoum refinery (domestic processing)'],
  ARRAY[]::text[],
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
  'Paloch (Great Palogue / Paloich) Oil Field',
  'DPOC',
  'Upper Nile State',
  'Sudan',
  'Upper Nile State',
  10.46211,
  32.54055,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (Production Sharing Contract)',
  'CNPC 41%; PETRONAS 40%; NILEPET 8%; SINOPEC 6%; TRI-OCEAN 5% (as reported by NILEPET/MoP partners pages)',
  3809375,
  46330769,
  'barrels (bbl)',
  900000000,
  'barrels (recoverable, basin/field-scale estimate)',
  parse_flexible_date('2001-01-01'),
  NULL,
  'Dar Blend crude (heavy, acidic; widely described as discounted vs Brent)',
  25.0,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Melut Basin Oil Export Pipeline (PetroDar pipeline) to Port Sudan (Dar Blend export line)'],
  ARRAY['Port Sudan'],
  ARRAY[]::text[],
  'DPOC',
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
  'Adar Yale (Adar / Adaril / Adar Yeil) Oil Field',
  'DPOC',
  'Upper Nile State',
  'Sudan',
  'Upper Nile State',
  10.008014,
  32.958759,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (Production Sharing Contract)',
  'Blocks 3E/7E JV per NILEPET/MoP: CNPC 41%; PETRONAS 40%; NILEPET 8%; SINOPEC 6%; TRI-OCEAN 5%',
  3809375,
  46330769,
  'barrels (bbl)',
  276000000,
  'barrels (oil in place / estimated)',
  parse_flexible_date('1997-01-01'),
  NULL,
  'Dar Blend crude (field contributes to Dar Blend stream; heavy/acidic blend)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Melut Basin Oil Export Pipeline (PetroDar pipeline) to Port Sudan (Dar Blend export line)'],
  ARRAY['Port Sudan'],
  ARRAY[]::text[],
  'DPOC',
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
  'Agordeed Oil Field',
  'DPOC',
  'Upper Nile State',
  'Sudan',
  'Upper Nile State',
  NULL,
  NULL,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (Production Sharing Contract)',
  'Developed as part of Blocks 3 & 7 Melut Basin development led by PetroDar/DPOC consortium (CNPC/PETRONAS/Sudapet-or-Nilepet/SINOPEC/Tri-Ocean per consortium disclosures)',
  3809375,
  46330769,
  'barrels (bbl)',
  0,
  'barrels',
  parse_flexible_date('2006-01-01'),
  NULL,
  'Dar Blend crude (field contributes to Dar Blend stream; specific assay not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Melut Basin Oil Export Pipeline (PetroDar pipeline) to Port Sudan (Dar Blend export line)'],
  ARRAY['Port Sudan'],
  ARRAY[]::text[],
  'DPOC',
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
  'Moleeta Oil Field',
  'DPOC',
  'Upper Nile State',
  'Sudan',
  'Upper Nile State',
  10.5,
  32.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (Production Sharing Contract)',
  'Blocks 3E/7E JV per NILEPET/MoP: CNPC 41%; PETRONAS 40%; NILEPET 8%; SINOPEC 6%; TRI-OCEAN 5%',
  3809375,
  46330769,
  'barrels (bbl)',
  0,
  'barrels',
  parse_flexible_date('2001-01-01'),
  NULL,
  'Dar Blend crude (field contributes to Dar Blend stream; specific assay not found)',
  NULL,
  NULL,
  NULL,
  100000000,
  'USD',
  parse_flexible_date('2007-01-01'),
  NULL,
  ARRAY['Melut Basin Oil Export Pipeline (PetroDar pipeline) to Port Sudan (Dar Blend export line)'],
  ARRAY['Port Sudan'],
  ARRAY[]::text[],
  'DPOC',
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
  'Gumry Oil Field',
  'DPOC',
  'Upper Nile State',
  'Sudan',
  'Upper Nile State',
  10.45,
  32.55,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (Production Sharing Contract)',
  'Blocks 3E/7E JV per NILEPET/MoP: CNPC 41%; PETRONAS 40%; NILEPET 8%; SINOPEC 6%; TRI-OCEAN 5%',
  3809375,
  46330769,
  'barrels (bbl)',
  0,
  'barrels',
  parse_flexible_date('2001-01-01'),
  NULL,
  'Dar Blend crude (field contributes to Dar Blend stream; specific assay not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Melut Basin Oil Export Pipeline (PetroDar pipeline) to Port Sudan (Dar Blend export line)'],
  ARRAY['Port Sudan'],
  ARRAY[]::text[],
  'DPOC',
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
  'Gassab Oil Field',
  'DPOC',
  'Upper Nile State',
  'Sudan',
  'Upper Nile State',
  10.4,
  32.6,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (Production Sharing Contract)',
  'Blocks 3E/7E JV per NILEPET/MoP: CNPC 41%; PETRONAS 40%; NILEPET 8%; SINOPEC 6%; TRI-OCEAN 5%',
  3809375,
  46330769,
  'barrels (bbl)',
  0,
  'barrels',
  parse_flexible_date('2001-01-01'),
  NULL,
  'Dar Blend crude (field contributes to Dar Blend stream; specific assay not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Melut Basin Oil Export Pipeline (PetroDar pipeline) to Port Sudan (Dar Blend export line)'],
  ARRAY['Port Sudan'],
  ARRAY[]::text[],
  'DPOC',
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
  'Thar Jath (Tharjiath / Tharjath) Oil Field (Block 5A)',
  'Sudd',
  'Unity State',
  'Sudan',
  'Unity State',
  9.3,
  29.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Sudd',
  'JV (Production Sharing Contract)',
  'PETRONAS 67.8%; ONGC 24.2%; NILEPET 8% (as reported by NILEPET/MoP partners pages)',
  0,
  0,
  'barrels (bbl)',
  0,
  'barrels',
  parse_flexible_date('2006-06-01'),
  NULL,
  'Nile Blend (high-quality per multiple industry/news summaries; specific assay not found)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Tharjath–Heglig tie-in pipeline (reported ~172 km to GNPOC pump station at Heglig)', 'Greater Nile Oil Pipeline (from Heglig/Unity system to Port Sudan)'],
  ARRAY['Port Sudan'],
  ARRAY[]::text[],
  'Sudd',
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
  'Tokar-1 (Block 15) exploration well / Red Sea Basin (Sudan)',
  'Red',
  'Red Sea State (offshore)',
  'Sudan',
  'Red Sea State (offshore)',
  19.5,
  38.0,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'closed',
  'Red',
  'JV (consortium)',
  'Consortium reported: CNPC (~35%), Petronas (~35%), Sudapet, Express Petroleum (Nigeria), High Tech Group (Sudan); equity for non-CNPC/Petronas partners not consistently published in open sources.',
  0,
  0,
  'barrels_oil',
  0,
  'barrels_oil',
  parse_flexible_date('2010-02-01'),
  NULL,
  'unknown (no commercial oil production publicly confirmed for Block 15/Tokar-1)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY[]::text[],
  ARRAY['Port Sudan (planned/nearest export hub; no confirmed crude exports from Block 15)'],
  ARRAY['Port Sudan rail hub (general; no dedicated oil rail exports confirmed for Block 15)'],
  'Red',
  NULL
);
