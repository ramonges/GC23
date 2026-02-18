-- ============================================================
-- Iraq Oil Production Sites — 27 Fields (UPSERT)
-- Run this in Supabase SQL Editor
-- ============================================================

-- =====================
-- KIRKUK REGION
-- =====================

-- 1. Kirkuk Field (Baba Dome)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kirkuk Field (Baba Dome)', 'North Oil Company (NOC)', 'Kirkuk Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  35.4686, 44.3922, 'Iraq', 'Kirkuk', 'Kirkuk',
  'oil_field', 'operational',
  'North Oil Company (NOC) / SOMO', 'state_owned',
  36.00, 1.97,
  10500000, 8700000000, 10500000,
  '{"start_year":1927,"production_bpd":350000,"quality":"Light sour — Kirkuk Blend export grade","note":"One of world''s oldest producing fields. Contested, fluctuates with Kurdish political situation","last_transaction":"KRG contested control 2017, federal takeover post-referendum","pipelines":"Iraq–Turkey Pipeline (ITP) → Ceyhan, Turkey (970km); Kirkuk–Baiji pipeline","ports":"Ceyhan Export Terminal (Turkey, Mediterranean)","rail":"Kirkuk–Baghdad rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 2. Bai Hassan Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Bai Hassan Field', 'North Oil Company (NOC)', 'Kirkuk Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  35.6833, 44.1333, 'Iraq', 'Kirkuk', 'Kirkuk',
  'oil_field', 'operational',
  'North Oil Company (NOC)', 'state_owned',
  34.00, 2.10,
  3000000, 2500000000, 3000000,
  '{"start_year":1953,"production_bpd":100000,"quality":"Medium sour","last_transaction":"KRG operated 2014–2017, returned to NOC post-referendum","pipelines":"Bai Hassan–Kirkuk pipeline → ITP → Ceyhan","ports":"Ceyhan, Turkey","rail":"None direct"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 3. Jambur Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Jambur Field', 'North Oil Company (NOC)', 'Kirkuk Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  35.7500, 44.4167, 'Iraq', 'Kirkuk', 'Kirkuk',
  'oil_field', 'operational',
  'North Oil Company (NOC)', 'state_owned',
  35.00, 1.80,
  900000, 800000000, 900000,
  '{"start_year":1952,"production_bpd":30000,"quality":"Light sour","maturity":"Mature field","pipelines":"Jambur–Kirkuk pipeline","ports":"Ceyhan via ITP","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 4. Khabbaz Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Khabbaz Field', 'North Oil Company (NOC)', 'Kirkuk Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  35.4000, 43.7833, 'Iraq', 'Kirkuk', 'Kirkuk',
  'oil_field', 'operational',
  'North Oil Company (NOC)', 'state_owned',
  36.00, 1.50,
  900000, 600000000, 900000,
  '{"start_year":1979,"production_bpd":30000,"quality":"Light sour","pipelines":"Khabbaz–Kirkuk pipeline","ports":"Ceyhan via ITP","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 5. Ajeel Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Ajeel Field', 'North Oil Company (NOC)', 'Saladin Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  35.0000, 43.9167, 'Iraq', 'Kirkuk', 'Saladin',
  'oil_field', 'operational',
  'North Oil Company (NOC)', 'state_owned',
  33.00, 2.00,
  450000, 400000000, 450000,
  '{"start_year":1978,"production_bpd":15000,"quality":"Medium sour","maturity":"Mature field","pipelines":"Ajeel–Baiji pipeline","ports":"Ceyhan via northern pipeline","rail":"Baiji rail hub (indirect)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 6. Qayyarah Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Qayyarah Field', 'North Oil Company (NOC)', 'Nineveh Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  35.8333, 43.1333, 'Iraq', 'Kirkuk', 'Nineveh',
  'oil_field', 'operational',
  'NOC / Sonangol (service contract)', 'state_owned',
  14.00, 5.70,
  900000, 1500000000, 900000,
  '{"start_year":1953,"production_bpd":30000,"quality":"Extra heavy, Very sour heavy","last_transaction":"Sonangol service contract signed 2010, ~$400M","contract_duration":"20 years","pipelines":"Qayyarah–Baiji pipeline (limited)","ports":"Ceyhan (via northern system, constrained)","rail":"Mosul–Baiji rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 7. Ain Zalah Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Ain Zalah Field', 'North Oil Company (NOC)', 'Nineveh Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  36.7500, 42.5833, 'Iraq', 'Kirkuk', 'Nineveh',
  'oil_field', 'operational',
  'North Oil Company (NOC)', 'state_owned',
  38.00, 0.60,
  150000, 300000000, 150000,
  '{"start_year":1939,"production_bpd":5000,"quality":"Light sweet","maturity":"Small, mature field","pipelines":"Ain Zalah–Kirkuk pipeline (northern trunk)","ports":"Ceyhan via ITP","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 8. Butmah Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Butmah Field', 'North Oil Company (NOC)', 'Nineveh Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  36.5833, 42.6667, 'Iraq', 'Kirkuk', 'Nineveh',
  'oil_field', 'operational',
  'North Oil Company (NOC)', 'state_owned',
  36.00, 1.00,
  240000, NULL, 240000,
  '{"start_year":1952,"production_bpd":8000,"quality":"Light","maturity":"Mature field","pipelines":"Northern Iraq pipeline network","ports":"Ceyhan","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- BASRA REGION
