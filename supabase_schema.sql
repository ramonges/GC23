-- ============================================
-- COMMODITIES EARTH - SUPABASE DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================
-- 2. DEMO REQUESTS TABLE
-- ============================================
CREATE TABLE public.demo_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT,
  demo_date DATE NOT NULL,
  demo_time TIME NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.demo_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can insert demo requests
CREATE POLICY "Anyone can insert demo requests" ON public.demo_requests
  FOR INSERT WITH CHECK (true);

-- Admin can read all demo requests (adjust based on your admin logic)
CREATE POLICY "Authenticated users can read demo requests" ON public.demo_requests
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 3. COMMODITY LOCATIONS TABLE (Main Table for Earth Map)
-- ============================================
CREATE TABLE public.commodity_locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  owner TEXT NOT NULL,
  address TEXT NOT NULL,
  contact TEXT,
  long_term_contract BOOLEAN DEFAULT false,
  contract_with TEXT,
  supply_volume DECIMAL(15, 2) DEFAULT 0,
  storage_volume DECIMAL(15, 2) DEFAULT 0,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  commodity_type TEXT NOT NULL CHECK (commodity_type IN ('Energy', 'Metals', 'Agricultural', 'Industrial', 'Livestock')),
  commodity_name TEXT NOT NULL,
  company TEXT,
  is_storage BOOLEAN DEFAULT false,
  location_type TEXT CHECK (location_type IN ('mine', 'oil_field', 'gas_field', 'storage', 'port', 'facility', 'farm', 'processing_plant')),
  country TEXT NOT NULL,
  region TEXT,
  city TEXT,
  -- Advanced filter fields
  api_gravity DECIMAL(5, 2), -- for crude oil
  sulfur_content DECIMAL(5, 2), -- for energy products (percentage)
  concentration_level DECIMAL(5, 2), -- for metals (percentage)
  grade TEXT, -- quality grade
  -- Additional metadata
  production_capacity DECIMAL(15, 2), -- annual capacity
  current_production DECIMAL(15, 2), -- current production
  reserves_estimate DECIMAL(15, 2), -- estimated reserves
  operational_status TEXT CHECK (operational_status IN ('operational', 'under_construction', 'planned', 'inactive', 'depleted')),
  operator TEXT, -- operating company
  ownership_type TEXT CHECK (ownership_type IN ('private', 'public', 'state_owned', 'joint_venture')),
  additional_info JSONB, -- flexible field for any additional data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.commodity_locations ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read all commodity locations
CREATE POLICY "Authenticated users can read commodity locations" ON public.commodity_locations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to insert commodity locations (for data scraping)
CREATE POLICY "Service role can insert commodity locations" ON public.commodity_locations
  FOR INSERT WITH CHECK (true);

-- Authenticated users can insert commodity locations
CREATE POLICY "Authenticated users can insert commodity locations" ON public.commodity_locations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create indexes for better query performance
CREATE INDEX idx_commodity_locations_type ON public.commodity_locations(commodity_type);
CREATE INDEX idx_commodity_locations_name ON public.commodity_locations(commodity_name);
CREATE INDEX idx_commodity_locations_company ON public.commodity_locations(company);
CREATE INDEX idx_commodity_locations_country ON public.commodity_locations(country);
CREATE INDEX idx_commodity_locations_coordinates ON public.commodity_locations(latitude, longitude);
CREATE INDEX idx_commodity_locations_storage ON public.commodity_locations(is_storage);

-- ============================================
-- 4. COMPANIES TABLE
-- ============================================
CREATE TABLE public.companies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('producer', 'trader', 'merchant', 'storage', 'transport', 'mixed')),
  headquarters_country TEXT,
  headquarters_address TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  description TEXT,
  commodities_traded TEXT[], -- array of commodities
  annual_revenue DECIMAL(15, 2),
  employees INTEGER,
  founded_year INTEGER,
  stock_ticker TEXT,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read companies
CREATE POLICY "Authenticated users can read companies" ON public.companies
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_companies_name ON public.companies(name);

