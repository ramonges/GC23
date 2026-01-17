# 🛢️ Oil Scraper Setup - Fix RLS Policy

## ⚠️ Current Issue

The scraper can't insert data because of Row Level Security (RLS) policies.

---

## ✅ Solution: Add INSERT Policy

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**

### Step 2: Run This SQL

Copy and paste this into the SQL editor and click **Run**:

```sql
-- Allow inserts into commodity_locations table
CREATE POLICY "Service role can insert commodity locations" ON public.commodity_locations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can insert commodity locations" ON public.commodity_locations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

### Step 3: Run the Scraper

```bash
npm run scrape:oil
```

---

## 🎯 Expected Output

After fixing the RLS policy, you should see:

```
🚀 Oil Reserves Data Scraper
==================================================
🛢️  Starting oil reserves data import...

✅ Inserted: Ghawar Field (Saudi Aramco)
✅ Inserted: Permian Basin (Chevron/ExxonMobil/ConocoPhillips)
✅ Inserted: Burgan Field (Kuwait Oil Company)
✅ Inserted: Rumaila Field (BP/CNPC)
... (21 more fields)

📊 Import Summary:
   ✅ Successful: 25
   ❌ Errors: 0
   📝 Total: 25

✨ Script completed!
```

---

## 🌍 View Results

1. Go to http://localhost:3000/platform
2. Navigate to "Earth map"
3. You'll see **25 orange points** (oil fields) on the 3D globe!
4. Hover over any point to see details:
   - Field name
   - Operating company
   - Production volume
   - API gravity
   - Sulfur content

---

## 📋 Quick Reference SQL File

The SQL is also saved in: `FIX_RLS_FOR_SCRAPER.sql`

Just copy the contents and run in Supabase SQL Editor.

---

## 🔧 Alternative: Use Service Role Key (Advanced)

If you prefer not to change RLS policies, you can use the service role key:

1. Get your service role key from Supabase Settings > API
2. Add to `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

3. Update the scraper to use service role key instead of anon key

⚠️ **Warning**: Service role key bypasses RLS. Keep it secret!

---

## ✨ That's It!

Once you run the SQL, the scraper will work perfectly and populate your database with 25 major oil fields from around the world!
