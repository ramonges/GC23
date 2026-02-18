-- ============================================================
-- Kazakhstan Oil Production Sites — 24 Fields (UPSERT)
-- Run this in Supabase SQL Editor
-- ============================================================

-- =====================
-- TENGIZ FIELD
-- =====================

-- 1. Tengiz Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Tengiz Field', 'Tengizchevroil (TCO)', 'Atyrau Region, northwestern Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.4167, 53.1667, 'Kazakhstan', 'Atyrau', 'Tengiz',
  'oil_field', 'operational',
  'Tengizchevroil (TCO) — Chevron-led JV', 'joint_venture',
  45.00, 0.55,
  21000000, 9000000000, 21000000,
  '{"start_year":1991,"discovery":"Soviet discovery 1979","production_bpd":700000,"quality":"Light sweet (raw has high H₂S)","note":"Future Growth Project targeting 850,000+ bpd","ownership_split":"Chevron 50%, ExxonMobil 25%, KazMunayGas (KMG) 20%, LukArco 5%","last_transaction":"FGP-WPMP expansion contract ~$45B, 2016–2024; original PSA 1993","contract_duration":"40 years (PSA to 2033, extendable)","pipelines":"Caspian Pipeline Consortium (CPC) → Novorossiysk, Russia (1,511km); TCO–Atyrau pipeline","ports":"Novorossiysk Black Sea Terminal (CPC); Caspian tanker loading at Aqtau","rail":"Atyrau–Aktobe rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 2. Korolev Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Korolev Field', 'Tengizchevroil (TCO)', 'Tengiz area, Atyrau Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.5833, 53.3333, 'Kazakhstan', 'Atyrau', 'Tengiz',
  'oil_field', 'operational',
  'Tengizchevroil (TCO)', 'joint_venture',
  44.00, 0.55,
  1500000, 1500000000, 1500000,
  '{"start_year":"2000s","production_bpd":50000,"quality":"Light sweet","note":"Satellite to Tengiz","ownership_split":"Chevron 50%, ExxonMobil 25%, KMG 20%, LukArco 5%","pipelines":"CPC Pipeline via Tengiz processing","ports":"Novorossiysk via CPC","rail":"Atyrau rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- KASHAGAN FIELD (CASPIAN)
-- =====================

-- 3. Kashagan Field — Phase 1
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kashagan Field — Phase 1', 'NCOC Consortium', 'North Caspian Sea, Atyrau Region offshore, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.5000, 51.5833, 'Kazakhstan', 'Caspian Sea', 'Offshore Atyrau',
  'oil_field', 'operational',
  'North Caspian Operating Company (NCOC)', 'joint_venture',
  42.00, 0.50,
  12000000, 9600000000, 12000000,
  '{"start_year":2013,"production_bpd":400000,"target_bpd":450000,"quality":"Light, extremely sour raw (~20%+ H₂S); treated export ~0.5%","note":"World''s largest discovery since 1968. Suspended 2013–2016 (H₂S pipeline cracking), resumed 2016","original_reserves_bbl":"38 billion OOIP","ownership_split":"KMG 16.88%, Shell 16.35%, ExxonMobil 16.35%, TotalEnergies 16.35%, CNPC 8.33%, Eni 16.35%, Inpex 7.56%","last_transaction":"ConocoPhillips sold 8.4% to CNPC for $5B (2013); NCOC restructuring 2008","contract_duration":"PSA to 2041","pipelines":"CPC Pipeline (offshore–onshore–Novorossiysk); Kashagan–Karabatan onshore processing pipeline","ports":"Novorossiysk Black Sea Terminal (CPC); Aqtau Caspian Port (tanker backup)","rail":"Atyrau rail hub (onshore processing at Karabatan)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 4. Kalamkas-Sea / Khazar Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kalamkas-Sea / Khazar Field', 'NCOC / KMG', 'North Caspian, offshore, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.8333, 51.2500, 'Kazakhstan', 'Caspian Sea', 'Offshore',
  'oil_field', 'planned',
  'NCOC / KMG', 'joint_venture',
  40.00, 1.00,
  NULL, 4000000000, NULL,
  '{"status":"Development / Pre-production","planned_start":"2030s","target_bpd":150000,"quality":"Light sour (similar to Kashagan)","note":"FID expected ~2026","ownership_split":"KMG majority + NCOC partners","contract_duration":"PSA framework (North Caspian PSA)","pipelines":"Planned connection to CPC/Kashagan system","ports":"Aqtau, Novorossiysk (planned)","rail":"None direct"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 5. Aktote Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Aktote Field', 'NCOC', 'North Caspian offshore, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.7500, 51.4167, 'Kazakhstan', 'Caspian Sea', 'Offshore',
  'oil_field', 'planned',
  'NCOC', 'joint_venture',
  41.00, 1.00,
  NULL, 2500000000, NULL,
  '{"status":"Pre-development / Appraisal","potential_bpd":100000,"quality":"Light sour","ownership_split":"NCOC partners (same as Kashagan)","pipelines":"Planned CPC integration","ports":"Novorossiysk (planned)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 6. Kairan Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kairan Field', 'NCOC', 'North Caspian offshore, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.6667, 51.3333, 'Kazakhstan', 'Caspian Sea', 'Offshore',
  'oil_field', 'planned',
  'NCOC', 'joint_venture',
  42.00, 1.00,
  NULL, 2000000000, NULL,
  '{"status":"Pre-development","target_bpd":90000,"quality":"Light sour","ownership_split":"NCOC consortium","pipelines":"Planned integration with Kashagan infrastructure","ports":"Aqtau, Novorossiysk","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- KARACHAGANAK FIELD
