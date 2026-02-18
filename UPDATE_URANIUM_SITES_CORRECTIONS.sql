-- ============================================================
-- Uranium Sites — Corrections (run AFTER initial insert)
-- Shortens long titles, owner names, removes duplicate, fixes Areva→Orano
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

COMMIT;
