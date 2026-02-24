-- ============================================================
-- Commodity Sites — Corrections (run AFTER initial inserts)
-- Shortens long titles/owner names, removes duplicate, fixes Areva→Orano
-- Regroups BP / CNPC / Groupement Berkine company names
-- ============================================================

BEGIN;

-- =====================
-- SHORTEN TITLES
-- =====================

UPDATE public.commodity_locations SET title = 'Moab Khotsong (Vaal River Ops)', updated_at = NOW()
WHERE title = 'Moab Khotsong / Great Noligwa (Vaal River Operations)' AND country = 'South Africa' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'Sibanye Witwatersrand Tailings', updated_at = NOW()
WHERE title = 'Sibanye-Stillwater Witwatersrand Tailings' AND country = 'South Africa' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'Karoo Uranium Province', updated_at = NOW()
WHERE title = 'Karoo Uranium Province (Beaufort West / Lukisa)' AND country = 'South Africa' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'Muntanga Project', updated_at = NOW()
WHERE title = 'Muntanga Project (Mutanga/Dibwe/Chirundu deposits)' AND country = 'Zambia' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'Karoi Uranium (Lomagundi Belt)', updated_at = NOW()
WHERE title = 'Karoi Region Uranium Occurrences (Lomagundi Belt)' AND country = 'Zimbabwe' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'Shinkolobwe Mine', updated_at = NOW()
WHERE title = 'Shinkolobwe Uranium Mine (Kasolo/Chinkolobwe)' AND country = 'Democratic Republic of Congo' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'OCP Phosphate Uranium', updated_at = NOW()
WHERE title = 'OCP Phosphate Basins — Uranium from Phosphoric Acid' AND country = 'Morocco' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'Tarfaya Phosphate Uranium', updated_at = NOW()
WHERE title = 'Tarfaya Phosphate / Uranium Occurrence' AND country = 'Morocco' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'El Missikat / El Erediya', updated_at = NOW()
WHERE title = 'El Missikat / El Erediya Uranium Deposits' AND country = 'Egypt' AND commodity_name = 'Uranium';

UPDATE public.commodity_locations SET title = 'Mounana–Oklo Mining District', updated_at = NOW()
WHERE title = 'Mounana–Oklo–Okélobondo–Boyindzi Uranium Mining District' AND country = 'Gabon' AND commodity_name = 'Uranium';

-- =====================
-- SHORTEN OWNER NAMES
-- =====================

UPDATE public.commodity_locations SET owner = 'CNNC Intl / Sopamin / ZXJoy / KOMIR', updated_at = NOW()
WHERE owner = 'CNNC International + Sopamin + ZXJoy + KOMIR';

UPDATE public.commodity_locations SET owner = 'Imouraren SA', updated_at = NOW()
WHERE owner = 'Imouraren SA (permit revoked)';

UPDATE public.commodity_locations SET owner = 'Global Atomic + SOPAMIN', updated_at = NOW()
WHERE owner = 'Global Atomic Corp + SOPAMIN';

UPDATE public.commodity_locations SET owner = 'CNUC / IFIC / IDC / Gov Namibia', updated_at = NOW()
WHERE owner = 'CNUC + Iranian Foreign Investment + IDC + Gov Namibia';

UPDATE public.commodity_locations SET owner = 'Atomic Eagle', updated_at = NOW()
WHERE owner = 'Atomic Eagle (formerly GoviEx)';

UPDATE public.commodity_locations SET owner = 'NMA Egypt', updated_at = NOW()
WHERE owner = 'Nuclear Materials Authority (NMA)';

UPDATE public.commodity_locations SET owner = 'DRC Government', updated_at = NOW()
WHERE owner = 'DRC Government (closed)';

UPDATE public.commodity_locations SET owner = 'Lotus Resources + Gov Malawi', updated_at = NOW()
WHERE owner = 'Lotus Resources + Government of Malawi';

UPDATE public.commodity_locations SET owner = 'Gov of Somalia', updated_at = NOW()
WHERE owner = 'Federal Government of Somalia';

UPDATE public.commodity_locations SET owner = 'Gov of Gabon', updated_at = NOW()
WHERE owner = 'Government of Gabon';