-- ============================================
-- 5. STORAGE FACILITIES TABLE
-- ============================================
CREATE TABLE public.storage_facilities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  owner TEXT NOT NULL,
  operator TEXT,
  address TEXT NOT NULL,
  country TEXT NOT NULL,
  city TEXT NOT NULL,
  port_name TEXT, -- if located at a port
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  storage_type TEXT CHECK (storage_type IN ('tank', 'warehouse', 'silo', 'underground', 'floating', 'refrigerated')),
  total_capacity DECIMAL(15, 2) NOT NULL, -- in metric tonnes
  available_capacity DECIMAL(15, 2),
  commodities_stored TEXT[], -- array of commodities that can be stored
  ownership_type TEXT CHECK (ownership_type IN ('merchant', 'independent', 'port_authority', 'government')),
  facility_type TEXT CHECK (facility_type IN ('crude_oil', 'refined_products', 'lng', 'grain', 'metals', 'multi_commodity')),
  operational_status TEXT CHECK (operational_status IN ('operational', 'under_construction', 'planned', 'maintenance')),
  contact_email TEXT,
  contact_phone TEXT,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.storage_facilities ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read storage facilities
CREATE POLICY "Authenticated users can read storage" ON public.storage_facilities
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_storage_country ON public.storage_facilities(country);
CREATE INDEX idx_storage_type ON public.storage_facilities(storage_type);
CREATE INDEX idx_storage_coordinates ON public.storage_facilities(latitude, longitude);

