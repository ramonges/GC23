#!/usr/bin/env python3
"""
Generate SQL setup files for 10 countries:
Congo DRC, Congo Republic, Côte d'Ivoire, Egypt, Equatorial Guinea,
Gabon, Ghana, India, Libya, Mauritania
"""

import json
import re
from pathlib import Path
from datetime import datetime

# Base paths
COUNTRIES_DATA_PATH = Path("/Users/b23/Desktop/GC23/Countries data")
OUTPUT_PATH = Path("/Users/b23/Desktop/GC23/GC23")

# ============================================================================
# COORDINATE MAPPINGS FOR ALL COUNTRIES
# ============================================================================

# Congo DRC - All offshore near Muanda (mouth of Congo River)
CONGO_DRC_COORDS = {
    "Muanda Marine": (-5.93, 12.35),
    "GCO field": (-5.90, 12.30),
    "Lukami field": (-5.88, 12.28),
    "Motoba field": (-5.85, 12.25),
    "Moke-East": (-5.87, 12.27),
}

# Congo Republic - Offshore Pointe-Noire
CONGO_REPUBLIC_COORDS = {
    # Major fields with known locations
    "Moho Nord": (-4.48, 11.05),
    "Moho-Bilondo": (-4.50, 11.08),
    "Moho": (-4.49, 11.06),
    "Nkossa": (-4.60, 11.20),
    "Nsoko": (-4.62, 11.22),
    "Nené Marine": (-4.55, 11.58),  # Has coordinates in data
    "Litchendjili": (-4.52, 11.55),
    "Azurite": (-4.70, 11.30),
    "Lianzi": (-5.30, 11.50),  # Cross-border Angola
    "Yanga": (-4.75, 11.35),
    "Sendji": (-4.72, 11.32),
    "Nzombo": (-4.45, 11.02),
    "Emeraude": (-5.07, 11.84),  # Has coordinates in data
    "Yombo": (-4.85, 11.45),
    "Likouala": (-5.22, 11.71),  # Has coordinates in data
    "Boatou": (-5.15, 11.65),
    "Tchendo": (-4.95, 11.55),
    "Tchibouela": (-4.90, 11.50),
    "Tchibeli-Litanzi": (-4.88, 11.48),
    "Masseko": (-4.82, 11.42),
    "Marine XII": (-4.52, 11.55),
    "PNGF": (-4.92, 11.52),
}

# Côte d'Ivoire - Offshore Abidjan
COTE_DIVOIRE_COORDS = {
    "Baleine": (4.85, -4.20),
    "Baobab": (4.75, -5.25),
    "Espoir": (5.00, -4.47),  # Has coordinates in data
    "Foxtrot": (4.90, -4.35),
    "Mahi": (4.88, -4.33),
    "Manta": (4.86, -4.32),
    "Marlin": (4.84, -4.30),
    "Kossipo": (4.73, -5.23),
}

# Egypt - Multiple basins
EGYPT_COORDS = {
    # Western Desert
    "Obaiyed": (30.70, 27.50),
    "Badr El Din": (30.65, 27.45),
    "Alam El Shawish": (30.60, 27.40),
    "Abu Gharadig": (29.80, 28.20),
    "Meleiha": (30.55, 27.00),
    "West Razzaq": (30.50, 26.95),
    "Qarun": (29.52, 30.86),  # Has coordinates in data
    "Abu Sennan": (30.10, 27.80),
    "Khalda": (30.75, 27.55),
    "Kalabsha": (30.40, 27.20),
    # Gulf of Suez
    "Ras Budran": (28.93, 33.13),  # Has coordinates in data
    "Ras Fanar": (28.45, 33.25),
    "Zeit Bay": (28.30, 33.30),
    "Belayim": (28.65, 33.20),
    "Morgan": (28.70, 33.25),
    "October": (28.55, 33.18),
    "Geisum": (27.70, 33.50),
    "North Safa": (28.36, 33.29),  # Has coordinates in data
    "Ras Gharib": (28.35, 33.08),  # Has coordinates in data
    "Gemsa": (27.85, 33.45),
    "Abu Rudeis": (28.85, 33.20),  # Has coordinates in data
    "Sidri": (28.88, 33.22),  # Has coordinates in data
    # Mediterranean offshore
    "West Nile Delta": (31.70, 29.50),
    "Nooros": (31.55, 30.50),
    "Abu Qir": (31.45, 30.05),
    "Rosetta": (31.50, 30.20),
    "El Manzala": (31.20, 32.00),
    "West El Burullus": (31.60, 30.60),
    # Sinai
    "Muzhil": (28.75, 33.35),
}

