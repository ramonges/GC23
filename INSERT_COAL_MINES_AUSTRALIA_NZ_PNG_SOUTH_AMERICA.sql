-- ============================================================
-- Australia, New Zealand, Papua New Guinea, South America
-- Coal Mines — Simplified schema with ON CONFLICT upserts
-- Run AFTER COAL_MINES_TABLE_SETUP.sql
-- Converts to full coal_mines schema; uses (mine_name, country) for upsert
-- ============================================================

-- 1) Bowen Basin — Queensland
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Bowen Basin — Queensland (BMA, Glencore, Anglo American, Whitehaven, Stanmore complex)',
  'BMA, Glencore, Anglo American, Whitehaven, Stanmore, Peabody, QCoal, Kestrel',
  'Australia',
  'Queensland',
  'Bowen Basin, Central Queensland, Australia',
  -22.00000000, 148.20000000,
  'Hay Point, Dalrymple Bay, Gladstone, Abbot Point',
  NULL,
  'Premium Hard Coking Coal (HCC), Semi-Hard, PCI, thermal',
  'Premium low-ash, low-sulfur HCC',
  7000,
  200000000.00,
  'Underground longwall, Open-cut truck-shovel dragline',
  'Hay Point, Dalrymple Bay, RG Tanna Gladstone, Abbot Point',
  '["rail (Aurizon)","ship (seaborne)"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 2) Galilee Basin — Carmichael
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Galilee Basin — Queensland (Carmichael / Bravus, Proposed projects)',
  'Bravus Mining and Resources (Carmichael)',
  'Australia',
  'Queensland',
  'Carmichael Mine, Isaac Region, Queensland, Australia',
  -22.36000000, 147.76000000,
  'Abbot Point Coal Terminal (388 km)',
  NULL,
  'Thermal (steam) coal',
  'High-moisture, moderate-ash thermal',
  4500,
  10000000.00,
  'Open-cut truck-shovel',
  'Abbot Point Coal Terminal',
  '["rail (Carmichael Rail)","ship (seaborne)"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 3) South-West Queensland Coalfields
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'South-West Queensland Coalfields (Rolleston, Springsure Creek, Surat Basin overlap)',
  'Glencore (Rolleston, Springsure Creek), Anglo American (Callide)',
  'Australia',
  'Queensland',
  'Rolleston, Central Highlands, Queensland, Australia',
  -24.46000000, 148.62000000,
  'Port of Gladstone (~350 km)',
  NULL,
  'Thermal / steam coal (Rolleston); Sub-bituminous (Callide)',
  'Low-sulfur export thermal (Rolleston); low-sulfur sub-bituminous (Callide)',
  5200,
  20000000.00,
  'Open-cut dragline + truck-shovel',
  'RG Tanna / WICET, Port of Gladstone',
  '["rail (Blackwater system)"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 4) Surat Basin — New Acland
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Surat Basin — Queensland (thermal coal; New Acland, Wandoan)',
  'New Hope Group (New Acland)',
  'Australia',
  'Queensland',
  'Acland, near Oakey, Darling Downs, Queensland, Australia',
  -27.57000000, 151.60000000,
  'Port of Brisbane (~175 km)',
  NULL,
  'Sub-bituminous to bituminous thermal',
  'Low-sulfur, medium ash, export thermal',
  5000,
  7500000.00,
  'Open-cut truck-shovel, draglines',
  'Port of Brisbane, Gladstone',
  '["rail (Main Southern Line)","truck"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 5) Hunter Valley — NSW
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Hunter Valley — New South Wales (Mt Arthur, HVO, Glencore HV Operations, Yancoal)',
  'BHP (Mt Arthur), Yancoal+Glencore JV (HVO), Glencore, Peabody, Centennial',
  'Australia',
  'New South Wales',
  'Hunter Valley, New South Wales, Australia',
  -32.28000000, 150.90000000,
  'Port of Newcastle (world''s largest coal export port)',
  NULL,
  'Bituminous thermal, semi-soft coking',
  'Medium-rank bituminous thermal; NEWC index benchmark',
  6000,
  80000000.00,
  'Open-cut truck-shovel, underground longwall',
  'Port Waratah (PWCS), NCIG Newcastle',
  '["rail (Hunter Valley Coal Network)","ship (seaborne)"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 6) Illawarra Coalfield — NSW
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Illawarra Coalfield — New South Wales (BHP Illawarra, Wongawilli, Dendrobium, Metropolitan)',
  'South32 (Appin), Peabody (Metropolitan)',
  'Australia',
  'New South Wales',
  'Appin, Wollongong, Illawarra, NSW, Australia',
  -34.20000000, 150.80000000,
  'Port Kembla Coal Terminal (10 Mt/yr)',
  NULL,
  'Low-volatile Hard Coking Coal (HCC)',
  'Premium low-vol HCC; ultra-low sulfur Bulli',
  7600,
  7000000.00,
  'Underground longwall',
  'Port Kembla Coal Terminal',
  '["rail (South Coast Line)","conveyor"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 7) Sydney Basin (NSW)
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Sydney Basin (NSW) — Newcastle Coalfield and Illawarra / Underground met coal complex',
  'Yancoal, Peabody, Centennial/Banpu, Glencore',
  'Australia',
  'New South Wales',
  'Sydney Basin, New South Wales, Australia',
  -32.80000000, 150.50000000,
  'Port of Newcastle, Port Kembla',
  NULL,
  'Bituminous thermal, semi-soft coking',
  'Mixed — Newcastle high BTU thermal; Tomago coking',
  5800,
  60000000.00,
  'Open-cut, underground longwall',
  'Port of Newcastle (PWCS + NCIG)',
  '["rail (Hunter Valley Coal Network)","ship (seaborne)"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 8) Latrobe Valley (Lignite) — Victoria
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Latrobe Valley (Lignite) — Victoria (Loy Yang Mine, Yallourn Mine)',
  'AGL (Loy Yang A), Alinta (Loy Yang B), EnergyAustralia (Yallourn)',
  'Australia',
  'Victoria',
  'Traralgon, Morwell, Latrobe Valley, Victoria, Australia',
  -38.23000000, 146.56000000,
  'No export — mine-mouth only; Port Melbourne ~170 km',
  NULL,
  'Lignite (brown coal)',
  'Very high moisture; very low BTU',
  1500,
  50000000.00,
  'Open-cut bucket-wheel excavator',
  NULL,
  '["conveyor belt only"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 9) Collie Basin — Western Australia
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Collie Basin — Western Australia (Griffin Coal / Yancoal, Premier Coal)',
  'Griffin Coal (Yancoal), Premier Coal (Seacorp)',
  'Australia',
  'Western Australia',
  'Collie, Western Australia, Australia',
  -33.36000000, 116.15000000,
  'Port of Bunbury (~55 km); domestic only',
  NULL,
  'Sub-bituminous to bituminous thermal',
  'Medium rank; moderate moisture',
  4500,
  8000000.00,
  'Open-cut (Griffin), underground storey (Premier)',
  NULL,
  '["conveyor","rail (Collie Branch)"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 10) Leigh Creek Coalfield — South Australia (CLOSED 2015)
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Leigh Creek Coalfield — South Australia (CLOSED 2015)',
  'Historically: ETSA, Flinders Power; CLOSED November 2015',
  'Australia',
  'South Australia',
  'Leigh Creek Coalfield, Flinders Ranges, South Australia',
  -30.58000000, 138.41000000,
  'Port Augusta / Whyalla (~200 km south); not exported',
  NULL,
  'Sub-bituminous thermal',
  'Low quality; high ash; high sulfur',
  4200,
  0.00,
  'Open-cut strip mining (historical)',
  NULL,
  '["rail (280 km to Port Augusta — dismantled)"]'::jsonb,
  FALSE,
  '[{"operational_status":"closed","closing_note":"Closed November 2015"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 11) Stockton Mine — New Zealand
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Stockton Mine — West Coast, South Island, New Zealand',
  'BT Mining (65% Bathurst, 35% Talley''s)',
  'New Zealand',
  'West Coast',
  'Stockton Coalfield, Buller District, West Coast, New Zealand',
  -41.51000000, 171.87000000,
  'Port of Ngakawau → Lyttelton (~300 km)',
  NULL,
  'Hard Coking Coal (HCC)',
  'Premium semi-hard to hard coking; ultra-high vitrinite',
  7200,
  2000000.00,
  'Open-cut truck-excavator',
  'Lyttelton Port of Christchurch',
  '["aerial ropeway","rail (KiwiRail Midland Line)","ship"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 12) Escarpment Mine — Denniston Plateau
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Escarpment Mine — Denniston Plateau, West Coast, South Island, New Zealand (Care and Maintenance)',
  'Bathurst Resources / Buller Coal',
  'New Zealand',
  'West Coast',
  'Denniston Plateau, Buller District, West Coast, New Zealand',
  -41.65000000, 171.82000000,
  'Lyttelton Port (via Stockton)',
  NULL,
  'Hard to Semi-Hard Coking Coal (HCC)',
  'Premium HCC blending; high vitrinite; low ash',
  7100,
  1000000.00,
  'Open-cut (care and maintenance)',
  'Lyttelton Port (via Stockton CHPP)',
  '["truck (proposed 12 km haul road)","aerial ropeway","rail","ship"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational","note":"Care and maintenance"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 13) Southland Lignite — New Zealand
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Southland Lignite — South Island, New Zealand (Mataura, Ohai Basin)',
  'L&M Coal (Mataura exploration), Bathurst/BT Mining (Ohai care and maintenance)',
  'New Zealand',
  'Southland',
  'Ohai, Mataura, Southland, New Zealand',
  -46.00000000, 168.00000000,
  'Port of Bluff (~80 km)',
  NULL,
  'Lignite (Mataura); Sub-bituminous (Ohai)',
  'Very low energy (Mataura); moderate domestic thermal (Ohai)',
  1800,
  0.00,
  'Open-cut (Ohai historical); no active production',
  NULL,
  '[]'::jsonb,
  FALSE,
  '[{"operational_status":"operational","note":"No active production"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 14) Waikato Coalfield — New Zealand (CLOSED / Residual)
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Waikato Coalfield — Huntly, North Island, New Zealand (CLOSED / Residual)',
  'BT Mining (Rotowaro, Maramarua — care and maintenance)',
  'New Zealand',
  'Waikato',
  'Rotowaro, Huntly, Waikato, North Island, New Zealand',
  -37.56000000, 175.13000000,
  'Port of Auckland (~80 km); Port of Tauranga',
  NULL,
  'Sub-bituminous thermal',
  'Low quality domestic thermal; not export quality',
  4000,
  0.00,
  'Open-cut (Rotowaro, Maramarua — historical)',
  NULL,
  '[]'::jsonb,
  FALSE,
  '[{"operational_status":"operational","note":"Residual / care and maintenance"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 15) Leron Plains Coalfield — Papua New Guinea
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Leron Plains Coalfield — Markham Valley, Papua New Guinea (Undeveloped)',
  'Kula Gold (exploration); no operator',
  'Papua New Guinea',
  'Morobe Province',
  'Leron Plains, Markham Valley, Morobe Province, Papua New Guinea',
  -6.40000000, 146.40000000,
  'Port of Lae (~80 km)',
  NULL,
  'Sub-bituminous to lignite',
  'Low quality; high ash; high sulfur',
  4000,
  0.00,
  'Proposed open-cut (if developed)',
  'Port of Lae (hypothetical)',
  '[]'::jsonb,
  FALSE,
  '[{"operational_status":"operational","note":"Undeveloped / exploration"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 16) Río Turbio Coalfield — Argentina
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Río Turbio Coalfield — Santa Cruz, Argentina',
  'Yacimiento Carbonífero Río Turbio S.A. (YCRT)',
  'Argentina',
  'Santa Cruz Province',
  'Río Turbio, Santa Cruz, Argentina',
  -51.50000000, -72.25000000,
  'Puerto Deseado (~500 km) or Río Gallegos (~250 km)',
  NULL,
  'Sub-bituminous to bituminous (thermal)',
  'High-ash (20–30%), high-sulfur (1–3%); ~4,500 kcal/kg',
  4500,
  500000.00,
  'Open-pit (70%) + underground (30%)',
  NULL,
  '["truck (250 km to Río Gallegos)","ship (rare; Puerto Deseado)"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 17) Las Heras Coalfield — Argentina
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Las Heras Coalfield — Santa Cruz, Argentina',
  'YCRT (exploration only; no active mining)',
  'Argentina',
  'Santa Cruz Province',
  'Las Heras, Santa Cruz, Argentina',
  -47.50000000, -68.92000000,
  'Puerto Deseado (~150 km)',
  NULL,
  'Lignite to sub-bituminous',
  'Very high ash (>30%); thin seams (0.5–2 m); ~3,800 kcal/kg',
  3800,
  0.00,
  'Historical underground (room-and-pillar); no current operations',
  NULL,
  '[]'::jsonb,
  FALSE,
  '[{"operational_status":"operational","note":"Exploration only; no active mining"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 18) Yunchara Coalfield — Bolivia
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Yunchara Coalfield — Tarija, Bolivia',
  'Empresa Minera Yunchara S.A. (EMYSA) — COMIBOL',
  'Bolivia',
  'Tarija Department',
  'Yunchara, Tarija, Bolivia',
  -21.50000000, -64.25000000,
  'Puerto Suárez (~1,000 km east)',
  NULL,
  'Bituminous (thermal)',
  'High-ash (15–25%), medium-sulfur (1–2%); ~5,200 kcal/kg',
  5200,
  100000.00,
  'Underground (room-and-pillar)',
  NULL,
  '["truck (300 km to Tarija)","rail (indirect via Santa Cruz)"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 19) Maragua Coalfield — Bolivia
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Maragua Coalfield — Chuquisaca, Bolivia',
  'Cooperativa Minera Maragua Ltda.',
  'Bolivia',
  'Chuquisaca Department',
  'Maragua, Chuquisaca, Bolivia',
  -19.50000000, -64.75000000,
  'Santa Cruz (~800 km)',
  NULL,
  'Lignite to sub-bituminous',
  'Very high ash (>25%); high moisture (20%); ~3,500 kcal/kg',
  3500,
  10000.00,
  'Underground (room-and-pillar; manual labor)',
  NULL,
  '["truck (150 km to Sucre)","donkey cart (local)"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 20) Santa Catarina Coalfield — Brazil
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Santa Catarina Coalfield',
  'Companhia Carbonífera Catarinense (CCC) / Local operators',
  'Brazil',
  'Santa Catarina',
  'Criciúma, Santa Catarina, Brazil',
  -28.67830000, -49.36890000,
  'Imbituba Port (~100 km)',
  NULL,
  'Bituminous (thermal)',
  'High-ash (20–30%), medium-sulfur; ~4,800 kcal/kg',
  4800,
  1500000.00,
  'Underground (room-and-pillar) + open-pit',
  'Imbituba',
  '["truck","rail"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 21) Rio Grande do Sul (Candiota) — Brazil
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Rio Grande do Sul (Candiota)',
  'Companhia Riograndense de Mineração (CRM) / Eletrobras',
  'Brazil',
  'Rio Grande do Sul',
  'Candiota, Rio Grande do Sul, Brazil',
  -31.55000000, -53.68330000,
  'Rio Grande Port (~350 km)',
  NULL,
  'Sub-bituminous to bituminous',
  'High-ash (25–35%), high-sulfur (2–4%); ~3,800 kcal/kg',
  3800,
  6000000.00,
  'Open-pit',
  NULL,
  '["truck","conveyor"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 22) Paraná Basin (Figueira) — Brazil
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Paraná Basin (Figueira)',
  'Copelmi Mineração Ltda.',
  'Brazil',
  'Paraná',
  'Figueira, Paraná, Brazil',
  -23.85000000, -50.45000000,
  'Paranaguá Port (~400 km)',
  NULL,
  'Sub-bituminous',
  'High-ash (20–28%); ~4,200 kcal/kg',
  4200,
  800000.00,
  'Open-pit',
  'Paranaguá',
  '["truck","rail"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 23) Charqueadas — Brazil
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Charqueadas',
  'Companhia Carbonífera do Jacuí (CCJ) / Local operators',
  'Brazil',
  'Rio Grande do Sul',
  'Charqueadas, Rio Grande do Sul, Brazil',
  -29.95000000, -51.61670000,
  'Porto Alegre (~50 km)',
  NULL,
  'Sub-bituminous',
  'High-ash (25–35%); ~3,500 kcal/kg',
  3500,
  250000.00,
  'Open-pit + underground (legacy)',
  NULL,
  '["truck"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 24) Morungava (Rio Grande do Sul) — Brazil
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Morungava (Rio Grande do Sul)',
  'Companhia Riograndense de Mineração (CRM) / Local operators',
  'Brazil',
  'Rio Grande do Sul',
  'São Jerônimo, Rio Grande do Sul, Brazil',
  -29.96670000, -51.73330000,
  'Porto Alegre (~60 km)',
  NULL,
  'Sub-bituminous',
  'High-ash (25–32%); ~3,600 kcal/kg',
  3600,
  120000.00,
  'Open-pit',
  NULL,
  '["truck"]'::jsonb,
  FALSE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();

