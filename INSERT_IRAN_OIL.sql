-- ============================================================
-- Iran Oil Production Sites — 33 Fields (UPSERT)
-- Run this in Supabase SQL Editor
-- ============================================================

-- =====================
-- KHUZESTAN PROVINCE
-- =====================

-- 1. Ahvaz Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Ahvaz Field', 'National Iranian Oil Company (NIOC)', 'Ahvaz, Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  31.3333, 49.0000, 'Iran', 'Khuzestan', 'Ahvaz',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  33.00, 1.40,
  9000000, 30000000000, 9000000,
  '{"start_year":1958,"production_bpd":300000,"quality":"Medium sour","original_reserves_bbl":"65 billion","note":"One of world''s largest fields","pipelines":"Ahvaz–Abadan pipeline, Ahvaz–Tehran pipeline, IGAT system","ports":"Abadan refinery terminal, Kharg Island via pipeline","rail":"Ahvaz railway hub"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 2. Marun Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Marun Field', 'NIOC', 'Behbahan area, Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  30.8333, 49.6667, 'Iran', 'Khuzestan', 'Behbahan',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  34.00, 1.20,
  7500000, 22000000000, 7500000,
  '{"start_year":1963,"production_bpd":250000,"quality":"Medium sour","original_reserves_bbl":"22 billion OOIP","pipelines":"Marun–Gachsaran–Kharg Island pipeline","ports":"Kharg Island Export Terminal","rail":"Behbahan rail link (indirect)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 3. Aghajari Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Aghajari Field', 'NIOC', 'Khuzestan / Kohgiluyeh border, Iran', NULL,
  'Energy', 'Crude Oil',
  30.7500, 49.8333, 'Iran', 'Khuzestan', 'Aghajari',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  34.00, 1.10,
  6000000, 8000000000, 6000000,
  '{"start_year":1938,"production_bpd":200000,"quality":"Medium sweet-sour","original_reserves_bbl":"30 billion OOIP","note":"One of Iran''s oldest fields, EOR ongoing","pipelines":"Aghajari–Abadan refinery pipeline","ports":"Abadan, Kharg Island","rail":"None direct"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 4. Karanj Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Karanj Field', 'NIOC', 'Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  31.9167, 49.3333, 'Iran', 'Khuzestan', 'Karanj',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  36.00, 0.90,
  4800000, 6000000000, 4800000,
  '{"start_year":1963,"production_bpd":160000,"quality":"Medium light","pipelines":"Karanj–Ahvaz pipeline","ports":"Kharg Island (via Ahvaz hub)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 5. Bibi Hakimeh Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Bibi Hakimeh Field', 'NIOC', 'Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  30.5000, 50.0833, 'Iran', 'Khuzestan', 'Bibi Hakimeh',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  24.00, 2.50,
  1800000, 7000000000, 1800000,
  '{"start_year":1961,"production_bpd":60000,"quality":"Heavy sour","maturity":"Mature field","pipelines":"Bibi Hakimeh–Gachsaran pipeline","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 6. Rag-e-Sefid Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Rag-e-Sefid Field', 'NIOC', 'Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  32.0000, 49.1667, 'Iran', 'Khuzestan', 'Rag-e-Sefid',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  35.00, 1.00,
  2100000, 8000000000, 2100000,
  '{"start_year":1964,"production_bpd":70000,"quality":"Medium","pipelines":"Connected to Ahvaz pipeline network","ports":"Kharg Island via Ahvaz","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 7. Mansouri Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Mansouri Field', 'NIOC', 'Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  31.5000, 49.5000, 'Iran', 'Khuzestan', 'Mansouri',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  32.00, 1.60,
  2400000, 10000000000, 2400000,
  '{"start_year":1966,"production_bpd":80000,"quality":"Medium sour","pipelines":"Mansouri–Ahvaz pipeline","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 8. Haft Kel Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Haft Kel Field', 'NIOC', 'Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  31.6667, 49.2500, 'Iran', 'Khuzestan', 'Haft Kel',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  37.00, 0.60,
  450000, 1000000000, 450000,
  '{"start_year":1927,"production_bpd":15000,"quality":"Light sweet","note":"Colonial era, Anglo-Persian Oil. Declining legacy field","pipelines":"Haft Kel–Abadan historical pipeline","ports":"Abadan Refinery Terminal","rail":"Ahvaz rail via Haft Kel station"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 9. Shadegan Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Shadegan Field', 'NIOC', 'Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  30.6667, 48.6667, 'Iran', 'Khuzestan', 'Shadegan',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  29.00, 1.80,
  600000, 2500000000, 600000,
  '{"start_year":1970,"production_bpd":20000,"quality":"Medium heavy sour","pipelines":"Shadegan–Abadan pipeline","ports":"Abadan","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 10. Ab Teymour Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Ab Teymour Field', 'NIOC', 'Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  31.3333, 48.8333, 'Iran', 'Khuzestan', 'Ab Teymour',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  27.00, 2.20,
  1200000, 4000000000, 1200000,
  '{"start_year":1970,"production_bpd":40000,"quality":"Heavy sour","pipelines":"Ab Teymour–Ahvaz pipeline","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- PERSIAN GULF (OFFSHORE)
