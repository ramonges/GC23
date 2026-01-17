# Duplicate Data Cleanup Guide

## What Happened?

The scraper script (`scripts/scrape-oil-data.ts`) contains **all commodity data in one large array**. Every time we ran the scraper to add a new commodity type (platinum, soybean, wheat, cotton, rice, sugar, cocoa, corn, coffee), it re-inserted **everything from the beginning**, creating duplicates.

### Import History:
- **Run 1** (Oil, Gas, Uranium, Coal, Gold, Silver, Copper, Steel, Lithium, Iron Ore): 871 entries
- **Run 2** (+ Platinum): Re-inserted all 871 + added 60 platinum = 931 total (**871 duplicates**)
- **Run 3** (+ Soybeans): Re-inserted all 931 + added 66 soybeans = **More duplicates**
- **Run 4-10**: Continued pattern...

By the final run, we had approximately **1,531 entries** but many are duplicates!

## Expected Final Count (No Duplicates):

**Energy (417):**
- 210 Oil fields
- 68 Natural Gas fields
- 48 Uranium mines
- 91 Coal mines

**Metals (511):**
- 87 Gold mines
- 58 Silver mines
- 87 Copper mines
- 79 Steel plants
- 58 Lithium mines
- 72 Iron Ore mines
- 57 Platinum mines

**Industrial (123):**
- 64 Silicon plants
- 59 Titanium mines

**Agricultural (480):**
- 66 Soybean farms
- 65 Wheat farms
- 63 Cotton farms
- 63 Rice farms
- 59 Sugar mills
- 56 Corn farms
- 52 Cocoa farms
- 56 Coffee farms

**Expected Total: ~1,531 unique locations**
**Actual in DB: Likely 5,000-10,000+ due to duplicates!**

## How to Fix It

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project: https://kimrrkqodnbfyzbzemhf.supabase.co
2. Go to **SQL Editor** in the left sidebar

### Step 2: Check for Duplicates
Copy and paste this query to see how many duplicates exist:

```sql
SELECT 
    'Total duplicate entries:' as info,
    COUNT(*) as count
FROM commodity_locations cl1
WHERE EXISTS (
    SELECT 1 
    FROM commodity_locations cl2 
    WHERE cl1.name = cl2.name 
    AND cl1.country = cl2.country 
    AND cl1.commodity_name = cl2.commodity_name
    AND cl1.id > cl2.id
);
```

### Step 3: View Example Duplicates
```sql
SELECT 
    name, 
    country, 
    commodity_name,
    COUNT(*) as duplicate_count
FROM commodity_locations
GROUP BY name, country, commodity_name
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 50;
```

### Step 4: Delete All Duplicates
**⚠️ IMPORTANT: This will keep only the FIRST occurrence of each location**

```sql
DELETE FROM commodity_locations
WHERE id IN (
    SELECT cl1.id
    FROM commodity_locations cl1
    WHERE EXISTS (
        SELECT 1 
        FROM commodity_locations cl2 
        WHERE cl1.name = cl2.name 
        AND cl1.country = cl2.country 
        AND cl1.commodity_name = cl2.commodity_name
        AND cl1.id > cl2.id
    )
);
```

### Step 5: Verify Cleanup
Run this to confirm all duplicates are removed:

```sql
SELECT 
    commodity_type,
    commodity_name,
    COUNT(*) as total_locations
FROM commodity_locations
GROUP BY commodity_type, commodity_name
ORDER BY commodity_type, commodity_name;
```

### Step 6: Add Unique Constraint (Optional but Recommended)
To prevent future duplicates:

```sql
ALTER TABLE commodity_locations 
ADD CONSTRAINT unique_commodity_location 
UNIQUE (name, country, commodity_name);
```

## Alternative: Use the Cleanup Script

You can run the entire cleanup process using the provided SQL file:

1. Open `CLEANUP_DUPLICATES.sql`
2. Copy all the contents
3. Paste into Supabase SQL Editor
4. Run each query step-by-step (recommended) or all at once

## Prevention for Future Scraping

To prevent this from happening again, we have two options:

### Option 1: Modify Scraper to Check for Existing Entries
Add a check before inserting:

```typescript
const { data: existing } = await supabase
  .from('commodity_locations')
  .select('id')
  .eq('name', transformedData.name)
  .eq('country', transformedData.country)
  .eq('commodity_name', transformedData.commodity_name)
  .single();

if (!existing) {
  // Only insert if doesn't exist
  await supabase.from('commodity_locations').insert(transformedData);
}
```

### Option 2: Add Unique Constraint (Recommended)
The database will automatically prevent duplicates:

```sql
ALTER TABLE commodity_locations 
ADD CONSTRAINT unique_commodity_location 
UNIQUE (name, country, commodity_name);
```

Then use `UPSERT` in the scraper:

```typescript
await supabase
  .from('commodity_locations')
  .upsert(transformedData, { 
    onConflict: 'name,country,commodity_name' 
  });
```

## Summary

1. **Check duplicates** in Supabase SQL Editor
2. **Run cleanup query** to delete duplicates
3. **Add unique constraint** to prevent future duplicates
4. **Verify** the final count matches expected ~1,531 locations

After cleanup, your map will load faster and show accurate data! 🎉
