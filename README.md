# Commodities Earth

A professional platform for commodities traders, providing comprehensive data on world energy, metals, and agriculture producers.

## Features

### Landing Page
- Modern hero section with Earth visualization
- Value proposition sections
- Pricing information (€599/month)
- Call-to-action for traders

### Authentication
- Secure login system via Supabase
- Demo request form with calendar scheduling (30-min slots, 9 AM - 7 PM, Monday-Friday)

### Platform Features
- **Interactive Earth Map**: Dynamic world map with commodity location data
  - Filters by commodity category (Energy, Metals, Agricultural, Industrial, Livestock)
  - Company-specific asset filtering
  - Storage facility tracking
  - Advanced filters (API range, sulfur content, concentration levels)
  
- **Coming Soon**:
  - Commodities Options
  - Commodities Futures
  - Physical Trading Pricer

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Maps**: Leaflet, React-Leaflet
- **Backend**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor in your Supabase dashboard
3. Copy and paste the entire content of `supabase_schema.sql`
4. Run the SQL script to create all tables

### 3. Create Initial User

1. In Supabase Dashboard, go to **Authentication** > **Users**
2. Click **Add User**
3. Email: `raphou.monges83@gmail.com`
4. Password: `Azerty12`
5. Click **Create User**

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under **API**.

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses the following main tables:

### Core Tables
- **users**: User profiles and authentication data
- **demo_requests**: Demo scheduling requests with calendar slots
- **commodity_locations**: Main table for map markers (mines, oil fields, storage, etc.)
- **companies**: Trading companies and producers
- **storage_facilities**: Global storage facility data
- **maritime_cargo**: Vessel and cargo tracking
- **producers**: Producer database with contacts and contracts
- **contracts**: Long-term contract relationships
- **reserves_by_country**: National reserve data by commodity

### Key Features of commodity_locations Table
- Location type (mine, oil_field, gas_field, storage, port, facility, farm, processing_plant)
- Commodity categorization (Energy, Metals, Agricultural, Industrial, Livestock)
- Geographic data (latitude, longitude, country, region, city)
- Production data (capacity, current production, reserves)
- Advanced filters (API gravity, sulfur content, concentration levels)
- Contract information (long-term contracts, parties involved)
- Operational status tracking

## Color Scheme

- **Dark Blue**: `#0A1628` - Main background
- **Brand Blue**: `#1E3A5F` - Secondary background
- **Brand Green**: `#10B981` - Primary actions and accents
- **Light Green**: `#34D399` - Hover states

## Project Structure

```
GC23/
├── app/
│   ├── page.tsx              # Landing page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles
│   ├── platform/
│   │   └── page.tsx          # Main platform interface
│   └── request-demo/
│       └── page.tsx          # Demo request form
├── components/
│   ├── Header.tsx            # Landing page header
│   ├── Footer.tsx            # Landing page footer
│   ├── LoginModal.tsx        # Login popup modal
│   ├── PlatformSidebar.tsx   # Platform navigation sidebar
│   └── EarthMap.tsx          # Interactive map component
├── lib/
│   └── supabase.ts           # Supabase client
├── supabase_schema.sql       # Complete database schema
└── package.json
```

## Pages

### Landing Page (`/`)
- Header with login and demo request buttons
- Hero section with Earth visualization
- Added value section
- Pricing section
- Call-to-action for traders
- Footer with contact information

### Demo Request (`/request-demo`)
- Company and contact information form
- Calendar date picker (weekdays only)
- Time slot selector (30-minute intervals, 9 AM - 7 PM)
- Form submission to Supabase

### Platform (`/platform`)
- Requires authentication
- Sidebar navigation with icons
- Earth Map with advanced filtering
- Profile management
- Logout functionality

## Earth Map Filters

### Primary Filters
- **Commodity Category**: Energy, Metals, Agricultural, Industrial, Livestock
- **Specific Commodity**: Dropdown based on selected category
- **Company**: Filter by specific trading company or producer
- **Storage Facilities**: Toggle to show storage locations

### Advanced Filters
- **Energy**: API gravity range, Sulfur content percentage
- **Metals**: Concentration level percentage

## Contact Information

- **Email**: ram2315@columbia.edu
- **Address**: 116th Broadway, New York

## Future Enhancements

1. Real-time vessel tracking integration
2. Commodities Options trading interface
3. Commodities Futures market data
4. Physical Trading Pricer calculator
5. Advanced analytics and reporting
6. Mobile app version
7. API access for enterprise clients

## License

Proprietary - All Rights Reserved

## Support

For technical support or inquiries, contact: ram2315@columbia.edu
