#!/usr/bin/env python3
"""
Generate SQL files for 8 countries with oil/gas field data.
Countries: Niger, Nigeria, Norway, South Africa, South Sudan, Sudan, Tunisia, Uganda
Uses correct schema matching BRUNEI_OIL_FIELDS_SETUP.sql
"""

import json
import re
from datetime import datetime
from pathlib import Path

# Paths
DATA_PATH = Path("/Users/b23/Desktop/GC23/Countries data")
OUTPUT_PATH = Path("/Users/b23/Desktop/GC23/GC23")

# ============================================
# COORDINATE MAPPINGS BY COUNTRY
# ============================================

NIGER_COORDS = {
    # Agadem Basin - Diffa Region (eastern Niger)
    "agadem": (14.5, 13.5),
    "koulele": (14.4, 13.4),
    "dibeilla": (14.45, 13.45),
    "fgd": (14.5, 13.6),
    "goumeri": (14.55, 13.55),
    "sokor": (14.6, 13.5),
    "amdigh": (14.3, 13.3),
    "bushiya": (14.35, 13.35),
    "kunama": (14.4, 13.4),
    "eridal": (14.45, 13.45),
    "zomo": (14.5, 13.5),
}

NIGERIA_COORDS = {
    # Rivers State - onshore Niger Delta
    "ogbele": (4.85, 6.85),
    "omerelu": (4.9, 6.9),
    "olo": (4.95, 6.95),
    "obagi": (5.0, 6.8),
    "ibewa": (5.23472, 6.6793),
    # Bonny Island area
    "bonny": (4.45, 7.15),
    # Warri/Delta State
    "warri": (5.5, 5.75),
    "escravos": (5.58, 5.2),
    # Port Harcourt area
    "port harcourt": (4.75, 7.0),
    # Offshore Niger Delta
    "bonga": (4.35, 5.1),
    "akpo": (4.4, 5.3),
    "egina": (4.25, 5.0),
    "agbami": (4.2, 5.2),
    "erha": (4.1, 5.1),
    "usan": (4.3, 5.5),
    # General Niger Delta offshore
    "offshore": (4.5, 5.5),
    "deepwater": (4.3, 5.2),
}

NORWAY_COORDS = {
    # North Sea fields
    "johan sverdrup": (59.0, 2.5),
    "troll": (60.6, 3.7),
    "oseberg": (60.5, 2.8),
    "gullfaks": (61.2, 2.1),
    "statfjord": (61.25, 1.85),
    "veslefrikk": (60.8, 2.9),
    "albuskjell": (56.5, 3.0),
    "atla": (59.3, 2.0),
    "alvheim": (59.6, 1.9),
    "balder": (59.3, 2.4),
    "brage": (60.5, 3.0),
    "breidablikk": (59.2, 2.6),
    "blane": (57.5, 1.9),
    "tambar": (57.6, 2.9),
    "nova": (59.5, 2.3),
    "oda": (57.4, 3.0),
    # Norwegian Sea fields
    "åsgard": (65.1, 6.5),
    "asgard": (65.1, 6.5),
    "heidrun": (65.3, 7.3),
    "draugen": (64.35, 7.8),
    "njord": (64.6, 7.2),
    "norne": (66.0, 8.0),
    "kristin": (65.0, 6.5),
    "tyrihans": (65.0, 6.8),
    "maria": (64.7, 6.5),
    "ormen lange": (63.3, 5.3),
    "aasta hansteen": (67.1, 7.1),
    "skarv": (65.7, 7.5),
    "mikkel": (64.9, 6.4),
    "urd": (66.0, 7.8),
    "skuld": (66.1, 7.9),
    "alve": (66.0, 8.2),
    "marulk": (65.8, 7.6),
    "hyme": (64.9, 7.3),
    "bauge": (64.8, 7.2),
    "fenja": (64.5, 7.0),
    "verdande": (66.0, 8.0),
    "andvare": (66.1, 8.1),
    "halten": (65.0, 6.5),
    "ærfugl": (65.9, 7.5),
    # Barents Sea
    "snøhvit": (71.5, 21.0),
    "goliat": (71.3, 22.3),
    "johan castberg": (72.5, 20.0),
}

