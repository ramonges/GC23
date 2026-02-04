#!/usr/bin/env python3
"""Add coordinates to Cameroon oil field sites"""
import json
import os

# Cameroon oil fields are primarily in two basins:
# 1. Rio del Rey Basin (Southwest, offshore near Nigerian border) - ~4.5°N, 8.5°E
# 2. Douala Basin (Littoral, offshore near Douala/Kribi) - ~3.5°N, 9.5°E

COORDINATES_MAP = {
    # Rio del Rey Basin fields (Southwest Region, near Nigerian border)
    "Kita Eden field": (4.6, 8.4),
    "Kita Eden Field": (4.6, 8.4),
    "South Kole Marine field": (4.55, 8.45),
    "South Kole Marine Field": (4.55, 8.45),
    "Tiko Marine field": (4.5, 8.5),
    "Ekoundou Marine concession/field area": (4.48, 8.55),
    "Moudi (Marine) concession/fields": (4.45, 8.6),
    "Ebome Marine concession/fields": (4.0, 9.5),
    "Mokoko-Abana field complex (Mokoko-Abana concession)": (4.52, 8.48),
    "Mokoko–Abana Field": (4.52, 8.48),
    "Thali PSC (license area; prospective development at NJOM prospect)": (4.58, 8.52),
    "Thali PSC (Dissoni) – Njonji/Rumpi discoveries (undeveloped/awaiting drilling)": (4.58, 8.52),
    "Iroko exploration license area (license block; nearby Mokoko-Abana producing complex)": (4.5, 8.5),
    "Lungahe exploration block": (4.4, 8.6),
    "Dissoni Field (Rio del Rey Basin)": (4.55, 8.5),
    "Rio del Rey Basin (Perenco-operated PSC/Concession Area)": (4.5, 8.5),
    
    # Douala Basin fields (Littoral/South Region)
    "Ebome Marine": (3.8, 9.4),
    "Ebome Marine Concession": (3.8, 9.4),
    "Sanaga South Field": (3.2, 9.8),
    "Kolé Crude Blend (FSO Massongo lifting system; multiple fields blend in Cameroon operations area including Douala Basin streams)": (4.0, 8.8),
    "Lokele Area Oil Fields (exported as Lokele crude via FSO Massongo)": (4.0, 8.8),
    "Matanda Block / North Matanda (gas/condensate discovery; Douala Basin)": (4.1, 9.7),
    "Etinde Permit (Douala/Kribi-Campo Basin) - IM Field (development concept phase)": (3.5, 9.5),
    "Etinde Permit (formerly Block 7)": (3.5, 9.5),
    "Moudi Concession (Mudi)": (3.9, 9.5),
}

PARTIAL_MATCHES = {
    "kita eden": (4.6, 8.4),
    "south kole": (4.55, 8.45),
    "tiko": (4.5, 8.5),
    "ekoundou": (4.48, 8.55),
    "moudi": (4.45, 8.6),
    "ebome": (3.8, 9.4),
    "mokoko": (4.52, 8.48),
    "abana": (4.52, 8.48),
    "thali": (4.58, 8.52),
    "iroko": (4.5, 8.5),
    "lungahe": (4.4, 8.6),
    "dissoni": (4.55, 8.5),
    "rio del rey": (4.5, 8.5),
    "sanaga": (3.2, 9.8),
    "kolé": (4.0, 8.8),
    "kole": (4.0, 8.8),
    "lokele": (4.0, 8.8),
    "matanda": (4.1, 9.7),
    "etinde": (3.5, 9.5),
    "kribi": (3.0, 9.9),
    "douala": (4.0, 9.7),
}

script_dir = os.path.dirname(os.path.abspath(__file__))
input_path = '/Users/b23/Desktop/GC23/Countries data/Cameroon_all_sites.json'
output_path = os.path.join(script_dir, '../Cameroon_all_sites_with_coordinates.json')

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
        # Check province for basin
        province = site.get('state_province', '').lower()
        if 'rio del rey' in province or 'southwest' in province:
            site['latitude'] = 4.5
            site['longitude'] = 8.5
        else:
            site['latitude'] = 3.8
            site['longitude'] = 9.5
        updated += 1
        print(f"⚠️  Default: {name[:50]}... -> ({site['latitude']}, {site['longitude']})")

with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"\n✅ Updated {updated} Cameroon sites")
print(f"📁 Saved to: {output_path}")
