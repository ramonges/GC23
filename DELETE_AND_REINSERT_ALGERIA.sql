-- ============================================
-- DELETE ALL ALGERIA ENTRIES AND RE-INSERT ALL 38 SITES
-- ============================================

-- Delete all existing Algeria entries
DELETE FROM public.commodity_locations WHERE country = 'Algeria';

-- Now run the ALGERIA_OIL_FIELDS_SETUP.sql file to re-insert all 38 sites
-- Note: Only sites with coordinates will appear on the map
-- Currently 11 sites have coordinates, 27 do not