SOUTH_AFRICA_COORDS = {
    # Bredasdorp Basin - offshore Western Cape
    "oribi": (-35.0, 21.0),
    "oryx": (-35.1, 21.1),
    "sable": (-35.2, 21.2),
    "mossel bay": (-34.1, 22.1),
}

SOUTH_SUDAN_COORDS = {
    # Unity State - Muglad Basin
    "heglig": (10.0066666667, 29.3986111111),
    "unity": (9.4776, 29.67463),
    "toma south": (9.8052777778, 29.5813888889),
    "munga": (9.5, 29.6),
    "el toor": (9.55, 29.55),
    "el nar": (9.6, 29.5),
    "bamboo": (9.7, 29.4),
    "thar jath": (9.3, 29.8),
    "mala": (9.35, 29.75),
    # Upper Nile State - Melut Basin
    "palogue": (10.43, 32.47),
    "paloich": (10.43, 32.47),
    "adar": (10.008014, 32.958759),
    "adaril": (10.008014, 32.958759),
    "moleeta": (10.5, 32.5),
    "gassab": (10.4, 32.6),
    "gumry": (10.45, 32.55),
    "fal": (10.5, 32.4),
    "qamari": (10.55, 32.45),
    "agordeed": (10.35, 32.7),
}

SUDAN_COORDS = {
    # West Kordofan
    "heglig": (10.0068, 29.39859),
    "bamboo": (9.7, 29.4),
    # Unity/South Sudan border area
    "unity": (9.4776, 29.67463),
    "toma south": (9.80528, 29.58139),
    "munga": (9.5, 29.6),
    "el toor": (9.55, 29.55),
    "el noor": (9.6, 29.5),
    "diffra": (9.65, 29.45),
    "neem": (9.7, 29.5),
    "thar jath": (9.3, 29.8),
    "mala": (9.35, 29.75),
    # Kordofan - Fula/Block 6
    "fula": (12.0, 27.0),
    # Melut Basin
    "paloch": (10.46211, 32.54055),
    "adar yale": (10.008014, 32.958759),
    # Red Sea offshore
    "tokar": (19.5, 38.0),
}

TUNISIA_COORDS = {
    # Gulf of Gabes - offshore
    "ashtart": (34.3667, 11.8833),
    "miskar": (34.2, 11.5),
    "hasdrubal": (34.25, 11.55),
    "chergui": (34.7, 11.1),
    "cercina": (34.6, 11.0),
    "didon": (34.3, 11.7),
    "salloum": (34.4, 11.3),
    # Southern Tunisia - Tataouine
    "el borma": (31.7, 9.2),
    "adam": (31.6, 9.3),
    "cherouq": (31.5, 9.4),
    "nawara": (31.4, 9.5),
    "warda": (31.35, 9.55),
    "sabah": (31.3, 9.6),
    "chouech": (31.8, 9.1),
    # Kebili region
    "sabria": (33.0, 8.5),
}

UGANDA_COORDS = {
    # Lake Albert / Albertine Graben
    "kingfisher": (1.0, 30.8),
    "jobi-rii": (1.8, 31.3),
    "gunya": (1.7, 31.25),
    "ngiri": (1.75, 31.3),
    "kasamene": (1.6, 31.2),
    "wahrindi": (1.65, 31.22),
    "kigogole": (1.55, 31.15),
    "ngara": (1.5, 31.1),
    "nsoga": (1.45, 31.05),
    "ngege": (1.4, 31.0),
    "mputa": (1.3, 30.95),
    "nzizi": (1.25, 30.9),
    "waraga": (1.2, 30.85),
    "tilenga": (1.7, 31.25),
}

# ============================================
# COMPANY STANDARDIZATION RULES
# ============================================

