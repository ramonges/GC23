#!/usr/bin/env python3
import json
import os

def parse_date(date_str):
    if not date_str or date_str == 'unknown' or date_str == '':
        return 'NULL'
    if date_str == '1900-01-01':
        return 'NULL'
    if len(date_str) == 4 and date_str.isdigit():
        return f"parse_site_date('{date_str}')"
    return f"parse_site_date('{date_str}')"

def extract_company(operator):
    if not operator or operator == 'unknown':
        return 'NULL'
    op_lower = operator.lower()
    if 'chevron' in op_lower or 'cabgoc' in op_lower:
        return "'Chevron'"
    if 'total' in op_lower or 'totalenergies' in op_lower:
        return "'TotalEnergies'"
    if 'exxon' in op_lower or 'esso' in op_lower:
        return "'ExxonMobil'"
    if 'bp' in op_lower:
        return "'BP'"
    if 'pluspetrol' in op_lower:
        return "'Pluspetrol'"
    if 'sonangol' in op_lower:
        return "'Sonangol'"
    if 'cobalt' in op_lower:
        return "'Cobalt International Energy'"
    return 'NULL'

def determine_commodity(site):
    name = site['site_name'].lower()
    quality = site.get('quality_type', '').lower()
    if 'gas' in name and 'oil' not in name:
        return 'Natural Gas'
    if 'gas' in quality and 'oil' not in quality:
        return 'Natural Gas'
    return 'Crude Oil'

def determine_location_type(site):
    name = site['site_name'].lower()
    if 'gas' in name and 'oil' in name:
        return 'oil_and_gas_field'
    if 'gas' in name:
        return 'gas_field'
    return 'oil_field'

def escape_sql(s):
    if s is None:
        return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def format_array(arr):
    if not arr or len(arr) == 0:
        return 'ARRAY[]::TEXT[]'
    return 'ARRAY[' + ', '.join([escape_sql(item) for item in arr]) + ']'

# Read JSON file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, '../Angola_all_sites_with_coordinates.json')

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