-- =====================
-- SHORTEN OWNER NAMES — GLOBAL
-- =====================

UPDATE public.commodity_locations SET owner = 'NMMC', updated_at = NOW()
WHERE owner = 'Navoi Mining & Metallurgical Company (NMMC)';

UPDATE public.commodity_locations SET owner = 'UCIL (DAE)', updated_at = NOW()
WHERE owner = 'Uranium Corporation of India Ltd (UCIL)';

UPDATE public.commodity_locations SET owner = 'AEOI', updated_at = NOW()
WHERE owner = 'Atomic Energy Organization of Iran (AEOI)';

UPDATE public.commodity_locations SET owner = 'PAEC', updated_at = NOW()
WHERE owner = 'Pakistan Atomic Energy Commission (PAEC)';

UPDATE public.commodity_locations SET owner = 'JAEA', updated_at = NOW()
WHERE owner = 'Japan Atomic Energy Agency (JAEA)';

UPDATE public.commodity_locations SET owner = 'VostGOK', updated_at = NOW()
WHERE owner = 'Eastern Mining & Processing Plant (VostGOK)';

UPDATE public.commodity_locations SET owner = 'CNU Romania', updated_at = NOW()
WHERE owner = 'National Uranium Company (CNU Sucursala Feldioara)';

UPDATE public.commodity_locations SET owner = 'Energy Transition Minerals', updated_at = NOW()
WHERE owner = 'Energy Transition Minerals (formerly Greenland Minerals)';

UPDATE public.commodity_locations SET owner = 'Denison Mines / Rio Algom', updated_at = NOW()
WHERE owner = 'Denison Mines / Rio Algom (historic)';

UPDATE public.commodity_locations SET owner = 'Eldorado Nuclear / Cameco', updated_at = NOW()
WHERE owner = 'Eldorado Nuclear / Cameco (historic)';

UPDATE public.commodity_locations SET owner = 'UEC / enCore Energy', updated_at = NOW()
WHERE owner = 'Uranium Energy Corp / enCore Energy';

UPDATE public.commodity_locations SET owner = 'DOE (legacy)', updated_at = NOW()
WHERE owner = 'DOE (legacy) / historic private';

UPDATE public.commodity_locations SET owner = 'ININ', updated_at = NOW()
WHERE owner = 'ININ (Mexican Nuclear Research Institute)';

UPDATE public.commodity_locations SET owner = 'INB', updated_at = NOW()
WHERE owner = 'INB (Indústrias Nucleares do Brasil)';

UPDATE public.commodity_locations SET owner = 'CNEA', updated_at = NOW()
WHERE owner = 'CNEA (Comisión Nacional de Energía Atómica)';

UPDATE public.commodity_locations SET owner = 'Plateau Energy Metals', updated_at = NOW()
WHERE owner = 'Plateau Energy Metals / Macusani Yellowcake';

UPDATE public.commodity_locations SET owner = 'CCHEN', updated_at = NOW()
WHERE owner = 'CCHEN (Comisión Chilena de Energía Nuclear)';

UPDATE public.commodity_locations SET owner = 'SGC Colombia', updated_at = NOW()
WHERE owner = 'SGC (Servicio Geológico Colombiano)';

UPDATE public.commodity_locations SET owner = 'Wismut GmbH', updated_at = NOW()
WHERE owner = 'Wismut GmbH (Federal Germany)';

UPDATE public.commodity_locations SET owner = 'ERA (Rio Tinto)', updated_at = NOW()
WHERE owner = 'ERA (Energy Resources of Australia)';

UPDATE public.commodity_locations SET owner = 'Heathgate Resources', updated_at = NOW()
WHERE owner = 'Heathgate Resources (General Atomics)';

UPDATE public.commodity_locations SET owner = 'Cameco Australia', updated_at = NOW()
WHERE owner = 'Cameco Australia (formerly BHP)';

UPDATE public.commodity_locations SET owner = 'PNG Gov (MRA)', updated_at = NOW()
WHERE owner = 'PNG Government (Mineral Resources Authority)';

-- =====================
-- FIX AREVA → ORANO
-- =====================

UPDATE public.commodity_locations
SET additional_info = jsonb_set(additional_info, '{note}',
    to_jsonb(replace(additional_info->>'note', 'Areva', 'Orano'))),
    updated_at = NOW()
