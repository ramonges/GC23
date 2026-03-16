-- ============================================================
-- Tanzania Sugar Mills — 4 mills (sugar_plants)
-- Run SUGAR_PLANTS_TABLE_SETUP.sql first. Then run this in Supabase SQL Editor.
-- Morogoro: 2 | Kagera: 1 | Kilimanjaro: 1
-- ============================================================

INSERT INTO public.sugar_plants (
  plant_id,
  mill_name,
  operator,
  country,
  iso_code,
  region,
  sugar_type,
  latitude,
  longitude,
  status,
  crushing_capacity_tcd,
  annual_output_tonnes,
  primary_grade,
  grades_available,
  icumsa_range,
  crushing_start,
  crushing_end,
  peak_months,
  export_terminal,
  distance_to_port_km,
  rail_access,
  storage_capacity_tonnes,
  price_benchmark,
  incoterms,
  typical_contract,
  major_buyers,
  export_markets,
  notes
) VALUES
  ('TZA-MOR-001', 'Kilombero Sugar Company – Msolwa Mill (Mill 1 / K1-K3)', 'Kilombero Sugar Company Ltd (KSC) — Illovo Sugar Africa (75%), Government of Tanzania (25%)', 'Tanzania', 'TZA', 'Kilombero Valley – Morogoro Region (Kilombero District, Ifakara area)', 'sugarcane', -8.1833, 36.6833, 'operational', 9000, 127000, 'White Sugar', 'White Sugar, Molasses, Bagasse (power + steam), Ethanol (16,000 kL/yr planned at K4 site)', '45–150', 'June', 'March', 'July, August, September, October', 'Dar es Salaam Port (TAZARA railway or road)', 400, TRUE, 100000, 'ICE No. 5 / Tanzanian domestic regulated price', 'FOB Dar es Salaam; EXW Kilombero', 'Domestic supply (primary); regional EAC export; spot FOB Dar', 'Tanzanian domestic market; EAC regional markets', 'Tanzania domestic (primary); EAC region; world market (surplus)', 'Kilombero Sugar Company was established in the Kilombero Valley — Tanzania''s most productive sugarcane region. Illovo holds 75%; GoT 25% (managed via Treasury Registrar). Original mills K1/K2/K3 combined TCD ~9,000. In 2024/25 season produced 105,310 t (2nd highest nationally after Kagera). MAJOR EXPANSION: K4 project — $292M (TZS 744bn), funded by NMB Bank-led syndicate (NMB, NBC, Stanbic, Citibank, StanChart) + shareholder equity. K4 mill (420 t/hr, 144,000 t/yr output) commenced production Oct 24, 2025 — raising total Kilombero output to ~271,000 t/yr. Expected to save Tanzania $70M/yr in sugar imports. 16,000 kL/yr ethanol also planned. Kilombero basin cane often exceeds factory capacity; K4 resolves this bottleneck. Also includes Ruembe mill (sister site).'),
  ('TZA-MOR-002', 'Mtibwa Sugar Estates – Mtibwa Mill', 'Mtibwa Sugar Estates Ltd — Superdoll Trailer Manufacture Co. (Tanzania) Ltd (private majority)', 'Tanzania', 'TZA', 'Mtibwa region – Morogoro Region (Turiani, Mvomero District)', 'sugarcane', -6.1833, 37.6333, 'operational', 5000, 51000, 'White Sugar', 'White Sugar, Molasses, Bagasse', '45–150', 'June', 'March', 'July, August, September', 'Dar es Salaam Port', 250, TRUE, 40000, 'ICE No. 5 / Tanzanian domestic price', 'FOB Dar es Salaam; EXW Mtibwa', 'Domestic supply; some regional export', 'Tanzanian domestic market', 'Tanzania domestic (primary); regional EAC when surplus', 'Mtibwa is situated in Morogoro Region at ~100m elevation (distinct microclimate from Kilombero). Historic ~9% national market share. 2024/25 season output: 51,083 t. Expansion to 150,000–200,000 t/yr announced by Tanzania Sugar Producers Association (TSPA). New irrigation dam inaugurated Aug 3, 2024 by President Samia at Mtibwa factory. Operator Superdoll is a Tanzanian private industrial group. Mill capacity ~5,000 TCD (estimate based on cane throughput history).'),
  ('TZA-KAG-001', 'Kagera Sugar Limited – Kagera Mill', 'Kagera Sugar Limited — private (majority shareholder: Miwa Sugar / Mauritius-based; also holds 75% of TPC Tanzania)', 'Tanzania', 'TZA', 'Kagera region – Kagera Region (Kagera/Ngara, north-west Tanzania near Rwanda/Uganda border)', 'sugarcane', -2.5000, 31.3833, 'operational', 7000, 140000, 'White Sugar', 'White Sugar, Molasses, Bagasse (power self-sufficient)', '45–150', 'June', 'March', 'July, August, September, October', 'Dar es Salaam Port (via road/rail) or Mwanza Port (Lake Victoria ferry)', 1400, FALSE, 80000, 'ICE No. 5 / Tanzanian domestic price / EAC regional price', 'EXW Kagera; FOB Mwanza', 'Domestic supply (focus on NW Tanzania/Kagera region); regional EAC (Rwanda, Uganda, DRC, Burundi)', 'Tanzanian domestic market (NW region); Rwanda, Uganda, Burundi, DRC', 'Domestic primary; EAC regional (significant due to proximity to land-locked markets)', 'Kagera Sugar is now Tanzania''s largest single-site producer with 140,485 t in 2024/25 season and ~17% historical market share (rising). Factory originally built 1970s, completely rebuilt after destruction during Tanzania-Uganda War (1978-79 Amin regime). Kagera Sugar Ltd is majority-owned by Miwa Sugar (Mauritius-based holding company linked to Alteo/Mauritius interests). Miwa/Kagera also holds 75% of TPC Ltd in Moshi (GoT holds 25%). Remoteness from coast means regional/neighboring country markets (Rwanda, Burundi, DRC, Uganda) are key. Expansion ongoing: targeted 230,000 t/yr output in next few years (from ~131,000 t previously). Kagera region grows irrigated cane.'),
  ('TZA-KIL-001', 'TPC Limited – Tanganyika Planting Company Mill', 'TPC Limited — Kagera Sugar (75%), Government of Tanzania (25%); Kagera Sugar ultimately held by Miwa Sugar / Alteo (Mauritius)', 'Tanzania', 'TZA', 'Moshi region – Kilimanjaro Region (Lower Moshi, ~50km south of Mount Kilimanjaro)', 'sugarcane', -3.3833, 37.3167, 'operational', 8500, 113000, 'White Sugar', 'White Sugar, Molasses (new distillery TZS 112.5–125bn approved), Bagasse (17.5MW cogen; 17,000 MWh/yr to Tanesco grid)', '45–150', 'June', 'March', 'July, August, September', 'Dar es Salaam Port (road via Arusha-Moshi highway) or Tanga Port', 520, FALSE, 90000, 'ICE No. 5 / Tanzanian domestic price', 'FOB Dar es Salaam; EXW Moshi', 'Domestic supply; some regional export', 'Tanzanian domestic market (Kilimanjaro/northern Tanzania); regional', 'Domestic primary; EAC regional', 'Tanzania''s oldest and most storied mill — established 1930s as Tanganyika Planting Company. 16,000 ha total land; 8,000 ha cane. Majority-acquired 2000 by Alteo Ltd (Mauritius) + Groupe Quartier Français (now Tereos Océan Indien, Réunion). TPC is now controlled 75% by Kagera Sugar Ltd, with GoT retaining 25%. Record season 2022/23: 116,691 t (1,143,909 t cane crushed). 2024/25 output: 112,855 t. Cane manually harvested over ~9-month season (mid-June to mid-March). First in Tanzania to pioneer cogeneration (17.5MW) and enter Standardised PPA with Tanesco. New molasses distillery (TZS 112.5–125bn) approved by board Dec 2023 — adds 4–7MW additional grid supply. Largest employer in northern Tanzania. Located ~50km south of Mt Kilimanjaro, irrigated Lowveld soils.')
