#!/usr/bin/env python3
"""
Extract all oil fields from scrape-oil-data.ts and generate SQL for Supabase
"""

import re
import json

# Read the scrape-oil-data.ts file
with open('/Users/b23/Desktop/GC23/GC23/scripts/scrape-oil-data.ts', 'r') as f:
    content = f.read()

# Extract the majorOilFields array
# Find the start of the array
start_match = re.search(r'const majorOilFields = \[', content)
if not start_match:
    print("Could not find majorOilFields array")
    exit(1)

start_pos = start_match.end()

# Find matching closing bracket
bracket_count = 1
pos = start_pos
while bracket_count > 0 and pos < len(content):
    if content[pos] == '[':
        bracket_count += 1
    elif content[pos] == ']':
        bracket_count -= 1
    pos += 1

array_content = content[start_pos:pos-1]

# Parse the JavaScript object array
# Convert JS object syntax to JSON
# Replace unquoted keys with quoted keys
js_objects = []

# Split by objects (each starts with {)
object_pattern = re.compile(r'\{([^{}]+)\}', re.DOTALL)
matches = object_pattern.findall(array_content)

print(f"Found {len(matches)} oil field entries")

def parse_value(val):
    """Parse a JavaScript value to Python"""
    val = val.strip()
    if val.startswith('"') and val.endswith('"'):
        return val[1:-1]
    if val.startswith("'") and val.endswith("'"):
        return val[1:-1]
    if val.lower() == 'true':
        return True
    if val.lower() == 'false':
        return False
    if val.lower() == 'null':
        return None
    try:
        if '.' in val:
            return float(val)
        return int(val)
    except:
        return val

def parse_api_gravity(val):
    """Parse API gravity string to decimal"""
    if val is None:
        return None
    val = str(val).strip()
    # Handle ranges like "32-34"
    if '-' in val and not val.startswith('-'):
        parts = val.split('-')
        try:
            return (float(parts[0]) + float(parts[1])) / 2
        except:
            pass
    # Handle single values
    try:
        return float(val.replace('"', '').replace("'", ''))
    except:
        return None

def parse_sulfur_content(val):
    """Parse sulfur content string to decimal percentage"""
    if val is None:
        return None
    val = str(val).strip().replace('%', '')
    # Handle ranges like "1.8-2.1"
    if '-' in val and not val.startswith('-'):
        parts = val.split('-')
        try:
            return (float(parts[0]) + float(parts[1])) / 2
        except:
            pass
    # Handle single values
    try:
        return float(val.replace('"', '').replace("'", ''))
    except:
        return None

def map_location_type(type_str):
    """Map source type to valid location_type"""
    if type_str is None:
        return 'oil_field'
    type_lower = str(type_str).lower()
    
    # Energy - Oil
    if 'shale' in type_lower or 'offshore' in type_lower or 'conventional' in type_lower or 'deepwater' in type_lower:
        return 'oil_field'
    # Energy - Gas
    if 'gas' in type_lower or 'lng' in type_lower:
        return 'gas_field'
    # Metals - Mines
    if 'mine' in type_lower:
        return 'mine'
    # Processing
    if 'plant' in type_lower or 'production' in type_lower or 'refiner' in type_lower:
        return 'processing_plant'
    # Agricultural
    if any(x in type_lower for x in ['wheat', 'rice', 'corn', 'soybean', 'cotton', 'sugar', 'coffee', 'cocoa']):
        return 'farm'
    # Storage/Ports
    if 'storage' in type_lower:
        return 'storage'
    if 'terminal' in type_lower or 'port' in type_lower:
        return 'port'
    
    return 'facility'

def get_commodity_type_and_name(type_str):
    """Determine commodity_type and commodity_name from the type field"""
    if type_str is None:
        return 'Energy', 'Crude Oil'
    
    type_lower = str(type_str).lower()
    
    # Energy commodities
    if any(x in type_lower for x in ['conventional', 'offshore', 'deepwater', 'shale', 'oil']):
        return 'Energy', 'Crude Oil'
    if 'gas' in type_lower or 'lng' in type_lower:
        return 'Energy', 'Natural Gas'
    if 'coal' in type_lower:
        return 'Energy', 'Coal'
    if 'uranium' in type_lower:
        return 'Energy', 'Uranium'
    
    # Metals
    if 'gold' in type_lower:
        return 'Metals', 'Gold'
    if 'silver' in type_lower:
        return 'Metals', 'Silver'
    if 'copper' in type_lower:
        return 'Metals', 'Copper'
    if 'iron' in type_lower or 'steel' in type_lower:
        return 'Metals', 'Iron Ore'
    if 'nickel' in type_lower:
        return 'Metals', 'Nickel'
    if 'zinc' in type_lower:
        return 'Metals', 'Zinc'
    if 'platinum' in type_lower:
        return 'Metals', 'Platinum'
    if 'palladium' in type_lower:
        return 'Metals', 'Palladium'
    if 'rhodium' in type_lower:
        return 'Metals', 'Rhodium'
    if 'titanium' in type_lower:
        return 'Metals', 'Titanium'
    if 'cobalt' in type_lower:
        return 'Metals', 'Cobalt'
    if 'lithium' in type_lower:
        return 'Metals', 'Lithium'
    if 'silicon' in type_lower:
        return 'Metals', 'Silicon'
    if 'aluminum' in type_lower or 'aluminium' in type_lower:
        return 'Metals', 'Aluminum'
    
    # Agricultural
    if 'wheat' in type_lower:
        return 'Agricultural', 'Wheat'
    if 'rice' in type_lower:
        return 'Agricultural', 'Rice'
    if 'corn' in type_lower:
        return 'Agricultural', 'Corn'
    if 'soybean' in type_lower:
        return 'Agricultural', 'Soybeans'
    if 'cotton' in type_lower:
        return 'Agricultural', 'Cotton'
    if 'sugar' in type_lower:
        return 'Agricultural', 'Sugar'
    if 'coffee' in type_lower:
        return 'Agricultural', 'Coffee'
    if 'cocoa' in type_lower:
        return 'Agricultural', 'Cocoa'
    
    # Default
    return 'Energy', 'Crude Oil'