COMPANY_RULES = {
    "Niger": {
        "cnpc": "CNPC",
        "savannah": "Savannah Energy",
    },
    "Nigeria": {
        "aradel": "Aradel Energy",
        "totalenergies": "TotalEnergies",
        "total": "TotalEnergies",
        "shell": "Shell",
        "spdc": "Shell",
        "nnpc": "NNPC",
        "chevron": "Chevron",
        "exxonmobil": "ExxonMobil",
        "mobil": "ExxonMobil",
        "seplat": "Seplat Energy",
        "oando": "Oando",
    },
    "Norway": {
        "equinor": "Equinor",
        "aker bp": "Aker BP",
        "vår energi": "Vår Energi",
        "var energi": "Vår Energi",
        "harbour energy": "Harbour Energy",
        "conocophillips": "ConocoPhillips",
        "shell": "Shell",
        "totalenergies": "TotalEnergies",
        "okea": "OKEA",
        "dno": "DNO",
        "repsol": "Repsol",
        "petoro": "Petoro",
    },
    "South Africa": {
        "petrosa": "PetroSA",
        "soekor": "PetroSA",
    },
    "South Sudan": {
        "cnpc": "CNPC",
        "petronas": "PETRONAS",
        "ongc": "ONGC",
        "nilepet": "Nilepet",
        "sinopec": "Sinopec",
        "gpoc": "GPOC",
        "gnpoc": "GNPOC",
        "dpoc": "DPOC",
        "spoc": "SPOC",
    },
    "Sudan": {
        "cnpc": "CNPC",
        "petronas": "PETRONAS",
        "ongc": "ONGC",
        "sudapet": "Sudapet",
        "gpoc": "GPOC",
        "gnpoc": "GNPOC",
        "dpoc": "DPOC",
        "wnpoc": "WNPOC",
    },
    "Tunisia": {
        "etap": "ETAP",
        "omv": "OMV",
        "eni": "Eni",
        "bg group": "Shell",
        "shell": "Shell",
        "serept": "SEREPT",
        "petrofac": "Petrofac",
        "panoro": "Panoro Energy",
        "sitep": "SITEP",
        "serinus": "Serinus Energy",
        "pioneer": "Pioneer Natural Resources",
        "tps": "TPS",
    },
    "Uganda": {
        "totalenergies": "TotalEnergies",
        "cnooc": "CNOOC",
        "unoc": "UNOC",
        "tepu": "TotalEnergies",
    },
}

# ============================================
# HELPER FUNCTIONS
# ============================================

def escape_sql(value):
    """Escape single quotes for SQL."""
    if value is None:
        return None
    return str(value).replace("'", "''")

def format_array(arr):
    """Format a Python list as a PostgreSQL array string."""
    if not arr:
        return "ARRAY[]::text[]"
    escaped = [f"'{escape_sql(item)}'" for item in arr]
    return f"ARRAY[{', '.join(escaped)}]"

def parse_date(date_str):
    """Parse various date formats to YYYY-MM-DD or return None."""
    if not date_str or date_str == "unknown":
        return None
    date_str = str(date_str).strip()
    
    patterns = [
        (r'^\d{4}-\d{2}-\d{2}$', lambda s: s),
        (r'^\d{4}-\d{2}$', lambda s: s + "-01"),
        (r'^\d{4}$', lambda s: s + "-01-01"),
        (r'^\d{4}s$', lambda s: s[:4] + "-01-01"),
    ]
    
    for pattern, transform in patterns:
        if re.match(pattern, date_str):
            return transform(date_str)
    return None

def determine_commodity(site):
    """Determine commodity type from site data."""
    quality = (site.get("quality_type") or "").lower()
    name = (site.get("site_name") or "").lower()
    unit = (site.get("production_unit") or "").lower()
    
    if "gas" in name and "oil" not in name:
        return "Natural Gas"
    if "condensate" in quality or "gas" in quality:
        if "oil" in quality or "crude" in quality:
            return "Oil & Gas"
        return "Natural Gas"
    if "crude" in quality or "oil" in quality or "bbl" in unit or "barrel" in unit:
        return "Crude Oil"
    return "Oil & Gas"