sql_header = """-- ============================================
-- ANGOLA OIL FIELDS - TABLE MODIFICATION & DATA INSERT
-- Generated from: Angola_all_sites_with_coordinates.json
-- Generated date: 2026-02-01
-- All 50 sites now have coordinates!
-- ============================================

-- ============================================
-- STEP 1: MODIFY TABLE STRUCTURE (if not already done)
-- ============================================

-- Add new columns to support comprehensive oil field data (if not exists)
ALTER TABLE public.commodity_locations
  -- Production data
  ADD COLUMN IF NOT EXISTS production_monthly DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS production_yearly DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS production_unit TEXT,
  
  -- Dates
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS closing_date DATE,
  
  -- Ownership details
  ADD COLUMN IF NOT EXISTS ownership_details TEXT,
  
  -- Reserves unit
  ADD COLUMN IF NOT EXISTS reserves_unit TEXT,
  
  -- Quality specifications
  ADD COLUMN IF NOT EXISTS quality_type TEXT,
  ADD COLUMN IF NOT EXISTS quality_sulfur_content DECIMAL(5, 2),
  ADD COLUMN IF NOT EXISTS quality_grade_percent DECIMAL(5, 2),
  
  -- Transaction data
  ADD COLUMN IF NOT EXISTS last_transaction_value DECIMAL(15, 2),
  ADD COLUMN IF NOT EXISTS last_transaction_currency TEXT DEFAULT 'USD',
  ADD COLUMN IF NOT EXISTS last_transaction_date DATE,
  
  -- Contract information
  ADD COLUMN IF NOT EXISTS contract_duration_years INTEGER,
  
  -- Infrastructure arrays
  ADD COLUMN IF NOT EXISTS pipelines TEXT[],
  ADD COLUMN IF NOT EXISTS ports TEXT[],
  ADD COLUMN IF NOT EXISTS rail_connections TEXT[];

-- Update operational_status check constraint to include 'active' and 'closed'
ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_operational_status_check;

ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_operational_status_check 
  CHECK (operational_status IN ('operational', 'under_construction', 'planned', 'inactive', 'depleted', 'active', 'closed'));

-- Update ownership_type check constraint (allow all variations)
ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_ownership_type_check;

ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_ownership_type_check 
  CHECK (ownership_type IN (
    'private', 'public', 'state_owned', 'joint_venture', 
    'state-owned', 
    'JV', 
    'PSC', 
    'JV / PSC', 
    'JV/PSC',
    'PSC / JV',
    'PSC/JV',
    'PSC/JV (Block 14 Contractor Group)',
    'JV / PSC-style partnership',
    'JV / PSC-style partnership (Sonatrach majority, foreign minority)',
    'JV / PSC (historical)',
    'JV (Sonatrach with foreign partners)',
    'JV / PSC / Unitized (multi-block)',
    'Unitized JV / PSC',
    'Production Sharing-style partnership with Sonatrach (national company)',
    'JV / Production Sharing-style partnership with Sonatrach (national company)',
    'state-owned (project history includes terminated foreign LNG development contract)',
    'JV (concession / joint participation)',
    'JV (exploration block participants)',
    'JV concession (Block 0 Association)',
    'JV (Concession/Association)',
    'JV (Block 14 contractor group / PSA-style deepwater block; concessionaire Sonangol/ANPG framework)',
    'JV (Block 14 contractor group)',
    'JV (Block 17 contractor group; concessionaire Sonangol/ANPG)',
    'JV / PSC-like block partnership (Angola ANPG concessionaire framework)',
    'JV / PSC-like deepwater block partnership (Angola concessionaire framework)',
    'JV / concession (Block 14 contractor group)',
    'unknown'
  ));

-- Update location_type check constraint
ALTER TABLE public.commodity_locations
  DROP CONSTRAINT IF EXISTS commodity_locations_location_type_check;

ALTER TABLE public.commodity_locations
  ADD CONSTRAINT commodity_locations_location_type_check 
  CHECK (location_type IN ('mine', 'oil_field', 'gas_field', 'storage', 'port', 'facility', 'farm', 'processing_plant', 'oil_and_gas_field'));

-- Make latitude/longitude nullable (if not already)
ALTER TABLE public.commodity_locations
  ALTER COLUMN latitude DROP NOT NULL,
  ALTER COLUMN longitude DROP NOT NULL;

-- ============================================
-- STEP 2: HELPER FUNCTIONS
-- ============================================

-- Helper function to parse date strings
CREATE OR REPLACE FUNCTION parse_site_date(date_str TEXT)
RETURNS DATE AS $$
BEGIN
  IF date_str IS NULL OR date_str = 'unknown' OR date_str = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    RETURN date_str::DATE;
  EXCEPTION WHEN OTHERS THEN
    IF date_str ~ '^\\d{4}$' THEN
      RETURN (date_str || '-01-01')::DATE;
    END IF;
    IF date_str ~ '^\\d{4}-\\d{2}$' THEN
      RETURN (date_str || '-01')::DATE;
    END IF;
    -- Handle dates like "2009-11 (spud; exploration)"
    IF date_str ~ '^\\d{4}-\\d{2}' THEN
      RETURN (SUBSTRING(date_str FROM '^\\d{4}-\\d{2}') || '-01')::DATE;
    END IF;
    RETURN NULL;
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to extract primary company name from operator string
CREATE OR REPLACE FUNCTION extract_primary_company(operator_text TEXT)
RETURNS TEXT AS $$
BEGIN
  IF operator_text IS NULL OR operator_text = '' THEN
    RETURN NULL;
  END IF;
  
  IF operator_text ILIKE '%Chevron%' OR operator_text ILIKE '%CABGOC%' THEN
    RETURN 'Chevron';
  END IF;
  IF operator_text ILIKE '%Total%' OR operator_text ILIKE '%TotalEnergies%' THEN
    RETURN 'TotalEnergies';
  END IF;
  IF operator_text ILIKE '%Exxon%' OR operator_text ILIKE '%Esso%' THEN
    RETURN 'ExxonMobil';
  END IF;
  IF operator_text ILIKE '%BP%' THEN
    RETURN 'BP';
  END IF;
  IF operator_text ILIKE '%Pluspetrol%' THEN
    RETURN 'Pluspetrol';
  END IF;
  IF operator_text ILIKE '%Sonangol%' THEN
    RETURN 'Sonangol';
  END IF;
  IF operator_text ILIKE '%Cobalt%' THEN
    RETURN 'Cobalt International Energy';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert/update companies from operators
INSERT INTO public.companies (name, type, headquarters_country, commodities_traded)
VALUES
  ('Chevron', 'producer', 'United States', ARRAY['Crude Oil', 'Natural Gas']),
  ('TotalEnergies', 'producer', 'France', ARRAY['Crude Oil', 'Natural Gas']),
  ('ExxonMobil', 'producer', 'United States', ARRAY['Crude Oil', 'Natural Gas']),
  ('BP', 'producer', 'United Kingdom', ARRAY['Crude Oil', 'Natural Gas']),
  ('Pluspetrol', 'producer', 'Argentina', ARRAY['Crude Oil', 'Natural Gas']),
  ('Sonangol', 'producer', 'Angola', ARRAY['Crude Oil', 'Natural Gas']),
  ('Cobalt International Energy', 'producer', 'United States', ARRAY['Crude Oil', 'Natural Gas'])
ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;

-- Delete existing Angola entries to avoid duplicates
DELETE FROM public.commodity_locations WHERE country = 'Angola';

-- Insert all Angola sites
INSERT INTO public.commodity_locations (
  title,
  owner,
  address,
  country,
  region,
  latitude,
  longitude,
  commodity_type,
  commodity_name,
  location_type,
  operational_status,
  operator,
  ownership_type,
  ownership_details,
  production_monthly,
  production_yearly,
  production_unit,
  current_production,
  reserves_estimate,
  reserves_unit,
  start_date,
  closing_date,
  api_gravity,
  quality_type,
  quality_sulfur_content,
  grade,
  last_transaction_value,
  last_transaction_currency,
  last_transaction_date,
  contract_duration_years,
  pipelines,
  ports,
  rail_connections,
  company,
  additional_info
) VALUES
"""