-- =====================

-- 7. Karachaganak Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Karachaganak Field', 'Karachaganak Petroleum Operating (KPO)', 'West Kazakhstan Region, Aksai area, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  51.5833, 53.7500, 'Kazakhstan', 'West Kazakhstan', 'Aksai',
  'oil_field', 'operational',
  'KPO — BG/Shell/Eni/Chevron/KMG JV', 'joint_venture',
  48.00, 1.50,
  7200000, 9000000000, 7200000,
  '{"start_year":1984,"production_bpd":240000,"quality":"Light condensate, sour","note":"Also major gas producer (~1.35 trillion m³ gas reserves)","ownership_split":"Shell 29.25%, Eni 29.25%, Chevron 18%, LUKOIL 13.5%, KMG 10%","last_transaction":"KMG acquired 10% from BG/Shell for $1.5B (2012); KPO PSA signed 1997","contract_duration":"PSA to 2037","pipelines":"Karachaganak–Atyrau Pipeline (KAP) → CPC → Novorossiysk; Orenburg Gas Plant pipeline (Russia)","ports":"Novorossiysk via CPC; Orenburg processing (Russia)","rail":"Aksai–Uralsk rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 8. Chinarevskoye Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Chinarevskoye Field', 'Nostrum Oil & Gas', 'West Kazakhstan, Karachaganak fringe, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  51.3333, 52.8333, 'Kazakhstan', 'West Kazakhstan', 'Aksai',
  'oil_field', 'operational',
  'Zhaikmunai / Nostrum Oil & Gas', 'private',
  47.00, 1.20,
  900000, 500000000, 900000,
  '{"start_year":2009,"production_bpd":30000,"quality":"Light condensate","note":"Listed London/Astana","last_transaction":"Bond restructuring 2021","contract_duration":"Concession to 2034","pipelines":"KAP integration + local gathering; CPC via Atyrau","ports":"Novorossiysk via CPC","rail":"Aksai rail connection"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- AKTOBE REGION
-- =====================

