-- ============================================
-- REFINERIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.refineries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  operator TEXT,
  country TEXT NOT NULL,
  city TEXT,
  address TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  capacity_bpd DECIMAL(15, 2) NOT NULL, -- barrels per day
  crude_types_accepted TEXT[] NOT NULL CHECK (array_length(crude_types_accepted, 1) > 0), -- ['light', 'medium', 'extra_heavy']
  operational_status TEXT CHECK (operational_status IN ('operational', 'under_construction', 'planned', 'inactive', 'maintenance')) DEFAULT 'operational',
  contact_email TEXT,
  contact_phone TEXT,
  website TEXT,
  additional_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.refineries ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read refineries
CREATE POLICY "Authenticated users can read refineries" ON public.refineries
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to insert refineries (for data loading)
CREATE POLICY "Service role can insert refineries" ON public.refineries
  FOR INSERT WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX idx_refineries_country ON public.refineries(country);
CREATE INDEX idx_refineries_crude_types ON public.refineries USING GIN(crude_types_accepted);
CREATE INDEX idx_refineries_coordinates ON public.refineries(latitude, longitude);
CREATE INDEX idx_refineries_status ON public.refineries(operational_status);

-- Add trigger for updated_at
CREATE TRIGGER update_refineries_updated_at BEFORE UPDATE ON public.refineries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