# Equatorial Guinea - Gulf of Guinea
EQ_GUINEA_COORDS = {
    "Zafiro": (3.80, 8.07),  # Has coordinates in data
    "Topacio": (3.78, 8.05),
    "Alba": (3.65, 8.45),
    "Ceiba": (1.25, 9.55),
    "Okume": (1.30, 9.58),
    "Elon": (1.28, 9.56),
    "Oveng": (1.32, 9.60),
    "Akom North": (1.35, 9.62),
    "Ebano": (1.27, 9.54),
}

# Gabon - Offshore and onshore
GABON_COORDS = {
    # Dussafu area
    "Dussafu": (-2.85, 9.35),
    "Tortue": (-2.82, 9.32),
    "Hibiscus": (-2.87, 9.37),
    "Ruche": (-2.90, 9.40),
    # Etame Marin
    "Etame": (-1.95, 9.30),
    "Avouma": (-1.98, 9.32),
    "Tchibala": (-1.92, 9.28),
    "Ebouri": (-1.90, 9.25),
    # Port-Gentil offshore
    "Hylia": (-1.10, 8.90),
    "Grondin": (-0.95, 8.85),
    "Gonelle": (-0.98, 8.87),
    "Barbier": (-0.92, 8.82),
    "Mandaros": (-0.90, 8.80),
    "Torpille": (-0.85, 8.75),
    "Girelle": (-0.88, 8.78),
    "Pageau": (-0.93, 8.83),
    "Simba": (-1.02, 8.92),
    "Anguille": (-0.80, 8.72),
    "Île Mandji": (-0.72, 8.78),
    "Baudroie": (-0.87, 8.77),
    "Lucina": (-1.05, 8.95),
    # Gamba area
    "Gamba": (-2.69, 9.98),  # Has partial coordinates in data
    "Rabi": (-2.00, 9.95),
    "Totou": (-2.65, 9.92),
    "Bende": (-2.60, 9.88),
    "M'Bassou": (-2.62, 9.90),
    "Toucan": (-2.55, 9.85),
    "Robin": (-2.57, 9.87),
    "Koula": (-2.50, 9.80),
    "Damier": (-2.52, 9.82),
    "Atora": (-2.45, 9.75),
    "Ivinga": (-2.70, 9.97),
    "Ompoyi": (-1.15, 8.95),
}

# Ghana - Offshore Western Region
GHANA_COORDS = {
    "Jubilee": (4.55, -2.85),
    "Tweneboa": (4.42, -2.78),
    "Enyenra": (4.40, -2.76),
    "Ntomme": (4.38, -2.74),
    "TEN": (4.40, -2.77),
    "Sankofa": (4.70, -2.55),
    "Gye Nyame": (4.72, -2.58),
}

