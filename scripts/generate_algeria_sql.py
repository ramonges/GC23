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
    if 'sonatrach' in op_lower:
        return "'Sonatrach'"
    if 'cepsa' in op_lower:
        return "'Cepsa'"
    if 'eni' in op_lower and 'groupement' not in op_lower:
        return "'Eni'"
    if 'occidental' in op_lower or 'oxy' in op_lower or 'anadarko' in op_lower:
        return "'Occidental Petroleum'"
    if 'total' in op_lower:
        return "'TotalEnergies'"
    if 'repsol' in op_lower:
        return "'Repsol'"
    if 'bp' in op_lower and 'groupement' not in op_lower:
        return "'BP'"
    if 'pttep' in op_lower:
        return "'PTTEP'"
    if 'petrovietnam' in op_lower:
        return "'Petrovietnam'"
    if 'wintershall' in op_lower:
        return "'Wintershall Dea'"
    if 'groupement berkine' in op_lower:
        return "'Groupement Berkine'"
    if 'organisation ourhoud' in op_lower:
        return "'Organisation Ourhoud'"
    if 'groupement reggane' in op_lower or 'grn' in op_lower:
        return "'Groupement Reggane Nord'"
    if 'groupement isarene' in op_lower:
        return "'Groupement Isarene'"
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

# Read JSON file (use the one with coordinates if available)
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path_with_coords = os.path.join(script_dir, '../Algeria_all_sites_with_coordinates.json')
json_path_original = os.path.join(script_dir, '../../Countries data/Algeria_all_sites.json')

if os.path.exists(json_path_with_coords):
    json_path = json_path_with_coords
else:
    json_path = json_path_original

with open(json_path, 'r') as f:
    data = json.load(f)

sql_header = """-- ============================================
-- COMPLETE ALGERIA OIL FIELDS IMPORT (39 sites)
-- Generated from: Algeria_all_sites.json
-- Generated date: 2026-01-21 21:43:45
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
  
  IF operator_text ILIKE '%Sonatrach%' THEN
    RETURN 'Sonatrach';
  END IF;
  IF operator_text ILIKE '%Cepsa%' THEN
    RETURN 'Cepsa';
  END IF;
  IF operator_text ILIKE '%Eni%' AND operator_text NOT ILIKE '%Groupement%' THEN
    RETURN 'Eni';
  END IF;
  IF operator_text ILIKE '%Occidental%' OR operator_text ILIKE '%Oxy%' OR operator_text ILIKE '%Anadarko%' THEN
    RETURN 'Occidental Petroleum';
  END IF;
  IF operator_text ILIKE '%Total%' OR operator_text ILIKE '%TotalEnergies%' THEN
    RETURN 'TotalEnergies';
  END IF;
  IF operator_text ILIKE '%Repsol%' THEN
    RETURN 'Repsol';
  END IF;
  IF operator_text ILIKE '%BP%' AND operator_text NOT ILIKE '%Groupement%' THEN
    RETURN 'BP';
  END IF;
  IF operator_text ILIKE '%PTTEP%' THEN
    RETURN 'PTTEP';
  END IF;
  IF operator_text ILIKE '%Petrovietnam%' THEN
    RETURN 'Petrovietnam';
  END IF;
  IF operator_text ILIKE '%Wintershall%' THEN
    RETURN 'Wintershall Dea';
  END IF;
  IF operator_text ILIKE '%Groupement Berkine%' THEN
    RETURN 'Groupement Berkine';
  END IF;
  IF operator_text ILIKE '%Organisation Ourhoud%' THEN
    RETURN 'Organisation Ourhoud';
  END IF;
  IF operator_text ILIKE '%Groupement Reggane Nord%' OR operator_text ILIKE '%GRN%' THEN
    RETURN 'Groupement Reggane Nord';
  END IF;
  IF operator_text ILIKE '%Groupement Isarene%' THEN
    RETURN 'Groupement Isarene';
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Insert/update companies from operators
INSERT INTO public.companies (name, type, headquarters_country, commodities_traded)
VALUES
  ('Sonatrach', 'producer', 'Algeria', ARRAY['Crude Oil', 'Natural Gas']),
  ('Cepsa', 'producer', 'Spain', ARRAY['Crude Oil', 'Natural Gas']),
  ('Eni', 'producer', 'Italy', ARRAY['Crude Oil', 'Natural Gas']),
  ('Occidental Petroleum', 'producer', 'United States', ARRAY['Crude Oil', 'Natural Gas']),
  ('TotalEnergies', 'producer', 'France', ARRAY['Crude Oil', 'Natural Gas']),
  ('Repsol', 'producer', 'Spain', ARRAY['Crude Oil', 'Natural Gas']),
  ('BP', 'producer', 'United Kingdom', ARRAY['Crude Oil', 'Natural Gas']),
  ('PTTEP', 'producer', 'Thailand', ARRAY['Crude Oil', 'Natural Gas']),
  ('Petrovietnam', 'producer', 'Vietnam', ARRAY['Crude Oil', 'Natural Gas']),
  ('Wintershall Dea', 'producer', 'Germany', ARRAY['Crude Oil', 'Natural Gas']),
  ('Groupement Berkine', 'producer', 'Algeria', ARRAY['Crude Oil']),
  ('Organisation Ourhoud', 'producer', 'Algeria', ARRAY['Crude Oil']),
  ('Groupement Reggane Nord', 'producer', 'Algeria', ARRAY['Natural Gas']),
  ('Groupement Isarene', 'producer', 'Algeria', ARRAY['Natural Gas'])
ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;

-- Delete existing Algeria entries to avoid duplicates
DELETE FROM public.commodity_locations WHERE country = 'Algeria';

-- Insert all Algeria sites
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
  {escape_sql(f"{site['state_province']}, Algeria")},
  'Algeria',
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
  '{{"source": "Algeria_all_sites.json", "generated_date": "{data['generated_date']}"}}'::JSONB
)"""
    values.append(val)

