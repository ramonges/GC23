# Oil Reserves Data Scraping Guide

## 🛢️ Overview

This guide explains how to use the automated data scraper to populate your database with global oil reserve information.

---

## 📊 Data Sources

### Included in Scraper (25 Major Oil Fields)

The scraper includes curated data from these sources:
- ✅ **EIA (U.S. Energy Information Administration)** - Public production data
- ✅ **OPEC Annual Statistical Bulletin** - Member country reserves
- ✅ **BP Statistical Review** - Global energy data
- ✅ **Company Reports** - Saudi Aramco, ExxonMobil, Chevron, BP, Shell
- ✅ **Rystad Energy** - Industry database (public data)

### Major Fields Included:

#### Middle East (World's Largest)
1. **Ghawar Field** (Saudi Arabia) - 3.8M bpd
2. **Safaniya Field** (Saudi Arabia) - 1.2M bpd
3. **Burgan Field** (Kuwait) - 1.7M bpd
4. **Rumaila Field** (Iraq) - 1.45M bpd
5. **West Qurna** (Iraq) - 865K bpd
6. **Zakum Field** (UAE) - 750K bpd
7. **Kirkuk Field** (Iraq) - 250K bpd

#### Americas
8. **Permian Basin** (USA) - 5.4M bpd
9. **Eagle Ford Shale** (USA) - 1.1M bpd
10. **Bakken Formation** (USA) - 1.2M bpd
11. **Lula Field** (Brazil) - 1.0M bpd
12. **Marlim Field** (Brazil) - 420K bpd

#### Russia & Eurasia
13. **Samotlor Field** (Russia) - 600K bpd
14. **Priobskoye Field** (Russia) - 760K bpd
15. **Tengiz Field** (Kazakhstan) - 700K bpd
16. **Kashagan Field** (Kazakhstan) - 390K bpd

#### Asia & Others
17. **Daqing Field** (China) - 640K bpd
18. **Bohai Bay** (China) - 450K bpd
19. **North Sea Fields** (UK/Norway) - Various
20. **Hassi Messaoud** (Algeria) - 400K bpd

---

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install cheerio tsx
# or
yarn add cheerio tsx
```

### 2. Configure Environment

Make sure your `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For live API scraping
EIA_API_KEY=your_eia_api_key
```

### 3. Run the Scraper

```bash
npm run scrape:oil
# or
npx tsx scripts/scrape-oil-data.ts
```

---

## 📋 Data Fields Scraped

For each oil field, the scraper collects:

| Field | Description | Example |
|-------|-------------|---------|
| **title** | Field name | "Ghawar Field" |
| **owner** | Operating company | "Saudi Aramco" |
| **address** | Location | "Al-Ahsa, Saudi Arabia" |
| **latitude** | GPS coordinate | 25.5 |
| **longitude** | GPS coordinate | 49.5 |
| **supply_volume** | Annual production (barrels) | 1,387,000,000 |
| **api_range** | API gravity | "32-34" |
| **sulfur_range** | Sulfur content | "1.8-2.1%" |
| **company** | Primary operator | "Saudi Aramco" |
| **commodity_type** | Category | "Energy" |
| **commodity_name** | Specific commodity | "Crude Oil" |

---

## 🌐 Additional Data Sources (To Expand)

### Free APIs:

#### 1. **EIA (Energy Information Administration)**
- **Website**: https://www.eia.gov/opendata/
- **Data**: U.S. oil production, imports, exports, reserves
- **API**: Free with registration
- **Coverage**: Comprehensive U.S. data

#### 2. **World Bank Open Data**
- **Website**: https://data.worldbank.org/
- **Data**: Country-level oil production, reserves
- **API**: Free, no key required
- **Coverage**: Global

#### 3. **OPEC Data**
- **Website**: https://www.opec.org/opec_web/en/data_graphs/40.htm
- **Data**: Member country production and reserves
- **Format**: Public data tables (scrapeable)
- **Coverage**: OPEC countries

#### 4. **IEA (International Energy Agency)**
- **Website**: https://www.iea.org/data-and-statistics
- **Data**: Global energy statistics
- **Format**: Some free data available
- **Coverage**: Global

### Commercial APIs (Paid):

#### 1. **Rystad Energy**
- **Website**: https://www.rystadenergy.com/
- **Data**: Detailed field-level production data
- **Coverage**: Global, very comprehensive
- **Cost**: Enterprise pricing

#### 2. **S&P Global Platts**
- **Website**: https://www.spglobal.com/platts
- **Data**: Real-time pricing and production
- **Coverage**: Global commodities
- **Cost**: Subscription-based

#### 3. **Wood Mackenzie**
- **Website**: https://www.woodmac.com/
- **Data**: Upstream oil & gas data
- **Coverage**: Global reserves and production
- **Cost**: Enterprise pricing

---

## 🤖 Expanding the Scraper

### Add More Oil Fields

Edit `scripts/scrape-oil-data.ts` and add to the `majorOilFields` array:

```typescript
{
  name: "New Field Name",
  country: "Country",
  operator: "Operating Company",
  latitude: 00.0,
  longitude: 00.0,
  production_bpd: 000000,
  api_gravity: "00-00",
  sulfur_content: "0.0%",
  type: "Conventional/Shale/Offshore"
}
```

### Scrape Live Websites

Example using Cheerio:

```typescript
async function scrapeWebsite(url: string) {
  const response = await fetch(url)
  const html = await response.text()
  const $ = cheerio.load(html)
  
  // Extract data
  const fieldName = $('.field-name').text()
  const production = $('.production').text()
  
  return { fieldName, production }
}
```

### Use Real-Time APIs

Example with EIA API:

```typescript
async function fetchEIAData(apiKey: string) {
  const url = `https://api.eia.gov/v2/petroleum/sum/sndw?api_key=${apiKey}`
  const response = await fetch(url)
  const data = await response.json()
  
  // Process and insert into database
  return data
}
```

---

## 📊 Output Example

When you run the scraper, you'll see:

```bash
🚀 Oil Reserves Data Scraper

