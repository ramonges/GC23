# Data Scraping Scripts

## 🚀 Quick Start

### Run Oil Data Scraper

```bash
npm run scrape:oil
```

This will:
- ✅ Insert 25 major oil fields worldwide
- ✅ Include production data, API gravity, sulfur content
- ✅ Add GPS coordinates for 3D globe visualization
- ✅ Skip duplicates automatically

---

## 📊 What Gets Scraped

### Oil Fields Data:
- Field name and location
- Operating company
- Production volumes (barrels per day)
- API gravity range
- Sulfur content
- GPS coordinates
- Field type (Conventional/Shale/Offshore)

### Coverage:
- ✅ Middle East (9 fields)
- ✅ Americas (5 fields)
- ✅ Russia & Eurasia (4 fields)
- ✅ Asia (2 fields)
- ✅ Europe & Africa (5 fields)

Total: **25 major oil fields**

---

## 🛠️ Configuration

### Required Environment Variables

Create `.env.local` in root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional for live APIs
EIA_API_KEY=your_eia_api_key
```

---

## 📝 Usage Examples

### Basic Run
```bash
npm run scrape:oil
```

### View Output
The script shows progress in real-time:
```
🚀 Oil Reserves Data Scraper
==================================================
🛢️  Starting oil reserves data import...

✅ Inserted: Ghawar Field (Saudi Aramco)
✅ Inserted: Permian Basin (Chevron)
⏭️  Skipping Lula Field - already exists

📊 Import Summary:
   ✅ Successful: 23
   ❌ Errors: 0
   📝 Total: 25
```

---

## 🔄 Adding More Fields

Edit `scrape-oil-data.ts` and add to the `majorOilFields` array:

```typescript
{
  name: "Your Field Name",
  country: "Country",
  operator: "Operating Company",
  latitude: 00.00,
  longitude: 00.00,
  production_bpd: 500000,
  api_gravity: "30-35",
  sulfur_content: "1.5%",
  type: "Conventional"
}
```

Then run: `npm run scrape:oil`

---

## 📚 Data Sources

All data is from public sources:
- U.S. Energy Information Administration (EIA)
- OPEC Statistical Bulletins
- BP Statistical Review
- Company Annual Reports
- Academic Publications

---

## 🌍 View Results

After running the scraper:
1. Go to http://localhost:3000/platform
2. Click "Earth map"
3. See oil fields as orange points on 3D globe
4. Hover for details

---

See `DATA_SCRAPING_GUIDE.md` for full documentation.
