-- ============================================
-- BRUNEI OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T15:51:57.338561
-- Total sites: 15
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
  ('EnQuest', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('Hibiscus Petroleum', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('Shell', 'producer', 'United Kingdom', ARRAY['Crude Oil', 'Natural Gas'])

ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;


-- ============================================
-- STEP 4: DELETE EXISTING BRUNEI DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country IN ('Brunei', 'Brunei Darussalam');

-- ============================================
-- STEP 5: INSERT BRUNEI SITES
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
  'Champion Field',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'Brunei-Muara (offshore), Brunei',
  'Brunei',
  'Brunei-Muara (offshore)',
  5.0,
  114.0,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'JV (50/50)',
  'Brunei Shell Petroleum is a 50:50 joint venture between the Government of Brunei and Shell; field commonly described as owned/operated by BSP as the JV operator.',
  2796000,
  34018000,
  'bbl (oil, estimate based on ~92,000 bpd reported for 2010)',
  0,
  'bbl (remaining not publicly disclosed; government treats reserves as sensitive)',
  parse_site_date('1972'),
  NULL,
  'Mixed (heavy and light crude reported for Champion complex)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Champion offshore production/export pipeline system to Seria (Seria Crude Oil Terminal/SCOT)'],
  ARRAY['Seria Crude Oil Terminal (SCOT)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'South West Ampa (SWA/Ampa) Field',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'Belait (offshore), Brunei',
  'Brunei',
  'Belait (offshore)',
  4.7,
  113.9,
  'Energy',
  'Oil & Gas',
  'oil_and_gas_field',
  'active',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'JV (50/50)',
  'BSP (Government of Brunei/Shell 50:50) is described as operator; field described as owned by Government of Brunei and BSP/Shell.',
  0,
  0,
  'bbl (oil) / boe (field is primarily gas; current oil/condensate rate not consistently published)',
  0,
  'bbl/boe (remaining not publicly disclosed; reserve estimates treated as sensitive)',
  parse_site_date('1965'),
  NULL,
  'Gas field with oil rim / condensate',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Gas export pipelines to Brunei LNG (Lumut)', 'Ampa/Fairley/Champion offshore pipeline network (various tie-ins)'],
  ARRAY['Lumut LNG/industrial port area (Brunei LNG export)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Fairley Field',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'Belait (offshore), Brunei',
  'Brunei',
  'Belait (offshore)',
  4.85,
  113.95,
  'Energy',
  'Oil & Gas',
  'oil_and_gas_field',
  'active',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'JV (50/50)',
  'Operated within BSP offshore agreement area; BSP is Government/Shell 50:50 JV; detailed field equity split not publicly stated per-field.',
  0,
  0,
  'bbl (oil) / boe (gas+liquids; current site rate not consistently published)',
  0,
  'bbl/boe (not publicly disclosed)',
  parse_site_date('1972'),
  NULL,
  'Oil and gas',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Fairley area gas pipelines tied into Brunei LNG supply system', 'Ampa-Fairley rationalisation / integrated pipeline network (various subsea lines)'],
  ARRAY['Lumut LNG/industrial port area (export via Brunei LNG for gas)', 'Seria Crude Oil Terminal (SCOT) (for crude)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Fairley-Baram Field',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'Belait (offshore), Brunei',
  'Brunei',
  'Belait (offshore)',
  4.88,
  114.0,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'JV (state/Shell via BSP)',
  'Owned by Government of Brunei and Shell; operated by BSP per field profile sources.',
  0,
  0,
  'bbl (oil; current production not published in accessible sources)',
  0,
  'bbl (remaining not provided in accessible public sources)',
  NULL,
  NULL,
  'Conventional oil',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['BSP offshore export pipeline network (Fairley-Baram area tie-ins)'],
  ARRAY['Seria Crude Oil Terminal (SCOT)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Selangkir-Iron Duke (SKID) Field',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'Belait (offshore), Brunei',
  'Brunei',
  'Belait (offshore)',
  4.8,
  114.2,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'JV (state/Shell via BSP)',
  'Owned by Government of Brunei and Shell; operated by BSP per field profile sources.',
  0,
  0,
  'bbl (oil; current production not published in accessible sources)',
  0,
  'bbl (remaining not provided in accessible public sources)',
  NULL,
  NULL,
  'Conventional oil',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['BSP offshore export pipeline network (SKID area tie-ins)'],
  ARRAY['Seria Crude Oil Terminal (SCOT)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Egret Field',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'Belait (offshore), Brunei',
  'Brunei',
  'Belait (offshore)',
  4.95,
  113.85,
  'Energy',
  'Oil & Gas',
  'oil_and_gas_field',
  'active',
  'Brunei Shell Petroleum Company Sdn Bhd (BSP)',
  'JV (50/50 via BSP)',
  'Operated by BSP; BSP is Government/Shell 50:50 JV (field-level equity not consistently published).',
  0,
  0,
  'bbl (oil/condensate; current production not reliably published)',
  0,
  'bbl/boe (not publicly disclosed)',
  parse_site_date('2006'),
  NULL,
  'Oil and gas',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['BSP offshore pipeline network (Egret area tie-ins)'],
  ARRAY['Seria Crude Oil Terminal (SCOT)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Maharaja Lela/Jamalulalam (MLJ) Field (Block B)',
  'Hibiscus Brunei (Hibiscus Petroleum)',
  'Offshore (Block B), Brunei',
  'Brunei',
  'Offshore (Block B)',
  5.2,
  114.8,
  'Energy',
  'Oil & Gas',
  'oil_and_gas_field',
  'active',
  'Hibiscus Brunei (Hibiscus Petroleum)',
  'Concession / JV (percentages known)',
  'Block B participants reported historically as TotalEnergies 37.5% (operator), Shell Deepwater Borneo 35%, Brunei Energy Exploration (BEE) 27.5%; operator transitioned to Hibiscus (acquired 37.5% operated interest, completed Oct 2024 per Hibiscus).',
  0,
  0,
  'boe (gas+condensate; field produced ~28,500 boe/d in 2007 per OGJ; current operator reports asset in production but does not publish a single field rate)',
  0,
  'boe (remaining not stated in accessible public sources)',
  parse_site_date('1999'),
  NULL,
  'Gas and condensate (HP/HT compartments present)',
  NULL,
  NULL,
  NULL,
  259000000,
  'USD',
  parse_site_date('2024-10-01'),
  NULL,
  ARRAY['Field pipelines to onshore processing plant (per Hibiscus description)', 'Gas delivery route to Brunei LNG (Lumut) (reported historically for Block B gas)'],
  ARRAY['Lumut LNG/industrial port area (Brunei LNG export)'],
  ARRAY[]::TEXT[],
  'Hibiscus Petroleum',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Merpati Field (Block C)',
  'EnQuest',
  'Offshore (Block C), Brunei',
  'Brunei',
  'Offshore (Block C)',
  5.3,
  115.0,
  'Energy',
  'Oil & Gas',
  'oil_and_gas_field',
  'active',
  'EnQuest',
  'PSC / intended JV (50/50 JVC planned)',
  'EnQuest awarded PSA for Block C (Jul 16, 2025) with intention to form 50/50 joint venture company with BEE; Block C hosts discovered fields Merpati, Meragi, Juragan; first gas targeted 2029 per EnQuest.',
  0,
  0,
  'bbl/boe (not yet in production; development planning announced; condensate-rich gas)',
  0,
  'boe (not disclosed in PSA announcement)',
  NULL,
  NULL,
  'Condensate-rich gas',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_site_date('2025-07-16'),
  NULL,
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  'EnQuest',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Meragi Field (Block C)',
  'EnQuest',
  'Offshore (Block C), Brunei',
  'Brunei',
  'Offshore (Block C)',
  5.32,
  115.02,
  'Energy',
  'Oil & Gas',
  'oil_and_gas_field',
  'active',
  'EnQuest',
  'PSC / intended JV (50/50 JVC planned)',
  'Discovered field within Block C per EnQuest PSA award announcement; JV structure planned 50/50 with BEE after establishment.',
  0,
  0,
  'bbl/boe (not yet in production; discovered field within Block C PSA area)',
  0,
  'boe (not disclosed)',
  NULL,
  NULL,
  'Condensate-rich gas',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_site_date('2025-07-16'),
  NULL,
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  'EnQuest',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Juragan Field (Block C)',
  'EnQuest',
  'Offshore (Block C), Brunei',
  'Brunei',
  'Offshore (Block C)',
  5.28,
  114.98,
  'Energy',
  'Oil & Gas',
  'oil_and_gas_field',
  'active',
  'EnQuest',
  'PSC / intended JV (50/50 JVC planned)',
  'Discovered field within Block C per EnQuest PSA award announcement; JV structure planned 50/50 with BEE after establishment.',
  0,
  0,
  'bbl/boe (not yet in production; discovered field within Block C PSA area)',
  0,
  'boe (not disclosed)',
  NULL,
  NULL,
  'Condensate-rich gas',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  parse_site_date('2025-07-16'),
  NULL,
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  'EnQuest',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Seria Oil Field (Onshore)',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'Belait District (Seria), Brunei',
  'Brunei',
  'Belait District (Seria)',
  4.6103,
  114.325,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'JV (state-Shell)',
  'BSP is a joint venture: Government of Brunei 50% / Shell 50% (commonly reported structure for BSP-operated fields).',
  600000,
  7300000,
  'barrels (oil)',
  0,
  'barrels (remaining not publicly disclosed for the field; mature field with >1 billion bbl cumulative produced)',
  parse_site_date('1929'),
  NULL,
  'light sweet crude',
  40.5,
  0.06,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Onshore gathering pipeline network feeding Seria Crude Oil Terminal (SCOT)', 'Onshore field pipelines interconnecting Seria/Mumong/Kuala Belait corridor (BSP onshore network)'],
  ARRAY['Seria Crude Oil Terminal (SCOT)', 'SCOT Single Buoy Mooring (SBM) offshore loading point'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Rasau Oil Field (Onshore)',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'Belait District (Mukim Kuala Belait / Rasau), Brunei',
  'Brunei',
  'Belait District (Mukim Kuala Belait / Rasau)',
  4.5606,
  114.1596,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'JV (state-Shell)',
  'Government of Brunei 50% / Shell 50% (via BSP; commonly reported).',
  0,
  0,
  'barrels (oil) (not publicly disclosed)',
  0,
  'barrels (not publicly disclosed)',
  parse_site_date('1983'),
  NULL,
  'unknown',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Rasau Production Station pipelines to Seria tank farms via Mumong (as reported in secondary references)', 'Pipeline connection to Seria refinery area via Kuala Belait (as reported in secondary references)'],
  ARRAY['Seria Crude Oil Terminal (SCOT) (export via onshore system)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Magpie Field (Offshore)',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'Offshore Brunei (north-east of Seria), Brunei',
  'Brunei',
  'Offshore Brunei (north-east of Seria)',
  4.75,
  114.5,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'JV (state-Shell)',
  'Government of Brunei 50% / Shell 50% (via BSP; commonly reported).',
  180000,
  2190000,
  'barrels (oil)',
  0,
  'barrels (not publicly disclosed)',
  parse_site_date('1977'),
  NULL,
  'unknown',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Offshore gathering/export pipeline(s) to onshore Seria area terminal system (BSP network; specific line names not publicly disclosed)'],
  ARRAY['Seria Crude Oil Terminal (SCOT)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Champion Field (Champion Complex)',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'Offshore Brunei (approx. 40 km offshore), Brunei',
  'Brunei',
  'Offshore Brunei (approx. 40 km offshore)',
  5.0,
  114.0,
  'Energy',
  'Crude Oil',
  'oil_field',
  'active',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'JV (state-Shell)',
  'Government of Brunei 50% / Shell 50% (via BSP; commonly reported).',
  0,
  0,
  'barrels (oil) (current field rate not publicly disclosed as a single figure)',
  0,
  'barrels (remaining not publicly disclosed)',
  parse_site_date('1972'),
  NULL,
  'medium (often marketed as Champion Export; low sulfur)',
  23.9,
  0.12,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Offshore export pipeline(s) from Champion to onshore Seria Crude Oil Terminal (SCOT) (BSP network; specific line names not publicly disclosed)'],
  ARRAY['Seria Crude Oil Terminal (SCOT)', 'SCOT Single Buoy Mooring (SBM) offshore loading point'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
),
(
  'Champion West Field',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'Offshore Brunei (satellite of Champion), Brunei',
  'Brunei',
  'Offshore Brunei (satellite of Champion)',
  4.98,
  113.95,
  'Energy',
  'Oil & Gas',
  'oil_and_gas_field',
  'active',
  'Brunei Shell Petroleum Co. Sdn. Bhd. (BSP)',
  'JV (state-Shell)',
  'Government of Brunei 50% / Shell 50% (via BSP; commonly reported).',
  0,
  0,
  'barrels (oil) (not publicly disclosed)',
  0,
  'barrels (not publicly disclosed)',
  parse_site_date('1975'),
  NULL,
  'unknown (oil & gas)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Tie-back/export via Champion facilities and onward pipeline system to SCOT (specific pipeline names not publicly disclosed)'],
  ARRAY['Seria Crude Oil Terminal (SCOT)'],
  ARRAY[]::TEXT[],
  'Shell',
  '{"source": "Brunei_all_sites.json", "generated_date": "2026-01-21 22:35:25"}' ::JSONB
)
;


-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

SELECT COUNT(*) as total_brunei_sites, 
       COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as sites_with_coordinates,
       COUNT(CASE WHEN operational_status = 'active' THEN 1 END) as active_sites,
       COUNT(CASE WHEN operational_status != 'active' THEN 1 END) as inactive_sites
FROM public.commodity_locations 
WHERE country = 'Brunei';
