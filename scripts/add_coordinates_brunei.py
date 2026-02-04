#!/usr/bin/env python3
"""Add coordinates to Brunei oil field sites"""
import json
import os

# Brunei offshore fields are in South China Sea, off coast of Brunei
# Main producing areas: Champion complex ~40km offshore, Ampa/Fairley area, Block B/C
COORDINATES_MAP = {
    # Onshore fields (have coordinates)
    "Seria Oil Field (Onshore)": (4.6103, 114.325),
    "Rasau Oil Field (Onshore)": (4.5606, 114.1596),
    
    # Offshore Champion complex (~40km NW of Seria)
    "Champion Field": (5.0, 114.0),
    "Champion Field (Champion Complex)": (5.0, 114.0),
    "Champion West Field": (4.98, 113.95),
    
    # South West Ampa area (~13km offshore Kuala Belait)
    "South West Ampa (SWA/Ampa) Field": (4.7, 113.9),
    
    # Fairley area (NW of Seria, offshore)
    "Fairley Field": (4.85, 113.95),
    "Fairley-Baram Field": (4.88, 114.0),
    
    # Egret Field (~45km NW of Seria)
    "Egret Field": (4.95, 113.85),
    
    # Magpie Field (NE of Seria offshore)
    "Magpie Field (Offshore)": (4.75, 114.5),
    
    # Selangkir-Iron Duke (BSP offshore area)
    "Selangkir-Iron Duke (SKID) Field": (4.8, 114.2),
    
    # Block B - Maharaja Lela/Jamalulalam
    "Maharaja Lela/Jamalulalam (MLJ) Field (Block B)": (5.2, 114.8),
    
    # Block C fields (deeper offshore)
    "Merpati Field (Block C)": (5.3, 115.0),
    "Meragi Field (Block C)": (5.32, 115.02),
    "Juragan Field (Block C)": (5.28, 114.98),
}

# Partial matches for offshore fields
PARTIAL_MATCHES = {
    "champion": (5.0, 114.0),
    "ampa": (4.7, 113.9),
    "fairley": (4.85, 113.95),
    "egret": (4.95, 113.85),
    "magpie": (4.75, 114.5),
    "selangkir": (4.8, 114.2),
    "iron duke": (4.8, 114.2),
    "skid": (4.8, 114.2),
    "maharaja": (5.2, 114.8),
    "jamalulalam": (5.2, 114.8),
    "mlj": (5.2, 114.8),
    "merpati": (5.3, 115.0),
    "meragi": (5.32, 115.02),
    "juragan": (5.28, 114.98),
    "seria": (4.6103, 114.325),
    "rasau": (4.5606, 114.1596),
    "block b": (5.2, 114.8),
    "block c": (5.3, 115.0),
}

script_dir = os.path.dirname(os.path.abspath(__file__))
input_path = '/Users/b23/Desktop/GC23/Countries data/Brunei_all_sites.json'
output_path = os.path.join(script_dir, '../Brunei_all_sites_with_coordinates.json')

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

updated = 0
for site in data['sites']:
    name = site['site_name']
    name_lower = name.lower()
    
    # Skip if already has coordinates
    if site.get('latitude') and site.get('longitude'):
        print(f"⏭️  Already has coords: {name[:50]}...")
        continue
    
    # Try exact match
    if name in COORDINATES_MAP:
        lat, lng = COORDINATES_MAP[name]
        site['latitude'] = lat
        site['longitude'] = lng
        updated += 1
        print(f"✅ Exact: {name[:50]}... -> ({lat}, {lng})")
        continue
    
    # Try partial match
    matched = False
    for pattern, coords in PARTIAL_MATCHES.items():
        if pattern in name_lower:
            lat, lng = coords
            site['latitude'] = lat
            site['longitude'] = lng
            updated += 1
            print(f"✅ Partial [{pattern}]: {name[:50]}... -> ({lat}, {lng})")
            matched = True
            break
    
    if not matched:
        # Default to offshore Brunei center
        site['latitude'] = 4.9
        site['longitude'] = 114.4
        updated += 1
        print(f"⚠️  Default: {name[:50]}... -> (4.9, 114.4)")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Updated {updated} Brunei sites")
print(f"📁 Saved to: {output_path}")