# India - Multiple regions
INDIA_COORDS = {
    # Mumbai Offshore
    "Mumbai High": (19.45, 71.35),
    "Heera": (19.40, 71.30),
    "Bassein": (19.55, 71.45),
    "Panna": (19.38, 71.25),
    "Mukta": (19.36, 71.23),
    "Tapti": (19.80, 71.85),
    "Daman": (19.75, 71.80),
    "Vasai": (19.58, 71.48),
    "C-26": (19.42, 71.32),
    "C-Series": (19.78, 71.82),
    "NBP": (19.52, 71.42),
    "B-193": (19.50, 71.40),
    "South Bassein": (19.53, 71.43),
    "Neelam": (19.35, 71.20),
    # Rajasthan
    "Mangala": (25.95, 71.15),
    "Bhagyam": (25.90, 71.12),
    "Aishwariya": (25.85, 71.10),
    "Saraswati": (26.00, 71.18),
    "Raageshwari": (25.80, 71.08),
    "Guda": (25.75, 71.05),
    "NE Field": (26.05, 71.20),
    "NI Field": (26.02, 71.19),
    # Krishna-Godavari Basin
    "KG-D6": (16.20, 82.30),
    "Dhirubhai": (16.18, 82.28),
    "MA": (16.15, 82.25),
    "KG-DWN-98/3": (16.12, 82.22),
    "Godavari": (16.10, 82.20),
    # Assam
    "Digboi": (27.38, 95.62),
    "Naharkatiya": (27.28, 95.35),
    "Moran": (27.15, 94.90),
    "Lakwa": (27.02, 94.85),
    "Rudrasagar": (26.95, 94.80),
    "Geleki": (26.90, 94.78),
    # Cauvery Basin
    "Cauvery": (10.85, 79.95),
    "PY-3": (10.80, 79.90),
    # Gujarat onshore
    "Ankleshwar": (21.62, 73.00),
    "Cambay": (22.32, 72.62),
    "Mehsana": (23.60, 72.40),
    "Ahmedabad": (23.02, 72.58),
}

# Libya - Multiple basins
LIBYA_COORDS = {
    # Sirte Basin
    "Waha": (29.25, 19.50),
    "Defa": (29.20, 19.45),
    "Nasser": (29.30, 19.85),
    "Zelten": (29.28, 19.83),
    "Raguba": (29.15, 19.60),
    "Sarir": (28.05, 21.55),
    "Messla": (28.10, 20.80),
    "Nafoora": (28.50, 21.20),
    "Augila": (28.52, 21.22),
    "Amal": (28.35, 20.35),
    "Farigh": (27.80, 20.30),
    "Intisar": (28.15, 21.45),
    "Zueitina": (28.25, 20.95),
    # Murzuq Basin
    "El Sharara": (26.39, 11.94),  # Has coordinates in data
    "El Feel": (26.07, 12.19),  # Has coordinates in data
    "Elephant": (26.05, 12.17),
    "Wafa": (28.89, 10.03),  # Has coordinates in data
    "Hamada": (29.50, 11.50),
    "NC-186": (26.30, 11.85),
    # Ghadames Basin
    "North Hamada": (29.80, 10.80),
    "NC-7": (29.60, 10.50),
    "Al-Hamra": (29.55, 10.45),
    "H1-NC4": (29.70, 10.60),
    # Offshore Mediterranean
    "Bouri": (33.85, 12.50),
    "Al Jurf": (33.51, 12.02),  # Has coordinates in data
}

# Mauritania - Offshore
MAURITANIA_COORDS = {
    "Chinguetti": (19.85, -17.35),
    "Tevet": (19.80, -17.30),
    "Walata": (20.00, -17.45),
    "Tiof": (20.02, -17.47),
    "Banda": (19.75, -17.25),
    "Pelican": (19.70, -17.20),
    "Cormoran": (19.65, -17.15),
    "Frégate": (19.60, -17.10),
    "Faucon": (19.55, -17.05),
    "Abelinda": (19.50, -17.00),
}

# ============================================================================
# COMPANY MAPPING RULES
# ============================================================================