==================================================
🛢️  Starting oil reserves data import...

✅ Inserted: Ghawar Field (Saudi Aramco)
✅ Inserted: Permian Basin (Chevron/ExxonMobil/ConocoPhillips)
✅ Inserted: Burgan Field (Kuwait Oil Company)
⏭️  Skipping Lula Field - already exists
✅ Inserted: Samotlor Field (Rosneft)

📊 Import Summary:
   ✅ Successful: 23
   ❌ Errors: 0
   📝 Total: 25

✨ Script completed!
```

---

## 🔒 Data Privacy & Legal

### ⚠️ Important Considerations:

1. **Public Data Only**: Our scraper uses publicly available data
2. **Respect robots.txt**: Check website scraping policies
3. **API Terms**: Follow API usage terms and rate limits
4. **Commercial Use**: Some data sources restrict commercial use
5. **Attribution**: Credit data sources appropriately

### Recommended Sources:
- ✅ Government databases (EIA, OPEC)
- ✅ Company annual reports (public filings)
- ✅ Academic publications
- ✅ Free APIs with commercial licenses

### Avoid:
- ❌ Scraping paywalled content
- ❌ Violating terms of service
- ❌ Exceeding rate limits
- ❌ Copying proprietary databases

---

## 🔄 Scheduling Updates

### Option 1: Cron Job (Linux/Mac)

```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/GC23 && npm run scrape:oil
```

### Option 2: GitHub Actions

Create `.github/workflows/scrape-oil-data.yml`:

```yaml
name: Scrape Oil Data
on:
  schedule:
    - cron: '0 2 * * *' # Daily at 2 AM
  workflow_dispatch: # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run scrape:oil
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_KEY }}
```

### Option 3: Vercel Cron (Serverless)

Create an API route `/api/cron/scrape-oil` and use Vercel Cron Jobs.

---

## 📝 Next Steps

1. ✅ Run the scraper: `npm run scrape:oil`
2. ✅ Check your database in Supabase
3. ✅ View data on the 3D Earth map
4. 🔄 Set up automated updates
5. 📈 Expand to other commodities (gas, metals, etc.)

---

## 🆘 Troubleshooting

### Error: "Supabase not configured"
- Check `.env.local` file exists
- Verify Supabase URL and key are correct
- Restart dev server

### Error: "Failed to insert"
- Check database table exists
- Verify RLS policies allow inserts
- Check for duplicate entries

### Slow Performance
- Increase delay between inserts
- Batch insert multiple records
- Use database transactions

---

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **EIA API**: https://www.eia.gov/opendata/
- **OPEC Data**: https://www.opec.org/
- **Cheerio Docs**: https://cheerio.js.org/
- **Node Fetch**: https://github.com/node-fetch/node-fetch

---

Last updated: 2026-01-17
