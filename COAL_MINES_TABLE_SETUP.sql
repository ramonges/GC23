-- ============================================================
-- Coal Mines Table — Full column-by-column schema
-- ============================================================
-- Ensure commodity_locations has unique constraint (required for sync trigger):
CREATE UNIQUE INDEX IF NOT EXISTS idx_commodity_locations_title_country_commodity
  ON public.commodity_locations (title, country, commodity_name);
-- ============================================================
-- Matches the JSON structure: identification, location, history,
-- product, production, commercial, logistics, compliance
-- Run this in Supabase SQL Editor (Part 1: create table)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.coal_mines (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- identification
  mine_name TEXT NOT NULL,
  operator TEXT,
  license_number TEXT,
  contact_email TEXT,
  contact_phone TEXT,

  -- location
  country TEXT NOT NULL,
  region TEXT,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  nearest_port TEXT,
  nearest_railway TEXT,

  -- history
  founded_year INTEGER,
  years_in_operation INTEGER,
  original_owner TEXT,
  ownership_changes JSONB DEFAULT '[]'::jsonb,
  major_milestones JSONB DEFAULT '[]'::jsonb,
  notable_incidents JSONB DEFAULT '[]'::jsonb,
  estimated_mine_life_remaining_years INTEGER,

  -- product
  coal_type TEXT,
  grade TEXT,
  calorific_value_kcal_kg DECIMAL(10, 2),
  moisture_percent DECIMAL(5, 2),
  ash_percent DECIMAL(5, 2),
  sulfur_percent DECIMAL(5, 2),
  size_mm DECIMAL(10, 2),

  -- production
  annual_capacity_tonnes DECIMAL(15, 2),
  available_stock_tonnes DECIMAL(15, 2),
  mining_method TEXT,

  -- commercial
  price_per_tonne_usd DECIMAL(12, 2),
  price_basis TEXT,
  minimum_order_tonnes DECIMAL(15, 2),
  payment_terms TEXT,
  contract_types TEXT,

  -- logistics
  loading_port TEXT,
  transport_modes JSONB DEFAULT '[]'::jsonb,
  lead_time_days INTEGER,

  -- compliance
  export_license BOOLEAN DEFAULT false,
  certifications JSONB DEFAULT '[]'::jsonb,

  -- overflow (seams, reserves, risk notes, etc.)
  additional_info JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_coal_mines_name_country
  ON public.coal_mines (mine_name, country);

-- RLS
ALTER TABLE public.coal_mines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read coal_mines" ON public.coal_mines;
CREATE POLICY "Anyone can read coal_mines" ON public.coal_mines
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage coal_mines" ON public.coal_mines;
CREATE POLICY "Service role can manage coal_mines" ON public.coal_mines
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Sync coal_mines → commodity_locations (so they appear on the map)
-- ============================================================

CREATE OR REPLACE FUNCTION sync_coal_mines_to_commodity_locations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.commodity_locations (
    title, owner, address, commodity_type, commodity_name,
    latitude, longitude, country, region, city,
    location_type, operational_status, operator, company,
    ownership_type, grade, production_capacity, current_production,
    additional_info
  ) VALUES (
    NEW.mine_name,
    COALESCE(NEW.operator, NEW.original_owner, 'Unknown'),
    COALESCE(NEW.address, NEW.region || ', ' || NEW.country),
    'Energy',
    'Coal',
    NEW.latitude,
    NEW.longitude,
    NEW.country,
    NEW.region,
    NULL,
    'mine',
    'operational',
    NEW.operator,
    NEW.operator,
    'private',
    NEW.coal_type,
    NEW.annual_capacity_tonnes,
    NEW.annual_capacity_tonnes,
    jsonb_build_object(
      'coal_mine_id', NEW.id,
      'coal_type', NEW.coal_type,
      'grade', NEW.grade,
      'mining_method', NEW.mining_method,
      'calorific_value_kcal_kg', NEW.calorific_value_kcal_kg,
      'nearest_port', NEW.nearest_port,
      'loading_port', NEW.loading_port,
      'transport_modes', NEW.transport_modes
    )
  )
  ON CONFLICT (title, country, commodity_name) DO UPDATE SET
    owner = EXCLUDED.owner,
    address = EXCLUDED.address,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    region = EXCLUDED.region,
    operator = EXCLUDED.operator,
    company = EXCLUDED.company,
    grade = EXCLUDED.grade,
    production_capacity = EXCLUDED.production_capacity,
    current_production = EXCLUDED.current_production,
    additional_info = EXCLUDED.additional_info,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_coal_mines ON public.coal_mines;
CREATE TRIGGER trg_sync_coal_mines
  AFTER INSERT OR UPDATE ON public.coal_mines
  FOR EACH ROW EXECUTE FUNCTION sync_coal_mines_to_commodity_locations();
