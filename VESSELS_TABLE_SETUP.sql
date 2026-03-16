-- ============================================================
-- VESSELS TABLE + RLS + INDEXES
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create vessel type enum-style check
CREATE TABLE IF NOT EXISTS public.vessels (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- AIS identity
  mmsi TEXT UNIQUE NOT NULL,
  imo_number TEXT,
  vessel_name TEXT,
  call_sign TEXT,
  flag_country TEXT,

  -- Classification
  ship_type INTEGER,
  ship_category TEXT CHECK (ship_category IN (
    'tanker', 'bulk_carrier', 'container', 'general_cargo',
    'lng_carrier', 'lpg_carrier', 'chemical_tanker', 'oil_tanker',
    'passenger', 'tug', 'fishing', 'military', 'other'
  )),
  size_category TEXT CHECK (size_category IN (
    'handysize', 'handymax', 'supramax', 'panamax', 'post_panamax',
    'capesize', 'vloc',
    'mr1', 'mr2', 'lr1', 'lr2', 'aframax', 'suezmax', 'vlcc', 'ulcc',
    'small', 'other'
  )),

  -- Dimensions
  dwt INTEGER,
  length_meters DECIMAL(8, 2),
  width_meters DECIMAL(8, 2),
  draught DECIMAL(5, 2),

  -- Current position (updated in real-time)
  latitude DECIMAL(10, 7),
  longitude DECIMAL(11, 7),
  speed_knots DECIMAL(5, 1),
  course DECIMAL(5, 1),
  heading INTEGER,
  navigation_status TEXT,

  -- Voyage info
  destination TEXT,
  eta TEXT,
  cargo_type TEXT,

  -- Timestamps
  last_position_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_vessels_mmsi ON public.vessels (mmsi);
CREATE INDEX IF NOT EXISTS idx_vessels_ship_category ON public.vessels (ship_category);
CREATE INDEX IF NOT EXISTS idx_vessels_size_category ON public.vessels (size_category);
CREATE INDEX IF NOT EXISTS idx_vessels_position ON public.vessels (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_vessels_last_update ON public.vessels (last_position_update DESC);

-- Spatial index for bounding box queries (lat/lng range lookups)
CREATE INDEX IF NOT EXISTS idx_vessels_lat ON public.vessels (latitude);
CREATE INDEX IF NOT EXISTS idx_vessels_lng ON public.vessels (longitude);

-- Enable Row Level Security
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Allow anonymous read access on vessels"
  ON public.vessels FOR SELECT
  USING (true);

-- Allow service role to insert/update (for the API route)
CREATE POLICY "Allow service role insert on vessels"
  ON public.vessels FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role update on vessels"
  ON public.vessels FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Function to auto-classify vessel size based on DWT
CREATE OR REPLACE FUNCTION classify_vessel_size()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.dwt IS NOT NULL THEN
    IF NEW.ship_category IN ('tanker', 'oil_tanker', 'chemical_tanker') THEN
      NEW.size_category := CASE
        WHEN NEW.dwt >= 320000 THEN 'ulcc'
        WHEN NEW.dwt >= 200000 THEN 'vlcc'
        WHEN NEW.dwt >= 120000 THEN 'suezmax'
        WHEN NEW.dwt >= 80000  THEN 'aframax'
        WHEN NEW.dwt >= 55000  THEN 'lr1'
        WHEN NEW.dwt >= 30000  THEN 'mr2'
        WHEN NEW.dwt >= 10000  THEN 'mr1'
        ELSE 'small'
      END;
    ELSIF NEW.ship_category = 'bulk_carrier' THEN
      NEW.size_category := CASE
        WHEN NEW.dwt >= 200000 THEN 'vloc'
        WHEN NEW.dwt >= 80000  THEN 'capesize'
        WHEN NEW.dwt >= 65000  THEN 'panamax'
        WHEN NEW.dwt >= 50000  THEN 'supramax'
        WHEN NEW.dwt >= 35000  THEN 'handymax'
        WHEN NEW.dwt >= 15000  THEN 'handysize'
        ELSE 'small'
      END;
    ELSIF NEW.ship_category = 'container' THEN
      NEW.size_category := CASE
        WHEN NEW.dwt >= 120000 THEN 'post_panamax'
        WHEN NEW.dwt >= 65000  THEN 'panamax'
        ELSE 'other'
      END;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_classify_vessel_size
  BEFORE INSERT OR UPDATE ON public.vessels
  FOR EACH ROW
  EXECUTE FUNCTION classify_vessel_size();

-- Function to auto-set ship_category from AIS ship_type code
CREATE OR REPLACE FUNCTION classify_ship_type()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ship_type IS NOT NULL AND NEW.ship_category IS NULL THEN
    NEW.ship_category := CASE
      WHEN NEW.ship_type BETWEEN 80 AND 89 THEN
        CASE
          WHEN NEW.ship_type = 80 THEN 'tanker'
          WHEN NEW.ship_type = 81 THEN 'chemical_tanker'
          WHEN NEW.ship_type = 82 THEN 'chemical_tanker'
          WHEN NEW.ship_type = 84 THEN 'oil_tanker'
          WHEN NEW.ship_type = 85 THEN 'oil_tanker'
          WHEN NEW.ship_type = 86 THEN 'lng_carrier'
          WHEN NEW.ship_type = 87 THEN 'lpg_carrier'
          ELSE 'tanker'
        END
      WHEN NEW.ship_type BETWEEN 70 AND 79 THEN
        CASE
          WHEN NEW.ship_type = 75 THEN 'bulk_carrier'
          WHEN NEW.ship_type = 76 THEN 'bulk_carrier'
          ELSE 'general_cargo'
        END
      WHEN NEW.ship_type BETWEEN 60 AND 69 THEN 'passenger'
      WHEN NEW.ship_type = 52 THEN 'tug'
      WHEN NEW.ship_type = 30 THEN 'fishing'
      WHEN NEW.ship_type = 35 THEN 'military'
      ELSE 'other'
    END;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_classify_ship_type
  BEFORE INSERT OR UPDATE ON public.vessels
  FOR EACH ROW
  EXECUTE FUNCTION classify_ship_type();

-- Cleanup: auto-delete vessels with no position update in 24 hours
-- (Run this as a Supabase cron job or pg_cron extension)
-- SELECT cron.schedule('cleanup-stale-vessels', '0 */6 * * *',
--   $$DELETE FROM public.vessels WHERE last_position_update < NOW() - INTERVAL '24 hours'$$
-- );
