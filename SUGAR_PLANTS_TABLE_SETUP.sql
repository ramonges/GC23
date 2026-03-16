-- ============================================================
-- Sugar Plants Table — Full schema + sync to commodity_locations
-- ============================================================
-- Run this in Supabase SQL Editor before inserting sugar mill data.
-- Sync trigger copies sugar_plants → commodity_locations (like coal_mines).
-- ============================================================

-- Ensure commodity_locations has unique constraint (required for sync)
CREATE UNIQUE INDEX IF NOT EXISTS idx_commodity_locations_title_country_commodity
  ON public.commodity_locations (title, country, commodity_name);

CREATE TABLE IF NOT EXISTS public.sugar_plants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- identification
  plant_id TEXT UNIQUE,
  mill_name TEXT NOT NULL,
  operator TEXT,

  -- location
  country TEXT NOT NULL,
  iso_code TEXT,
  region TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,

  -- product
  sugar_type TEXT DEFAULT 'sugarcane',
  primary_grade TEXT,
  grades_available TEXT,
  icumsa_range TEXT,

  -- production
  status TEXT CHECK (status IN ('operational', 'limited_operations', 'idle', 'closed', 'mothballed')),
  crushing_capacity_tcd INTEGER,
  annual_output_tonnes INTEGER,
  crushing_start TEXT,
  crushing_end TEXT,
  peak_months TEXT,
  storage_capacity_tonnes INTEGER,

  -- logistics
  export_terminal TEXT,
  distance_to_port_km INTEGER,
  rail_access BOOLEAN DEFAULT false,

  -- commercial
  price_benchmark TEXT,
  incoterms TEXT,
  typical_contract TEXT,
  major_buyers TEXT,
  export_markets TEXT,

  notes TEXT,
  additional_info JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unique constraint for upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_sugar_plants_mill_country
  ON public.sugar_plants (mill_name, country);

-- RLS
ALTER TABLE public.sugar_plants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read sugar_plants" ON public.sugar_plants;
CREATE POLICY "Anyone can read sugar_plants" ON public.sugar_plants
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role can manage sugar_plants" ON public.sugar_plants;
CREATE POLICY "Service role can manage sugar_plants" ON public.sugar_plants
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- Sync sugar_plants → commodity_locations (for Earth map / wizard)
-- ============================================================

CREATE OR REPLACE FUNCTION sync_sugar_plants_to_commodity_locations()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  op_status TEXT;
BEGIN
  -- Map status: operational/limited_operations → operational; idle/closed/mothballed → inactive
  op_status := CASE
    WHEN NEW.status IN ('operational', 'limited_operations') THEN 'operational'
    WHEN NEW.status IN ('idle', 'closed', 'mothballed') THEN 'inactive'
    ELSE 'operational'
  END;

  INSERT INTO public.commodity_locations (
    title, owner, address, commodity_type, commodity_name,
    latitude, longitude, country, region, city,
    location_type, operational_status, operator, company,
    grade, production_capacity, current_production, supply_volume,
    additional_info
  ) VALUES (
    NEW.mill_name,
    COALESCE(NEW.operator, 'Unknown'),
    COALESCE(NEW.region, NEW.country),
    'Agricultural',
    'Sugar',
    NEW.latitude,
    NEW.longitude,
    NEW.country,
    NEW.region,
    NULL,
    'processing_plant',
    op_status,
    NEW.operator,
    NEW.operator,
    NEW.primary_grade,
    NEW.crushing_capacity_tcd,
    NEW.annual_output_tonnes,
    NEW.annual_output_tonnes,
    jsonb_build_object(
      'sugar_plant_id', NEW.id,
      'plant_id', NEW.plant_id,
      'sugar_type', NEW.sugar_type,
      'grades_available', NEW.grades_available,
      'icumsa_range', NEW.icumsa_range,
      'export_terminal', NEW.export_terminal,
      'distance_to_port_km', NEW.distance_to_port_km,
      'rail_access', NEW.rail_access,
      'storage_capacity_tonnes', NEW.storage_capacity_tonnes,
      'price_benchmark', NEW.price_benchmark,
      'incoterms', NEW.incoterms,
      'crushing_start', NEW.crushing_start,
      'crushing_end', NEW.crushing_end
    ) || COALESCE(NEW.additional_info, '{}'::jsonb)
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
    supply_volume = EXCLUDED.supply_volume,
    operational_status = EXCLUDED.operational_status,
    additional_info = EXCLUDED.additional_info,
    updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_sugar_plants ON public.sugar_plants;
CREATE TRIGGER trg_sync_sugar_plants
  AFTER INSERT OR UPDATE ON public.sugar_plants
  FOR EACH ROW EXECUTE FUNCTION sync_sugar_plants_to_commodity_locations();