WHERE additional_info->>'note' LIKE '%Areva%' AND commodity_name = 'Uranium';

-- =====================
-- REMOVE DRC DUPLICATE (Katanga Belt merged into Shinkolobwe)
-- =====================

DELETE FROM public.commodity_locations
WHERE title = 'Katanga Province — Broader Uranium Belt'
  AND country = 'Democratic Republic of Congo'
  AND commodity_name = 'Uranium';

-- Merge Katanga Belt info into Shinkolobwe's note and transport routes
UPDATE public.commodity_locations
SET additional_info = jsonb_set(
      jsonb_set(additional_info, '{note}',
        to_jsonb(additional_info->>'note' || '; part of 400 km Katanga uraniferous belt (Luiswishi, Kambove, Musonoi); Orano exploration 2009')),
      '{transport_routes}',
      additional_info->'transport_routes' || '["Lobito Corridor to Angola coast"]'::jsonb),
    updated_at = NOW()
WHERE title = 'Shinkolobwe Mine'
  AND country = 'Democratic Republic of Congo'
  AND commodity_name = 'Uranium';

-- =====================
-- SHORTEN AKRAKE PETROLEUM → Rex International
-- =====================

UPDATE public.commodity_locations SET company = 'Rex International', updated_at = NOW()
WHERE company LIKE 'Akrake Petroleum%';

UPDATE public.commodity_locations SET operator = 'Rex International', updated_at = NOW()
WHERE operator LIKE 'Akrake Petroleum%';

UPDATE public.commodity_locations SET owner = 'Rex International', updated_at = NOW()
WHERE owner LIKE 'Akrake Petroleum%';

-- =====================
-- REGROUP BP (all variants → 'BP')
-- =====================

-- Azerbaijan long names (company column)
UPDATE public.commodity_locations SET company = 'BP', updated_at = NOW()
WHERE company ILIKE 'bp (%' AND company != 'BP';

UPDATE public.commodity_locations SET company = 'BP', updated_at = NOW()
WHERE company ILIKE 'bp Exploration%';

UPDATE public.commodity_locations SET company = 'BP', updated_at = NOW()
WHERE company ILIKE 'bp Trinidad%';

UPDATE public.commodity_locations SET company = 'BP', updated_at = NOW()
WHERE company = 'Shell Trinidad and Tobago + bp';

UPDATE public.commodity_locations SET company = 'BP', updated_at = NOW()
WHERE company IN ('BP Exploration (Angola) Limited', 'Sonatrach/BP', 'Total/BP',
  'ExxonMobil/BP', 'Rosneft/BP', 'BP/Shell', 'SAFER + BP', 'BP / OQ');

UPDATE public.commodity_locations SET company = 'BP', updated_at = NOW()
WHERE company LIKE 'BP (lead)%' OR company LIKE 'BP + %';

-- Azerbaijan long names (operator column)
UPDATE public.commodity_locations SET operator = 'BP', updated_at = NOW()
WHERE operator ILIKE 'bp (%' AND operator != 'BP';

UPDATE public.commodity_locations SET operator = 'BP', updated_at = NOW()
WHERE operator ILIKE 'bp Exploration%';

UPDATE public.commodity_locations SET operator = 'BP', updated_at = NOW()
WHERE operator ILIKE 'bp Trinidad%';

UPDATE public.commodity_locations SET operator = 'BP', updated_at = NOW()
WHERE operator IN ('BP Exploration (Angola) Limited', 'Sonatrach/BP', 'Total/BP',
  'ExxonMobil/BP', 'Rosneft/BP', 'BP/Shell', 'SAFER + BP',
  'Shell Trinidad and Tobago', 'BP / OQ', 'BP (operator) + OQ', 'BP + OQ (Oman Oil)');

UPDATE public.commodity_locations SET operator = 'BP', updated_at = NOW()
WHERE operator LIKE 'BP (lead)%' OR operator LIKE 'BP + %';

-- BP/CNPC joint ventures: company → BP, operator → CNPC
UPDATE public.commodity_locations SET company = 'BP', operator = 'CNPC', updated_at = NOW()
WHERE company = 'BP/CNPC' OR operator = 'BP/CNPC';

