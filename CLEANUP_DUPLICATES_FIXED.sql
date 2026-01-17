-- =====================================================
-- CLEANUP DUPLICATES IN COMMODITY_LOCATIONS TABLE
-- (FIXED VERSION - Using correct column names)
-- =====================================================
-- This script removes duplicate entries, keeping only 
-- the first occurrence of each (title, country, commodity_name)
-- =====================================================

-- Step 1: Check how many duplicates exist
SELECT 
    'Total duplicate entries:' as info,
    COUNT(*) as count
FROM commodity_locations cl1
WHERE EXISTS (
    SELECT 1 
    FROM commodity_locations cl2 
    WHERE cl1.title = cl2.title 
    AND cl1.country = cl2.country 
    AND cl1.commodity_name = cl2.commodity_name
    AND cl1.id > cl2.id
);

-- Step 2: Show some examples of duplicates (top 20)
SELECT 
    title, 
    country, 
    commodity_name,
    COUNT(*) as duplicate_count
FROM commodity_locations
GROUP BY title, country, commodity_name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, title
LIMIT 20;

-- Step 3: DELETE DUPLICATES - Keeping only the FIRST occurrence
-- (Run this after reviewing the duplicates above)
DELETE FROM commodity_locations
WHERE id IN (
    SELECT cl1.id
    FROM commodity_locations cl1
    WHERE EXISTS (
        SELECT 1 
        FROM commodity_locations cl2 
        WHERE cl1.title = cl2.title 
        AND cl1.country = cl2.country 
        AND cl1.commodity_name = cl2.commodity_name
        AND cl1.id > cl2.id
    )
);

-- Step 4: Verify cleanup - should return 0
SELECT 
    'Remaining duplicate entries:' as info,
    COUNT(*) as count
FROM commodity_locations cl1
WHERE EXISTS (
    SELECT 1 
    FROM commodity_locations cl2 
    WHERE cl1.title = cl2.title 
    AND cl1.country = cl2.country 
    AND cl1.commodity_name = cl2.commodity_name
    AND cl1.id > cl2.id
);

-- Step 5: Show final count by commodity type
SELECT 
    commodity_type,
    commodity_name,
    COUNT(*) as total_locations
FROM commodity_locations
GROUP BY commodity_type, commodity_name
ORDER BY commodity_type, commodity_name;

-- Step 6: Show total count
SELECT COUNT(*) as total_unique_locations FROM commodity_locations;

-- Step 7: Add UNIQUE constraint to prevent future duplicates
-- (Uncomment after verifying the cleanup worked correctly)
-- ALTER TABLE commodity_locations 
-- ADD CONSTRAINT unique_commodity_location 
-- UNIQUE (title, country, commodity_name);