def determine_location_type(site):
    """Determine location type from site data."""
    state = (site.get("state_province") or "").lower()
    name = (site.get("site_name") or "").lower()
    
    if "offshore" in state or "offshore" in name:
        return "offshore_field"
    if "refinery" in name:
        return "refinery"
    if "terminal" in name:
        return "terminal"
    if "gas" in name and "oil" not in name:
        return "gas_field"
    return "oil_field"

def get_status(site):
    """Normalize operational status."""
    status = (site.get("status") or "active").lower()
    
    status_map = {
        "active": "active",
        "producing": "active",
        "operational": "active",
        "inactive": "inactive",
        "shut-in": "inactive",
        "closed": "closed",
        "abandoned": "closed",
        "development": "development",
        "construction": "construction",
        "planned": "planned",
        "exploration": "exploration",
    }
    
    return status_map.get(status, "active")

def find_coordinates(site_name, country_coords):
    """Find coordinates for a site using fuzzy matching."""
    name_lower = site_name.lower()
    
    # Direct match
    for key, coords in country_coords.items():
        if key in name_lower:
            return coords
    
    # Try first word
    first_word = name_lower.split()[0] if name_lower else ""
    for key, coords in country_coords.items():
        if key == first_word:
            return coords
    
    return None

def get_company(operator, country_name, company_rules):
    """Standardize company name based on rules."""
    if not operator:
        return "Unknown"
    
    operator_lower = operator.lower()
    
    rules = company_rules.get(country_name, {})
    for pattern, company in rules.items():
        if pattern in operator_lower:
            return company
    
    # Extract first meaningful word
    words = operator.split()
    for word in words:
        if word.lower() not in ["the", "a", "an", "of", "for", "and"]:
            return word
    
    return operator[:50] if operator else "Unknown"

def normalize_country_name(country):
    """Normalize country name variations."""
    mappings = {
        "south sudan": "South Sudan",
        "sudan": "Sudan",
        "niger": "Niger",
        "nigeria": "Nigeria",
        "norway": "Norway",
        "south africa": "South Africa",
        "tunisia": "Tunisia",
        "uganda": "Uganda",
    }
    return mappings.get(country.lower(), country)

# ============================================
# SQL GENERATION
# ============================================