-- ============================================
-- 6. MARITIME CARGO TABLE (Vessels/Ships)
-- ============================================
CREATE TABLE public.maritime_cargo (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vessel_name TEXT NOT NULL,
  imo_number TEXT UNIQUE, -- International Maritime Organization number
  vessel_type TEXT CHECK (vessel_type IN ('lng_carrier', 'crude_tanker', 'product_tanker', 'bulk_carrier', 'container_ship', 'chemical_tanker')),
  owner TEXT,
  operator TEXT,
  flag_country TEXT,
  dwt DECIMAL(10, 2), -- Deadweight tonnage
  capacity_cubic_meters DECIMAL(10, 2),
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  current_port TEXT,
  destination_port TEXT,
  cargo_commodity TEXT,
  cargo_volume DECIMAL(15, 2),
  departure_date DATE,
  estimated_arrival DATE,
  speed_knots DECIMAL(5, 2),
  status TEXT CHECK (status IN ('at_port', 'in_transit', 'anchored', 'maintenance')),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.maritime_cargo ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read maritime cargo data
CREATE POLICY "Authenticated users can read vessels" ON public.maritime_cargo
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_vessels_type ON public.maritime_cargo(vessel_type);
CREATE INDEX idx_vessels_status ON public.maritime_cargo(status);
CREATE INDEX idx_vessels_coordinates ON public.maritime_cargo(current_latitude, current_longitude);

-- ============================================
-- 7. PRODUCERS TABLE
-- ============================================
CREATE TABLE public.producers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  commodity_type TEXT NOT NULL,
  commodity_name TEXT NOT NULL,
  address TEXT NOT NULL,
  country TEXT NOT NULL,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  annual_production DECIMAL(15, 2), -- metric tonnes
  production_capacity DECIMAL(15, 2),
  main_customers TEXT[], -- array of customer companies
  has_long_term_contracts BOOLEAN DEFAULT false,
  contract_details JSONB, -- details about long-term contracts
  certifications TEXT[], -- quality/environmental certifications
  website TEXT,
  founded_year INTEGER,
  number_of_facilities INTEGER,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.producers ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read producers
CREATE POLICY "Authenticated users can read producers" ON public.producers
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_producers_commodity ON public.producers(commodity_type, commodity_name);
CREATE INDEX idx_producers_country ON public.producers(country);

-- ============================================
-- 8. CONTRACTS TABLE
-- ============================================
CREATE TABLE public.contracts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  contract_type TEXT CHECK (contract_type IN ('long_term_supply', 'spot', 'options', 'futures', 'swap')),
  commodity_type TEXT NOT NULL,
  commodity_name TEXT NOT NULL,
  seller_company TEXT NOT NULL,
  buyer_company TEXT NOT NULL,
  volume_metric_tonnes DECIMAL(15, 2),
  price_per_tonne DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  start_date DATE,
  end_date DATE,
  delivery_terms TEXT, -- e.g., FOB, CIF, etc.
  contract_status TEXT CHECK (contract_status IN ('active', 'completed', 'terminated', 'pending')),
  additional_terms JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read contracts
CREATE POLICY "Authenticated users can read contracts" ON public.contracts
  FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================
-- 9. RESERVES BY COUNTRY TABLE
-- ============================================
CREATE TABLE public.reserves_by_country (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  country TEXT NOT NULL,
  commodity_type TEXT NOT NULL,
  commodity_name TEXT NOT NULL,
  total_reserves DECIMAL(20, 2), -- metric tonnes
  proven_reserves DECIMAL(20, 2),
  probable_reserves DECIMAL(20, 2),
  annual_production DECIMAL(15, 2),
  reserve_to_production_ratio DECIMAL(10, 2), -- years
  last_updated DATE,
  source TEXT, -- data source
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.reserves_by_country ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read reserves data
CREATE POLICY "Authenticated users can read reserves" ON public.reserves_by_country
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_reserves_country ON public.reserves_by_country(country);
CREATE INDEX idx_reserves_commodity ON public.reserves_by_country(commodity_type, commodity_name);

-- ============================================
-- INSERT INITIAL DATA
-- ============================================

-- Insert some sample companies
INSERT INTO public.companies (name, type, headquarters_country, commodities_traded) VALUES
  ('Trafigura', 'trader', 'Singapore', ARRAY['Crude Oil', 'Natural Gas', 'Copper', 'Zinc']),
  ('Glencore', 'mixed', 'Switzerland', ARRAY['Coal', 'Copper', 'Zinc', 'Nickel', 'Cobalt']),
  ('Vitol', 'trader', 'Netherlands', ARRAY['Crude Oil', 'Natural Gas', 'Refined Products']),
  ('Mercuria', 'trader', 'Switzerland', ARRAY['Crude Oil', 'Natural Gas', 'Coal']),
  ('Total', 'producer', 'France', ARRAY['Crude Oil', 'Natural Gas']),
  ('Chevron', 'producer', 'United States', ARRAY['Crude Oil', 'Natural Gas']),
  ('BP', 'producer', 'United Kingdom', ARRAY['Crude Oil', 'Natural Gas']),
  ('Shell', 'producer', 'Netherlands', ARRAY['Crude Oil', 'Natural Gas', 'LNG']),
  ('Cargill', 'trader', 'United States', ARRAY['Wheat', 'Corn', 'Soybeans', 'Sugar']),
  ('Olam', 'trader', 'Singapore', ARRAY['Coffee', 'Cocoa', 'Rice', 'Cotton']);

-- Insert sample commodity locations (examples)
INSERT INTO public.commodity_locations (
  title, owner, address, contact, commodity_type, commodity_name, 
  latitude, longitude, country, city, location_type, operational_status, supply_volume
) VALUES
  -- Energy locations
  ('Ghawar Oil Field', 'Saudi Aramco', 'Eastern Province, Saudi Arabia', 'contact@aramco.com', 'Energy', 'Crude Oil', 25.4, 49.5, 'Saudi Arabia', 'Al Hasa', 'oil_field', 'operational', 5000000),
  ('Permian Basin', 'Multiple Operators', 'West Texas, USA', 'info@permian.com', 'Energy', 'Crude Oil', 31.9, -102.1, 'United States', 'Midland', 'oil_field', 'operational', 4500000),
  ('Groningen Gas Field', 'NAM (Shell/ExxonMobil)', 'Groningen, Netherlands', 'contact@nam.nl', 'Energy', 'Natural Gas', 53.2, 6.6, 'Netherlands', 'Groningen', 'gas_field', 'operational', 25000000),
  
  -- Metals locations
  ('Escondida Mine', 'BHP', 'Antofagasta Region, Chile', 'info@bhp.com', 'Metals', 'Copper', -24.2, -69.1, 'Chile', 'Antofagasta', 'mine', 'operational', 1200000),
  ('Grasberg Mine', 'Freeport-McMoRan', 'Papua, Indonesia', 'contact@fcx.com', 'Metals', 'Copper', -4.0, 137.1, 'Indonesia', 'Tembagapura', 'mine', 'operational', 600000),
  ('Muruntau Mine', 'Navoi Mining', 'Kyzylkum Desert, Uzbekistan', 'info@navoi.uz', 'Metals', 'Gold', 41.5, 64.5, 'Uzbekistan', 'Zarafshan', 'mine', 'operational', 60),
  
  -- Storage facilities
  ('Rotterdam Port Storage', 'Port of Rotterdam', 'Rotterdam, Netherlands', 'storage@portofrotterdam.com', 'Energy', 'Crude Oil', 51.9, 4.5, 'Netherlands', 'Rotterdam', 'storage', 'operational', 0);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_demo_requests_updated_at BEFORE UPDATE ON public.demo_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_commodity_locations_updated_at BEFORE UPDATE ON public.commodity_locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_storage_facilities_updated_at BEFORE UPDATE ON public.storage_facilities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_producers_updated_at BEFORE UPDATE ON public.producers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reserves_by_country_updated_at BEFORE UPDATE ON public.reserves_by_country FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FREIGHT ROUTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.freight_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_name TEXT NOT NULL,
  origin_port TEXT NOT NULL,
  origin_country TEXT NOT NULL,
  origin_latitude DECIMAL(10, 8) NOT NULL,
  origin_longitude DECIMAL(11, 8) NOT NULL,
  destination_port TEXT NOT NULL,
  destination_country TEXT NOT NULL,
  destination_latitude DECIMAL(10, 8) NOT NULL,
  destination_longitude DECIMAL(11, 8) NOT NULL,
  commodity_type TEXT NOT NULL,
  primary_commodities TEXT[],
  distance_km DECIMAL(10, 2),
  avg_duration_days INTEGER,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.freight_routes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read freight routes" ON public.freight_routes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_freight_routes_commodity ON public.freight_routes(commodity_type);
CREATE INDEX idx_freight_routes_origin ON public.freight_routes(origin_country);
CREATE INDEX idx_freight_routes_destination ON public.freight_routes(destination_country);

-- ============================================
-- CARGO SHIPMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cargo_shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_name TEXT NOT NULL,
  imo_number TEXT,
  mmsi TEXT,
  vessel_type TEXT NOT NULL,
  cargo_type TEXT,
  commodity_name TEXT NOT NULL,
  quantity_metric_tons DECIMAL(15, 2),
  shipper_company TEXT,
  receiver_company TEXT,
  loading_port TEXT NOT NULL,
  loading_date DATE,
  discharge_port TEXT NOT NULL,
  expected_discharge_date DATE,
  current_latitude DECIMAL(10, 8),
  current_longitude DECIMAL(11, 8),
  current_speed_knots DECIMAL(5, 2),
  shipment_status TEXT DEFAULT 'In Transit',
  last_position_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.cargo_shipments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read cargo shipments" ON public.cargo_shipments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE INDEX idx_cargo_shipments_status ON public.cargo_shipments(shipment_status);
CREATE INDEX idx_cargo_shipments_commodity ON public.cargo_shipments(commodity_name);
CREATE INDEX idx_cargo_shipments_coordinates ON public.cargo_shipments(current_latitude, current_longitude);

-- ============================================
-- NOTES FOR SETTING UP IN SUPABASE:
-- ============================================
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to the SQL Editor
-- 3. Copy and paste this entire SQL script
-- 4. Run the script
-- 5. To create the initial user (raphou.monges83@gmail.com), go to Authentication > Users
--    and manually create the user with password: Azerty12
-- 6. Update your .env.local file with your Supabase URL and anon key
