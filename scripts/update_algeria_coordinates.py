#!/usr/bin/env python3
"""
Update Algeria sites with missing coordinates
"""
import json
import os

# Coordinates mapping from user's CSV data
COORDINATES_MAP = {
    "Hassi Messaoud Oil Field": (31.608, 5.923),
    "Ourhoud Oil Field (ORD)": (31.744302, 6.042944),  # Keep existing
    "Hassi Berkine Complex (HB / HBNS area, Blocks 403/404)": (30.804, 8.03),
    "Rhourde El Baguel Oil Field (REB)": (31.499, 6.707),
    "Rhourde El Khrouf Oil Field (RKF)": (30.602, 8.438),
    "El Merk Field (Block 208 development cluster)": (30.5, 8.2),
    "Gassi Touil (oil and gas/condensate producing area)": (30.516667, 6.466667),  # Keep existing
    "Zemlet El Arbi Oil and Gas Field": (31.33, 8.2),  # Keep existing
    "Hassi R'Mel gas field (incl. oil rim/condensate system)": (32.944117, 3.260254),  # Keep existing
    "Oued Noumer Oil and Gas Field": (32.608, 3.703),  # Keep existing
    "Aït Kheir (Ait Kheir) field (Hassi R'Mel area)": (32.9, 3.3),
    "Sidi Merghich (Sidi Mezghich) field (Hassi R'Mel area)": (32.85, 3.4),
    "Matou Makouda field (Oued Noumer sector, Hassi R'Mel area)": (32.7, 3.65),
    "Sidi Mezghich field (Oued Noumer sector, Hassi R'Mel area)": (32.75, 3.6),
    "Djebel Bissa field (Hassi R'Mel area)": (32.95, 3.35),
    "Makouda field (Hassi R'Mel area)": (32.8, 3.5),
    "Hassi Berkine South (HBNS) Oil Field": (30.804, 8.03),
    "Hassi Berkine (HBN) Oil Field": (30.85, 7.95),
    "Hassi Berkine Complex (incl. Hassi Berkine/Hassi Berkine South/Satellites; Blocks 403/404/404a/208 perimeter)": (30.804, 8.03),
    "El Merk (El-Merk/EMK) Oil Field & Hub (Block 208 / Block 405a unitized portions)": (30.5, 8.2),
    "Menzel Ledjmet East (MLE) Wet Gas & Condensate Field (Block 405b)": (30.4, 8.5),
    "Rhourde El Krouf (RKF) Oil Field (Rhourde Yacoub Block 406a)": (30.602, 8.438),
    "Bir Seba Oil Field (Blocks 433a & 416b)": (30.3, 8.6),
    "Zemoul El Kbar Contractual Perimeter (Berkine Basin)": (30.7, 8.1),
    "Zarzaitine Oil Field": (28.08333, 9.75),  # Keep existing
    "Tin Fouye Tabankort (TFT) Field": (27.5, 9.3),
    "Ain Tsila Gas-Condensate Field": (27.6, 9.4),
    "Alrar Gas Field / Alrar Gas Complex (incl. Algerian portion of Wafa)": (27.3, 9.6),
    "Tinrhert Gas Field (Ohanet II / Illizi Province)": (27.8, 9.1),
    "Ohanet Conventional Gas Field (Ohanet II)": (27.85, 9.15),
    "In Amenas Gas Project (Tiguentourine facility and associated fields)": (27.926944, 9.114722),  # Keep existing
    "Sud-Est Illizi Block Gas Discovery Area (Tihalatine South)": (27.4, 9.5),
    "Reggane (Reggane Nord gas field area)": (27.213, 0.338),  # Keep existing
    "Kahlouche": (27.213, 0.338),  # Keep existing
    "Kahlouche Sud (South Kahlouche)": (27.15, 0.3),
    "Azrafil Sud-Est (Southeast Azrafil)": (27.1, 0.25),
    "Sali": (26.34, -1.1),  # Keep existing
    "Tiouliline": (27.201, -0.8178),  # Keep existing
}

# Read JSON file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, '../../Countries data/Algeria_all_sites.json')

with open(json_path, 'r') as f:
    data = json.load(f)

# Update coordinates
updated_count = 0
for site in data['sites']:
    site_name = site['site_name']
    if site_name in COORDINATES_MAP:
        lat, lng = COORDINATES_MAP[site_name]
        if site.get('latitude') != lat or site.get('longitude') != lng:
            site['latitude'] = lat
            site['longitude'] = lng
            updated_count += 1
            print(f"Updated: {site_name} -> ({lat}, {lng})")

# Save updated JSON to workspace
output_path = os.path.join(script_dir, '../Algeria_all_sites_with_coordinates.json')
with open(output_path, 'w') as f:
    json.dump(data, f, indent=2)

print(f"\n✅ Updated {updated_count} sites with coordinates")
print(f"📁 Saved to: {output_path}")

# Count sites with coordinates
sites_with_coords = [s for s in data['sites'] if s.get('latitude') is not None and s.get('longitude') is not None]
print(f"📊 Total sites with coordinates: {len(sites_with_coords)} / {len(data['sites'])}")