-- 9. Zhanazhol Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Zhanazhol Field', 'CNPC-Aktobemunaigas', 'Aktobe Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  48.4167, 57.2500, 'Kazakhstan', 'Aktobe', 'Aktobe',
  'oil_field', 'operational',
  'CNPC-Aktobemunaigas (CNPC subsidiary)', 'joint_venture',
  41.00, 0.40,
  3000000, 1200000000, 3000000,
  '{"start_year":1978,"production_bpd":100000,"quality":"Light sweet","ownership_split":"CNPC 85.42%, KMG 14.58%","last_transaction":"CNPC acquired Aktobemunaigas 1997 for $325M — China''s first major overseas oil acquisition","contract_duration":"Concession to 2025 (under renegotiation)","pipelines":"Kazakhstan–China Pipeline (KCP) — 2,228km to Alashankou; Aktobe–Orsk pipeline (Russia backup)","ports":"None direct (landlocked); Aqtau Caspian (indirect)","rail":"Aktobe–Kandyagash rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 10. Kenkiyak Field — Shallow
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kenkiyak Field — Shallow', 'CNPC-Aktobemunaigas', 'Aktobe Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  48.6833, 56.8333, 'Kazakhstan', 'Aktobe', 'Aktobe',
  'oil_field', 'operational',
  'CNPC-Aktobemunaigas', 'joint_venture',
  39.00, 0.60,
  1200000, 800000000, 1200000,
  '{"start_year":1966,"production_bpd":40000,"quality":"Light","ownership_split":"CNPC 85.42%, KMG 14.58%","pipelines":"Kenkiyak–Atyrau pipeline; Kazakhstan–China Pipeline","ports":"Novorossiysk via CPC (indirect); Aqtau","rail":"Aktobe rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 11. Kenkiyak Field — Deep
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kenkiyak Field — Deep', 'CNPC-Aktobemunaigas', 'Aktobe Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  48.7500, 56.9167, 'Kazakhstan', 'Aktobe', 'Aktobe',
  'oil_field', 'operational',
  'CNPC-Aktobemunaigas', 'joint_venture',
  35.00, 1.80,
  750000, 600000000, 750000,
  '{"start_year":2003,"production_bpd":25000,"quality":"Medium light, Sour deep reservoir (deep Devonian reservoirs)","ownership_split":"CNPC 85.42%, KMG 14.58%","pipelines":"Kenkiyak–Kumkol pipeline; Kazakhstan–China Pipeline","ports":"Aqtau (indirect)","rail":"Aktobe–Emba rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 12. Alibekmola Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Alibekmola Field', 'CNPC-Aktobemunaigas', 'Aktobe Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  48.9167, 57.5000, 'Kazakhstan', 'Aktobe', 'Aktobe',
  'oil_field', 'operational',
  'CNPC-Aktobemunaigas', 'joint_venture',
  40.00, 0.40,
  600000, 400000000, 600000,
  '{"start_year":1999,"production_bpd":20000,"quality":"Light sweet","ownership_split":"CNPC majority / KMG","pipelines":"Aktobe regional pipeline network → KCP","ports":"None direct","rail":"Aktobe rail hub"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 13. Kozhasai Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kozhasai Field', 'CNPC-Aktobemunaigas', 'Aktobe Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  48.5000, 57.0833, 'Kazakhstan', 'Aktobe', 'Aktobe',
  'oil_field', 'operational',
  'CNPC-Aktobemunaigas', 'joint_venture',
  38.00, 0.50,
  240000, NULL, 240000,
  '{"start_year":2001,"production_bpd":8000,"quality":"Light","note":"Smaller field","ownership_split":"CNPC / KMG","pipelines":"Aktobe gathering system","ports":"None direct","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 14. Urikhtau Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Urikhtau Field', 'KMG / Aktobe Oil & Gas', 'Aktobe Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  49.5000, 56.1667, 'Kazakhstan', 'Aktobe', 'Aktobe',
  'oil_field', 'operational',
  'KMG / Aktobe Oil & Gas', 'state_owned',
  36.00, 0.80,
  300000, NULL, 300000,
  '{"start_year":2005,"production_bpd":10000,"quality":"Medium light","pipelines":"Aktobe pipeline network","ports":"None direct","rail":"Aktobe"}'::jsonb
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

