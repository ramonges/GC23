-- ============================================================
-- Global Coal Mines — Venezuela, Zambia, Indonesia, Philippines,
-- Mexico, Botswana, USA, Czech Republic, Chile, France, Australia,
-- Russia, Germany, Poland, Colombia, Canada, Africa (DRC, Egypt,
-- Ethiopia, Kenya, Malawi, Morocco, Mozambique, Niger, Nigeria,
-- Rwanda, South Africa), Greece
-- Run AFTER COAL_MINES_TABLE_SETUP.sql
-- Uses ON CONFLICT (mine_name, country) for upserts
-- ============================================================

-- Guasare Coal Mine — Venezuela
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '056650d6-63a8-49e5-a274-74416d695518',
  'Guasare Coal Mine',
  'Carbones del Guasare',
  'carbonesdelguasare@contact.com',
  'Venezuela',
  NULL,
  'Guasare Coal Mine, Venezuela',
  11.00000000, -72.30000000,
  NULL,
  2190000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Maamba Collieries — Zambia
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '14994a05-c0db-43d4-9289-87937f431b6a',
  'Maamba Collieries',
  'Nava Bharat',
  'navabharat@contact.com',
  'Zambia',
  NULL,
  'Maamba Collieries, Zambia',
  -17.40000000, 27.20000000,
  NULL,
  3650000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Tutupan Coal Mine — Indonesia
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '068430cf-646d-4215-9193-f0b9533f22a8',
  'Tutupan Coal Mine',
  'Arutmin',
  'arutmin@contact.com',
  'Indonesia',
  NULL,
  'Tutupan Coal Mine, Indonesia',
  -3.40000000, 115.50000000,
  NULL,
  14600000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Semirara Coal Mine — Philippines
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '0882b574-2d83-46d9-b1ef-a47353632bdb',
  'Semirara Coal Mine',
  'Semirara Mining',
  'semiraramining@contact.com',
  'Philippines',
  NULL,
  'Semirara Coal Mine, Philippines',
  12.10000000, 121.40000000,
  NULL,
  5110000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Coahuila Coal Region — Mexico
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '282f97a9-232a-4551-83e5-6d64f1a65fe1',
  'Coahuila Coal Region',
  'AHMSA/Minera del Norte',
  'ahmsa@contact.com',
  'Mexico',
  NULL,
  'Coahuila Coal Region, Mexico',
  27.50000000, -101.00000000,
  NULL,
  5475000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Morupule Coal Mine — Botswana
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '13b96578-6fa2-4490-b2ab-422697656192',
  'Morupule Coal Mine',
  'Debswana',
  'debswana@contact.com',
  'Botswana',
  NULL,
  'Morupule Coal Mine, Botswana',
  -22.50000000, 27.10000000,
  NULL,
  2920000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Black Thunder Mine — United States
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '3198d2c6-0fb6-4367-b1be-c3b9f93b87fc',
  'Black Thunder Mine',
  'Arch Coal',
  'archcoal@contact.com',
  'United States',
  NULL,
  'Black Thunder Mine, United States',
  43.70000000, -105.50000000,
  NULL,
  32850000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Nastup Tusimice — Czech Republic
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '0aef3cfd-b071-425f-b77b-86dee0dd1868',
  'Nastup Tusimice',
  'Severoceske Doly',
  'severoceskedoly@contact.com',
  'Czech Republic',
  NULL,
  'Nastup Tusimice, Czech Republic',
  50.40000000, 13.40000000,
  NULL,
  6570000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Isla Riesco Mine — Chile
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '0004d02e-1619-4042-b921-fb265a3e4ebc',
  'Isla Riesco Mine',
  'Mina Invierno',
  'minainvierno@contact.com',
  'Chile',
  NULL,
  'Isla Riesco Mine, Chile',
  -52.90000000, -71.50000000,
  NULL,
  2920000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Lorraine Coal Basin — France
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '1dfdbf3b-ddbb-468e-824f-b9b77d9b9443',
  'Lorraine Coal Basin',
  'Charbonnages de France (Historical)',
  'charbonnagesdefrance@contact.com',
  'France',
  NULL,
  'Lorraine Coal Basin, France',
  49.10000000, 6.80000000,
  NULL,
  182500.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Peak Downs Mine — Australia
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '0081afe6-da8a-4ee7-9e60-090208dc367b',
  'Peak Downs Mine',
  'BHP Mitsubishi Alliance',
  'bhpmitsubishialliance@contact.com',
  'Australia',
  NULL,
  'Peak Downs Mine, Australia',
  -22.30000000, 148.20000000,
  NULL,
  10220000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Elga Coal Complex — Russia
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '04edb597-d197-4f11-8e6f-1559e03ad4bb',
  'Elga Coal Complex',
  'Mechel',
  'mechel@contact.com',
  'Russia',
  NULL,
  'Elga Coal Complex, Russia',
  58.00000000, 130.50000000,
  NULL,
  9125000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Inden Surface Mine — Germany
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '134f37ff-d427-498e-8aa7-6fe337566ec0',
  'Inden Surface Mine',
  'RWE',
  'rwe@contact.com',
  'Germany',
  NULL,
  'Inden Surface Mine, Germany',
  50.90000000, 6.40000000,
  NULL,
  9125000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Katowice Coal Basin — Poland
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '15a7d268-30fc-4c12-ba5e-1c403c64e29a',
  'Katowice Coal Basin',
  'JSW',
  'jsw@contact.com',
  'Poland',
  NULL,
  'Katowice Coal Basin, Poland',
  50.30000000, 19.00000000,
  NULL,
  10950000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Cerrejón Coal Mine — Colombia
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '09f718a9-d7a2-4fb6-bd54-889ffb38eea2',
  'Cerrejon Coal Mine',
  'Glencore',
  'glencore@contact.com',
  'Colombia',
  NULL,
  'Cerrejon Coal Mine, Colombia',
  11.00000000, -72.70000000,
  NULL,
  11680000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Line Creek Operations — Canada
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  coal_type,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '0c431970-75ee-44e6-87c9-0271cacd024c',
  'Line Creek Operations',
  'Teck Resources',
  'teckresources@contact.com',
  'Canada',
  NULL,
  'Line Creek Operations, Canada',
  49.50000000, -114.70000000,
  NULL,
  6570000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  coal_type = EXCLUDED.coal_type, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Mmamabula Coalfield — Botswana
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  calorific_value_kcal_kg,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  '2ee77c7d-c1f5-4d1d-ad52-5dc2ed84cc27',
  'Mmamabula Coalfield',
  'Jindal Steel and Power',
  'Botswana',
  'Central District',
  'Mmamabula, Central Botswana',
  -23.59460000, 26.57560000,
  'Maputo Port, Mozambique (~900 km)',
  'Sub-bituminous',
  NULL,
  'Surface and Underground',
  'Maputo Port, Mozambique',
  '["Rail","Truck"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Morupule Coalfield — Botswana
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  '2221d298-718a-4b14-977d-bf7b55cc63e5',
  'Morupule Coalfield',
  'Debswana (Botswana Government & De Beers)',
  'Botswana',
  'Central District',
  'Palapye, Central Botswana',
  -22.50710000, 27.02640000,
  'Maputo Port, Mozambique (~700 km)',
  'Sub-bituminous',
  'No. 1 Seam',
  5614,
  877000.00,
  'Underground (bord and pillar)',
  'Maputo Port, Mozambique',
  '["Rail","Truck"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Sese Coalfield — Botswana
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  'e67193eb-056e-4471-b85a-221af07df8a7',
  'Sese Coalfield',
  'African Energy Resources / First Quantum Minerals (JV)',
  'Botswana',
  'Central District (near Francistown)',
  'Sese, North-East Botswana',
  -21.58550000, 27.21090000,
  'Maputo Port, Mozambique (~600 km)',
  'Sub-bituminous / Coking coal',
  'Surface',
  'Maputo Port, Mozambique',
  '["Rail","Truck"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Makala Coal Mine (Lukuga Coalfield) — Democratic Republic of Congo
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  '830425af-3cd5-4088-a71e-c9610f687c15',
  'Makala Coal Mine (Lukuga Coalfield)',
  'Gécamines',
  'Democratic Republic of Congo',
  'Tanganyika Province (formerly Katanga Province)',
  'Near Kalemie (formerly Albertville), eastern DRC, along Lukuga River tributaries',
  -5.95000000, 29.18000000,
  'Kalemie Port (Lake Tanganyika) — connects to Kigoma (Tanzania) and then Dar es Salaam seaport',
  'Sub-bituminous (low-grade)',
  'Seam 1 (primary, ~2m thickness), Seam 2 (secondary, 1-1.5m thickness)',
  'Underground (Room-and-pillar)',
  'Kalemie Port (Lake Tanganyika) → Kigoma, Tanzania → Dar es Salaam (ocean port)',
  '["Rail (SNCC)","Lake Tanganyika barge","Truck"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, mining_method = EXCLUDED.mining_method,
  loading_port = EXCLUDED.loading_port, transport_modes = EXCLUDED.transport_modes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- El Maghara Coal Mine — Egypt
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  calorific_value_kcal_kg,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  '6297db2f-78c5-40f0-80df-12265a542efd',
  'El Maghara Coal Mine',
  'Egyptian Mineral Resources Authority (EMRA)',
  'Egypt',
  'North Sinai Governorate',
  'Gebel El-Maghara, North Sinai, Egypt',
  30.70673100, 33.38168700,
  'Port Said (~200km north)',
  'Bituminous (low-rank / high-volatile C)',
  'High Volatile C Bituminous — agglomerating',
  6939,
  'Underground',
  'Port Said (200km north) or Suez (possible alternative)',
  '["Road (desert highway to Ismailia / Canal Zone)","Port Said for export"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Yayu Coal Mine — Ethiopia
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  'b4408b48-6caf-463c-bdec-bf1566b61ba1',
  'Yayu Coal Mine (Geba Basin — Yayu / Achibo-Sombo localities)',
  'Oromia Mines and Resources Authority (artisanal); formerly METEC',
  'Ethiopia',
  'Oromia Region',
  'Yayu, Illubabor Zone, Oromia, Ethiopia',
  8.33580000, 35.82250000,
  'Djibouti (~1200km via Addis); Berbera (Somaliland, ~1400km)',
  'Lignite to Sub-bituminous (low rank)',
  'Lignite category predominantly',
  2626,
  300000.00,
  'Open-pit (planned/artisanal); underground possible for future industrial-scale',
  'Djibouti (only viable export port, ~1200km via Addis Ababa)',
  '["Road (unpaved regional roads to Addis)","Rail (Addis–Djibouti Railway, from Addis)"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Delbi Coal Mine — Ethiopia
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  calorific_value_kcal_kg,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  '3476d579-bc27-4a38-873b-ef152a43c80a',
  'Delbi Coal Mine (Delbi-Moye Coalfield — Delbi Locality)',
  'Delbi Coal Mining PLC',
  'Ethiopia',
  'Oromia Region',
  'Delbi-Moye Basin, Jimma Zone, Oromia Region, Ethiopia',
  7.35500000, 36.83800000,
  'Djibouti (~950km via Addis Ababa)',
  'Lignite to Sub-bituminous (mixed; sapropelic at Delbi, humic at Moye)',
  'Thermal combustion (cement industry)',
  4684,
  'Open-pit (favorable conditions per MoM Ethiopia)',
  'Djibouti (~950km via Addis Ababa)',
  '["Road to Jimma (~45km)","Road Jimma to Addis Ababa (~350km)","Addis Ababa–Djibouti Railway to Djibouti Port"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Mui Basin Coal Project — Kenya
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  '780da91e-d5b0-4d85-8b8d-61d57af51587',
  'Mui Basin Coal Project — Kitui County',
  'Fenxi Mining Industry Company Ltd',
  'Kenya',
  'Eastern Kenya',
  'Mui Basin, Kitui County, Kenya',
  -1.05000000, 38.20000000,
  'Mombasa (via road/planned rail, ~500km southeast)',
  'Sub-bituminous (Mui1 and Mui2 samples characterized)',
  'Thermal coal — power generation, cement',
  'Planned open-pit and/or underground (TBD — feasibility not completed)',
  'Mombasa (only viable export port, ~500km southeast via road)',
  '["Road (National Road Mwingi to Nairobi ~270km, then Mombasa Highway ~500km)","SGR rail (Nairobi–Mombasa) — requires road haul to Nairobi first"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, mining_method = EXCLUDED.mining_method,
  loading_port = EXCLUDED.loading_port, transport_modes = EXCLUDED.transport_modes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- North Rukuru Coalfield — Malawi
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  calorific_value_kcal_kg,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  '39942c02-83fd-4ead-82a2-396ac20ba437',
  'North Rukuru Coalfield — Malcoal Operations',
  'Malcoal Mining Limited',
  'Malawi',
  'Northern Region',
  'Karonga District, Northern Region, Malawi',
  -9.95000000, 33.78000000,
  'Dar es Salaam (Tanzania, ~500km north via road) or Nacala-a-Velha (Mozambique, ~800km southeast)',
  'Sub-bituminous',
  'Thermal coal — domestic cement, tobacco curing, beverages',
  5250,
  'Open-pit',
  'Dar es Salaam (Tanzania, ~500km north via road)',
  '["Road (M1 northward to Karonga, then north through Tanzania to Dar)","No rail to Karonga or northern Malawi"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Livingstonia Coalfield — Malawi
