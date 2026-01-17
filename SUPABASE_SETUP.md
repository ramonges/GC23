# Supabase Setup Guide for Commodities Earth

This guide will walk you through setting up the Supabase backend for the Commodities Earth platform.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: Commodities Earth
   - **Database Password**: Choose a strong password (save it securely)
   - **Region**: Select the region closest to your users
5. Click **"Create new project"**
6. Wait for the project to be provisioned (takes 1-2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, navigate to **SQL Editor** (in the left sidebar)
2. Click **"New Query"**
3. Open the file `supabase_schema.sql` from your project
4. Copy the entire content
5. Paste it into the SQL Editor
6. Click **"Run"** or press `Ctrl+Enter` (Windows/Linux) or `Cmd+Enter` (Mac)
7. Wait for the script to complete (you should see "Success" message)

This will create:
- ✅ All database tables
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Sample data for companies and commodity locations
- ✅ Triggers for automatic timestamp updates

## Step 3: Create the Initial User

### Option A: Using Supabase Dashboard (Recommended)

1. Navigate to **Authentication** > **Users** (in the left sidebar)
2. Click **"Add user"** button
3. Select **"Create new user"**
4. Fill in:
   - **Email**: `raphou.monges83@gmail.com`
   - **Password**: `Azerty12`
   - **Auto Confirm User**: ✅ Check this box
5. Click **"Create user"**

### Option B: Using SQL

Alternatively, you can create the user via SQL:

```sql
-- This will be done automatically when the user signs up,
-- but you can also create it manually:
-- Note: Supabase handles password hashing automatically through the dashboard
```

## Step 4: Get Your API Keys

1. In your Supabase dashboard, navigate to **Settings** > **API**
2. You'll find two important values:

   - **Project URL**: Something like `https://abcdefghijk.supabase.co`
   - **Anon/Public Key**: A long string starting with `eyJ...`

3. Copy both of these values

## Step 5: Configure Environment Variables

1. Open your project in your code editor
2. Find the `.env.local` file (or create it if it doesn't exist)
3. Update it with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. Save the file

## Step 6: Verify the Setup

### Test Authentication

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click **"Log In"** button
4. Enter:
   - Email: `raphou.monges83@gmail.com`
   - Password: `Azerty12`
5. Click **"Log In"**
6. You should be redirected to `/platform`

### Test Demo Requests

1. Go to `http://localhost:3000/request-demo`
2. Fill out the form with test data
3. Select a date and time
4. Submit the form
5. Check your Supabase dashboard:
   - Navigate to **Table Editor** > **demo_requests**
   - You should see your test entry

### Test Earth Map

1. Log in to the platform
2. Click the menu icon (☰) to open the sidebar
3. Click **"Earth Map"**
4. The map should load with the sample data
5. Try the filters to see the sample commodity locations

## Database Tables Overview

### Users Table (`users`)
- Stores user profile information
- Linked to Supabase Auth

### Demo Requests Table (`demo_requests`)
- Stores demo scheduling requests
- Fields: company, name, phone, email, date, time

### Commodity Locations Table (`commodity_locations`)
- **Main table for the Earth Map**
- Contains all mine, oil field, storage, and facility data
- Fields include:
  - Title, owner, address, contact
  - Commodity type and name
  - Latitude, longitude, country
  - Supply/storage volumes
  - Long-term contract information
  - Advanced filter fields (API, sulfur, concentration)

### Companies Table (`companies`)
- List of trading companies and producers
- Pre-populated with: Trafigura, Glencore, Vitol, Mercuria, Total, Chevron, BP, Shell, Cargill, Olam

### Storage Facilities Table (`storage_facilities`)
- Dedicated table for storage locations
- Includes capacity, type, and ownership information

### Maritime Cargo Table (`maritime_cargo`)
- Vessel tracking data
- IMO numbers, vessel types, current positions
- Cargo information and routes

### Producers Table (`producers`)
- Producer database with contacts
- Production volumes and capacities
- Long-term contract information

### Contracts Table (`contracts`)
- Long-term contract relationships
- Buyer-seller information
- Volumes, prices, delivery terms

### Reserves by Country Table (`reserves_by_country`)
- National reserve data
- Proven and probable reserves
- Production rates

## Adding Sample Data

The schema includes some sample data to get you started. To add more data:

### Adding Commodity Locations

```sql
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name,
  latitude, longitude, country, city, location_type, operational_status, supply_volume
) VALUES (
  'Your Location Name',
  'Owner Company',
  'Full Address',
  'contact@email.com',
  'Energy', -- or 'Metals', 'Agricultural', 'Industrial', 'Livestock'
  'Crude Oil', -- specific commodity
  40.7128, -- latitude
  -74.0060, -- longitude
  'United States',
  'New York',
  'oil_field', -- or 'mine', 'storage', 'port', etc.
  'operational',
  1000000 -- supply volume in metric tonnes
);
```

### Adding Storage Facilities

```sql
INSERT INTO public.storage_facilities (
  name, owner, address, country, city, latitude, longitude,
  storage_type, total_capacity, commodities_stored, ownership_type
) VALUES (
  'Storage Facility Name',
  'Owner Company',
  'Full Address',
  'United States',
  'Houston',
  29.7604,
  -95.3698,
  'tank',
  5000000, -- capacity in metric tonnes
  ARRAY['Crude Oil', 'Refined Products'],
  'independent'
);
```

## Row Level Security (RLS)

The database is configured with Row Level Security for data protection:

- **Public access**: Anyone can submit demo requests
- **Authenticated access**: Logged-in users can:
  - Read commodity locations
  - Read company information
  - Read storage facilities
  - Read vessel data
  - Access their own profile
  - Update their own profile

## Troubleshooting

### "Failed to login" Error
- Check that the user exists in Authentication > Users
- Verify the email and password are correct
- Make sure "Auto Confirm User" was checked

### "Failed to submit request" Error
- Check your Supabase URL and Anon Key in `.env.local`
- Verify the `demo_requests` table exists
- Check browser console for detailed error messages

### Map Not Loading Data
- Verify you're logged in
- Check that `commodity_locations` table has data
- Open browser console and check for errors
- Verify your Supabase credentials are correct

### Connection Issues
- Ensure `.env.local` is in the root directory
- Restart your development server after changing env variables
- Check that your Supabase project is active (not paused)

## Next Steps

1. ✅ Add more commodity location data
2. ✅ Add storage facility data
3. ✅ Configure maritime cargo tracking
4. ✅ Add producer information
5. ✅ Set up contract data
6. ✅ Populate reserves by country

## Support

For Supabase-specific issues:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)

For Commodities Earth platform issues:
- Contact: ram2315@columbia.edu