sql_footer = """
ON CONFLICT (title, country, commodity_name) 
DO UPDATE SET
  owner = EXCLUDED.owner,
  address = EXCLUDED.address,
  region = EXCLUDED.region,
  latitude = COALESCE(EXCLUDED.latitude, commodity_locations.latitude),
  longitude = COALESCE(EXCLUDED.longitude, commodity_locations.longitude),
  location_type = EXCLUDED.location_type,
  operational_status = EXCLUDED.operational_status,
  operator = EXCLUDED.operator,
  ownership_type = EXCLUDED.ownership_type,
  ownership_details = EXCLUDED.ownership_details,
  production_monthly = EXCLUDED.production_monthly,
  production_yearly = EXCLUDED.production_yearly,
  production_unit = EXCLUDED.production_unit,
  current_production = EXCLUDED.current_production,
  reserves_estimate = EXCLUDED.reserves_estimate,
  reserves_unit = EXCLUDED.reserves_unit,
  start_date = EXCLUDED.start_date,
  closing_date = EXCLUDED.closing_date,
  api_gravity = EXCLUDED.api_gravity,
  quality_type = EXCLUDED.quality_type,
  quality_sulfur_content = EXCLUDED.quality_sulfur_content,
  grade = EXCLUDED.grade,
  last_transaction_value = EXCLUDED.last_transaction_value,
  last_transaction_currency = EXCLUDED.last_transaction_currency,
  last_transaction_date = EXCLUDED.last_transaction_date,
  contract_duration_years = EXCLUDED.contract_duration_years,
  pipelines = EXCLUDED.pipelines,
  ports = EXCLUDED.ports,
  rail_connections = EXCLUDED.rail_connections,
  company = EXCLUDED.company,
  additional_info = EXCLUDED.additional_info,
  updated_at = NOW();

-- Clean up helper functions
DROP FUNCTION IF EXISTS parse_site_date(TEXT);
DROP FUNCTION IF EXISTS extract_primary_company(TEXT);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_commodity_locations_start_date ON public.commodity_locations(start_date);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_production_yearly ON public.commodity_locations(production_yearly);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_operator ON public.commodity_locations(operator);
CREATE INDEX IF NOT EXISTS idx_commodity_locations_status ON public.commodity_locations(operational_status);

-- Update companies RLS policy for open access
DROP POLICY IF EXISTS "Authenticated users can read companies" ON public.companies;
CREATE POLICY "Anyone can read companies" ON public.companies
  FOR SELECT USING (true);

-- Verification query
SELECT COUNT(*) as total_algeria_sites, 
       COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as sites_with_coordinates,
       COUNT(CASE WHEN operational_status = 'active' THEN 1 END) as active_sites,
       COUNT(CASE WHEN operational_status != 'active' THEN 1 END) as inactive_sites
FROM public.commodity_locations 
WHERE country = 'Algeria';
"""

sql = sql_header + ',\n'.join(values) + ';' + sql_footer

# Write SQL file
output_path = os.path.join(script_dir, '../IMPORT_ALGERIA_OIL_FIELDS_COMPLETE.sql')
with open(output_path, 'w') as f:
    f.write(sql)

print(f'✅ Generated SQL file with {len(deduplicated_sites)} Algeria sites (deduplicated from {len(data["sites"])})')
print(f'📁 Output: {output_path}')
print('\nNext steps:')
print('1. Run the SQL file in your Supabase SQL Editor')
print('2. Refresh your platform to see all Algeria oil & gas fields on the globe')
