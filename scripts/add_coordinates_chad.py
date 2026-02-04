#!/usr/bin/env python3
"""Add coordinates to Chad oil field sites"""
import json
import os

# Chad oil fields are in two main basins:
# 1. Doba Basin (southern Chad, Logone Oriental) - ~8.5°N, 16.5°E
# 2. Bongor Basin (central Chad, Chari-Baguirmi) - ~10°N, 16°E

COORDINATES_MAP = {
    # Doba Basin fields (already have some coordinates)
    "Komé Oil Field (Doba Oil Project)": (8.5428, 16.7806),
    "Miandoum Oil Field (Doba Oil Project)": (8.4946, 16.5225),
    "Bolobo Oil Field (Doba Oil Project)": (8.4244, 16.0639),
    "Nya Oil Field (Doba Oil Project)": (8.5, 16.55),
    "Moundouli Oil Field (Doba Oil Project)": (8.45, 16.45),
    "Maikeri Oil Field (Doba Oil Project)": (8.48, 16.6),
    "Timbre Oil Field (Doba Oil Project)": (8.52, 16.65),
    "Mangara Oil Field (Doba Basin)": (8.6, 16.4),
    "Badila Oil Field (Doba Basin)": (8.58, 16.38),
    "Krim Oil Field (Doba Basin)": (8.55, 16.35),
    
    # Bongor Basin fields (Block H / CNPC operated)
    "Ronier Oilfield (Bongor Basin, Block H/Permit H)": (10.2, 15.8),
    "Ronier (Bongor Basin, Block H)": (10.2, 15.8),
    "Mimosa Oilfield (Bongor Basin, Block H/Permit H)": (10.18, 15.82),
    "Mimosa (Bongor Basin, Block H)": (10.18, 15.82),
    "Baobab Oilfield (Bongor Basin, Block H/Permit H)": (10.15, 15.85),
    "Baobab (Bongor Basin, Block H)": (10.15, 15.85),
    "Kubla Oil-bearing Structure / Field (Bongor Basin, Block H/Permit H)": (10.12, 15.88),
    "Cailcedra Oil-bearing Structure / Field (Bongor Basin, Block H/Permit H)": (10.1, 15.9),
    "Koudalwa Oil Field (Bongor Basin source for Djermaya refinery pipeline)": (10.25, 15.75),
    "Daniela (Bongor Basin, Block H)": (10.22, 15.78),
    "Raphia (Bongor Basin, Block H)": (10.17, 15.83),
    "Prosopis (Bongor Basin, Block H)": (10.14, 15.86),
}

PARTIAL_MATCHES = {
    "komé": (8.5428, 16.7806),
    "kome": (8.5428, 16.7806),
    "miandoum": (8.4946, 16.5225),
    "bolobo": (8.4244, 16.0639),
    "nya": (8.5, 16.55),
    "moundouli": (8.45, 16.45),
    "maikeri": (8.48, 16.6),
    "timbre": (8.52, 16.65),
    "mangara": (8.6, 16.4),
    "badila": (8.58, 16.38),
    "krim": (8.55, 16.35),
    "ronier": (10.2, 15.8),
    "mimosa": (10.18, 15.82),
    "baobab": (10.15, 15.85),
    "kubla": (10.12, 15.88),
    "cailcedra": (10.1, 15.9),
    "koudalwa": (10.25, 15.75),
    "daniela": (10.22, 15.78),
    "raphia": (10.17, 15.83),
    "prosopis": (10.14, 15.86),
    "bongor": (10.15, 15.85),
    "block h": (10.15, 15.85),
    "doba": (8.5, 16.5),
}

script_dir = os.path.dirname(os.path.abspath(__file__))
input_path = '/Users/b23/Desktop/GC23/Countries data/Chad_all_sites.json'
output_path = os.path.join(script_dir, '../Chad_all_sites_with_coordinates.json')

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

updated = 0
for site in data['sites']:
    name = site['site_name']
    name_lower = name.lower()
    
    if site.get('latitude') and site.get('longitude'):
        print(f"⏭️  Already has coords: {name[:50]}...")
        continue
    
    if name in COORDINATES_MAP:
        lat, lng = COORDINATES_MAP[name]
        site['latitude'] = lat
        site['longitude'] = lng
        updated += 1
        print(f"✅ Exact: {name[:50]}... -> ({lat}, {lng})")
        continue
    
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
        province = site.get('state_province', '').lower()
        if 'bongor' in province or 'chari' in province or 'mayo-kebbi' in province:
            site['latitude'] = 10.15
            site['longitude'] = 15.85
        else:
            site['latitude'] = 8.5
            site['longitude'] = 16.5
        updated += 1
        print(f"⚠️  Default: {name[:50]}... -> ({site['latitude']}, {site['longitude']})")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Updated {updated} Chad sites")
print(f"📁 Saved to: {output_path}")