COMPANY_RULES = {
    "Congo (DRC)": {
        "Perenco": "Perenco",
        "MIOC": "Perenco",
    },
    "Congo (Republic)": {
        "TotalEnergies": "TotalEnergies",
        "Total": "TotalEnergies",
        "Trident": "Trident Energy",
        "Eni": "Eni",
        "Perenco": "Perenco",
        "Murphy": "Murphy Oil",
        "SNPC": "SNPC",
        "QatarEnergy": "QatarEnergy",
        "LUKOIL": "LUKOIL",
        "Congorep": "Perenco",
    },
    "Côte d'Ivoire": {
        "Eni": "Eni",
        "Canadian Natural": "Canadian Natural Resources",
        "CNR": "Canadian Natural Resources",
        "CNRL": "Canadian Natural Resources",
        "Foxtrot": "Foxtrot International",
        "Tullow": "Tullow Oil",
        "PETROCI": "PETROCI",
        "VAALCO": "VAALCO Energy",
    },
    "Egypt": {
        "EGPC": "EGPC",
        "Apache": "Apache",
        "Cheiron": "Cheiron",
        "Eni": "Eni",
        "bp": "BP",
        "BP": "BP",
        "GUPCO": "GUPCO",
        "SUCO": "SUCO",
        "Petrobel": "Petrobel",
        "AGIBA": "AGIBA",
        "Agiba": "AGIBA",
        "Khalda": "Khalda Petroleum",
        "BAPETCO": "BAPETCO",
        "Dragon Oil": "Dragon Oil",
        "Dana Gas": "Dana Gas",
        "Energean": "Energean",
        "GPC": "GPC",
        "PetroGulf": "PetroGulf Misr",
        "Vegas": "Vegas Oil & Gas",
        "Capricorn": "Capricorn Energy",
        "Kuwait Energy": "Kuwait Energy",
    },
    "Equatorial Guinea": {
        "GEPetrol": "GEPetrol",
        "ExxonMobil": "ExxonMobil",
        "Mobil": "ExxonMobil",
        "Marathon": "Marathon Oil",
        "Noble": "Noble Energy",
        "Trident": "Trident Energy",
        "Kosmos": "Kosmos Energy",
        "Panoro": "Panoro Energy",
    },
    "Gabon": {
        "TotalEnergies": "TotalEnergies",
        "Total": "TotalEnergies",
        "Perenco": "Perenco",
        "BW Energy": "BW Energy",
        "VAALCO": "VAALCO Energy",
        "Assala": "Assala Energy",
        "GOC": "Gabon Oil Company",
        "Gabon Oil": "Gabon Oil Company",
        "Panoro": "Panoro Energy",
    },
    "Ghana": {
        "Tullow": "Tullow Oil",
        "Kosmos": "Kosmos Energy",
        "Eni": "Eni",
        "GNPC": "GNPC",
        "PetroSA": "PetroSA",
        "Vitol": "Vitol",
        "MODEC": "MODEC",
    },
    "India": {
        "ONGC": "ONGC",
        "Cairn": "Cairn Oil & Gas",
        "Vedanta": "Vedanta",
        "Reliance": "Reliance Industries",
        "Shell": "Shell",
        "BGEPIL": "Shell",
        "BG": "Shell",
        "Oil India": "Oil India Limited",
        "OIL": "Oil India Limited",
        "Hindustan": "Hindustan Oil",
        "HPCL": "HPCL",
        "IOC": "Indian Oil Corporation",
    },
    "Libya": {
        "NOC": "NOC Libya",
        "Waha Oil": "Waha Oil Company",
        "AGOCO": "AGOCO",
        "Sirte Oil": "Sirte Oil Company",
        "Zueitina": "Zueitina Oil Company",
        "Harouge": "Harouge Oil",
        "Mellitah": "Mellitah Oil & Gas",
        "Akakus": "Akakus Oil",
        "Eni": "Eni",
        "TotalEnergies": "TotalEnergies",
        "Total": "TotalEnergies",
        "ConocoPhillips": "ConocoPhillips",
        "Marathon": "Marathon Oil",
        "Repsol": "Repsol",
        "OMV": "OMV",
        "Equinor": "Equinor",
        "Wintershall": "Wintershall Dea",
        "Harbour": "Harbour Energy",
        "ADNOC": "ADNOC",
        "Mabruk": "TotalEnergies",
        "Nafusa": "NOC Libya",
    },
    "Mauritania": {
        "PETRONAS": "PETRONAS",
        "Tullow": "Tullow Oil",
        "Premier": "Premier Oil",
        "KUFPEC": "KUFPEC",
        "SMHPM": "SMHPM",
        "Woodside": "Woodside",
    },
}

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def escape_sql(value):
    """Escape single quotes for SQL."""
    if value is None:
        return None
    return str(value).replace("'", "''")