-- =====================

-- 9. Zubair Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Zubair Field', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.3833, 47.7000, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'Eni (lead) + Occidental + KOGAS + BOC', 'joint_venture',
  29.00, 2.80,
  10500000, 4000000000, 10500000,
  '{"start_year":1949,"production_bpd":350000,"quality":"Medium sour","ownership_split":"Eni 32.81%, Oxy 23.44%, KOGAS 18.75%, BOC 25%","last_transaction":"ITSC signed 2010, bonus $2B","contract_duration":"20 years","pipelines":"Zubair–Basra export pipeline → Fao terminal","ports":"Khor al-Amaya Oil Terminal (KAAOT), Al-Basra Oil Terminal (ABOT), Fao","rail":"Basra–Baghdad railway (Zubair junction)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 10. Nahr Umr Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Nahr Umr Field', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.7500, 47.5833, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'TotalEnergies + BOC', 'joint_venture',
  35.00, 1.80,
  2400000, 2000000000, 2400000,
  '{"start_year":1954,"production_bpd":80000,"quality":"Medium light","ownership_split":"TotalEnergies 18.75%, CNOOC 18.75%, Partex 9.5%, BOC 53%","last_transaction":"ITSC signed 2010","contract_duration":"20 years","pipelines":"Nahr Umr–Basra pipeline","ports":"ABOT, KAAOT","rail":"Basra rail hub"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 11. Luhais Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Luhais Field', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.1667, 47.3333, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'BOC / CNPC', 'state_owned',
  27.00, 2.50,
  900000, 800000000, 900000,
  '{"start_year":1969,"production_bpd":30000,"quality":"Medium heavy sour","last_transaction":"CNPC contract 2012","contract_duration":"20 years","pipelines":"Luhais–Zubair pipeline","ports":"Fao Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 12. Tuba Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Tuba Field', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.2500, 47.5000, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'Basra Oil Company (BOC)', 'state_owned',
  28.00, 2.00,
  450000, NULL, 450000,
  '{"start_year":1975,"production_bpd":15000,"quality":"Heavy sour","note":"Smaller field","pipelines":"Connected to Zubair/Basra network","ports":"ABOT","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 13. Suba & Luhais (Combined)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Suba & Luhais Field', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.0833, 47.4167, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'BOC / Basra Oil Company', 'state_owned',
  26.00, 3.00,
  600000, NULL, 600000,
  '{"start_year":1976,"production_bpd":20000,"quality":"Heavy sour","note":"Combined production","pipelines":"Southern pipeline network","ports":"Fao, ABOT","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- RUMAILA FIELD
-- =====================

-- 14. Rumaila North
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Rumaila North', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.3333, 47.3833, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'BP (lead) + CNPC + BOC', 'joint_venture',
  29.00, 2.00,
  30000000, 17000000000, 30000000,
  '{"start_year":1953,"production_bpd":1000000,"quality":"Medium sour — Basra Light export blend","note":"Iraq''s single largest producer, one of world''s largest fields","ownership_split":"BP 38%, CNPC 37%, BOC 25%","last_transaction":"ITSC signed 2009, bonus $500M; BP/CNPC contract renewed 2023","contract_duration":"20 years (extended)","pipelines":"Rumaila–SCOP (Strategic Crude Oil Pipeline) → Fao; Basra Oil Pipeline","ports":"Al-Basra Oil Terminal (ABOT) — 1.8M bbl/day capacity; Khor al-Amaya (KAAOT)","rail":"Basra–Baghdad main line (Rumaila junction)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 15. Rumaila South
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Rumaila South', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.0833, 47.3167, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'BP + CNPC + BOC', 'joint_venture',
  28.00, 2.20,
  18000000, NULL, 18000000,
  '{"start_year":1953,"production_bpd":600000,"quality":"Medium sour","note":"Combined north+south ~1.6M bbl/day peak. Part of 17B barrel total reserves","ownership_split":"BP, CNPC, BOC (same contract as North)","pipelines":"Rumaila South–SCOP pipeline","ports":"ABOT, KAAOT, Fao SPM buoys","rail":"Basra rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- WEST QURNA
