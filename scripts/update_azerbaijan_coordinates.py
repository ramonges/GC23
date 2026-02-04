#!/usr/bin/env python3
"""
Update Azerbaijan sites with coordinates from user's CSV data
"""
import json
import os

# Coordinates mapping from user's CSV data - match partial names
COORDINATES_MAP = {
    # Onshore fields
    "Balakhany": (40.439, 49.965),
    "Balakhani": (40.439, 49.965),
    "Bibi-Heybat": (40.342, 49.805),
    "Bibiheybat": (40.342, 49.805),
    "Surakhany": (40.422, 50.006),
    "Binagadi": (40.458, 49.827),
    "Girmaki": (40.46, 49.8),
    "Chakhnaglar": (40.47, 49.82),
    "Sulutepe": (40.45, 49.83),
    "Masazir": (40.48, 49.85),
    
    # Offshore fields
    "Neft Dashlari": (40.31, 50.16),
    "Oil Rocks": (40.31, 50.16),
    "Chirag": (40.21967, 51.09767),
    "Azeri": (40.21967, 51.09767),
    "Gunashli": (40.21967, 51.09767),
    "Guneshli": (40.21967, 51.09767),
    "ACG": (40.22, 51.1),  # Default ACG location
    "Central Azeri": (40.22, 51.1),
    "West Azeri": (40.23, 51.08),
    "East Azeri": (40.21, 51.12),
    "West Chirag": (40.24, 51.06),
    "ACE": (40.2, 51.15),
    "Azeri Central East": (40.2, 51.15),
    
    # Gas fields
    "Shah Deniz": (39.937, 50.377),
    "Umid": (40.0, 50.1),
    "Babek": (40.05, 50.05),
    "Bulla Deniz": (40.15, 50.3),
    "Bulla More": (40.12, 50.28),
    "Absheron": (40.009, 50.798),
    "Karabakh": (40.4, 50.4),
}

# Read JSON file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, '../../Countries data/Azerbaijan_all_sites.json')

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update coordinates
updated_count = 0
for site in data['sites']:
    site_name = site['site_name']
    site_lower = site_name.lower()
    
    # Skip if already has coordinates
    if site.get('latitude') is not None and site.get('longitude') is not None:
        continue
    
    # Try partial matching for similar names
    matched = False
    for key, coords in COORDINATES_MAP.items():
        key_lower = key.lower()
        
        # Check if key appears in site name
        if key_lower in site_lower:
            lat, lng = coords
            site['latitude'] = lat
            site['longitude'] = lng
            updated_count += 1
            print(f"✅ Matched: {site_name[:60]}... -> ({lat}, {lng}) [matched: {key}]")
            matched = True
            break
    
    # Special handling for ACG complex fields
    if not matched and 'ACG' in site_name or 'Azeri–Chirag–Gunashli' in site_name:
        if 'Central Azeri' in site_name:
            site['latitude'] = 40.22
            site['longitude'] = 51.1
        elif 'West Azeri' in site_name:
            site['latitude'] = 40.23
            site['longitude'] = 51.08
        elif 'East Azeri' in site_name:
            site['latitude'] = 40.21
            site['longitude'] = 51.12
        elif 'West Chirag' in site_name:
            site['latitude'] = 40.24
            site['longitude'] = 51.06
        elif 'ACE' in site_name or 'Azeri Central East' in site_name:
            site['latitude'] = 40.2
            site['longitude'] = 51.15
        elif 'Chirag' in site_name:
            site['latitude'] = 40.21967
            site['longitude'] = 51.09767
        elif 'Gunashli' in site_name or 'Guneshli' in site_name:
            site['latitude'] = 40.21967
            site['longitude'] = 51.09767
        else:
            # Default ACG location
            site['latitude'] = 40.22
            site['longitude'] = 51.1
        
        if not matched:
            updated_count += 1
            print(f"✅ ACG: {site_name[:60]}... -> ({site['latitude']}, {site['longitude']})")
    
    # Special handling for Shah Deniz platforms
    if not matched and 'Shah Deniz' in site_name:
        if 'Alpha' in site_name:
            site['latitude'] = 39.94
            site['longitude'] = 50.38
        elif 'Bravo' in site_name:
            site['latitude'] = 39.93
            site['longitude'] = 50.37
        else:
            site['latitude'] = 39.937
            site['longitude'] = 50.377
        
        if not matched:
            updated_count += 1
            print(f"✅ Shah Deniz: {site_name[:60]}... -> ({site['latitude']}, {site['longitude']})")

# Save updated JSON
output_path = os.path.join(script_dir, '../Azerbaijan_all_sites_with_coordinates.json')
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
    for s in sites_without_coords[:10]:  # Show first 10
        print(f"  - {s['site_name']}")
