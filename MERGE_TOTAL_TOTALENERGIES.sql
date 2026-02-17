-- ============================================
-- MERGE Total → TotalEnergies
-- ============================================
-- Total and TotalEnergies are the same company (Total rebranded to TotalEnergies).
-- Run this in Supabase SQL Editor to consolidate.

-- 1. Update commodity_locations
UPDATE commodity_locations 
SET company = 'TotalEnergies' 
WHERE company = 'Total';

-- 2. If you have a companies table, merge/update there too
-- (Delete 'Total' if it exists, keep 'TotalEnergies')
DELETE FROM companies WHERE name = 'Total';
