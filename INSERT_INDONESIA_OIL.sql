-- ============================================================
-- Indonesia Oil Production Sites — 23 Fields (UPSERT)
-- Run this in Supabase SQL Editor
-- Uses ON CONFLICT to update existing records safely
-- ============================================================

-- =====================
-- SUMATRA
-- =====================

-- 1. Minas Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Minas Field', 'PT Pertamina Hulu Rokan', 'Riau, Central Sumatra, Indonesia', NULL,
  'Energy', 'Crude Oil',
  1.0833, 101.6167, 'Indonesia', 'Sumatra', 'Riau',
  'oil_field', 'operational',
  'PT Pertamina Hulu Rokan', 'state_owned',
  34.00, 0.08,
  900000, 600000000, 900000,
  '{"start_year":1952,"production_bpd":30000,"quality":"Sweet crude","previous_operator":"Chevron Pacific Indonesia","last_transaction":"Chevron → Pertamina, ~$4B, 2021","contract_duration":"20 years","pipelines":"Central Sumatra Pipeline","ports":"Dumai Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 2. Duri Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Duri Field', 'PT Pertamina Hulu Rokan', 'Riau, Central Sumatra, Indonesia', NULL,
  'Energy', 'Crude Oil',
  1.4667, 101.2333, 'Indonesia', 'Sumatra', 'Riau',
  'oil_field', 'operational',
  'PT Pertamina Hulu Rokan', 'state_owned',
  21.00, 0.20,
  2400000, 1000000000, 2400000,
  '{"start_year":1958,"production_bpd":80000,"quality":"Heavy crude","eor_method":"Steam flood","previous_operator":"Chevron","last_transaction":"Chevron → Pertamina, 2021","contract_duration":"20 years","pipelines":"Duri–Dumai Pipeline","ports":"Dumai Export Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 3. Rokan Block
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Rokan Block', 'PT Pertamina Hulu Rokan', 'Riau, Central Sumatra, Indonesia', NULL,
  'Energy', 'Crude Oil',
  1.2000, 100.8500, 'Indonesia', 'Sumatra', 'Riau',
  'oil_field', 'operational',
  'PT Pertamina Hulu Rokan', 'state_owned',
  33.00, 0.05,
  4800000, 1500000000, 4800000,
  '{"start_year":1971,"production_bpd":160000,"quality":"Sweet, Low sulfur","last_transaction":"~2021 transition","contract_duration":"20 years","pipelines":"Trans-Sumatran Pipeline","ports":"Dumai Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 4. Lirik Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Lirik Field', 'PT Pertamina EP', 'Riau, Central Sumatra, Indonesia', NULL,
  'Energy', 'Crude Oil',
  0.5833, 102.5500, 'Indonesia', 'Sumatra', 'Riau',
  'oil_field', 'operational',
  'PT Pertamina EP', 'state_owned',
  37.00, 0.05,
  90000, 50000000, 90000,
  '{"start_year":1959,"production_bpd":3000,"quality":"Sweet","maturity":"Mature field","pipelines":"Local gathering lines","ports":"Dumai","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 5. Corridor Block (South Sumatra)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Corridor Block', 'ConocoPhillips / Pertamina', 'South Sumatra, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -3.0000, 103.5000, 'Indonesia', 'Sumatra', 'South Sumatra',
  'oil_field', 'operational',
  'ConocoPhillips', 'joint_venture',
  50.00, 0.02,
  750000, 200000000, 750000,
  '{"start_year":1994,"production_bpd":25000,"quality":"Very light condensate","ownership_split":"ConocoPhillips 54%, Pertamina 46%","last_transaction":"~$500M block sale discussions, 2022","contract_duration":"30 years","pipelines":"South Sumatra–West Java Gas Pipeline","ports":"Palembang, Tanjung Api-Api","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 6. Pendopo / Prabumulih Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Pendopo / Prabumulih Field', 'PT Pertamina EP', 'South Sumatra, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -3.9167, 104.0000, 'Indonesia', 'Sumatra', 'South Sumatra',
  'oil_field', 'operational',
  'PT Pertamina EP', 'state_owned',
  32.00, 0.10,
  240000, 80000000, 240000,
  '{"start_year":"1920s (colonial era)","production_bpd":8000,"quality":"Medium crude","maturity":"Mature field","pipelines":"South Sumatra pipeline network","ports":"Palembang River Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 7. Siak Block
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Siak Block', 'PT Pertamina Hulu Energy', 'Riau, Sumatra, Indonesia', NULL,
  'Energy', 'Crude Oil',
  0.8500, 102.0000, 'Indonesia', 'Sumatra', 'Riau',
  'oil_field', 'operational',
  'PT Pertamina Hulu Energy', 'state_owned',
  27.00, 0.15,
  210000, NULL, 210000,
  '{"start_year":"1970s","production_bpd":7000,"quality":"Medium heavy","pipelines":"Siak gathering system → Dumai","ports":"Dumai","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- =====================