-- =====================

-- 11. Soroush Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Soroush Field', 'NIOC', 'Persian Gulf, offshore Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  29.6667, 49.7500, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  18.00, 3.50,
  1800000, 1400000000, 1800000,
  '{"start_year":2002,"production_bpd":60000,"quality":"Very heavy, Extra heavy sour","last_transaction":"Shell PSC terminated ~2010 (sanctions)","pipelines":"Offshore FPSO → Kharg Island","ports":"Kharg Island Export Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 12. Nowruz Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Nowruz Field', 'NIOC', 'Persian Gulf, offshore, Iran', NULL,
  'Energy', 'Crude Oil',
  29.8333, 49.6667, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  22.00, 3.00,
  900000, 2000000000, 900000,
  '{"start_year":1968,"production_bpd":30000,"quality":"Heavy sour","note":"Rebuilt post Iran-Iraq War damage, rebuilt 1990s","pipelines":"Nowruz–Kharg Island subsea pipeline","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 13. Forouzan Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Forouzan Field', 'NIOC', 'Persian Gulf, offshore, Iran', NULL,
  'Energy', 'Crude Oil',
  28.7500, 50.5833, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  31.00, 1.70,
  1200000, 3500000000, 1200000,
  '{"start_year":1966,"production_bpd":40000,"quality":"Medium sour","pipelines":"Forouzan–Lavan Island pipeline","ports":"Lavan Island Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 14. Dorood (Darius) Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Dorood (Darius) Field', 'NIOC', 'Persian Gulf, Iran', NULL,
  'Energy', 'Crude Oil',
  28.5000, 51.0833, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  33.00, 1.40,
  2100000, 3700000000, 2100000,
  '{"start_year":1965,"production_bpd":70000,"quality":"Medium","last_transaction":"Japan''s JAPEX had concession, exited ~2010","pipelines":"Dorood–Kharg subsea + Lavan pipeline","ports":"Kharg Island, Lavan Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 15. Abuzar Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Abuzar Field', 'NIOC', 'Persian Gulf, offshore, Iran', NULL,
  'Energy', 'Crude Oil',
  29.0833, 50.2500, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  28.00, 2.80,
  1500000, 2500000000, 1500000,
  '{"start_year":1970,"production_bpd":50000,"quality":"Heavy sour","pipelines":"Abuzar–Kharg subsea pipeline","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 16. Salman Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Salman Field', 'NIOC', 'Persian Gulf, Abu Musa area, Iran', NULL,
  'Energy', 'Crude Oil',
  26.5833, 55.0000, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  36.00, 0.50,
  1800000, 1800000000, 1800000,
  '{"start_year":1966,"production_bpd":60000,"quality":"Light sweet","note":"Disputed zone with UAE, Iran operates","pipelines":"Salman–Lavan Island pipeline","ports":"Lavan Island Terminal, Hormuz offshore","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 17. Hendijan Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Hendijan Field', 'NIOC', 'Persian Gulf, shallow offshore, Iran', NULL,
  'Energy', 'Crude Oil',
  30.1667, 49.7000, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  26.00, 2.00,
  750000, NULL, 750000,
  '{"start_year":1969,"production_bpd":25000,"quality":"Heavy sour","pipelines":"Hendijan–Kharg","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 18. Reshadat (Rostam) Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Reshadat (Rostam) Field', 'NIOC', 'Persian Gulf, Iran', NULL,
  'Energy', 'Crude Oil',
  27.7500, 52.4167, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  35.00, 0.80,
  300000, NULL, 300000,
  '{"start_year":1965,"production_bpd":10000,"quality":"Light","note":"Rebuilt post-war","pipelines":"Reshadat–Sirri Island pipeline","ports":"Sirri Island Export Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 19. Sirri A & E Fields
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Sirri A & E Fields', 'NIOC', 'Persian Gulf, Sirri Island area, Iran', NULL,
  'Energy', 'Crude Oil',
  25.9000, 54.5500, 'Iran', 'Persian Gulf', 'Sirri Island',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  33.00, 1.30,
  1050000, 1000000000, 1050000,
  '{"start_year":1999,"production_bpd":35000,"quality":"Medium","last_transaction":"Total → NIOC reversion, 2018 (sanctions)","pipelines":"Sirri A/E–Sirri Island pipeline","ports":"Sirri Island Export Terminal","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 20. Bahregansar Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Bahregansar Field', 'NIOC', 'Persian Gulf, offshore, Iran', NULL,
  'Energy', 'Crude Oil',
  29.4500, 50.2167, 'Iran', 'Persian Gulf', 'Offshore',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  27.00, 2.00,
  600000, NULL, 600000,
  '{"start_year":1960,"production_bpd":20000,"quality":"Heavy sour","pipelines":"Bahregansar–Kharg subsea","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- ZAGROS BASIN
