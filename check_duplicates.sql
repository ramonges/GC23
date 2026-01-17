-- Check for duplicate commodity locations by name and country
SELECT 
    name, 
    country, 
    commodity_name,
    COUNT(*) as duplicate_count
FROM commodity_locations
GROUP BY name, country, commodity_name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC, name
LIMIT 50;
