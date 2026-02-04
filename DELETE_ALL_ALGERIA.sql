-- ============================================
-- DELETE ALL ALGERIA ENTRIES
-- ============================================
-- Run this first, then run ALGERIA_OIL_FIELDS_SETUP.sql to re-insert all 38 sites

DELETE FROM public.commodity_locations WHERE country = 'Algeria';

-- Verification
SELECT COUNT(*) as deleted_count FROM public.commodity_locations WHERE country = 'Algeria';
-- Should return 0