-- EAST KALIMANTAN
-- =====================

-- 8. Handil Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Handil Field', 'PT Pertamina Hulu Mahakam', 'Kutai Kartanegara, East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -0.4167, 117.5000, 'Indonesia', 'East Kalimantan', 'Kutai Kartanegara',
  'oil_field', 'operational',
  'PT Pertamina Hulu Mahakam', 'state_owned',
  36.00, 0.05,
  450000, 100000000, 450000,
  '{"start_year":1974,"production_bpd":15000,"quality":"Sweet, Low sulfur","declining":true,"previous_operator":"Total E&P","last_transaction":"Total E&P → Pertamina, 2018","contract_duration":"30 years","pipelines":"Mahakam Delta Pipeline System","ports":"Balikpapan Export Terminal, Senipah Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 9. Bekapai Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Bekapai Field', 'PT Pertamina Hulu Mahakam', 'Mahakam Delta, East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -0.5167, 117.6500, 'Indonesia', 'East Kalimantan', 'Mahakam Delta',
  'oil_field', 'operational',
  'PT Pertamina Hulu Mahakam', 'state_owned',
  38.00, 0.05,
  300000, NULL, 300000,
  '{"start_year":1974,"production_bpd":10000,"quality":"Sweet","pipelines":"Mahakam Delta network","ports":"Senipah Terminal, Balikpapan","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 10. Attaka Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Attaka Field', 'PT Pertamina Hulu Mahakam', 'Mahakam, offshore shallow, East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  1.0833, 117.8333, 'Indonesia', 'East Kalimantan', 'Mahakam',
  'oil_field', 'operational',
  'PT Pertamina Hulu Mahakam', 'state_owned',
  41.00, 0.03,
  150000, NULL, 150000,
  '{"start_year":1970,"production_bpd":5000,"quality":"Light sweet","declining":true,"pipelines":"Offshore–Senipah pipeline","ports":"Senipah Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 11. Peciko Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Peciko Field', 'PT Pertamina Hulu Mahakam', 'Mahakam, East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -0.7500, 117.7000, 'Indonesia', 'East Kalimantan', 'Mahakam',
  'oil_field', 'operational',
  'PT Pertamina Hulu Mahakam', 'state_owned',
  43.00, 0.03,
  240000, NULL, 240000,
  '{"start_year":1999,"production_bpd":8000,"quality":"Light sweet, condensate","pipelines":"Mahakam Delta System","ports":"Senipah LNG/Oil Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 12. Badak Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Badak Field', 'Vico Indonesia (ENI + Pertamina)', 'Bontang area, East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  0.1333, 117.4667, 'Indonesia', 'East Kalimantan', 'Bontang',
  'oil_field', 'operational',
  'Vico Indonesia', 'joint_venture',
  40.00, 0.05,
  600000, 150000000, 600000,
  '{"start_year":1972,"production_bpd":20000,"quality":"Sweet","note":"Significant gas production","ownership_split":"ENI 50%, Pertamina 50%","pipelines":"Badak–Bontang pipeline","ports":"Bontang LNG Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 13. Samboja / Sepinggan Block
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Samboja / Sepinggan Block', 'PT Pertamina EP', 'East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -1.1833, 116.9667, 'Indonesia', 'East Kalimantan', 'Samboja',
  'oil_field', 'operational',
  'PT Pertamina EP', 'state_owned',
  34.00, 0.05,
  150000, NULL, 150000,
  '{"start_year":"1950s","production_bpd":5000,"quality":"Medium sweet","maturity":"Mature field","pipelines":"Balikpapan refinery pipeline","ports":"Balikpapan","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- =====================