INSERT INTO public.coal_mines (
  id, mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method,
  loading_port,
  transport_modes,
  export_license,
  major_milestones
) VALUES (
  '6a357b28-7c5d-4191-828c-f93d8feed33d',
  'Livingstonia Coalfield — Multiple Operating Mines',
  'Kasikizi Coal Mine Ltd; Rukuru Mining Ltd; Coal Products Ltd; Kaziwiziwi Mining Co',
  'Malawi',
  'Northern Region',
  'Rumphi District, ~20km north of Mzuzu, Northern Region, Malawi',
  -10.36000000, 33.98000000,
  'Nacala-a-Velha (Mozambique, ~700km south via road) or Beira (~900km)',
  'Sub-bituminous (predominantly)',
  'Livingstonia yields highest CVs in Malawi',
  5250,
  120000.00,
  'Underground (room-and-pillar) — Mchenga, Kaziwiziwi, Chombe; Surface (open-pit) — Kasikizi',
  'Nacala-a-Velha (Mozambique, ~700km south via road to rail junction)',
  '["Road (M1 south from Rumphi to Lilongwe/Blantyre, then to Mozambique border)","Nacala Logistics Corridor rail (passes through southern Malawi)","Lake Malawi barge transport (limited)"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Jerada Coal Mine — Morocco
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  nearest_railway,
  coal_type,
  grade,
  calorific_value_kcal_kg,
  annual_capacity_tonnes,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '410a99c9-2929-4466-88cd-5db45a8be885',
  'Jerada Coal Mine (Les Charbonnages du Maroc — CDM)',
  'CLOSED — Les Charbonnages du Maroc (CDM) until 2001; post-2018 artisanal cooperatives',
  'Morocco',
  'Oriental Region',
  'Jerada, Province de Jerada, Oriental Region, Morocco',
  34.30500000, -2.18440000,
  'Nador (Mediterranean, ~150km north) or Casablanca (~600km west)',
  'ONCF connection at Oujda (~60km)',
  'Anthracite',
  'High rank, low volatile — ASTM Anthracite',
  8000,
  0.00,
  FALSE,
  'Former: underground (deep shaft, room-and-pillar). Current: informal shallow pit/sandriyat by artisanal miners',
  '["Rail: ONCF connection at Oujda (~60km)","Road: N17 (Oujda–Jerada–Bouarfa)"]'::jsonb,
  'Nador (Mediterranean, ~150km north) or Casablanca (Atlantic, ~600km west)',
  '[{"operational_status":"operational","historical_status":"closed_2001","notes":"post-2018 artisanal cooperatives present"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, mining_method = EXCLUDED.mining_method,
  transport_modes = EXCLUDED.transport_modes, loading_port = EXCLUDED.loading_port,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Moatize Coal Mine — Mozambique
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  calorific_value_kcal_kg,
  annual_capacity_tonnes,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '81901836-6d7a-46b7-8770-4f7c29b61dda',
  'Moatize Coal Mine (Mina Carvao Moatize)',
  'Vulcan Mozambique SA',
  'Mozambique',
  'Tete Province',
  'Moatize District, Tete Province, Mozambique',
  -16.12000000, 33.72000000,
  'Nacala-a-Velha (912km via NLC rail) — primary; Beira (660km via Sena Railway) — secondary',
  'Metallurgical (coking) and Thermal — both',
  'Premium Hard Coking Coal (PHCC); CSR 68-71',
  NULL,
  22000000.00,
  FALSE,
  'Open-pit (large-scale)',
  '["Nacala Logistics Corridor rail — 912km to Nacala-a-Velha; 101 locomotives, 2,677 wagons","Sena Railway — 660km to Beira; secondary/backup"]'::jsonb,
  'Nacala-a-Velha (primary — dedicated coal terminal, 18Mtpa) or Beira (secondary, 6Mtpa)',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, mining_method = EXCLUDED.mining_method,
  transport_modes = EXCLUDED.transport_modes, loading_port = EXCLUDED.loading_port,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Sangatta Coal Mine — Indonesia
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '1e3af428-3a52-4509-8b99-c31883c6c7f1',
  'Sangatta Coal Mine',
  'Kaltim Prima Coal',
  'kaltimprimacoal@contact.com',
  'Indonesia',
  NULL,
  'Sangatta Coal Mine, Indonesia',
  0.50000000, 117.50000000,
  20075000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Cahora Bassa Coalfield — Chirodzi Coal Mine — Mozambique
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  annual_capacity_tonnes,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '042adcdf-d972-4fd2-b93c-414f8f9cffad',
  'Cahora Bassa Coalfield — Chirodzi Coal Mine (Jindal / JSPL)',
  'JSPL Mozambique Minerals Limitada',
  'Mozambique',
  'Tete Province',
  'Chirodzi, Cahora Bassa District, Tete Province, Mozambique',
  -15.87000000, 32.58000000,
  'Beira (~450km via Sena Railway) or Nacala-a-Velha (~700km)',
  'Semi-hard coking coal (metallurgical) and thermal coal',
  'Semi-hard coking coal for steel plants',
  5000000.00,
  FALSE,
  'Open-pit (open-cast)',
  '["Road: Chirodzi to Tete city (~120km)","Sena Railway: Tete to Beira (660km) — primary export route"]'::jsonb,
  'Beira (primary — Sena Railway) or Nacala-a-Velha (longer)',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, mining_method = EXCLUDED.mining_method,
  transport_modes = EXCLUDED.transport_modes, loading_port = EXCLUDED.loading_port,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Mucanha-Vuzi Coalfield — Mozambique
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  annual_capacity_tonnes,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '83d33f2f-32ee-4f14-9db5-92bfdc4f2d73',
  'Mucanha-Vuzi Coalfield',
  'No active mining — explored by Vale 2008-2012; concession status post-Vale exit unclear',
  'Mozambique',
  'Tete Province',
  'Northern shore of Cahora Bassa dam, Cahora Bassa District, Tete Province, Mozambique',
  -15.57000000, 32.13000000,
  'Beira (~550km via road south through Tete) or Nacala-a-Velha (~700km+)',
  'Coking and thermal coal (Moatize Formation correlation)',
  'Probable hard coking coal component; not confirmed publicly',
  0.00,
  FALSE,
  'Not determined — open-pit likely given geological similarity to Moatize',
  '["Road (currently only option; 150+km to nearest rail at Tete)","No rail within 150km — new rail construction required"]'::jsonb,
  'Beira (~550km — via new road/rail development required)',
  '[{"operational_status":"operational","notes":"no active mining; explored 2008–2012; post-exit concession unclear"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, mining_method = EXCLUDED.mining_method,
  transport_modes = EXCLUDED.transport_modes, loading_port = EXCLUDED.loading_port,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Anou Araren Coal Mine — Niger
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  annual_capacity_tonnes,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '90032e3d-5ec7-4ae7-8504-2f6e96603829',
  'Anou Araren Coal Mine',
  'Societe Nigerienne de Charbon (SONICHAR)',
  'Niger',
  'Agadez Region',
  'Anou Araren, near Tchirozerine town, Agadez Region, Niger',
  18.53000000, 8.73000000,
  'No direct port access — landlocked; coal consumed on-site at power plant',
  'Sub-bituminous / lignitic',
  'Anou Araren coalfield — Agadez',
  246000.00,
  FALSE,
  'Open cast / strip mining',
  '["Conveyor / short haul road — power plant ~2km from mine"]'::jsonb,
  'On-site power plant only — no export',
  '[{"operational_status":"operational","notes":"coal used on-site; no export"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, mining_method = EXCLUDED.mining_method,
  transport_modes = EXCLUDED.transport_modes, loading_port = EXCLUDED.loading_port,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Salkadamna Coal Project — Niger
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  annual_capacity_tonnes,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '250f2779-4a07-4d21-bfd7-90b903758193',
  'Salkadamna Coal Project (Tahoua Region, Niger)',
  'No operator — development stage; Niger government-led',
  'Niger',
  'Tahoua Region',
  'Salkadamna area, Tahoua Region, Niger',
  16.50000000, 5.80000000,
  'None — landlocked',
  'Sub-bituminous / lignitic',
  'Salkadamna / Tahoua coalfield',
  NULL,
  FALSE,
  'Open cast (planned)',
  '["Road (planned)"]'::jsonb,
  'None — no production',
  '[{"operational_status":"operational","notes":"development stage; no operator; no production"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, mining_method = EXCLUDED.mining_method,
  transport_modes = EXCLUDED.transport_modes, loading_port = EXCLUDED.loading_port,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Ogbete Drift Mine — Nigeria
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '1b340877-d5ed-4b9e-a7c9-7c2677543830',
  'Ogbete Drift Mine (Enugu coalfield)',
  'Nigerian Coal Corporation (NCC) — non-operational',
  'Nigeria',
  'South-East Nigeria',
  'Ogbete area, Enugu, Enugu State, Nigeria',
  6.45000000, 7.51000000,
  'None',
  'Sub-bituminous',
  'Enugu coalfield',
  FALSE,
  'Drift / adit mining (room-and-pillar)',
  '["Road"]'::jsonb,
  'None',
  '[{"operational_status":"operational","notes":"listed as non-operational by operator field"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Iva Valley Coal Mine — Nigeria
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '055f9d6a-f72a-4a7f-9d8f-1bc8a393606a',
  'Iva Valley Coal Mine (Enugu coalfield)',
  'Nigerian Coal Corporation (NCC) — non-operational',
  'Nigeria',
  'South-East Nigeria',
  'Iva Valley, Ngwo, Enugu, Enugu State, Nigeria',
  6.41000000, 7.47000000,
  'None',
  'Sub-bituminous',
  'Enugu coalfield',
  FALSE,
  'Drift/adit (room-and-pillar)',
  '["Road"]'::jsonb,
  'None',
  '[{"operational_status":"operational","notes":"listed as non-operational by operator field"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Onyeama Coal Mine — Nigeria
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  'd288f400-78e0-4aee-b3ef-81a7c6cc5f8b',
  'Onyeama Coal Mine (Enugu coalfield)',
  'Artisanal miners',
  'Nigeria',
  'Enugu',
  'Onyeama, Enugu State, Nigeria',
  6.39000000, 7.52000000,
  'None',
  'Sub-bituminous',
  'Enugu coalfield',
  FALSE,
  'Artisanal',
  '["Road"]'::jsonb,
  'None',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Ribadu Coal Mine — Nigeria
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '82381b6d-4d14-4191-bb54-7faea8508078',
  'Ribadu Coal Mine (Enugu coalfield)',
  'Artisanal miners',
  'Nigeria',
  'Enugu',
  'Ribadu, Enugu State, Nigeria',
  6.50000000, 7.50000000,
  'None',
  'Sub-bituminous',
  'Enugu coalfield',
  FALSE,
  'Artisanal',
  '["Road"]'::jsonb,
  'None',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Okpara Coal Mine — Nigeria
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '8e8d572d-0b31-49e2-a785-2753c5086e1a',
  'Okpara Coal Mine (Enugu coalfield)',
  'Nigerian Coal Corporation (NCC)',
  'Nigeria',
  'Enugu',
  'Okpara, Enugu State, Nigeria',
  6.43000000, 7.50000000,
  'None',
  'Sub-bituminous',
  'Enugu coalfield',
  FALSE,
  'Underground',
  '["Road"]'::jsonb,
  'None',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Okaba Coal Mine — Nigeria
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '4ad2a26f-4599-45ac-992c-74ebe07e8994',
  'Okaba Coal Mine',
  'Unknown',
  'Nigeria',
  'Kogi',
  'Okaba, Kogi State, Nigeria',
  7.35000000, 7.28000000,
  'None',
  'Sub-bituminous',
  'Kogi coalfield',
  FALSE,
  'Open cast',
  '["Road"]'::jsonb,
  'None',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Owukpa Coal Mine — Nigeria
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '7159e11e-307d-48e2-bed6-904c0ac166bb',
  'Owukpa Coal Mine',
  'Unknown',
  'Nigeria',
  'Benue',
  'Owukpa, Benue State, Nigeria',
  7.10000000, 7.90000000,
  'None',
  'Sub-bituminous',
  'Benue coalfield',
  FALSE,
  'Open cast',
  '["Road"]'::jsonb,
  'None',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Lafia-Obi Coal Mine — Nigeria
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '90e0f991-c8a5-4593-8d66-b0c8acb0ca9b',
  'Lafia-Obi Coal Mine',
  'Unknown',
  'Nigeria',
  'Nasarawa',
  'Lafia-Obi, Nasarawa State, Nigeria',
  8.49000000, 8.52000000,
  'None',
  'Bituminous (coking)',
  'Lafia-Obi coalfield',
  FALSE,
  'Open cast',
  '["Road"]'::jsonb,
  'None',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Rwanda Gitarama Coal Occurrence — Rwanda
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '7ed76e99-6318-4a77-be44-c1cc6be5f3a5',
  'Rwanda Gitarama Coal Occurrence',
  'Unknown',
  'Rwanda',
  'Gitarama',
  'Gitarama area, Rwanda',
  -2.07000000, 29.75000000,
  'None — landlocked',
  NULL,
  'Gitarama coalfield',
  FALSE,
  'None',
  '[]'::jsonb,
  'None',
  '[{"operational_status":"operational","notes":"occurrence; no mining method/transport defined"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Grootegeluk Coal Mine — South Africa
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  annual_capacity_tonnes,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '48a35230-11cf-4172-b3cf-4f3a0c779139',
  'Grootegeluk Coal Mine',
  'Exxaro',
  'South Africa',
  'Limpopo',
  'Lephalale, Limpopo, South Africa',
  -23.67170000, 27.52890000,
  'Richards Bay',
  'Bituminous',
  'Lephalale',
  26000000.00,
  FALSE,
  'Open cast',
  '["Rail","Road"]'::jsonb,
  'Richards Bay',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, mining_method = EXCLUDED.mining_method,
  transport_modes = EXCLUDED.transport_modes, loading_port = EXCLUDED.loading_port,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- Ptolemais-Amynteon Basin — Greece
INSERT INTO public.coal_mines (
  id, mine_name, operator, contact_email,
  country, region, address,
  latitude, longitude,
  annual_capacity_tonnes,
  export_license,
  major_milestones
) VALUES (
  '0b8ab8cf-4e7a-4276-833c-197be9b2864c',
  'Ptolemais-Amynteon Basin',
  'PPC',
  'ppc@contact.com',
  'Greece',
  NULL,
  'Ptolemais-Amynteon Basin, Greece',
  40.50000000, 21.70000000,
  12775000.00,
  FALSE,
  '[{"operational_status":"operational","long_term_contract":true,"contract_with":"Various International Buyers"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, contact_email = EXCLUDED.contact_email,
  region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  export_license = EXCLUDED.export_license, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Goedehoop Coal Mine — South Africa
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '3b11cfe0-c12d-4992-a1be-c3f4672a6e4d',
  'Goedehoop Coal Mine',
  'Thungela',
  'South Africa',
  'Mpumalanga',
  'Mpumalanga, South Africa',
  -26.00000000, 29.20000000,
  'Richards Bay',
  'Bituminous',
  'Mpumalanga',
  FALSE,
  'Underground',
  '["Rail","Road"]'::jsonb,
  'Richards Bay',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Greenside Coal Mine — South Africa
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '46e96c8d-c215-4175-9468-291fa1294ca2',
  'Greenside Coal Mine',
  'Thungela',
  'South Africa',
  'Mpumalanga',
  'Mpumalanga, South Africa',
  -26.05000000, 29.25000000,
  'Richards Bay',
  'Bituminous',
  'Mpumalanga',
  FALSE,
  'Underground',
  '["Rail","Road"]'::jsonb,
  'Richards Bay',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Isibonelo Coal Mine — South Africa
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '60081181-00c7-4ca4-8162-e2efba12091b',
  'Isibonelo Coal Mine',
  'Thungela / Sasol',
  'South Africa',
  'Mpumalanga',
  'Mpumalanga, South Africa',
  -26.35000000, 29.26000000,
  'Richards Bay',
  'Bituminous',
  'Mpumalanga',
  FALSE,
  'Open cast',
  '["Rail","Road"]'::jsonb,
  'Richards Bay',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Khwezela Coal Mine — South Africa
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  '6c15ea3e-0e80-433b-b050-0d910ad28872',
  'Khwezela Coal Mine',
  'Thungela',
  'South Africa',
  'Mpumalanga',
  'Mpumalanga, South Africa',
  -26.12000000, 29.00000000,
  'Richards Bay',
  'Bituminous',
  'Mpumalanga',
  FALSE,
  'Underground',
  '["Rail","Road"]'::jsonb,
  'Richards Bay',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();

-- Zibulo Coal Mine — South Africa
INSERT INTO public.coal_mines (
  id, mine_name, operator,
  country, region, address,
  latitude, longitude,
  nearest_port,
  coal_type,
  grade,
  export_license,
  mining_method,
  transport_modes,
  loading_port,
  major_milestones
) VALUES (
  'c36ddc57-93db-4eb5-a793-ea2c7e2c1619',
  'Zibulo Coal Mine',
  'Thungela',
  'South Africa',
  'Mpumalanga',
  'Mpumalanga, South Africa',
  -26.09000000, 29.33000000,
  'Richards Bay',
  'Bituminous',
  'Mpumalanga',
  FALSE,
  'Underground',
  '["Rail","Road"]'::jsonb,
  'Richards Bay',
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, coal_type = EXCLUDED.coal_type,
  grade = EXCLUDED.grade, export_license = EXCLUDED.export_license,
  mining_method = EXCLUDED.mining_method, transport_modes = EXCLUDED.transport_modes,
  loading_port = EXCLUDED.loading_port, major_milestones = EXCLUDED.major_milestones,
  updated_at = NOW();
