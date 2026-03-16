-- ============================================================
-- Uganda Sugar Mills — 4 mills (sugar_plants)
-- Run SUGAR_PLANTS_TABLE_SETUP.sql first. Then run this in Supabase SQL Editor.
-- Jinja: 1 | Masindi: 1 | Buikwe: 1 | Kyotera: 1
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
  ('UGA-JIN-001', 'Kakira Sugar Works', 'Kakira Sugar Limited — Madhvani Group of Companies (100% private, Ugandan-Indian conglomerate)', 'Uganda', 'UGA', 'Kakira region – Jinja District, Eastern Uganda (between Jinja and Iganga, Lake Victoria shore)', 'sugarcane', 0.5100, 33.2900, 'operational', 7500, 165000, 'Brown Granular Sugar', 'Brown Granular Sugar (Kakira brand), Industrial-grade Ethanol (molasses distillery commissioned Nov 2016, ~30M litres/yr), Molasses, Bagasse (52MW cogen — upgraded from 22MW in 2013)', '600–2000', 'January', 'December', 'February, March, July, August', 'Mombasa Port (Kenya, via road/rail) or Dar es Salaam Port', 800, TRUE, 120000, 'EAC regional market price / ICE No. 11 equivalent', 'EXW Kakira; FOB Mombasa', 'EAC domestic and regional spot; industrial ethanol contracts', 'Uganda domestic market; DRC, South Sudan, Rwanda, Burundi, Kenya, Tanzania', 'DRC, South Sudan, Rwanda, Burundi, Kenya, Tanzania', 'Uganda''s largest sugar mill and flagship business of the Madhvani Group — Uganda''s largest private conglomerate (~10% of national GDP). Founded 1930 on 800 acres purchased 1920 by Muljibhai Madhvani. Factory coordinates: 0°30''36.0\"N, 33°17''24.0\"E. USh 191bn ($75M) expansion 2013 raised crushing capacity to 7,500 TCD; co-gen upgraded from 22MW to 52MW. Ethanol distillery (Praj Industries, India) commissioned Nov 2016, USh 133bn ($36.6M). 9,500+ ha estate; 7,500+ employees. Production peaked at 180,000 t in 2014; fluctuated with cane supply competition. As of 2022 still Uganda''s largest mill by output. Kakira holds ~47% national market share historically.'),
  ('UGA-MAS-001', 'Kinyara Sugar Limited – Kinyara Mill', 'Kinyara Sugar Limited (KSL) — Sarrai Group (formerly Rai Group), ~70%; Government of Uganda ~30%', 'Uganda', 'UGA', 'Kinyara region – Masindi District, Western Uganda (17km west of Masindi town)', 'sugarcane', 1.6372, 31.6083, 'operational', 5500, 110000, 'Brown Granular Sugar / White Industrial Sugar', 'Brown Granular Sugar, White Industrial Sugar (industrial refinery commissioned 2022 — first in East Africa; 60,000 t/yr initial, expanded to 75,000 t/yr by 2023), Molasses, Bagasse (14.5MW cogen power station)', '45–2000', 'January', 'December', 'February, March, July, August', 'Mombasa Port (Kenya, via road) or Kampala distribution', 920, FALSE, 80000, 'EAC regional price / domestic Uganda price', 'EXW Kinyara; FOB Mombasa', 'EAC domestic and regional; industrial sugar supply to breweries/beverages', 'Uganda domestic (breweries, beverage manufacturers, industrial users); DRC, South Sudan, regional EAC', 'DRC, South Sudan, Rwanda, regional EAC', 'Kinyara coordinates: 1°38''14.0\"N, 31°36''30.0\"E. Uganda''s 2nd largest sugar mill. History: Omukama of Bunyoro jaggery factory 1955; nationalised; rehabilitated by Booker Tate Ltd in 1990s (production resumed 1995). Government sold 51% to Rai Group (now Sarrai Group) 2004, further 19% in 2011 for $9.1M. KSL is Uganda subsidiary of Sarrai Group (also operates KISCOL in Kenya and mills in Uganda). KEY MILESTONE: Commissioned first modern industrial sugar (white refined) refinery in East Africa in 2022 — 60,000 t/yr capacity, expanded to 75,000 t/yr in 2023. Total national white industrial sugar capacity now ~120,000 t/yr (Kinyara + Kakira). Cogen power station: 14.5MW, target expansion to 40MW. Supplies 7,500+ outgrower farmers. ~31% national market share.'),
  ('UGA-BUI-001', 'Sugar Corporation of Uganda Limited (SCOUL) – Lugazi Mill', 'Sugar Corporation of Uganda Limited (SCOUL) — Mehta Group (India/Uganda, private, 100%)', 'Uganda', 'UGA', 'Lugazi region – Buikwe District, Central Uganda (48km east of Kampala, Buganda)', 'sugarcane', 0.3831, 32.9408, 'operational', 6000, 100000, 'Brown Granular Sugar', 'Brown Granular Sugar (Lugazi Sugar brand; Mr. Sweet Table brand), Industrial Alcohol/Ethanol (distillery since 2014), Food-grade CO₂ (3,000 t/yr CO₂ plant), Molasses, Bagasse (9.5MW cogen)', '600–2000', 'January', 'December', 'February, March, July, August', 'Mombasa Port (Kenya, via road/Kampala) or Dar es Salaam Port', 850, TRUE, 70000, 'EAC regional price / domestic Uganda price', 'EXW Lugazi; FOB Mombasa', 'EAC domestic and regional spot', 'Uganda domestic market; Kenya, Tanzania, Rwanda, Burundi, DRC, South Sudan', 'EAC region: Kenya, Tanzania, Rwanda, Burundi, DRC, South Sudan', 'SCOUL coordinates: 0°22''59.0\"N, 32°56''27.0\"E. Founded 1924 by Nanji Kalidas Mehta (Mehta Group founder), making it Uganda''s oldest continuous sugar operation. Celebrated centenary 2024. Fully integrated complex: 16,000 ha estate + outgrowers, 2,000km estate roads, 7,000 employees, 6,000+ outgrowers. Unique downstream products: food-grade CO₂ plant (3,000 t/yr, first in Uganda) + industrial alcohol distillery (2014). 9.5MW cogen. ISO 9001 and ISO 14001 certified — first sugar company in Uganda to achieve both. Uganda''s President Export Gold Medal Award. Capacity: 125,000 t/yr (per 2024 centenary statement); historically reported at 60,000–100,000 t actual output. Expanding toward 125,000 t/yr+ with automation. Mehta Group also has interests in tea, coffee, cotton.'),
  ('UGA-KYO-001', 'Sango Bay Estates – Sugar Mill', 'Sango Bay Estates Limited (private)', 'Uganda', 'UGA', 'Sango Bay region – Kyotera District, Southern Uganda (Lake Victoria western shore, near Tanzania border)', 'sugarcane', -0.8333, 31.7167, 'limited_operations', 1200, 15000, 'Brown Granular Sugar', 'Brown Granular Sugar, Molasses', '600–2000', 'January', 'December', 'February, March, July, August', 'Mombasa Port (Kenya) via Kampala', 950, FALSE, 10000, 'EAC domestic price', 'EXW Sango Bay', 'Uganda domestic supply', 'Uganda domestic market (southern Uganda/Kampala)', 'Primarily domestic Uganda', 'Smallest of the four original Ugandan sugar producers; ~5% national market share historically. Located on southern Lake Victoria shore in Kyotera District (formerly Rakai District), near the Tanzanian border. Small estate; limited infrastructure. Sensitive ecological area adjacent to Lake Victoria shoreline. Operations are limited scale. Included as the fourth original USMA-registered producer alongside Kakira, Kinyara, and SCOUL. Several small new entrant factories (Atiak Sugar, Hoima Sugar, Kaliro Sugar, Mayuge Sugar, etc.) have been licensed since 2014 but are sub-industrial scale and not listed here.')
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