-- =====================

-- 16. West Qurna-1
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'West Qurna-1', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.7833, 47.3667, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'ExxonMobil (lead) + PetroChina + IICL + BOC', 'joint_venture',
  30.00, 2.10,
  14400000, 8700000000, 14400000,
  '{"start_year":1972,"production_bpd":480000,"quality":"Medium sour — Basra Light blend","ownership_split":"ExxonMobil 32.7%, PetroChina 32.7%, IICL 9.7%, BOC 25%","last_transaction":"ITSC 2010, bonus $100M; ExxonMobil exploring stake sale to PetroChina ~2023","contract_duration":"20 years","pipelines":"WQ1–SCOP pipeline → Fao; Basra export system","ports":"ABOT, KAAOT, Fao SPM","rail":"Basra rail (indirect)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 17. West Qurna-2
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'West Qurna-2', 'Basra Oil Company (BOC)', 'Basra Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  30.9167, 47.2500, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'LUKOIL (lead) + BOC', 'joint_venture',
  24.00, 3.50,
  12000000, 13000000000, 12000000,
  '{"start_year":2014,"production_bpd":400000,"quality":"Heavy sour — Basra Heavy export blend","ownership_split":"LUKOIL 75%, BOC 25%","last_transaction":"ITSC 2010, bonus $200M; LUKOIL considered exit 2022 (sanctions pressure)","contract_duration":"20 years","pipelines":"WQ2–Basra Heavy pipeline → Fao; dedicated heavy crude line","ports":"Fao SPM (Single Point Mooring), ABOT","rail":"None direct"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- MAJNOON FIELD
-- =====================

-- 18. Majnoon Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Majnoon Field', 'Basra Oil Company (BOC)', 'Basra Governorate, near Iranian border, Iraq', NULL,
  'Energy', 'Crude Oil',
  31.1667, 47.8333, 'Iraq', 'Basra', 'Basra',
  'oil_field', 'operational',
  'Basra Oil Company (BOC)', 'state_owned',
  27.00, 2.50,
  7200000, 13000000000, 7200000,
  '{"start_year":1976,"production_bpd":240000,"quality":"Medium heavy sour","note":"One of world''s largest untapped reserves. Declining post-Shell exit","ownership_pre_2018":"Shell 45%, Petronas 30%, BOC 25%","last_transaction":"Shell exit 2018 — handed back to BOC; Shell cited low remuneration fee ($1.39/bbl)","contract_duration":"20 years (ITSC)","pipelines":"Majnoon–Basra pipeline; Majnoon–Fao export pipeline (under expansion)","ports":"ABOT, Fao SPM","rail":"None direct"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- ADDITIONAL MAJOR FIELDS
-- =====================

