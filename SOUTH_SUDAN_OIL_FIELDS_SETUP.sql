-- ============================================
-- SOUTH SUDAN OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T16:17:29.658596
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
  ('2B', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('DPOC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('GPOC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('SPOC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET commodities_traded = EXCLUDED.commodities_traded;

-- ============================================
-- STEP 4: DELETE EXISTING SOUTH SUDAN DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'South Sudan';

-- ============================================
-- STEP 5: INSERT SOUTH SUDAN SITES
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
  'Heglig (Panthou) oil field / Heglig CPF',
  'GPOC',
  'West Kordofan (near Abyei/South Sudan border)',
  'South Sudan',
  'West Kordofan (near Abyei/South Sudan border)',
  10.0066666667,
  29.3986111111,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV (GNPOC/GPOC consortium; Nile Blend system)',
  'Reported consortium shareholders: CNPC 40%, PETRONAS 30%, ONGC Videsh 25%, Nilepet/Sudapet 5% (shareholder mix varies by Sudan vs South Sudan entities)',
  1825000,
  21900000,
  'barrels (approx; based on ~60,000 bpd referenced f',
  0,
  'barrels (not reliably stated in public sources for',
  parse_flexible_date('1996-01-01'),
  NULL,
  'Nile Blend (light sweet) from Muglad Basin system; mixed streams also handled',
  32.8,
  0.05,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2025-12-17'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (Unity–Heglig–Khartoum–Port Sudan corridor)', 'Thar Jath–Heglig link pipeline (~172 km, ties Block 5A into Greater Nile system)'],
  ARRAY['Bashayer (Marsā al-Bashāyir) Marine Terminal / Port Sudan export facilities'],
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
  'Unity oil field (Block 1/2/4 system)',
  'GPOC',
  'Unity State (Rubkona County area, Bentiu vicinity)',
  'South Sudan',
  'Unity State (Rubkona County area, Bentiu vicinity)',
  9.4776,
  29.67463,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV/PSC-style consortium',
  'GPOC consortium listed: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  456250,
  5475000,
  'barrels (approx; based on ~15,000 bpd noted after ',
  0,
  'barrels (remaining not reliably published)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (light sweet, Muglad system)',
  32.8,
  0.05,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2019-01-22'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (starts from Unity area per basin descriptions)'],
  ARRAY['Bashayer Marine Terminal / Port Sudan export facilities'],
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
  'Toma South oil field (Block 1/2/4 system)',
  'GPOC',
  'Unity State / Ruweng area (near Bentiu region)',
  'South Sudan',
  'Unity State / Ruweng area (near Bentiu region)',
  9.8052777778,
  29.5813888889,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV/PSC-style consortium',
  'GPOC consortium listed: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  0,
  0,
  'barrels (field-level current production not public',
  0,
  'barrels (remaining not reliably published)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (light sweet, Muglad system)',
  32.8,
  0.05,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('1999-01-01'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (via Unity/Heglig system)'],
  ARRAY['Bashayer Marine Terminal / Port Sudan export facilities'],
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
  'Munga oil field (Block 1/2/4 system)',
  'GPOC',
  'Unity State / Ruweng area',
  'South Sudan',
  'Unity State / Ruweng area',
  9.5,
  29.6,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV/PSC-style consortium',
  'GPOC consortium listed: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  0,
  0,
  'barrels (field-level current production not public',
  0,
  'barrels (remaining not reliably published)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (light sweet, Muglad system)',
  32.8,
  0.05,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('1999-01-01'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (via Unity/Heglig system)'],
  ARRAY['Bashayer Marine Terminal / Port Sudan export facilities'],
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
  'El Toor (Toor/Athony) oil field (Block 1/2/4 system)',
  'GPOC',
  'Unity State / Ruweng area',
  'South Sudan',
  'Unity State / Ruweng area',
  9.55,
  29.55,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV/PSC-style consortium',
  'GPOC consortium listed: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  0,
  0,
  'barrels (field-level current production not public',
  0,
  'barrels (remaining not reliably published)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (light sweet, Muglad system)',
  32.8,
  0.05,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('1999-01-01'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (via Unity/Heglig system)'],
  ARRAY['Bashayer Marine Terminal / Port Sudan export facilities'],
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
  'El Nar (El Nar/El Nar field listed in Block 1/2/4)',
  'GPOC',
  'Unity State / Ruweng area',
  'South Sudan',
  'Unity State / Ruweng area',
  9.6,
  29.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'JV/PSC-style consortium',
  'GPOC consortium listed: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  0,
  0,
  'barrels (field-level current production not public',
  0,
  'barrels (remaining not reliably published)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (light sweet, Muglad system)',
  32.8,
  0.05,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('1999-01-01'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (via Unity/Heglig system)'],
  ARRAY['Bashayer Marine Terminal / Port Sudan export facilities'],
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
  'Bamboo oil field',
  '2B',
  'West Kordofan (Al-Muglad area)',
  'South Sudan',
  'West Kordofan (Al-Muglad area)',
  9.7,
  29.4,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  '2B',
  'JV/PSC (not fully disclosed in public sources)',
  'Operated by 2B OPCO; detailed partner equity not reliably captured in publicly accessible sources for this record',
  212800,
  2553600,
  'barrels (approx; based on ~7,000 bpd reported)',
  0,
  'barrels (remaining not reliably published)',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend system (light sweet, typical for Muglad exports)',
  32.8,
  0.05,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2025-12-17'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (via Heglig/Unity system)'],
  ARRAY['Bashayer Marine Terminal / Port Sudan export facilities'],
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
  'Thar Jath (Tharjath) oil field (Block 5A)',
  'SPOC',
  'Unity State (Tharjath area)',
  'South Sudan',
  'Unity State (Tharjath area)',
  9.3,
  29.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'closed',
  'SPOC',
  'PSC/JV consortium',
  'Partners equity listed: PETRONAS 67.8%, ONGC 24.2%, NILEPET 8%',
  0,
  0,
  'barrels (shutdown per operator info)',
  250000000,
  'barrels (field reserves figure commonly cited)',
  parse_flexible_date('2006-06-01'),
  parse_flexible_date('2013-12-01'),
  'sweet heavy crude (Thar Jath crude)',
  22.0,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2006-08-23'),
  NULL,
  ARRAY['Thar Jath–Heglig link pipeline (~172 km) connecting to Greater Nile system', 'Greater Nile Oil Pipeline (via Heglig connection)'],
  ARRAY['Bashayer Marine Terminal / Port Sudan export facilities'],
  ARRAY[]::text[],
  'SPOC',
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
  'Mala oil field (Block 5A)',
  'SPOC',
  'Unity State (Block 5A)',
  'South Sudan',
  'Unity State (Block 5A)',
  9.35,
  29.75,
  'Energy',
  'Crude Oil',
  'oil_field',
  'closed',
  'SPOC',
  'PSC/JV consortium',
  'Partners equity listed: PETRONAS 67.8%, ONGC 24.2%, NILEPET 8%',
  0,
  0,
  'barrels (shutdown per operator info)',
  0,
  'barrels (not reliably published)',
  parse_flexible_date('2007-01-01'),
  parse_flexible_date('2013-12-01'),
  'heavy crude associated with Block 5A system (often marketed within Nile Blend logistics)',
  22.0,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2007-01-01'),
  NULL,
  ARRAY['Thar Jath–Heglig link pipeline (~172 km) connecting to Greater Nile system', 'Greater Nile Oil Pipeline (via Heglig connection)'],
  ARRAY['Bashayer Marine Terminal / Port Sudan export facilities'],
  ARRAY[]::text[],
  'SPOC',
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
  'Palogue (Great Palogue / Paloich) Oil Field',
  'DPOC',
  'Upper Nile State (Melut County)',
  'South Sudan',
  'Upper Nile State (Melut County)',
  10.43,
  32.47,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (PSC/EPSA consortium)',
  'DPOC shareholders reported: CNPC 41%; Petronas 40%; Nilepet 8%; Sinopec 6%; Tri-Ocean 5%',
  3090000,
  37595000,
  'barrels (bbl)',
  900000000,
  'barrels (recoverable; widely cited range ~850–900 ',
  parse_flexible_date('2003-01-01'),
  NULL,
  'Dar Blend heavy paraffinic crude (high TAN; low sulfur)',
  25,
  0.11,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-03-01'),
  6,
  ARRAY['PetroDar (Melut Basin) Export Pipeline / "Dar Blend" pipeline to Bashayer Marine Terminal (near Port Sudan)'],
  ARRAY['Bashayer Marine Terminal (near Port Sudan, Red Sea)'],
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
  'Adar-Yale (Adar / Adaril / Adar Yeil) Oil Field',
  'DPOC',
  'Upper Nile State (around Mabaan County / Melut Basin)',
  'South Sudan',
  'Upper Nile State (around Mabaan County / Melut Basin)',
  10.008014,
  32.958759,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (PSC/EPSA consortium)',
  'DPOC shareholders reported: CNPC 41%; Petronas 40%; Nilepet 8%; Sinopec 6%; Tri-Ocean 5%',
  3090000,
  37595000,
  'barrels (bbl)',
  276000000,
  'barrels (estimated oil in field per published summ',
  parse_flexible_date('1997-01-01'),
  NULL,
  'Dar Blend heavy paraffinic crude (high TAN; low sulfur)',
  25,
  0.11,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2005-11-01'),
  6,
  ARRAY['PetroDar (Melut Basin) Export Pipeline / "Dar Blend" pipeline to Bashayer Marine Terminal (near Port Sudan)'],
  ARRAY['Bashayer Marine Terminal (near Port Sudan, Red Sea)'],
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
  'Moleeta Oil Field (Block 3/7 supplementary field)',
  'DPOC',
  'Upper Nile State (Paloch area, Melut Basin)',
  'South Sudan',
  'Upper Nile State (Paloch area, Melut Basin)',
  10.5,
  32.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (PSC/EPSA consortium)',
  'DPOC shareholders reported: CNPC 41%; Petronas 40%; Nilepet 8%; Sinopec 6%; Tri-Ocean 5%',
  1500000,
  18250000,
  'barrels (bbl)',
  100000000,
  'barrels (order-of-magnitude estimate; field refere',
  parse_flexible_date('2007-01-01'),
  NULL,
  'Dar Blend family crude (heavy; waxy/high viscosity feed reported for Moleeta streams)',
  25,
  0.11,
  NULL,
  100000000,
  'USD',
  parse_flexible_date('2007-01-01'),
  6,
  ARRAY['Infield gathering lines to Palogue/Al-Jabalayn processing; PetroDar (Melut Basin) Export Pipeline to Bashayer Marine Terminal'],
  ARRAY['Bashayer Marine Terminal (near Port Sudan, Red Sea)'],
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
  'Gassab Oil Field (Block 3/7)',
  'DPOC',
  'Upper Nile State (Paloch area, Melut Basin)',
  'South Sudan',
  'Upper Nile State (Paloch area, Melut Basin)',
  10.4,
  32.6,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (PSC/EPSA consortium)',
  'DPOC shareholders reported: CNPC 41%; Petronas 40%; Nilepet 8%; Sinopec 6%; Tri-Ocean 5%',
  650000,
  7916667,
  'barrels (bbl)',
  50000000,
  'barrels (best-effort estimate; field listed by DPO',
  parse_flexible_date('2001-01-01'),
  NULL,
  'Dar Blend family crude (heavy; low sulfur; high TAN typical)',
  25,
  0.11,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2001-01-01'),
  6,
  ARRAY['PetroDar (Melut Basin) Export Pipeline / "Dar Blend" pipeline to Bashayer Marine Terminal (near Port Sudan)'],
  ARRAY['Bashayer Marine Terminal (near Port Sudan, Red Sea)'],
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
  'Gumry Oil Field (Block 3/7)',
  'DPOC',
  'Upper Nile State (Paloch area, Melut Basin)',
  'South Sudan',
  'Upper Nile State (Paloch area, Melut Basin)',
  10.45,
  32.55,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (PSC/EPSA consortium)',
  'DPOC shareholders reported: CNPC 41%; Petronas 40%; Nilepet 8%; Sinopec 6%; Tri-Ocean 5%',
  650000,
  7916667,
  'barrels (bbl)',
  50000000,
  'barrels (best-effort estimate; field listed by DPO',
  parse_flexible_date('2001-01-01'),
  NULL,
  'Dar Blend family crude (heavy; low sulfur; high TAN typical)',
  25,
  0.11,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2001-01-01'),
  6,
  ARRAY['PetroDar (Melut Basin) Export Pipeline / "Dar Blend" pipeline to Bashayer Marine Terminal (near Port Sudan)'],
  ARRAY['Bashayer Marine Terminal (near Port Sudan, Red Sea)'],
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
  'Fal (Palogue–Fal) Oil Field',
  'DPOC',
  'Upper Nile State (Melut Basin; Blocks 3/7 area)',
  'South Sudan',
  'Upper Nile State (Melut Basin; Blocks 3/7 area)',
  10.43,
  32.47,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (PSC/EPSA consortium)',
  'DPOC shareholders reported: CNPC 41%; Petronas 40%; Nilepet 8%; Sinopec 6%; Tri-Ocean 5%',
  800000,
  9733333,
  'barrels (bbl)',
  300000000,
  'barrels (best-effort estimate; literature describe',
  parse_flexible_date('2005-01-01'),
  NULL,
  'Dar Blend family crude (heavy; low sulfur; high TAN typical)',
  25,
  0.11,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2005-11-01'),
  6,
  ARRAY['PetroDar (Melut Basin) Export Pipeline / "Dar Blend" pipeline to Bashayer Marine Terminal (near Port Sudan)'],
  ARRAY['Bashayer Marine Terminal (near Port Sudan, Red Sea)'],
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
  'Qamari Oil Field (Blocks 3/7)',
  'DPOC',
  'Upper Nile State (Melut Basin; Blocks 3/7 area)',
  'South Sudan',
  'Upper Nile State (Melut Basin; Blocks 3/7 area)',
  10.55,
  32.45,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (PSC/EPSA consortium)',
  'DPOC shareholders reported: CNPC 41%; Petronas 40%; Nilepet 8%; Sinopec 6%; Tri-Ocean 5%',
  450000,
  5475000,
  'barrels (bbl)',
  40000000,
  'barrels (best-effort estimate; described as a star',
  parse_flexible_date('2009-01-01'),
  NULL,
  'Dar Blend family crude (heavy; low sulfur; high TAN typical)',
  25,
  0.11,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2009-01-01'),
  6,
  ARRAY['PetroDar (Melut Basin) Export Pipeline / "Dar Blend" pipeline to Bashayer Marine Terminal (near Port Sudan)'],
  ARRAY['Bashayer Marine Terminal (near Port Sudan, Red Sea)'],
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
  'Agordeed Oil Field (Blocks 3/7; Block 3 discovery/development)',
  'DPOC',
  'Upper Nile State (Melut Basin; Blocks 3/7 area)',
  'South Sudan',
  'Upper Nile State (Melut Basin; Blocks 3/7 area)',
  10.35,
  32.7,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'DPOC',
  'JV (PSC/EPSA consortium)',
  'DPOC shareholders reported: CNPC 41%; Petronas 40%; Nilepet 8%; Sinopec 6%; Tri-Ocean 5%',
  400000,
  4866667,
  'barrels (bbl)',
  30000000,
  'barrels (best-effort estimate; field named in upst',
  parse_flexible_date('2005-01-01'),
  NULL,
  'Dar Blend family crude (heavy; low sulfur; high TAN typical)',
  25,
  0.11,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2004-07-01'),
  6,
  ARRAY['PetroDar (Melut Basin) Export Pipeline / "Dar Blend" pipeline to Bashayer Marine Terminal (near Port Sudan)'],
  ARRAY['Bashayer Marine Terminal (near Port Sudan, Red Sea)'],
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
  'Unity oil field (Unity Field)',
  'GPOC',
  'Unity State',
  'South Sudan',
  'Unity State',
  9.4776,
  29.67463,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'Joint venture (consortium under EPSA/PSC)',
  'GPOC consortium: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  450000,
  5475000,
  'bbl',
  150000000,
  'bbl',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2017-12-31'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (Unity-origin, export via Sudan)', 'Unity-to-Heglig link / gathering system (field-to-CPF/FPF and onward connection)'],
  ARRAY['Port Sudan Marine Terminal (Red Sea)'],
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
  'Toma South oil field (also reported as Hufra / Kaloch area)',
  'GPOC',
  'Unity State',
  'South Sudan',
  'Unity State',
  9.8052777778,
  29.5813888889,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'Joint venture (consortium under EPSA/PSC)',
  'GPOC consortium: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  675000,
  8212500,
  'bbl',
  0,
  'bbl',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-08-25'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (export via Sudan)'],
  ARRAY['Port Sudan Marine Terminal (Red Sea)'],
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
  'Munga oil field',
  'GPOC',
  'Unity State',
  'South Sudan',
  'Unity State',
  9.5,
  29.6,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'Joint venture (consortium under EPSA/PSC)',
  'GPOC consortium: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  62500,
  760417,
  'bbl',
  0,
  'bbl',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-08-25'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (export via Sudan)'],
  ARRAY['Port Sudan Marine Terminal (Red Sea)'],
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
  'El Toor oil field (Al-Toor)',
  'GPOC',
  'Unity State',
  'South Sudan',
  'Unity State',
  9.55,
  29.55,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'Joint venture (consortium under EPSA/PSC)',
  'GPOC consortium: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  62500,
  760417,
  'bbl',
  0,
  'bbl',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-08-25'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (export via Sudan)'],
  ARRAY['Port Sudan Marine Terminal (Red Sea)'],
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
  'El Nar oil field (Al-Nar / El Mar reported)',
  'GPOC',
  'Unity State',
  'South Sudan',
  'Unity State',
  9.6,
  29.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'GPOC',
  'Joint venture (consortium under EPSA/PSC)',
  'GPOC consortium: CNPC 40%, PETRONAS 30%, ONGC 25%, NILEPET 5%',
  62500,
  760417,
  'bbl',
  0,
  'bbl',
  parse_flexible_date('1999-01-01'),
  NULL,
  'Nile Blend (medium, waxy)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2018-08-25'),
  NULL,
  ARRAY['Greater Nile Oil Pipeline (export via Sudan)'],
  ARRAY['Port Sudan Marine Terminal (Red Sea)'],
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
  'Tharjiath oil field (Block 5A; also spelled Thar Jath/Tharjiath)',
  'SPOC',
  'Unity State',
  'South Sudan',
  'Unity State',
  9.3,
  29.8,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'SPOC',
  'Joint venture (consortium under EPSA/PSC)',
  'Block 5A partners (per MOP): PETRONAS 67.8%, ONGC 24.2%, NILEPET 8%',
  600000,
  7300000,
  'bbl',
  250000000,
  'bbl',
  parse_flexible_date('2006-06-26'),
  NULL,
  'Nile Blend (medium, waxy)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_flexible_date('2021-06-21'),
  NULL,
  ARRAY['Tharjiath/Thar Jath to Unity export pipeline (~110 miles / ~172 km, reported)', 'Greater Nile Oil Pipeline (via Unity connection; export via Sudan)'],
  ARRAY['Port Sudan Marine Terminal (Red Sea)'],
  ARRAY[]::text[],
  'SPOC',
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
  'Jarayan oil field (Block 5A discovery/accumulation)',
  'SPOC',
  'Unity State',
  'South Sudan',
  'Unity State',
  NULL,
  NULL,
  'Energy',
  'Crude Oil',
  'oil_field',
  'closed',
  'SPOC',
  'Joint venture (consortium under EPSA/PSC)',
  'Block 5A partners (per MOP): PETRONAS 67.8%, ONGC 24.2%, NILEPET 8%',
  0,
  0,
  'bbl',
  0,
  'bbl',
  NULL,
  NULL,
  'unknown',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['(If developed) Block 5A gathering to Tharjiath CPF and onward export via Unity connection', 'Greater Nile Oil Pipeline (via Unity connection; export via Sudan)'],
  ARRAY['Port Sudan Marine Terminal (Red Sea)'],
  ARRAY[]::text[],
  'SPOC',
  NULL
);