def format_array(arr):
    """Format Python list as PostgreSQL array."""
    if not arr:
        return "ARRAY[]::text[]"
    escaped = [f"'{escape_sql(item)}'" for item in arr]
    return f"ARRAY[{', '.join(escaped)}]"


def parse_date(date_str):
    """Parse date string to SQL-compatible format."""
    if not date_str or date_str in ["unknown", "", "1900-01-01"]:
        return None
    # Try various formats
    for fmt in ["%Y-%m-%d", "%Y-%m", "%Y"]:
        try:
            dt = datetime.strptime(str(date_str)[:len(fmt.replace("%", "").replace("-", ""))+fmt.count("-")], fmt)
            return dt.strftime("%Y-%m-%d")
        except (ValueError, TypeError):
            continue
    return None


def determine_commodity(site):
    """Determine commodity type from site data."""
    quality_type = (site.get("quality_type") or "").lower()
    name = (site.get("site_name") or "").lower()
    
    if "gas" in quality_type and "oil" in quality_type:
        return "Oil & Gas"
    elif "condensate" in quality_type:
        return "Oil & Gas"
    elif "gas" in quality_type or "gas" in name:
        return "Natural Gas"
    elif "oil" in quality_type or "crude" in quality_type:
        return "Crude Oil"
    return "Crude Oil"


def determine_location_type(site):
    """Determine location type from site data."""
    province = (site.get("state_province") or "").lower()
    name = (site.get("site_name") or "").lower()
    
    if "offshore" in province or "offshore" in name or "marine" in province or "marine" in name:
        return "offshore_field"
    elif "refiner" in name:
        return "refinery"
    elif "terminal" in name or "port" in name:
        return "terminal"
    return "oil_field"


def get_status(site):
    """Get normalized status."""
    status = (site.get("status") or "active").lower()
    if status in ["active", "producing", "operational"]:
        return "active"
    elif status in ["closed", "shut-in", "decommissioned"]:
        return "inactive"
    elif status in ["development", "construction"]:
        return "development"
    return "active"


def find_coordinates(site_name, country_coords):
    """Find coordinates for a site using partial matching."""
    name_lower = site_name.lower()
    
    # Direct match first
    for key, coords in country_coords.items():
        if key.lower() in name_lower or name_lower in key.lower():
            return coords
    
    # Partial word match
    for key, coords in country_coords.items():
        key_words = key.lower().split()
        for word in key_words:
            if len(word) > 3 and word in name_lower:
                return coords
    
    return None


def get_company(operator, country_name, company_rules):
    """Get standardized company name."""
    if not operator:
        return "Unknown"
    
    rules = company_rules.get(country_name, {})
    for key, value in rules.items():
        if key.lower() in operator.lower():
            return value
    
    # Return first meaningful word as company
    operator_clean = re.sub(r'\([^)]*\)', '', operator).strip()
    if operator_clean:
        return operator_clean.split('/')[0].strip()[:100]
    return "Unknown"


def normalize_country_name(country):
    """Normalize country names to consistent format."""
    mapping = {
        "Democratic Republic of the Congo": "Congo (DRC)",
        "Republic of the Congo": "Congo (Republic)",
        "Côte d'Ivoire": "Côte d'Ivoire",
        "Cote d'Ivoire": "Côte d'Ivoire",
        "Ivory Coast": "Côte d'Ivoire",
    }
    return mapping.get(country, country)