-- 25) Arauco Basin — Chile
INSERT INTO public.coal_mines (
  mine_name, operator, country, region, address,
  latitude, longitude,
  nearest_port, nearest_railway,
  coal_type, grade, calorific_value_kcal_kg,
  annual_capacity_tonnes,
  mining_method, loading_port, transport_modes,
  export_license,
  major_milestones
) VALUES (
  'Arauco Basin',
  'Empresa Nacional del Carbón (ENACAR) / Local operators',
  'Chile',
  'Biobío Region',
  'Lota, Biobío, Chile',
  -37.08330000, -73.16670000,
  'Coronel Port (~15 km)',
  NULL,
  'Bituminous (thermal)',
  'High-ash (15–25%); ~5,000 kcal/kg',
  5000,
  150000.00,
  'Underground (historical); residual open-pit',
  'Coronel',
  '["truck","rail"]'::jsonb,
  TRUE,
  '[{"operational_status":"operational"}]'::jsonb
)
ON CONFLICT (mine_name, country) DO UPDATE SET
  operator = EXCLUDED.operator, region = EXCLUDED.region, address = EXCLUDED.address,
  latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude,
  nearest_port = EXCLUDED.nearest_port, nearest_railway = EXCLUDED.nearest_railway,
  coal_type = EXCLUDED.coal_type, grade = EXCLUDED.grade,
  calorific_value_kcal_kg = EXCLUDED.calorific_value_kcal_kg,
  annual_capacity_tonnes = EXCLUDED.annual_capacity_tonnes,
  mining_method = EXCLUDED.mining_method, loading_port = EXCLUDED.loading_port,
  transport_modes = EXCLUDED.transport_modes, export_license = EXCLUDED.export_license,
  major_milestones = EXCLUDED.major_milestones, updated_at = NOW();