-- =====================

-- 21. Gachsaran Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Gachsaran Field', 'NIOC', 'Kohgiluyeh & Boyer-Ahmad Province, Zagros, Iran', NULL,
  'Energy', 'Crude Oil',
  30.3583, 50.7972, 'Iran', 'Zagros Basin', 'Gachsaran',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  28.00, 2.50,
  6900000, 15000000000, 6900000,
  '{"start_year":1940,"production_bpd":230000,"quality":"Medium heavy sour","original_reserves_bbl":"52 billion OOIP","pipelines":"Gachsaran–Kharg Island export pipeline (major trunk)","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 22. Pazanan Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Pazanan Field', 'NIOC', 'Zagros, Khuzestan/Kohgiluyeh border, Iran', NULL,
  'Energy', 'Crude Oil',
  30.5833, 50.0000, 'Iran', 'Zagros Basin', 'Pazanan',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  35.00, 1.00,
  1200000, 3000000000, 1200000,
  '{"start_year":1936,"production_bpd":40000,"quality":"Medium","maturity":"Mature field","pipelines":"Pazanan–Gachsaran pipeline","ports":"Kharg Island via Gachsaran","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 23. Ramshir Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Ramshir Field', 'NIOC', 'Zagros foothills, Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  31.0000, 49.3333, 'Iran', 'Zagros Basin', 'Ramshir',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  33.00, 1.10,
  450000, NULL, 450000,
  '{"start_year":1960,"production_bpd":15000,"quality":"Medium","maturity":"Mature field","pipelines":"Ramshir–Ahvaz pipeline","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 24. Kupal Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kupal Field', 'NIOC', 'Zagros, Khuzestan, Iran', NULL,
  'Energy', 'Crude Oil',
  31.7500, 49.7500, 'Iran', 'Zagros Basin', 'Kupal',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  36.00, 0.90,
  1500000, 5000000000, 1500000,
  '{"start_year":1964,"production_bpd":50000,"quality":"Medium light","pipelines":"Kupal–Ahvaz pipeline","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 25. Pare / Cheshmeh Khosh Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Pare / Cheshmeh Khosh Field', 'NIOC', 'Zagros, Ilam Province, Iran', NULL,
  'Energy', 'Crude Oil',
  33.2500, 47.5833, 'Iran', 'Zagros Basin', 'Ilam',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  38.00, 0.70,
  600000, NULL, 600000,
  '{"start_year":"1970s","production_bpd":20000,"quality":"Light sweet","pipelines":"Ilam–Ahvaz pipeline","ports":"Kharg Island (indirect)","rail":"Ilam rail (limited)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 26. Dehloran Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Dehloran Field', 'NIOC', 'Zagros, Ilam Province, Iran', NULL,
  'Energy', 'Crude Oil',
  32.6833, 47.2667, 'Iran', 'Zagros Basin', 'Dehloran',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  39.00, 0.60,
  900000, 2000000000, 900000,
  '{"start_year":1975,"production_bpd":30000,"quality":"Light sweet","pipelines":"Dehloran–West Iran pipeline","ports":"Kharg Island (via pipeline hub)","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 27. Sarkan / Tang-e-Bijar Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Sarkan / Tang-e-Bijar Field', 'NIOC', 'Zagros, Kermanshah Province, Iran', NULL,
  'Energy', 'Crude Oil',
  34.1667, 47.3333, 'Iran', 'Zagros Basin', 'Kermanshah',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  37.00, 0.60,
  240000, NULL, 240000,
  '{"start_year":"1980s","production_bpd":8000,"quality":"Light","note":"Smaller field","pipelines":"Kermanshah–Ahvaz pipeline","ports":"None direct (landlocked region)","rail":"Kermanshah rail line"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 28. Band-e-Karkheh Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Band-e-Karkheh Field', 'NIOC', 'Zagros/Khuzestan border, Iran', NULL,
  'Energy', 'Crude Oil',
  32.0833, 48.2500, 'Iran', 'Zagros Basin', 'Band-e-Karkheh',
  'oil_field', 'operational',
  'NIOC', 'state_owned',
  36.00, 0.80,
  300000, NULL, 300000,
  '{"start_year":1976,"production_bpd":10000,"quality":"Medium light","pipelines":"Khuzestan pipeline network","ports":"Kharg Island","rail":"None"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- =====================