# ============================================================================
# SQL GENERATION
# ============================================================================

def generate_sql_for_country(country_file, output_name, country_display_name, coords_map, company_rules):
    """Generate SQL file for a country."""
    
    # Read JSON data
    with open(country_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    sites = data.get("sites", [])
    
    # Deduplicate by site_name, preferring entries with coordinates
    seen = {}
    for site in sites:
        name = site.get("site_name", "")
        key = name.lower()
        
        if key not in seen:
            seen[key] = site
        else:
            # Prefer entry with coordinates
            if site.get("latitude") and not seen[key].get("latitude"):
                seen[key] = site
    
    unique_sites = list(seen.values())
    
    # Collect unique companies
    companies = set()
    
    # Build SQL
    sql_lines = []
    sql_lines.append(f"-- ============================================")
    sql_lines.append(f"-- {country_display_name.upper()} OIL & GAS FIELDS SETUP")
    sql_lines.append(f"-- Generated: {datetime.now().isoformat()}")
    sql_lines.append(f"-- Total sites: {len(unique_sites)}")
    sql_lines.append(f"-- ============================================")
    sql_lines.append("")
    
    # Schema modifications section
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
    sql_lines.append("  IF date_text IS NULL OR date_text = '' THEN")
    sql_lines.append("    RETURN NULL;")
    sql_lines.append("  END IF;")
    sql_lines.append("  IF date_text ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' THEN")
    sql_lines.append("    RETURN date_text::DATE;")
    sql_lines.append("  END IF;")
    sql_lines.append("  IF date_text ~ '^[0-9]{4}-[0-9]{2}$' THEN")
    sql_lines.append("    RETURN (date_text || '-01')::DATE;")
    sql_lines.append("  END IF;")
    sql_lines.append("  IF date_text ~ '^[0-9]{4}$' THEN")
    sql_lines.append("    RETURN (date_text || '-01-01')::DATE;")
    sql_lines.append("  END IF;")
    sql_lines.append("  IF date_text ~ '^[0-9]{4}s$' THEN")
    sql_lines.append("    RETURN (SUBSTRING(date_text FROM 1 FOR 4) || '-01-01')::DATE;")
    sql_lines.append("  END IF;")
    sql_lines.append("  RETURN NULL;")
    sql_lines.append("EXCEPTION")
    sql_lines.append("  WHEN OTHERS THEN")
    sql_lines.append("    RETURN NULL;")
    sql_lines.append("END;")
    sql_lines.append("$$ LANGUAGE plpgsql;")
    sql_lines.append("")
    
    # Collect all companies first
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
        sql_lines.append("ON CONFLICT (name) DO UPDATE SET")
        sql_lines.append("  commodities_traded = EXCLUDED.commodities_traded;")
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
        
        # Build INSERT - matching BRUNEI schema exactly
        sql_lines.append("INSERT INTO public.commodity_locations (")
        sql_lines.append("  title,")
        sql_lines.append("  owner,")
        sql_lines.append("  address,")
        sql_lines.append("  country,")
        sql_lines.append("  region,")
        sql_lines.append("  latitude,")
        sql_lines.append("  longitude,")
        sql_lines.append("  commodity_type,")
        sql_lines.append("  commodity_name,")
        sql_lines.append("  location_type,")
        sql_lines.append("  operational_status,")
        sql_lines.append("  operator,")
        sql_lines.append("  ownership_type,")
        sql_lines.append("  ownership_details,")
        sql_lines.append("  production_monthly,")
        sql_lines.append("  production_yearly,")
        sql_lines.append("  production_unit,")
        sql_lines.append("  estimated_reserves,")
        sql_lines.append("  reserves_unit,")
        sql_lines.append("  start_date,")
        sql_lines.append("  closing_date,")
        sql_lines.append("  quality_type,")
        sql_lines.append("  api_gravity,")
        sql_lines.append("  quality_sulfur_content,")
        sql_lines.append("  grade,")
        sql_lines.append("  last_transaction_value,")
        sql_lines.append("  last_transaction_currency,")
        sql_lines.append("  last_transaction_date,")
        sql_lines.append("  contract_duration_years,")
        sql_lines.append("  pipelines,")
        sql_lines.append("  ports,")
        sql_lines.append("  rail_connections,")
        sql_lines.append("  company,")
        sql_lines.append("  additional_info")
        sql_lines.append(") VALUES")
        sql_lines.append("(")
        
        # Title
        sql_lines.append(f"  '{escape_sql(site_name)}',")
        # Owner - use operator as owner
        sql_lines.append(f"  '{escape_sql(company)}',")
        # Address - use state_province
        address = escape_sql(state_province)[:255] if state_province else f"{country_display_name}"
        sql_lines.append(f"  '{address}',")
        # Country
        sql_lines.append(f"  '{escape_sql(country_display_name)}',")
        # Region - use state_province
        region = escape_sql(state_province)[:100] if state_province else None
        region_val = f"'{region}'" if region else 'NULL'
        sql_lines.append(f"  {region_val},")
        # Lat/Lng
        lat_val = lat if lat else 'NULL'
        lng_val = lng if lng else 'NULL'
        sql_lines.append(f"  {lat_val},")
        sql_lines.append(f"  {lng_val},")
        # Commodity type (Energy for all oil/gas)
        sql_lines.append(f"  'Energy',")
        # Commodity name
        sql_lines.append(f"  '{escape_sql(commodity)}',")
        # Location type
        sql_lines.append(f"  '{escape_sql(location_type)}',")
        # Operational status
        sql_lines.append(f"  '{escape_sql(status)}',")
        # Operator
        sql_lines.append(f"  '{escape_sql(company)}',")
        # Ownership type
        ownership_val = f"'{ownership_type}'" if ownership_type else 'NULL'
        sql_lines.append(f"  {ownership_val},")
        # Ownership details
        ownership_details = escape_sql(site.get("ownership_details", ""))[:1000] if site.get("ownership_details") else None
        ownership_details_val = f"'{ownership_details}'" if ownership_details else 'NULL'
        sql_lines.append(f"  {ownership_details_val},")
        # Production monthly
        monthly = site.get("production_monthly") or 0
        sql_lines.append(f"  {monthly},")
        # Production yearly
        yearly = site.get("production_yearly") or 0
        sql_lines.append(f"  {yearly},")
        # Production unit
        unit = escape_sql(site.get("production_unit", "barrels"))[:50]
        sql_lines.append(f"  '{unit}',")
        # Estimated reserves
        reserves = site.get("estimated_reserves") or 0
        sql_lines.append(f"  {reserves},")
        # Reserves unit
        reserves_unit = escape_sql(site.get("reserves_unit", "bbl"))[:50] if site.get("reserves_unit") else "bbl"
        sql_lines.append(f"  '{reserves_unit}',")
        # Start date
        start = parse_date(site.get("start_date"))
        start_val = f"parse_flexible_date('{start}')" if start else 'NULL'
        sql_lines.append(f"  {start_val},")
        # Closing date
        closing = parse_date(site.get("closing_date"))
        closing_val = f"parse_flexible_date('{closing}')" if closing else 'NULL'
        sql_lines.append(f"  {closing_val},")
        # Quality type
        quality_type = escape_sql(site.get("quality_type", ""))[:100] if site.get("quality_type") else None
        quality_val = f"'{quality_type}'" if quality_type else 'NULL'
        sql_lines.append(f"  {quality_val},")
        # API gravity
        api = site.get("quality_api_gravity")
        api_val = api if api else 'NULL'
        sql_lines.append(f"  {api_val},")
        # Sulfur content
        sulfur = site.get("quality_sulfur_content")
        sulfur_val = sulfur if sulfur else 'NULL'
        sql_lines.append(f"  {sulfur_val},")
        # Grade
        grade = escape_sql(site.get("grade", ""))[:50] if site.get("grade") else None
        grade_val = f"'{grade}'" if grade else 'NULL'
        sql_lines.append(f"  {grade_val},")
        # Last transaction value
        tx_value = site.get("last_transaction_value")
        tx_val = tx_value if tx_value else 'NULL'
        sql_lines.append(f"  {tx_val},")
        # Last transaction currency
        tx_currency = escape_sql(site.get("last_transaction_currency", "USD"))[:10]
        sql_lines.append(f"  '{tx_currency}',")
        # Last transaction date
        tx_date = parse_date(site.get("last_transaction_date"))
        tx_date_val = f"parse_flexible_date('{tx_date}')" if tx_date else 'NULL'
        sql_lines.append(f"  {tx_date_val},")
        # Contract duration
        duration = site.get("contract_duration_years")
        duration_val = duration if duration else 'NULL'
        sql_lines.append(f"  {duration_val},")
        # Arrays
        pipelines = site.get("pipelines", [])
        ports = site.get("ports", [])
        rails = site.get("rail_connections", [])
        sql_lines.append(f"  {format_array(pipelines)},")
        sql_lines.append(f"  {format_array(ports)},")
        sql_lines.append(f"  {format_array(rails)},")
        # Company
        sql_lines.append(f"  '{escape_sql(company)}',")
        # Additional info (NULL for now)
        sql_lines.append(f"  NULL")
        sql_lines.append(");")
        sql_lines.append("")
    
    # Write SQL file
    output_file = OUTPUT_PATH / f"{output_name}_OIL_FIELDS_SETUP.sql"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_lines))
    
    print(f"Generated {output_file} with {len(unique_sites)} sites")
    return companies


