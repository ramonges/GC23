-- ============================================================
-- Delete 3 PNG projects (non-coal) from commodity_locations
-- Run in Supabase SQL Editor
-- ============================================================
-- Projects to remove:
--   1. Ramu Nickel-Cobalt Project (Nickel, Cobalt) — MCC (China)
--   2. Frieda River Copper-Gold Project (Copper, Gold) — PanAust/Highlands Pacific
--   3. Kainantu Gold Mine (Gold, Copper) — K92 Mining (Canada)
-- ============================================================

-- Preview what will be deleted (run first to verify):
-- SELECT id, title, commodity_name, operator, country
-- FROM public.commodity_locations
-- WHERE title ILIKE '%Ramu Nickel-Cobalt%'
--    OR title ILIKE '%Frieda River Copper-Gold%'
--    OR title ILIKE '%Kainantu Gold Mine%';

DELETE FROM public.commodity_locations
WHERE title ILIKE '%Ramu Nickel-Cobalt Project%'
   OR title ILIKE '%Frieda River Copper-Gold Project%'
   OR title ILIKE '%Kainantu Gold Mine%';
