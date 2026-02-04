#!/usr/bin/env python3
"""Add coordinates to Benin oil field sites"""
import json
import os

# Benin coordinates - Sèmè Field is offshore Gulf of Guinea near Nigeria border
COORDINATES_MAP = {
    "Sèmè Field (Block 1)": (6.25, 2.75),  # Offshore near Sèmè-Kraké
    "Sèmè Field (historical production phase, developed by Saga Petroleum)": (6.25, 2.75),
}

script_dir = os.path.dirname(os.path.abspath(__file__))
input_path = '/Users/b23/Desktop/GC23/Countries data/Benin_all_sites.json'
output_path = os.path.join(script_dir, '../Benin_all_sites_with_coordinates.json')

with open(input_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

updated = 0
for site in data['sites']:
    name = site['site_name']
    if name in COORDINATES_MAP:
        lat, lng = COORDINATES_MAP[name]
        site['latitude'] = lat
        site['longitude'] = lng
        updated += 1
        print(f"✅ {name[:50]}... -> ({lat}, {lng})")
    elif 'sème' in name.lower() or 'seme' in name.lower():
        site['latitude'] = 6.25
        site['longitude'] = 2.75
        updated += 1
        print(f"✅ Partial match: {name[:50]}... -> (6.25, 2.75)")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Updated {updated}/{len(data['sites'])} Benin sites")
print(f"📁 Saved to: {output_path}")