-- Catch any remaining 'bp' (lowercase exact match) → 'BP'
UPDATE public.commodity_locations SET company = 'BP', updated_at = NOW()
WHERE company = 'bp';

UPDATE public.commodity_locations SET operator = 'BP', updated_at = NOW()
WHERE operator = 'bp';

-- =====================
-- REGROUP CNPC (all variants → 'CNPC')
-- =====================

-- Explicit long names
UPDATE public.commodity_locations SET company = 'CNPC', updated_at = NOW()
WHERE company IN ('Turkmengas/CNPC', 'CNPC International',
  'CNPC / CNODC (China National Petroleum / CNPC International)');

UPDATE public.commodity_locations SET operator = 'CNPC', updated_at = NOW()
WHERE operator IN ('Turkmengas/CNPC', 'CNPC International',
  'CNPC / CNODC (China National Petroleum / CNPC International)');

-- Daqing Oilfield
UPDATE public.commodity_locations SET company = 'CNPC', updated_at = NOW()
WHERE company LIKE '%Daqing Oilfield%';

UPDATE public.commodity_locations SET operator = 'CNPC', updated_at = NOW()
WHERE operator LIKE '%Daqing Oilfield%';

-- PetroChina subsidiaries (Tarim, Tuha, Xinjiang, Changqing, Sulige, Changbei)
UPDATE public.commodity_locations SET company = 'CNPC', updated_at = NOW()
WHERE company LIKE 'PetroChina %';

UPDATE public.commodity_locations SET operator = 'CNPC', updated_at = NOW()
WHERE operator LIKE 'PetroChina %';

-- "China National Petroleum Corporation ..." long form
UPDATE public.commodity_locations SET company = 'CNPC', updated_at = NOW()
WHERE company LIKE 'China National Petroleum%';

UPDATE public.commodity_locations SET operator = 'CNPC', updated_at = NOW()
WHERE operator LIKE 'China National Petroleum%';

-- CNPC/PetroChina combined
UPDATE public.commodity_locations SET company = 'CNPC', updated_at = NOW()
WHERE company LIKE 'CNPC/PetroChina%';

UPDATE public.commodity_locations SET operator = 'CNPC', updated_at = NOW()
WHERE operator LIKE 'CNPC/PetroChina%';

-- CNPC with parenthetical (Tarim, initially, lead, reported...)
UPDATE public.commodity_locations SET company = 'CNPC', updated_at = NOW()
WHERE company LIKE 'CNPC (%' AND company != 'CNPC';

UPDATE public.commodity_locations SET operator = 'CNPC', updated_at = NOW()
WHERE operator LIKE 'CNPC (%' AND operator != 'CNPC';

-- CNPC + partner JVs
UPDATE public.commodity_locations SET company = 'CNPC', updated_at = NOW()
WHERE company LIKE 'CNPC + %';

UPDATE public.commodity_locations SET operator = 'CNPC', updated_at = NOW()
WHERE operator LIKE 'CNPC + %';

-- CNPC / slash patterns
UPDATE public.commodity_locations SET company = 'CNPC', updated_at = NOW()
WHERE company LIKE 'CNPC / %' OR company LIKE 'CNPC/%' OR company LIKE '%/CNPC';

UPDATE public.commodity_locations SET operator = 'CNPC', updated_at = NOW()
WHERE operator LIKE 'CNPC / %' OR operator LIKE 'CNPC/%' OR operator LIKE '%/CNPC';

-- =====================
-- REGROUP CNOOC (all variants → 'CNOOC')
-- =====================

UPDATE public.commodity_locations SET company = 'CNOOC', updated_at = NOW()
WHERE company LIKE 'CNOOC (%' AND company != 'CNOOC';

UPDATE public.commodity_locations SET operator = 'CNOOC', updated_at = NOW()
WHERE operator LIKE 'CNOOC (%' AND operator != 'CNOOC';

UPDATE public.commodity_locations SET company = 'CNOOC', updated_at = NOW()
WHERE company LIKE 'CNOOC Limited%';

UPDATE public.commodity_locations SET operator = 'CNOOC', updated_at = NOW()
WHERE operator LIKE 'CNOOC Limited%';