ON CONFLICT (mill_name, country) DO UPDATE SET
  plant_id = EXCLUDED.plant_id,
  operator = EXCLUDED.operator,
  iso_code = EXCLUDED.iso_code,
  region = EXCLUDED.region,
  sugar_type = EXCLUDED.sugar_type,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  status = EXCLUDED.status,
  crushing_capacity_tcd = EXCLUDED.crushing_capacity_tcd,
  annual_output_tonnes = EXCLUDED.annual_output_tonnes,
  primary_grade = EXCLUDED.primary_grade,
  grades_available = EXCLUDED.grades_available,
  icumsa_range = EXCLUDED.icumsa_range,
  crushing_start = EXCLUDED.crushing_start,
  crushing_end = EXCLUDED.crushing_end,
  peak_months = EXCLUDED.peak_months,
  export_terminal = EXCLUDED.export_terminal,
  distance_to_port_km = EXCLUDED.distance_to_port_km,
  rail_access = EXCLUDED.rail_access,
  storage_capacity_tonnes = EXCLUDED.storage_capacity_tonnes,
  price_benchmark = EXCLUDED.price_benchmark,
  incoterms = EXCLUDED.incoterms,
  typical_contract = EXCLUDED.typical_contract,
  major_buyers = EXCLUDED.major_buyers,
  export_markets = EXCLUDED.export_markets,
  notes = EXCLUDED.notes,
  updated_at = NOW();

