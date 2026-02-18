-- ============================================================
-- Kuwait Oil Production Sites — 23 Fields (UPSERT)
-- Run this in Supabase SQL Editor
-- ============================================================

-- =====================
-- GREATER BURGAN FIELD
-- =====================

-- 1. Burgan Field (main dome)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Burgan Field', 'Kuwait Petroleum Corporation (KPC)', 'Ahmadi Governorate, Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.0500, 47.9500, 'Kuwait', 'Greater Burgan', 'Ahmadi',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  31.00, 2.44,
  45000000, 31900000000, 45000000,
  '{"start_year":1946,"discovery":1938,"production_bpd":1500000,"quality":"Medium sour — Kuwait Export Crude (KEC) blend","note":"World''s 2nd largest oil field","original_reserves_bbl":"66 billion OOIP","last_transaction":"Fully nationalized 1975","pipelines":"Burgan–Ahmadi crude gathering → Mina Al-Ahmadi export terminal; Burgan–Shuaiba refinery pipeline","ports":"Mina Al-Ahmadi Oil Terminal (MAA) — largest oil terminal in Middle East; Mina Abdullah Terminal","rail":"None (Kuwait has no rail network)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 2. Magwa Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Magwa Field', 'KPC', 'Ahmadi Governorate, Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.1333, 47.9167, 'Kuwait', 'Greater Burgan', 'Ahmadi',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  30.00, 2.50,
  3600000, 6000000000, 3600000,
  '{"start_year":1951,"production_bpd":120000,"quality":"Medium sour","note":"Part of Greater Burgan complex","pipelines":"Magwa–Ahmadi gathering pipeline; Burgan trunk line","ports":"Mina Al-Ahmadi Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 3. Ahmadi Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Ahmadi Field', 'KPC', 'Ahmadi Governorate, Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.1000, 48.0833, 'Kuwait', 'Greater Burgan', 'Ahmadi',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  29.00, 2.60,
  2400000, 4000000000, 2400000,
  '{"start_year":1952,"production_bpd":80000,"quality":"Medium heavy sour","pipelines":"Ahmadi–Mina Al-Ahmadi pipeline (short direct connection — refinery and terminal adjacent)","ports":"Mina Al-Ahmadi Terminal (directly adjacent)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 4. Wara Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Wara Field', 'KPC', 'Greater Burgan, Kuwait', NULL,
  'Energy', 'Crude Oil',
  28.9167, 47.9167, 'Kuwait', 'Greater Burgan', 'Ahmadi',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  24.00, 3.10,
  1500000, 2000000000, 1500000,
  '{"start_year":1956,"production_bpd":50000,"quality":"Heavy sour","note":"Shallower Wara reservoir above main Burgan","pipelines":"Wara–Burgan gathering network","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 5. Minagish Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Minagish Field', 'KPC', 'western Kuwait, Jahra Governorate', NULL,
  'Energy', 'Crude Oil',
  29.0833, 47.2500, 'Kuwait', 'Greater Burgan', 'Jahra',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  35.00, 1.90,
  1800000, 3500000000, 1800000,
  '{"start_year":1959,"production_bpd":60000,"quality":"Medium light","pipelines":"Minagish–Ahmadi pipeline (east–west trunk)","ports":"Mina Al-Ahmadi (via pipeline)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 6. Umm Gudair Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Umm Gudair Field', 'KPC', 'southern Kuwait, near Saudi border', NULL,
  'Energy', 'Crude Oil',
  28.6667, 47.7500, 'Kuwait', 'Greater Burgan', 'Southern Kuwait',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  22.00, 3.50,
  1200000, 2800000000, 1200000,
  '{"start_year":1962,"production_bpd":40000,"quality":"Heavy sour, Very sour heavy","pipelines":"Umm Gudair–Mina Abdullah pipeline; southern Kuwait gathering","ports":"Mina Abdullah Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- NORTHERN KUWAIT
-- =====================