def escape_sql(val):
    """Escape string for SQL"""
    if val is None:
        return 'NULL'
    return "'" + str(val).replace("'", "''") + "'"

# Parse each object
oil_fields = []
for match in matches:
    obj = {}
    # Parse key: value pairs
    # Handle multi-line and various formats
    pairs = re.findall(r'(\w+):\s*("(?:[^"\\]|\\.)*"|\'(?:[^\'\\]|\\.)*\'|[^,\n]+)', match)
    for key, val in pairs:
        obj[key.strip()] = parse_value(val.strip().rstrip(','))
    
    if 'name' in obj and 'latitude' in obj and 'longitude' in obj:
        oil_fields.append(obj)

print(f"Successfully parsed {len(oil_fields)} oil fields")

# Generate SQL
sql_lines = []
sql_lines.append("-- ============================================")
sql_lines.append("-- IMPORT ALL OIL FIELDS FROM scrape-oil-data.ts")
sql_lines.append(f"-- Total entries: {len(oil_fields)}")
sql_lines.append("-- ============================================")
sql_lines.append("")
sql_lines.append("-- Delete existing entries to avoid duplicates (optional - comment out if you want to keep existing)")
sql_lines.append("-- DELETE FROM public.commodity_locations WHERE commodity_name IN ('Crude Oil', 'Oil & Gas', 'Natural Gas', 'LNG');")
sql_lines.append("")

# Group by country for easier management
by_country = {}
for field in oil_fields:
    country = field.get('country', 'Unknown')
    if country not in by_country:
        by_country[country] = []
    by_country[country].append(field)

print(f"Countries found: {len(by_country)}")

# Generate INSERT statements
for country in sorted(by_country.keys()):
    fields = by_country[country]
    sql_lines.append(f"-- ============================================")
    sql_lines.append(f"-- {country}: {len(fields)} locations")
    sql_lines.append(f"-- ============================================")
    
    for field in fields:
        name = field.get('name', 'Unknown')
        operator = field.get('operator', 'Unknown')
        lat = field.get('latitude', 0)
        lng = field.get('longitude', 0)
        production = field.get('production_bpd', 0)
        api_gravity = parse_api_gravity(field.get('api_gravity'))
        sulfur = parse_sulfur_content(field.get('sulfur_content'))
        field_type = field.get('type', 'Conventional')
        location_type = map_location_type(field_type)
        
        # Determine commodity type and name based on type field
        commodity_type, commodity_name = get_commodity_type_and_name(field_type)
        
        sql = f"""INSERT INTO public.commodity_locations (
    title, owner, address, latitude, longitude,
    commodity_type, commodity_name, company, country,
    location_type, operational_status, operator,
    current_production, api_gravity, sulfur_content, grade
) VALUES (
    {escape_sql(name)},
    {escape_sql(operator)},
    {escape_sql(f'{name}, {country}')},
    {lat},
    {lng},
    {escape_sql(commodity_type)},
    {escape_sql(commodity_name)},
    {escape_sql(operator)},
    {escape_sql(country)},
    {escape_sql(location_type)},
    'operational',
    {escape_sql(operator)},
    {production if production else 'NULL'},
    {api_gravity if api_gravity else 'NULL'},
    {sulfur if sulfur else 'NULL'},
    {escape_sql(field_type)}
) ON CONFLICT (title, country, commodity_name) DO UPDATE SET
    owner = EXCLUDED.owner,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    operator = EXCLUDED.operator,
    current_production = EXCLUDED.current_production,
    api_gravity = EXCLUDED.api_gravity,
    sulfur_content = EXCLUDED.sulfur_content,
    grade = EXCLUDED.grade;
"""
        sql_lines.append(sql)

# Write to file
output_path = '/Users/b23/Desktop/GC23/GC23/IMPORT_ALL_OIL_FIELDS.sql'
with open(output_path, 'w') as f:
    f.write('\n'.join(sql_lines))

print(f"\n✅ Generated SQL file: {output_path}")
print(f"   Total INSERT statements: {len(oil_fields)}")
print(f"   Countries: {len(by_country)}")
print("\nTo import, run this SQL in your Supabase SQL Editor.")
