# Maritime Tracking APIs - Free Options

## 🚢 Real-Time Ship Tracking APIs

### 1. **VesselFinder API** ⭐ RECOMMENDED
- **Website**: https://www.vesselfinder.com/vessel-positions-api
- **Real-time**: Yes (AIS data)
- **Free Tier**: Limited free access available
- **Data**: Vessel positions, speed, course, destination, type, IMO, MMSI
- **Filtering**: By vessel type (cargo, tanker, container, etc.)
- **Format**: JSON/XML

### 2. **MyShipTracking API**
- **Website**: https://api.myshiptracking.com
- **Real-time**: Yes (terrestrial AIS)
- **Free Tier**: Free API key with limits
- **Data**: Live positions, port calls, historical tracks
- **Filtering**: By IMO, fleet, vessel type
- **Format**: JSON

### 3. **Datalastic Maritime API**
- **Website**: https://datalastic.com/maritime-api
- **Real-time**: Yes (comprehensive AIS)
- **Free Tier**: Free trial available
- **Data**: Position, speed, destination, vessel details
- **Filtering**: By vessel type, name, country, flag
- **Format**: JSON

### 4. **MarineTraffic API** (Alternative)
- **Website**: https://www.marinetraffic.com/en/ais-api-services
- **Real-time**: Yes (most comprehensive)
- **Free Tier**: Limited (mostly paid)
- **Data**: Full AIS dataset
- **Filtering**: Extensive filters
- **Format**: JSON/XML

---

## 📊 Implementation Plan

### Step 1: Get API Key
1. Register at VesselFinder or MyShipTracking
2. Get free API key
3. Add to `.env.local`:
```
NEXT_PUBLIC_VESSEL_API_KEY=your_key_here
NEXT_PUBLIC_VESSEL_API_URL=https://api.vesselfinder.com/
```

### Step 2: API Integration
Create `/lib/vesselTracking.ts`:
```typescript
export async function fetchVesselPositions(filters?: {
  vesselType?: string
  region?: string
}) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_VESSEL_API_URL}/vessels?key=${process.env.NEXT_PUBLIC_VESSEL_API_KEY}&type=${filters?.vesselType || 'all'}`
  )
  return response.json()
}
```

### Step 3: Update Globe
- Fetch vessel data every 30-60 seconds
- Display as moving points on 3D Earth
- Different colors for different cargo types
- Hover to see vessel details

---

## 🛳️ Vessel Types to Track

### Cargo Ships
- **Container Ships** - Box containers
- **Bulk Carriers** - Coal, grain, ore
- **Tankers** - Oil, LNG, LPG, chemicals
- **General Cargo** - Mixed goods

### Commodity-Specific
- **Oil Tankers** - Crude oil, refined products
- **LNG Carriers** - Liquefied Natural Gas
- **Ore Carriers** - Iron ore, minerals
- **Grain Ships** - Agricultural commodities

---

## 🗺️ Major Shipping Routes

### Energy Routes
1. **Persian Gulf → Asia** (Oil)
2. **US Gulf Coast → Europe** (LNG)
3. **Russia → Europe** (Natural Gas)

### Metals Routes
1. **Australia → China** (Iron Ore)
2. **Chile → Asia** (Copper)
3. **South Africa → Global** (Various)

### Agricultural Routes
1. **Brazil → China** (Soybeans)
2. **US → Global** (Grain)
3. **Argentina → Europe** (Wheat)

---

## 💡 Features to Add

1. ✅ Real-time vessel positions on 3D globe
2. ✅ Filter by cargo type (oil, ore, grain, etc.)
3. ✅ Show vessel routes/tracks
4. ✅ Display vessel info on hover (name, flag, cargo, destination)
5. ✅ Show major shipping lanes
6. ✅ Historical position playback
7. ✅ Port arrival/departure notifications

---

## 🎨 Visual Design

### Vessel Markers
- **Oil Tankers**: Red dots 🔴
- **Container Ships**: Blue dots 🔵
- **Bulk Carriers**: Brown dots 🟤
- **LNG Carriers**: Purple dots 🟣
- **General Cargo**: Gray dots ⚪

### Routes
- Dashed lines connecting ports
- Animated movement along routes
- Color-coded by commodity type

---

## 📝 Next Steps

1. Choose API (VesselFinder recommended for free tier)
2. Register and get API key
3. Integrate API calls
4. Add vessel markers to Globe
5. Implement real-time updates
6. Add freight routes to database

---

Last updated: 2026-01-17