def generate_sql_for_country(json_path, country_display_name, coords_map, company_rules, output_name):
    """Generate SQL file for a country."""
    
    # Load JSON
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    sites = data.get("sites", [])
    
    # Deduplicate sites by name
    seen = {}
    for site in sites:
        name = site.get("site_name", "Unknown")
        if name not in seen:
            seen[name] = site
        else:
            # Prefer entry with coordinates
            if site.get("latitude") and not seen[name].get("latitude"):
                seen[name] = site
    
    unique_sites = list(seen.values())
    companies = set()
    
    # Build SQL
    sql_lines = []
    sql_lines.append(f"-- ============================================")
    sql_lines.append(f"-- {country_display_name.upper()} OIL & GAS FIELDS SETUP")
    sql_lines.append(f"-- Generated: {datetime.now().isoformat()}")
    sql_lines.append(f"-- Total sites: {len(unique_sites)}")
    sql_lines.append(f"-- ============================================")
    sql_lines.append("")
    
    # Schema modifications
    sql_lines.append("-- ============================================")
    sql_lines.append("-- STEP 1: SCHEMA MODIFICATIONS")
    sql_lines.append("-- ============================================")
    sql_lines.append("")
    sql_lines.append("-- Add new columns if they don't exist")
    sql_lines.append("DO $$ ")
    sql_lines.append("BEGIN")
    
    schema_cols = [
        ("operator", "TEXT"),
        ("ownership_type", "TEXT"),
        ("ownership_details", "TEXT"),
        ("production_monthly", "DECIMAL(20,2)"),
        ("production_yearly", "DECIMAL(20,2)"),
        ("production_unit", "TEXT"),
        ("start_date", "DATE"),
        ("closing_date", "DATE"),
        ("estimated_reserves", "DECIMAL(20,2)"),
        ("reserves_unit", "TEXT"),
        ("api_gravity", "DECIMAL(5,2)"),
        ("quality_type", "TEXT"),
        ("quality_sulfur_content", "DECIMAL(5,3)"),
        ("grade", "TEXT"),
        ("last_transaction_value", "DECIMAL(20,2)"),
        ("last_transaction_currency", "TEXT"),
        ("last_transaction_date", "DATE"),
        ("contract_duration_years", "INTEGER"),
        ("pipelines", "TEXT[]"),
        ("ports", "TEXT[]"),
        ("rail_connections", "TEXT[]"),
        ("company", "TEXT"),
    ]
    
    for col_name, col_type in schema_cols:
        sql_lines.append(f"  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='commodity_locations' AND column_name='{col_name}') THEN")
        sql_lines.append(f"    ALTER TABLE public.commodity_locations ADD COLUMN {col_name} {col_type};")
        sql_lines.append(f"  END IF;")
    sql_lines.append("END $$;")
    sql_lines.append("")
    
    # Date parsing function
    sql_lines.append("-- ============================================")
    sql_lines.append("-- STEP 2: DATE PARSING FUNCTION")
    sql_lines.append("-- ============================================")
    sql_lines.append("")
    sql_lines.append("CREATE OR REPLACE FUNCTION parse_flexible_date(date_text TEXT)")
    sql_lines.append("RETURNS DATE AS $$")
    sql_lines.append("BEGIN")
    sql_lines.append("  IF date_text IS NULL OR date_text = '' THEN RETURN NULL; END IF;")
    sql_lines.append("  IF date_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN RETURN date_text::DATE; END IF;")
    sql_lines.append("  IF date_text ~ '^[0-9]{4}-[0-9]{2}$' THEN RETURN (date_text || '-01')::DATE; END IF;")
    sql_lines.append("  IF date_text ~ '^[0-9]{4}$' THEN RETURN (date_text || '-01-01')::DATE; END IF;")
    sql_lines.append("  RETURN NULL;")
    sql_lines.append("EXCEPTION WHEN OTHERS THEN RETURN NULL;")
    sql_lines.append("END;")
    sql_lines.append("$$ LANGUAGE plpgsql;")
    sql_lines.append("")
    
    # Collect companies
    for site in unique_sites:
        operator = site.get("operator", "")
        company = get_company(operator, country_display_name, company_rules)
        if company and company != "Unknown":
            companies.add(company)
    
    sql_lines.append("-- ============================================")
    sql_lines.append("-- STEP 3: INSERT COMPANIES")
    sql_lines.append("-- ============================================")
    sql_lines.append("")
    
    if companies:
        sql_lines.append("INSERT INTO public.companies (name, type, headquarters_country, commodities_traded)")
        sql_lines.append("VALUES")
        company_values = []
        for company in sorted(companies):
            company_values.append(f"  ('{escape_sql(company)}', 'producer', 'Unknown', ARRAY['Crude Oil', 'Natural Gas'])")
        sql_lines.append(",\n".join(company_values))
        sql_lines.append("ON CONFLICT (name) DO UPDATE SET commodities_traded = EXCLUDED.commodities_traded;")
    sql_lines.append("")
    
    sql_lines.append("-- ============================================")
    sql_lines.append(f"-- STEP 4: DELETE EXISTING {country_display_name.upper()} DATA")
    sql_lines.append("-- ============================================")
    sql_lines.append("")
    sql_lines.append(f"DELETE FROM public.commodity_locations WHERE country = '{escape_sql(country_display_name)}';")
    sql_lines.append("")
    sql_lines.append("-- ============================================")
    sql_lines.append(f"-- STEP 5: INSERT {country_display_name.upper()} SITES")
    sql_lines.append("-- ============================================")
    sql_lines.append("")
    
    for site in unique_sites:
        site_name = site.get("site_name", "Unknown")
        
        # Get coordinates
        lat = site.get("latitude")
        lng = site.get("longitude")
        
        if not lat or not lng:
            coords = find_coordinates(site_name, coords_map)
            if coords:
                lat, lng = coords
        
        # Get other fields
        company = get_company(site.get("operator", ""), country_display_name, company_rules)
        commodity = determine_commodity(site)
        location_type = determine_location_type(site)
        status = get_status(site)
        ownership_type = escape_sql(site.get("ownership_type", ""))[:100] if site.get("ownership_type") else None
        state_province = site.get("state_province", "")
        
        # Build INSERT
        sql_lines.append("INSERT INTO public.commodity_locations (")
        sql_lines.append("  title, owner, address, country, region, latitude, longitude,")
        sql_lines.append("  commodity_type, commodity_name, location_type, operational_status,")
        sql_lines.append("  operator, ownership_type, ownership_details,")
        sql_lines.append("  production_monthly, production_yearly, production_unit,")
        sql_lines.append("  estimated_reserves, reserves_unit, start_date, closing_date,")
        sql_lines.append("  quality_type, api_gravity, quality_sulfur_content, grade,")
        sql_lines.append("  last_transaction_value, last_transaction_currency, last_transaction_date,")
        sql_lines.append("  contract_duration_years, pipelines, ports, rail_connections, company, additional_info")
        sql_lines.append(") VALUES (")
        
        # Values
        sql_lines.append(f"  '{escape_sql(site_name)}',")  # title
        sql_lines.append(f"  '{escape_sql(company)}',")  # owner
        address = escape_sql(state_province)[:255] if state_province else country_display_name
        sql_lines.append(f"  '{address}',")  # address
        sql_lines.append(f"  '{escape_sql(country_display_name)}',")  # country
        region = escape_sql(state_province)[:100] if state_province else None
        region_val = f"'{region}'" if region else 'NULL'
        sql_lines.append(f"  {region_val},")  # region
        sql_lines.append(f"  {lat if lat else 'NULL'},")  # latitude
        sql_lines.append(f"  {lng if lng else 'NULL'},")  # longitude
        sql_lines.append(f"  'Energy',")  # commodity_type
        sql_lines.append(f"  '{escape_sql(commodity)}',")  # commodity_name
        sql_lines.append(f"  '{escape_sql(location_type)}',")  # location_type
        sql_lines.append(f"  '{escape_sql(status)}',")  # operational_status
        sql_lines.append(f"  '{escape_sql(company)}',")  # operator
        ownership_type_val = f"'{ownership_type}'" if ownership_type else 'NULL'
        sql_lines.append(f"  {ownership_type_val},")  # ownership_type
        ownership_details = escape_sql(site.get("ownership_details", ""))[:1000] if site.get("ownership_details") else None
        ownership_details_val = f"'{ownership_details}'" if ownership_details else 'NULL'
        sql_lines.append(f"  {ownership_details_val},")  # ownership_details
        
        monthly = site.get("production_monthly") or 0
        yearly = site.get("production_yearly") or 0
        unit = escape_sql(site.get("production_unit", "barrels"))[:50]
        sql_lines.append(f"  {monthly},")  # production_monthly
        sql_lines.append(f"  {yearly},")  # production_yearly
        sql_lines.append(f"  '{unit}',")  # production_unit
        
        reserves = site.get("estimated_reserves") or 0
        reserves_unit = escape_sql(site.get("reserves_unit", "bbl"))[:50] if site.get("reserves_unit") else "bbl"
        sql_lines.append(f"  {reserves},")  # estimated_reserves
        sql_lines.append(f"  '{reserves_unit}',")  # reserves_unit
        
        start = parse_date(site.get("start_date"))
        closing = parse_date(site.get("closing_date"))
        start_val = f"parse_flexible_date('{start}')" if start else 'NULL'
        sql_lines.append(f"  {start_val},")  # start_date
        closing_val = f"parse_flexible_date('{closing}')" if closing else 'NULL'
        sql_lines.append(f"  {closing_val},")  # closing_date
        
        quality_type = escape_sql(site.get("quality_type", ""))[:100] if site.get("quality_type") else None
        api = site.get("quality_api_gravity")
        sulfur = site.get("quality_sulfur_content")
        grade = escape_sql(site.get("grade", ""))[:50] if site.get("grade") else None
        quality_type_val = f"'{quality_type}'" if quality_type else 'NULL'
        sql_lines.append(f"  {quality_type_val},")  # quality_type
        sql_lines.append(f"  {api if api else 'NULL'},")  # api_gravity
        sql_lines.append(f"  {sulfur if sulfur else 'NULL'},")  # quality_sulfur_content
        grade_val = f"'{grade}'" if grade else 'NULL'
        sql_lines.append(f"  {grade_val},")  # grade
        
        tx_value = site.get("last_transaction_value")
        tx_currency = escape_sql(site.get("last_transaction_currency", "USD"))[:10]
        tx_date = parse_date(site.get("last_transaction_date"))
        sql_lines.append(f"  {tx_value if tx_value else 'NULL'},")  # last_transaction_value
        sql_lines.append(f"  '{tx_currency}',")  # last_transaction_currency
        tx_date_val = f"parse_flexible_date('{tx_date}')" if tx_date else 'NULL'
        sql_lines.append(f"  {tx_date_val},")  # last_transaction_date
        
        duration = site.get("contract_duration_years")
        sql_lines.append(f"  {duration if duration else 'NULL'},")  # contract_duration_years
        
        pipelines = site.get("pipelines", [])
        ports = site.get("ports", [])
        rails = site.get("rail_connections", [])
        sql_lines.append(f"  {format_array(pipelines)},")  # pipelines
        sql_lines.append(f"  {format_array(ports)},")  # ports
        sql_lines.append(f"  {format_array(rails)},")  # rail_connections
        sql_lines.append(f"  '{escape_sql(company)}',")  # company
        sql_lines.append(f"  NULL")  # additional_info
        sql_lines.append(");")
        sql_lines.append("")
    
    # Write SQL file
    output_file = OUTPUT_PATH / f"{output_name}_OIL_FIELDS_SETUP.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated {output_file} with {len(unique_sites)} sites")
    return companies

