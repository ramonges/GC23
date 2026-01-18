# Refineries Integration Guide

This document explains how to integrate refineries data into the platform.

## Database Setup

1. Run the SQL migration to create the refineries table:
   ```sql
   -- Execute ADD_REFINERIES_TABLE.sql in your Supabase SQL Editor
   ```

## Importing Refineries

1. Make sure you have your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

2. Run the import script:
   ```bash
   npm run import:refineries
   ```

The script will:
- Parse all refinery data from the provided list
- Remove duplicates
- Categorize refineries by crude type acceptance:
  - **Light only**: Can only process light crude
  - **Medium**: Can process light and medium crude
  - **Extra Heavy**: Can process light, medium, and extra heavy crude
- Geocode locations (using city/country coordinates)
- Insert into the `refineries` table

## Using Refineries in the UI

1. **Enable Refineries Display**: Check the "Refineries" checkbox in the filter panel
2. **Filter by Crude Type**: Use the refinery filter section to show only refineries that accept specific crude types:
   - Light Crude (green)
   - Medium Crude (orange)
   - Extra Heavy Crude (red)

## Refinery Display

Refineries are displayed on the 3D globe with:
- **Color coding**:
  - Green: Light crude only
  - Orange: Medium crude (can also process light)
  - Red: Extra heavy crude (can process all types)
- **Larger markers** than commodity points for visibility
- **Detailed tooltips** showing:
  - Refinery name
  - Operator
  - Location (city, country)
  - Capacity (barrels per day)
  - Crude types accepted

## Data Structure

Each refinery has:
- `name`: Refinery name
- `operator`: Operating company
- `country`: Country location
- `city`: City location
- `latitude` / `longitude`: Coordinates
- `capacity_bpd`: Capacity in barrels per day
- `crude_types_accepted`: Array of accepted types (`['light']`, `['light', 'medium']`, or `['light', 'medium', 'extra_heavy']`)
- `operational_status`: Current status (default: 'operational')

## Notes

- Refineries that can process extra heavy crude are also marked as able to process medium and light crude
- Duplicate refineries (same name, different operators) are handled by appending operator name to the name
- Coordinates are approximated based on city/country data - for precise locations, update coordinates manually in the database
