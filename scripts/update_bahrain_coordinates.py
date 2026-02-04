#!/usr/bin/env python3
"""
Update Bahrain sites with coordinates from user's CSV data
"""
import json
import os

# Coordinates mapping from user's CSV data
COORDINATES_MAP = {
    "Abu Safah (Abu Saafa) Oil Field": (26.975, 50.5522),
    "Bahrain Field (Awali Field)": (26.0333, 50.532),
}

# Read JSON file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, '../../Countries data/Bahrain_all_sites.json')

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update coordinates
updated_count = 0
for site in data['sites']:
    site_name = site['site_name']
    site_lower = site_name.lower()
    
    # Update coordinates even if they exist (user provided more precise ones)
    
    matched = False
    old_lat = site.get('latitude')
    old_lng = site.get('longitude')
    
    # Try exact match first
    if site_name in COORDINATES_MAP:
        lat, lng = COORDINATES_MAP[site_name]
        site['latitude'] = lat
        site['longitude'] = lng
        updated_count += 1
        if old_lat and old_lng:
            print(f"✅ Updated: {site_name[:60]}... -> ({old_lat}, {old_lng}) -> ({lat}, {lng})")
        else:
            print(f"✅ Added: {site_name[:60]}... -> ({lat}, {lng})")
        matched = True
    else:
        # Try partial matching
        if 'abu safah' in site_lower or 'abu saafa' in site_lower or "abu sa'fah" in site_lower:
            lat, lng = COORDINATES_MAP["Abu Safah (Abu Saafa) Oil Field"]
            site['latitude'] = lat
            site['longitude'] = lng
            updated_count += 1
            if old_lat and old_lng:
                print(f"✅ Updated: {site_name[:60]}... -> ({old_lat}, {old_lng}) -> ({lat}, {lng})")
            else:
                print(f"✅ Added: {site_name[:60]}... -> ({lat}, {lng})")
            matched = True
        elif 'bahrain field' in site_lower or ('awali' in site_lower and 'field' in site_lower):
            lat, lng = COORDINATES_MAP["Bahrain Field (Awali Field)"]
            site['latitude'] = lat
            site['longitude'] = lng
            updated_count += 1
            if old_lat and old_lng:
                print(f"✅ Updated: {site_name[:60]}... -> ({old_lat}, {old_lng}) -> ({lat}, {lng})")
            else:
                print(f"✅ Added: {site_name[:60]}... -> ({lat}, {lng})")
            matched = True

# Save updated JSON
output_path = os.path.join(script_dir, '../Bahrain_all_sites_with_coordinates.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Verify
sites_with_coords = [s for s in data['sites'] if s.get('latitude') is not None and s.get('longitude') is not None]
sites_without_coords = [s for s in data['sites'] if s.get('latitude') is None or s.get('longitude') is None]

print(f"\n✅ Updated {updated_count} sites with coordinates")
print(f"📁 Saved to: {output_path}")
print(f"📊 Total with coordinates: {len(sites_with_coords)} / {len(data['sites'])}")
if sites_without_coords:
    print(f"\n⚠️  Sites still WITHOUT coordinates ({len(sites_without_coords)}):")
    for s in sites_without_coords:
        print(f"  - {s['site_name']}")