-- JAVA SEA (OFFSHORE)
-- =====================

-- 14. Arjuna / ONWJ Block
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Arjuna / ONWJ Block', 'PHE ONWJ (Pertamina Hulu Energi)', 'Offshore NW Java Sea, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -5.8000, 107.5000, 'Indonesia', 'Java Sea', 'Offshore NW Java',
  'oil_field', 'operational',
  'PHE ONWJ', 'state_owned',
  35.00, 0.05,
  750000, 200000000, 750000,
  '{"start_year":1972,"production_bpd":25000,"quality":"Sweet, Low sulfur","last_transaction":"BP sold stake to Pertamina, ~2017","contract_duration":"20 years","pipelines":"Arjuna–Cilamaya offshore pipeline","ports":"Cilamaya Terminal (West Java)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 15. Widuri Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Widuri Field', 'PHE ONWJ', 'Offshore NW Java Sea, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -5.5833, 107.1667, 'Indonesia', 'Java Sea', 'Offshore NW Java',
  'oil_field', 'operational',
  'PHE ONWJ', 'state_owned',
  32.00, 0.05,
  240000, NULL, 240000,
  '{"start_year":1975,"production_bpd":8000,"quality":"Medium sweet","pipelines":"NW Java offshore pipeline","ports":"Cilamaya","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 16. OSES Block (Cinta Field)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'OSES Block — Cinta Field', 'PT Medco E&P / Pertamina', 'South East Sumatra / Java Sea, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -5.0000, 106.5000, 'Indonesia', 'Java Sea', 'Offshore SE Sumatra',
  'oil_field', 'operational',
  'PT Medco E&P', 'joint_venture',
  33.00, 0.05,
  180000, NULL, 180000,
  '{"start_year":"1971 (ARCO era)","production_bpd":6000,"quality":"Sweet","maturity":"Mature field","ownership_split":"Medco majority + Pertamina","pipelines":"OSES offshore system","ports":"Sungai Gerong, Plaju terminals","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 17. Kepodang Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kepodang Field', 'PHE Muriah (Pertamina)', 'Java Sea, offshore Central Java, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -5.1667, 110.5000, 'Indonesia', 'Java Sea', 'Offshore Central Java',
  'oil_field', 'operational',
  'PHE Muriah', 'state_owned',
  50.00, 0.02,
  NULL, NULL, NULL,
  '{"start_year":2015,"quality":"Condensate, API ~50°+","note":"Gas dominant with condensate","pipelines":"Kepodang–Tambak Lorok Gas Pipeline","ports":"Semarang area","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- =====================
-- NATUNA SEA (OFFSHORE)
-- =====================