-- =====================
-- SHORTEN GROUPEMENT BERKINE / REGGANE / ISARENE
-- =====================

UPDATE public.commodity_locations SET company = 'Grpt Berkine', updated_at = NOW()
WHERE company LIKE 'Groupement Berkine%';

UPDATE public.commodity_locations SET operator = 'Grpt Berkine', updated_at = NOW()
WHERE operator LIKE 'Groupement Berkine%';

UPDATE public.commodity_locations SET company = 'Grpt Reggane Nord', updated_at = NOW()
WHERE company LIKE 'Groupement Reggane%';

UPDATE public.commodity_locations SET operator = 'Grpt Reggane Nord', updated_at = NOW()
WHERE operator LIKE 'Groupement Reggane%';

UPDATE public.commodity_locations SET company = 'Grpt Isarene', updated_at = NOW()
WHERE company LIKE 'Groupement Isarene%';

UPDATE public.commodity_locations SET operator = 'Grpt Isarene', updated_at = NOW()
WHERE operator LIKE 'Groupement Isarene%';

-- =====================
-- REGROUP SOCAR (all variants → 'SOCAR')
-- =====================

UPDATE public.commodity_locations SET company = 'SOCAR', updated_at = NOW()
WHERE company LIKE 'SOCAR (%' AND company != 'SOCAR';

UPDATE public.commodity_locations SET operator = 'SOCAR', updated_at = NOW()
WHERE operator LIKE 'SOCAR (%' AND operator != 'SOCAR';

UPDATE public.commodity_locations SET company = 'SOCAR', updated_at = NOW()
WHERE company LIKE 'SOCAR Azneft%';

UPDATE public.commodity_locations SET operator = 'SOCAR', updated_at = NOW()
WHERE operator LIKE 'SOCAR Azneft%';

UPDATE public.commodity_locations SET company = 'SOCAR', updated_at = NOW()
WHERE company LIKE 'SOCAR (Balakhanineft%';

UPDATE public.commodity_locations SET operator = 'SOCAR', updated_at = NOW()
WHERE operator LIKE 'SOCAR (Balakhanineft%';

UPDATE public.commodity_locations SET company = 'SOCAR', updated_at = NOW()
WHERE company LIKE 'SOCAR (with Bahar%';

UPDATE public.commodity_locations SET operator = 'SOCAR', updated_at = NOW()
WHERE operator LIKE 'SOCAR (with Bahar%';

UPDATE public.commodity_locations SET company = 'SOCAR', updated_at = NOW()
WHERE company LIKE 'SOCAR (reported)%';

UPDATE public.commodity_locations SET operator = 'SOCAR', updated_at = NOW()
WHERE operator LIKE 'SOCAR (reported)%';

UPDATE public.commodity_locations SET company = 'SOCAR', updated_at = NOW()
WHERE company LIKE 'SOCAR (operator not specified%';

UPDATE public.commodity_locations SET operator = 'SOCAR', updated_at = NOW()
WHERE operator LIKE 'SOCAR (operator not specified%';

UPDATE public.commodity_locations SET company = 'SOCAR', updated_at = NOW()
WHERE company LIKE 'SOCAR (historically%';

UPDATE public.commodity_locations SET operator = 'SOCAR', updated_at = NOW()
WHERE operator LIKE 'SOCAR (historically%';

-- =====================
-- REGROUP SONATRACH (all variants → 'Sonatrach')
-- =====================

UPDATE public.commodity_locations SET company = 'Sonatrach', updated_at = NOW()
WHERE company LIKE 'Sonatrach (%' AND company != 'Sonatrach';

UPDATE public.commodity_locations SET operator = 'Sonatrach', updated_at = NOW()
WHERE operator LIKE 'Sonatrach (%' AND operator != 'Sonatrach';

UPDATE public.commodity_locations SET company = 'Sonatrach', updated_at = NOW()
WHERE company LIKE 'Sonatrach / %' OR company LIKE 'Sonatrach/%';

UPDATE public.commodity_locations SET operator = 'Sonatrach', updated_at = NOW()
WHERE operator LIKE 'Sonatrach / %' OR operator LIKE 'Sonatrach/%';

