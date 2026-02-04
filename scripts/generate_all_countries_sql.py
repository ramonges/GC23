#!/usr/bin/env python3
"""
Generate SQL files for multiple countries: Benin, Brunei, Cameroon, Chad, China
"""
import json
import os
import re
from datetime import datetime

script_dir = os.path.dirname(os.path.abspath(__file__))

# Company extraction rules per country
COMPANY_RULES = {
    'Benin': {
        'rex': 'Rex International',
        'akrake': 'Rex International',
        'saga': 'Saga Petroleum',
        'addax': 'Addax Petroleum',
    },
    'Brunei': {
        'shell': 'Shell',
        'brunei shell': 'Shell',
        'bsp': 'Shell',
        'total': 'TotalEnergies',
        'hibiscus': 'Hibiscus Petroleum',
        'enquest': 'EnQuest',
    },
    'Cameroon': {
        'perenco': 'Perenco',
        'addax': 'Addax Petroleum',
        'total': 'TotalEnergies',
        'tower': 'Tower Resources',
        'new age': 'NewAge',
        'lukoil': 'Lukoil',
        'bowleven': 'Bowleven',
        'victoria': 'Victoria Oil & Gas',
        'sinopec': 'Sinopec',
        'glencore': 'Glencore',
    },
    'Chad': {
        'sht': 'SHT',
        'société des hydrocarbures': 'SHT',
        'exxon': 'ExxonMobil',
        'esso': 'ExxonMobil',
        'chevron': 'Chevron',
        'petronas': 'Petronas',
        'cnpc': 'CNPC',
        'cnodc': 'CNPC',
        'perenco': 'Perenco',
        'glencore': 'Glencore',
    },
    'China': {
        'cnpc': 'CNPC',
        'petrochina': 'CNPC',
        'sinopec': 'Sinopec',
        'cnooc': 'CNOOC',
        'conocophillips': 'ConocoPhillips',
        'chevron': 'Chevron',
        'shell': 'Shell',
        'genting': 'Genting',
    }
}

def extract_company(operator, country):
    if not operator or operator == 'unknown':
        return 'NULL'
    op_lower = operator.lower()
    rules = COMPANY_RULES.get(country, {})
    for pattern, company in rules.items():
        if pattern in op_lower:
            return f"'{company}'"
    return 'NULL'

def escape_sql(value):
    if value is None:
        return 'NULL'
    if isinstance(value, (int, float)):
        return str(value)
    escaped = str(value).replace("'", "''")
    return f"'{escaped}'"

def format_array(arr):
    if not arr:
        return "ARRAY[]::TEXT[]"
    items = [f"'{str(item).replace(chr(39), chr(39)+chr(39))}'" for item in arr]
    return f"ARRAY[{', '.join(items)}]"

def parse_date_sql(date_str):
    if not date_str or date_str == 'unknown' or date_str == 'NULL':
        return 'NULL'
    return f"parse_site_date({escape_sql(date_str)})"

def determine_commodity(site):
    quality = (site.get('quality_type') or '').lower()
    name = (site.get('site_name') or '').lower()
    if 'gas' in quality or 'gas' in name:
        if 'oil' in quality or 'condensate' in quality or 'oil' in name:
            return 'Oil & Gas'
        return 'Natural Gas'
    return 'Crude Oil'

def determine_location_type(site):
    quality = (site.get('quality_type') or '').lower()
    name = (site.get('site_name') or '').lower()
    if 'gas' in quality or 'gas' in name:
        if 'oil' in quality or 'condensate' in quality or 'oil' in name:
            return 'oil_and_gas_field'
        return 'gas_field'
    return 'oil_field'

def determine_status(site):
    status = (site.get('status') or 'active').lower()
    if status in ['active', 'producing', 'operational']:
        return 'active'
    elif status in ['closed', 'shut-in', 'abandoned', 'decommissioned']:
        return 'inactive'
    return 'active'

