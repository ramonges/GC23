#!/usr/bin/env python3
"""
Update Angola sites with coordinates from user's CSV data
"""
import json
import os

# Coordinates mapping from user's CSV data
COORDINATES_MAP = {
    "Cabinda Sul Field (Cabinda South Onshore Block)": (-5.55, 12.2),
    "Castanha Prospect/Well (Castanha-1) – Cabinda South Onshore Block": (-5.5, 12.15),
    "Coco Prospect/Well (Coco-1) – Cabinda South Onshore Block": (-5.52, 12.18),
    "Takula Field (Block 0)": (-5.271, 11.858),
    "Malongo Field (Block 0)": (-5.35, 11.9),
    "Mafumeira Field - Mafumeira Norte (Block 0)": (-5.43, 12.06),  # Already has coords
    "Mafumeira Field - Mafumeira Sul (Block 0)": (-5.43, 12.06),  # Same area
    "Sanha Field (Block 0)": (-5.558386, 11.712393),
    "Nsinga Field (Block 0, Area A)": (-5.408, 11.694),  # Nemba coordinates
    "South N'dola (N'dola Sul) Field/Project (Block 0)": (-5.5, 11.75),  # Numbi coordinates
    "Block 0 (CABGOC) - Malongo Field": (-5.35, 11.9),
    "Block 0 (CABGOC) - Takula Field": (-5.271, 11.858),
    "Block 0 (CABGOC) - Bomboco Field (Sanha Condensate Project)": (-5.558386, 11.712393),
    "Block 0 (CABGOC) - South N'dola (N'dola Sul) Project": (-5.5, 11.75),
    "Block 0 Concession (aggregate - CABGOC)": (-5.35, 11.9),  # Use Malongo as center
    "Kuito Field (Deepwater Block 14, offshore Cabinda region)": (-9.1, 12.4),
    "Benguela-Belize Development / BBLT (Deepwater Block 14, offshore Cabinda region)": (-9.15, 12.45),
    "Lobito-Tomboco Development (Deepwater Block 14, offshore Cabinda region)": (-9.2, 12.5),
    "Tombua-Landana Development (Deepwater Block 14, offshore Cabinda region)": (-9.3, 12.6),
    "Block 14 - Kuito Field": (-9.1, 12.4),
    "Block 14 - Benguela-Belize-Lobito-Tomboco (BBLT) Development": (-9.15, 12.45),
    "Block 14 - Tombua-Landana Development": (-9.3, 12.6),
    "Block 14 - Landana North Reservoir (Tombua-Landana area tieback)": (-9.25, 12.55),
    "Block 17 - Girassol Field (Girassol FPSO)": (-7.655412, 11.714284),
    "Block 17 - Dalia Field (Dalia FPSO)": (-7.681808, 11.754237),
    "Block 17 - Pazflor Development (Perpetua, Hortensia, Zinia, Acacia)": (-7.8, 11.9),
    "Block 17 - CLOV Development (Cravo, Lirio, Orquidea, Violeta)": (-7.72, 11.82),
    "Block 17/06 - BEGONIA Development (tie-back to PAZFLOR FPSO)": (-7.8, 11.9),
    "Block 15 - Xikomba Development (Early Production System)": (-7.5, 11.5),  # Estimated Block 15
    "Block 15 - Kizomba A Development (Hungo, Chocalho)": (-7.5, 11.5),
    "Block 15 - Kizomba B Development (Kissanje, Dikanza)": (-7.5, 11.5),
    "Block 15 - Kizomba C Development (Mondo; Saxi/Batuque)": (-7.5, 11.5),
    "Block 18 - Greater Plutonio Development (Plutonio blend: Plutonio, Galio, Paladio, Cromio, Cobalto)": (-7.943654, 12.145836),
    "Block 31 - PSVM Development (Plutão, Saturno, Vénus, Marte)": (-8.0, 12.2),  # Estimated Block 31
    "Block 32 - Kaombo Development (Gengibre, Gindungo, Caril, Canela, Mostarda, Louro)": (-8.2, 12.3),  # Estimated Block 32
    "Cameia Field (Kaminho Project)": (-9.5, 13.0),  # Estimated Kwanza Basin
    "Golfinho Field (Kaminho Project)": (-9.5, 13.0),
    "Mavinga Field": (-9.5, 13.0),
    "Bicuar Field": (-9.5, 13.0),
    "Lontra Field": (-9.5, 13.0),
    "Zalophus Field": (-9.5, 13.0),
    "Benguela-Belize (BBLT Development – Phase 1 hub)": (-9.15, 12.45),
    "Lobito Field (BBLT Development – Phase 2 tieback)": (-9.2, 12.5),
    "Tomboco Field (BBLT Development – Phase 2 tieback)": (-9.2, 12.5),
    "Belize Field (BBLT Development – Phase 1; first oil)": (-9.15, 12.45),
    "Benguela Field (BBLT Development – Phase 1)": (-9.15, 12.45),
    "Kuito Field (Block 14 Development Area)": (-9.1, 12.4),
    "Tômbua-Lândana Field (Block 14 Development Area)": (-9.3, 12.6),
    "Gabela Development Area (Block 14)": (-9.18, 12.48),
    "Negage Development Area (Block 14)": (-9.22, 12.52),
}

# Read JSON file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, '../../Countries data/Angola_all_sites.json')

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update coordinates
updated_count = 0
for site in data['sites']:
    site_name = site['site_name']
    
    # Try exact match first
    if site_name in COORDINATES_MAP:
        lat, lng = COORDINATES_MAP[site_name]
        site['latitude'] = lat
        site['longitude'] = lng
        updated_count += 1
        print(f"✅ Updated: {site_name[:60]}... -> ({lat}, {lng})")
    else:
        # Try partial matching for similar names
        for key, coords in COORDINATES_MAP.items():
            # Check if key parts match
            key_parts = [p.strip() for p in key.lower().split('(')[0].split('-')]
            name_parts = [p.strip() for p in site_name.lower().split('(')[0].split('-')]
            
            # Match if significant parts overlap
            if any(part in site_name.lower() and len(part) > 5 for part in key_parts):
                lat, lng = coords
                site['latitude'] = lat
                site['longitude'] = lng
                updated_count += 1
                print(f"✅ Matched: {site_name[:60]}... -> ({lat}, {lng})")
                break

# Save updated JSON
output_path = os.path.join(script_dir, '../Angola_all_sites_with_coordinates.json')
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
