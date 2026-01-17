# Quick Start Guide - Commodities Earth

Get your Commodities Earth platform up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed on your computer
- A Supabase account (free tier is fine)
- Terminal/Command Prompt access

## Quick Setup (5 Steps)

### 1️⃣ Install Dependencies (1 min)

```bash
npm install
```

### 2️⃣ Set Up Supabase (2 min)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the `supabase_schema.sql` file
3. Go to **Authentication** > **Users** and create a user:
   - Email: `raphou.monges83@gmail.com`
   - Password: `Azerty12`
   - ✅ Check "Auto Confirm User"

### 3️⃣ Configure Environment (30 sec)

1. Get your API keys from Supabase (**Settings** > **API**)
2. Update `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4️⃣ Start the Server (30 sec)

```bash
npm run dev
```

### 5️⃣ Test the Platform (1 min)

1. Open [http://localhost:3000](http://://localhost:3000)
2. Click **"Log In"**
3. Use the credentials:
   - Email: `raphou.monges83@gmail.com`
   - Password: `Azerty12`
4. Explore the platform! 🎉

## What You Get

✅ **Landing Page** with Earth visualization  
✅ **Authentication** system  
✅ **Demo Request** form with calendar  
✅ **Interactive Earth Map** with commodity filters  
✅ **Sample Data** for testing (7 locations)  

## Key Features to Test

### 1. Landing Page Features
- Responsive header with login and demo buttons
- Hero section with Earth gradient effect
- Value proposition sections
- Pricing information
- Footer with contact details

### 2. Demo Request System
- Go to `/request-demo` or click "Request a Demo"
- Fill in company and contact information
- Select a **weekday** date (Monday-Friday)
- Choose a time slot (9 AM - 7 PM, 30-min intervals)
- Submit and see confirmation

### 3. Platform Features
- **Login**: Use the credentials above
- **Sidebar**: Click the menu icon (☰) to navigate
- **Earth Map**: 
  - Select commodity category (Energy, Metals, etc.)
  - Choose specific commodity
  - Filter by company
  - Toggle storage facilities
  - Click "Search" to see markers
  - Click markers to view details

### 4. Profile Management
- Click "My Profile" in sidebar
- Edit first name and last name
- Change password
- Logout

## Sample Data Included

The database comes with sample data:

**Companies** (10):
- Trafigura, Glencore, Vitol, Mercuria, Total, Chevron, BP, Shell, Cargill, Olam

**Commodity Locations** (7):
1. Ghawar Oil Field (Saudi Arabia) - Crude Oil
2. Permian Basin (USA) - Crude Oil
3. Groningen Gas Field (Netherlands) - Natural Gas
4. Escondida Mine (Chile) - Copper
5. Grasberg Mine (Indonesia) - Copper
6. Muruntau Mine (Uzbekistan) - Gold
7. Rotterdam Port Storage (Netherlands) - Storage

## Testing the Map

1. Log in to the platform
2. Open the sidebar (click ☰)
3. Click "Earth Map"
4. Try these filters:
   - **Energy** → **Crude Oil** → Search (should show 2 locations)
   - **Metals** → **Copper** → Search (should show 2 locations)
   - Check **Storage Facilities** → Search (should show 1 location)

## Project Structure

```
GC23/
├── app/                    # Next.js 14 app directory
│   ├── page.tsx           # Landing page (/)
│   ├── platform/          # Protected platform (/platform)
│   └── request-demo/      # Demo request (/request-demo)
├── components/            # React components
│   ├── Header.tsx        # Landing page header
│   ├── Footer.tsx        # Landing page footer
│   ├── LoginModal.tsx    # Login popup
│   ├── PlatformSidebar.tsx  # Platform navigation
│   └── EarthMap.tsx      # Interactive map
├── lib/
│   └── supabase.ts       # Supabase client
├── supabase_schema.sql   # Database schema
└── .env.local            # Environment variables
```

## Common Issues & Solutions

### Issue: "npm install" fails
**Solution**: Make sure you have Node.js 18+ installed
```bash
node --version  # Should be 18 or higher
```

### Issue: Login doesn't work
**Solutions**:
1. Check the user exists in Supabase (Authentication > Users)
2. Verify email/password are correct
3. Restart dev server after changing `.env.local`

### Issue: Map is empty
**Solutions**:
1. Make sure you ran the SQL schema
2. Check browser console for errors
3. Verify you're logged in
4. Try different filter combinations

### Issue: Demo request fails
**Solutions**:
1. Select a weekday (Monday-Friday)
2. Check Supabase URL and key in `.env.local`
3. Verify `demo_requests` table exists

## Next Steps

### Add More Data

You can add more commodity locations via Supabase:

1. Go to **Table Editor** > **commodity_locations**
2. Click **Insert** > **Insert row**
3. Fill in the fields:
   - Title, owner, address
   - Commodity type and name
   - Latitude, longitude
   - Country, city
   - Location type
   - Supply/storage volumes

### Customize Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  'dark-blue': '#0A1628',      // Main background
  'brand-blue': '#1E3A5F',     // Secondary background
  'brand-green': '#10B981',    // Primary actions
  'light-green': '#34D399',    // Hover states
}
```

### Deploy to Production

1. Build the project: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred host
3. Add environment variables in your hosting platform
4. Update Supabase project settings if needed

## Resources

- 📖 **Detailed Setup**: See `SUPABASE_SETUP.md`
- 📋 **Full Documentation**: See `README.md`
- 🗺️ **Map Library**: [React-Leaflet Docs](https://react-leaflet.js.org/)
- 🔐 **Auth**: [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

## Support

Need help? Contact: **ram2315@columbia.edu**

---

**🎉 Congratulations!** You now have a professional commodities trading platform running!

Start by:
1. Adding more commodity location data
2. Inviting team members
3. Customizing the branding
4. Building out the other platform features (Options, Futures, Pricer)