def generate_country_sql(country, json_path, output_path):
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    sites = data['sites']
    
    # Deduplicate by title+country
    seen = {}
    for site in sites:
        key = (site['site_name'], site.get('country', country))
        if key not in seen:
            seen[key] = site
        elif site.get('latitude') and not seen[key].get('latitude'):
            seen[key] = site
    
    sites = list(seen.values())
    
    # Collect unique ownership types
    ownership_types = set()
    for site in sites:
        ot = site.get('ownership_type')
        if ot:
            ownership_types.add(ot)
    
    # Collect unique companies
    companies = set()
    for site in sites:
        company = extract_company(site.get('operator'), country)
        if company != 'NULL':
            companies.add(company.strip("'"))
    
    # Generate SQL
    sql_parts = []
    
    sql_parts.append(f"""-- ============================================
-- {country.upper()} OIL & GAS FIELDS SETUP
-- Generated: {datetime.now().isoformat()}
-- Total sites: {len(sites)}
-- ============================================

-- ============================================
-- STEP 1: SCHEMA MODIFICATIONS
-- ============================================

-- Add new columns if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='operator') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN operator TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='ownership_type') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN ownership_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='ownership_details') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN ownership_details TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='production_monthly') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN production_monthly DECIMAL(20,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='production_yearly') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN production_yearly DECIMAL(20,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='production_unit') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN production_unit TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='start_date') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN start_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='closing_date') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN closing_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='estimated_reserves') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN estimated_reserves DECIMAL(20,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='reserves_unit') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN reserves_unit TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='api_gravity') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN api_gravity DECIMAL(5,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='quality_type') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN quality_type TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='quality_sulfur_content') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN quality_sulfur_content DECIMAL(5,3);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='grade') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN grade TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='last_transaction_value') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN last_transaction_value DECIMAL(20,2);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='last_transaction_currency') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN last_transaction_currency TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='last_transaction_date') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN last_transaction_date DATE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='contract_duration_years') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN contract_duration_years INTEGER;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='pipelines') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN pipelines TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='ports') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN ports TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='rail_connections') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN rail_connections TEXT[];
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='company') THEN
    ALTER TABLE public.commodity_locations ADD COLUMN company TEXT;
  END IF;
END $$;

-- Make latitude/longitude nullable
ALTER TABLE public.commodity_locations
  ALTER COLUMN latitude DROP NOT NULL,
  ALTER COLUMN longitude DROP NOT NULL;

-- ============================================
-- STEP 2: HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION parse_site_date(date_text TEXT) RETURNS DATE AS $$
BEGIN
  IF date_text IS NULL OR date_text = '' OR date_text = 'unknown' OR date_text ILIKE '%unknown%' THEN
    RETURN NULL;
  END IF;
  IF date_text ~ '^[0-9]{{4}}-[0-9]{{2}}-[0-9]{{2}}$' THEN
    RETURN date_text::DATE;
  END IF;
  IF date_text ~ '^[0-9]{{4}}-[0-9]{{2}}$' THEN
    RETURN (date_text || '-01')::DATE;
  END IF;
  IF date_text ~ '^[0-9]{{4}}$' THEN
    RETURN (date_text || '-01-01')::DATE;
  END IF;
  IF date_text ~ '^[0-9]{{4}}s$' THEN
    RETURN (SUBSTRING(date_text FROM 1 FOR 4) || '-01-01')::DATE;
  END IF;
  RETURN NULL;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- STEP 3: INSERT COMPANIES
-- ============================================
""")

    # Insert companies
    if companies:
        sql_parts.append(f"""
INSERT INTO public.companies (name, type, headquarters_country, commodities_traded)
VALUES""")
        company_values = []
        for comp in sorted(companies):
            hq = 'Unknown'
            if comp in ['Shell']: hq = 'United Kingdom'
            elif comp in ['TotalEnergies', 'Perenco']: hq = 'France'
            elif comp in ['ExxonMobil', 'Chevron', 'ConocoPhillips']: hq = 'United States'
            elif comp in ['CNPC', 'Sinopec', 'CNOOC']: hq = 'China'
            elif comp in ['Petronas']: hq = 'Malaysia'
            elif comp in ['Lukoil']: hq = 'Russia'
            elif comp in ['Glencore']: hq = 'Switzerland'
            elif comp in ['SHT']: hq = 'Chad'
            company_values.append(f"  ('{comp}', 'producer', '{hq}', ARRAY['Crude Oil', 'Natural Gas'])")
        sql_parts.append(',\n'.join(company_values))
        sql_parts.append("""
ON CONFLICT (name) DO UPDATE SET
  commodities_traded = EXCLUDED.commodities_traded;
""")

    # Delete existing country data
    sql_parts.append(f"""
-- ============================================
-- STEP 4: DELETE EXISTING {country.upper()} DATA
-- ============================================

DELETE FROM public.commodity_locations WHERE country = '{country}';

-- ============================================
-- STEP 5: INSERT {country.upper()} SITES
-- ============================================

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
  estimated_reserves,
  reserves_unit,
  start_date,
  closing_date,
  quality_type,
  api_gravity,
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
) VALUES""")

    # Generate VALUES for each site
    value_blocks = []
    for site in sites:
        site_country = site.get('country', country)
        # Fix country name variations - normalize to standard names
        if 'brunei' in site_country.lower():
            site_country = 'Brunei'
        elif 'china' in site_country.lower():
            site_country = 'China'
        
        lat = site.get('latitude')
        lng = site.get('longitude')
        
        commodity = determine_commodity(site)
        loc_type = determine_location_type(site)
        status = determine_status(site)
        company = extract_company(site.get('operator'), country)
        
        block = f"""(
  {escape_sql(site['site_name'])},
  {escape_sql(site.get('operator'))},
  {escape_sql(f"{site.get('state_province', '')}, {site_country}")},
  {escape_sql(site_country)},
  {escape_sql(site.get('state_province'))},
  {lat if lat else 'NULL'},
  {lng if lng else 'NULL'},
  'Energy',
  {escape_sql(commodity)},
  '{loc_type}',
  '{status}',
  {escape_sql(site.get('operator'))},
  {escape_sql(site.get('ownership_type'))},
  {escape_sql(site.get('ownership_details'))},
  {site.get('production_monthly') or 0},
  {site.get('production_yearly') or 0},
  {escape_sql(site.get('production_unit'))},
  {site.get('estimated_reserves') or 0},
  {escape_sql(site.get('reserves_unit'))},
  {parse_date_sql(site.get('start_date'))},
  {parse_date_sql(site.get('closing_date'))},
  {escape_sql(site.get('quality_type'))},
  {site.get('quality_api_gravity') if site.get('quality_api_gravity') else 'NULL'},
  {site.get('quality_sulfur_content') if site.get('quality_sulfur_content') else 'NULL'},
  {escape_sql(site.get('quality_grade_percent'))},
  {site.get('last_transaction_value') if site.get('last_transaction_value') else 'NULL'},
  {escape_sql(site.get('last_transaction_currency') or 'USD')},
  {parse_date_sql(site.get('last_transaction_date'))},
  {site.get('contract_duration_years') if site.get('contract_duration_years') else 'NULL'},
  {format_array(site.get('pipelines', []))},
  {format_array(site.get('ports', []))},
  {format_array(site.get('rail_connections', []))},
  {company},
  '{{"source": "{country}_all_sites.json", "generated_date": "{data.get("generated_date", "")}"}}' ::JSONB
)"""
        value_blocks.append(block)
    
    sql_parts.append(',\n'.join(value_blocks))
    sql_parts.append(';')
    
    # Add verification
    sql_parts.append(f"""

-- ============================================
-- STEP 6: VERIFICATION
-- ============================================

SELECT COUNT(*) as total_{country.lower()}_sites, 
       COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as sites_with_coordinates,
       COUNT(CASE WHEN operational_status = 'active' THEN 1 END) as active_sites,
       COUNT(CASE WHEN operational_status != 'active' THEN 1 END) as inactive_sites
FROM public.commodity_locations 
WHERE country = '{country}';
""")

    # Write SQL file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_parts))
    
    print(f"✅ Generated {output_path} with {len(sites)} sites")
    return len(sites), companies, ownership_types


# Generate SQL for each country
countries = [
    ('Benin', 'Benin_all_sites_with_coordinates.json'),
    ('Brunei', 'Brunei_all_sites_with_coordinates.json'),
    ('Cameroon', 'Cameroon_all_sites_with_coordinates.json'),
    ('Chad', 'Chad_all_sites_with_coordinates.json'),
    ('China', 'China_all_sites_with_coordinates.json'),
]

all_ownership_types = set()
all_companies = set()
total_sites = 0

for country, json_file in countries:
    json_path = os.path.join(script_dir, '..', json_file)
    output_path = os.path.join(script_dir, '..', f'{country.upper()}_OIL_FIELDS_SETUP.sql')
    
    sites, companies, ownership_types = generate_country_sql(country, json_path, output_path)
    total_sites += sites
    all_companies.update(companies)
    all_ownership_types.update(ownership_types)

print(f"\n📊 Total: {total_sites} sites across {len(countries)} countries")
print(f"🏢 Unique companies: {len(all_companies)}")
print(f"📋 Unique ownership types: {len(all_ownership_types)}")