# ============================================
# MAIN
# ============================================

def main():
    countries = [
        ("Niger_all_sites.json", "Niger", NIGER_COORDS, "NIGER"),
        ("Nigeria_all_sites.json", "Nigeria", NIGERIA_COORDS, "NIGERIA"),
        ("Norway_all_sites.json", "Norway", NORWAY_COORDS, "NORWAY"),
        ("South_Africa_all_sites.json", "South Africa", SOUTH_AFRICA_COORDS, "SOUTH_AFRICA"),
        ("South_Sudan_all_sites.json", "South Sudan", SOUTH_SUDAN_COORDS, "SOUTH_SUDAN"),
        ("Sudan_all_sites.json", "Sudan", SUDAN_COORDS, "SUDAN"),
        ("Tunisia_all_sites.json", "Tunisia", TUNISIA_COORDS, "TUNISIA"),
        ("Uganda_all_sites.json", "Uganda", UGANDA_COORDS, "UGANDA"),
    ]
    
    all_companies = set()
    
    for json_file, country_name, coords_map, output_name in countries:
        json_path = DATA_PATH / json_file
        if json_path.exists():
            companies = generate_sql_for_country(
                json_path, country_name, coords_map, COMPANY_RULES, output_name
            )
            all_companies.update(companies)
        else:
            print(f"Warning: {json_path} not found")
    
    print(f"\n=== Summary ===")
    print(f"Total unique companies: {len(all_companies)}")
    print(f"\nNew companies to add to EarthMap.tsx:")
    for company in sorted(all_companies):
        print(f"  '{company}',")

if __name__ == "__main__":
    main()