-- 19. Halfaya Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Halfaya Field', 'Missan Oil Company (MOC)', 'Missan Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  31.8333, 47.7500, 'Iraq', 'Missan', 'Amarah',
  'oil_field', 'operational',
  'CNPC (lead) + TotalEnergies + Petronas + MOC', 'joint_venture',
  26.00, 3.20,
  6900000, 4100000000, 6900000,
  '{"start_year":2012,"production_bpd":230000,"quality":"Heavy sour","ownership_split":"CNPC 37.5%, Total 18.75%, Petronas 18.75%, MOC 25%","last_transaction":"ITSC 2010, bonus $150M; TotalEnergies partial exit discussions 2023","contract_duration":"20 years","pipelines":"Halfaya–Missan export pipeline → Basra system","ports":"ABOT (via Basra)","rail":"Amarah rail (indirect)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 20. Buzurgan Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Buzurgan Field', 'Missan Oil Company (MOC)', 'Missan Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  32.0000, 47.6667, 'Iraq', 'Missan', 'Missan',
  'oil_field', 'operational',
  'Missan Oil Company (MOC)', 'state_owned',
  25.00, 3.00,
  600000, NULL, 600000,
  '{"start_year":1972,"production_bpd":20000,"quality":"Heavy sour","pipelines":"Missan pipeline network","ports":"ABOT via Basra","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 21. Abu Ghirab Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Abu Ghirab Field', 'Missan Oil Company (MOC)', 'Missan Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  31.9167, 47.5000, 'Iraq', 'Missan', 'Missan',
  'oil_field', 'operational',
  'Missan Oil Company (MOC)', 'state_owned',
  28.00, 2.50,
  450000, NULL, 450000,
  '{"start_year":1976,"production_bpd":15000,"quality":"Medium heavy sour","maturity":"Mature field","pipelines":"Missan pipeline system","ports":"ABOT","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 22. Fauqi Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Fauqi Field', 'Missan Oil Company (MOC)', 'Missan Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  32.1667, 47.4167, 'Iraq', 'Missan', 'Missan',
  'oil_field', 'operational',
  'Missan Oil Company (MOC)', 'state_owned',
  27.00, 2.80,
  300000, NULL, 300000,
  '{"start_year":1977,"production_bpd":10000,"quality":"Heavy sour","pipelines":"Missan pipeline network","ports":"ABOT","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 23. Nasiriyah Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Nasiriyah Field', 'Iraq Drilling Company', 'Dhi Qar Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  31.0833, 46.2500, 'Iraq', 'Dhi Qar', 'Nasiriyah',
  'oil_field', 'operational',
  'Iraq Drilling Company / INPEX', 'state_owned',
  30.00, 2.40,
  600000, 4400000000, 600000,
  '{"start_year":1975,"production_bpd":20000,"potential_bpd":80000,"quality":"Medium sour","note":"Development stalled; INPEX ITSC 2013 stalled","last_transaction":"INPEX ITSC 2013, ~$200M bonus","contract_duration":"20 years","pipelines":"Planned Nasiriyah–Basra pipeline","ports":"ABOT (planned link)","rail":"Nasiriyah rail station"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 24. Gharraf Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Gharraf Field', 'South Oil Company (SOC)', 'Dhi Qar Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  31.4167, 46.5833, 'Iraq', 'Dhi Qar', 'Dhi Qar',
  'oil_field', 'operational',
  'Petronas (lead) + JAPEX + SOC', 'joint_venture',
  31.00, 2.20,
  2100000, 860000000, 2100000,
  '{"start_year":2013,"production_bpd":70000,"quality":"Medium sour","ownership_split":"Petronas 60%, JAPEX 15%, SOC 25%","last_transaction":"ITSC 2010, bonus $110M","contract_duration":"20 years","pipelines":"Gharraf–Basra pipeline","ports":"ABOT","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 25. Badra Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Badra Field', 'Missan Oil Company (MOC)', 'Wasit Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  33.1667, 46.1667, 'Iraq', 'Wasit', 'Wasit',
  'oil_field', 'operational',
  'Gazprom Neft (lead) + KOGAS + Petronas + TPAO + MOC', 'joint_venture',
  36.00, 1.40,
  1800000, 2000000000, 1800000,
  '{"start_year":2014,"production_bpd":60000,"quality":"Medium light","ownership_split":"Gazprom Neft 30%, KOGAS 22.5%, Petronas 15%, TPAO 7.5%, MOC 25%","last_transaction":"ITSC 2010, bonus $500M","contract_duration":"20 years","pipelines":"Badra–Kut–Basra export pipeline","ports":"ABOT (via southern pipeline)","rail":"Kut rail line (indirect)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 26. Ahdab Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Ahdab Field', 'Al-Waha Oil Company', 'Wasit Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  32.5000, 45.8333, 'Iraq', 'Wasit', 'Wasit',
  'oil_field', 'operational',
  'CNPC (lead) + Al-Waha OC', 'joint_venture',
  33.00, 1.60,
  900000, 1000000000, 900000,
  '{"start_year":2012,"production_bpd":30000,"quality":"Medium","ownership_split":"CNPC 75%, Al-Waha OC 25%","last_transaction":"ITSC 2008, bonus $150M (first modern contract)","contract_duration":"20 years","pipelines":"Ahdab–Kut pipeline","ports":"ABOT (via Basra southern network)","rail":"Kut–Baghdad line (indirect)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 27. Mansuriya Gas/Condensate Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Mansuriya Field', 'State of Iraq', 'Diyala Governorate, Iraq', NULL,
  'Energy', 'Crude Oil',
  33.8333, 45.5000, 'Iraq', 'Diyala', 'Diyala',
  'oil_field', 'planned',
  'TPAO + Kuwait Energy + KOGAS', 'joint_venture',
  48.00, 0.30,
  NULL, NULL, NULL,
  '{"status":"Development stalled","note":"Gas field with condensate, ITSC 2010","production_bpd_potential":5000,"quality":"Condensate, sweet","ownership_split":"TPAO 40%, Kuwait Energy 30%, KOGAS 30%","contract_duration":"20 years","pipelines":"Planned only","ports":"None (landlocked)","rail":"None"}'::jsonb
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
SELECT count(*) AS iraq_oil_fields
FROM public.commodity_locations
WHERE country = 'Iraq' AND commodity_name = 'Crude Oil';

SELECT count(*) AS total_locations
FROM public.commodity_locations;