-- CENTRAL IRAN
-- =====================

-- 29. Alborz Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Alborz Field', 'NIOC', 'Qom Province, Central Iran', NULL,
  'Energy', 'Crude Oil',
  34.5000, 50.8333, 'Iran', 'Central Iran', 'Qom',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  40.00, 0.40,
  150000, 500000000, 150000,
  '{"start_year":1956,"production_bpd":5000,"quality":"Light sweet","note":"Smaller output, landlocked, refinery-linked","pipelines":"Qom–Tehran pipeline","ports":"None direct","rail":"Qom rail station (Tehran main line)"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 30. Sarajeh Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Sarajeh Field', 'NIOC', 'Qom Province, Central Iran', NULL,
  'Energy', 'Crude Oil',
  34.2500, 50.5000, 'Iran', 'Central Iran', 'Qom',
  'oil_field', 'operational',
  'NIOC', 'state_owned',
  50.00, 0.10,
  90000, NULL, 90000,
  '{"start_year":1963,"production_bpd":3000,"quality":"Condensate, very light","note":"Gas dominant field with oil condensate","pipelines":"Qom gas/condensate pipeline","ports":"None direct","rail":"Qom railway"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 31. Tabas Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Tabas Field', 'NIOC', 'South Khorasan / Central Desert, Iran', NULL,
  'Energy', 'Crude Oil',
  33.5833, 56.9167, 'Iran', 'Central Iran', 'Tabas',
  'oil_field', 'operational',
  'NIOC / NIDC', 'state_owned',
  29.00, 1.00,
  150000, NULL, 150000,
  '{"start_year":"2010s","production_bpd":5000,"quality":"Medium heavy","note":"Development / Early production phase","pipelines":"Under development","ports":"None (landlocked)","rail":"Limited connectivity"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 32. Naft-e-Shah Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Naft-e-Shah Field', 'NIOC', 'Kermanshah Province, Iran', NULL,
  'Energy', 'Crude Oil',
  34.0167, 45.9667, 'Iran', 'Central Iran', 'Kermanshah',
  'oil_field', 'operational',
  'NIOC / PEDEC', 'state_owned',
  36.00, 0.80,
  150000, 200000000, 150000,
  '{"start_year":1923,"production_bpd":5000,"quality":"Light","note":"First Iranian oil field, historic, declining","pipelines":"Naft-e-Shah–Kermanshah historical pipeline","ports":"None direct","rail":"Kermanshah rail"}'::jsonb
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
  owner=EXCLUDED.owner, address=EXCLUDED.address, latitude=EXCLUDED.latitude, longitude=EXCLUDED.longitude,
  region=EXCLUDED.region, city=EXCLUDED.city, location_type=EXCLUDED.location_type,
  operational_status=EXCLUDED.operational_status, operator=EXCLUDED.operator, ownership_type=EXCLUDED.ownership_type,
  api_gravity=EXCLUDED.api_gravity, sulfur_content=EXCLUDED.sulfur_content,
  current_production=EXCLUDED.current_production, reserves_estimate=EXCLUDED.reserves_estimate, supply_volume=EXCLUDED.supply_volume,
  additional_info=EXCLUDED.additional_info, updated_at=NOW();

-- 33. Kabir Kuh Field
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, region, city, location_type,
  operational_status, operator, ownership_type,
  api_gravity, sulfur_content,
  current_production, reserves_estimate, supply_volume,
  additional_info
) VALUES (
  'Kabir Kuh Field', 'NIOC', 'Ilam/Lorestan, Zagros-Central fringe, Iran', NULL,
  'Energy', 'Crude Oil',
  33.0000, 47.7500, 'Iran', 'Central Iran', 'Ilam',
  'oil_field', 'operational',
  'NIOC', 'state_owned',
  37.00, 0.70,
  360000, NULL, 360000,
  '{"start_year":"1970s","production_bpd":12000,"quality":"Light","pipelines":"West Iran pipeline network","ports":"None direct","rail":"None"}'::jsonb
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
SELECT count(*) AS iran_oil_fields
FROM public.commodity_locations
WHERE country = 'Iran' AND commodity_name = 'Crude Oil';

SELECT count(*) AS total_locations
FROM public.commodity_locations;