# Deduplicate sites - keep the one with coordinates if duplicates exist
seen_sites = {}
deduplicated_sites = []

for site in data['sites']:
    key = (site['site_name'], site['country'], determine_commodity(site))
    if key not in seen_sites:
        seen_sites[key] = site
        deduplicated_sites.append(site)
    else:
        # If current site has coordinates and existing doesn't, replace it
        existing = seen_sites[key]
        if site.get('latitude') is not None and site.get('longitude') is not None:
            if existing.get('latitude') is None or existing.get('longitude') is None:
                # Replace with the one that has coordinates
                deduplicated_sites.remove(existing)
                deduplicated_sites.append(site)
                seen_sites[key] = site

print(f'📊 Deduplicated: {len(data["sites"])} -> {len(deduplicated_sites)} sites')

values = []
for i, site in enumerate(deduplicated_sites):
    commodity = determine_commodity(site)
    loc_type = determine_location_type(site)
    status = 'active' if site['status'] == 'active' else 'inactive'
    if site['status'] == 'closed':
        status = 'closed'
    company = extract_company(site.get('operator', ''))
    
    grade_val = 'NULL'
    if site.get('quality_type'):
        qt_lower = site['quality_type'].lower()
        if 'light' in qt_lower or 'sweet' in qt_lower:
            grade_val = escape_sql(site['quality_type'].split('(')[0].strip())
    
    lat = site.get('latitude') if site.get('latitude') is not None else 'NULL'
    lng = site.get('longitude') if site.get('longitude') is not None else 'NULL'
    
    val = f"""(
  {escape_sql(site['site_name'])},
  {escape_sql(site.get('operator', 'unknown'))},
  {escape_sql(f"{site['state_province']}, Angola")},
  'Angola',
  {escape_sql(site['state_province'])},
  {lat},
  {lng},
  'Energy',
  {escape_sql(commodity)},
  {escape_sql(loc_type)},
  {escape_sql(status)},
  {escape_sql(site.get('operator', 'unknown'))},
  {escape_sql(site['ownership_type'])},
  {escape_sql(site['ownership_details'])},
  {site.get('production_monthly', 0) or 0},
  {site.get('production_yearly', 0) or 0},
  {escape_sql(site.get('production_unit', ''))},
  {site.get('production_yearly', 0) or 0},
  {site.get('estimated_reserves', 0) or 0},
  {escape_sql(site.get('reserves_unit', ''))},
  {parse_date(site.get('start_date'))},
  {parse_date(site.get('closing_date'))},
  {site.get('quality_api_gravity') if site.get('quality_api_gravity') is not None else 'NULL'},
  {escape_sql(site.get('quality_type', ''))},
  {site.get('quality_sulfur_content') if site.get('quality_sulfur_content') is not None else 'NULL'},
  {grade_val},
  {site.get('last_transaction_value') if site.get('last_transaction_value') is not None else 'NULL'},
  {escape_sql(site.get('last_transaction_currency', 'USD'))},
  {parse_date(site.get('last_transaction_date'))},
  {site.get('contract_duration_years') if site.get('contract_duration_years') is not None else 'NULL'},
  {format_array(site.get('pipelines', []))},
  {format_array(site.get('ports', []))},
  {format_array(site.get('rail_connections', []))},
  {company},
  '{{"source": "Angola_all_sites.json", "generated_date": "{data['generated_date']}"}}'::JSONB
)"""
    values.append(val)

sql_footer = """
;

-- Clean up helper functions
DROP FUNCTION IF EXISTS parse_site_date(TEXT);
DROP FUNCTION IF EXISTS extract_primary_company(TEXT);

-- Create indexes for better query performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_commodity_locations_start_date ON public.commodity_locations(start_date);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_production_yearly ON public.commodity_locations(production_yearly);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_operator ON public.commodity_locations(operator);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_status ON public.commodity_locations(operational_status);

-- Update companies RLS policy for open access
DROP POLICY IF EXISTS "Authenticated users can read companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can read companies" ON public.companies;
CREATE POLICY "Anyone can read companies" ON public.companies
  FOR SELECT USING (true);

-- Verification query
SELECT COUNT(*) as total_angola_sites, 
       COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as sites_with_coordinates,
       COUNT(CASE WHEN operational_status = 'active' THEN 1 END) as active_sites,
       COUNT(CASE WHEN operational_status != 'active' THEN 1 END) as inactive_sites
FROM public.commodity_locations 
WHERE country = 'Angola';
"""

# Ensure ON CONFLICT is on the same line or directly after VALUES
sql = sql_header + ',\n'.join(values) + '\n' + sql_footer.strip()

# Write SQL file
output_path = os.path.join(script_dir, '../ANGOLA_OIL_FIELDS_SETUP.sql')
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(sql)

print(f'✅ Generated SQL file with {len(deduplicated_sites)} Angola sites (deduplicated from {len(data["sites"])})')
print(f'📁 Output: {output_path}')
print('\nNext steps:')
print('1. Run the SQL file in your Supabase SQL Editor')
print('2. Refresh your platform to see all Angola oil & gas fields on the globe')