-- 7. Raudhatain Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Raudhatain Field', 'KPC', 'Al Jahra Governorate, northern Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.7667, 47.7500, 'Kuwait', 'Northern Kuwait', 'Al Jahra',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  36.00, 1.70,
  6000000, 6000000000, 6000000,
  '{"start_year":1955,"production_bpd":200000,"quality":"Light — Kuwait Export Crude blend contributor","note":"Northern Kuwait''s largest field","pipelines":"Raudhatain–Ahmadi pipeline (northern trunk, ~120km); North Kuwait gathering system","ports":"Mina Al-Ahmadi Terminal (via pipeline)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 8. Sabriyah Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Sabriyah Field', 'KPC', 'Al Jahra Governorate, northern Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.6500, 47.6667, 'Kuwait', 'Northern Kuwait', 'Al Jahra',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  35.00, 1.80,
  3600000, 4500000000, 3600000,
  '{"start_year":1957,"production_bpd":120000,"quality":"Light","pipelines":"Sabriyah–North Kuwait gathering → Ahmadi trunk pipeline","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 9. Bahra Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Bahra Field', 'KPC', 'northern Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.5833, 47.8333, 'Kuwait', 'Northern Kuwait', 'Northern Kuwait',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  34.00, 2.00,
  450000, 400000000, 450000,
  '{"start_year":1962,"production_bpd":15000,"quality":"Medium","note":"Smaller field","pipelines":"North Kuwait gathering pipeline","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 10. Mutriba Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Mutriba Field', 'KPC', 'Al Jahra Governorate, northwestern Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.6167, 47.4167, 'Kuwait', 'Northern Kuwait', 'Al Jahra',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  20.00, 3.80,
  900000, 2000000000, 900000,
  '{"start_year":1967,"production_bpd":30000,"quality":"Heavy sour","note":"Redevelopment 2010s for heavy oil","pipelines":"Mutriba–Al Jahra–Ahmadi pipeline","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 11. Abdali Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Abdali Field', 'KPC', 'northern Kuwait, near Iraq border', NULL,
  'Energy', 'Crude Oil',
  29.9500, 47.7167, 'Kuwait', 'Northern Kuwait', 'Northern Kuwait',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  33.00, 2.10,
  600000, 1000000000, 600000,
  '{"start_year":1962,"production_bpd":20000,"quality":"Medium","pipelines":"North Kuwait pipeline → Ahmadi system","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 12. Ratqa Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Ratqa Field', 'KPC', 'northern Kuwait, near Iraq border', NULL,
  'Energy', 'Crude Oil',
  30.0500, 47.7833, 'Kuwait', 'Northern Kuwait', 'Northern Kuwait',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  16.00, 4.20,
  1800000, 3500000000, 1800000,
  '{"start_year":1966,"production_bpd":60000,"target_bpd_2030":270000,"quality":"Extra heavy sour","note":"Heavy oil, EOR development from 2013","last_transaction":"Shell EOR technical service agreement ~$200M, 2013","contract_duration":"Technical service (not PSA)","pipelines":"North Kuwait heavy oil pipeline (under expansion)","ports":"Mina Al-Ahmadi (via northern trunk)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 13. Rawdhatain Gas Cap
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Rawdhatain Gas Cap', 'KPC', 'northern Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.7833, 47.8000, 'Kuwait', 'Northern Kuwait', 'Al Jahra',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  50.00, 0.20,
  300000, NULL, 300000,
  '{"start_year":"1970s","production_bpd":10000,"quality":"Condensate, sweet","note":"Gas cap management + oil (Raudhatain associated)","pipelines":"North Kuwait gas gathering → KNPC","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 14. Kra Al-Maru Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kra Al-Maru Field', 'KPC', 'northern Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.8833, 47.5500, 'Kuwait', 'Northern Kuwait', 'Northern Kuwait',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  31.00, 2.00,
  450000, 800000000, 450000,
  '{"start_year":2015,"production_bpd":15000,"quality":"Medium sour","note":"Recent development","pipelines":"Northern gathering system","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 15. Sulaibikhat / Atraf Fields
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Sulaibikhat / Atraf Fields', 'KPC', 'northwestern Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.4167, 47.6833, 'Kuwait', 'Northern Kuwait', 'Northwestern Kuwait',
  'oil_field', 'operational',
  'Kuwait Oil Company (KOC)', 'state_owned',
  28.00, 2.50,
  240000, NULL, 240000,
  '{"start_year":"2000s","production_bpd":8000,"quality":"Medium heavy sour","note":"Tight oil / unconventional development","pipelines":"Greater Burgan / Ahmadi pipeline network","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- OFFSHORE KUWAIT
