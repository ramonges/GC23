-- ============================================
-- GHANA OIL & GAS FIELDS SETUP
-- Generated: 2026-02-04T16:05:10.625298
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
  ('Eni', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('MODEC', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas']),
  ('Tullow Oil', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;

-- ============================================
-- STEP 4: DELETE EXISTING GHANA DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = 'Ghana';

-- ============================================
-- STEP 5: INSERT GHANA SITES
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
  'Jubilee Field (Jubilee Unit; Mahogany/Hyedua area)',
  'Tullow Oil',
  'Western Region (offshore Tano Basin; West Cape Three Points & Deepwater Tano blocks)',
  'Ghana',
  'Western Region (offshore Tano Basin; West Cape Three Points & Deepwater Tano blocks)',
  4.55,
  -2.85,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Tullow Oil',
  'JV (unitized) under petroleum agreements (WCTP & DT)',
  'Jubilee Unit participants commonly reported as: Tullow Oil 38.98%, Kosmos Energy 38.61%, GNPC 19.69%, PetroSA 2.72%. Unitization agreement in place since 2009; petroleum contract duration commonly reported as 30 years from effective date (July 2006) for DT petroleum contract; WCTP/DT licences being extended to 2040 (MoU signed 2025-06-04; approvals executed late 2025 per industry reporting).',
  1737212.5,
  21136250,
  'barrels (oil)',
  91000000,
  'boe (2P reserves, attributable to Tullow; as of 20',
  NULL,
  NULL,
  'light sweet crude',
  37.5,
  0.3,
  NULL,
  2000000000,
  'USD',
  NULL,
  30,
  ARRAY['Jubilee–Atuabo Gas Pipeline (offshore gas export pipeline; ~59 km; operating from 2019)'],
  ARRAY['Offloaded at sea from FPSO Kwame Nkrumah to export tankers/shuttle tankers (offshore)', 'Atuabo Gas Processing Plant (onshore gas/NGL system, Western Region)'],
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
  'Tweneboa Field (TEN Project)',
  'Tullow Oil',
  'Western Region (offshore, Deepwater Tano Contract Area)',
  'Ghana',
  'Western Region (offshore, Deepwater Tano Contract Area)',
  4.42,
  -2.78,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Tullow Oil',
  'JV (petroleum agreement/production licence; GNPC state participation)',
  'TEN Fields participating interests (reported by operator, H1 2025): Tullow (operator) 54.84%, Kosmos 20.38%, GNPC 20.95%, PetroSA 3.82%. Licence area: Deepwater Tano (DWT). Licence extension MOU signed to extend DWT/WCTP to 2040 (covers TEN/Jubilee).',
  499000,
  6073400,
  'bbl (oil)',
  100000000,
  'bbl (estimated remaining; order-of-magnitude estim',
  NULL,
  NULL,
  'Light sweet crude (TEN cluster; field oil reported ~35° API in Deepwater Tano TEN discoveries)',
  35.0,
  NULL,
  NULL,
  126000000,
  'USD',
  NULL,
  30,
  ARRAY['TEN subsea production system to FPSO Prof. John Evans Atta Mills (offloading via FPSO; subsea flowlines/risers)'],
  ARRAY['Takoradi (support/logistics port; offshore export via FPSO offtake tankers)'],
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
  'Enyenra Field (TEN Project)',
  'Tullow Oil',
  'Western Region (offshore, Deepwater Tano Contract Area)',
  'Ghana',
  'Western Region (offshore, Deepwater Tano Contract Area)',
  4.4,
  -2.76,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Tullow Oil',
  'JV (petroleum agreement/production licence; GNPC state participation)',
  'TEN Fields participating interests (reported by operator, H1 2025): Tullow (operator) 54.84%, Kosmos 20.38%, GNPC 20.95%, PetroSA 3.82%. Licence area: Deepwater Tano (DWT). Licence extension MOU signed to extend DWT/WCTP to 2040 (covers TEN/Jubilee).',
  499000,
  6073400,
  'bbl (oil)',
  100000000,
  'bbl (estimated remaining; order-of-magnitude estim',
  NULL,
  NULL,
  'Light sweet crude (Enyenra appraisal reported ~35° API oil)',
  35.0,
  NULL,
  NULL,
  126000000,
  'USD',
  NULL,
  30,
  ARRAY['TEN subsea production system to FPSO Prof. John Evans Atta Mills (offloading via FPSO; subsea flowlines/risers)'],
  ARRAY['Takoradi (support/logistics port; offshore export via FPSO offtake tankers)'],
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
  'Ntomme Field (TEN Project)',
  'Tullow Oil',
  'Western Region (offshore, Deepwater Tano Contract Area)',
  'Ghana',
  'Western Region (offshore, Deepwater Tano Contract Area)',
  4.38,
  -2.74,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Tullow Oil',
  'JV (petroleum agreement/production licence; GNPC state participation)',
  'TEN Fields participating interests (reported by operator, H1 2025): Tullow (operator) 54.84%, Kosmos 20.38%, GNPC 20.95%, PetroSA 3.82%. Licence area: Deepwater Tano (DWT). Licence extension MOU signed to extend DWT/WCTP to 2040 (covers TEN/Jubilee).',
  499000,
  6073400,
  'bbl (oil)',
  100000000,
  'bbl (estimated remaining; order-of-magnitude estim',
  NULL,
  NULL,
  'Light crude (Ntomme discovery fluid samples reported ~35° API)',
  35.0,
  NULL,
  NULL,
  126000000,
  'USD',
  NULL,
  30,
  ARRAY['TEN subsea production system to FPSO Prof. John Evans Atta Mills (offloading via FPSO; subsea flowlines/risers)'],
  ARRAY['Takoradi (support/logistics port; offshore export via FPSO offtake tankers)'],
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
  'TEN Field Development (Tweneboa–Enyenra–Ntomme Cluster; Deepwater Tano)',
  'Tullow Oil',
  'Western Region (offshore, Deepwater Tano Contract Area; Gulf of Guinea)',
  'Ghana',
  'Western Region (offshore, Deepwater Tano Contract Area; Gulf of Guinea)',
  4.42,
  -2.78,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Tullow Oil',
  'JV (petroleum agreement/production licence; GNPC state participation)',
  'Participating interests (Tullow Ghana operations page, H1 2025): Tullow (operator) 54.84%, Kosmos 20.38%, GNPC 20.95%, PetroSA 3.82%. (Historic equity differed at first oil; later changed after Oxy interest sale and pre-emption).',
  499000,
  6073400,
  'bbl (oil)',
  100000000,
  'bbl (estimated remaining; cluster-level order-of-m',
  NULL,
  NULL,
  'Light sweet crude (TEN crude; ~35° API reported in Deepwater Tano TEN discoveries)',
  35.0,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  30,
  ARRAY['Subsea production/injection network (flowlines/risers/umbilicals) to FPSO Prof. John Evans Atta Mills'],
  ARRAY['Offshore export via FPSO offtake tankers (Gulf of Guinea); Takoradi (support/logistics)'],
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
  'FPSO Prof. John Evans Atta Mills (TEN FPSO facility)',
  'MODEC',
  'Western Region (offshore)',
  'Ghana',
  'Western Region (offshore)',
  4.4,
  -2.77,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'MODEC',
  'Leased FPSO to JV; planned transition to partnership ownership',
  'FPSO currently under lease arrangement; TEN partners agreed sale and purchase terms to acquire FPSO when lease expires in 2027; SPA expected early 2026 (per Kosmos update reported Jan 2026).',
  499000,
  6073400,
  'bbl (oil processed/offloaded; associated with TEN ',
  0,
  'bbl',
  NULL,
  NULL,
  'Processing facility (handles TEN light crude)',
  NULL,
  NULL,
  NULL,
  NULL,
  'USD',
  NULL,
  NULL,
  ARRAY['Risers/flowlines from TEN subsea wells to FPSO Prof. John Evans Atta Mills'],
  ARRAY['Offshore offtake to shuttle tankers (export)'],
  ARRAY[]::text[],
  'MODEC',
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
  'Jubilee Field (Jubilee Unit Area; includes Jubilee/Mahogany accumulation)',
  'Tullow Oil',
  'Western Region (Offshore Western Basin: Deepwater Tano & West Cape Three Points)',
  'Ghana',
  'Western Region (Offshore Western Basin: Deepwater Tano & West Cape Three Points)',
  4.55,
  -2.85,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Tullow Oil',
  'JV (unitized development)',
  'Jubilee Unit Area participating interests (Tullow Oil website, H1 2025): Tullow (Op) 38.98%; Kosmos 38.61%; GNPC 19.69%; PetroSA 2.72%',
  2307997.55,
  28080655.22,
  'bbl (oil); computed from Petroleum Commission Ghan',
  3000000000,
  'bbl (reported total/proved reserves figure; public',
  NULL,
  NULL,
  'light sweet crude (Jubilee blend; exact API varies by cargo; not reliably sourced to a single value ',
  NULL,
  NULL,
  NULL,
  126000000,
  'USD',
  NULL,
  NULL,
  ARRAY['Jubilee-associated gas export line to Ghana Gas (Atuabo Gas Processing Plant)', 'Inter-field gas export/import linkage between Jubilee and TEN (gas export to TEN shown in Petroleum Commission field production tables)'],
  ARRAY['Offshore export via FPSO Kwame Nkrumah (offloading to shuttle tankers; export/lifting offshore)', 'Takoradi (shore base/logistics for offshore operations)'],
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
  'Tweneboa–Enyenra–Ntomme (TEN) Fields',
  'Tullow Oil',
  'Western Region (Offshore Western Basin: Deepwater Tano)',
  'Ghana',
  'Western Region (Offshore Western Basin: Deepwater Tano)',
  4.42,
  -2.78,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Tullow Oil',
  'JV',
  'TEN Fields participating interests (Tullow Oil website, H1 2025): Tullow (Op) 54.84%; Kosmos 20.38%; GNPC 20.95%; PetroSA 3.82%',
  504786.56,
  6133211.15,
  'bbl (oil); computed from Petroleum Commission Ghan',
  240000000,
  'bbl (publicly reported/press estimates of oil in p',
  NULL,
  NULL,
  'light to medium crude (exact field blend API not located in primary sources during web pull)',
  NULL,
  NULL,
  NULL,
  126000000,
  'USD',
  NULL,
  NULL,
  ARRAY['TEN gas export line to Ghana Gas (exports shown in Petroleum Commission field production tables)', 'Inter-field gas import line from Jubilee to TEN (gas imported to TEN from Jubilee shown in Petroleum Commission tables)'],
  ARRAY['Offshore export via FPSO Prof. John Evans Atta Mills (offloading to shuttle tankers; export/lifting offshore)', 'Takoradi (shore base/logistics for offshore operations)'],
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
  'Sankofa–Gye Nyame (OCTP) Development (Sankofa Main, Sankofa East, Gye-Nyame)',
  'Eni',
  'Western Region (Offshore Cape Three Points block; Western coast offshore near Sanzule/Ellembelle)',
  'Ghana',
  'Western Region (Offshore Cape Three Points block; Western coast offshore near Sanzule/Ellembelle)',
  4.7,
  -2.55,
  'Energy',
  'Crude Oil',
  'offshore_field',
  'active',
  'Eni',
  'JV (OCTP Joint Venture)',
  'OCTP JV interests (Eni press release, May 2017): Eni (Op) 44.44%; Vitol 35.56%; GNPC 20%',
  744204.6,
  9057822.62,
  'bbl (oil); computed from Petroleum Commission Ghan',
  173000000,
  'bbl (recoverable oil reported via Ghana government',
  NULL,
  NULL,
  'medium density, low sulphur crude (Sankofa crude)',
  28.9,
  0.3,
  NULL,
  NULL,
  'USD',
  NULL,
  15,
  ARRAY['OCTP 63-km subsea gas export pipeline to Sanzule Onshore Receiving Facilities (ORF)', 'Western Corridor Gas Pipeline (injection/distribution from Sanzule ORF)'],
  ARRAY['Offshore export via FPSO John Agyekum Kufuor (offloading to tankers)', 'Sanzule (onshore receiving facilities / export gas tie-in point)', 'Takoradi (shore base/logistics for offshore operations)'],
  ARRAY[]::text[],
  'Eni',
  NULL
);