def main():
    """Generate SQL files for all 10 countries."""
    
    all_companies = set()
    all_ownership_types = set()
    
    countries = [
        ("Congo_DRC_all_sites.json", "CONGO_DRC", "Congo (DRC)", CONGO_DRC_COORDS),
        ("Congo_Republic_all_sites.json", "CONGO_REPUBLIC", "Congo (Republic)", CONGO_REPUBLIC_COORDS),
        ("Côte_d'Ivoire_all_sites.json", "COTE_DIVOIRE", "Côte d'Ivoire", COTE_DIVOIRE_COORDS),
        ("Egypt_all_sites.json", "EGYPT", "Egypt", EGYPT_COORDS),
        ("Equatorial_Guinea_all_sites.json", "EQUATORIAL_GUINEA", "Equatorial Guinea", EQ_GUINEA_COORDS),
        ("Gabon_all_sites.json", "GABON", "Gabon", GABON_COORDS),
        ("Ghana_all_sites.json", "GHANA", "Ghana", GHANA_COORDS),
        ("India_all_sites.json", "INDIA", "India", INDIA_COORDS),
        ("Libya_all_sites.json", "LIBYA", "Libya", LIBYA_COORDS),
        ("Mauritania_all_sites.json", "MAURITANIA", "Mauritania", MAURITANIA_COORDS),
    ]
    
    for json_file, output_name, display_name, coords_map in countries:
        json_path = COUNTRIES_DATA_PATH / json_file
        if json_path.exists():
            companies = generate_sql_for_country(
                json_path, output_name, display_name, coords_map, COMPANY_RULES
            )
            all_companies.update(companies)
            
            # Collect ownership types
            with open(json_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            for site in data.get("sites", []):
                ot = site.get("ownership_type")
                if ot:
                    all_ownership_types.add(ot[:100])
        else:
            print(f"Warning: {json_path} not found")
    
    print(f"\n=== Summary ===")
    print(f"Total unique companies: {len(all_companies)}")
    print(f"Total unique ownership types: {len(all_ownership_types)}")
    print(f"\nNew companies to add to EarthMap.tsx:")
    for c in sorted(all_companies):
        print(f"  '{c}',")


if __name__ == "__main__":
    main()