UPDATE public.commodity_locations SET company = 'Sonatrach', updated_at = NOW()
WHERE company LIKE 'Sonatrach-Cepsa%';

UPDATE public.commodity_locations SET operator = 'Sonatrach', updated_at = NOW()
WHERE operator LIKE 'Sonatrach-Cepsa%';

UPDATE public.commodity_locations SET company = 'Sonatrach', updated_at = NOW()
WHERE company LIKE 'Unitized between Block%';

UPDATE public.commodity_locations SET operator = 'Sonatrach', updated_at = NOW()
WHERE operator LIKE 'Unitized between Block%';

UPDATE public.commodity_locations SET company = 'Sonatrach', updated_at = NOW()
WHERE company LIKE 'Eni / Sonatrach%' OR company LIKE 'Cepsa / Sonatrach%';

UPDATE public.commodity_locations SET operator = 'Sonatrach', updated_at = NOW()
WHERE operator LIKE 'Eni / Sonatrach%' OR operator LIKE 'Cepsa / Sonatrach%';

-- Sonatrach (operator/majority), Sonatrach (operator/owner), 100% owned by Sonatrach...
UPDATE public.commodity_locations SET company = 'Sonatrach', updated_at = NOW()
WHERE company LIKE 'Sonatrach (operator%' OR company LIKE '100% owned%Sonatrach%';

UPDATE public.commodity_locations SET operator = 'Sonatrach', updated_at = NOW()
WHERE operator LIKE 'Sonatrach (operator%' OR operator LIKE '100% owned%Sonatrach%';

UPDATE public.commodity_locations SET company = 'Sonatrach', updated_at = NOW()
WHERE company LIKE 'Sonatrach (NOC)%';

UPDATE public.commodity_locations SET operator = 'Sonatrach', updated_at = NOW()
WHERE operator LIKE 'Sonatrach (NOC)%';

-- =====================
-- REGROUP PERENCO (all variants → 'Perenco')
-- =====================

UPDATE public.commodity_locations SET company = 'Perenco', updated_at = NOW()
WHERE company LIKE 'Perenco (%' AND company != 'Perenco';

UPDATE public.commodity_locations SET operator = 'Perenco', updated_at = NOW()
WHERE operator LIKE 'Perenco (%' AND operator != 'Perenco';

UPDATE public.commodity_locations SET company = 'Perenco', updated_at = NOW()
WHERE company LIKE 'Perenco (Cameroon)%';

UPDATE public.commodity_locations SET operator = 'Perenco', updated_at = NOW()
WHERE operator LIKE 'Perenco (Cameroon)%';

-- =====================
-- SHORTEN OTHER LONG COMPANY NAMES
-- =====================

UPDATE public.commodity_locations SET company = 'EnQuest', updated_at = NOW()
WHERE company LIKE 'EnQuest EP BV%';

UPDATE public.commodity_locations SET operator = 'EnQuest', updated_at = NOW()
WHERE operator LIKE 'EnQuest EP BV%';

UPDATE public.commodity_locations SET company = 'Genting', updated_at = NOW()
WHERE company LIKE 'Genting Oil & Gas%';

UPDATE public.commodity_locations SET operator = 'Genting', updated_at = NOW()
WHERE operator LIKE 'Genting Oil & Gas%';

UPDATE public.commodity_locations SET company = 'Saga Petroleum', updated_at = NOW()
WHERE company LIKE 'Saga Petroleum (historic%';

UPDATE public.commodity_locations SET operator = 'Saga Petroleum', updated_at = NOW()
WHERE operator LIKE 'Saga Petroleum (historic%';

UPDATE public.commodity_locations SET company = 'Sakhalin Energy', updated_at = NOW()
WHERE company LIKE 'Sakhalin Energy (%';

UPDATE public.commodity_locations SET operator = 'Sakhalin Energy', updated_at = NOW()
WHERE operator LIKE 'Sakhalin Energy (%';

UPDATE public.commodity_locations SET company = 'UPDC', updated_at = NOW()
WHERE company = 'United Petroleum Development Co (UPDC)';

UPDATE public.commodity_locations SET operator = 'UPDC', updated_at = NOW()
WHERE operator = 'United Petroleum Development Co (UPDC)';

COMMIT;