-- =====================

-- 16. Khafji Field (PNZ)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Khafji Field', 'Kuwait 50% / Saudi Arabia 50%', 'Partitioned Neutral Zone, offshore Kuwait/Saudi Arabia', NULL,
  'Energy', 'Crude Oil',
  28.4167, 48.5000, 'Kuwait', 'Offshore', 'PNZ Offshore',
  'oil_field', 'operational',
  'Al-Khafji Joint Operations (KJO)', 'joint_venture',
  28.00, 2.90,
  1800000, 5000000000, 1800000,
  '{"start_year":1961,"production_bpd":60000,"quality":"Medium heavy sour","note":"Combined PNZ ~150,000 bpd. Resumed 2019 after ~2014–2019 suspension","ownership_split":"Kuwait 50% (KOC/KGOC), Saudi Arabia 50% (Saudi Aramco Gulf Operations)","last_transaction":"Production suspension 2014 (environmental/regulatory dispute); resumed 2019","contract_duration":"Joint operation under 1965 PNZ agreement","pipelines":"Khafji–Ras Al-Khafji offshore pipeline; Ras Al-Khafji onshore terminal","ports":"Ras Al-Khafji Export Terminal (Saudi side); Mina Al-Ahmadi (Kuwait side)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 17. Hout Field (PNZ)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Hout Field', 'Kuwait 50% / Saudi Arabia 50%', 'Partitioned Neutral Zone, offshore', NULL,
  'Energy', 'Crude Oil',
  28.3500, 48.6667, 'Kuwait', 'Offshore', 'PNZ Offshore',
  'oil_field', 'operational',
  'KJO (Al-Khafji Joint Operations)', 'joint_venture',
  32.00, 2.30,
  600000, 800000000, 600000,
  '{"start_year":1963,"production_bpd":20000,"quality":"Medium","ownership_split":"Kuwait 50%, Saudi Arabia 50%","pipelines":"Hout–Khafji offshore pipeline","ports":"Ras Al-Khafji Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 18. Dorra / Arash Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Dorra / Arash Field', 'Kuwait + Saudi Arabia', 'offshore Kuwait — disputed with Iran', NULL,
  'Energy', 'Crude Oil',
  29.0833, 48.8333, 'Kuwait', 'Offshore', 'Offshore',
  'oil_field', 'planned',
  'Kuwait Gulf Oil Company (KGOC)', 'joint_venture',
  48.00, 0.20,
  NULL, 300000000, NULL,
  '{"discovery":1967,"status":"Pre-development (politically stalled — tripartite dispute Kuwait/Saudi Arabia/Iran)","potential_bpd":100000,"quality":"Condensate, sweet","note":"Gas + condensate dominant. ~231 bcf gas reserves","ownership_dispute":"Kuwait + Saudi Arabia claim 100%; Iran claims partial overlap as Arash Field","last_transaction":"Kuwait–Saudi bilateral development agreement signed 2023 (excluding Iran)","pipelines":"Planned subsea pipeline to Mina Al-Ahmadi","ports":"Mina Al-Ahmadi (planned)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 19. Kuwait Offshore Block NW
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kuwait Offshore Block NW', 'KGOC', 'shallow offshore, Kuwait Bay, Kuwait', NULL,
  'Energy', 'Crude Oil',
  29.3333, 48.2500, 'Kuwait', 'Offshore', 'Kuwait Bay',
  'oil_field', 'operational',
  'Kuwait Gulf Oil Company (KGOC)', 'state_owned',
  33.00, 1.50,
  150000, NULL, 150000,
  '{"start_year":"2010s","production_bpd":5000,"quality":"Medium","note":"Exploration / Early development, test production","pipelines":"Planned connection to onshore Ahmadi network","ports":"Mina Al-Ahmadi","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 20. Umm Niqa Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Umm Niqa Field', 'KGOC', 'offshore, southeastern Kuwait', NULL,
  'Energy', 'Crude Oil',
  28.8333, 48.4167, 'Kuwait', 'Offshore', 'Offshore SE Kuwait',
  'oil_field', 'operational',
  'Kuwait Gulf Oil Company (KGOC)', 'state_owned',
  31.00, 2.00,
  300000, NULL, 300000,
  '{"start_year":1970,"production_bpd":10000,"quality":"Medium sour","note":"Smaller offshore field","pipelines":"Offshore–Mina Abdullah pipeline","ports":"Mina Abdullah Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 21. Kubbar Island Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kubbar Island Field', 'KGOC', 'offshore Kuwait', NULL,
  'Energy', 'Crude Oil',
  28.6667, 48.4833, 'Kuwait', 'Offshore', 'Kubbar Island',
  'oil_field', 'operational',
  'Kuwait Gulf Oil Company (KGOC)', 'state_owned',
  34.00, 1.60,
  240000, 200000000, 240000,
  '{"start_year":1956,"production_bpd":8000,"quality":"Medium","note":"Small island field","pipelines":"Subsea pipeline → Mina Abdullah","ports":"Mina Abdullah Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 22. Qaruh Island Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Qaruh Island Field', 'KGOC', 'offshore Kuwait, southern', NULL,
  'Energy', 'Crude Oil',
  28.8333, 48.7833, 'Kuwait', 'Offshore', 'Qaruh Island',
  'oil_field', 'operational',
  'Kuwait Gulf Oil Company (KGOC)', 'state_owned',
  35.00, 0.80,
  90000, NULL, 90000,
  '{"start_year":"1960s","production_bpd":3000,"quality":"Light","note":"Very small field","pipelines":"Small subsea gathering → mainland","ports":"Mina Abdullah","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 23. Wafra Field (PNZ onshore)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Wafra Field', 'Kuwait 50% / Saudi Arabia 50%', 'Partitioned Neutral Zone, onshore Kuwait/Saudi Arabia', NULL,
  'Energy', 'Crude Oil',
  28.5833, 48.0500, 'Kuwait', 'PNZ Onshore', 'Wafra',
  'oil_field', 'operational',
  'KGOC (Kuwait side)', 'joint_venture',
  19.00, 4.00,
  4500000, 7000000000, 4500000,
  '{"start_year":1954,"production_bpd":150000,"target_bpd":200000,"quality":"Heavy sour — Wafra heavy blend","note":"Resumed 2022 after ~2015–2022 long suspension","ownership_split":"Kuwait 50% (KGOC), Saudi Arabia 50% (Saudi Aramco)","last_transaction":"Chevron exited PNZ after 7-year suspension dispute; KGOC now direct operator (Kuwait side) ~2021; ~$500M settlement","contract_duration":"PNZ Joint Agreement (perpetual treaty framework)","pipelines":"Wafra–Mina Abdullah heavy crude pipeline; Wafra–Saudi Saffaniyah pipeline (Saudi side)","ports":"Mina Abdullah Terminal (Kuwait side); Ras Tanura (Saudi side, indirect)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- ============================================================
-- Verification
-- ============================================================
SELECT count(*) AS kuwait_oil_fields
FROM public.commodity_locations
WHERE country = 'Kuwait' AND commodity_name = 'Crude Oil';

SELECT count(*) AS total_locations
FROM public.commodity_locations;
