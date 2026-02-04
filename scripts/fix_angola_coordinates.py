#!/usr/bin/env python3
"""
Fix Angola coordinates with user-provided corrected data
"""
import json
import os

# Corrected coordinates from user's CSV data
COORDINATES_MAP = {
    "Cabinda Sul Field (Cabinda South Onshore Block)": (-5.55, 12.2),
    "Castanha Prospect/Well (Castanha-1) – Cabinda South Onshore Block": (-5.5, 12.15),
    "Coco Prospect/Well (Coco-1) – Cabinda South Onshore Block": (-5.52, 12.18),
    "Takula Field (Block 0)": (-5.271, 11.858),
    "Malongo Field (Block 0)": (-5.35, 11.9),
    "Mafumeira Field - Mafumeira Norte (Block 0)": (-5.43, 12.06),
    "Mafumeira Field - Mafumeira Sul (Block 0)": (-5.43, 12.06),
    "Sanha Field (Block 0)": (-5.558386, 11.712393),
    "Nsinga Field (Block 0, Area A)": (-5.408, 11.694),
    "South N'dola (N'dola Sul) Field/Project (Block 0)": (-5.5, 11.75),
    "Block 0 (CABGOC) - Malongo Field": (-5.35, 11.9),
    "Block 0 (CABGOC) - Takula Field": (-5.271, 11.858),
    "Block 0 (CABGOC) - Bomboco Field (Sanha Condensate Project)": (-5.558386, 11.712393),
    "Block 0 (CABGOC) - South N'dola (N'dola Sul) Project": (-5.5, 11.75),
    "Block 0 Concession (aggregate - CABGOC)": (-5.35, 11.9),
    "Kuito Field (Deepwater Block 14, offshore Cabinda region)": (-8.3, 12.0),
    "Benguela-Belize Development / BBLT (Deepwater Block 14, offshore Cabinda region)": (-8.4, 12.1),
    "Lobito-Tomboco Development (Deepwater Block 14, offshore Cabinda region)": (-8.5, 12.2),
    "Tombua-Landana Development (Deepwater Block 14, offshore Cabinda region)": (-8.65, 12.35),
    "Block 14 - Kuito Field": (-8.3, 12.0),
    "Block 14 - Benguela-Belize-Lobito-Tomboco (BBLT) Development": (-8.4, 12.1),
    "Block 14 - Tombua-Landana Development": (-8.65, 12.35),
    "Block 14 - Landana North Reservoir (Tombua-Landana area tieback)": (-8.6, 12.3),
    "Block 17 - Girassol Field (Girassol FPSO)": (-7.655412, 11.714284),
    "Block 17 - Dalia Field (Dalia FPSO)": (-7.681808, 11.754237),
    "Block 17 - Pazflor Development (Perpetua, Hortensia, Zinia, Acacia)": (-7.8, 11.9),
    "Block 17 - CLOV Development (Cravo, Lirio, Orquidea, Violeta)": (-7.72, 11.82),
    "Block 17/06 - BEGONIA Development (tie-back to PAZFLOR FPSO)": (-7.8, 11.9),
    "Block 15 - Xikomba Development (Early Production System)": (-7.5, 11.5),
    "Block 15 - Kizomba A Development (Hungo, Chocalho)": (-7.5, 11.5),
    "Block 15 - Kizomba B Development (Kissanje, Dikanza)": (-7.5, 11.5),
    "Block 15 - Kizomba C Development (Mondo; Saxi/Batuque)": (-7.5, 11.5),
    "Block 18 - Greater Plutonio Development (Plutonio blend: Plutonio, Galio, Paladio, Cromio, Cobalto)": (-7.943654, 12.145836),
    "Block 31 - PSVM Development (Plutão, Saturno, Vénus, Marte)": (-8.0, 12.2),
    "Block 32 - Kaombo Development (Gengibre, Gindungo, Caril, Canela, Mostarda, Louro)": (-8.2, 12.3),
    "Cameia Field (Kaminho Project)": (-9.5, 13.0),
    "Golfinho Field (Kaminho Project)": (-9.5, 13.0),
    "Mavinga Field": (-9.5, 13.0),
    "Bicuar Field": (-9.5, 13.0),
    "Lontra Field": (-9.5, 13.0),
    "Zalophus Field": (-9.5, 13.0),
    "Benguela-Belize (BBLT Development – Phase 1 hub)": (-8.4, 12.1),
    "Lobito Field (BBLT Development – Phase 2 tieback)": (-8.5, 12.2),
    "Tomboco Field (BBLT Development – Phase 2 tieback)": (-8.5, 12.2),
    "Belize Field (BBLT Development – Phase 1; first oil)": (-8.4, 12.1),
    "Benguela Field (BBLT Development – Phase 1)": (-8.4, 12.1),
    "Kuito Field (Block 14 Development Area)": (-8.3, 12.0),
    "Tômbua-Lândana Field (Block 14 Development Area)": (-8.65, 12.35),
    "Gabela Development Area (Block 14)": (-8.45, 12.15),
    "Negage Development Area (Block 14)": (-8.55, 12.25),
}