-- 18. West Natuna Block
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'West Natuna Block', 'Harbour Energy / ConocoPhillips / Medco / PHE', 'South China Sea / Natuna Sea, Indonesia', NULL,
  'Energy', 'Crude Oil',
  3.5000, 108.0000, 'Indonesia', 'Natuna Sea', 'West Natuna',
  'oil_field', 'operational',
  'Harbour Energy', 'joint_venture',
  47.00, 0.03,
  450000, 200000000, 450000,
  '{"start_year":1998,"production_bpd":15000,"quality":"Light sweet condensate","ownership_split":"ConocoPhillips 40%, Medco 20%, PHE 20%, others","last_transaction":"Premier Oil → Harbour Energy, 2021","contract_duration":"30 years","pipelines":"West Natuna Transportation System (WNTS) → Senang/Batam","ports":"Batam Island Terminal, Singapore offtake","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 19. East Natuna Block
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'East Natuna Block', 'PT Pertamina', 'South China Sea / Natuna Sea, Indonesia', NULL,
  'Energy', 'Crude Oil',
  4.0000, 109.0000, 'Indonesia', 'Natuna Sea', 'East Natuna',
  'oil_field', 'planned',
  'PT Pertamina', 'state_owned',
  50.00, 0.02,
  NULL, 600000000, NULL,
  '{"status":"Development stalled / Pre-development","note":"Giant CO₂ challenge — ~71% CO₂ content","gas_reserves_tcf":46,"quality":"Condensate API ~50°+","previous_operators":"ExxonMobil (historical), Total (historical)","pipelines":"Planned only","ports":"Planned Natuna terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 20. Anoa Field / South Natuna Sea Block B
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Anoa Field / South Natuna Sea Block B', 'ConocoPhillips Indonesia', 'South Natuna Sea, Indonesia', NULL,
  'Energy', 'Crude Oil',
  2.0000, 106.5000, 'Indonesia', 'Natuna Sea', 'South Natuna',
  'oil_field', 'operational',
  'ConocoPhillips Indonesia', 'joint_venture',
  52.00, 0.02,
  300000, NULL, 300000,
  '{"start_year":1994,"production_bpd":10000,"quality":"Very light condensate","ownership_split":"ConocoPhillips 54%, Pertamina 46%","pipelines":"Anoa–Batam pipeline (WNTS)","ports":"Batam Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- =====================
-- MAHAKAM DELTA
-- =====================

-- 21. Tunu Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Tunu Field', 'PT Pertamina Hulu Mahakam', 'Mahakam Delta, East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -0.6667, 117.8333, 'Indonesia', 'Mahakam Delta', 'East Kalimantan',
  'oil_field', 'operational',
  'PT Pertamina Hulu Mahakam', 'state_owned',
  40.00, 0.03,
  360000, NULL, 360000,
  '{"start_year":1995,"production_bpd":12000,"quality":"Light sweet","note":"Also significant gas production","previous_operator":"Total","pipelines":"Tunu–Senipah pipeline","ports":"Senipah Terminal, Balikpapan","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 22. Tambora Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Tambora Field', 'PT Pertamina Hulu Mahakam', 'Mahakam Delta, East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  -0.5833, 117.7167, 'Indonesia', 'Mahakam Delta', 'East Kalimantan',
  'oil_field', 'operational',
  'PT Pertamina Hulu Mahakam', 'state_owned',
  38.00, 0.05,
  150000, NULL, 150000,
  '{"start_year":1997,"production_bpd":5000,"quality":"Sweet","pipelines":"Mahakam Delta system","ports":"Senipah","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- 23. Sisi–Nubi Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Sisi–Nubi Field', 'PT Pertamina Hulu Mahakam', 'Mahakam, offshore shallow, East Kalimantan, Indonesia', NULL,
  'Energy', 'Crude Oil',
  0.3333, 117.9167, 'Indonesia', 'Mahakam Delta', 'East Kalimantan',
  'oil_field', 'operational',
  'PT Pertamina Hulu Mahakam', 'state_owned',
  39.00, 0.05,
  240000, NULL, 240000,
  '{"start_year":2008,"production_bpd":8000,"quality":"Sweet condensate","note":"Also gas production","pipelines":"Mahakam offshore–Senipah","ports":"Senipah LNG & Oil Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner = EXCLUDED.owner, address = EXCLUDED.address, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  region = EXCLUDED.region, city = EXCLUDED.city, location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status, operator = EXCLUDED.operator, ownership_type = EXCLUDED.ownership_type,
  api_gravity = EXCLUDED.api_gravity, sulfur_content = EXCLUDED.sulfur_content,
  current_production = EXCLUDED.current_production, reserves_estimate = EXCLUDED.reserves_estimate, supply_volume = EXCLUDED.supply_volume,
  additional_info = EXCLUDED.additional_info, updated_at = NOW();

-- ============================================================
-- Verification: count Indonesia oil fields
-- ============================================================
SELECT count(*) AS indonesia_oil_fields
FROM public.commodity_locations
WHERE country = 'Indonesia' AND commodity_name = 'Crude Oil';