-- 15. Kumkol Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kumkol Field', 'PetroKazakhstan (CNPC) + Turgai Petroleum', 'Kyzylorda Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.9167, 65.6667, 'Kazakhstan', 'Kyzylorda', 'Kumkol',
  'oil_field', 'operational',
  'PetroKazakhstan (CNPC) + Turgai Petroleum (LukOil/KMG JV)', 'joint_venture',
  42.00, 0.20,
  2250000, 1000000000, 2250000,
  '{"start_year":1990,"production_bpd":75000,"quality":"Light sweet","ownership_split":"CNPC (PetroKazakhstan) 50%, Turgai Petroleum 50% (LukOil 50%, KMG 50%)","last_transaction":"CNPC acquired PetroKazakhstan for $4.18B (2005) — largest Chinese overseas acquisition at time","contract_duration":"Concession to 2030","pipelines":"Kazakhstan–China Pipeline (KCP) — direct connection; Kumkol–Karakoin pipeline","ports":"None direct (central Kazakhstan, landlocked)","rail":"Zhezkazgan–Kyzylorda rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 16. South Kumkol Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'South Kumkol Field', 'PetroKazakhstan (CNPC)', 'Kyzylorda Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.7500, 65.5000, 'Kazakhstan', 'Kyzylorda', 'Kumkol',
  'oil_field', 'operational',
  'PetroKazakhstan (CNPC)', 'joint_venture',
  41.00, 0.20,
  600000, 300000000, 600000,
  '{"start_year":1995,"production_bpd":20000,"quality":"Light sweet","pipelines":"KCP connection","ports":"None","rail":"Kyzylorda rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 17. Dulat Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Dulat Field', 'Turgai Petroleum (LukOil / KMG)', 'Kyzylorda Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  45.5000, 64.8333, 'Kazakhstan', 'Kyzylorda', 'Kyzylorda',
  'oil_field', 'operational',
  'Turgai Petroleum (LukOil / KMG)', 'joint_venture',
  40.00, 0.30,
  450000, NULL, 450000,
  '{"start_year":1998,"production_bpd":15000,"quality":"Light sweet","ownership_split":"LukOil 50%, KMG 50% (via Turgai)","pipelines":"Kumkol–KCP system","ports":"None","rail":"Kyzylorda"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 18. Aktobe Emba Fields — Embamunaigas
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Aktobe Emba Fields — Embamunaigas', 'KMG Embamunaigas', 'Atyrau/Aktobe border, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  47.5000, 55.0000, 'Kazakhstan', 'Atyrau', 'Emba',
  'oil_field', 'operational',
  'KMG Embamunaigas (state subsidiary)', 'state_owned',
  30.00, 1.50,
  1050000, 500000000, 1050000,
  '{"start_year":1911,"production_bpd":35000,"quality":"Medium sour","note":"Some of world''s oldest continuously producing fields. Many small fields cluster","pipelines":"Emba–Atyrau pipeline → CPC","ports":"Novorossiysk via CPC; Aqtau tanker","rail":"Emba–Atyrau rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 19. Uzen Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Uzen Field', 'KMG Ozenmunaigas', 'Mangystau Region, southeastern Caspian coast, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  43.5833, 53.8333, 'Kazakhstan', 'Mangystau', 'Zhanaozen',
  'oil_field', 'operational',
  'KMG Ozenmunaigas', 'state_owned',
  21.00, 0.60,
  1800000, 1500000000, 1800000,
  '{"start_year":1965,"production_bpd":60000,"quality":"Heavy, Waxy paraffinic crude (high pour point)","note":"Soviet giant field, declining, EOR ongoing","original_reserves_bbl":"~4B OOIP","pipelines":"Uzen–Atyrau–Samara pipeline (Transneft, Russia); CPC indirect","ports":"Aqtau Caspian Port (closest, 150km)","rail":"Zhanaozen (Uzen)–Aktau rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 20. Zhetybai Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Zhetybai Field', 'KMG Ozenmunaigas', 'Mangystau Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  43.7500, 52.8333, 'Kazakhstan', 'Mangystau', 'Mangystau',
  'oil_field', 'operational',
  'KMG Ozenmunaigas', 'state_owned',
  30.00, 0.70,
  600000, 500000000, 600000,
  '{"start_year":1961,"production_bpd":20000,"quality":"Medium, Waxy","note":"One of Kazakhstan''s first fields","maturity":"Mature field","pipelines":"Zhetybai–Uzen–Atyrau pipeline","ports":"Aqtau Port","rail":"Aktau rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 21. Karamandybas Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Karamandybas Field', 'Mangistaumunaigas (KMG + CNPC JV)', 'Mangystau Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  44.1667, 52.5000, 'Kazakhstan', 'Mangystau', 'Mangystau',
  'oil_field', 'operational',
  'KMG / Mangistaumunaigas', 'joint_venture',
  25.00, 0.90,
  450000, NULL, 450000,
  '{"start_year":1974,"production_bpd":15000,"quality":"Heavy","ownership_split":"KMG 50%, CNPC 50%","last_transaction":"CNPC acquired 50% of Mangistaumunaigas for $2.6B (2009)","pipelines":"Mangystau–Atyrau pipeline","ports":"Aqtau","rail":"Aktau rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 22. Dunga Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Dunga Field', 'KMG / CITIC', 'Mangystau Region, onshore Caspian coast, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  44.5000, 51.9167, 'Kazakhstan', 'Mangystau', 'Mangystau',
  'oil_field', 'operational',
  'Calumet / Caspi Neft (CITIC/KMG)', 'joint_venture',
  42.00, 0.30,
  300000, NULL, 300000,
  '{"start_year":1996,"production_bpd":10000,"quality":"Light sweet","ownership_split":"KMG / CITIC (Chinese consortium)","pipelines":"Dunga–Atyrau pipeline","ports":"Aqtau Port (nearby)","rail":"Aktau rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 23. Arman Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Arman Field', 'KMG / Caspi Neft', 'Atyrau Region, onshore, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  46.5000, 52.3333, 'Kazakhstan', 'Atyrau', 'Atyrau',
  'oil_field', 'operational',
  'KMG / Caspi Neft', 'state_owned',
  38.00, 0.40,
  150000, NULL, 150000,
  '{"start_year":2000,"production_bpd":5000,"quality":"Light","note":"Smaller field","pipelines":"Atyrau gathering network → CPC","ports":"Aqtau, Novorossiysk","rail":"Atyrau rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 24. Nurali Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Nurali Field', 'KMG Embamunaigas', 'Atyrau Region, Kazakhstan', NULL,
  'Energy', 'Crude Oil',
  47.0000, 53.0000, 'Kazakhstan', 'Atyrau', 'Atyrau',
  'oil_field', 'operational',
  'KMG Embamunaigas', 'state_owned',
  36.00, 0.60,
  240000, NULL, 240000,
  '{"start_year":1995,"production_bpd":8000,"quality":"Medium light","pipelines":"Emba–CPC system","ports":"Novorossiysk","rail":"None"}'::jsonb
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
SELECT count(*) AS kazakhstan_oil_fields
FROM public.commodity_locations
WHERE country = 'Kazakhstan' AND commodity_name = 'Crude Oil';

SELECT count(*) AS total_locations
FROM public.commodity_locations;