# Partial match patterns for more flexible matching
PARTIAL_MATCHES = {
    "cabinda sul": (-5.55, 12.2),
    "castanha": (-5.5, 12.15),
    "coco": (-5.52, 12.18),
    "takula": (-5.271, 11.858),
    "malongo": (-5.35, 11.9),
    "mafumeira": (-5.43, 12.06),
    "sanha": (-5.558386, 11.712393),
    "bomboco": (-5.558386, 11.712393),
    "nsinga": (-5.408, 11.694),
    "nemba": (-5.408, 11.694),
    "numbi": (-5.5, 11.75),
    "n'dola": (-5.5, 11.75),
    "ndola": (-5.5, 11.75),
    "kuito": (-8.3, 12.0),
    "benguela-belize": (-8.4, 12.1),
    "benguela belize": (-8.4, 12.1),
    "bblt": (-8.4, 12.1),
    "lobito": (-8.5, 12.2),
    "tomboco": (-8.5, 12.2),
    "tombua": (-8.65, 12.35),
    "landana": (-8.6, 12.3),
    "girassol": (-7.655412, 11.714284),
    "rosa": (-7.526705, 11.574452),
    "jasmim": (-7.67, 11.72),
    "dalia": (-7.681808, 11.754237),
    "camelia": (-7.68, 11.76),
    "tulipa": (-7.7, 11.8),
    "orquidea": (-7.72, 11.82),
    "cravo": (-7.71, 11.83),
    "lirio": (-7.73, 11.81),
    "violeta": (-7.7, 11.84),
    "zinia": (-7.65, 11.7),
    "perpetua": (-7.62, 11.68),
    "clov": (-7.72, 11.82),
    "pazflor": (-7.8, 11.9),
    "acacia": (-7.81, 11.91),
    "hortensia": (-7.79, 11.89),
    "orchidea": (-7.82, 11.92),
    "azul": (-7.78, 11.88),
    "plutonio": (-7.943654, 12.145836),
    "galio": (-7.95, 12.13),
    "cromio": (-7.93, 12.16),
    "paladio": (-7.92, 12.14),
    "cobalto": (-7.96, 12.12),
    "platina": (-7.905094, 12.104069),
    "xikomba": (-7.5, 11.5),
    "kizomba": (-7.5, 11.5),
    "psvm": (-8.0, 12.2),
    "kaombo": (-8.2, 12.3),
    "cameia": (-9.5, 13.0),
    "golfinho": (-9.5, 13.0),
    "mavinga": (-9.5, 13.0),
    "bicuar": (-9.5, 13.0),
    "lontra": (-9.5, 13.0),
    "zalophus": (-9.5, 13.0),
    "begonia": (-7.8, 11.9),
    "gabela": (-8.45, 12.15),
    "negage": (-8.55, 12.25),
    "cabaca": (-8.5, 12.2),
    "belize": (-8.4, 12.1),
    "benguela": (-8.4, 12.1),
    "block 14": (-8.4, 12.1),
    "block 17": (-7.7, 11.8),
    "block 18": (-7.943654, 12.145836),
    "block 15": (-7.5, 11.5),
    "block 31": (-8.0, 12.2),
    "block 32": (-8.2, 12.3),
    "block 0": (-5.35, 11.9),
}

# Read JSON file
script_dir = os.path.dirname(os.path.abspath(__file__))
json_path = os.path.join(script_dir, '../Angola_all_sites_with_coordinates.json')

with open(json_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Update coordinates
updated_count = 0
for site in data['sites']:
    site_name = site['site_name']
    site_lower = site_name.lower()
    old_lat = site.get('latitude')
    old_lng = site.get('longitude')
    
    # Try exact match first
    if site_name in COORDINATES_MAP:
        lat, lng = COORDINATES_MAP[site_name]
        site['latitude'] = lat
        site['longitude'] = lng
        updated_count += 1
        print(f"✅ Exact: {site_name[:50]}... -> ({lat}, {lng})")
        continue
    
    # Try partial matching
    matched = False
    for pattern, coords in PARTIAL_MATCHES.items():
        if pattern in site_lower:
            lat, lng = coords
            site['latitude'] = lat
            site['longitude'] = lng
            updated_count += 1
            print(f"✅ Partial [{pattern}]: {site_name[:50]}... -> ({lat}, {lng})")
            matched = True
            break
    
    if not matched and old_lat and old_lng:
        print(f"⚠️  Keeping existing: {site_name[:50]}... -> ({old_lat}, {old_lng})")

# Save updated JSON
output_path = os.path.join(script_dir, '../Angola_all_sites_with_coordinates.json')
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

# Verify
sites_with_coords = [s for s in data['sites'] if s.get('latitude') is not None and s.get('longitude') is not None]
sites_without_coords = [s for s in data['sites'] if s.get('latitude') is None or s.get('longitude') is None]

print(f"\n✅ Updated {updated_count} sites with corrected coordinates")
print(f"📁 Saved to: {output_path}")
print(f"📊 Total with coordinates: {len(sites_with_coords)} / {len(data['sites'])}")
if sites_without_coords:
    print(f"\n⚠️  Sites WITHOUT coordinates ({len(sites_without_coords)}):")
    for s in sites_without_coords:
        print(f"  - {s['site_name']}")
